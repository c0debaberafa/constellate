"use client";

import { SignedIn, SignedOut, SignUpButton, SignInButton } from "@clerk/nextjs";
import { BookOpen, Sparkles, PenSquare, Brain } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function Home() {
  return (
    <div className="w-[95%] md:w-[80%] mt-16 px-4 py-12">
      <div className="max-w-6xl mx-auto space-y-20">
        {/* Hero */}
        <section className="grid gap-10 md:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] items-center">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-background/60 px-3 py-1 text-xs font-mono text-muted-foreground">
              <Sparkles className="h-3 w-3 text-primary" />
              <span>Focused reflection, every day.</span>
            </div>

            <div className="space-y-4">
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-semibold tracking-tight">
                Build a mind you trust,
                <span className="block text-primary">one entry at a time.</span>
              </h1>
              <p className="text-base sm:text-lg text-muted-foreground max-w-xl leading-relaxed">
                Constellate is your daily reflection companion — a calm space
                designed for uninterrupted stream-of-consciousness writing. Dump
                your unfiltered emotions, track your progress, and watch as AI
                transforms your raw thoughts into deeper understanding of
                yourself.
              </p>
            </div>

            <div className="flex flex-col gap-3 pt-2">
              <SignedOut>
                <div className="flex flex-col sm:flex-row gap-3">
                  <SignUpButton mode="modal">
                    <Button size="lg" className="w-full sm:w-auto gap-2">
                      <PenSquare className="h-4 w-4" />
                      Sign up now
                    </Button>
                  </SignUpButton>
                  <SignInButton mode="modal">
                    <Button
                      variant="outline"
                      size="lg"
                      className="w-full sm:w-auto border-dashed"
                    >
                      Sign in
                    </Button>
                  </SignInButton>
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground font-mono">
                  Start your first entry immediately after signing up.
                </p>
              </SignedOut>

              <SignedIn>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Link href="/new-entry">
                    <Button size="lg" className="w-full sm:w-auto gap-2">
                      <PenSquare className="h-4 w-4" />
                      Create new entry
                    </Button>
                  </Link>
                  <div className="flex gap-3">
                    <Link href="/journal" className="w-full sm:w-auto">
                      <Button
                        variant="outline"
                        size="lg"
                        className="w-full sm:w-auto border-dashed"
                      >
                        View your journal
                      </Button>
                    </Link>
                    <Link href="/insights" className="hidden sm:block">
                      <Button
                        variant="ghost"
                        size="lg"
                        className="gap-2 text-muted-foreground"
                      >
                        <Sparkles className="h-4 w-4" />
                        Insights
                      </Button>
                    </Link>
                  </div>
                </div>
              </SignedIn>
            </div>

            <p className="text-xs sm:text-sm text-muted-foreground font-mono">
              No feeds. No noise. Just you, your thoughts, and a gentle nudge to
              come back tomorrow.
            </p>
          </div>

          {/* Hero Visual - Inspired by Insights page */}
          <Card className="relative overflow-hidden border-border/60 bg-gradient-to-br from-primary/5 via-background to-secondary/10 p-6 md:p-8">
            <div className="absolute inset-x-8 -top-8 h-24 bg-primary/10 blur-3xl" />
            <div className="relative space-y-6">
              {/* Preview of insights components */}
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-primary/10">
                    <Brain className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground/70 font-mono">
                      Your evolving profile
                    </p>
                    <p className="text-sm text-foreground font-mono">
                      Grows with every entry
                    </p>
                  </div>
                </div>

                <div className="rounded-xl border border-primary/20 bg-background/70 p-4 space-y-3">
                  <div className="flex items-start gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                    <p className="text-xs text-muted-foreground/90 leading-relaxed font-mono">
                      Each entry gets notes, summaries, and annotations
                    </p>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-primary/80 mt-2 flex-shrink-0" />
                    <p className="text-xs text-muted-foreground/90 leading-relaxed font-mono">
                      Your overall profile evolves and deepens over time
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="rounded-lg border border-border/50 bg-primary/5 p-3 text-center">
                    <p className="text-lg font-semibold text-primary font-mono">
                      12
                    </p>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wide font-mono">
                      Day Streak
                    </p>
                  </div>
                  <div className="rounded-lg border border-border/50 bg-accent/5 p-3 text-center">
                    <p className="text-lg font-semibold text-primary font-mono">
                      47
                    </p>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wide font-mono">
                      Entries
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t border-border/40">
                <span className="font-mono">Designed for deep reflection.</span>
                <div className="inline-flex items-center gap-1 rounded-full bg-background/80 px-2 py-1 border border-border/60">
                  <BookOpen className="h-3 w-3 text-primary" />
                  <span className="text-[10px] uppercase tracking-[0.16em] font-mono">
                    Constellate
                  </span>
                </div>
              </div>
            </div>
          </Card>
        </section>

        {/* Features section */}
        <section className="grid gap-6 md:grid-cols-3">
          <Card className="p-6 h-full bg-background/60 border-border/60 hover:border-primary/40 transition-colors">
            <div className="flex items-center gap-2 mb-4">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground font-mono">
                Daily practice
              </p>
            </div>
            <h3 className="text-base font-semibold mb-3 font-mono">
              Write without friction
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed font-mono">
              Experience{" "}
              <span className="text-primary font-semibold">
                zen typing mode
              </span>{" "}
              — a distraction-free writing environment where the UI fades away
              as you type, allowing for uninterrupted stream-of-consciousness
              writing. Designed with{" "}
              <span className="text-primary font-semibold">
                The Artist&apos;s Way
              </span>{" "}
              in mind, this process helps you dump all your unfiltered emotions
              for Constellate to process later. Restore your focus and let your
              thoughts flow freely.
            </p>
          </Card>

          <Card className="p-6 h-full bg-background/60 border-border/60 hover:border-primary/40 transition-colors">
            <div className="flex items-center gap-2 mb-4">
              <span className="h-1.5 w-1.5 rounded-full bg-primary/80" />
              <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground font-mono">
                Structured journaling
              </p>
            </div>
            <h3 className="text-base font-semibold mb-3 font-mono">
              Track streaks & stats
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed font-mono">
              Your dashboard visualizes your journaling journey with streak
              tracking, word count analytics, and time-based insights. See your
              consistency across the month, watch your writing patterns emerge,
              and turn daily check-ins into a visible, motivating practice that
              builds over time.
            </p>
          </Card>

          <Card className="p-6 h-full bg-background/60 border-border/60 hover:border-primary/40 transition-colors">
            <div className="flex items-center gap-2 mb-4">
              <span className="h-1.5 w-1.5 rounded-full bg-primary/60" />
              <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground font-mono">
                Deeper insights
              </p>
            </div>
            <h3 className="text-base font-semibold mb-3 font-mono">
              AI-powered understanding
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed font-mono">
              Every journal entry receives personalized notes, summaries, and
              annotations. Your overall user profile grows and evolves with each
              entry, revealing patterns, themes, and insights you might not
              notice on your own. Watch as Constellate reflects back the person
              you&apos;re becoming.
            </p>
          </Card>
        </section>
      </div>
    </div>
  );
}
