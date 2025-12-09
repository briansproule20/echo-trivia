import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/utils/supabase/service'

// GET /api/quiz/answers/[quizId] - Fetch answers for a quiz
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ quizId: string }> }
) {
  try {
    const { quizId } = await params

    if (!quizId) {
      return NextResponse.json({ error: 'Quiz ID required' }, { status: 400 })
    }

    const supabase = createServiceClient()

    const { data, error } = await supabase
      .from('quiz_answer_keys')
      .select('answers')
      .eq('quiz_id', quizId)
      .single()

    if (error || !data) {
      return NextResponse.json({ error: 'Answers not found' }, { status: 404 })
    }

    return NextResponse.json({ answers: data.answers })
  } catch (error) {
    console.error('Error fetching answers:', error)
    return NextResponse.json({ error: 'Failed to fetch answers' }, { status: 500 })
  }
}
