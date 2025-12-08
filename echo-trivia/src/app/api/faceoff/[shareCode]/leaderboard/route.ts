import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export interface FaceoffLeaderboardEntry {
  echo_user_id: string
  username: string | null
  avatar_id: string | null
  score: number
  score_percentage: number
  time_taken: number | null
  completed_at: string
  rank: number
}

// GET /api/faceoff/[shareCode]/leaderboard - Get leaderboard for a specific faceoff challenge
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ shareCode: string }> }
) {
  try {
    const { shareCode } = await params
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '25')

    if (!shareCode) {
      return NextResponse.json({ error: 'Missing shareCode' }, { status: 400 })
    }

    const supabase = await createClient()

    // First verify the challenge exists
    const { data: challenge, error: challengeError } = await supabase
      .from('faceoff_challenges')
      .select('id, creator_echo_user_id, creator_username, creator_score, creator_title, settings')
      .eq('share_code', shareCode)
      .single()

    if (challengeError || !challenge) {
      return NextResponse.json({ error: 'Challenge not found' }, { status: 404 })
    }

    // Get all sessions for this faceoff challenge, ordered by score and time
    const { data: sessions, error: sessionsError } = await supabase
      .from('quiz_sessions')
      .select(`
        echo_user_id,
        correct_answers,
        total_questions,
        score_percentage,
        time_taken,
        completed_at
      `)
      .eq('faceoff_share_code', shareCode)
      .eq('game_mode', 'faceoff')
      .order('score_percentage', { ascending: false })
      .order('time_taken', { ascending: true, nullsFirst: false })
      .limit(limit)

    if (sessionsError) {
      console.error('Error fetching sessions:', sessionsError)
      throw sessionsError
    }

    // Get unique user IDs for username lookup
    const userIds = [...new Set(sessions?.map(s => s.echo_user_id) || [])]

    // Include creator if they're not in the sessions
    if (!userIds.includes(challenge.creator_echo_user_id)) {
      userIds.push(challenge.creator_echo_user_id)
    }

    // Fetch usernames
    const { data: users } = await supabase
      .from('users')
      .select('echo_user_id, username, avatar_id')
      .in('echo_user_id', userIds)

    const userMap = new Map(users?.map(u => [u.echo_user_id, u]) || [])

    // Build leaderboard entries
    const leaderboard: FaceoffLeaderboardEntry[] = (sessions || []).map((session, index) => {
      const user = userMap.get(session.echo_user_id)
      return {
        echo_user_id: session.echo_user_id,
        username: user?.username || null,
        avatar_id: user?.avatar_id || null,
        score: session.correct_answers,
        score_percentage: session.score_percentage,
        time_taken: session.time_taken,
        completed_at: session.completed_at,
        rank: index + 1,
      }
    })

    // Add creator's entry if not already in leaderboard
    const creatorInLeaderboard = leaderboard.some(e => e.echo_user_id === challenge.creator_echo_user_id)
    const creatorEntry = creatorInLeaderboard ? null : {
      echo_user_id: challenge.creator_echo_user_id,
      username: challenge.creator_username,
      avatar_id: userMap.get(challenge.creator_echo_user_id)?.avatar_id || null,
      score: challenge.creator_score || 0,
      score_percentage: challenge.settings?.num_questions
        ? Math.round((challenge.creator_score || 0) / challenge.settings.num_questions * 100)
        : 0,
      time_taken: null,
      completed_at: null,
      rank: 0, // Creator rank is always shown separately
      isCreator: true,
    }

    return NextResponse.json({
      leaderboard,
      creator: {
        echo_user_id: challenge.creator_echo_user_id,
        username: challenge.creator_username,
        score: challenge.creator_score,
        title: challenge.creator_title,
      },
      creatorEntry,
      totalPlayers: (sessions?.length || 0) + 1, // +1 for creator
    })
  } catch (error) {
    console.error('Error fetching faceoff leaderboard:', error)
    return NextResponse.json(
      {
        error: 'Failed to fetch leaderboard',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
