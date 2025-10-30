import type { Session } from './types'
import type { SaveQuizSessionRequest } from './supabase-types'

/**
 * Submit a completed quiz session to Supabase
 * Returns newly earned achievements and updated streak
 */
export async function submitQuizToSupabase(
  session: Session,
  echoUserId: string,
  echoUserName?: string | null,
  sessionId?: string
): Promise<{
  success: boolean
  newAchievements?: any[]
  streak?: any
  error?: string
}> {
  try {
    const correct = session.submissions.filter((s) => s.correct).length
    const total = session.quiz.questions.length
    const percentage = (correct / total) * 100

    // Calculate total time taken
    const timeTaken = session.endedAt && session.startedAt
      ? Math.floor(
          (new Date(session.endedAt).getTime() - new Date(session.startedAt).getTime()) / 1000
        )
      : undefined

    // Extract daily date if it's a daily quiz
    const dailyDate = session.quiz.seeded && session.quiz.description
      ? session.quiz.description.match(/^(\d{4}-\d{2}-\d{2})/)?.[1]
      : undefined

    // Infer difficulty
    const difficulties = session.quiz.questions.map(q => q.difficulty)
    const uniqueDifficulties = [...new Set(difficulties)]
    const difficulty = uniqueDifficulties.length > 1 ? 'mixed' : difficulties[0]

    // Infer question type
    const types = session.quiz.questions.map(q => q.type)
    const uniqueTypes = [...new Set(types)]
    const type = uniqueTypes.length > 1 ? 'mixed' : types[0]

    const payload: SaveQuizSessionRequest = {
      echo_user_id: echoUserId,
      echo_user_name: echoUserName,
      category: session.quiz.category,
      num_questions: total,
      correct_answers: correct,
      total_questions: total,
      score_percentage: percentage,
      difficulty,
      quiz_type: type,
      is_daily: session.quiz.seeded || false,
      daily_date: dailyDate,
      title: session.earnedTitle,
      time_taken: timeTaken,
      session_id: sessionId,
    }

    const response = await fetch('/api/quiz/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      const error = await response.json()
      console.error('Failed to submit quiz to Supabase:', error)
      return { success: false, error: error.error || 'Failed to submit quiz' }
    }

    const data = await response.json()
    return {
      success: true,
      newAchievements: data.newAchievements || [],
      streak: data.streak,
    }
  } catch (error) {
    console.error('Error submitting quiz to Supabase:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}
