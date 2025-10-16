import { cn } from "@/lib/utils";
import React from "react";

interface DotBackgroundProps {
  children?: React.ReactNode;
  className?: string;
  dotSize?: string;
}

export function DotBackground({
  children,
  className,
  dotSize = "20px",
}: DotBackgroundProps) {
  return (
    <div className={cn("relative w-full", className)}>
      {/* Dot pattern background */}
      <div
        className="absolute inset-0 bg-white dark:bg-black"
        style={{
          backgroundImage: "radial-gradient(rgb(212 212 212) 1px, transparent 1px)",
          backgroundSize: `${dotSize} ${dotSize}`,
        }}
      />

      {/* Dark mode dot pattern */}
      <div
        className="absolute inset-0 bg-black opacity-0 dark:opacity-100"
        style={{
          backgroundImage: "radial-gradient(rgb(64 64 64) 1px, transparent 1px)",
          backgroundSize: `${dotSize} ${dotSize}`,
        }}
      />

      {/* Radial gradient overlay for faded effect - creates subtle vignette */}
      <div
        className="pointer-events-none absolute inset-0 bg-white dark:bg-black"
        style={{
          maskImage: "radial-gradient(ellipse at center, transparent 20%, black)",
          WebkitMaskImage: "radial-gradient(ellipse at center, transparent 20%, black)",
        }}
      />

      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}
