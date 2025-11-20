import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { isSignedIn } from '@/echo'
import type { SaveQuizSessionRequest } from '@/lib/supabase-types'

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
      submissions,
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

    // 3. Validate submissions if provided - RE-VALIDATE ON SERVER
    let validatedCorrectAnswers = correct_answers
    let validatedScorePercentage = score_percentage
    let validatedSubmissions = submissions

    if (submissions && submissions.length > 0) {
      // CRITICAL: Re-validate each answer on the server by comparing responses
      // Do NOT trust the is_correct flag from the client!
      validatedSubmissions = submissions.map((sub) => {
        // Normalize both answers for comparison (trim, lowercase)
        const userAnswer = sub.user_response.trim().toLowerCase()
        const correctAnswer = sub.correct_answer.trim().toLowerCase()

        // Re-evaluate if the answer is correct
        const actuallyCorrect = userAnswer === correctAnswer

        // Log if client lied about correctness
        if (actuallyCorrect !== sub.is_correct) {
          console.warn(
            `Answer validation mismatch for question ${sub.question_id}:`,
            `Client said ${sub.is_correct}, but actual is ${actuallyCorrect}`,
            `User: "${userAnswer}" vs Correct: "${correctAnswer}"`
          )
        }

        return {
          ...sub,
          is_correct: actuallyCorrect // Override with server validation
        }
      })

      // Recalculate score from SERVER-VALIDATED submissions
      const actualCorrectCount = validatedSubmissions.filter((s) => s.is_correct).length
      const actualScorePercentage = Math.round(
        (actualCorrectCount / total_questions) * 100
      )

      // Log discrepancies
      if (actualCorrectCount !== correct_answers) {
        console.warn(
          `Score mismatch detected! Client reported ${correct_answers} correct, but server validation shows ${actualCorrectCount} correct`
        )
      }

      // Use server-validated values
      validatedCorrectAnswers = actualCorrectCount
      validatedScorePercentage = actualScorePercentage
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
