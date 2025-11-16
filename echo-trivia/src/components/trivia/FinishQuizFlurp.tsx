"use client";

import { motion, AnimatePresence, type Variants } from "framer-motion";

interface FinishQuizFlurpProps {
  isVisible: boolean;
  onAnimationComplete?: () => void;
}

const flurpVariants: Variants = {
  hidden: {
    scale: 0,
    opacity: 0.8,
  },
  visible: {
    scale: 50,
    opacity: 0,
    transition: {
      scale: {
        type: "tween",
        duration: 3.5,
        ease: [0.43, 0.13, 0.23, 0.96], // Smooth easeInOutQuart
      },
      opacity: {
        duration: 3.5,
        ease: "easeInOut",
      },
    },
  },
};

export function FinishQuizFlurp({ isVisible, onAnimationComplete }: FinishQuizFlurpProps) {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="pointer-events-none fixed inset-0 z-[100] flex items-center justify-center overflow-hidden"
          initial={{ opacity: 1 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Single smooth expanding wave */}
          <motion.div
            variants={flurpVariants}
            initial="hidden"
            animate="visible"
            onAnimationComplete={onAnimationComplete}
            className="absolute h-[200vmax] w-[200vmax] rounded-full bg-primary"
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
