"use client";

import { useEffect, useState } from "react";
import { Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface TimerProps {
  seconds: number;
  onExpire?: () => void;
  isPaused?: boolean;
}

export function Timer({ seconds, onExpire, isPaused = false }: TimerProps) {
  const [remaining, setRemaining] = useState(seconds);

  useEffect(() => {
    setRemaining(seconds);
  }, [seconds]);

  useEffect(() => {
    if (isPaused || remaining <= 0) return;

    const interval = setInterval(() => {
      setRemaining((prev) => {
        if (prev <= 1) {
          onExpire?.();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [remaining, onExpire, isPaused]);

  const percentage = (remaining / seconds) * 100;
  const isUrgent = percentage < 20;

  return (
    <div
      className={cn(
        "flex items-center space-x-2 px-3 py-1.5 rounded-md border transition-colors",
        isUrgent ? "border-red-500 bg-red-50 dark:bg-red-950" : "border-border"
      )}
    >
      <Clock className={cn("h-4 w-4", isUrgent && "text-red-500")} />
      <span
        className={cn(
          "text-sm font-medium tabular-nums",
          isUrgent && "text-red-500"
        )}
      >
        {remaining}s
      </span>
    </div>
  );
}

