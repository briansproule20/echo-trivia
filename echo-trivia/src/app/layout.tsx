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
    title: 'Trivia Wizard',
    description: 'AI-Powered Trivia - Test your knowledge!',
    images: [{
      url: '/trivia-wizard-logo.png',
      width: 1200,
      height: 630,
      alt: 'Trivia Wizard Logo',
    }],
    type: 'website',
    siteName: 'Trivia Wizard',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Trivia Wizard',
    description: 'AI-Powered Trivia - Test your knowledge!',
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
    <html lang="en" suppressHydrationWarning>
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
