import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { isSignedIn } from '@/echo'

// GET /api/user/profile?echo_user_id=xxx
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

    // Get user profile
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('echo_user_id', echoUserId)
      .single()

    if (userError && userError.code !== 'PGRST116') {
      // PGRST116 is "not found", which is ok
      throw userError
    }

    return NextResponse.json({
      user: user || null,
    })
  } catch (error) {
    console.error('Error fetching user profile:', error)
    return NextResponse.json(
      { error: 'Failed to fetch user profile' },
      { status: 500 }
    )
  }
}

// POST /api/user/profile - Create or update user profile
export async function POST(request: NextRequest) {
  try {
    const signedIn = await isSignedIn()
    if (!signedIn) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { echo_user_id, username, avatar_url, avatar_id } = body

    if (!echo_user_id) {
      return NextResponse.json(
        { error: 'echo_user_id is required' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Use the get_or_create_user function
    const { data: userId, error: functionError } = await supabase.rpc(
      'get_or_create_user',
      {
        p_echo_user_id: echo_user_id,
        p_username: username || null,
      }
    )

    if (functionError) throw functionError

    // If username, avatar_url, or avatar_id provided, update the user
    if (username || avatar_url || avatar_id) {
      const updateData: any = { updated_at: new Date().toISOString() }
      if (username) updateData.username = username
      if (avatar_url) updateData.avatar_url = avatar_url
      if (avatar_id) updateData.avatar_id = avatar_id

      const { error: updateError } = await supabase
        .from('users')
        .update(updateData)
        .eq('id', userId)

      if (updateError) throw updateError
    }

    // Fetch and return updated user
    const { data: user, error: fetchError } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single()

    if (fetchError) throw fetchError

    return NextResponse.json({ user })
  } catch (error) {
    console.error('Error creating/updating user profile:', error)
    return NextResponse.json(
      { error: 'Failed to create/update user profile' },
      { status: 500 }
    )
  }
}
