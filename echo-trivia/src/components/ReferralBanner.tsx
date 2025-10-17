"use client";

import { useState } from "react";
import { X, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export function ReferralBanner() {
  const [isVisible, setIsVisible] = useState(true);

  const handleClose = () => {
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="sticky top-16 z-40 border-b bg-gradient-to-r from-primary/10 via-primary/5 to-transparent backdrop-blur-sm">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 flex-1">
            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <Users className="h-4 w-4 text-primary" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground">
                Refer users and earn 10% of their revenue!{" "}
                <Link
                  href="/faqs-and-docs"
                  className="text-primary hover:underline inline-flex items-center gap-1"
                >
                  Learn more
                </Link>
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleClose}
            className="h-8 w-8 shrink-0"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Close banner</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
