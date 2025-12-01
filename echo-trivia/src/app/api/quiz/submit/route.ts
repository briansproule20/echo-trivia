import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { createServiceClient } from '@/utils/supabase/service'
import { isSignedIn } from '@/echo'
import type { SaveQuizSessionRequest } from '@/lib/supabase-types'

// Type for server-side evaluation record
interface ServerEvaluation {
  question_id: string
  user_response: string
  is_correct: boolean
}

// Type for answer key from database
interface AnswerKey {
  question_id: string
  answer: string
  type: string
  explanation: string
}

// Get server-side evaluations for a quiz
async function getServerEvaluations(quizId: string): Promise<ServerEvaluation[]> {
  const supabase = createServiceClient()

  const { data, error } = await supabase
    .from('quiz_evaluations')
    .select('question_id, user_response, is_correct')
    .eq('quiz_id', quizId)

  if (error) {
    console.error('Failed to fetch server evaluations:', error)
    return []
  }

  return data || []
}

// Get answer keys for storing question data
async function getAnswerKeys(quizId: string): Promise<AnswerKey[]> {
  const supabase = createServiceClient()

  const { data, error } = await supabase
    .from('quiz_answer_keys')
    .select('answers')
    .eq('quiz_id', quizId)
    .single()

  if (error || !data) {
    console.error('Failed to fetch answer keys:', error)
    return []
  }

  return data.answers as AnswerKey[]
}

