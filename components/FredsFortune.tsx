"use client";

import { Stars, RefreshCw, Sparkles } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";

interface FredsFortuneProps {
  forecast?: string;
  isEmpty?: boolean;
}

const forecasts = [
  "The seeds you&apos;ve planted in quiet moments are beginning to stir. Trust the timing — some growth happens beneath the surface.",
  "You&apos;re closer to a breakthrough than you think. The fog you&apos;ve been feeling isn&apos;t confusion — it&apos;s the edge of something new trying to form.",
  "A conversation you&apos;ve been avoiding might hold unexpected gifts. The discomfort is pointing toward growth.",
  "Your intuition has been whispering lately. Make space to listen — it knows things your mind hasn&apos;t caught up to yet.",
  "Rest isn&apos;t retreat. The pause you&apos;re craving is part of the momentum, not a break from it.",
];

export default function FredsFortune({
  forecast,
  isEmpty = false,
}: FredsFortuneProps) {
  const [currentForecast, setCurrentForecast] = useState(
    forecast || forecasts[0]
  );
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      const newForecast =
        forecasts[Math.floor(Math.random() * forecasts.length)];
      setCurrentForecast(newForecast);
      setIsRefreshing(false);
    }, 600);
  };

  return (
    <section className="mb-12">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 rounded-xl bg-primary/10">
          <Stars className="w-5 h-5 text-primary" />
        </div>
        <h2 className="text-2xl font-semibold text-primary font-mono">
          Fred&apos;s Fortune
        </h2>
      </div>

      <p className="text-muted-foreground mb-6 font-mono">
        A gentle reflection drawn from your recent entries. Not a prediction — a
        mirror.
      </p>

      {isEmpty ? (
        <Card className="p-8">
          <div className="text-center py-8">
            <div className="w-16 h-16 rounded-full bg-muted mx-auto mb-4 flex items-center justify-center">
              <Sparkles className="w-8 h-8 text-muted-foreground/50" />
            </div>
            <p className="text-muted-foreground mb-2 font-mono">
              Your fortune is forming.
            </p>
            <p className="text-sm text-muted-foreground/70 font-mono">
              Keep writing, and I&apos;ll share gentle reflections from your
              journey.
            </p>
          </div>
        </Card>
      ) : (
        <div className="relative rounded-2xl p-8 md:p-10 overflow-hidden bg-gradient-to-br from-primary/5 via-accent/5 to-secondary/5 border border-border/50">
          {/* Decorative elements */}
          <div className="absolute top-4 right-4 text-primary/20">
            <Stars className="w-8 h-8" />
          </div>
          <div className="absolute bottom-4 left-4 text-accent-foreground/20">
            <Sparkles className="w-6 h-6" />
          </div>

          <div className="relative">
            <p
              className={cn(
                "text-xl md:text-2xl text-foreground/90 leading-relaxed text-center italic max-w-2xl mx-auto transition-opacity duration-300 font-mono",
                isRefreshing && "opacity-0"
              )}
            >
              &quot;{currentForecast}&quot;
            </p>

            <div className="flex justify-center mt-8">
              <button
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="group flex items-center gap-2 px-4 py-2 rounded-full bg-background/60 hover:bg-background/80 border border-border/50 text-muted-foreground hover:text-foreground transition-all duration-300 font-mono"
              >
                <RefreshCw
                  className={cn(
                    "w-4 h-4 transition-transform duration-300",
                    isRefreshing && "animate-spin"
                  )}
                />
                <span className="text-sm">Draw another</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
