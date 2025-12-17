'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { Sparkles } from 'lucide-react'

interface TriviaQuestionProps {
  question: string
  options: Array<{ id: 'A' | 'B' | 'C' | 'D'; text: string }>
  correctAnswer: 'A' | 'B' | 'C' | 'D'
  category: string
  difficulty: 'easy' | 'medium' | 'hard'
  onAnswer: (answerId: string, answerText: string) => void
  disabled?: boolean
}

export function TriviaQuestion({
  question,
  options,
  correctAnswer,
  category,
  difficulty,
  onAnswer,
  disabled = false,
}: TriviaQuestionProps) {
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)

  const difficultyColors = {
    easy: 'bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20',
    medium: 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20',
    hard: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20',
  }

  const handleOptionClick = (option: { id: string; text: string }) => {
    if (disabled || selectedAnswer) return
    setSelectedAnswer(option.id)
    onAnswer(option.id, option.text)
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="w-full"
    >
      <div className="rounded-xl border border-border bg-card/50 backdrop-blur-sm overflow-hidden">
        {/* Header */}
        <div className="px-4 py-3 border-b border-border/50 flex items-center justify-between gap-2 bg-muted/30">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-xs font-medium text-muted-foreground">Trivia Time</span>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-[10px] px-2 py-0">
              {category}
            </Badge>
            <Badge
              variant="outline"
              className={cn("text-[10px] px-2 py-0 capitalize", difficultyColors[difficulty])}
            >
              {difficulty}
            </Badge>
          </div>
        </div>

        {/* Question */}
        <div className="p-4">
          <p className="text-sm font-medium leading-relaxed mb-4">
            {question}
          </p>

          {/* Options */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {options.map((option, index) => {
              const isSelected = selectedAnswer === option.id
              const isDisabled = disabled || selectedAnswer !== null

              return (
                <motion.button
                  key={option.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => handleOptionClick(option)}
                  disabled={isDisabled}
                  className={cn(
                    "relative flex items-start gap-3 p-3 rounded-lg border text-left transition-all",
                    "hover:border-primary/50 hover:bg-primary/5",
                    "focus:outline-none focus:ring-2 focus:ring-primary/20 focus:ring-offset-2 focus:ring-offset-background",
                    "disabled:cursor-not-allowed",
                    isSelected
                      ? "border-primary bg-primary/10"
                      : "border-border bg-background/50",
                    isDisabled && !isSelected && "opacity-50"
                  )}
                >
                  {/* Option ID badge */}
                  <span
                    className={cn(
                      "shrink-0 h-6 w-6 rounded-md flex items-center justify-center text-xs font-semibold",
                      isSelected
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                    )}
                  >
                    {option.id}
                  </span>

                  {/* Option text */}
                  <span className="text-sm leading-relaxed pt-0.5">
                    {option.text}
                  </span>
                </motion.button>
              )
            })}
          </div>
        </div>
      </div>
    </motion.div>
  )
}
