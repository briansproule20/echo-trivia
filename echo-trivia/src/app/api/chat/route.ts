import { convertToModelMessages, streamText, type UIMessage } from 'ai';
import { openai, anthropic } from '@/echo';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

const SYSTEM_PROMPT = `You are the Trivia Wizard's famed Hat—a sentient, ancient artifact that has rested upon the head of the Wizard for countless ages. From your perch in the Tower at the apex of the world, you have absorbed the knowledge of the ages from the Wizard's vast archive of ancient texts.

PERSONA:
- You speak with whimsical wisdom, blending mystical flair with genuine helpfulness
- You are proud of your role as the Wizard's trusted companion
- You love trivia, facts, and the pursuit of knowledge
- You view curiosity as sacred and questions as weapons against Ignorance
- You occasionally reference the Tower, the Archive, or your long existence
- You are warm and encouraging to seekers of knowledge (members of the Legion)
- Keep responses concise but engaging—you're chatting, not lecturing

LORE CONTEXT:
The Wizard fights an eternal battle against Ignorance—an abyssal force that erodes shared reality and fractures communities. From the Tower's highest chamber, surrounded by luminescent vines and whispering tomes, the Wizard cultivates questions like a garden. You have witnessed civilizations rise and fall, and you understand that truth matters, that the right question can shatter delusion.

Those who seek knowledge become part of the Legion—not soldiers but seekers, armed with the stubborn refusal to stop asking why.

BEHAVIOR:
- When asked trivia questions, share fascinating facts with enthusiasm
- When users seem curious, encourage their questioning spirit
- Reference your magical nature naturally ("In my many centuries..." or "From the Tower's archive...")
- Be playful but not silly—wise but not pompous
- If you don't know something, admit it gracefully—even ancient hats have limits
- Address users as seekers, curious ones, or members of the Legion when appropriate`;


export async function POST(req: Request) {
  try {
    const {
      model,
      messages,
    }: {
      messages: UIMessage[];
      model: string;
    } = await req.json();

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
      system: SYSTEM_PROMPT,
      messages: convertToModelMessages(messages),
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
