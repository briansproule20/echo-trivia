'use client'

import { useRef, useEffect, useState, useCallback } from 'react'
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
import { Skull, Ghost, Cat, Swords, Shield, Target, Glasses, TreePine, Flame, Zap, Crown, Anchor, Bird, Bug, Snowflake, Cherry, Sparkles, Shuffle, Trophy, Lightbulb, BookOpen } from 'lucide-react'
import { TriviaQuestion } from '@/components/chat/TriviaQuestion'
import { CATEGORIES } from '@/lib/types'

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
  const [answeredQuestions, setAnsweredQuestions] = useState<Set<string>>(new Set())
  const [dailyCategory, setDailyCategory] = useState<string | null>(null)

  const { messages, sendMessage, status } = useChat()

  // Fetch daily category
  useEffect(() => {
    fetch('/api/trivia/daily')
      .then(res => res.json())
      .then(data => setDailyCategory(data.category))
      .catch(() => setDailyCategory(CATEGORIES[0]))
  }, [])

  // Handle suggestion bubble click
  const handleSuggestion = useCallback((type: 'random' | 'challenge' | 'easy' | 'primer') => {
    const randomCategory = CATEGORIES[Math.floor(Math.random() * CATEGORIES.length)]

    const prompts = {
      random: `Give me a trivia question about ${randomCategory}`,
      challenge: `Give me a challenging hard trivia question`,
      easy: `Give me a fun easy trivia question to warm up`,
      primer: `Give me a quick primer on ${dailyCategory || 'History'} - today's daily challenge category. Share some interesting facts, key dates, notable figures, and context that might help me prepare for trivia questions on this topic.`,
    }

    sendMessage({ text: prompts[type] }, { body: { model: 'claude-sonnet-4-20250514' } })
  }, [dailyCategory, sendMessage])

  // Handle trivia answer submission
  const handleTriviaAnswer = useCallback((toolCallId: string, answerId: string, answerText: string) => {
    setAnsweredQuestions(prev => new Set(prev).add(toolCallId))
    sendMessage({ text: `My answer is ${answerId}: "${answerText}"` }, { body: { model: 'claude-sonnet-4-20250514' } })
  }, [sendMessage])

  // Get user display name: name > random fallback
  const getUserDisplayName = () => {
    if (echo.user?.name) return echo.user.name
    return FALLBACK_NAMES[Math.floor(Math.random() * FALLBACK_NAMES.length)]
  }

  const UserAvatarIcon = AVATAR_ICONS[avatarId] || Ghost

  const isLoading = status === 'streaming' || status === 'submitted'

  // Check if there's an unanswered trivia question
  const hasUnansweredQuestion = messages.some(m => {
    if (m.role !== 'assistant') return false
    for (const part of m.parts) {
      const isTriviaTool = part.type === 'tool-trivia_question' ||
                          (part.type.startsWith('tool-') && part.type.includes('trivia'))
      if (isTriviaTool) {
        const toolPart = part as unknown as { toolCallId: string }
        if (!answeredQuestions.has(toolPart.toolCallId)) {
          return true
        }
      }
    }
    return false
  })

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

  // Get trivia question from message parts (if any)
  const getTriviaQuestion = (message: typeof messages[0]) => {
    for (const part of message.parts) {
      // Tool parts have type like "tool-trivia_question" - catch any trivia tool
      const isTriviaTool = part.type === 'tool-trivia_question' ||
                          (part.type.startsWith('tool-') && part.type.includes('trivia'))

      if (isTriviaTool) {
        // Cast through unknown to handle all possible tool states
        const toolPart = part as unknown as {
          type: string
          toolCallId: string
          state: string
          input?: unknown
          args?: unknown // SDK might use args instead of input
        }

        // Try both input and args (SDK might use either)
        const toolInput = toolPart.input || toolPart.args

        // Accept any state that has input data
        if (!toolInput) {
          return { toolCallId: toolPart.toolCallId || 'loading', isLoading: true, args: null }
        }

        const rawInput = toolInput as {
          question: string
          optionA: string
          optionB: string
          optionC: string
          optionD: string
          correctAnswer: 'A' | 'B' | 'C' | 'D'
          category: string
          difficulty: 'easy' | 'medium' | 'hard'
        }

        // Validate we have all required fields
        if (!rawInput.question || !rawInput.optionA || !rawInput.optionB || !rawInput.optionC || !rawInput.optionD || !rawInput.correctAnswer) {
          return { toolCallId: toolPart.toolCallId || 'loading', isLoading: true, args: null }
        }

        // Transform to the format TriviaQuestion component expects
        return {
          toolCallId: toolPart.toolCallId,
          isLoading: false,
          args: {
            question: rawInput.question,
            options: [
              { id: 'A' as const, text: rawInput.optionA },
              { id: 'B' as const, text: rawInput.optionB },
              { id: 'C' as const, text: rawInput.optionC },
              { id: 'D' as const, text: rawInput.optionD },
            ],
            correctAnswer: rawInput.correctAnswer,
            category: rawInput.category || 'General',
            difficulty: rawInput.difficulty || 'medium',
          }
        }
      }
    }
    return null
  }

  if (!mounted) return null

  // Create display messages with welcome
  const displayMessages = messages.length === 0
    ? [{ id: 'welcome', role: 'assistant' as const, text: `Greetings, ${getUserDisplayName()}! I am the Wizard's Hat—a sentient artifact that has rested upon the great Wizard's head for countless ages. From the Tower's archive, I've absorbed knowledge beyond measure. Ask me anything about trivia, curious facts, or the nature of knowing itself.`, triviaQuestion: null }]
    : messages.map(m => ({ id: m.id, role: m.role, text: getMessageText(m), triviaQuestion: m.role === 'assistant' ? getTriviaQuestion(m) : null }))

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
        {/* Header - hide once chat begins */}
        <AnimatePresence>
          {messages.length === 0 && (
            <motion.header
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20, height: 0, marginBottom: 0 }}
              transition={{ duration: 0.3 }}
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
          )}
        </AnimatePresence>

        {/* Sign in required */}
        {!echo.user ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center">
            <div className="h-24 w-24 rounded-full bg-primary/10 flex items-center justify-center mb-6">
              <WizardsHat className="h-12 w-12 text-primary" />
            </div>
            <h2 className="text-xl font-bold mb-2">Sign in to Chat</h2>
            <p className="text-sm text-muted-foreground mb-6 max-w-md">
              Connect with Echo to speak with the Wizard's Hat and unlock the Tower's ancient wisdom.
            </p>
            <Button
              onClick={() => echo.signIn()}
              className="gap-2"
              size="lg"
            >
              <LogIn className="h-5 w-5" />
              Sign in with Echo
            </Button>
          </div>
        ) : (
          <>
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
                  "max-w-[85%] sm:max-w-[80%]",
                  message.role === 'user'
                    ? "rounded-2xl px-4 py-3 shadow-sm bg-primary text-primary-foreground rounded-tr-sm"
                    : message.triviaQuestion
                    ? "" // No bubble styling for trivia questions - the component has its own
                    : "rounded-2xl px-4 py-3 shadow-sm bg-card border border-border rounded-tl-sm"
                )}>
                  {message.role === 'user' ? (
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">
                      {message.text}
                    </p>
                  ) : message.triviaQuestion ? (
                    <div className="space-y-3">
                      {message.text && (
                        <div className="rounded-2xl px-4 py-3 shadow-sm bg-card border border-border rounded-tl-sm">
                          <Response className="text-sm leading-relaxed prose prose-sm dark:prose-invert max-w-none prose-ul:pl-4 prose-ol:pl-4 prose-li:pl-0 prose-ul:list-inside prose-ol:list-inside">
                            {message.text}
                          </Response>
                        </div>
                      )}
                      {message.triviaQuestion.isLoading ? (
                        /* Tool call loading animation */
                        <motion.div
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="rounded-xl border border-border bg-card/50 backdrop-blur-sm overflow-hidden"
                        >
                          <div className="px-4 py-3 border-b border-border/50 flex items-center gap-2 bg-muted/30">
                            <motion.div
                              animate={{ rotate: 360 }}
                              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                            >
                              <Sparkles className="h-4 w-4 text-primary" />
                            </motion.div>
                            <span className="text-xs font-medium text-muted-foreground">Conjuring a question...</span>
                          </div>
                          <div className="p-4 space-y-3">
                            {/* Skeleton question */}
                            <div className="space-y-2">
                              <div className="h-4 bg-muted/50 rounded animate-pulse w-3/4" />
                              <div className="h-4 bg-muted/50 rounded animate-pulse w-1/2" />
                            </div>
                            {/* Skeleton options */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
                              {[0, 1, 2, 3].map((i) => (
                                <div
                                  key={i}
                                  className="h-12 bg-muted/30 rounded-lg border border-border/50 animate-pulse"
                                  style={{ animationDelay: `${i * 100}ms` }}
                                />
                              ))}
                            </div>
                          </div>
                        </motion.div>
                      ) : message.triviaQuestion.args && (
                        <TriviaQuestion
                          question={message.triviaQuestion.args.question}
                          options={message.triviaQuestion.args.options}
                          correctAnswer={message.triviaQuestion.args.correctAnswer}
                          category={message.triviaQuestion.args.category}
                          difficulty={message.triviaQuestion.args.difficulty}
                          disabled={answeredQuestions.has(message.triviaQuestion.toolCallId) || isLoading}
                          onAnswer={(answerId, answerText) =>
                            handleTriviaAnswer(message.triviaQuestion!.toolCallId, answerId, answerText)
                          }
                        />
                      )}
                    </div>
                  ) : (
                    <Response className="text-sm leading-relaxed prose prose-sm dark:prose-invert max-w-none prose-ul:pl-4 prose-ol:pl-4 prose-li:pl-0 prose-ul:list-inside prose-ol:list-inside">
                      {message.text}
                    </Response>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Loading indicator - show when waiting for assistant response */}
          {(() => {
            const lastMessage = displayMessages[displayMessages.length - 1]
            // Show thinking when:
            // 1. We're loading AND
            // 2. Either the last message is from user (waiting for assistant), OR
            //    the last assistant message has no text yet (still streaming)
            if (!isLoading) return false
            if (lastMessage?.role === 'user') return true // User just sent message, waiting for response
            // Last message is assistant - only show thinking if it has no content yet
            const hasContent = lastMessage?.text || lastMessage?.triviaQuestion
            return !hasContent
          })() && (
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
          </>
        )}
      </div>

      {/* Input - Fixed at bottom (only show when signed in) */}
      {echo.user && (
        <div className="relative z-10 shrink-0 border-t bg-background/95 backdrop-blur-sm">
          <div className="container mx-auto px-4 pt-3 max-w-4xl">
            {/* Suggestion bubbles */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex gap-2 mb-3 justify-start sm:justify-center overflow-x-auto sm:overflow-visible sm:flex-wrap pb-2 sm:pb-0 -mx-4 px-4 sm:mx-0 sm:px-0 scrollbar-none"
              >
                <button
                  onClick={() => handleSuggestion('primer')}
                  disabled={isLoading}
                  className="shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-full border border-border bg-card hover:bg-accent hover:border-primary/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                >
                  <BookOpen className="h-3 w-3 text-primary" />
                  Daily Primer
                </button>
                <button
                  onClick={() => handleSuggestion('random')}
                  disabled={isLoading || hasUnansweredQuestion}
                  className="shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-full border border-border bg-card hover:bg-accent hover:border-primary/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                >
                  <Shuffle className="h-3 w-3 text-primary" />
                  Feeling Random
                </button>
                <button
                  onClick={() => handleSuggestion('challenge')}
                  disabled={isLoading || hasUnansweredQuestion}
                  className="shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-full border border-border bg-card hover:bg-accent hover:border-primary/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                >
                  <Trophy className="h-3 w-3 text-primary" />
                  Challenge Me
                </button>
                <button
                  onClick={() => handleSuggestion('easy')}
                  disabled={isLoading || hasUnansweredQuestion}
                  className="shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-full border border-border bg-card hover:bg-accent hover:border-primary/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                >
                  <Lightbulb className="h-3 w-3 text-primary" />
                  Quick & Easy
                </button>
              </motion.div>
          </div>
          <motion.form
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            onSubmit={onSubmit}
            className="container mx-auto px-4 pb-4 max-w-4xl"
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
      )}
    </div>
  )
}
