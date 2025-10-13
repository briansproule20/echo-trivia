"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { BuilderForm } from "@/components/trivia/BuilderForm";
import { useBuilderStore, usePlayStore } from "@/lib/store";
import { generateId } from "@/lib/quiz-utils";
import { storage } from "@/lib/storage";
import type { Session } from "@/lib/types";
import { PlayCircle } from "lucide-react";

export default function PracticePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { settings, setSettings } = useBuilderStore();
  const { setSession } = usePlayStore();
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    // Pre-fill category from URL if provided
    const category = searchParams.get("category");
    if (category) {
      setSettings({ ...settings, category });
    }
  }, [searchParams]);

  const handleGenerate = async () => {
    setIsGenerating(true);

    try {
      const response = await fetch("/api/trivia/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ settings }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate quiz");
      }

      const quiz = await response.json();

      // Create session
      const session: Session = {
        id: generateId(),
        quiz,
        startedAt: new Date().toISOString(),
        submissions: [],
      };

      setSession(session);
      storage.saveSession(session);
      router.push(`/play/${session.id}`);
    } catch (error) {
      console.error("Generation error:", error);
      alert("Failed to generate quiz. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12 space-y-4">
            <div className="flex items-center justify-center space-x-3">
              <img 
                src="/trivia-wizard-logo.png" 
                alt="Trivia Wizard" 
                className="h-12 w-12 object-contain"
              />
              <h1 className="text-5xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                Practice Mode
              </h1>
            </div>
            <p className="text-xl text-muted-foreground">
              Customize and play instantly
            </p>
          </div>

          {/* Form */}
          <BuilderForm
            settings={settings}
            onChange={setSettings}
            onGenerate={handleGenerate}
            isGenerating={isGenerating}
          />
        </div>
      </div>
    </div>
  );
}

