"use client";

import { useEffect } from "react";

interface FinishQuizFlurpProps {
  isVisible: boolean;
  fadeOnly?: boolean; // Start already expanded, just fade out
  onExpanded?: () => void; // Called when circle fully covers screen
  onAnimationComplete?: () => void; // Called when fade finishes
}

export function FinishQuizFlurp({ isVisible, fadeOnly = false, onExpanded, onAnimationComplete }: FinishQuizFlurpProps) {
  useEffect(() => {
    if (!isVisible) return;

    if (fadeOnly) {
      // Fade out over 500ms to give page time to render
      const doneTimer = setTimeout(() => {
        onAnimationComplete?.();
      }, 500);
      return () => clearTimeout(doneTimer);
    }

    // Navigate early (50% = 1100ms) to give results page time to load
    const expandedTimer = setTimeout(() => {
      onExpanded?.();
    }, 1100);

    const doneTimer = setTimeout(() => {
      onAnimationComplete?.();
    }, 2200);

    return () => {
      clearTimeout(expandedTimer);
      clearTimeout(doneTimer);
    };
  }, [isVisible, fadeOnly, onExpanded, onAnimationComplete]);

  if (!isVisible) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-[100] flex items-center justify-center overflow-hidden">
      <div
        className="absolute rounded-full bg-primary"
        style={{
          width: "50px",
          height: "50px",
          animation: fadeOnly ? "fade-only 0.5s ease-out forwards" : "expand-and-fade 2.2s ease-out forwards",
        }}
      />
      <style jsx>{`
        @keyframes expand-and-fade {
          0% {
            transform: scale(0);
            opacity: 1;
          }
          85% {
            transform: scale(45);
            opacity: 1;
          }
          100% {
            transform: scale(45);
            opacity: 0;
          }
        }
        @keyframes fade-only {
          0% {
            transform: scale(45);
            opacity: 1;
          }
          100% {
            transform: scale(45);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}
