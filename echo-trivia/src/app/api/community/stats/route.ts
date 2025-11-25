import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

// GET /api/community/stats - Get community-wide statistics
export async function GET() {
  try {
    const supabase = await createClient()

    // Get total correct answers across ALL users and ALL game modes
    const { data, error } = await supabase
      .from('quiz_sessions')
      .select('correct_answers')

    if (error) throw error

    // Count total users from users table
    const { count: totalUsers, error: usersError } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })

    if (usersError) console.error('Error counting users:', usersError)

    const totalCorrectAnswers = data?.reduce((sum, session) => sum + (session.correct_answers || 0), 0) || 0

    // Calculate current tier and progress
    const tiers = [
      { level: 1, goal: 0, name: 'Initiate' },
      { level: 2, goal: 1000, name: 'Novice' },
      { level: 3, goal: 10000, name: 'Apprentice' },
      { level: 4, goal: 100000, name: 'Adept' },
      { level: 5, goal: 1000000, name: 'Master' },
      { level: 6, goal: 10000000, name: 'Grand Master' },
    ]

    let currentTier = tiers[0]
    let nextTier = tiers[1]
    let progress = 0

    for (let i = 0; i < tiers.length; i++) {
      if (totalCorrectAnswers >= tiers[i].goal) {
        currentTier = tiers[i]
        nextTier = tiers[i + 1] || null
      } else {
        nextTier = tiers[i]
        break
      }
    }

    // Calculate progress to next tier
    if (nextTier) {
      const previousGoal = currentTier.level === 1 ? 0 : currentTier.goal
      const progressToNext = totalCorrectAnswers - previousGoal
      const tierRange = nextTier.goal - previousGoal
      progress = (progressToNext / tierRange) * 100
    } else {
      // Max tier reached
      progress = 100
    }

    return NextResponse.json({
      totalCorrectAnswers,
      totalUsers: totalUsers || 0,
      currentTier: nextTier ? currentTier : tiers[tiers.length - 1],
      nextTier,
      progress: Math.min(progress, 100),
      allTiers: tiers,
    })
  } catch (error) {
    console.error('Error fetching community stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch community stats' },
      { status: 500 }
    )
  }
}
