'use client'

import { useEffect, useState } from 'react'
import { useEcho } from '@merit-systems/echo-react-sdk'
import { Badge } from '@/components/ui/badge'
import { DotBackground } from '@/components/ui/dot-background'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Edit2, Check, X, Settings } from 'lucide-react'

export default function SettingsPage() {
  const echo = useEcho()
  const [loading, setLoading] = useState(true)
  const [editingUsername, setEditingUsername] = useState(false)
  const [newUsername, setNewUsername] = useState('')
  const [currentUsername, setCurrentUsername] = useState('')
  const [saving, setSaving] = useState(false)

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
        </div>
      </div>
    </DotBackground>
  )
}
