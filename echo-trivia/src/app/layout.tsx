import { Navbar } from '@/components/trivia/Navbar';
import { Providers } from '@/providers';
import { ReferralDetector } from '@/components/ReferralDetector';
import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
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

export const metadata: Metadata = {
  title: 'Trivia Wizard - AI-Powered Trivia Platform',
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
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>
          <Suspense fallback={null}>
            <ReferralDetector />
          </Suspense>
          <Navbar />
          {children}
        </Providers>
      </body>
    </html>
  );
}
