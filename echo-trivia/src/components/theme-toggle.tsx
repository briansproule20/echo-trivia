"use client";

import { useRef } from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { flushSync } from "react-dom";
import { Button } from "@/components/ui/button";

export function ThemeToggle() {
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const { setTheme } = useTheme();

  const changeTheme = async () => {
    if (!buttonRef.current) return;

    // Determine if we're currently in dark mode (before the transition)
    const isDark = document.documentElement.classList.contains("dark");

    // Check if View Transitions API is supported
    if (!document.startViewTransition) {
      // Fallback for browsers without View Transitions API
      document.documentElement.classList.toggle("dark");
      setTheme(isDark ? "light" : "dark");
      return;
    }

    const { top, left, width, height } =
      buttonRef.current.getBoundingClientRect();
    const y = top + height / 2;
    const x = left + width / 2;

    const right = window.innerWidth - left;
    const bottom = window.innerHeight - top;
    const maxRad = Math.hypot(Math.max(left, right), Math.max(top, bottom));

    const clipPathSmall = `circle(0px at ${x}px ${y}px)`;
    const clipPathFull = `circle(${maxRad}px at ${x}px ${y}px)`;

    const transition = document.startViewTransition(() => {
      flushSync(() => {
        document.documentElement.classList.toggle("dark");
        setTheme(isDark ? "light" : "dark");
      });
    });

    await transition.ready;

    // Always animate the new view expanding from the button
    document.documentElement.animate(
      { clipPath: [clipPathSmall, clipPathFull] },
      {
        duration: 700,
        easing: "ease-in-out",
        pseudoElement: "::view-transition-new(root)",
      }
    );
  };

  return (
    <Button
      ref={buttonRef}
      onClick={changeTheme}
      variant="ghost"
      size="icon"
      className="h-10 w-10"
    >
      <Sun className="absolute h-5 w-5 rotate-0 opacity-100 transition-all duration-300 dark:-rotate-90 dark:opacity-0" />
      <Moon className="absolute h-5 w-5 rotate-90 opacity-0 transition-all duration-300 dark:rotate-0 dark:opacity-100" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}
