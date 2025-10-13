"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { EchoAccount } from "@/components/echo-account-next";
import EchoBalance from "@/components/balance";
import { useEcho } from "@merit-systems/echo-react-sdk";

const NAV_ITEMS = [
  { href: "/", label: "Home" },
  { href: "/daily", label: "Daily Quiz" },
  { href: "/practice", label: "Practice" },
  { href: "/builder", label: "Builder" },
];

export function Navbar() {
  const pathname = usePathname();
  const echo = useEcho();

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
            <img 
              src="/trivia-wizard-logo.png" 
              alt="Trivia Wizard" 
              className="h-8 w-8 object-contain"
            />
            <span className="text-xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Trivia Wizard
            </span>
          </Link>

          {/* Right Side - Menu Button */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="h-10 w-10">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[400px]">
              <SheetHeader>
                <SheetTitle className="flex items-center space-x-2">
                  <img 
                    src="/trivia-wizard-logo.png" 
                    alt="Trivia Wizard" 
                    className="h-6 w-6 object-contain"
                  />
                  <span>Navigation</span>
                </SheetTitle>
              </SheetHeader>
              <div className="flex flex-col space-y-6 mt-8">
                {/* Navigation Links */}
                <nav className="flex flex-col space-y-3">
                  {NAV_ITEMS.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`text-lg font-medium transition-colors hover:text-primary px-3 py-2 rounded-md ${
                        pathname === item.href
                          ? "text-primary bg-primary/10"
                          : "text-muted-foreground hover:bg-accent"
                      }`}
                    >
                      {item.label}
                    </Link>
                  ))}
                </nav>

                {/* Auth & Balance */}
                <div className="pt-6 border-t space-y-4">
                  {echo.user ? (
                    <EchoBalance echo={echo} />
                  ) : null}
                  <div className="px-3">
                    <EchoAccount />
                  </div>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
}

