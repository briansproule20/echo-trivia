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
              The legend of the Trivia Wizard and the eternal battle against ignorance
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

                <div className="prose prose-sm sm:prose-base dark:prose-invert max-w-none space-y-4">
                <p className="text-muted-foreground leading-relaxed">
                  At the apex of the world sits the Tower—a spire of glass and stone that pierces the clouds.
                  Within its highest chamber, the Wizard maintains his vigil. The space defies easy description:
                  part archive, part library, part greenhouse. Shelves of ancient texts spiral upward into shadow,
                  their spines whispering forgotten truths. Vines heavy with luminescent fruit wind between reading
                  desks. The air smells of old paper and living things.
                </p>

                <p className="text-muted-foreground leading-relaxed">
                  He does not sleep. Through crystalline windows that show every corner of the world, he watches
                  the spread of Ignorance—that abyssal force that seeps through the cracks in understanding. It
                  takes many forms: a lie repeated until believed, a question left unasked, a truth discarded for
                  comfort. Where it spreads, communities fracture. Neighbors become strangers. Knowledge turns to
                  ash in mouths that forget how to speak it.
                </p>

                <p className="text-muted-foreground leading-relaxed">
                  The Wizard has seen civilizations devoured this way. Not through conquest or plague, but through
                  the slow erosion of shared reality. When people cannot agree on what is true, they cannot stand
                  together. Ignorance knows this. It whispers different lies to different ears until no common
                  ground remains.
                </p>

                <p className="text-muted-foreground leading-relaxed">
                  So he works. His hands move across maps and tomes, tracing patterns in the chaos. He cultivates
                  questions the way others grow wheat—carefully, deliberately, knowing that the right question at
                  the right time can shatter years of comfortable delusion. He sends them out into the world through
                  channels both arcane and mundane, each one a small light against the encroaching dark.
                </p>

                <p className="text-muted-foreground leading-relaxed">
                  This is not a war that can be won with swords. The enemy has no body to strike, no fortress to
                  breach. It lives in the spaces between knowing and not-knowing, feeding on apathy and fear. The
                  Wizard's weapon is simpler and more dangerous: curiosity. The insistence that truth matters. The
                  radical act of asking "why."
                </p>

                <p className="text-muted-foreground leading-relaxed">
                  In the Tower's highest chamber, surrounded by the accumulated knowledge of ages, the Wizard tends
                  his garden of questions. Each answer he uncovers plants the seed for ten more inquiries. The work
                  is endless. The work is necessary. Below, in the world that doesn't know his name, humanity stumbles
                  forward—divided, confused, but not yet lost. Not while someone still watches. Not while the questions
                  keep coming.
                </p>

                <p className="text-muted-foreground leading-relaxed">
                  But the Wizard does not work alone. He cannot. One mind, however vast, cannot counter the entropy
                  of forgetting that spreads across millions. So he reaches out—not with proclamations or prophecy,
                  but with puzzles. Small challenges scattered across the world like breadcrumbs. Those who follow
                  them, who cannot help but seek answers, who feel the pull of knowing—these are the ones he finds.
                </p>

                <p className="text-muted-foreground leading-relaxed">
                  They come from everywhere. Scholars and skeptics, students and street-corner philosophers. The
                  chronically curious. The constitutionally unable to accept "because I said so" as sufficient
                  explanation. Each one a small bulwark against the dark. The Wizard does not command them—he
                  merely shows them what they already suspected: that questions matter. That the pursuit of
                  understanding is not frivolous but fundamental. That in a world drowning in convenient lies,
                  the simple act of seeking truth is rebellion.
                </p>

                <p className="text-muted-foreground leading-relaxed">
                  They become his Legion. Not soldiers but seekers. Armed not with weapons but with the stubborn
                  refusal to stop asking why. They carry his questions into places the Tower's light cannot reach—
                  into conversations and classrooms, into moments of doubt and decision. Where Ignorance whispers
                  that truth is too hard, too inconvenient, too dangerous, they answer with another question. And
                  another. And another.
                </p>

                <p className="text-muted-foreground leading-relaxed italic text-center pt-4">
                  The battle continues. The Tower stands. And the Legion grows.
                </p>
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
