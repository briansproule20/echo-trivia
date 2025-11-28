'use client'

import { useEffect, useState } from 'react'
import { useEcho } from '@merit-systems/echo-react-sdk'
import { Badge } from '@/components/ui/badge'
import { DotBackground } from '@/components/ui/dot-background'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Edit2, Check, X, Settings, Sparkles, Palette, Accessibility, SlidersHorizontal, Monitor, Sun, Moon } from 'lucide-react'
import { useTheme } from 'next-themes'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

// Provider logo component using models.dev CDN
function ProviderLogo({ provider, className }: { provider: string; className?: string }) {
  return (
    <img
      alt={`${provider} logo`}
      className={className || 'size-4'}
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
] as const

export default function SettingsPage() {
  const echo = useEcho()
  const { theme, setTheme } = useTheme()
  const [loading, setLoading] = useState(true)
  const [editingUsername, setEditingUsername] = useState(false)
  const [newUsername, setNewUsername] = useState('')
  const [currentUsername, setCurrentUsername] = useState('')
  const [saving, setSaving] = useState(false)
  const [selectedModel, setSelectedModel] = useState('claude-sonnet-4-20250514')

  useEffect(() => {
    if (echo.user?.id) {
      fetchUserProfile()
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
        }
      }
    } catch (error) {
      console.error('Error fetching user profile:', error)
    } finally {
      setLoading(false)
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
              <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                {currentUsername || 'Traveler'}
              </span>
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
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                {editingUsername ? (
                  <div className="flex items-center gap-2">
                    <Input
                      id="username"
                      value={newUsername}
                      onChange={(e) => setNewUsername(e.target.value)}
                      placeholder="Enter username"
                      className="max-w-xs"
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
                    <div className="px-3 py-2 rounded-md border bg-muted/50 min-w-[200px]">
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
                  This is your display name shown on leaderboards and in games.
                </p>
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
                          {model.isDefault && (
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
              <div className="flex justify-center gap-3">
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
                      className={`relative flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all w-28 ${
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
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Coming soon...
              </p>
            </CardContent>
          </Card>

          {/* Accessibility */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Accessibility className="h-5 w-5" />
                Accessibility
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Coming soon...
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </DotBackground>
  )
}
