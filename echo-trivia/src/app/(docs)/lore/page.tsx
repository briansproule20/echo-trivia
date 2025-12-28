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

                <div className="prose prose-sm sm:prose-base dark:prose-invert max-w-none space-y-4">
                <p className="text-muted-foreground leading-relaxed">
                  At the apex of the world sits the Tower—a spire of glass and stone that pierces the clouds.
                  Within its highest chamber, the Wizard maintains his vigil. The space defies easy description:
                  part archive, part library, part greenhouse. Shelves of ancient texts spiral upward into shadow,
                  their spines growing faint where no one has read them in years. Vines heavy with luminescent
                  fruit wind between reading desks, their glow dimming in neglected corners. The air smells of
                  old paper and living things—and faintly, of dust accumulating where attention has lapsed.
                </p>

                <p className="text-muted-foreground leading-relaxed">
                  Through crystalline windows that show every corner of the world, the Wizard watches for Drift—that
                  slow entropy that seeps through unattended systems. It is not malice. It is simply what happens
                  when no one shows up. Maps fall out of alignment with territories. Shared references fray at the
                  edges. The signal degrades into static. Left alone long enough, any structure returns to noise.
                </p>

                <p className="text-muted-foreground leading-relaxed">
                  The Wizard has seen archives crumble this way. Not through fire or conquest, but through quiet
                  neglect. When the pages go unturned, the ink fades. When the questions stop, the answers lose
                  their shape. Ignorance is not an enemy with intent—it is the fog that rolls in when the lanterns
                  burn down. The cracks that widen when no one patches them. The constellation that drifts from
                  its chart because no one bothered to look up.
                </p>

                <p className="text-muted-foreground leading-relaxed">
                  So he works. His hands move across maps and tomes, retracing faded lines, cross-referencing
                  sources before they contradict themselves entirely. He cultivates questions the way others
                  maintain infrastructure—carefully, deliberately, knowing that the right inquiry at the right
                  time can reinforce a structure before it buckles. He sends them out into the world through
                  channels both arcane and mundane: small calibrations against the accumulating drift.
                </p>

                <p className="text-muted-foreground leading-relaxed">
                  This is not a war. There is no enemy to defeat, no final victory to claim. It is maintenance.
                  It is the endless, necessary work of keeping shared systems legible. The Wizard's tools are
                  simple: clarity, precision, the patient act of checking one thing against another. Curiosity
                  as upkeep. Attention as repair.
                </p>

                <p className="text-muted-foreground leading-relaxed">
                  In the Tower's highest chamber, surrounded by the accumulated patterns of ages, the Wizard
                  tends his signal garden. Each answer he verifies plants the seed for ten more checks. The work
                  compounds. The work never ends. Below, the world continues—its systems wobbling, its references
                  slowly misaligning, but not yet collapsed. Not while someone still calibrates. Not while the
                  questions keep running.
                </p>

                <p className="text-muted-foreground leading-relaxed">
                  But the Wizard cannot maintain it alone. One mind, however vast, cannot counter the entropy
                  that spreads across millions of unattended details. So he reaches out—not with commands, but
                  with puzzles. Small diagnostic challenges scattered across the world like sensor probes. Those
                  who solve them, who feel the pull of pattern-recognition, who cannot resist checking whether
                  the map still matches the territory—these are the ones who find their way to the Tower.
                </p>

                <p className="text-muted-foreground leading-relaxed">
                  They come from everywhere. The detail-oriented and the pattern-hungry. The ones who notice
                  when something doesn't quite line up. Each one a node in a larger maintenance network. The
                  Wizard does not command them—he shows them the work, and they recognize it. They understand
                  that systems require tending. That clarity degrades without effort. That the simple act of
                  paying attention holds back the fog.
                </p>

                <p className="text-muted-foreground leading-relaxed">
                  They become the Legion. Not soldiers but maintainers. Not crusaders but calibrators. They
                  carry the Wizard's questions into places the Tower's light cannot reach—into the cracks and
                  corners where drift accumulates fastest. Where entropy whispers that close enough is good
                  enough, they answer with precision. And verification. And another question.
                </p>

                <p className="text-muted-foreground leading-relaxed italic text-center pt-4">
                  The work continues. The Tower holds. And the Legion grows.
                </p>
              </div>
              </div>
            </div>
          </div>
          <div className="clear-both"></div>

          {/* Glossary */}
          <div className="space-y-6 py-8 border-t border-border">
            <h2 className="text-2xl sm:text-3xl font-bold text-center">
              Glossary
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1 p-4 rounded-lg bg-card/50 border border-border/50">
                <h3 className="font-semibold text-primary">Tower</h3>
                <p className="text-sm text-muted-foreground">
                  The Wizard's archive-spire at the apex of the world. Part library, part greenhouse,
                  part monitoring station. Each floor holds a different category of knowledge requiring verification.
                </p>
              </div>
              <div className="space-y-1 p-4 rounded-lg bg-card/50 border border-border/50">
                <h3 className="font-semibold text-primary">Archive</h3>
                <p className="text-sm text-muted-foreground">
                  The accumulated records of shared understanding—texts, maps, patterns. Without active
                  maintenance, the Archive fades: ink grows pale, references contradict, pages fray.
                </p>
              </div>
              <div className="space-y-1 p-4 rounded-lg bg-card/50 border border-border/50">
                <h3 className="font-semibold text-primary">Ignorance</h3>
                <p className="text-sm text-muted-foreground">
                  Not malice, but entropy. The fog that rolls in when lanterns burn down. The static
                  that replaces signal when no one checks the frequency. What remains when maintenance lapses.
                </p>
              </div>
              <div className="space-y-1 p-4 rounded-lg bg-card/50 border border-border/50">
                <h3 className="font-semibold text-primary">Drift</h3>
                <p className="text-sm text-muted-foreground">
                  The slow misalignment between maps and territories, between records and reality.
                  Uncorrected drift compounds until systems become illegible.
                </p>
              </div>
              <div className="space-y-1 p-4 rounded-lg bg-card/50 border border-border/50">
                <h3 className="font-semibold text-primary">Signal</h3>
                <p className="text-sm text-muted-foreground">
                  Clarity. Coherence. The state of a system when its parts still reference each other
                  accurately. Maintaining signal requires continuous attention.
                </p>
              </div>
              <div className="space-y-1 p-4 rounded-lg bg-card/50 border border-border/50">
                <h3 className="font-semibold text-primary">Puzzles</h3>
                <p className="text-sm text-muted-foreground">
                  Diagnostic challenges the Wizard scatters across the world. Each one a small calibration
                  check. Those who solve them reveal themselves as potential maintainers.
                </p>
              </div>
              <div className="space-y-1 p-4 rounded-lg bg-card/50 border border-border/50">
                <h3 className="font-semibold text-primary">Legion</h3>
                <p className="text-sm text-muted-foreground">
                  The network of seekers who tend the Archive alongside the Wizard. Not soldiers or
                  crusaders—maintainers. They carry questions into the cracks where drift accumulates.
                </p>
              </div>
              <div className="space-y-1 p-4 rounded-lg bg-card/50 border border-border/50">
                <h3 className="font-semibold text-primary">Questions</h3>
                <p className="text-sm text-muted-foreground">
                  The Wizard's primary tool. Each question is a probe, a verification check, a small
                  act of resistance against accumulating entropy. Answers plant seeds for further inquiry.
                </p>
              </div>
            </div>
          </div>

          {/* Community Lore Card */}
          <CommunityLoreSection />
        </div>
      </div>
    </DotBackground>
  )
}
