'use client'

import { useRef, useEffect, useState } from 'react'
import { useChat } from '@ai-sdk/react'
import { useEcho } from '@merit-systems/echo-react-sdk'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, Loader2, ArrowLeft, LogIn } from 'lucide-react'
import { WizardsHat } from '@/components/icons/WizardsHat'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { Response } from '@/components/ai-elements/response'
import { useQuizPreferencesStore, type AvatarId } from '@/lib/store'
import { Skull, Ghost, Cat, Swords, Shield, Target, Glasses, TreePine, Flame, Zap, Crown, Anchor, Bird, Bug, Snowflake, Cherry } from 'lucide-react'

const AVATAR_ICONS: Record<AvatarId, typeof Ghost> = {
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
}

const FALLBACK_NAMES = ['wanderer', 'traveler', 'seeker', 'explorer', 'curious one']


export default function ChatPage() {
  const echo = useEcho()
  const avatarId = useQuizPreferencesStore((state) => state.avatarId)
  const scrollRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const [mounted, setMounted] = useState(false)
  const [input, setInput] = useState('')

  const { messages, sendMessage, status } = useChat()

  // Get user display name: name > random fallback
  const getUserDisplayName = () => {
    if (echo.user?.name) return echo.user.name
    return FALLBACK_NAMES[Math.floor(Math.random() * FALLBACK_NAMES.length)]
  }

  const UserAvatarIcon = AVATAR_ICONS[avatarId] || Ghost

  const isLoading = status === 'streaming' || status === 'submitted'

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])


  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return
    sendMessage({ text: input }, { body: { model: 'claude-sonnet-4-20250514' } })
    setInput('')
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      onSubmit(e)
    }
  }

  // Get text content from message parts
  const getMessageText = (message: typeof messages[0]) => {
    return message.parts
      .filter((part): part is { type: 'text'; text: string } => part.type === 'text')
      .map(part => part.text)
      .join('')
  }

  if (!mounted) return null

  // Create display messages with welcome
  const displayMessages = messages.length === 0
    ? [{ id: 'welcome', role: 'assistant' as const, text: `Greetings, ${getUserDisplayName()}! I am the Wizard's Hat—a sentient artifact that has rested upon the great Wizard's head for countless ages. From the Tower's archive, I've absorbed knowledge beyond measure. Ask me anything about trivia, curious facts, or the nature of knowing itself.` }]
    : messages.map(m => ({ id: m.id, role: m.role, text: getMessageText(m) }))

  return (
    <div className="h-[calc(100dvh-4rem)] relative overflow-hidden flex flex-col">
      {/* Background */}
      <div className="absolute inset-0 bg-background">
        {/* Subtle geometric pattern */}
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23888888' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
      </div>

      <div className="relative z-10 container mx-auto px-4 pt-6 flex-1 flex flex-col max-w-4xl min-h-0">
        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center justify-between mb-6 shrink-0"
        >
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="icon" className="rounded-full">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center border border-border">
                <WizardsHat className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-xl font-bold">The Wizard's Hat</h1>
                <p className="text-xs text-muted-foreground">Sentient keeper of the Tower's knowledge</p>
              </div>
            </div>
          </div>
        </motion.header>

        {/* Messages */}
        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto space-y-4 pb-4 scroll-smooth"
        >
          <AnimatePresence mode="popLayout">
            {displayMessages.map((message, index) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{
                  duration: 0.3,
                  delay: index === displayMessages.length - 1 ? 0 : 0,
                  ease: [0.23, 1, 0.32, 1]
                }}
                className={cn(
                  "flex gap-3",
                  message.role === 'user' ? 'flex-row-reverse' : 'flex-row'
                )}
              >
                {/* Avatar */}
                <div className={cn(
                  "shrink-0 h-9 w-9 rounded-full flex items-center justify-center border border-border",
                  message.role === 'user'
                    ? "bg-primary/10"
                    : "bg-muted"
                )}>
                  {message.role === 'user' ? (
                    <UserAvatarIcon className="h-4 w-4 text-primary" />
                  ) : (
                    <WizardsHat className="h-4 w-4 text-foreground" />
                  )}
                </div>

                {/* Message bubble */}
                <div className={cn(
                  "max-w-[80%] rounded-2xl px-4 py-3 shadow-sm",
                  message.role === 'user'
                    ? "bg-primary text-primary-foreground rounded-tr-sm"
                    : "bg-card border border-border rounded-tl-sm"
                )}>
                  {message.role === 'user' ? (
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">
                      {message.text}
                    </p>
                  ) : (
                    <Response className="text-sm leading-relaxed prose prose-sm dark:prose-invert max-w-none">
                      {message.text}
                    </Response>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Loading indicator */}
          {isLoading && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex gap-3"
            >
              <div className="h-9 w-9 rounded-full bg-muted border border-border flex items-center justify-center">
                <WizardsHat className="h-4 w-4 text-foreground" />
              </div>
              <div className="bg-card border border-border rounded-2xl rounded-tl-sm px-4 py-3">
                <div className="flex items-center gap-2">
                  <motion.div className="flex gap-1">
                    {[0, 1, 2].map((i) => (
                      <motion.span
                        key={i}
                        className="h-2 w-2 rounded-full bg-primary/60"
                        animate={{
                          y: [0, -6, 0],
                          opacity: [0.4, 1, 0.4]
                        }}
                        transition={{
                          duration: 0.8,
                          repeat: Infinity,
                          delay: i * 0.15,
                        }}
                      />
                    ))}
                  </motion.div>
                  <span className="text-xs text-muted-foreground">Thinking...</span>
                </div>
              </div>
            </motion.div>
          )}
        </div>


      </div>

      {/* Input - Fixed at bottom */}
      <div className="relative z-10 shrink-0 border-t bg-background/95 backdrop-blur-sm">
        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          onSubmit={onSubmit}
          className="container mx-auto px-4 py-4 max-w-4xl"
        >
          <div className="relative flex items-end gap-2 bg-card/60 backdrop-blur-sm border border-border/50 rounded-2xl p-2 focus-within:border-primary/30 transition-colors">
            <Textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask the Hat anything..."
              className="flex-1 min-h-[44px] max-h-[200px] resize-none border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 text-sm placeholder:text-muted-foreground/60"
              rows={1}
            />
            <Button
              type="submit"
              size="icon"
              disabled={!input.trim() || isLoading}
              className="shrink-0 h-10 w-10 rounded-xl"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
          <p className="text-[10px] text-muted-foreground/60 text-center mt-2">
            The Hat may occasionally hallucinate. Verify important information.
          </p>
        </motion.form>
      </div>
    </div>
  )
}
