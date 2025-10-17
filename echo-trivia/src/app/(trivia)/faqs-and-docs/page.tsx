"use client";

import { Badge } from "@/components/ui/badge";
import { DotBackground } from "@/components/ui/dot-background";

export default function FaqsAndDocsPage() {
  return (
    <DotBackground className="min-h-screen">
      <div className="container mx-auto px-4 py-12 max-w-5xl">
        {/* Header */}
        <div className="text-center mb-12 space-y-4">
          <Badge variant="secondary" className="mb-2">
            Help & Documentation
          </Badge>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">
            <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              FAQs & Docs
            </span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Coming soon - frequently asked questions and detailed documentation
          </p>
        </div>
      </div>
    </DotBackground>
  );
}
