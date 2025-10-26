import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import type { UserStats } from '@/lib/supabase-types'

// GET /api/user/stats?echo_user_id=xxx
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const echoUserId = searchParams.get('echo_user_id')

    if (!echoUserId) {
      return NextResponse.json(
        { error: 'echo_user_id is required' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Get all quiz sessions for this user
    const { data: sessions, error: sessionsError } = await supabase
      .from('quiz_sessions')
      .select('*')
      .eq('echo_user_id', echoUserId)

    if (sessionsError) throw sessionsError

    if (!sessions || sessions.length === 0) {
      // No stats yet
      const emptyStats: UserStats = {
        echo_user_id: echoUserId,
        total_quizzes: 0,
        correct_answers: 0,
        total_questions: 0,
        accuracy_rate: 0,
        average_score: 0,
        perfect_scores: 0,
        categories_played: [],
        total_time_played: 0,
        favorite_category: null,
        best_category: null,
      }
      return NextResponse.json({ stats: emptyStats })
    }

    // Calculate stats
    const totalQuizzes = sessions.length
    const correctAnswers = sessions.reduce(
      (sum, s) => sum + s.correct_answers,
      0
    )
    const totalQuestions = sessions.reduce(
      (sum, s) => sum + s.total_questions,
      0
    )
    const accuracyRate =
      totalQuestions > 0 ? (correctAnswers / totalQuestions) * 100 : 0
    const averageScore =
      sessions.reduce((sum, s) => sum + s.score_percentage, 0) / totalQuizzes
    const perfectScores = sessions.filter(
      (s) => s.score_percentage === 100
    ).length
    const totalTimePlayed = sessions.reduce(
      (sum, s) => sum + (s.time_taken || 0),
      0
    )

    // Get unique categories
    const categoriesPlayed = Array.from(
      new Set(sessions.map((s) => s.category))
    )

    // Find favorite category (most played)
    const categoryCount: Record<string, number> = {}
    sessions.forEach((s) => {
      categoryCount[s.category] = (categoryCount[s.category] || 0) + 1
    })
    const favoriteCategory =
      Object.entries(categoryCount).sort((a, b) => b[1] - a[1])[0]?.[0] || null

    // Find best category (highest average score)
    const categoryScores: Record<string, number[]> = {}
    sessions.forEach((s) => {
      if (!categoryScores[s.category]) categoryScores[s.category] = []
      categoryScores[s.category].push(s.score_percentage)
    })
    const categoryAverages = Object.entries(categoryScores).map(
      ([cat, scores]) => ({
        category: cat,
        average: scores.reduce((a, b) => a + b, 0) / scores.length,
      })
    )
    const bestCategory =
      categoryAverages.sort((a, b) => b.average - a.average)[0]?.category ||
      null

    const stats: UserStats = {
      echo_user_id: echoUserId,
      total_quizzes: totalQuizzes,
      correct_answers: correctAnswers,
      total_questions: totalQuestions,
      accuracy_rate: Math.round(accuracyRate * 100) / 100,
      average_score: Math.round(averageScore * 100) / 100,
      perfect_scores: perfectScores,
      categories_played: categoriesPlayed,
      total_time_played: totalTimePlayed,
      favorite_category: favoriteCategory,
      best_category: bestCategory,
    }

    return NextResponse.json({ stats })
  } catch (error) {
    console.error('Error fetching user stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch user stats' },
      { status: 500 }
    )
  }
}
