"use client";
import {
  Box,
  Text,
  HStack,
  VStack,
  Image,
  Button,
  ScaleFade,
  useDisclosure,
} from "@chakra-ui/react";
import { useEffect } from "react";
import styles from "./page.module.css";
import { useRouter } from "next/navigation";

export default function Home() {
  const { isOpen, onToggle } = useDisclosure();
  const router = useRouter();

  useEffect(() => {
    onToggle();
  }, []);

  return (
    <VStack className={styles.landing}>
      <HStack className={styles.topbarLanding}>
        <Image src="/logo.png" alt="logo" className={styles.logo} />
        <Button
          className={styles.button}
          onClick={() => {
            router.push("/chat");
          }}
        >
          Launch Chat
        </Button>
      </HStack>
      <Box className={styles.hero} />
      <ScaleFade initialScale={0.8} in={isOpen}>
        <HStack gap={40} pb="4rem">
          <VStack alignItems="flex-start" gap={20}>
            <Text className={styles.title}>
              AI-powered chat for the TRON ecosystem
            </Text>
            <Text className={styles.subtitle}>
              Navitron is the simplest way to explore and interact with the
              latest project docs in the TRON ecosystem.
            </Text>
            <Button
              className={styles.button2}
              onClick={() => {
                router.push("/chat");
              }}
            >
              Launch Chat
            </Button>
          </VStack>
          <Image
            src="/sample.png"
            alt="sample query"
            className={styles.sample}
          />
        </HStack>
        <VStack>
          <Text className={styles.sectionHeader}>
            One-stop shop for the TRON ecosystem:
          </Text>
          <HStack>
            <VStack className={styles.feature}>
              <Text className={styles.header}>Seamless UI</Text>
              <Text className={styles.content}>
                NaviTron offers a custom-designed chat interface that allows
                users to interact seamlessly with the tailored AI model.
              </Text>
            </VStack>
            <Box className={styles.divider2} />
            <VStack className={styles.feature}>
              <Text className={styles.header}>Latest Knowledge</Text>
              <Text className={styles.content}>
                NaviTron is powered by a Langchain model with extensive
                knowledge about the latest in the TRON ecosystem.
              </Text>
            </VStack>
            <Box className={styles.divider2} />
            <VStack className={styles.feature}>
              <Text className={styles.header}>HackaTRON Insights</Text>
              <Text className={styles.content}>
                NaviTron provides insights into various winning projects from
                previously hosted HackaTRON seasons.
              </Text>
            </VStack>
          </HStack>
        </VStack>
      </ScaleFade>
    </VStack>
  );
}
