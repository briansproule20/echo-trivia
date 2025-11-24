'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useEcho } from '@merit-systems/echo-react-sdk'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Loader2, Swords, AlertCircle, ArrowRight, AlertTriangle, LogIn } from 'lucide-react'
import { Logo } from '@/components/logo'
import { Session } from '@/lib/types'
import { generateId } from '@/lib/quiz-utils'
import { storage } from '@/lib/storage'

interface FaceoffChallenge {
  id: string
  creator_echo_user_id: string
  creator_username: string | null
  creator_score: number | null
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
  const echo = useEcho()

  const [challenge, setChallenge] = useState<FaceoffChallenge | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showSignInModal, setShowSignInModal] = useState(false)
  const [username, setUsername] = useState('')
  const [isSigningIn, setIsSigningIn] = useState(false)
  const [isSavingUsername, setIsSavingUsername] = useState(false)

  const isSignedIn = !!echo.user
  const hasShortAnswerQuestions = challenge?.settings.quiz_type === 'short_answer'

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

  // Set default username from Echo user name when signed in
  useEffect(() => {
    if (echo.user?.name && !username) {
      setUsername(echo.user.name)
    }
  }, [echo.user?.name])

  const handleSignIn = async () => {
    setIsSigningIn(true)
    try {
      await echo.signIn()
    } catch (err) {
      console.error('Sign in error:', err)
    } finally {
      setIsSigningIn(false)
    }
  }

  const handleSaveUsername = async () => {
    if (!echo.user?.id || !username.trim()) return

    setIsSavingUsername(true)
    try {
      await fetch('/api/user/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          echo_user_id: echo.user.id,
          username: username.trim(),
        }),
      })
      setShowSignInModal(false)
      handleStartChallenge(true)
    } catch (err) {
      console.error('Error saving username:', err)
    } finally {
      setIsSavingUsername(false)
    }
  }

  const handleStartChallenge = async (authenticated: boolean = isSignedIn) => {
    if (!challenge) return

    // Create a new session with the challenge's quiz data
    const session: Session = {
      id: generateId(),
      quiz: challenge.quiz_data,
      startedAt: new Date().toISOString(),
      submissions: [],
      gameMode: 'faceoff',
      // Store auth state for answer evaluation
      isAuthenticated: authenticated,
      // Store faceoff challenge info for results comparison
      faceoffChallenge: {
        shareCode: challenge.share_code,
        creatorUsername: challenge.creator_username,
        creatorScore: challenge.creator_score,
      },
    }

    // Store in IndexedDB for proper persistence
    await storage.saveSession(session)

    // Navigate to play page
    router.push(`/play/${session.id}`)
  }

  const handleStartButtonClick = () => {
    if (!isSignedIn) {
      setShowSignInModal(true)
    } else {
      handleStartChallenge(true)
    }
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
            <h1 className="text-3xl sm:text-4xl font-bold">Faceoff Accepted</h1>
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
              <span className="font-medium capitalize">{challenge.settings.quiz_type.replace(/_/g, ' ')}</span>
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

        {/* Auth Status / Sign In Prompt */}
        {!isSignedIn && (
          <Alert variant="default" className="border-amber-500/50 bg-amber-500/10">
            <AlertTriangle className="h-4 w-4 text-amber-500" />
            <AlertDescription className="text-amber-200">
              <span className="font-medium">Playing as guest.</span> Sign in to save your progress, appear on leaderboards, and unlock AI-powered answer matching for short answer questions.
            </AlertDescription>
          </Alert>
        )}

        {/* Start Button */}
        <Button
          onClick={handleStartButtonClick}
          className="w-full"
          size="lg"
        >
          {isSignedIn ? 'Start Challenge' : 'Continue'}
          <ArrowRight className="ml-2 h-5 w-5" />
        </Button>
      </div>

      {/* Sign In Modal */}
      <Dialog open={showSignInModal} onOpenChange={setShowSignInModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Logo className="h-6 w-6" />
              Sign in to Play
            </DialogTitle>
            <DialogDescription>
              Your Echo account is your Trivia Wizard account. Sign in to save your progress and access all features.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {!isSignedIn ? (
              <>
                {/* Sign In Button */}
                <Button
                  onClick={handleSignIn}
                  disabled={isSigningIn}
                  className="w-full"
                  size="lg"
                >
                  {isSigningIn ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <LogIn className="mr-2 h-4 w-4" />
                  )}
                  Sign in with Echo
                </Button>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">or</span>
                  </div>
                </div>

                {/* Continue Without Signing In */}
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowSignInModal(false)
                    handleStartChallenge(false)
                  }}
                  className="w-full"
                >
                  Play as Guest
                </Button>

                <p className="text-xs text-muted-foreground text-center">
                  Guest progress won&apos;t be saved.{hasShortAnswerQuestions && ' Short answers require exact text matches.'}
                </p>
              </>
            ) : (
              <>
                {/* Username Setup */}
                <div className="space-y-2">
                  <Label htmlFor="username">Choose your username</Label>
                  <Input
                    id="username"
                    placeholder="Enter username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    This will appear on leaderboards and challenges you create.
                  </p>
                </div>

                <Button
                  onClick={handleSaveUsername}
                  disabled={isSavingUsername || !username.trim()}
                  className="w-full"
                  size="lg"
                >
                  {isSavingUsername ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : null}
                  Start Challenge
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
