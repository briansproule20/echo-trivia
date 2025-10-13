"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CATEGORIES } from "@/lib/types";
import type { PlaySettings, Difficulty, QuestionType, QuizStyle } from "@/lib/types";

interface BuilderFormProps {
  settings: Partial<PlaySettings>;
  onChange: (settings: Partial<PlaySettings>) => void;
  onGenerate: () => void;
  isGenerating?: boolean;
}

export function BuilderForm({
  settings,
  onChange,
  onGenerate,
  isGenerating = false,
}: BuilderFormProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Quiz Settings</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Category */}
        <div className="space-y-2">
          <Label htmlFor="category">Category</Label>
          <Select
            value={settings.category}
            onValueChange={(value) => onChange({ ...settings, category: value })}
          >
            <SelectTrigger id="category">
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {CATEGORIES.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Number of Questions */}
        <div className="space-y-2">
          <Label htmlFor="numQuestions">Number of Questions</Label>
          <Input
            id="numQuestions"
            type="number"
            min={5}
            max={50}
            value={settings.numQuestions || 10}
            onChange={(e) =>
              onChange({ ...settings, numQuestions: parseInt(e.target.value) })
            }
          />
        </div>

        {/* Difficulty */}
        <div className="space-y-2">
          <Label htmlFor="difficulty">Difficulty</Label>
          <Select
            value={settings.difficulty}
            onValueChange={(value) =>
              onChange({ ...settings, difficulty: value as Difficulty | "mixed" })
            }
          >
            <SelectTrigger id="difficulty">
              <SelectValue placeholder="Select difficulty" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="mixed">Mixed</SelectItem>
              <SelectItem value="easy">Easy</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="hard">Hard</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Question Type */}
        <div className="space-y-2">
          <Label htmlFor="type">Question Type</Label>
          <Select
            value={settings.type}
            onValueChange={(value) =>
              onChange({ ...settings, type: value as QuestionType | "mixed" })
            }
          >
            <SelectTrigger id="type">
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="mixed">Mixed</SelectItem>
              <SelectItem value="multiple_choice">Multiple Choice</SelectItem>
              <SelectItem value="true_false">True/False</SelectItem>
              <SelectItem value="short_answer">Short Answer</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Style */}
        <div className="space-y-2">
          <Label htmlFor="style">Style</Label>
          <Select
            value={settings.style}
            onValueChange={(value) =>
              onChange({ ...settings, style: value as QuizStyle })
            }
          >
            <SelectTrigger id="style">
              <SelectValue placeholder="Select style" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="classic">Classic</SelectItem>
              <SelectItem value="speedrun">Speedrun</SelectItem>
              <SelectItem value="survival">Survival</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Time per Question (for speedrun) */}
        {settings.style === "speedrun" && (
          <div className="space-y-2">
            <Label htmlFor="timePerQuestion">Time per Question (seconds)</Label>
            <Input
              id="timePerQuestion"
              type="number"
              min={5}
              max={60}
              value={settings.timePerQuestionSec || 20}
              onChange={(e) =>
                onChange({
                  ...settings,
                  timePerQuestionSec: parseInt(e.target.value),
                })
              }
            />
          </div>
        )}

        <Button
          onClick={onGenerate}
          disabled={isGenerating}
          className="w-full"
          size="lg"
        >
          {isGenerating ? "Generating..." : "Generate Quiz"}
        </Button>
      </CardContent>
    </Card>
  );
}

