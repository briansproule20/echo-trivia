"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";

interface FlipTextProps {
  words: string[];
  duration?: number;
  className?: string;
}

export function FlipText({ words, duration = 2000, className = "" }: FlipTextProps) {
  const [currentIndex, setCurrentIndex] = useState(() => Math.floor(Math.random() * words.length));

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => {
        let nextIndex;
        do {
          nextIndex = Math.floor(Math.random() * words.length);
        } while (nextIndex === prev && words.length > 1);
        return nextIndex;
      });
    }, duration);

    return () => clearInterval(interval);
  }, [words.length, duration]);

  return (
    <AnimatePresence mode="wait">
      <motion.span
        key={currentIndex}
        initial={{ rotateX: 90, opacity: 0 }}
        animate={{ rotateX: 0, opacity: 1 }}
        exit={{ rotateX: -90, opacity: 0 }}
        transition={{
          duration: 0.4,
          ease: "easeInOut",
        }}
        className={`inline-block ${className}`}
        style={{ transformStyle: "preserve-3d" }}
      >
        {words[currentIndex]}
      </motion.span>
    </AnimatePresence>
  );
}
