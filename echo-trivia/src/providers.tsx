'use client';

import { EchoProvider } from '@merit-systems/echo-next-sdk/client';
import { ThemeProvider } from '@/components/theme-provider';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <EchoProvider config={{ appId: process.env.NEXT_PUBLIC_ECHO_APP_ID! }}>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        themes={['light', 'dark', 'paperwhite']}
        disableTransitionOnChange
      >
        {children}
      </ThemeProvider>
    </EchoProvider>
  );
}
