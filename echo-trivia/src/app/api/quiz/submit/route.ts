import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { isSignedIn } from '@/echo'
import type { SaveQuizSessionRequest } from '@/lib/supabase-types'

// POST /api/quiz/submit - Save a completed quiz session
export async function POST(request: NextRequest) {
  try {
    const signedIn = await isSignedIn()
    if (!signedIn) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body: SaveQuizSessionRequest = await request.json()

    const {
      echo_user_id,
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

    // 1. Ensure user exists
    const { data: userId, error: userError } = await supabase.rpc(
      'get_or_create_user',
      {
        p_echo_user_id: echo_user_id,
        p_username: null,
      }
    )

    if (userError) {
      console.error('Error creating/getting user:', userError)
      throw userError
    }

    // 2. Save quiz session
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

    // 3. Update daily streak if this was a daily quiz
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

    // 4. Check and award achievements
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

    // 5. Fetch newly earned achievements
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

    // 6. Fetch updated streak
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
    return NextResponse.json(
      { error: 'Failed to submit quiz' },
      { status: 500 }
    )
  }
}
