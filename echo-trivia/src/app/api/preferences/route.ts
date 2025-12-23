import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { isSignedIn } from '@/echo'

// Default preferences (used when no record exists)
const DEFAULT_PREFERENCES = {
  difficulty: 'mixed',
  question_count: 5,
  preferred_tone: null,
  explanation_style: null,
  extras: {},
}

// GET /api/preferences?echo_user_id=xxx
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

    const { data: preferences, error } = await supabase
      .from('user_freeplay_preferences')
      .select('*')
      .eq('echo_user_id', echoUserId)
      .single()

    if (error && error.code !== 'PGRST116') {
      // PGRST116 is "not found", which is ok
      throw error
    }

    // Return stored preferences or defaults
    return NextResponse.json({
      preferences: preferences || { echo_user_id: echoUserId, ...DEFAULT_PREFERENCES },
    })
  } catch (error) {
    console.error('Error fetching preferences:', error)
    return NextResponse.json(
      { error: 'Failed to fetch preferences' },
      { status: 500 }
    )
  }
}

// Sentinel value to indicate "don't change this field"
const UNCHANGED = '__UNCHANGED__'

// PATCH /api/preferences - Update preferences (upsert)
export async function PATCH(request: NextRequest) {
  try {
    const signedIn = await isSignedIn()
    if (!signedIn) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { echo_user_id, difficulty, question_count, extras } = body

    if (!echo_user_id) {
      return NextResponse.json(
        { error: 'echo_user_id is required' },
        { status: 400 }
      )
    }

    // For nullable fields, use sentinel to distinguish "not provided" from "set to null"
    // - Field not in body → UNCHANGED (keep existing)
    // - Field is null → null (clear the value)
    // - Field has value → use that value
    const preferredTone = 'preferred_tone' in body ? body.preferred_tone : UNCHANGED
    const explanationStyle = 'explanation_style' in body ? body.explanation_style : UNCHANGED

    const supabase = await createClient()

    // Use the upsert RPC function
    const { data: preferences, error } = await supabase.rpc(
      'upsert_freeplay_preferences',
      {
        p_echo_user_id: echo_user_id,
        p_difficulty: difficulty || null,
        p_question_count: question_count || null,
        p_preferred_tone: preferredTone,
        p_explanation_style: explanationStyle,
        p_extras: extras || null,
      }
    )

    if (error) throw error

    return NextResponse.json({ preferences })
  } catch (error) {
    console.error('Error updating preferences:', error)
    return NextResponse.json(
      { error: 'Failed to update preferences' },
      { status: 500 }
    )
  }
}
