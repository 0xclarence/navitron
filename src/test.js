import * as dotenv from "dotenv";
import { OpenAI } from "langchain/llms/openai";
import { DirectoryLoader } from "langchain/document_loaders/fs/directory";
import {
  JSONLoader,
  JSONLinesLoader,
} from "langchain/document_loaders/fs/json";
import { TextLoader } from "langchain/document_loaders/fs/text";
import { CSVLoader } from "langchain/document_loaders/fs/csv";
import { PDFLoader } from "langchain/document_loaders/fs/pdf";

import {
  ConversationalRetrievalQAChain,
  RetrievalQAChain,
} from "langchain/chains";
import { HNSWLib } from "langchain/vectorstores/hnswlib";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";

import { Tiktoken } from "@dqbd/tiktoken/lite";
import { load } from "@dqbd/tiktoken/load";
import registry from "@dqbd/tiktoken/registry.json" assert { type: "json" };
import models from "@dqbd/tiktoken/model_to_encoding.json" assert { type: "json" };

import * as fs from "fs";

dotenv.config();

console.log("process.env.API_KEY: ", process.env.API_KEY);

const llm = new OpenAI({
  openAIApiKey: process.env.API_KEY,
});

const loader = new DirectoryLoader("data", {
  ".json": (path) => new JSONLoader(path, "/texts"),
  ".jsonl": (path) => new JSONLinesLoader(path, "/html"),
  ".txt": (path) => new TextLoader(path),
  ".csv": (path) => new CSVLoader(path, "text"),
  ".pdf": (path) =>
    new PDFLoader(path, {
      splitPages: false,
    }),
});

async function calculateCost(docs) {
  const modelName = "text-embedding-ada-002";
  const modelKey = models[modelName];
  const model = await load(registry[modelKey]);
  const encoder = new Tiktoken(
    model.bpe_ranks,
    model.special_tokens,
    model.pat_str
  );
  const tokens = encoder.encode(JSON.stringify(docs));
  const tokenCount = tokens.length;
  const ratePerThousandTokens = 0.0004;
  const cost = (tokenCount / 1000) * ratePerThousandTokens;
  encoder.free();
  return cost;
}

const VECTOR_STORE_PATH = "vector";
const question =
  "As an end user, what are the core features available on Sunswap?";
// const question = "Who is George Wasthington?";

function normalizeDocuments(docs) {
  return docs.map((doc) => {
    if (typeof doc.pageContent === "string") {
      return doc.pageContent;
    } else if (Array.isArray(doc.pageContent)) {
      return doc.pageContent.join("\n");
    }
  });
}

export const run = async () => {
  console.log("Loading docs...");
  const docs = await loader.load();
  console.log("Docs loaded. ");

  console.log("Calculating cost...");
  const cost = await calculateCost(docs);
  console.log("Cost calculated: ", cost);

  const model = new OpenAI({
    openAIApiKey: process.env.API_KEY,
  });

  let vectorStore;

  console.log("Checking for existing vector store...");

  if (fs.existsSync(VECTOR_STORE_PATH)) {
    console.log("Loading existing vector store...");
    vectorStore = await HNSWLib.load(
      VECTOR_STORE_PATH,
      new OpenAIEmbeddings({
        openAIApiKey: process.env.API_KEY,
      })
    );
    console.log("Vector store loaded.");
  } else {
    console.log("Creating new vector store...");
    const textSplitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
    });
    const normalizedDocs = normalizeDocuments(docs);
    const splitDocs = await textSplitter.createDocuments(normalizedDocs);

    console.log("process.env.API_KEY: ", process.env.API_KEY);
    vectorStore = await HNSWLib.fromDocuments(
      splitDocs,
      new OpenAIEmbeddings({
        openAIApiKey: process.env.API_KEY,
      })
    );

    await vectorStore.save(VECTOR_STORE_PATH);

    console.log("Vector store created.");
  }

  console.log("Creating retrieval chain...");
  // try out ConversationalRetrievalChain
  const chain = RetrievalQAChain.fromLLM(model, vectorStore.asRetriever());

  console.log("Querying chain...");
  const res = await chain.call({ query: question });
  console.log({ res });
};

run();
