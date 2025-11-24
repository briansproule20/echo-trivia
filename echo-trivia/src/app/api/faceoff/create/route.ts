import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { isSignedIn } from '@/echo'
import type { Quiz, Session } from '@/lib/types'

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

    // Save challenge to database
    const { data: challenge, error: challengeError } = await supabase
      .from('faceoff_challenges')
      .insert({
        creator_echo_user_id: echo_user_id,
        creator_username: echo_user_name || null,
        quiz_data: session.quiz, // Store entire quiz as JSON
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
