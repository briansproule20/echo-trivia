'use client'

import { CommunityLoreSection } from '@/components/trivia/CommunityLoreSection'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { DotBackground } from '@/components/ui/dot-background'
import { CometCard } from '@/components/ui/comet-card'
import Image from 'next/image'
import Link from 'next/link'
import { Castle } from 'lucide-react'

export default function LorePage() {
  return (
    <DotBackground className="min-h-screen">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto space-y-8">
          {/* Page Header */}
          <div className="text-center mb-6 space-y-4">
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
              The legend of the Trivia Wizard and the endless work of maintenance
            </p>
          </div>

          {/* The Tower Archive */}
          <div className="space-y-8 py-4">
            <div className="space-y-6">
              <h2 className="text-2xl sm:text-3xl font-bold text-center mb-8">
                The Tower Archive
              </h2>

              {/* Mobile: Card on top, text below */}
              <div className="md:hidden flex justify-center items-center pb-8">
                <CometCard className="w-full">
                  <div
                    className="flex w-full cursor-pointer flex-col items-stretch rounded-[16px] border-0 bg-card/80 backdrop-blur-sm p-8"
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

              {/* Desktop: Text wraps around card on left */}
              <div className="relative">
                {/* Card floated left on desktop */}
                <div className="hidden md:block float-left mr-10 mb-6 -ml-4">
                  <CometCard>
                    <div
                      className="flex w-96 cursor-pointer flex-col items-stretch rounded-[16px] border-0 bg-card/80 backdrop-blur-sm p-6"
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

                <div className="prose prose-lg dark:prose-invert max-w-none space-y-6">
                <p className="text-foreground/90 leading-relaxed text-lg">
                  At the top of the world sits the Tower. A spire of glass and stone that pierces the clouds. Inside, the Wizard keeps watch. His chamber is part archive, part library, part greenhouse. Shelves of ancient texts spiral upward into shadow. Vines heavy with glowing fruit wind between reading desks. The air smells of old paper and living things, with a hint of dust settling in forgotten corners.
                </p>

                <p className="text-foreground/90 leading-relaxed text-lg">
                  Through crystalline windows that show every corner of the world, the Wizard watches for Drift. That slow entropy that creeps through unattended systems. Maps fall out of alignment with territories. Shared references start to contradict each other. The signal degrades into static. Left alone long enough, any structure returns to noise.
                </p>

                <p className="text-foreground/90 leading-relaxed text-lg">
                  The Wizard has seen archives crumble this way. Not through fire or conquest, but through quiet neglect. When the pages go unturned, the ink fades. When the questions stop, the answers lose their shape. Ignorance isn't an enemy with intent. It's the fog that rolls in when the lanterns burn down. The cracks that widen when no one patches them.
                </p>

                <p className="text-foreground/90 leading-relaxed text-lg">
                  So he works. His hands move across maps and tomes, retracing faded lines, cross-referencing sources before they contradict themselves entirely. He cultivates questions the way others maintain infrastructure. Carefully. Deliberately. Knowing that the right inquiry at the right time can reinforce a structure before it buckles. He sends them out into the world through channels both arcane and mundane.
                </p>

                <p className="text-foreground/90 leading-relaxed text-lg">
                  This isn't a war. There's no enemy to defeat, no final victory to claim. It's maintenance. The endless, necessary work of keeping shared systems legible. The Wizard's tools are simple: clarity, precision, the patient act of checking one thing against another.
                </p>

                {/* Mobile: Tower card on top */}
                <div className="md:hidden flex justify-center items-center py-4">
                  <CometCard className="w-full">
                    <div
                      className="flex w-full cursor-pointer flex-col items-stretch rounded-[16px] border-0 bg-card/80 backdrop-blur-sm p-8"
                      style={{
                        transformStyle: "preserve-3d",
                        transform: "none",
                        opacity: 1,
                      }}
                    >
                      <div className="mx-2 flex-1">
                        <div className="relative mt-2 aspect-[3/4] w-full">
                          <Image
                            src="/trivwiztower.png"
                            alt="The Wizard's Tower"
                            fill
                            className="rounded-[16px] object-cover"
                            style={{
                              boxShadow: "rgba(0, 0, 0, 0.05) 0px 5px 6px 0px",
                            }}
                          />
                        </div>
                      </div>
                      <div className="mt-2 flex flex-shrink-0 items-center justify-center p-4 font-mono">
                        <div className="text-sm font-semibold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                          The Wizard's Tower
                        </div>
                      </div>
                    </div>
                  </CometCard>
                </div>

                {/* Desktop: Tower card floated right */}
                <div className="hidden md:block float-right ml-10 mb-6 -mr-4">
                  <CometCard>
                    <div
                      className="flex w-72 cursor-pointer flex-col items-stretch rounded-[16px] border-0 bg-card/80 backdrop-blur-sm p-6"
                      style={{
                        transformStyle: "preserve-3d",
                        transform: "none",
                        opacity: 1,
                      }}
                    >
                      <div className="mx-2 flex-1">
                        <div className="relative mt-2 aspect-[3/4] w-full">
                          <Image
                            src="/trivwiztower.png"
                            alt="The Wizard's Tower"
                            fill
                            className="rounded-[16px] object-cover"
                            style={{
                              boxShadow: "rgba(0, 0, 0, 0.05) 0px 5px 6px 0px",
                            }}
                          />
                        </div>
                      </div>
                      <div className="mt-2 flex flex-shrink-0 items-center justify-center p-4 font-mono">
                        <div className="text-sm font-semibold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                          The Wizard's Tower
                        </div>
                      </div>
                    </div>
                  </CometCard>
                </div>

                <p className="text-foreground/90 leading-relaxed text-lg">
                  In the Tower's highest chamber, surrounded by the accumulated patterns of ages, the Wizard tends his signal garden. Each answer he verifies plants the seed for ten more checks. The work compounds. The work never ends. Below, the world continues. Its systems wobbling, its references slowly misaligning, but not yet collapsed. Not while someone still calibrates. Not while the questions keep running.
                </p>

                <p className="text-foreground/90 leading-relaxed text-lg">
                  But the Wizard cannot maintain it alone. One mind, however vast, cannot counter the entropy that spreads across millions of unattended details. So he reaches out with puzzles. Small diagnostic challenges scattered across the world like sensor probes. Those who solve them, who feel the pull of pattern-recognition, who can't resist checking whether the map still matches the territory... these are the ones who find their way to the Tower.
                </p>

                <p className="text-foreground/90 leading-relaxed text-lg">
                  They come from everywhere. The detail-oriented and the pattern-hungry. The ones who notice when something doesn't quite line up. The Wizard shows them the work, and they recognize it. They understand that systems require tending. That clarity degrades without effort. That the simple act of paying attention holds back the fog.
                </p>

                <p className="text-foreground/90 leading-relaxed text-lg">
                  They become the Legion. Maintainers, not soldiers. Calibrators, not crusaders. They carry the Wizard's questions into places the Tower's light cannot reach. Into the cracks and corners where drift accumulates fastest.
                </p>

                <p className="text-foreground/90 leading-relaxed italic text-center pt-4 text-xl">
                  The work continues. The Tower holds. The Legion grows.
                </p>

                {/* Campaign CTA */}
                <div className="flex justify-center pt-6">
                  <Button asChild size="lg" className="gap-2">
                    <Link href="/campaign">
                      <Castle className="h-5 w-5" />
                      Climb the Tower
                    </Link>
                  </Button>
                </div>
              </div>
              </div>
            </div>
          </div>
          <div className="clear-both"></div>

          {/* Community Lore Card */}
          <CommunityLoreSection />
        </div>
      </div>
    </DotBackground>
  )
}
