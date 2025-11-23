"use client";

import Link from "next/link";
import Image from "next/image";
import { ExternalLink } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 py-8 sm:py-12">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* Logo and Brand */}
          <div className="space-y-3">
            <Link href="/" className="inline-flex items-center gap-2 group">
              <Image
                src="/triviawizard favicon.png"
                alt="Trivia Wizard"
                width={32}
                height={32}
                className="size-8 group-hover:scale-110 transition-transform"
              />
              <h3 className="text-lg font-semibold">Trivia Wizard</h3>
            </Link>
            <p className="text-sm text-muted-foreground">
              Summon Your Inner Genius
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/daily"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Daily Quiz
                </Link>
              </li>
              <li>
                <Link
                  href="/practice"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Practice Mode
                </Link>
              </li>
              <li>
                <Link
                  href="/leaderboard"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Leaderboard
                </Link>
              </li>
              <li>
                <Link
                  href="/history"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Quiz History
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold">Resources</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/getting-started"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Getting Started
                </Link>
              </li>
              <li>
                <Link
                  href="/faqs-and-docs"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  FAQs & Docs
                </Link>
              </li>
              <li>
                <Link
                  href="/lore"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Lore
                </Link>
              </li>
              <li>
                <a
                  href="https://echo.merit.systems/dashboard"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1"
                >
                  Echo Dashboard
                  <ExternalLink className="h-3 w-3" />
                </a>
              </li>
            </ul>
          </div>

          {/* About */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold">Powered By</h4>
            <div className="space-y-3 text-sm text-muted-foreground">
              <p className="text-xs">
                AI-powered trivia generation and user authentication
              </p>
              <a
                href="https://echo.merit.systems"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 group"
              >
                <Image
                  src="https://echo.merit.systems/favicon.ico"
                  alt="Echo"
                  width={24}
                  height={24}
                  className="size-6 group-hover:scale-110 transition-transform"
                />
                <span className="text-primary hover:underline inline-flex items-center gap-1">
                  Echo
                  <ExternalLink className="h-3 w-3" />
                </span>
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 pt-8 border-t">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
            <p>© {new Date().getFullYear()} Trivia Wizard. All rights reserved.</p>
            <div className="flex items-center gap-4">
              <Link href="/faqs-and-docs" className="hover:text-foreground transition-colors">
                Terms
              </Link>
              <Link href="/faqs-and-docs" className="hover:text-foreground transition-colors">
                Privacy
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
