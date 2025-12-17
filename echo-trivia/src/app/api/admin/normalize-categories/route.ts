import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/utils/supabase/service'
import { normalizeCategoryWithAliases } from '@/lib/normalize-category'

// POST /api/admin/normalize-categories - Normalize all category names in database
export async function POST(request: NextRequest) {
  try {
    // Simple auth check - you may want to add proper admin authentication
    const authHeader = request.headers.get('authorization')
    if (authHeader !== `Bearer ${process.env.ADMIN_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = createServiceClient()

    // Get all unique categories from quiz_sessions
    const { data: sessions, error: fetchError } = await supabase
      .from('quiz_sessions')
      .select('id, category')

    if (fetchError) throw fetchError

    // Group by normalized category
    const categoryMap = new Map<string, { original: string; normalized: string; ids: string[] }>()

    sessions?.forEach((session) => {
      const normalized = normalizeCategoryWithAliases(session.category)
      const key = normalized.toLowerCase()

      if (!categoryMap.has(key)) {
        categoryMap.set(key, {
          original: session.category,
          normalized,
          ids: [],
        })
      }
      categoryMap.get(key)!.ids.push(session.id)
    })

    // Find categories that need updating
    const updates: { from: string; to: string; count: number }[] = []

    for (const [, data] of categoryMap) {
      // Check if any sessions have the wrong casing
      const needsUpdate = sessions?.filter(
        (s) => s.category !== data.normalized &&
               normalizeCategoryWithAliases(s.category) === data.normalized
      )

      if (needsUpdate && needsUpdate.length > 0) {
        // Update all sessions with this category to the normalized version
        const { error: updateError } = await supabase
          .from('quiz_sessions')
          .update({ category: data.normalized })
          .in('id', needsUpdate.map((s) => s.id))

        if (updateError) {
          console.error(`Error updating category ${data.original}:`, updateError)
        } else {
          updates.push({
            from: needsUpdate[0].category,
            to: data.normalized,
            count: needsUpdate.length,
          })
        }
      }
    }

    // Also update quiz_questions table
    const { data: questions, error: questionsError } = await supabase
      .from('quiz_questions')
      .select('id, category')

    if (!questionsError && questions) {
      const questionUpdates: { id: string; category: string }[] = []

      questions.forEach((q) => {
        const normalized = normalizeCategoryWithAliases(q.category)
        if (q.category !== normalized) {
          questionUpdates.push({ id: q.id, category: normalized })
        }
      })

      // Batch update questions
      for (const update of questionUpdates) {
        await supabase
          .from('quiz_questions')
          .update({ category: update.category })
          .eq('id', update.id)
      }
    }

    return NextResponse.json({
      success: true,
      updates,
      message: `Normalized ${updates.reduce((sum, u) => sum + u.count, 0)} quiz sessions`,
    })
  } catch (error) {
    console.error('Error normalizing categories:', error)
    return NextResponse.json(
      { error: 'Failed to normalize categories' },
      { status: 500 }
    )
  }
}

// GET /api/admin/normalize-categories - Preview what would be normalized
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    if (authHeader !== `Bearer ${process.env.ADMIN_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = createServiceClient()

    // Get all unique categories
    const { data: sessions, error } = await supabase
      .from('quiz_sessions')
      .select('category')

    if (error) throw error

    // Find duplicates/variations
    const categoryGroups = new Map<string, Set<string>>()

    sessions?.forEach((s) => {
      const normalized = normalizeCategoryWithAliases(s.category)
      const key = normalized.toLowerCase()

      if (!categoryGroups.has(key)) {
        categoryGroups.set(key, new Set())
      }
      categoryGroups.get(key)!.add(s.category)
    })

    // Filter to only groups with variations
    const duplicates: { normalized: string; variations: string[] }[] = []

    for (const [, variations] of categoryGroups) {
      if (variations.size > 1) {
        const varArray = Array.from(variations)
        duplicates.push({
          normalized: normalizeCategoryWithAliases(varArray[0]),
          variations: varArray,
        })
      }
    }

    return NextResponse.json({
      duplicates,
      totalCategories: categoryGroups.size,
      categoriesWithVariations: duplicates.length,
    })
  } catch (error) {
    console.error('Error checking categories:', error)
    return NextResponse.json(
      { error: 'Failed to check categories' },
      { status: 500 }
    )
  }
}
