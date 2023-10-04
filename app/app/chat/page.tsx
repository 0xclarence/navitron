"use client";
import {
  Box,
  Text,
  HStack,
  Input,
  VStack,
  Spinner,
  Image,
  ScaleFade,
  useDisclosure,
} from "@chakra-ui/react";
import { useState, useEffect, useRef } from "react";
import styles from "../page.module.css";
import { Search2Icon } from "@chakra-ui/icons";
import { Wrap, WrapItem } from "@chakra-ui/react";
import { useRouter } from "next/navigation";

const suggestions = [
  "What is the TRON Virtual Machine (TVM)?",
  "How does DPoS consensus work?",
  "What is TRC-20, and how is it different from TRC-10 tokens on the TRON network?",
  "How can I utilize TronGrid API for dApp development?",
  "What is a Super Representatives?",
];

export default function Home() {
  const { isOpen, onToggle } = useDisclosure();
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [displayedText, setDisplayedText] = useState("");
  const [typing, setTyping] = useState(false);
  const indexRef = useRef(0); // persist the index across renders
  const [isLoading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    onToggle();
  }, []);

  const submitQuestion = async (q: string) => {
    console.log("handle submit called with: ", q);

    setAnswer("Generating your response. Please give us a moment...");
    setDisplayedText("G");
    setTyping(true);

    setTimeout(() => setLoading(true), 800);

    const response = await fetch("http://localhost:8000/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query: q }),
    });

    const data = await response.json();

    setAnswer(data.text || "");
    setDisplayedText(data.text[0]);
    setTyping(true);
    setLoading(false);
  };

  const handleSubmitSuggestion = (s: string) => {
    setQuestion(s);
    submitQuestion(s);
  };

  const handleSubmit = (e: any) => {
    e.preventDefault?.();
    submitQuestion(question);
  };

  useEffect(() => {
    if (typing) {
      if (indexRef.current < answer.length - 1) {
        const timer = setTimeout(() => {
          setDisplayedText((prevText) => prevText + answer[indexRef.current]);
          indexRef.current++;
        }, 10);

        return () => clearTimeout(timer);
      } else {
        setTyping(false);
        indexRef.current = 0; // Reset the index when typing is done
      }
    }
  }, [displayedText, typing, answer]);

  return (
    <VStack className={styles.main}>
      <HStack className={styles.topbar}>
        <Image
          src="/logo.png"
          alt="logo"
          className={styles.logo}
          onClick={() => {
            router.push("/");
          }}
        />
      </HStack>
      <Box className={styles.hero} />
      <ScaleFade initialScale={0.8} in={isOpen}>
        <VStack className={styles.container} gap={0}>
          <form onSubmit={handleSubmit} className={styles.form}>
            <HStack className={styles.queryContainer}>
              <Search2Icon className={styles.icon} />
              <Input
                type="text"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                onClick={() => setQuestion("")} // Empty the question state when the input is clicked
                placeholder="Ask your question here..."
                className={styles.input}
              />
            </HStack>
          </form>
          <VStack width="100%" gap={0} alignItems="flex-start">
            <Box className={styles.divider} />
            {displayedText ? (
              <HStack width="100%" gap={0} justifyContent="flex-start">
                <Text whiteSpace="pre-line" className={styles.answer}>
                  {displayedText}
                </Text>
                {isLoading && <Spinner className={styles.spinner} />}
              </HStack>
            ) : (
              <VStack
                width="100%"
                gap={15}
                alignItems="flex-start"
                padding="1.5rem"
              >
                <Text className={styles.label}>Suggestions</Text>
                <Wrap width="100%" gap={0} justifyContent="flex-start">
                  {suggestions.map((s, idx) => (
                    <WrapItem
                      key={idx}
                      whiteSpace="pre-line"
                      className={styles.suggestion}
                      onClick={() => handleSubmitSuggestion(s)}
                    >
                      {s}
                    </WrapItem>
                  ))}
                </Wrap>
              </VStack>
            )}
          </VStack>
        </VStack>
      </ScaleFade>
    </VStack>
  );
}

const dummyText =
  "One can validate on TRON by becoming a validator. To become a validator, one needs to stake their BTT tokens with staking management contracts residing on the TRON mainnet. Validators on the network are selected through an on-chain auction process which happens at regular intervals. These selected validators participate as block producers and verifiers. Once a checkpoint is validated by the participants, updates are made on the parent chain (the TRON mainnet) which releases the rewards for validators depending on their stake in network. The role of validators is to run a full node, produce blocks, validate and participate in consensus, and commit checkpoints on the TRON/BSC/Ethereum mainnet.";
