import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { createServiceClient } from '@/utils/supabase/service'
import type { Quiz, Question } from '@/lib/types'

// Type for answer key storage
interface AnswerKey {
  question_id: string
  answer: string
  type: string
  explanation: string
}

// Strip answers from quiz before sending to client
function stripAnswersFromQuiz(quiz: Quiz): Quiz {
  return {
    ...quiz,
    questions: quiz.questions.map((q) => ({
      ...q,
      answer: '', // Remove answer
      explanation: '', // Remove explanation until after answer is submitted
    })),
  }
}

// Store answer keys server-side for the faceoff challenge
async function storeAnswerKeys(quizId: string, questions: Question[]): Promise<void> {
  const supabase = createServiceClient()

  const answerKeys: AnswerKey[] = questions.map((q) => ({
    question_id: q.id,
    answer: q.answer,
    type: q.type,
    explanation: q.explanation || '',
  }))

  const { error } = await supabase
    .from('quiz_answer_keys')
    .upsert(
      {
        quiz_id: quizId,
        answers: answerKeys,
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
      },
      {
        onConflict: 'quiz_id',
      }
    )

  if (error) {
    console.error('Failed to store answer keys for faceoff:', error)
    // Don't throw - challenge can still work, just log the error
  }
}

// GET /api/faceoff/[shareCode] - Fetch a challenge by share code
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ shareCode: string }> }
) {
  try {
    const { shareCode } = await params

    if (!shareCode) {
      return NextResponse.json({ error: 'Share code is required' }, { status: 400 })
    }

    const supabase = await createClient()

    // Fetch challenge by share code
    const { data: challenge, error } = await supabase
      .from('faceoff_challenges')
      .select('*')
      .eq('share_code', shareCode)
      .single()

    if (error || !challenge) {
      return NextResponse.json({ error: 'Challenge not found' }, { status: 404 })
    }

    // Check if expired
    if (challenge.expires_at) {
      const expiresAt = new Date(challenge.expires_at)
      if (expiresAt < new Date()) {
        return NextResponse.json({ error: 'Challenge has expired' }, { status: 410 })
      }
    }

    // Increment times_played counter
    await supabase
      .from('faceoff_challenges')
      .update({ times_played: (challenge.times_played || 0) + 1 })
      .eq('id', challenge.id)

    // SECURITY: Store answer keys server-side and strip from client response
    const quiz = challenge.quiz_data as Quiz
    if (quiz?.questions?.length > 0) {
      await storeAnswerKeys(quiz.id, quiz.questions)
    }

    // Return challenge with answers stripped from quiz
    const secureChallenge = {
      ...challenge,
      quiz_data: stripAnswersFromQuiz(quiz),
    }

    return NextResponse.json({ challenge: secureChallenge })
  } catch (error) {
    console.error('Error fetching faceoff challenge:', error)
    return NextResponse.json(
      { error: 'Failed to fetch challenge' },
      { status: 500 }
    )
  }
}
