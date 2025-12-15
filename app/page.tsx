"use client";

import { SignedIn, SignedOut, SignUpButton, SignInButton } from "@clerk/nextjs";
import { BookOpen, Sparkles, Target, PenSquare } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
export default function Home() {
  return (
    <div className="w-[95%] md:w-[80%] mt-16 px-4 py-12">
      <div className="max-w-6xl mx-auto space-y-16">
        {/* Hero */}
        <section className="grid gap-10 md:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] items-center">
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
              <p className="text-base sm:text-lg text-muted-foreground max-w-xl">
                Fred is your daily reflection companion — a calm space to write,
                track your streaks, and surface insights from the life
                you&apos;re actually living.
              </p>
            </div>

            <div className="flex flex-col gap-3 pt-2">
              <SignedOut>
                <div className="flex flex-col sm:flex-row gap-3">
                  <SignUpButton mode="modal">
                    <Button size="lg" className="w-full sm:w-auto gap-2">
                      <PenSquare className="h-4 w-4" />
                      Sign up to begin
                    </Button>
                  </SignUpButton>
                  <SignInButton mode="modal">
                    <Button
                      variant="outline"
                      size="lg"
                      className="w-full sm:w-auto border-dashed"
                    >
                      Already journaling? Sign in
                    </Button>
                  </SignInButton>
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground font-mono">
                  You&apos;ll land right back here after you create an account.
                </p>
              </SignedOut>

              <SignedIn>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Link href="/new-entry">
                    <Button size="lg" className="w-full sm:w-auto gap-2">
                      <PenSquare className="h-4 w-4" />
                      Begin a new entry
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

          <Card className="relative overflow-hidden border-border/60 bg-gradient-to-br from-primary/5 via-background to-secondary/10 px-6 py-8 md:px-7 md:py-9">
            <div className="absolute inset-x-8 -top-8 h-24 bg-primary/10 blur-3xl" />
            <div className="relative space-y-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-primary/10">
                  <Target className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground/70">
                    Today&apos;s prompt
                  </p>
                  <p className="text-sm text-foreground">
                    &quot;What quietly moved the needle for you today?&quot;
                  </p>
                </div>
              </div>

              <div className="rounded-xl border border-dashed border-border/70 bg-background/70 p-4 space-y-2">
                <p className="text-xs text-muted-foreground">
                  From your journal
                </p>
                <p className="text-sm text-muted-foreground/90 leading-relaxed">
                  Patterns, streaks, and small wins are surfaced for you on the
                  dashboard and insights pages — so writing stays simple, and
                  reflection gets richer over time.
                </p>
              </div>

              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Designed for unhurried, honest writing.</span>
                <div className="inline-flex items-center gap-1 rounded-full bg-background/80 px-2 py-1 border border-border/60">
                  <BookOpen className="h-3 w-3 text-primary" />
                  <span className="text-[10px] uppercase tracking-[0.16em]">
                    Fred journal
                  </span>
                </div>
              </div>
            </div>
          </Card>
        </section>

        {/* Secondary section */}
        <section className="grid gap-6 md:grid-cols-3">
          <Card className="p-5 h-full bg-background/60 border-border/60">
            <div className="flex items-center gap-2 mb-3">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
                Daily practice
              </p>
            </div>
            <h3 className="text-sm font-medium mb-2">Write without friction</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              A focused, minimal editor that lets you drop in, unload your day,
              and step out — no formatting rabbit holes or productivity theater.
            </p>
          </Card>

          <Card className="p-5 h-full bg-background/60 border-border/60">
            <div className="flex items-center gap-2 mb-3">
              <span className="h-1.5 w-1.5 rounded-full bg-primary/80" />
              <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
                Gentle structure
              </p>
            </div>
            <h3 className="text-sm font-medium mb-2">
              See your streaks & stats
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Your dashboard shows entries, word counts, and streaks across the
              month, turning tiny check-ins into a visible, motivating pattern.
            </p>
          </Card>

          <Card className="p-5 h-full bg-background/60 border-border/60">
            <div className="flex items-center gap-2 mb-3">
              <span className="h-1.5 w-1.5 rounded-full bg-primary/60" />
              <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
                Deeper insight
              </p>
            </div>
            <h3 className="text-sm font-medium mb-2">Let Fred reflect back</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Insights and gentle fortunes are drawn from your entries over
              time, offering mirrors — not verdicts — on the themes shaping your
              days.
            </p>
          </Card>
        </section>
      </div>
    </div>
  );
}
