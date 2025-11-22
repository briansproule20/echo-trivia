"use client";

import { useEffect, useState } from "react";

interface EncryptedTextProps {
  text: string;
  className?: string;
  revealDelayMs?: number;
  charset?: string;
  flipDelayMs?: number;
}

export function EncryptedText({
  text,
  className = "",
  revealDelayMs = 50,
  charset = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=[]{}|;:,.<>?",
  flipDelayMs = 30,
}: EncryptedTextProps) {
  const [displayText, setDisplayText] = useState(text.split("").map(() => " "));
  const [revealedIndices, setRevealedIndices] = useState<Set<number>>(new Set());

  useEffect(() => {
    // Start revealing characters one by one
    const revealInterval = setInterval(() => {
      setRevealedIndices((prev) => {
        if (prev.size >= text.length) {
          clearInterval(revealInterval);
          return prev;
        }
        const newSet = new Set(prev);
        newSet.add(prev.size);
        return newSet;
      });
    }, revealDelayMs);

    return () => clearInterval(revealInterval);
  }, [text, revealDelayMs]);

  useEffect(() => {
    // Scramble unrevealed characters
    const scrambleInterval = setInterval(() => {
      setDisplayText((prev) =>
        prev.map((char, i) => {
          if (revealedIndices.has(i)) {
            return text[i];
          }
          return charset[Math.floor(Math.random() * charset.length)];
        })
      );
    }, flipDelayMs);

    return () => clearInterval(scrambleInterval);
  }, [text, charset, flipDelayMs, revealedIndices]);

  return (
    <span className={className}>
      {displayText.map((char, i) => (
        <span
          key={i}
          className={revealedIndices.has(i) ? "opacity-100" : "opacity-50"}
        >
          {char}
        </span>
      ))}
    </span>
  );
}
