'use client'

import { CommunityLoreSection } from '@/components/trivia/CommunityLoreSection'
import { Badge } from '@/components/ui/badge'
import { DotBackground } from '@/components/ui/dot-background'
import { CometCard } from '@/components/ui/comet-card'
import Image from 'next/image'

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

          {/* Trivia Wizard Card */}
          <div className="flex justify-center items-center py-8 w-full">
            <CometCard className="w-full md:w-auto">
              <div
                className="flex w-full md:w-96 cursor-pointer flex-col items-stretch rounded-[16px] border-0 bg-card/80 backdrop-blur-sm p-8 md:p-6"
                style={{
                  transformStyle: "preserve-3d",
                  transform: "none",
                  opacity: 1,
                }}
              >
                <div className="mx-2 flex-1">
                  <div className="relative mt-2 aspect-[3/4] w-full">
                    <Image
                      src="/the trivia wizard.jpg"
                      alt="The Trivia Wizard"
                      fill
                      className="rounded-[16px] object-cover"
                      style={{
                        boxShadow: "rgba(0, 0, 0, 0.05) 0px 5px 6px 0px",
                      }}
                      priority
                    />
                  </div>
                </div>
                <div className="mt-2 flex flex-shrink-0 items-center justify-center p-4 font-mono">
                  <div className="text-sm font-semibold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                    The Trivia Wizard
                  </div>
                </div>
              </div>
            </CometCard>
          </div>

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
