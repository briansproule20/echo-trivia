"use client";

import { motion } from "framer-motion";

interface CorrectAnswerFlurpProps {
  isVisible: boolean;
}

export function CorrectAnswerFlurp({ isVisible }: CorrectAnswerFlurpProps) {
  if (!isVisible) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center">
      {/* Outer expanding circle */}
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{
          scale: [0, 1.2, 1.5],
          opacity: [0, 0.6, 0],
        }}
        transition={{
          duration: 1.2,
          ease: [0.34, 1.56, 0.64, 1], // Custom easing for satisfying bounce
          times: [0, 0.6, 1],
        }}
        className="absolute h-96 w-96 rounded-full bg-green-500/30 blur-2xl"
      />

      {/* Middle expanding circle */}
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{
          scale: [0, 1, 1.3],
          opacity: [0, 0.8, 0],
        }}
        transition={{
          duration: 1,
          ease: [0.34, 1.56, 0.64, 1],
          times: [0, 0.5, 1],
          delay: 0.05,
        }}
        className="absolute h-80 w-80 rounded-full bg-green-400/40 blur-xl"
      />

      {/* Inner core circle */}
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{
          scale: [0, 0.8, 1],
          opacity: [0, 1, 0],
        }}
        transition={{
          duration: 0.8,
          ease: [0.34, 1.56, 0.64, 1],
          times: [0, 0.4, 1],
          delay: 0.1,
        }}
        className="absolute h-64 w-64 rounded-full bg-green-300/50 blur-lg"
      />

      {/* Checkmark icon */}
      <motion.div
        initial={{ scale: 0, rotate: -180, opacity: 0 }}
        animate={{
          scale: [0, 1.2, 1],
          rotate: [0, 10, 0],
          opacity: [0, 1, 1],
        }}
        transition={{
          duration: 0.6,
          ease: [0.34, 1.56, 0.64, 1],
          times: [0, 0.6, 1],
          delay: 0.15,
        }}
      >
        <svg
          className="h-24 w-24 text-green-500 dark:text-green-400"
          fill="none"
          strokeWidth="3"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <motion.path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M5 13l4 4L19 7"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{
              duration: 0.4,
              ease: "easeOut",
              delay: 0.2,
            }}
          />
        </svg>
      </motion.div>

      {/* Particle effects - staggered for depth */}
      {Array.from({ length: 12 }).map((_, i) => {
        const angle = (i * 360) / 12;
        const distance = 120 + (i % 3) * 40;

        return (
          <motion.div
            key={i}
            initial={{ scale: 0, opacity: 0, x: 0, y: 0 }}
            animate={{
              scale: [0, 1, 0],
              opacity: [0, 1, 0],
              x: [
                0,
                Math.cos((angle * Math.PI) / 180) * distance,
                Math.cos((angle * Math.PI) / 180) * (distance * 1.5),
              ],
              y: [
                0,
                Math.sin((angle * Math.PI) / 180) * distance,
                Math.sin((angle * Math.PI) / 180) * (distance * 1.5),
              ],
            }}
            transition={{
              duration: 0.8,
              ease: "easeOut",
              delay: 0.2 + (i * 0.02),
              times: [0, 0.5, 1],
            }}
            className="absolute h-3 w-3 rounded-full bg-green-400 dark:bg-green-500"
          />
        );
      })}
    </div>
  );
}
