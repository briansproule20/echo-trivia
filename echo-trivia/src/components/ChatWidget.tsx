'use client'

import { useRef, useEffect, useState } from 'react'
import { useChat } from '@ai-sdk/react'
import { useEcho } from '@merit-systems/echo-react-sdk'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, Loader2, X, Maximize2, Skull, Ghost, Cat, Swords, Shield, Target, Glasses, TreePine, Flame, Zap, Crown, Anchor, Bird, Bug, Snowflake, Cherry, LogIn } from 'lucide-react'
import { WizardsHat } from '@/components/icons/WizardsHat'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { Response } from '@/components/ai-elements/response'
import { useQuizPreferencesStore, type AvatarId } from '@/lib/store'

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

export function ChatWidget() {
  const echo = useEcho()
  const avatarId = useQuizPreferencesStore((state) => state.avatarId)
  const scrollRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const [isOpen, setIsOpen] = useState(false)
  const [hasInteracted, setHasInteracted] = useState(false)
  const [input, setInput] = useState('')

  const { messages, sendMessage, status } = useChat()

  const UserAvatarIcon = AVATAR_ICONS[avatarId] || Ghost

  // Get user display name: name > random fallback
  const getUserDisplayName = () => {
    if (echo.user?.name) return echo.user.name
    return FALLBACK_NAMES[Math.floor(Math.random() * FALLBACK_NAMES.length)]
  }

  const isLoading = status === 'streaming' || status === 'submitted'

  // Get text content from message parts
  const getMessageText = (message: typeof messages[0]) => {
    return message.parts
      .filter((part): part is { type: 'text'; text: string } => part.type === 'text')
      .map(part => part.text)
      .join('')
  }

  useEffect(() => {
    if (scrollRef.current && isOpen) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, isOpen])

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isOpen])

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return
    setHasInteracted(true)
    sendMessage({ text: input }, { body: { model: 'claude-sonnet-4-20250514', source: 'widget' } })
    setInput('')
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      onSubmit(e)
    }
  }

  // Create display messages with welcome
  const displayMessages = messages.length === 0
    ? [{ id: 'welcome', role: 'assistant' as const, text: `Greetings, ${getUserDisplayName()}! I am the Wizard's Hat—sentient keeper of the Tower's archive. Ask me anything!` }]
    : messages.map(m => ({ id: m.id, role: m.role, text: getMessageText(m) }))

  return (
    <>
      {/* Floating button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0, rotate: 180, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 260, damping: 20 }}
            className="fixed bottom-4 left-4 z-50"
          >
            {/* Pulse ring for attention - CSS animation for smooth performance */}
            {!hasInteracted && (
              <span
                className="absolute inset-0 h-11 w-11 sm:h-12 sm:w-12 rounded-full border-2 border-primary/50 pointer-events-none"
                style={{
                  animation: 'slow-ping 2.5s cubic-bezier(0, 0, 0.2, 1) infinite',
                }}
              />
            )}
            <style jsx>{`
              @keyframes slow-ping {
                0% {
                  transform: scale(1);
                  opacity: 0.6;
                }
                100% {
                  transform: scale(1.6);
                  opacity: 0;
                }
              }
            `}</style>

            <motion.button
              onClick={() => setIsOpen(true)}
              className="relative h-11 w-11 sm:h-12 sm:w-12 rounded-full bg-primary flex items-center justify-center shadow-lg group"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              aria-label="Open chat"
            >
              <WizardsHat className="h-5 w-5 sm:h-6 sm:w-6 text-primary-foreground" />
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            className="fixed bottom-4 left-4 z-50 w-[340px] sm:w-[360px] h-[480px] max-h-[80vh] bg-background/95 backdrop-blur-xl border border-border/50 rounded-2xl shadow-2xl flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-border shrink-0">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center border border-border">
                  <WizardsHat className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold">The Wizard's Hat</h3>
                  <p className="text-[10px] text-muted-foreground">Keeper of the Tower's knowledge</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Link href="/chat">
                  <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                    <Maximize2 className="h-4 w-4 text-muted-foreground" />
                  </Button>
                </Link>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-full hover:bg-destructive/10"
                  onClick={() => setIsOpen(false)}
                >
                  <X className="h-4 w-4 text-muted-foreground" />
                </Button>
              </div>
            </div>

            {/* Sign in required */}
            {!echo.user ? (
              <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
                <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <WizardsHat className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-sm font-semibold mb-2">Sign in to Chat</h3>
                <p className="text-xs text-muted-foreground mb-4">
                  Connect with Echo to speak with the Wizard's Hat
                </p>
                <Button
                  onClick={() => echo.signIn()}
                  className="gap-2"
                  size="sm"
                >
                  <LogIn className="h-4 w-4" />
                  Sign in with Echo
                </Button>
              </div>
            ) : (
              <>
                {/* Messages */}
                <div
                  ref={scrollRef}
                  className="flex-1 overflow-y-auto p-4 space-y-3"
                >
                  {displayMessages.map((message) => (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={cn(
                        "flex gap-2",
                        message.role === 'user' ? 'flex-row-reverse' : 'flex-row'
                      )}
                    >
                      {/* Avatar */}
                      <div className={cn(
                        "shrink-0 h-7 w-7 rounded-full flex items-center justify-center border border-border",
                        message.role === 'user'
                          ? "bg-primary/10"
                          : "bg-muted"
                      )}>
                        {message.role === 'user' ? (
                          <UserAvatarIcon className="h-3.5 w-3.5 text-primary" />
                        ) : (
                          <WizardsHat className="h-3.5 w-3.5 text-foreground" />
                        )}
                      </div>

                      {/* Message */}
                      <div className={cn(
                        "max-w-[75%] rounded-xl px-3 py-2 text-xs leading-relaxed",
                        message.role === 'user'
                          ? "bg-primary text-primary-foreground rounded-tr-sm"
                          : "bg-muted rounded-tl-sm"
                      )}>
                        {message.role === 'user' ? (
                          message.text
                        ) : (
                          <Response className="text-xs prose prose-sm dark:prose-invert max-w-none [&_ul]:list-disc [&_ul]:pl-4 [&_ol]:list-decimal [&_ol]:pl-4 [&_li]:my-0.5">
                            {message.text}
                          </Response>
                        )}
                      </div>
                    </motion.div>
                  ))}

                  {/* Loading */}
                  {isLoading && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex gap-2"
                    >
                      <div className="h-7 w-7 rounded-full bg-muted border border-border flex items-center justify-center">
                        <WizardsHat className="h-3.5 w-3.5 text-foreground" />
                      </div>
                      <div className="bg-muted rounded-xl rounded-tl-sm px-3 py-2">
                        <div className="flex gap-1">
                          {[0, 1, 2].map((i) => (
                            <motion.span
                              key={i}
                              className="h-1.5 w-1.5 rounded-full bg-primary/60"
                              animate={{ y: [0, -4, 0] }}
                              transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.1 }}
                            />
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </div>

                {/* Input */}
                <form onSubmit={onSubmit} className="p-3 border-t border-border/50 shrink-0">
                  <div className="flex items-end gap-2">
                    <Textarea
                      ref={inputRef}
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="Ask the Hat..."
                      className="flex-1 min-h-[40px] max-h-[100px] resize-none text-xs bg-muted/50 border-0 focus-visible:ring-1 focus-visible:ring-primary/30 rounded-xl"
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
                </form>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
