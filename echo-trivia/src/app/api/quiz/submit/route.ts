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

    // 3. Save quiz session
    const { data: session, error: sessionError } = await supabase
      .from('quiz_sessions')
      .insert({
        user_id: userId,
        echo_user_id,
        category,
        num_questions,
        correct_answers,
        total_questions,
        score_percentage,
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

    // 4. Update daily streak if this was a daily quiz
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

    // 5. Check and award achievements
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

    // 6. Fetch newly earned achievements
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

    // 7. Fetch updated streak
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
