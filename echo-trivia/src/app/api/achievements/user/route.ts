import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

// GET /api/achievements/user?echo_user_id=xxx
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

    // Get user achievements with achievement details
    const { data: userAchievements, error } = await supabase
      .from('user_achievements')
      .select(
        `
        *,
        achievement:achievements (*)
      `
      )
      .eq('echo_user_id', echoUserId)
      .order('earned_at', { ascending: false })

    if (error) throw error

    return NextResponse.json({ achievements: userAchievements || [] })
  } catch (error) {
    console.error('Error fetching user achievements:', error)
    return NextResponse.json(
      { error: 'Failed to fetch user achievements' },
      { status: 500 }
    )
  }
}
