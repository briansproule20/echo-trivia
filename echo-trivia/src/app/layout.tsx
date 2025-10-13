import { Navbar } from '@/components/trivia/Navbar';
import { Providers } from '@/providers';
import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
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
  description: 'Test knowledge, challenge yourself, and learn something new every day with AI-powered trivia quizzes.',
  openGraph: {
    title: 'Trivia Wizard - AI-Powered Trivia Platform',
    description: 'Test knowledge, challenge yourself, and learn something new every day with AI-powered trivia quizzes.',
    images: ['/trivia-wizard-logo.png'],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Trivia Wizard - AI-Powered Trivia Platform',
    description: 'Test knowledge, challenge yourself, and learn something new every day with AI-powered trivia quizzes.',
    images: ['/trivia-wizard-logo.png'],
  },
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
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>
          <Navbar />
          {children}
        </Providers>
      </body>
    </html>
  );
}
