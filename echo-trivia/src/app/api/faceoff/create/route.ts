import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { createServiceClient } from '@/utils/supabase/service'
import { isSignedIn } from '@/echo'
import type { Quiz, Session } from '@/lib/types'

// Type for answer key from database
interface AnswerKey {
  question_id: string
  answer: string
  type: string
  explanation: string
}

// Get answer keys to reconstruct full quiz for storage
async function getAnswerKeys(quizId: string): Promise<AnswerKey[]> {
  const supabase = createServiceClient()

  const { data, error } = await supabase
    .from('quiz_answer_keys')
    .select('answers')
    .eq('quiz_id', quizId)
    .single()

  if (error || !data) {
    console.error('Failed to fetch answer keys:', error)
    return []
  }

  return data.answers as AnswerKey[]
}

// POST /api/faceoff/create - Save a completed quiz as a shareable challenge
export async function POST(request: NextRequest) {
  try {
    const signedIn = await isSignedIn()
    if (!signedIn) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { session, echo_user_id, echo_user_name } = body as {
      session: Session
      echo_user_id: string
      echo_user_name?: string
    }

    if (!session || !session.quiz || !echo_user_id) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const supabase = await createClient()

    // SECURITY: Restore answers from server-side storage for the challenge
    // Client quiz doesn't have answers anymore, we need to get them from the server
    const answerKeys = await getAnswerKeys(session.quiz.id)
    const answerKeyMap = new Map(answerKeys.map((k) => [k.question_id, k]))

    // Reconstruct quiz with answers for storage
    const quizWithAnswers: Quiz = {
      ...session.quiz,
      questions: session.quiz.questions.map((q) => {
        const answerKey = answerKeyMap.get(q.id)
        return {
          ...q,
          answer: answerKey?.answer || q.answer || '',
          explanation: answerKey?.explanation || q.explanation || '',
        }
      }),
    }

    // Generate unique share code
    const { data: shareCodeData, error: shareCodeError } = await supabase
      .rpc('generate_share_code')

    if (shareCodeError || !shareCodeData) {
      console.error('Error generating share code:', shareCodeError)
      throw new Error('Failed to generate share code')
    }

    const shareCode = shareCodeData as string

    // Prepare quiz settings
    const settings = {
      category: session.quiz.category,
      difficulty: session.quiz.questions[0]?.difficulty || 'mixed',
      num_questions: session.quiz.questions.length,
      quiz_type: session.quiz.questions[0]?.type || 'mixed',
    }

    // Calculate creator's score
    const creatorScore = session.submissions.filter(s => s.correct).length
    const creatorTitle = session.earnedTitle || null

    // Save challenge to database with full quiz (including answers from server)
    const { data: challenge, error: challengeError } = await supabase
      .from('faceoff_challenges')
      .insert({
        creator_echo_user_id: echo_user_id,
        creator_username: echo_user_name || null,
        quiz_data: quizWithAnswers, // Store quiz with server-verified answers
        settings,
        share_code: shareCode,
        creator_score: creatorScore,
        creator_title: creatorTitle,
      })
      .select()
      .single()

    if (challengeError) {
      console.error('Error creating faceoff challenge:', challengeError)
      throw challengeError
    }

    // Build shareable URL
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
    const shareUrl = `${baseUrl}/faceoff/${shareCode}`

    return NextResponse.json({
      success: true,
      challenge,
      shareCode,
      shareUrl,
    })
  } catch (error) {
    console.error('Error creating faceoff challenge:', error)
    return NextResponse.json(
      {
        error: 'Failed to create challenge',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
