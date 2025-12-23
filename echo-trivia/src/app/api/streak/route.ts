import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

// GET /api/streak?echo_user_id=xxx
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

    const { data: streak, error } = await supabase
      .from('daily_streaks')
      .select('*')
      .eq('echo_user_id', echoUserId)
      .single()

    if (error && error.code !== 'PGRST116') {
      // PGRST116 is "not found", which is ok
      throw error
    }

    // If no streak exists, return default values
    if (!streak) {
      return NextResponse.json({
        streak: {
          current_streak: 0,
          longest_streak: 0,
          last_completed_date: null,
        },
      })
    }

    // Check if streak is still valid (last completed was today or yesterday)
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    const lastCompleted = streak.last_completed_date
      ? new Date(streak.last_completed_date + 'T00:00:00')
      : null

    // If last completed is older than yesterday, streak is broken
    const isStreakValid = lastCompleted && lastCompleted >= yesterday

    return NextResponse.json({
      streak: {
        ...streak,
        current_streak: isStreakValid ? streak.current_streak : 0,
      }
    })
  } catch (error) {
    console.error('Error fetching streak:', error)
    return NextResponse.json(
      { error: 'Failed to fetch streak' },
      { status: 500 }
    )
  }
}
