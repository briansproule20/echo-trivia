import { Navbar } from '@/components/trivia/Navbar';
import { Providers } from '@/providers';
import { ReferralDetector } from '@/components/ReferralDetector';
import { SyncQueueProcessor } from '@/components/SyncQueueProcessor';
import { Analytics } from '@vercel/analytics/next';
import type { Metadata } from 'next';
import { Geist, Geist_Mono, EB_Garamond, Orbitron } from 'next/font/google';
import { Suspense } from 'react';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

const ebGaramond = EB_Garamond({
  variable: '--font-eb-garamond',
  subsets: ['latin'],
});

const orbitron = Orbitron({
  variable: '--font-orbitron',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Trivia Wizard',
  description: 'Daily challenge + infinite practice. Built on Echo.',
  icons: {
    icon: '/trivia-wizard-logo.png',
    apple: '/trivia-wizard-logo.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${ebGaramond.variable} ${orbitron.variable} antialiased`}
      >
        <Providers>
          <Suspense fallback={null}>
            <ReferralDetector />
          </Suspense>
          <SyncQueueProcessor />
          <Navbar />
          {children}
          <Analytics />
        </Providers>
      </body>
    </html>
  );
}
