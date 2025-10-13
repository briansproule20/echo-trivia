"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BuilderForm } from "@/components/trivia/BuilderForm";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useBuilderStore, usePlayStore } from "@/lib/store";
import { generateId } from "@/lib/quiz-utils";
import { storage } from "@/lib/storage";
import { Wand2, Plus, Trash2 } from "lucide-react";
import type { Question, Quiz, Session, Difficulty, QuestionType } from "@/lib/types";

export default function BuilderPage() {
  const router = useRouter();
  const { settings, setSettings, manualQuestions, addManualQuestion, removeManualQuestion, clearManualQuestions } = useBuilderStore();
  const { setSession } = usePlayStore();
  const [isGenerating, setIsGenerating] = useState(false);

  // Manual question form state
  const [questionForm, setQuestionForm] = useState({
    prompt: "",
    type: "multiple_choice" as QuestionType,
    difficulty: "medium" as Difficulty,
    answer: "",
    explanation: "",
    choices: ["", "", "", ""],
  });

  const handleAIGenerate = async () => {
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
      await storage.saveSession(session);
      router.push(`/play/${session.id}`);
    } catch (error) {
      console.error("Generation error:", error);
      alert("Failed to generate quiz. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAddManualQuestion = () => {
    if (!questionForm.prompt.trim() || !questionForm.answer.trim()) {
      alert("Please fill in prompt and answer");
      return;
    }

    const question: Question = {
      id: generateId(),
      prompt: questionForm.prompt,
      type: questionForm.type,
      difficulty: questionForm.difficulty,
      category: settings.category || "General Knowledge",
      answer: questionForm.answer,
      explanation: questionForm.explanation,
      choices:
        questionForm.type === "multiple_choice"
          ? questionForm.choices
              .filter((c) => c.trim())
              .map((text, idx) => ({
                id: String.fromCharCode(65 + idx),
                text,
              }))
          : undefined,
    };

    addManualQuestion(question);

    // Reset form
    setQuestionForm({
      prompt: "",
      type: "multiple_choice",
      difficulty: "medium",
      answer: "",
      explanation: "",
      choices: ["", "", "", ""],
    });
  };

  const handleStartManualQuiz = async () => {
    if (manualQuestions.length === 0) {
      alert("Please add at least one question");
      return;
    }

    const quiz: Quiz = {
      id: generateId(),
      title: "Custom Quiz",
      category: settings.category || "General Knowledge",
      questions: manualQuestions,
      createdAt: new Date().toISOString(),
    };

    const session: Session = {
      id: generateId(),
      quiz,
      startedAt: new Date().toISOString(),
      submissions: [],
    };

    setSession(session);
    await storage.saveSession(session);
    clearManualQuestions();
    router.push(`/play/${session.id}`);
  };

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

          {/* Tabs */}
          <Tabs defaultValue="ai" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="ai">AI-Assist</TabsTrigger>
              <TabsTrigger value="manual">Manual</TabsTrigger>
            </TabsList>

            {/* AI Generation Tab */}
            <TabsContent value="ai" className="space-y-6">
              <BuilderForm
                settings={settings}
                onChange={setSettings}
                onGenerate={handleAIGenerate}
                isGenerating={isGenerating}
              />
            </TabsContent>

            {/* Manual Creation Tab */}
            <TabsContent value="manual" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Add Question</CardTitle>
                  <CardDescription>
                    Create questions manually
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Question Type */}
                  <div className="space-y-2">
                    <Label>Question Type</Label>
                    <Select
                      value={questionForm.type}
                      onValueChange={(value) =>
                        setQuestionForm({ ...questionForm, type: value as QuestionType })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="multiple_choice">Multiple Choice</SelectItem>
                        <SelectItem value="true_false">True/False</SelectItem>
                        <SelectItem value="short_answer">Short Answer</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Difficulty */}
                  <div className="space-y-2">
                    <Label>Difficulty</Label>
                    <Select
                      value={questionForm.difficulty}
                      onValueChange={(value) =>
                        setQuestionForm({ ...questionForm, difficulty: value as Difficulty })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="easy">Easy</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="hard">Hard</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Prompt */}
                  <div className="space-y-2">
                    <Label>Question</Label>
                    <Textarea
                      placeholder="Enter question here..."
                      value={questionForm.prompt}
                      onChange={(e) =>
                        setQuestionForm({ ...questionForm, prompt: e.target.value })
                      }
                    />
                  </div>

                  {/* Choices for MCQ */}
                  {questionForm.type === "multiple_choice" && (
                    <div className="space-y-2">
                      <Label>Choices</Label>
                      {questionForm.choices.map((choice, idx) => (
                        <Input
                          key={idx}
                          placeholder={`Choice ${String.fromCharCode(65 + idx)}`}
                          value={choice}
                          onChange={(e) => {
                            const newChoices = [...questionForm.choices];
                            newChoices[idx] = e.target.value;
                            setQuestionForm({ ...questionForm, choices: newChoices });
                          }}
                        />
                      ))}
                    </div>
                  )}

                  {/* Answer */}
                  <div className="space-y-2">
                    <Label>
                      Answer{" "}
                      {questionForm.type === "multiple_choice" && "(enter choice letter, e.g., A)"}
                      {questionForm.type === "true_false" && "(true or false)"}
                    </Label>
                    <Input
                      placeholder="Enter answer..."
                      value={questionForm.answer}
                      onChange={(e) =>
                        setQuestionForm({ ...questionForm, answer: e.target.value })
                      }
                    />
                  </div>

                  {/* Explanation */}
                  <div className="space-y-2">
                    <Label>Explanation (optional)</Label>
                    <Textarea
                      placeholder="Provide explanation..."
                      value={questionForm.explanation}
                      onChange={(e) =>
                        setQuestionForm({ ...questionForm, explanation: e.target.value })
                      }
                    />
                  </div>

                  <Button onClick={handleAddManualQuestion} className="w-full">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Question
                  </Button>
                </CardContent>
              </Card>

              {/* Question List */}
              {manualQuestions.length > 0 && (
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>Preview ({manualQuestions.length} questions)</CardTitle>
                        <CardDescription>Review and start the quiz</CardDescription>
                      </div>
                      <Button onClick={clearManualQuestions} variant="destructive" size="sm">
                        Clear All
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {manualQuestions.map((q, idx) => (
                      <div key={q.id} className="flex items-start justify-between p-3 border rounded-lg">
                        <div className="flex-1">
                          <div className="font-medium">
                            {idx + 1}. {q.prompt}
                          </div>
                          <div className="text-sm text-muted-foreground mt-1">
                            {q.type} • {q.difficulty}
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeManualQuestion(q.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    ))}

                    <Button onClick={handleStartManualQuiz} size="lg" className="w-full mt-4">
                      Start Quiz ({manualQuestions.length} questions)
                    </Button>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}

