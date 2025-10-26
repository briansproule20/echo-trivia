import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

// GET /api/achievements - Get all achievements ordered by tier difficulty
export async function GET() {
  try {
    const supabase = await createClient()

    const { data: achievements, error } = await supabase
      .from('achievements')
      .select('*')

    if (error) throw error

    // Sort by tier in correct order: bronze -> silver -> gold -> platinum
    const tierOrder = { bronze: 1, silver: 2, gold: 3, platinum: 4 }
    const sortedAchievements = achievements?.sort((a, b) => {
      return tierOrder[a.tier as keyof typeof tierOrder] - tierOrder[b.tier as keyof typeof tierOrder]
    }) || []

    return NextResponse.json({ achievements: sortedAchievements })
  } catch (error) {
    console.error('Error fetching achievements:', error)
    return NextResponse.json(
      { error: 'Failed to fetch achievements' },
      { status: 500 }
    )
  }
}
