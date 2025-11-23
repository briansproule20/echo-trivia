import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

// GET /api/faceoff/[shareCode] - Fetch a challenge by share code
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ shareCode: string }> }
) {
  try {
    const { shareCode } = await params

    if (!shareCode) {
      return NextResponse.json({ error: 'Share code is required' }, { status: 400 })
    }

    const supabase = await createClient()

    // Fetch challenge by share code
    const { data: challenge, error } = await supabase
      .from('faceoff_challenges')
      .select('*')
      .eq('share_code', shareCode)
      .single()

    if (error || !challenge) {
      return NextResponse.json({ error: 'Challenge not found' }, { status: 404 })
    }

    // Check if expired
    if (challenge.expires_at) {
      const expiresAt = new Date(challenge.expires_at)
      if (expiresAt < new Date()) {
        return NextResponse.json({ error: 'Challenge has expired' }, { status: 410 })
      }
    }

    // Increment times_played counter
    await supabase
      .from('faceoff_challenges')
      .update({ times_played: (challenge.times_played || 0) + 1 })
      .eq('id', challenge.id)

    return NextResponse.json({ challenge })
  } catch (error) {
    console.error('Error fetching faceoff challenge:', error)
    return NextResponse.json(
      { error: 'Failed to fetch challenge' },
      { status: 500 }
    )
  }
}
