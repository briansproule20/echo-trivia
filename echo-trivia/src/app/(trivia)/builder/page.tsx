"use client";

import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Lock, ArrowLeft } from "lucide-react";

export default function BuilderPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12 space-y-4">
            <div className="flex items-center justify-center space-x-3">
              <img 
                src="/trivia-wizard-logo.png" 
                alt="Trivia Wizard" 
                className="h-12 w-12 object-contain"
              />
              <h1 className="text-5xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                Quiz Builder
              </h1>
            </div>
            <p className="text-xl text-muted-foreground">
              Create custom quizzes manually or with AI
            </p>
          </div>

          {/* Locked State */}
          <Card className="border-2 border-dashed">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <div className="rounded-full bg-muted p-6">
                  <Lock className="h-12 w-12 text-muted-foreground" />
                </div>
              </div>
              <CardTitle className="text-2xl">Coming Soon</CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-6">
              <p className="text-muted-foreground">
                Quiz Builder is currently under development. Try the Daily Quiz to get started with Trivia Wizard!
              </p>
              <Button onClick={() => router.push("/daily")} size="lg" className="w-full">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Go to Daily Quiz
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
