"use client";

import { cn } from "@/lib/utils";
import { useTheme } from "next-themes";
import React, { useEffect, useState } from "react";

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
  reaper: {
    bg: "rgb(25 25 25)",
    dots: "rgb(60 45 45)",
  },
  rivendell: {
    bg: "rgb(235 230 215)",
    dots: "rgb(180 190 160)",
  },
};

export function DotBackground({
  children,
  className,
  dotSize = "20px",
}: DotBackgroundProps) {
  const { theme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const currentTheme = mounted ? (resolvedTheme || theme) : 'light';
  const config = themeConfig[(currentTheme as keyof typeof themeConfig)] || themeConfig.light;

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
