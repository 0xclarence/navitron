"use client";
import { Box, Text, HStack, Input, VStack, Spinner } from "@chakra-ui/react";
import { useState, useEffect, useRef } from "react";
import styles from "./page.module.css";
import { Search2Icon } from "@chakra-ui/icons";

export default function Home() {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [displayedText, setDisplayedText] = useState("");
  const [typing, setTyping] = useState(false);
  const indexRef = useRef(0); // persist the index across renders
  const [isLoading, setLoading] = useState(false);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    console.log("handle submit called with: ", question);

    setAnswer("Generating your response. Please give us a moment...");
    setDisplayedText("G");
    setTyping(true);

    setTimeout(() => setLoading(true), 800);

    const response = await fetch("http://localhost:8000/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query: question }),
    });

    const data = await response.json();

    setAnswer(data.text || "");
    setDisplayedText(data.text[0]);
    setTyping(true);
    setLoading(false);
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
      <Box className={styles.hero} />
      <VStack className={styles.container} gap={0}>
        <form onSubmit={handleSubmit} className={styles.form}>
          <HStack className={styles.queryContainer}>
            <Search2Icon className={styles.icon} />
            <Input
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Ask your question here..."
              className={styles.input}
            />
          </HStack>
        </form>
        {displayedText && (
          <VStack width="100%" gap={0} alignItems="flex-start">
            <Box className={styles.divider} />
            <HStack width="100%" gap={0} justifyContent="flex-start">
              <Text whiteSpace="pre-line" className={styles.answer}>
                {displayedText}
                {isLoading && <Spinner className={styles.spinner} />}
              </Text>
            </HStack>
          </VStack>
        )}
      </VStack>
    </VStack>
  );
}

const dummyText =
  "One can validate on TRON by becoming a validator. To become a validator, one needs to stake their BTT tokens with staking management contracts residing on the TRON mainnet. Validators on the network are selected through an on-chain auction process which happens at regular intervals. These selected validators participate as block producers and verifiers. Once a checkpoint is validated by the participants, updates are made on the parent chain (the TRON mainnet) which releases the rewards for validators depending on their stake in network. The role of validators is to run a full node, produce blocks, validate and participate in consensus, and commit checkpoints on the TRON/BSC/Ethereum mainnet.";