// POST /api/quiz/submit - Save a completed quiz session
export async function POST(request: NextRequest) {
  try {
    console.log('=== Quiz Submit API Called ===')
    const signedIn = await isSignedIn()
    console.log('User signed in:', signedIn)
    if (!signedIn) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body: SaveQuizSessionRequest = await request.json()
    console.log('Request body:', JSON.stringify(body, null, 2))

    const {
      echo_user_id,
      echo_user_name,
      category,
      num_questions,
      correct_answers,
      total_questions,
      score_percentage,
      difficulty,
      quiz_type,
      is_daily = false,
      daily_date,
      title,
      time_taken,
      session_id,
      game_mode,
      submissions,
      questions,
    } = body

    // Validate required fields
    if (
      !echo_user_id ||
      !category ||
      num_questions === undefined ||
      correct_answers === undefined ||
      total_questions === undefined ||
      score_percentage === undefined
    ) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // 1. Check for duplicate submission (if session_id is provided)
    if (session_id) {
      const thirtySecondsAgo = new Date(Date.now() - 30000).toISOString()
      const { data: recentSubmissions, error: checkError } = await supabase
        .from('quiz_sessions')
        .select('id, completed_at, score_percentage, correct_answers')
        .eq('echo_user_id', echo_user_id)
        .eq('category', category)
        .eq('num_questions', num_questions)
        .eq('score_percentage', score_percentage)
        .eq('correct_answers', correct_answers)
        .gte('completed_at', thirtySecondsAgo)
        .limit(1)

      if (checkError) {
        console.error('Error checking for duplicates:', checkError)
        // Continue with submission even if check fails
      } else if (recentSubmissions && recentSubmissions.length > 0) {
        console.log('Duplicate submission detected, returning existing session')
        // Return the existing submission data
        const existingSession = recentSubmissions[0]

        // Still fetch achievements and streak data
        const { data: newAchievements } = await supabase
          .from('user_achievements')
          .select(`*, achievement:achievements (*)`)
          .eq('echo_user_id', echo_user_id)
          .gte('earned_at', new Date(Date.now() - 5000).toISOString())

        const { data: streak } = await supabase
          .from('daily_streaks')
          .select('*')
          .eq('echo_user_id', echo_user_id)
          .single()

        return NextResponse.json({
          session: existingSession,
          newAchievements: newAchievements || [],
          streak: streak || null,
          duplicate: true,
        })
      }
    }

    // 2. Ensure user exists (pass Echo name as default username)
    const { data: userId, error: userError } = await supabase.rpc(
      'get_or_create_user',
      {
        p_echo_user_id: echo_user_id,
        p_username: echo_user_name || null,
      }
    )

    if (userError) {
      console.error('Error creating/getting user:', userError)
      throw userError
    }

    // 3. SECURITY: Get score from SERVER-SIDE evaluations only
    // We do NOT trust any scores or is_correct flags from the client
    const serverEvaluations = await getServerEvaluations(session_id || '')
    const answerKeys = await getAnswerKeys(session_id || '')

    // Build validated submissions from SERVER data
    let validatedSubmissions: Array<{
      question_id: string
      user_response: string
      correct_answer: string
      is_correct: boolean
      time_ms?: number
    }> = []

    if (serverEvaluations.length > 0) {
      // Create a map of answer keys for quick lookup
      const answerKeyMap = new Map(answerKeys.map((k) => [k.question_id, k]))

      // Build submissions from server evaluations (the source of truth)
      validatedSubmissions = serverEvaluations.map((evalResult) => {
        const answerKey = answerKeyMap.get(evalResult.question_id)
        // Find client submission for time_ms only (optional data)
        const clientSub = submissions?.find((s) => s.question_id === evalResult.question_id)

        return {
          question_id: evalResult.question_id,
          user_response: evalResult.user_response,
          correct_answer: answerKey?.answer || '',
          is_correct: evalResult.is_correct, // FROM SERVER, not client
          time_ms: clientSub?.time_ms, // Time is non-critical, can use client value
        }
      })

      console.log(
        `📊 Server evaluations found: ${serverEvaluations.length} questions evaluated`
      )
    } else if (submissions && submissions.length > 0) {
      // Fallback: No server evaluations found (maybe old quiz before security update)
      // In this case, we'll still validate but log a warning
      console.warn(
        `⚠️ No server evaluations found for quiz ${session_id}. Using client submissions with validation.`
      )

      // For backwards compatibility, do basic validation on client submissions
      const answerKeyMap = new Map(answerKeys.map((k) => [k.question_id, k]))

      validatedSubmissions = submissions.map((sub) => {
        const answerKey = answerKeyMap.get(sub.question_id)
        if (answerKey) {
          // Re-validate using server-stored answer
          const userAnswer = sub.user_response.trim().toLowerCase()
          const correctAnswer = answerKey.answer.trim().toLowerCase()
          const isCorrect = userAnswer === correctAnswer

          return {
            ...sub,
            correct_answer: answerKey.answer,
            is_correct: isCorrect,
          }
        }
        // No answer key found - can't validate, mark as incorrect for safety
        return { ...sub, is_correct: false }
      })
    }

    // Calculate score from SERVER-VALIDATED data only
    const validatedCorrectAnswers = validatedSubmissions.filter((s) => s.is_correct).length
    const validatedScorePercentage = total_questions > 0
      ? Math.round((validatedCorrectAnswers / total_questions) * 100)
      : 0

    // Log discrepancies between client-reported and server-calculated scores
    if (validatedCorrectAnswers !== correct_answers) {
      console.warn(
        `🚨 Score discrepancy! Client reported ${correct_answers} correct, server calculated ${validatedCorrectAnswers} correct`
      )
    }
    if (validatedScorePercentage !== score_percentage) {
      console.warn(
        `🚨 Score percentage discrepancy! Client: ${score_percentage}%, Server: ${validatedScorePercentage}%`
      )
    }

    // 4. Save quiz session
    const { data: session, error: sessionError } = await supabase
      .from('quiz_sessions')
      .insert({
        user_id: userId,
        echo_user_id,
        category,
        num_questions,
        correct_answers: validatedCorrectAnswers,
        total_questions,
        score_percentage: validatedScorePercentage,
        difficulty: difficulty || null,
        quiz_type: quiz_type || null,
        is_daily,
        daily_date: daily_date || null,
        title: title || null,
        time_taken: time_taken || null,
        game_mode: game_mode || (is_daily ? 'daily' : 'practice'),
      })
      .select()
      .single()

    if (sessionError) {
      console.error('Error saving quiz session:', sessionError)
      throw sessionError
    }

    // 5. Save individual submissions to database (use VALIDATED submissions)
    if (validatedSubmissions && validatedSubmissions.length > 0 && session?.id) {
      const submissionRecords = validatedSubmissions.map((sub) => ({
        session_id: session.id,
        question_id: sub.question_id,
        user_response: sub.user_response,
        correct_answer: sub.correct_answer,
        is_correct: sub.is_correct, // This is now server-validated
        time_ms: sub.time_ms || null,
      }))

      const { error: submissionsError } = await supabase
        .from('quiz_submissions')
        .insert(submissionRecords)

      if (submissionsError) {
        console.error('Error saving quiz submissions:', submissionsError)
        // Don't fail the whole request, but log the error
        // The session is already saved at this point
      }
    }

    // 5b. Save full question data for history review
    // Use SERVER-SIDE answer keys for correct answers, not client-provided data
    if (questions && questions.length > 0 && session?.id) {
      // Create a map of answer keys for correct answers
      const answerKeyMap = new Map(answerKeys.map((k) => [k.question_id, k]))

      const questionRecords = questions.map((q, index) => {
        const answerKey = answerKeyMap.get(q.id)
        return {
          session_id: session.id,
          question_id: q.id,
          question_type: q.type,
          category: q.category,
          difficulty: q.difficulty || null,
          prompt: q.prompt,
          choices: q.choices || null,
          // SECURITY: Use server-stored answer, not client-provided
          correct_answer: answerKey?.answer || q.answer || '',
          explanation: answerKey?.explanation || q.explanation || null,
          question_order: index,
        }
      })

      const { error: questionsError } = await supabase
        .from('quiz_questions')
        .insert(questionRecords)

      if (questionsError) {
        console.error('Error saving quiz questions:', questionsError)
        // Don't fail the whole request, but log the error
      }
    }

    // 6. Update daily streak if this was a daily quiz
    if (is_daily && daily_date) {
      const { error: streakError } = await supabase.rpc('update_daily_streak', {
        p_echo_user_id: echo_user_id,
        p_completed_date: daily_date,
      })

      if (streakError) {
        console.error('Error updating streak:', streakError)
        // Don't fail the whole request if streak update fails
      }
    }

    // 7. Check and award achievements
    const { error: achievementError } = await supabase.rpc(
      'check_and_award_achievements',
      {
        p_echo_user_id: echo_user_id,
      }
    )

    if (achievementError) {
      console.error('Error checking achievements:', achievementError)
      // Don't fail the whole request if achievement check fails
    }

    // 8. Fetch newly earned achievements
    const { data: newAchievements } = await supabase
      .from('user_achievements')
      .select(
        `
        *,
        achievement:achievements (*)
      `
      )
      .eq('echo_user_id', echo_user_id)
      .gte('earned_at', new Date(Date.now() - 5000).toISOString()) // Earned in last 5 seconds

    // 9. Fetch updated streak
    const { data: streak } = await supabase
      .from('daily_streaks')
      .select('*')
      .eq('echo_user_id', echo_user_id)
      .single()

    return NextResponse.json({
      session,
      newAchievements: newAchievements || [],
      streak: streak || null,
    })
  } catch (error) {
    console.error('Error submitting quiz:', error)
    console.error('Error details:', error instanceof Error ? error.message : error)
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace')
    return NextResponse.json(
      { 
        error: 'Failed to submit quiz',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
