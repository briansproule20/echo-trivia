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

    return NextResponse.json({ streak })
  } catch (error) {
    console.error('Error fetching streak:', error)
    return NextResponse.json(
      { error: 'Failed to fetch streak' },
      { status: 500 }
    )
  }
}
