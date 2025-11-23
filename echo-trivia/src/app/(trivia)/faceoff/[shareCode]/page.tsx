'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, Swords, AlertCircle, ArrowRight } from 'lucide-react'
import { Session } from '@/lib/types'
import { generateId } from '@/lib/utils'
import { storage } from '@/lib/storage'
import { usePlayStore } from '@/lib/store'

interface FaceoffChallenge {
  id: string
  creator_echo_user_id: string
  creator_username: string | null
  quiz_data: any // The Quiz object stored as JSONB
  settings: {
    category: string
    difficulty: string
    num_questions: number
    quiz_type: string
  }
  share_code: string
  times_played: number
  expires_at: string | null
  created_at: string
}

export default function FaceoffChallengePage() {
  const params = useParams()
  const router = useRouter()
  const shareCode = params.shareCode as string

  const [challenge, setChallenge] = useState<FaceoffChallenge | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadChallenge() {
      try {
        setLoading(true)
        setError(null)

        const response = await fetch(`/api/faceoff/${shareCode}`)
        const data = await response.json()

        if (!response.ok) {
          if (response.status === 404) {
            setError('Challenge not found. The share code may be invalid.')
          } else if (response.status === 410) {
            setError('This challenge has expired.')
          } else {
            setError(data.error || 'Failed to load challenge')
          }
          return
        }

        setChallenge(data.challenge)
      } catch (err) {
        console.error('Error loading faceoff challenge:', err)
        setError('Failed to load challenge. Please try again.')
      } finally {
        setLoading(false)
      }
    }

    if (shareCode) {
      loadChallenge()
    }
  }, [shareCode])

  const handleStartChallenge = async () => {
    if (!challenge) return

    // Create a new session with the challenge's quiz data
    const session: Session = {
      id: generateId(),
      quiz: challenge.quiz_data, // Use the stored quiz
      startedAt: new Date().toISOString(),
      submissions: [],
      gameMode: 'faceoff',
    }

    // Store in IndexedDB for proper persistence
    await storage.saveSession(session)

    // Navigate to play page
    router.push(`/play/${session.id}`)
  }

  if (loading) {
    return (
      <div className="container max-w-2xl mx-auto px-4 py-12">
        <div className="flex flex-col items-center justify-center space-y-4 min-h-[400px]">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading challenge...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container max-w-2xl mx-auto px-4 py-12">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <div className="mt-6 text-center">
          <Button onClick={() => router.push('/game-modes')} variant="outline">
            Back to Game Modes
          </Button>
        </div>
      </div>
    )
  }

  if (!challenge) {
    return null
  }

  return (
    <div className="container max-w-2xl mx-auto px-4 py-12">
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-2">
            <Swords className="h-8 w-8 text-primary" />
            <h1 className="text-3xl sm:text-4xl font-bold">Faceoff Challenge</h1>
          </div>
          <p className="text-muted-foreground">
            {challenge.creator_username
              ? `Challenge from ${challenge.creator_username}`
              : 'Challenge from a friend'}
          </p>
        </div>

        {/* Challenge Details Card */}
        <Card className="p-6 space-y-4">
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Category</span>
              <span className="font-medium">{challenge.settings.category}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Questions</span>
              <span className="font-medium">{challenge.settings.num_questions}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Difficulty</span>
              <span className="font-medium capitalize">{challenge.settings.difficulty}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Type</span>
              <span className="font-medium capitalize">{challenge.settings.quiz_type}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Times Played</span>
              <span className="font-medium">{challenge.times_played}</span>
            </div>
          </div>
        </Card>

        {/* Info Alert */}
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            You&apos;ll face the exact same questions as the challenge creator. Compare your scores when you&apos;re done!
          </AlertDescription>
        </Alert>

        {/* Start Button */}
        <Button
          onClick={handleStartChallenge}
          className="w-full"
          size="lg"
        >
          Start Challenge
          <ArrowRight className="ml-2 h-5 w-5" />
        </Button>
      </div>
    </div>
  )
}
