"use client";
import { useState, useEffect, useRef } from "react";

export default function Home() {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [displayedText, setDisplayedText] = useState("");
  const [typing, setTyping] = useState(false);
  const indexRef = useRef(0); // Use a ref to persist the index value across renders

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    console.log("handle submit called with: ", question);

    const response = await fetch("http://localhost:8000/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query: question }),
    });

    const data = await response.json();
    setAnswer(data.text || ""); // Ensure we're setting a string even if data.text is undefined
    setDisplayedText(data.text[0]); // Ensure we're setting a string even if data.text is undefined
    setTyping(true);
  };

  useEffect(() => {
    if (typing) {
      if (indexRef.current < answer.length - 1) {
        const timer = setTimeout(() => {
          setDisplayedText((prevText) => prevText + answer[indexRef.current]);
          indexRef.current++; // Increment the index using the ref
        }, 10); // 10ms delay between characters for typing effect

        return () => clearTimeout(timer);
      } else {
        setTyping(false);
        indexRef.current = 0; // Reset the index when typing is done
      }
    }
  }, [displayedText, typing, answer]);

  return (
    <main>
      <div>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Ask your question here..."
          />
          <button type="submit">Ask</button>
        </form>
        {displayedText && (
          <p style={{ whiteSpace: "pre-line" }}>Answer: {displayedText}</p>
        )}
      </div>
    </main>
  );
}
