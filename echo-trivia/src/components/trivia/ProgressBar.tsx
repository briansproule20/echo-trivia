"use client";

import { Progress } from "@/components/ui/progress";

interface ProgressBarProps {
  current: number;
  total: number;
  showLabel?: boolean;
}

export function ProgressBar({ current, total, showLabel = true }: ProgressBarProps) {
  const percentage = (current / total) * 100;

  return (
    <div className="space-y-2 flex-1 max-w-md">
      {showLabel && (
        <div className="text-sm font-medium text-muted-foreground text-center">
          {current} / {total}
        </div>
      )}
      <Progress value={percentage} className="h-2" />
    </div>
  );
}

