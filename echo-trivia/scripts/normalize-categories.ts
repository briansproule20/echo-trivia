/**
 * One-time script to normalize category names in the database.
 * Run with: npx tsx scripts/normalize-categories.ts
 */

import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { resolve } from 'path'

// Load environment variables from .env.local
const envPath = resolve(__dirname, '../.env.local')
const envContent = readFileSync(envPath, 'utf-8')
const envVars: Record<string, string> = {}

envContent.split('\n').forEach((line) => {
  const match = line.match(/^([^=]+)=(.*)$/)
  if (match) {
    envVars[match[1].trim()] = match[2].trim().replace(/^["']|["']$/g, '')
  }
})

const supabaseUrl = envVars['NEXT_PUBLIC_SUPABASE_URL']
const supabaseServiceKey = envVars['SUPABASE_SERVICE_ROLE_KEY']

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

// Normalize function
function normalizeCategory(category: string): string {
  if (!category) return category

  const trimmed = category.trim().replace(/\s+/g, ' ')

  return trimmed
    .toLowerCase()
    .split(' ')
    .map((word, index) => {
      const lowercaseWords = ['a', 'an', 'the', 'and', 'but', 'or', 'for', 'nor', 'on', 'at', 'to', 'by', 'of', 'in']
      if (index > 0 && lowercaseWords.includes(word)) {
        return word
      }
      return word.charAt(0).toUpperCase() + word.slice(1)
    })
    .join(' ')
}

async function main() {
  console.log('🔍 Fetching all quiz sessions...')

  const { data: sessions, error } = await supabase
    .from('quiz_sessions')
    .select('id, category')

  if (error) {
    console.error('Error fetching sessions:', error)
    process.exit(1)
  }

  console.log(`📊 Found ${sessions.length} total sessions`)

  // Group by original category
  const categoryCount = new Map<string, number>()
  sessions.forEach((s) => {
    categoryCount.set(s.category, (categoryCount.get(s.category) || 0) + 1)
  })

  console.log('\n📋 Current categories:')
  const sortedCategories = Array.from(categoryCount.entries()).sort((a, b) => b[1] - a[1])
  sortedCategories.forEach(([cat, count]) => {
    const normalized = normalizeCategory(cat)
    const needsFix = cat !== normalized ? ' ⚠️' : ''
    console.log(`  ${cat} (${count})${needsFix}`)
  })

  // Find sessions that need updating
  const updates: { id: string; from: string; to: string }[] = []

  sessions.forEach((s) => {
    const normalized = normalizeCategory(s.category)
    if (s.category !== normalized) {
      updates.push({ id: s.id, from: s.category, to: normalized })
    }
  })

  if (updates.length === 0) {
    console.log('\n✅ All categories are already normalized!')
    return
  }

  console.log(`\n🔧 Found ${updates.length} sessions to update:`)

  // Group updates by transformation
  const transformations = new Map<string, number>()
  updates.forEach((u) => {
    const key = `"${u.from}" → "${u.to}"`
    transformations.set(key, (transformations.get(key) || 0) + 1)
  })

  transformations.forEach((count, transform) => {
    console.log(`  ${transform} (${count} sessions)`)
  })

  // Perform updates
  console.log('\n⏳ Updating...')

  for (const update of updates) {
    const { error: updateError } = await supabase
      .from('quiz_sessions')
      .update({ category: update.to })
      .eq('id', update.id)

    if (updateError) {
      console.error(`  ❌ Failed to update ${update.id}:`, updateError.message)
    }
  }

  console.log(`\n✅ Done! Updated ${updates.length} sessions.`)

  // Also update quiz_questions table
  console.log('\n🔍 Checking quiz_questions table...')

  const { data: questions, error: qError } = await supabase
    .from('quiz_questions')
    .select('id, category')

  if (qError) {
    console.error('Error fetching questions:', qError)
  } else if (questions) {
    const qUpdates = questions.filter((q) => q.category !== normalizeCategory(q.category))

    if (qUpdates.length > 0) {
      console.log(`🔧 Updating ${qUpdates.length} questions...`)

      for (const q of qUpdates) {
        await supabase
          .from('quiz_questions')
          .update({ category: normalizeCategory(q.category) })
          .eq('id', q.id)
      }

      console.log('✅ Questions updated!')
    } else {
      console.log('✅ All questions already normalized!')
    }
  }
}

main().catch(console.error)
