import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import type { LeaderboardEntry } from '@/lib/supabase-types'

// GET /api/leaderboard?period=all&category=Science&limit=25&echo_user_id=xxx
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const period = searchParams.get('period') || 'all' // 'all', 'daily', 'weekly', 'monthly'
    const category = searchParams.get('category')
    const limit = parseInt(searchParams.get('limit') || '25')
    const echoUserId = searchParams.get('echo_user_id')

    const supabase = await createClient()

    // Build query
    let query = supabase
      .from('quiz_sessions')
      .select('echo_user_id, score_percentage, completed_at, category')

    // Filter by category if specified
    if (category) {
      query = query.eq('category', category)
    }

    // Filter by time period
    const now = new Date()
    if (period === 'daily') {
      const startOfDay = new Date(now.setHours(0, 0, 0, 0)).toISOString()
      query = query.gte('completed_at', startOfDay)
    } else if (period === 'weekly') {
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString()
      query = query.gte('completed_at', weekAgo)
    } else if (period === 'monthly') {
      const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString()
      query = query.gte('completed_at', monthAgo)
    }

    const { data: sessions, error: sessionsError } = await query

    if (sessionsError) throw sessionsError

    if (!sessions || sessions.length === 0) {
      return NextResponse.json({ leaderboard: [] })
    }

    // Group by user and calculate average score
    const userScores: Record<
      string,
      { totalScore: number; count: number; sessions: any[] }
    > = {}

    sessions.forEach((session) => {
      if (!userScores[session.echo_user_id]) {
        userScores[session.echo_user_id] = {
          totalScore: 0,
          count: 0,
          sessions: [],
        }
      }
      userScores[session.echo_user_id].totalScore += session.score_percentage
      userScores[session.echo_user_id].count += 1
      userScores[session.echo_user_id].sessions.push(session)
    })

    // Calculate average scores and create leaderboard entries
    const leaderboardData = Object.entries(userScores).map(
      ([echoUserId, data]) => ({
        echo_user_id: echoUserId,
        score: data.totalScore / data.count,
        total_quizzes: data.count,
      })
    )

    // Sort by score descending
    leaderboardData.sort((a, b) => b.score - a.score)

    // Take top N and add ranks
    const topN = leaderboardData.slice(0, limit).map((entry, index) => ({
      ...entry,
      rank: index + 1,
    }))

    // Get user details for the top N
    const userIds = topN.map((e) => e.echo_user_id)
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('echo_user_id, username, avatar_url')
      .in('echo_user_id', userIds)

    if (usersError) {
      console.error('Error fetching user details:', usersError)
      // Continue without user details
    }

    // Create a map of user details
    const userMap = new Map(
      users?.map((u) => [u.echo_user_id, u]) || []
    )

    // Build final leaderboard with user details
    const leaderboard: LeaderboardEntry[] = topN.map((entry) => {
      const user = userMap.get(entry.echo_user_id)
      return {
        echo_user_id: entry.echo_user_id,
        username: user?.username || null,
        avatar_url: user?.avatar_url || null,
        score: Math.round(entry.score * 100) / 100,
        rank: entry.rank,
        total_quizzes: entry.total_quizzes,
      }
    })

    // If a specific user is requested and not in top N, find their position
    let userPosition: LeaderboardEntry | null = null
    if (echoUserId && !leaderboard.find(e => e.echo_user_id === echoUserId)) {
      const userEntry = leaderboardData.find(e => e.echo_user_id === echoUserId)
      if (userEntry) {
        const userRank = leaderboardData.findIndex(e => e.echo_user_id === echoUserId) + 1
        const { data: userData } = await supabase
          .from('users')
          .select('echo_user_id, username, avatar_url')
          .eq('echo_user_id', echoUserId)
          .single()

        userPosition = {
          echo_user_id: echoUserId,
          username: userData?.username || null,
          avatar_url: userData?.avatar_url || null,
          score: Math.round(userEntry.score * 100) / 100,
          rank: userRank,
          total_quizzes: userEntry.total_quizzes,
        }
      }
    }

    return NextResponse.json({ leaderboard, userPosition })
  } catch (error) {
    console.error('Error fetching leaderboard:', error)
    return NextResponse.json(
      { error: 'Failed to fetch leaderboard' },
      { status: 500 }
    )
  }
}
