import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { isSignedIn } from '@/echo'

// GET /api/quiz/history?echo_user_id=xxx&limit=50&offset=0
export async function GET(request: NextRequest) {
  try {
    const signedIn = await isSignedIn()
    if (!signedIn) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const echoUserId = searchParams.get('echo_user_id')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    if (!echoUserId) {
      return NextResponse.json(
        { error: 'echo_user_id is required' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Fetch quiz sessions
    const { data: quizSessions, error: sessionsError } = await supabase
      .from('quiz_sessions')
      .select(`
        id,
        category,
        num_questions,
        correct_answers,
        total_questions,
        score_percentage,
        difficulty,
        quiz_type,
        is_daily,
        daily_date,
        title,
        completed_at,
        time_taken,
        game_mode,
        tower_attempt_id
      `)
      .eq('echo_user_id', echoUserId)
      .order('completed_at', { ascending: false })

    if (sessionsError) {
      console.error('Error fetching sessions:', sessionsError)
      throw sessionsError
    }

    // Fetch jeopardy games
    const { data: jeopardyGames, error: jeopardyError } = await supabase
      .from('jeopardy_games')
      .select(`
        id,
        board_size,
        categories,
        score,
        questions_answered,
        questions_correct,
        time_played_seconds,
        completed,
        ended_at
      `)
      .eq('echo_user_id', echoUserId)
      .eq('completed', true)
      .order('ended_at', { ascending: false })

    if (jeopardyError) {
      console.error('Error fetching jeopardy games:', jeopardyError)
    }

    // Transform jeopardy games to match session format
    const jeopardySessions = (jeopardyGames || []).map(game => ({
      id: game.id,
      category: `${game.board_size} Categories`,
      num_questions: game.board_size * 5,
      correct_answers: game.questions_correct,
      total_questions: game.questions_answered,
      score_percentage: game.questions_answered > 0
        ? (game.questions_correct / game.questions_answered) * 100
        : 0,
      difficulty: null,
      quiz_type: null,
      is_daily: false,
      daily_date: null,
      title: game.categories.slice(0, 2).join(', ') + (game.categories.length > 2 ? '...' : ''),
      completed_at: game.ended_at,
      time_taken: game.time_played_seconds,
      game_mode: 'jeopardy',
      jeopardy_score: game.score, // Include the actual Jeopardy score
    }))

    // Merge and sort by completed_at
    const allSessions = [...(quizSessions || []), ...jeopardySessions]
      .sort((a, b) => new Date(b.completed_at).getTime() - new Date(a.completed_at).getTime())
      .slice(offset, offset + limit)

    // Get total count for pagination
    const { count: quizCount } = await supabase
      .from('quiz_sessions')
      .select('*', { count: 'exact', head: true })
      .eq('echo_user_id', echoUserId)

    const { count: jeopardyCount } = await supabase
      .from('jeopardy_games')
      .select('*', { count: 'exact', head: true })
      .eq('echo_user_id', echoUserId)
      .eq('completed', true)

    return NextResponse.json({
      sessions: allSessions,
      total: (quizCount || 0) + (jeopardyCount || 0),
      limit,
      offset,
    })
  } catch (error) {
    console.error('Error fetching quiz history:', error)
    return NextResponse.json(
      { error: 'Failed to fetch quiz history' },
      { status: 500 }
    )
  }
}
