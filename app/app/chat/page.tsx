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
                onClick={() => setQuestion("")}
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
