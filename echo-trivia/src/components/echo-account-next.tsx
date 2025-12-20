'use client';

import { useEcho } from '@merit-systems/echo-next-sdk/client';
import { EchoAccountButton } from './echo-account';
import { DailyStreak } from './daily-streak';

interface EchoAccountProps {
  hideStreak?: boolean;
}

export function EchoAccount({ hideStreak = false }: EchoAccountProps) {
  const echo = useEcho();
  return (
    <div className="flex items-center gap-2">
      {!hideStreak && <DailyStreak />}
      <EchoAccountButton echo={echo} />
    </div>
  );
}
