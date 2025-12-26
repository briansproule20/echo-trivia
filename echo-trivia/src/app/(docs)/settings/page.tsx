'use client'

import { useEffect, useState } from 'react'
import { useEcho } from '@merit-systems/echo-react-sdk'
import { Badge } from '@/components/ui/badge'
import { DotBackground } from '@/components/ui/dot-background'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Edit2, Check, X, Settings, Sparkles, Palette, Eye, SlidersHorizontal, Monitor, Sun, Moon, Skull, Ghost, Cat, Swords, Shield, Target, Glasses, TreePine, Flame, Zap, Crown, Anchor, Bird, Bug, Snowflake, Cherry } from 'lucide-react'
import { useTheme } from 'next-themes'
import { useFontStore, useQuizPreferencesStore, type FontFamily, type AvatarId } from '@/lib/store'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { AnimatedGradientText } from '@/components/ui/animated-gradient-text'

// Provider logo component using models.dev CDN
function ProviderLogo({ provider, className }: { provider: string; className?: string }) {
  return (
    <img
      alt={`${provider} logo`}
      className={`${className || 'size-4'} dark:invert [.reaper_&]:invert`}
      height={16}
      width={16}
      src={`https://models.dev/logos/${provider}.svg`}
    />
  )
}

const AI_MODELS = [
  { id: 'claude-sonnet-4-20250514', name: 'Claude Sonnet 4', provider: 'anthropic', isDefault: true, available: true },
  { id: 'claude-haiku-4-5-20251001', name: 'Claude Haiku 4.5', provider: 'anthropic', available: false },
  { id: 'claude-sonnet-4-5-20250929', name: 'Claude Sonnet 4.5', provider: 'anthropic', available: false },
  { id: 'claude-opus-4-20250514', name: 'Claude Opus 4', provider: 'anthropic', available: false },
  { id: 'claude-opus-4-1-20250805', name: 'Claude Opus 4.1', provider: 'anthropic', available: false },
  { id: 'gpt-4o', name: 'GPT-4o', provider: 'openai', available: false },
  { id: 'gpt-4o-mini', name: 'GPT-4o Mini', provider: 'openai', available: false },
  { id: 'gpt-5-pro', name: 'GPT-5 Pro', provider: 'openai', available: false },
  { id: 'gpt-5-nano', name: 'GPT-5 Nano', provider: 'openai', available: false },
  { id: 'gemini-3', name: 'Gemini 3', provider: 'google', available: false },
  { id: 'grok-3', name: 'Grok 3', provider: 'xai', available: false },
  { id: 'grok-3-mini', name: 'Grok 3 Mini', provider: 'xai', available: false },
  { id: 'grok-4', name: 'Grok 4', provider: 'xai', available: false },
  { id: 'grok-4.1-mini', name: 'Grok 4.1 Mini', provider: 'xai', available: false },
  { id: 'llama-4', name: 'Llama 4', provider: 'llama', available: false },
] as const

const THEMES = [
  { id: 'light', name: 'Light', icon: Sun, description: 'Classic light mode' },
  { id: 'dark', name: 'Dark', icon: Moon, description: 'Easy on the eyes' },
  { id: 'paperwhite', name: 'Paperwhite', icon: null, description: 'Kindle-inspired e-ink look', image: '/triviawizard_favicon_paperwhite_stippled.png' },
  { id: 'dullform', name: 'Dullform', icon: null, description: 'Parshendi dullform aesthetic', image: '/triviawizard_favicon_paperwhite_stippled_detail.png' },
  { id: 'reaper', name: 'Reaper', icon: null, description: 'Hail Libertas, hail Reaper', image: '/reaper.png' },
  { id: 'rivendell', name: 'Rivendell', icon: null, description: 'The last homely house east of the sea', image: '/rivendell.png' },
] as const

const FONTS = [
  { id: 'sans' as FontFamily, name: 'Sans Serif', description: 'Clean and modern (Geist)', preview: 'Aa' },
  { id: 'serif' as FontFamily, name: 'Serif', description: 'Classic and elegant (Garamond)', preview: 'Aa' },
  { id: 'dyslexic' as FontFamily, name: 'Dyslexic', description: 'Easier reading (OpenDyslexic)', preview: 'Aa' },
  { id: 'tech' as FontFamily, name: 'Tech', description: 'Futuristic and robotic (Orbitron)', preview: 'Aa' },
] as const

