'use client'

import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Skull, Globe, TrendingUp, HelpCircle, Users } from 'lucide-react'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { motion } from 'framer-motion'

interface CommunityStats {
  totalCorrectAnswers: number
  totalUsers: number
  currentTier: {
    level: number
    goal: number
    name: string
  }
  nextTier: {
    level: number
    goal: number
    name: string
  } | null
  progress: number
  allTiers: Array<{
    level: number
    goal: number
    name: string
  }>
}

export function CommunityLoreSection() {
  const [stats, setStats] = useState<CommunityStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchCommunityStats() {
      try {
        const response = await fetch('/api/community/stats')
        if (response.ok) {
          const data = await response.json()
          setStats(data)
        }
      } catch (error) {
        console.error('Error fetching community stats:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchCommunityStats()
  }, [])

  if (loading) {
    return (
      <div className="w-full h-64 animate-pulse bg-gradient-to-br from-slate-900/50 to-slate-800/50 rounded-lg" />
    )
  }

  if (!stats) return null

  const formatNumber = (num: number) => {
    return num.toLocaleString('en-US')
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="w-full"
    >
      <Card className="relative overflow-hidden border-border/40 bg-card/50 backdrop-blur-sm">
        {/* Atmospheric background effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjAzKSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-20" />

        <div className="relative z-10 p-4 sm:p-6">
          {/* Header with skull icon and help */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="flex items-center justify-between mb-6"
          >
            <div className="flex items-center gap-3">
              <div className="relative">
                <Skull className="h-7 w-7 sm:h-8 sm:w-8 text-primary" />
                <motion.div
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.5, 0.8, 0.5]
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                  className="absolute inset-0 blur-md"
                >
                  <Skull className="h-7 w-7 sm:h-8 sm:w-8 text-primary" />
                </motion.div>
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
                  The Wizard's Legion
                </h2>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Users className="h-3 w-3" />
                  <span>{formatNumber(stats.totalUsers)} members</span>
                </div>
              </div>
            </div>

            {/* Help Icon */}
            <Popover>
              <PopoverTrigger asChild>
                <button className="text-muted-foreground hover:text-foreground transition-colors">
                  <HelpCircle className="h-5 w-5" />
                </button>
              </PopoverTrigger>
              <PopoverContent align="end" className="w-[300px] sm:w-[360px]">
                <div className="space-y-3">
                  <h3 className="font-semibold text-base">The Wizard's Call</h3>
                  <p className="text-sm text-muted-foreground">
                    The Trivia Wizard rallies all players in a unified campaign against ignorance. Every correct answer from any challenge strengthens our collective power and advances the legion through the ranks.
                  </p>

                  <div className="space-y-2 pt-2 border-t">
                    <h4 className="font-medium text-sm">Ranks of the Legion</h4>
                    {stats?.allTiers.map((tier, index) => {
                      const nextTierGoal = stats.allTiers[index + 1]?.goal
                      const rangeDisplay = tier.level === 1
                        ? `0 - ${(nextTierGoal - 1).toLocaleString()}`
                        : tier.goal.toLocaleString()
                      const isCompleted = nextTierGoal
                        ? stats.totalCorrectAnswers >= nextTierGoal
                        : stats.totalCorrectAnswers >= tier.goal
                      return (
                        <div key={tier.level} className={`flex justify-between text-xs ${isCompleted ? 'text-primary' : ''}`}>
                          <span className={isCompleted ? '' : 'text-muted-foreground'}>
                            {tier.name}
                          </span>
                          <span className="font-mono">{rangeDisplay}</span>
                        </div>
                      )
                    })}
                  </div>

                  <p className="text-xs text-muted-foreground pt-2 border-t">
                    All who answer correctly contribute: Daily Challenges, Freeplay, Faceoff, and beyond!
                  </p>
                </div>
              </PopoverContent>
            </Popover>
          </motion.div>

          {/* Lore text */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="mb-6 space-y-2"
          >
            <p className="text-muted-foreground leading-relaxed text-sm">
              The Trivia Wizard has gathered the curious, the clever, the gloriously nerdy. Together we chase answers, collect wisdom, and prove that knowing stuff is actually pretty cool.
            </p>
          </motion.div>

          {/* Stats section */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
            {/* Total answers */}
            <motion.div
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.5 }}
              className="relative"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent rounded-lg blur-xl" />
              <div className="relative bg-card/80 backdrop-blur-sm border border-primary/20 rounded-lg p-4 sm:p-5">
                <div className="flex items-center gap-2 mb-2">
                  <Globe className="h-4 w-4 text-primary" />
                  <span className="text-xs text-muted-foreground uppercase tracking-wider">
                    Legion Strength
                  </span>
                </div>
                <div className="text-3xl sm:text-4xl font-bold text-primary tabular-nums">
                  {formatNumber(stats.totalCorrectAnswers)}
                </div>
                <div className="text-xs text-muted-foreground mt-1">correct answers globally</div>
              </div>
            </motion.div>

            {/* Current tier */}
            <motion.div
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.7, duration: 0.5 }}
              className="relative"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent rounded-lg blur-xl" />
              <div className="relative bg-card/80 backdrop-blur-sm border border-primary/20 rounded-lg p-4 sm:p-5">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="h-4 w-4 text-primary" />
                  <span className="text-xs text-muted-foreground uppercase tracking-wider">
                    Current Rank
                  </span>
                </div>
                <div className="text-2xl sm:text-3xl font-bold text-foreground">
                  {stats.nextTier ? stats.currentTier.name : stats.currentTier.name}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  Tier {stats.currentTier.level}
                </div>
              </div>
            </motion.div>
          </div>

          {/* Progress bar */}
          {stats.nextTier && (
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.8, duration: 0.5 }}
              className="space-y-3"
            >
              <div className="flex justify-between items-baseline">
                <span className="text-sm text-muted-foreground">
                  Next: <span className="text-foreground font-semibold">{stats.nextTier.name}</span>
                </span>
                <span className="text-xs text-muted-foreground tabular-nums">
                  {formatNumber(stats.nextTier.goal - stats.totalCorrectAnswers)} to go
                </span>
              </div>

              <div className="relative">
                {/* Outer glow effect */}
                <motion.div
                  animate={{
                    opacity: [0.4, 0.7, 0.4],
                    scale: [1, 1.02, 1]
                  }}
                  transition={{
                    duration: 2.5,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                  className="absolute -inset-1 bg-primary/20 rounded-full blur-md"
                  style={{ width: `calc(${stats.progress}% + 8px)` }}
                />

                <div className="relative h-3 bg-secondary rounded-full overflow-hidden border border-border">
                  {/* Filled progress bar container */}
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${stats.progress}%` }}
                    transition={{ delay: 1, duration: 1.5, ease: "easeOut" }}
                    className="absolute inset-y-0 left-0 bg-primary rounded-full overflow-hidden"
                  >
                    {/* Top edge highlight */}
                    <div
                      className="absolute inset-x-0 top-0 h-[1px]"
                      style={{
                        background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.5) 20%, rgba(255,255,255,0.3) 80%, transparent 100%)'
                      }}
                    />

                    {/* Primary shimmer - bright highlight */}
                    <motion.div
                      animate={{
                        x: ['-100%', '400%']
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: [0.25, 0.1, 0.25, 1],
                        repeatDelay: 1
                      }}
                      className="absolute inset-0 w-1/4"
                      style={{
                        background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.1) 20%, rgba(255,255,255,0.5) 50%, rgba(255,255,255,0.1) 80%, transparent 100%)'
                      }}
                    />

                    {/* Secondary shimmer - wider, softer */}
                    <motion.div
                      animate={{
                        x: ['-100%', '400%']
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: [0.25, 0.1, 0.25, 1],
                        repeatDelay: 1,
                        delay: 0.1
                      }}
                      className="absolute inset-0 w-1/2"
                      style={{
                        background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.15) 50%, transparent 100%)'
                      }}
                    />

                    {/* Sparkle points */}
                    <motion.div
                      animate={{
                        x: ['-50%', '450%'],
                        opacity: [0, 1, 1, 0]
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "linear",
                        repeatDelay: 1
                      }}
                      className="absolute top-1/2 -translate-y-1/2 w-1 h-1 rounded-full bg-white"
                      style={{
                        boxShadow: '0 0 4px 1px rgba(255,255,255,0.8), 0 0 8px 2px rgba(255,255,255,0.4)'
                      }}
                    />

                    {/* Second sparkle with offset */}
                    <motion.div
                      animate={{
                        x: ['-50%', '450%'],
                        opacity: [0, 1, 1, 0]
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "linear",
                        repeatDelay: 1,
                        delay: 0.3
                      }}
                      className="absolute top-1/2 -translate-y-1/2 w-0.5 h-0.5 rounded-full bg-white"
                      style={{
                        boxShadow: '0 0 3px 1px rgba(255,255,255,0.6)'
                      }}
                    />

                    {/* Ambient color wave */}
                    <motion.div
                      animate={{
                        opacity: [0.2, 0.4, 0.2],
                        backgroundPosition: ['0% 50%', '100% 50%', '0% 50%']
                      }}
                      transition={{
                        duration: 4,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                      className="absolute inset-0"
                      style={{
                        background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.1) 25%, transparent 50%, rgba(255,255,255,0.1) 75%, transparent 100%)',
                        backgroundSize: '200% 100%'
                      }}
                    />
                  </motion.div>

                  {/* Leading edge glow */}
                  <motion.div
                    initial={{ left: 0 }}
                    animate={{ left: `${stats.progress}%` }}
                    transition={{ delay: 1, duration: 1.5, ease: "easeOut" }}
                    className="absolute top-0 bottom-0 w-2 -translate-x-1/2"
                  >
                    <motion.div
                      animate={{
                        opacity: [0.6, 1, 0.6],
                        scale: [0.8, 1, 0.8]
                      }}
                      transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                      className="absolute inset-0 bg-white rounded-full blur-sm"
                    />
                  </motion.div>
                </div>
              </div>

              <div className="text-center">
                <span className="text-xs text-muted-foreground">
                  {formatNumber(stats.totalCorrectAnswers)} / {formatNumber(stats.nextTier.goal)}
                </span>
              </div>
            </motion.div>
          )}

          {/* Max tier reached */}
          {!stats.nextTier && (
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.8, duration: 0.5 }}
              className="text-center py-4"
            >
              <div className="text-lg sm:text-xl text-primary font-bold">
                ⚔️ The Legion Stands Triumphant! ⚔️
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Ignorance has been vanquished. The Wizard's followers reign supreme.
              </p>
            </motion.div>
          )}
        </div>
      </Card>
    </motion.div>
  )
}
