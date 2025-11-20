import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

// GET /api/user/category-history?echo_user_id=xxx&category=xxx
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const echoUserId = searchParams.get('echo_user_id')
    const category = searchParams.get('category')

    if (!echoUserId || !category) {
      return NextResponse.json(
        { error: 'echo_user_id and category are required' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Get all quiz sessions for this user in this category
    const { data: quizzes, error } = await supabase
      .from('quiz_sessions')
      .select('*')
      .eq('echo_user_id', echoUserId)
      .eq('category', category)
      .order('completed_at', { ascending: false })

    if (error) throw error

    return NextResponse.json({ quizzes: quizzes || [] })
  } catch (error) {
    console.error('Error fetching category history:', error)
    return NextResponse.json(
      { error: 'Failed to fetch category history' },
      { status: 500 }
    )
  }
}
