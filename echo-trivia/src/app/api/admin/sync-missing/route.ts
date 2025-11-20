import { NextRequest, NextResponse } from 'next/server'
import { isSignedIn } from '@/echo'

// POST /api/admin/sync-missing - Get IndexedDB sessions as payload and submit missing ones
export async function POST(request: NextRequest) {
  try {
    const signedIn = await isSignedIn()
    if (!signedIn) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { sessions } = await request.json()

    if (!sessions || !Array.isArray(sessions)) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
    }

    // Find completed sessions that might be missing from DB
    const completedSessions = sessions.filter((s: any) => s.endedAt)

    return NextResponse.json({
      message: 'Found completed sessions',
      count: completedSessions.length,
      sessions: completedSessions.map((s: any) => ({
        id: s.id,
        category: s.quiz.category,
        score: s.score,
        total: s.quiz.questions.length,
        percentage: Math.round((s.score / s.quiz.questions.length) * 100),
        endedAt: s.endedAt
      }))
    })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