const AVATAR_ICONS = {
  skull: Skull,
  ghost: Ghost,
  cat: Cat,
  swords: Swords,
  shield: Shield,
  target: Target,
  glasses: Glasses,
  tree: TreePine,
  flame: Flame,
  zap: Zap,
  crown: Crown,
  anchor: Anchor,
  bird: Bird,
  bug: Bug,
  snowflake: Snowflake,
  cherry: Cherry,
} as const

const AVATARS = [
  { id: 'skull' as AvatarId, name: 'Skull' },
  { id: 'ghost' as AvatarId, name: 'Ghost' },
  { id: 'cat' as AvatarId, name: 'Cat' },
  { id: 'swords' as AvatarId, name: 'Swords' },
  { id: 'shield' as AvatarId, name: 'Shield' },
  { id: 'target' as AvatarId, name: 'Target' },
  { id: 'glasses' as AvatarId, name: 'Glasses' },
  { id: 'tree' as AvatarId, name: 'Tree' },
  { id: 'flame' as AvatarId, name: 'Flame' },
  { id: 'zap' as AvatarId, name: 'Zap' },
  { id: 'crown' as AvatarId, name: 'Crown' },
  { id: 'anchor' as AvatarId, name: 'Anchor' },
  { id: 'bird' as AvatarId, name: 'Bird' },
  { id: 'bug' as AvatarId, name: 'Bug' },
  { id: 'snowflake' as AvatarId, name: 'Snowflake' },
  { id: 'cherry' as AvatarId, name: 'Cherry' },
] as const

const DIFFICULTIES = [
  { id: 'easy', name: 'Easy' },
  { id: 'medium', name: 'Medium' },
  { id: 'hard', name: 'Hard' },
  { id: 'mixed', name: 'Mixed' },
] as const

const QUESTION_COUNTS = [
  { id: 5, name: '5 Questions' },
  { id: 10, name: '10 Questions' },
] as const

const TONES = [
  { id: 'scholarly', name: 'Scholarly', description: 'Academic and informative' },
  { id: 'playful', name: 'Playful', description: 'Fun and lighthearted' },
  { id: 'cinematic', name: 'Cinematic', description: 'Dramatic and storytelling' },
  { id: 'pub_quiz', name: 'Pub Quiz', description: 'Casual and social' },
  { id: 'deadpan', name: 'Deadpan', description: 'Dry and witty' },
  { id: 'sports_banter', name: 'Sports Banter', description: 'Energetic commentary' },
] as const

const EXPLANATION_STYLES = [
  { id: 'one_line_fact', name: 'Quick Fact', description: 'Brief one-liner' },
  { id: 'compare_contrast', name: 'Compare', description: 'Why right vs wrong' },
  { id: 'mini_story', name: 'Mini Story', description: 'Short narrative' },
  { id: 'why_wrong', name: 'Why Wrong', description: 'Explains incorrect options' },
] as const

