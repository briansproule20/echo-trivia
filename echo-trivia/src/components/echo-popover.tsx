'use client';
import EchoBalance from '@/components/balance';
import { EchoTopUpButton } from '@/components/top-up-button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/echo-button';
import { AnimatedPopoverContent } from '@/components/ui/popover';
import { type EchoContextValue } from '@merit-systems/echo-react-sdk';
import { LogOut, BookOpen } from 'lucide-react';
import { useRouter } from 'next/navigation';

export function EchoAccountButtonPopover({ echo }: { echo: EchoContextValue }) {
  const { user, signOut } = echo;

  return (
    <AnimatedPopoverContent className="w-[280px] sm:w-[380px] p-0" align="end">
      {/* Header */}
      <div className="flex items-center justify-between gap-2 border-b p-4">
        <Button
          variant="ghost"
          className="flex items-center gap-2 h-auto p-2 -ml-2 hover:bg-accent min-w-0 flex-1"
          onClick={() =>
            window.open('https://echo.merit.systems/dashboard', '_blank')
          }
        >
          <Avatar className="h-8 w-8 shrink-0">
            <AvatarImage src={user?.image ?? ''} />
            <AvatarFallback>
              {user?.name?.charAt(0) || user?.email?.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div className="text-left min-w-0">
            <h4 className="font-medium text-sm truncate">
              {user?.name || user?.email || 'Account'}
            </h4>
            <p className="text-xs text-muted-foreground/80 truncate">{user?.id}</p>
          </div>
        </Button>
        <Button variant="ghost" size="icon" className="shrink-0" onClick={() => signOut()}>
          <LogOut className="h-4 w-4" />
        </Button>
      </div>

      {/* Balance */}
      <div className="p-4 border-b">
        <EchoBalance echo={echo} />
      </div>

      {/* Add Credits Button */}
      <div className="p-4 border-b">
        <EchoTopUpButton echo={echo} />
      </div>
    </AnimatedPopoverContent>
  );
}
