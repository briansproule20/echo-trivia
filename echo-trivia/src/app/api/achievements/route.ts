import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

// GET /api/achievements - Get all achievements
export async function GET() {
  try {
    const supabase = await createClient()

    const { data: achievements, error } = await supabase
      .from('achievements')
      .select('*')
      .order('tier', { ascending: true })

    if (error) throw error

    return NextResponse.json({ achievements })
  } catch (error) {
    console.error('Error fetching achievements:', error)
    return NextResponse.json(
      { error: 'Failed to fetch achievements' },
      { status: 500 }
    )
  }
}
