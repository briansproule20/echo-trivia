import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { isSignedIn } from '@/echo'

// GET /api/quiz/history/[sessionId]?echo_user_id=xxx
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const signedIn = await isSignedIn()
    if (!signedIn) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { sessionId } = await params
    const searchParams = request.nextUrl.searchParams
    const echoUserId = searchParams.get('echo_user_id')

    if (!echoUserId) {
      return NextResponse.json(
        { error: 'echo_user_id is required' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Fetch the session
    const { data: session, error: sessionError } = await supabase
      .from('quiz_sessions')
      .select('*')
      .eq('id', sessionId)
      .eq('echo_user_id', echoUserId) // Security: ensure user owns this session
      .single()

    if (sessionError || !session) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      )
    }

    // Fetch questions for this session
    const { data: questions, error: questionsError } = await supabase
      .from('quiz_questions')
      .select('*')
      .eq('session_id', sessionId)
      .order('question_order', { ascending: true })

    if (questionsError) {
      console.error('Error fetching questions:', questionsError)
      // Questions might not exist for older sessions - continue without them
    }

    // Fetch submissions for this session
    const { data: submissions, error: submissionsError } = await supabase
      .from('quiz_submissions')
      .select('*')
      .eq('session_id', sessionId)

    if (submissionsError) {
      console.error('Error fetching submissions:', submissionsError)
    }

    // Transform data to match the Session type expected by the results page
    const transformedSession = {
      id: session.id,
      quiz: {
        id: session.id,
        title: session.title || `${session.category} Quiz`,
        category: session.category,
        description: session.is_daily && session.daily_date
          ? `${session.daily_date} - Daily Challenge`
          : undefined,
        questions: (questions || []).map((q: any) => ({
          id: q.question_id,
          type: q.question_type,
          category: q.category,
          difficulty: q.difficulty,
          prompt: q.prompt,
          choices: q.choices,
          answer: q.correct_answer,
          explanation: q.explanation,
        })),
        createdAt: session.completed_at,
        seeded: session.is_daily,
      },
      startedAt: new Date(new Date(session.completed_at).getTime() - (session.time_taken || 0) * 1000).toISOString(),
      endedAt: session.completed_at,
      submissions: (submissions || []).map((s: any) => ({
        questionId: s.question_id,
        response: s.user_response,
        correct: s.is_correct,
        timeMs: s.time_ms || 0,
      })),
      score: session.correct_answers,
      totalQuestions: session.total_questions,
      scorePercentage: session.score_percentage,
      earnedTitle: session.title,
      gameMode: session.game_mode,
    }

    return NextResponse.json({
      session: transformedSession,
      hasQuestions: (questions || []).length > 0,
    })
  } catch (error) {
    console.error('Error fetching session details:', error)
    return NextResponse.json(
      { error: 'Failed to fetch session details' },
      { status: 500 }
    )
  }
}