export default function SettingsPage() {
  const echo = useEcho()
  const { theme, setTheme } = useTheme()
  const font = useFontStore((state) => state.font)
  const setFont = useFontStore((state) => state.setFont)

  // Quiz preferences (includes avatar)
  const quizPrefs = useQuizPreferencesStore()

  const [avatarOpen, setAvatarOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [editingUsername, setEditingUsername] = useState(false)
  const [newUsername, setNewUsername] = useState('')
  const [currentUsername, setCurrentUsername] = useState('')
  const [saving, setSaving] = useState(false)
  const [selectedModel, setSelectedModel] = useState('claude-sonnet-4-20250514')

  useEffect(() => {
    if (echo.user?.id) {
      fetchUserProfile()
      fetchPreferences()
    } else {
      setLoading(false)
    }
  }, [echo.user?.id])

  const fetchUserProfile = async () => {
    if (!echo.user?.id) return

    setLoading(true)
    try {
      const profileRes = await fetch(`/api/user/profile?echo_user_id=${echo.user.id}`)
      if (profileRes.ok) {
        const data = await profileRes.json()
        if (data.user) {
          setCurrentUsername(data.user.username || '')
          setNewUsername(data.user.username || '')
          // Sync avatar from DB to localStorage
          if (data.user.avatar_id) {
            quizPrefs.setAvatarId(data.user.avatar_id)
          }
        }
      }
    } catch (error) {
      console.error('Error fetching user profile:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchPreferences = async () => {
    if (!echo.user?.id) return

    try {
      const res = await fetch(`/api/preferences?echo_user_id=${echo.user.id}`)
      if (res.ok) {
        const data = await res.json()
        if (data.preferences) {
          // Sync DB preferences to localStorage
          if (data.preferences.difficulty) {
            quizPrefs.setDifficulty(data.preferences.difficulty)
          }
          if (data.preferences.question_count) {
            quizPrefs.setQuestionCount(data.preferences.question_count)
          }
          if (data.preferences.preferred_tone !== undefined) {
            quizPrefs.setPreferredTone(data.preferences.preferred_tone)
          }
          if (data.preferences.explanation_style !== undefined) {
            quizPrefs.setExplanationStyle(data.preferences.explanation_style)
          }
        }
      }
    } catch (error) {
      console.error('Error fetching preferences:', error)
    }
  }

  const syncPreferences = async (updates: {
    difficulty?: string
    question_count?: number
    preferred_tone?: string | null
    explanation_style?: string | null
  }) => {
    if (!echo.user?.id) return

    try {
      await fetch('/api/preferences', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          echo_user_id: echo.user.id,
          ...updates,
        }),
      })
    } catch (error) {
      console.error('Error syncing preferences:', error)
    }
  }

  const handleAvatarUpdate = async (avatarId: AvatarId) => {
    // Update localStorage immediately
    quizPrefs.setAvatarId(avatarId)
    setAvatarOpen(false)

    // Sync to database
    if (!echo.user?.id) return
    try {
      await fetch('/api/user/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          echo_user_id: echo.user.id,
          avatar_id: avatarId,
        }),
      })
    } catch (error) {
      console.error('Error updating avatar:', error)
    }
  }

  const handleUsernameUpdate = async () => {
    if (!echo.user?.id || !newUsername.trim()) return

    setSaving(true)
    try {
      const response = await fetch('/api/user/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          echo_user_id: echo.user.id,
          username: newUsername.trim(),
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setCurrentUsername(data.user.username)
        setEditingUsername(false)
      } else {
        alert('Failed to update username')
      }
    } catch (error) {
      console.error('Error updating username:', error)
      alert('Failed to update username')
    } finally {
      setSaving(false)
    }
  }

  if (!echo.user) {
    return (
      <DotBackground className="min-h-screen">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-6 space-y-4">
              <Badge variant="secondary" className="mb-2">
                Settings
              </Badge>
              <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">
                <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                  Settings
                </span>
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Please sign in to access your settings
              </p>
            </div>
          </div>
        </div>
      </DotBackground>
    )
  }

  if (loading) {
    return (
      <DotBackground className="min-h-screen">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-3xl mx-auto text-center">
            <div className="text-muted-foreground">Loading settings...</div>
          </div>
        </div>
      </DotBackground>
    )
  }

  return (
    <DotBackground className="min-h-screen">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto space-y-8">
          {/* Page Header */}
          <div className="text-center mb-6 space-y-4">
            <Badge variant="secondary" className="mb-2">
              Settings
            </Badge>
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">
              Welcome back,{' '}
              <AnimatedGradientText>
                {currentUsername || 'Traveler'}
              </AnimatedGradientText>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Manage your account settings
            </p>
          </div>

          {/* Username Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Account Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Avatar */}
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
                <Popover open={avatarOpen} onOpenChange={setAvatarOpen}>
                  <PopoverTrigger asChild>
                    <button className="group relative">
                      <Avatar className="h-16 w-16 sm:h-20 sm:w-20 transition-transform group-hover:scale-105">
                        <AvatarFallback className="bg-primary/10">
                          {(() => {
                            const Icon = AVATAR_ICONS[quizPrefs.avatarId as keyof typeof AVATAR_ICONS] || Ghost
                            return <Icon className="h-8 w-8 sm:h-10 sm:w-10 text-primary" />
                          })()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="absolute inset-0 rounded-full bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                        <Edit2 className="h-4 w-4 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-72 p-3">
                    <div className="grid grid-cols-4 gap-2">
                      {AVATARS.map((a) => {
                        const Icon = AVATAR_ICONS[a.id]
                        const isSelected = quizPrefs.avatarId === a.id
                        return (
                          <button
                            key={a.id}
                            onClick={() => handleAvatarUpdate(a.id)}
                            className={`p-3 rounded-lg transition-all ${
                              isSelected
                                ? 'bg-primary/10 ring-2 ring-primary'
                                : 'hover:bg-muted'
                            }`}
                          >
                            <Icon className={`h-6 w-6 mx-auto ${isSelected ? 'text-primary' : 'text-foreground'}`} />
                          </button>
                        )
                      })}
                    </div>
                  </PopoverContent>
                </Popover>

                {/* Username */}
                <div className="flex-1 w-full space-y-2">
                  <Label htmlFor="username">Username</Label>
                  {editingUsername ? (
                    <div className="flex items-center gap-2">
                      <Input
                        id="username"
                        value={newUsername}
                        onChange={(e) => setNewUsername(e.target.value)}
                        placeholder="Enter username"
                        className="flex-1"
                        disabled={saving}
                      />
                      <Button
                        size="sm"
                        onClick={handleUsernameUpdate}
                        disabled={saving || !newUsername.trim()}
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setEditingUsername(false)
                          setNewUsername(currentUsername)
                        }}
                        disabled={saving}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <div className="px-3 py-2 rounded-md border bg-muted/50 flex-1 sm:flex-none sm:min-w-[200px]">
                        {currentUsername || 'No username set'}
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setEditingUsername(true)}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                  <p className="text-sm text-muted-foreground">
                    Shown on leaderboards and in games.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Model Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5" />
                Model Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="model">AI Model</Label>
                <Select value={selectedModel} onValueChange={setSelectedModel}>
                  <SelectTrigger className="max-w-xs">
                    <SelectValue placeholder="Select a model" />
                  </SelectTrigger>
                  <SelectContent>
                    {AI_MODELS.map((model) => (
                      <SelectItem
                        key={model.id}
                        value={model.id}
                        disabled={!model.available}
                        className={!model.available ? 'opacity-50' : ''}
                      >
                        <div className="flex items-center gap-2">
                          <ProviderLogo provider={model.provider} />
                          <span>{model.name}</span>
                          {'isDefault' in model && model.isDefault && (
                            <span className="text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded">
                              Default
                            </span>
                          )}
                          {!model.available && (
                            <span className="text-xs text-muted-foreground">
                              Coming soon
                            </span>
                          )}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground">
                  Choose the AI model used to generate trivia questions. More models coming soon.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* UI Themes */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5" />
                UI Themes
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 sm:flex sm:justify-center gap-3">
                {THEMES.map((t) => {
                  const isSelected = theme === t.id
                  const Icon = t.icon
                  return (
                    <button
                      key={t.id}
                      onClick={(e) => {
                        if (theme === t.id) return
                        const button = e.currentTarget
                        if (!document.startViewTransition) {
                          setTheme(t.id)
                          return
                        }
                        const { top, left, width, height } = button.getBoundingClientRect()
                        const x = left + width / 2
                        const y = top + height / 2
                        const right = window.innerWidth - left
                        const bottom = window.innerHeight - top
                        const maxRad = Math.hypot(Math.max(left, right), Math.max(top, bottom))
                        const clipPathSmall = `circle(0px at ${x}px ${y}px)`
                        const clipPathFull = `circle(${maxRad}px at ${x}px ${y}px)`
                        document.startViewTransition(() => {
                          setTheme(t.id)
                        }).ready.then(() => {
                          document.documentElement.animate(
                            { clipPath: [clipPathSmall, clipPathFull] },
                            { duration: 700, easing: 'ease-in-out', pseudoElement: '::view-transition-new(root)' }
                          )
                        })
                      }}
                      className={`relative flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all w-full sm:w-28 ${
                        isSelected
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/50 hover:bg-accent'
                      }`}
                    >
                      {isSelected && (
                        <div className="absolute top-2 right-2">
                          <Check className="h-4 w-4 text-primary" />
                        </div>
                      )}
                      {Icon ? (
                        <Icon className="h-6 w-6" />
                      ) : t.image ? (
                        <img
                          src={t.image}
                          alt={t.name}
                          className="h-6 w-6 object-contain"
                        />
                      ) : null}
                      <span className="text-sm font-medium">{t.name}</span>
                    </button>
                  )
                })}
              </div>
              <p className="text-sm text-muted-foreground text-center">
                {THEMES.find((t) => t.id === theme)?.description || 'Choose your preferred appearance'}
              </p>
            </CardContent>
          </Card>

          {/* Quiz Preferences */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <SlidersHorizontal className="h-5 w-5" />
                Quiz Preferences
                <span className="text-sm font-normal text-muted-foreground">(Freeplay)</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Default Difficulty */}
              <div className="space-y-2">
                <Label>Default Difficulty</Label>
                <div className="flex flex-wrap gap-2">
                  {DIFFICULTIES.map((d) => (
                    <button
                      key={d.id}
                      onClick={() => {
                        quizPrefs.setDifficulty(d.id)
                        syncPreferences({ difficulty: d.id })
                      }}
                      className={`px-4 py-2 rounded-lg border-2 text-sm font-medium transition-all ${
                        quizPrefs.difficulty === d.id
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      {d.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Default Question Count */}
              <div className="space-y-2">
                <Label>Default Question Count</Label>
                <div className="flex flex-wrap gap-2">
                  {QUESTION_COUNTS.map((q) => (
                    <button
                      key={q.id}
                      onClick={() => {
                        quizPrefs.setQuestionCount(q.id)
                        syncPreferences({ question_count: q.id })
                      }}
                      className={`px-4 py-2 rounded-lg border-2 text-sm font-medium transition-all ${
                        quizPrefs.questionCount === q.id
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      {q.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Preferred Tone */}
              <div className="space-y-2">
                <Label>Preferred Tone</Label>
                <p className="text-sm text-muted-foreground mb-2">
                  Sets the vibe for how questions are written
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {TONES.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => {
                        const newTone = quizPrefs.preferredTone === t.id ? null : t.id
                        quizPrefs.setPreferredTone(newTone)
                        syncPreferences({ preferred_tone: newTone })
                      }}
                      className={`px-3 py-2 rounded-lg border-2 text-sm font-medium transition-all text-left ${
                        quizPrefs.preferredTone === t.id
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      <div>{t.name}</div>
                      <div className="text-xs text-muted-foreground font-normal">{t.description}</div>
                    </button>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">Click again to clear preference</p>
              </div>

              {/* Explanation Style */}
              <div className="space-y-2">
                <Label>Explanation Style</Label>
                <p className="text-sm text-muted-foreground mb-2">
                  How detailed explanations should be
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {EXPLANATION_STYLES.map((s) => (
                    <button
                      key={s.id}
                      onClick={() => {
                        const newStyle = quizPrefs.explanationStyle === s.id ? null : s.id
                        quizPrefs.setExplanationStyle(newStyle)
                        syncPreferences({ explanation_style: newStyle })
                      }}
                      className={`px-3 py-2 rounded-lg border-2 text-sm font-medium transition-all text-left ${
                        quizPrefs.explanationStyle === s.id
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      <div>{s.name}</div>
                      <div className="text-xs text-muted-foreground font-normal">{s.description}</div>
                    </button>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">Click again to clear preference</p>
              </div>
            </CardContent>
          </Card>

          {/* Accessibility */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Accessibility
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 sm:flex sm:justify-center gap-3">
                {FONTS.map((f) => {
                  const isSelected = font === f.id
                  const fontClass = f.id === 'serif' ? 'font-serif' : f.id === 'dyslexic' ? 'font-dyslexic' : f.id === 'tech' ? 'font-tech' : ''
                  return (
                    <button
                      key={f.id}
                      onClick={() => setFont(f.id)}
                      className={`relative flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all w-full sm:w-28 ${
                        isSelected
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/50 hover:bg-accent'
                      }`}
                    >
                      {isSelected && (
                        <div className="absolute top-2 right-2">
                          <Check className="h-4 w-4 text-primary" />
                        </div>
                      )}
                      <span className={`text-2xl font-medium ${fontClass}`} style={f.id === 'dyslexic' ? { fontSize: '1.5rem' } : undefined}>
                        {f.preview}
                      </span>
                      <span className="text-sm font-medium">{f.name}</span>
                    </button>
                  )
                })}
              </div>
              <p className="text-sm text-muted-foreground text-center">
                {FONTS.find((f) => f.id === font)?.description || 'Choose your preferred font'}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </DotBackground>
  )
}
