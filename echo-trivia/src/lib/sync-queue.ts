import { storage } from './storage'
import { submitQuizToSupabase } from './supabase-helpers'
import type { Session } from './types'

export interface PendingSubmission {
  id: string
  session: Session
  userId: string
  userName: string | null
  timestamp: number
  attempts: number
}

const PENDING_SUBMISSIONS_KEY = 'pending_quiz_submissions'

/**
 * Get all pending quiz submissions from localStorage
 */
export async function getPendingSubmissions(): Promise<PendingSubmission[]> {
  try {
    const json = localStorage.getItem(PENDING_SUBMISSIONS_KEY)
    return json ? JSON.parse(json) : []
  } catch (error) {
    console.error('Error reading pending submissions:', error)
    return []
  }
}

/**
 * Save pending submissions to localStorage
 */
async function savePendingSubmissions(submissions: PendingSubmission[]): Promise<void> {
  try {
    localStorage.setItem(PENDING_SUBMISSIONS_KEY, JSON.stringify(submissions))
  } catch (error) {
    console.error('Error saving pending submissions:', error)
  }
}

/**
 * Add a quiz submission to the retry queue
 */
export async function queueQuizSubmission(
  session: Session,
  userId: string,
  userName: string | null,
  sessionId: string
): Promise<void> {
  const queue = await getPendingSubmissions()

  // Check if already queued
  if (queue.some(p => p.id === sessionId)) {
    console.log('Submission already queued:', sessionId)
    return
  }

  queue.push({
    id: sessionId,
    session,
    userId,
    userName,
    timestamp: Date.now(),
    attempts: 0
  })

  await savePendingSubmissions(queue)
  console.log('📥 Queued quiz submission for later:', sessionId)
}

/**
 * Remove a submission from the queue
 */
async function removePendingSubmission(sessionId: string): Promise<void> {
  const queue = await getPendingSubmissions()
  const filtered = queue.filter(p => p.id !== sessionId)
  await savePendingSubmissions(filtered)
}

/**
 * Process all pending submissions
 * Should be called on app load when user is online
 */
export async function processPendingSubmissions(): Promise<void> {
  const queue = await getPendingSubmissions()

  if (queue.length === 0) {
    return
  }

  console.log(`📤 Processing ${queue.length} pending quiz submission(s)...`)

  const remainingQueue: PendingSubmission[] = []

  for (const pending of queue) {
    // Skip if too many attempts (max 10 total attempts)
    if (pending.attempts >= 10) {
      console.warn('⚠️ Skipping submission after 10 failed attempts:', pending.id)
      continue
    }

    const result = await submitQuizToSupabase(
      pending.session,
      pending.userId,
      pending.userName,
      pending.id
    )

    if (result.success) {
      console.log('✅ Successfully synced pending submission:', pending.id)

      // Store achievements for this session
      localStorage.setItem(
        `quiz_results_${pending.id}`,
        JSON.stringify({
          newAchievements: result.newAchievements,
          streak: result.streak,
        })
      )
    } else {
      // Keep in queue, increment attempts
      pending.attempts++
      remainingQueue.push(pending)
      console.log(`⚠️ Failed to sync submission (attempt ${pending.attempts}):`, pending.id)
    }
  }

  // Update queue with remaining items
  await savePendingSubmissions(remainingQueue)

  if (remainingQueue.length > 0) {
    console.log(`📥 ${remainingQueue.length} submission(s) still pending`)
  }
}

/**
 * Submit quiz with automatic retry logic
 * Tries 3 times with exponential backoff, then queues for later
 */
export async function submitWithRetry(
  session: Session,
  userId: string,
  userName: string | null,
  sessionId: string,
  maxAttempts = 3
): Promise<void> {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const result = await submitQuizToSupabase(session, userId, userName, sessionId)

      if (result.success) {
        console.log('✅ Quiz submitted successfully')

        // Store achievements for results page
        localStorage.setItem(
          `quiz_results_${sessionId}`,
          JSON.stringify({
            newAchievements: result.newAchievements,
            streak: result.streak,
          })
        )
        return // Success! Exit function
      }

      // API returned error
      console.warn(`⚠️ Submission failed: ${result.error}`)
    } catch (error) {
      // Network error or other exception
      console.error(`⚠️ Submission error (attempt ${attempt}/${maxAttempts}):`, error)
    }

    // If not last attempt, wait before retrying
    if (attempt < maxAttempts) {
      const delayMs = 1000 * attempt // 1s, 2s exponential backoff
      console.log(`⏳ Retrying in ${delayMs}ms...`)
      await new Promise(resolve => setTimeout(resolve, delayMs))
    }
  }

  // All retries failed - queue for later
  console.warn(`❌ Failed to submit after ${maxAttempts} attempts, queuing for later`)
  await queueQuizSubmission(session, userId, userName, sessionId)
}
