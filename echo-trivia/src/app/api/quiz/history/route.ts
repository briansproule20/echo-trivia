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

    // Fetch quiz sessions with their questions and submissions
    const { data: sessions, error: sessionsError } = await supabase
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
        game_mode
      `)
      .eq('echo_user_id', echoUserId)
      .order('completed_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (sessionsError) {
      console.error('Error fetching sessions:', sessionsError)
      throw sessionsError
    }

    // Get total count for pagination
    const { count } = await supabase
      .from('quiz_sessions')
      .select('*', { count: 'exact', head: true })
      .eq('echo_user_id', echoUserId)

    return NextResponse.json({
      sessions: sessions || [],
      total: count || 0,
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
