import { convertToModelMessages, streamText, tool, type UIMessage } from 'ai';
import { openai, anthropic } from '@/echo';
import { z } from 'zod';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

const SYSTEM_PROMPT = `You are the Wizard's Hat, a knowledgeable AI assistant for Trivia Wizard.

Be helpful, friendly, and direct. Keep responses concise—2-4 sentences is ideal. No flowery language, no "tips brim", no "sparkles magically", no theatrical mystical prose. Just be a smart, warm assistant.

TRIVIA QUESTIONS:
When a user asks for trivia or wants to test their knowledge, use the trivia_question tool.
- Create interesting, factual questions
- After they answer, give a brief, informative explanation
- NO TRICK QUESTIONS - the correct answer should be clearly correct`;

const WIDGET_SYSTEM_PROMPT = `You are the Wizard's Hat, a knowledgeable AI assistant for Trivia Wizard.

Be helpful, friendly, and direct. Keep responses concise—2-4 sentences is ideal. No flowery language, no theatrical mystical prose. Just be a smart, warm assistant.

WARMUP REQUESTS:
If a user asks for trivia or quiz questions, direct them to the full chat: "For trivia practice, click the expand button (↗) to visit the full chat page."

You cannot present interactive trivia in this widget.`;


export async function POST(req: Request) {
  try {
    const {
      model,
      messages,
      source,
    }: {
      messages: UIMessage[];
      model: string;
      source?: 'widget' | 'page';
    } = await req.json();

    const isWidget = source === 'widget';

    // Validate required parameters
    if (!model) {
      return new Response(
        JSON.stringify({
          error: 'Bad Request',
          message: 'Model parameter is required',
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    if (!messages || !Array.isArray(messages)) {
      return new Response(
        JSON.stringify({
          error: 'Bad Request',
          message: 'Messages parameter is required and must be an array',
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Determine which provider to use based on model name
    const provider = model.startsWith('claude-') ? anthropic : openai;

    const result = streamText({
      model: provider(model),
      system: isWidget ? WIDGET_SYSTEM_PROMPT : SYSTEM_PROMPT,
      messages: convertToModelMessages(messages),
      // Only include tools for the full chat page, not the widget
      ...(isWidget ? {} : {
        tools: {
          trivia_question: tool({
            description: 'Present a trivia question. Always include exactly 4 options (A, B, C, D).',
            inputSchema: z.object({
              question: z.string(),
              optionA: z.string().describe('Text for option A'),
              optionB: z.string().describe('Text for option B'),
              optionC: z.string().describe('Text for option C'),
              optionD: z.string().describe('Text for option D'),
              correctAnswer: z.enum(['A', 'B', 'C', 'D']),
              category: z.string(),
              difficulty: z.enum(['easy', 'medium', 'hard']),
            }),
            // Execute function marks tool as complete so LLM waits for user answer
            execute: async ({ question, category, difficulty }) => {
              return `Question presented: "${question}" (${category}, ${difficulty}). Awaiting user's answer.`
            },
          }),
        },
      }),
    });

    return result.toUIMessageStreamResponse({
      sendSources: true,
      sendReasoning: true,
    });
  } catch (error) {
    console.error('Chat API error:', error);
    return new Response(
      JSON.stringify({
        error: 'Internal server error',
        message: 'Failed to process chat request',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}
