import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { createServiceClient } from '@/utils/supabase/service'
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

    // Use service client for quiz_questions - RLS policy uses auth.uid() which doesn't work with Echo auth
    const serviceClient = createServiceClient()

    // Fetch questions for this session
    const { data: questions, error: questionsError } = await serviceClient
      .from('quiz_questions')
      .select('*')
      .eq('session_id', sessionId)
      .order('question_order', { ascending: true })

    if (questionsError) {
      console.error('Error fetching questions:', questionsError)
      // Questions might not exist for older sessions - continue without them
    }

    // Fetch answer keys as fallback for correct answers
    // Note: quiz_id in answer_keys table is the quiz.id, not the session.id

    // Try to find quiz_id from multiple sources
    let quizId = sessionId
    console.log('[History] Starting quiz_id lookup for session:', sessionId)
    console.log('[History] Questions found:', questions?.length || 0)
    if (questions?.[0]) {
      console.log('[History] First question:', {
        question_id: questions[0].question_id,
        quiz_id: questions[0].quiz_id,
        correct_answer: questions[0].correct_answer
      })
    }

    // Source 1: quiz_id stored in questions table (new quizzes)
    if (questions && questions.length > 0 && questions[0].quiz_id) {
      quizId = questions[0].quiz_id
      console.log('[History] Found quiz_id in questions table:', quizId)
    }

    // Source 2: Get quiz_id from evaluations table (older quizzes)
    if (quizId === sessionId && questions && questions.length > 0) {
      console.log('[History] Trying to find quiz_id from evaluations for question_id:', questions[0].question_id)
      const { data: evalData, error: evalError } = await serviceClient
        .from('quiz_evaluations')
        .select('quiz_id')
        .eq('question_id', questions[0].question_id)
        .limit(1)
        .single()
      console.log('[History] Evaluations lookup result:', { evalData, evalError })
      if (evalData?.quiz_id) {
        quizId = evalData.quiz_id
        console.log('[History] Found quiz_id in evaluations:', quizId)
      }
    }

    console.log('[History] Final quiz_id for answer key lookup:', quizId)

    // Fetch answer keys using the found quiz_id
    const { data: answerKeyData, error: answerKeyError } = await serviceClient
      .from('quiz_answer_keys')
      .select('answers')
      .eq('quiz_id', quizId)
      .single()

    console.log('[History] Answer keys lookup:', {
      found: !!answerKeyData,
      numAnswers: answerKeyData?.answers?.length,
      error: answerKeyError
    })

    const answerKeys = (answerKeyData?.answers || []) as Array<{
      question_id: string
      answer: string
      explanation: string
    }>
    const answerKeyMap = new Map(answerKeys.map(k => [k.question_id, k]))

    // Fetch submissions for this session
    const { data: submissions, error: submissionsError } = await supabase
      .from('quiz_submissions')
      .select('*')
      .eq('session_id', sessionId)

    if (submissionsError) {
      console.error('Error fetching submissions:', submissionsError)
    }

    // If no questions stored, try to construct basic question info from submissions
    // This handles older sessions that didn't save full question data
    let questionsData = (questions || []).map((q: any) => {
      const answerKey = answerKeyMap.get(q.question_id)
      return {
        id: q.question_id,
        type: q.question_type,
        category: q.category,
        difficulty: q.difficulty,
        prompt: q.prompt,
        choices: q.choices,
        answer: q.correct_answer || answerKey?.answer || '',
        explanation: q.explanation || answerKey?.explanation || '',
      }
    })

    // Fallback: construct minimal question data from submissions if no questions stored
    if (questionsData.length === 0 && submissions && submissions.length > 0) {
      questionsData = submissions.map((s: any, index: number) => ({
        id: s.question_id,
        type: 'unknown',
        category: session.category,
        difficulty: null,
        prompt: `Question ${index + 1}`, // We don't have the original prompt
        choices: null,
        answer: s.correct_answer || '',
        explanation: '',
      }))
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
        questions: questionsData,
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
