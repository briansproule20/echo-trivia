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
        daily_quizzes_completed: 0,
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
    const dailyQuizzesCompleted = sessions.filter(
      (s) => s.is_daily === true
    ).length
    const faceoffCount = sessions.filter(
      (s) => s.game_mode === 'faceoff'
    ).length
    const totalTimePlayed = sessions.reduce(
      (sum, s) => sum + (s.time_taken || 0),
      0
    )

    // Get unique categories (exclude "Mixed" which is survival mode)
    const categoriesPlayed = Array.from(
      new Set(sessions.map((s) => s.category))
    ).filter(cat => cat !== 'Mixed')

    // Find favorite category (most played) - exclude "Mixed" (survival mode)
    const categoryCount: Record<string, number> = {}
    sessions.forEach((s) => {
      if (s.category !== 'Mixed') {
        categoryCount[s.category] = (categoryCount[s.category] || 0) + 1
      }
    })
    const favoriteCategory =
      Object.entries(categoryCount).sort((a, b) => b[1] - a[1])[0]?.[0] || null

    // Find best category (highest average score) - exclude "Mixed" (survival mode)
    const categoryScores: Record<string, number[]> = {}
    sessions.forEach((s) => {
      if (s.category !== 'Mixed') {
        if (!categoryScores[s.category]) categoryScores[s.category] = []
        categoryScores[s.category].push(s.score_percentage)
      }
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

    // Prepare data for charts
    // Category performance (for radial bar chart) - INCLUDE ALL CATEGORIES
    const categoryPerformance = categoryAverages.map(cat => ({
      category: cat.category,
      score: cat.average, // NO ROUNDING - keep exact score
      count: categoryCount[cat.category] || 0
    }))

    // Category mastery heatmap data
    const categoryMastery = Object.entries(categoryScores).map(([cat, scores]) => {
      const avgScore = scores.reduce((a, b) => a + b, 0) / scores.length
      const count = categoryCount[cat] || 0
      let mastery = 'struggling'
      if (count >= 5 && avgScore >= 90) mastery = 'master'
      else if (count >= 3 && avgScore >= 75) mastery = 'advanced'
      else if (count >= 2 && avgScore >= 60) mastery = 'intermediate'
      else if (avgScore >= 50) mastery = 'beginner'

      return {
        category: cat,
        avgScore: Math.round(avgScore * 100) / 100,
        count: count,
        mastery: mastery,
        lastPlayed: sessions.filter(s => s.category === cat).sort((a, b) =>
          new Date(b.completed_at).getTime() - new Date(a.completed_at).getTime()
        )[0]?.completed_at || null
      }
    }).sort((a, b) => b.avgScore - a.avgScore)

    // Activity by day of week (for heatmap)
    const dayOfWeekActivity: Record<number, { count: number; avgScore: number; totalScore: number }> = {}
    sessions.forEach(s => {
      const dayOfWeek = new Date(s.completed_at).getDay()
      if (!dayOfWeekActivity[dayOfWeek]) {
        dayOfWeekActivity[dayOfWeek] = { count: 0, avgScore: 0, totalScore: 0 }
      }
      dayOfWeekActivity[dayOfWeek].count++
      dayOfWeekActivity[dayOfWeek].totalScore += s.score_percentage
    })
    Object.keys(dayOfWeekActivity).forEach(day => {
      const dayNum = parseInt(day)
      dayOfWeekActivity[dayNum].avgScore =
        dayOfWeekActivity[dayNum].totalScore / dayOfWeekActivity[dayNum].count
    })

    // Radar chart data - multi-dimensional performance metrics
    const avgTimePerQuiz = sessions.length > 0 ? sessions.reduce((sum, s) => sum + (s.time_taken || 0), 0) / sessions.length : 0
    // Invert speed score - faster is better, so lower time = higher score
    const speedScore = avgTimePerQuiz > 0 ? Math.max(0, 100 - Math.min((avgTimePerQuiz / 60) * 10, 100)) : 0

    // Consistency based on score variance - lower variance = more consistent
    const scoreVariance = sessions.length > 1
      ? Math.sqrt(sessions.reduce((sum, s) => sum + Math.pow(s.score_percentage - averageScore, 2), 0) / sessions.length)
      : 0
    const consistencyScore = scoreVariance > 0 ? Math.max(0, 100 - scoreVariance) : averageScore

    // Diversity: ratio of unique categories to total quizzes (100 = all unique, 0 = all same)
    const diversityScore = sessions.length > 0
      ? (categoriesPlayed.length / sessions.length) * 100
      : 0

    const radarData = [
      { metric: 'Speed', value: speedScore },
      { metric: 'Accuracy', value: accuracyRate },
      { metric: 'Consistency', value: consistencyScore },
      { metric: 'Diversity', value: diversityScore },
      { metric: 'Avg Score', value: averageScore },
    ]

    // Score trend over time (last 20 sessions for area chart)
    // Exclude faceoff and survival (endless) sessions
    // Sort sessions by completion date to ensure chronological order
    const sortedSessions = [...sessions]
      .filter(s => s.game_mode !== 'faceoff' && s.game_mode !== 'endless')
      .sort((a, b) =>
        new Date(a.completed_at).getTime() - new Date(b.completed_at).getTime()
      )
    const scoreTrend = sortedSessions
      .slice(-20)
      .map((s, index) => ({
        session: index + 1,
        score: s.score_percentage,
        date: s.completed_at,
        category: s.category
      }))

    // Difficulty vs performance scatter plot
    const difficultyPerformance = sessions.map(s => ({
      difficulty: s.difficulty || 'medium',
      score: s.score_percentage,
      category: s.category,
      timeTaken: s.time_taken || 0
    }))

    // Daily activity heatmap data (last 365 days)
    const dailyActivityMap: Record<string, { count: number; avgScore: number; totalScore: number }> = {}
    sessions.forEach(s => {
      const dateKey = new Date(s.completed_at).toISOString().split('T')[0]
      if (!dailyActivityMap[dateKey]) {
        dailyActivityMap[dateKey] = { count: 0, avgScore: 0, totalScore: 0 }
      }
      dailyActivityMap[dateKey].count++
      dailyActivityMap[dateKey].totalScore += s.score_percentage
    })
    // Calculate averages
    Object.keys(dailyActivityMap).forEach(date => {
      dailyActivityMap[date].avgScore = dailyActivityMap[date].totalScore / dailyActivityMap[date].count
    })

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
      daily_quizzes_completed: dailyQuizzesCompleted,
    }

    return NextResponse.json({
      stats,
      categoryCount,
      categoryPerformance,
      categoryMastery,
      dayOfWeekActivity,
      radarData,
      scoreTrend,
      difficultyPerformance,
      faceoffCount,
      dailyActivityMap
    })
  } catch (error) {
    console.error('Error fetching user stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch user stats' },
      { status: 500 }
    )
  }
}
