import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

// ELO-like Skill Index Algorithm
// Base rating: 1000
// K-factor varies by experience level
// Expected score based on difficulty
// Rating change = K * (actual - expected) + participation bonus

interface EloEntry {
  echo_user_id: string
  username: string | null
  avatar_url: string | null
  skill_rating: number
  total_quizzes: number
  avg_score: number
  rank: number
}

function calculateSkillRating(sessions: Array<{
  score_percentage: number
  difficulty: string | null
  num_questions: number
}>): number {
  if (sessions.length === 0) return 1000

  let rating = 1000

  // Expected scores by difficulty (what an "average" player should get)
  const difficultyExpected: Record<string, number> = {
    'easy': 0.75,
    'medium': 0.60,
    'hard': 0.45,
  }

  // Sort sessions by some consistent order (we'll process them in sequence)
  sessions.forEach((session, index) => {
    // K-factor decreases as you play more (more stable rating)
    // Start at 40, decrease to 16 after 30 games
    const k = Math.max(16, 40 - (index * 0.8))

    const difficulty = session.difficulty || 'medium'
    const expected = difficultyExpected[difficulty] || 0.60

    // Actual performance (0-1 scale)
    const actual = session.score_percentage / 100

    // Difficulty bonus: harder quizzes give more points for the same performance
    const difficultyMultiplier = difficulty === 'hard' ? 1.3 : difficulty === 'easy' ? 0.8 : 1.0

    // Base performance change
    const performanceChange = k * (actual - expected) * difficultyMultiplier

    // Question count bonus (more questions = more reliable score)
    const questionBonus = session.num_questions >= 10 ? 1.1 : session.num_questions >= 5 ? 1.0 : 0.9

    // Participation bonus: small reward for each quiz played
    // This ensures ratings differentiate even when scoring at expected level
    // Bonus decreases as you play more (diminishing returns)
    // First few games: ~2 points, later games: ~0.5 points
    const participationBonus = Math.max(0.5, 3 - (index * 0.1))

    // Performance bonus for doing well (above 50%)
    // This rewards consistent good play beyond just beating expected
    const performanceBonus = actual >= 0.70 ? 1.5 : actual >= 0.50 ? 0.5 : 0

    rating += (performanceChange * questionBonus) + participationBonus + performanceBonus
  })

  // Floor at 100, no ceiling
  return Math.max(100, Math.round(rating))
}

// GET /api/leaderboard/elo?limit=25&echo_user_id=xxx
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const limit = parseInt(searchParams.get('limit') || '25')
    const echoUserId = searchParams.get('echo_user_id')

    const supabase = await createClient()

    // Get ALL quiz sessions (not just daily) for ELO calculation
    const { data: sessions, error: sessionsError } = await supabase
      .from('quiz_sessions')
      .select('echo_user_id, score_percentage, difficulty, num_questions, completed_at')
      .order('completed_at', { ascending: true }) // Process in chronological order

    if (sessionsError) throw sessionsError

    if (!sessions || sessions.length === 0) {
      return NextResponse.json({ leaderboard: [], userPosition: null })
    }

    // Group sessions by user
    const userSessions: Record<string, Array<{
      score_percentage: number
      difficulty: string | null
      num_questions: number
    }>> = {}

    sessions.forEach((session) => {
      if (!userSessions[session.echo_user_id]) {
        userSessions[session.echo_user_id] = []
      }
      userSessions[session.echo_user_id].push({
        score_percentage: session.score_percentage,
        difficulty: session.difficulty,
        num_questions: session.num_questions,
      })
    })

    // Calculate ELO for each user
    let eloData = Object.entries(userSessions).map(([echoUserId, sessions]) => {
      const skillRating = calculateSkillRating(sessions)
      const avgScore = sessions.reduce((sum, s) => sum + s.score_percentage, 0) / sessions.length

      return {
        echo_user_id: echoUserId,
        skill_rating: skillRating,
        total_quizzes: sessions.length,
        avg_score: Math.round(avgScore * 100) / 100,
      }
    })

    // Filter: minimum 5 quizzes to appear on ELO leaderboard
    eloData = eloData.filter(entry => entry.total_quizzes >= 5)

    // Sort by skill rating (descending)
    eloData.sort((a, b) => b.skill_rating - a.skill_rating)

    // Add ranks
    const rankedData = eloData.map((entry, index) => ({
      ...entry,
      rank: index + 1,
    }))

    // Get top N
    const topN = rankedData.slice(0, limit)

    // Get user details
    const userIds = topN.map((e) => e.echo_user_id)
    const { data: users } = await supabase
      .from('users')
      .select('echo_user_id, username, avatar_url')
      .in('echo_user_id', userIds)

    const userMap = new Map(
      users?.map((u) => [u.echo_user_id, u]) || []
    )

    // Build final leaderboard
    const leaderboard: EloEntry[] = topN.map((entry) => {
      const user = userMap.get(entry.echo_user_id)
      return {
        echo_user_id: entry.echo_user_id,
        username: user?.username || null,
        avatar_url: user?.avatar_url || null,
        skill_rating: entry.skill_rating,
        total_quizzes: entry.total_quizzes,
        avg_score: entry.avg_score,
        rank: entry.rank,
      }
    })

    // Find user position if not in top N
    let userPosition: EloEntry | null = null
    if (echoUserId && !leaderboard.find(e => e.echo_user_id === echoUserId)) {
      const userEntry = rankedData.find(e => e.echo_user_id === echoUserId)
      if (userEntry) {
        const { data: userData } = await supabase
          .from('users')
          .select('echo_user_id, username, avatar_url')
          .eq('echo_user_id', echoUserId)
          .single()

        userPosition = {
          echo_user_id: echoUserId,
          username: userData?.username || null,
          avatar_url: userData?.avatar_url || null,
          skill_rating: userEntry.skill_rating,
          total_quizzes: userEntry.total_quizzes,
          avg_score: userEntry.avg_score,
          rank: userEntry.rank,
        }
      }
    }

    return NextResponse.json({ leaderboard, userPosition })
  } catch (error) {
    console.error('Error fetching ELO leaderboard:', error)
    return NextResponse.json(
      { error: 'Failed to fetch ELO leaderboard' },
      { status: 500 }
    )
  }
}
