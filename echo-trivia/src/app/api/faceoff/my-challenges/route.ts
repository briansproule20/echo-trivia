import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export interface FaceoffChallengeSummary {
  id: string
  share_code: string
  creator_echo_user_id: string
  creator_username: string | null
  creator_score: number | null
  creator_title: string | null
  settings: {
    category: string
    difficulty: string
    num_questions: number
    quiz_type: string
  }
  times_played: number
  created_at: string
  expires_at: string
}

// GET /api/faceoff/challenges - Get all faceoff challenges with optional filtering
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const echoUserId = searchParams.get('echo_user_id') // Current user for "mine" filter
    const filter = searchParams.get('filter') // 'all' | 'mine'
    const category = searchParams.get('category')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    const supabase = await createClient()

    // Build query for non-expired challenges
    let query = supabase
      .from('faceoff_challenges')
      .select(`
        id,
        share_code,
        creator_echo_user_id,
        creator_username,
        creator_score,
        creator_title,
        settings,
        times_played,
        created_at,
        expires_at
      `)
      .gt('expires_at', new Date().toISOString())

    // Apply filter for user's own challenges
    if (filter === 'mine' && echoUserId) {
      query = query.eq('creator_echo_user_id', echoUserId)
    }

    // Apply category filter
    if (category) {
      query = query.eq('settings->>category', category)
    }

    // Order by most recently created and apply pagination
    const { data: challenges, error, count } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) {
      console.error('Error fetching challenges:', error)
      throw error
    }

    // Get total count for pagination
    let countQuery = supabase
      .from('faceoff_challenges')
      .select('id', { count: 'exact', head: true })
      .gt('expires_at', new Date().toISOString())

    if (filter === 'mine' && echoUserId) {
      countQuery = countQuery.eq('creator_echo_user_id', echoUserId)
    }

    if (category) {
      countQuery = countQuery.eq('settings->>category', category)
    }

    const { count: totalCount } = await countQuery

    return NextResponse.json({
      challenges: challenges || [],
      total: totalCount || 0,
      limit,
      offset,
    })
  } catch (error) {
    console.error('Error fetching faceoff challenges:', error)
    return NextResponse.json(
      {
        error: 'Failed to fetch challenges',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
