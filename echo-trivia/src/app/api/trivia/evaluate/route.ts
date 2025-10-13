// Evaluate trivia answer

import { isSignedIn, openai } from "@/echo";
import { generateText } from "ai";
import { EvaluateRequestSchema, EvaluateResponseSchema } from "@/lib/schemas";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const FUZZY_EVAL_SYSTEM_PROMPT = `You are grading a short answer for trivia.
Decide if the user response is an acceptable alias or equivalent of the canonical answer.
Return JSON: {"score": 0..1, "explanation": "1 sentence"}.
Accept if score ≥ 0.85.
Be generous with synonyms, common abbreviations, and minor spelling variations.`;

export async function POST(req: Request) {
  try {
    // Check authentication
    const cookieStore = await cookies();
    const signedIn = await isSignedIn({ cookies: cookieStore });
    
    if (!signedIn) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { question, response } = EvaluateRequestSchema.parse(body);

    let correct = false;
    let explanation = question.explanation || "";

    // Multiple choice and true/false: strict comparison
    if (question.type === "multiple_choice" || question.type === "true_false") {
      correct = response.toLowerCase().trim() === question.answer.toLowerCase().trim();
      
      if (!explanation) {
        explanation = correct
          ? "Correct!"
          : `The correct answer is: ${question.answer}`;
      }
    }
    // Short answer: fuzzy matching with LLM
    else if (question.type === "short_answer") {
      // First try case-insensitive exact match
      const normalizedResponse = response.toLowerCase().trim();
      const normalizedAnswer = question.answer.toLowerCase().trim();

      if (normalizedResponse === normalizedAnswer) {
        correct = true;
      } else {
        // Use LLM for fuzzy matching
        const evalResult = await generateText({
          model: openai("gpt-4o", { cookies: cookieStore }),
          system: FUZZY_EVAL_SYSTEM_PROMPT,
          prompt: `Question: ${question.prompt}\nCanonical Answer: ${question.answer}\nUser Response: ${response}\n\nIs the user response acceptable?`,
          temperature: 0.3,
        });

        try {
          const jsonMatch = evalResult.text.match(/\{[\s\S]*?\}/);
          if (jsonMatch) {
            const parsed = JSON.parse(jsonMatch[0]);
            correct = parsed.score >= 0.85;
            explanation = parsed.explanation || explanation;
          }
        } catch (error) {
          console.error("Fuzzy eval parsing error:", error);
          // Fallback to strict comparison
          correct = false;
        }
      }

      if (!explanation) {
        explanation = correct
          ? "Correct! Your answer is acceptable."
          : `Incorrect. The correct answer is: ${question.answer}`;
      }
    }

    const result = EvaluateResponseSchema.parse({
      correct,
      canonicalAnswer: question.answer,
      explanation,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Evaluate error:", error);
    return NextResponse.json(
      { error: "Failed to evaluate answer", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

