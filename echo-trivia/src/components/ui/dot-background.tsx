"use client";

import { cn } from "@/lib/utils";
import { useTheme } from "next-themes";
import React from "react";

interface DotBackgroundProps {
  children?: React.ReactNode;
  className?: string;
  dotSize?: string;
}

const themeConfig = {
  light: {
    bg: "rgb(255 255 255)",
    dots: "rgb(212 212 212)",
  },
  dark: {
    bg: "rgb(0 0 0)",
    dots: "rgb(64 64 64)",
  },
  paperwhite: {
    bg: "rgb(245 240 230)",
    dots: "rgb(200 190 175)",
  },
  dullform: {
    bg: "rgb(90 95 105)",
    dots: "rgb(70 75 85)",
  },
};

export function DotBackground({
  children,
  className,
  dotSize = "20px",
}: DotBackgroundProps) {
  const { theme } = useTheme();
  const config = themeConfig[(theme as keyof typeof themeConfig)] || themeConfig.light;

  return (
    <div className={cn("relative w-full", className)}>
      {/* Dot pattern background */}
      <div
        className="absolute inset-0"
        style={{
          backgroundColor: config.bg,
          backgroundImage: `radial-gradient(${config.dots} 1px, transparent 1px)`,
          backgroundSize: `${dotSize} ${dotSize}`,
        }}
      />

      {/* Radial gradient overlay for faded effect - creates subtle vignette */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundColor: config.bg,
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
