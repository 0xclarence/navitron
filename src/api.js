import * as dotenv from "dotenv";
import cors from "cors";
import helmet from "helmet";
import express from "express";
import { OpenAI } from "langchain/llms/openai";
import { DirectoryLoader } from "langchain/document_loaders/fs/directory";
import {
  JSONLoader,
  JSONLinesLoader,
} from "langchain/document_loaders/fs/json";
import { TextLoader } from "langchain/document_loaders/fs/text";
import { CSVLoader } from "langchain/document_loaders/fs/csv";
import { PDFLoader } from "langchain/document_loaders/fs/pdf";
import { RetrievalQAChain } from "langchain/chains";
import { HNSWLib } from "langchain/vectorstores/hnswlib";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import * as fs from "fs";

dotenv.config();

if (!process.env.PORT || !process.env.API_KEY) {
  process.exit(1);
}

const app = express();
const port = process.env.PORT ?? 8888;

app.use(helmet());
app.use(cors());
app.use(express.json());

const loader = new DirectoryLoader(
  "data",
  {
    ".json": (path) => new JSONLoader(path, "/texts"),
    ".jsonl": (path) => new JSONLinesLoader(path, "/html"),
    ".txt": (path) => new TextLoader(path),
    ".csv": (path) => new CSVLoader(path, "text"),
    ".pdf": (path) =>
      new PDFLoader(path, {
        splitPages: false,
      }),
  },
  true
);

const VECTOR_STORE_PATH = "vector";

function normalizeDocuments(docs) {
  return docs.map((doc) => {
    if (typeof doc.pageContent === "string") {
      return doc.pageContent;
    } else if (Array.isArray(doc.pageContent)) {
      return doc.pageContent.join("\n");
    }
  });
}

async function getAnswer(question) {
  console.log("Loading docs...");
  const docs = await loader.load();
  console.log("Docs loaded. ");

  const model = new OpenAI({
    modelName: "gpt-4",
    openAIApiKey: process.env.API_KEY,
    temperature: 0.9,
  });

  let vectorStore;

  console.log("Checking for existing vector store...");

  if (fs.existsSync(VECTOR_STORE_PATH)) {
    console.log("Loading existing vector store...");
    vectorStore = await HNSWLib.load(
      VECTOR_STORE_PATH,
      new OpenAIEmbeddings({
        modelName: "text-embedding-ada-002",
        openAIApiKey: process.env.API_KEY,
        stripNewLines: true,
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

    vectorStore = await HNSWLib.fromDocuments(
      splitDocs,
      new OpenAIEmbeddings({
        modelName: "text-embedding-ada-002",
        openAIApiKey: process.env.API_KEY,
        stripNewLines: true,
      })
    );

    await vectorStore.save(VECTOR_STORE_PATH);

    console.log("Vector store created.");
  }

  console.log("Creating retrieval chain...");
  const chain = RetrievalQAChain.fromLLM(model, vectorStore.asRetriever());

  console.log("Querying chain...");
  const res = await chain.call({ query: question });
  return res;
}

app.post("/chat", async (req, res) => {
  try {
    const question = req.body.query;
    if (!question) {
      return res.status(400).send({ error: "Query field is required" });
    }

    const answer = await getAnswer(question);
    res.send(answer);
  } catch (error) {
    res.status(500).send({ error: "Internal Server Error" });
  }
});

app.listen(port, () => {
  console.log(`⚡️[server]: Server is running at https://localhost:${port}`);
});
