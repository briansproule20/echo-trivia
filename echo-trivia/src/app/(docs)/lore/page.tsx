'use client'

import { CommunityLoreSection } from '@/components/trivia/CommunityLoreSection'
import { Badge } from '@/components/ui/badge'
import { DotBackground } from '@/components/ui/dot-background'

export default function LorePage() {
  return (
    <DotBackground className="min-h-screen">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto space-y-8">
          {/* Page Header */}
          <div className="text-center mb-12 space-y-4">
            <Badge variant="secondary" className="mb-2">
              Lore
            </Badge>
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">
              The{" "}
              <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                Wizard's Tale
              </span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              The legend of the Trivia Wizard and the eternal battle against ignorance
            </p>
          </div>

          {/* Community Lore Card */}
          <CommunityLoreSection />

          {/* Coming Soon Message */}
          <div className="text-center py-8">
            <p className="text-muted-foreground text-sm sm:text-base">
              More lore coming soon...
            </p>
          </div>
        </div>
      </div>
    </DotBackground>
  )
}
