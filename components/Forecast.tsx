"use client";

import { Stars, RefreshCw, Sparkles } from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";

interface ForecastProps {
  forecast?: string;
  isEmpty?: boolean;
}

export default function Forecast({ forecast, isEmpty = false }: ForecastProps) {
  const [currentForecast, setCurrentForecast] = useState<string | null>(
    forecast || null
  );

  // Update forecast when prop changes
  useEffect(() => {
    setCurrentForecast(forecast || null);
  }, [forecast]);

  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = () => {
    setIsRefreshing(true);
    // Just reload the page to get fresh data
    setTimeout(() => {
      window.location.reload();
    }, 600);
  };

  return (
    <section className="mb-12">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 rounded-xl bg-primary/10">
          <Stars className="w-5 h-5 text-primary" />
        </div>
        <h2 className="text-2xl font-semibold text-primary font-mono">
          Forecast
        </h2>
      </div>

      <p className="text-muted-foreground mb-6 font-mono">
        A gentle reflection drawn from your recent entries. Not a prediction — a
        mirror.
      </p>

      {isEmpty || !currentForecast ? (
        <Card className="p-8">
          <div className="text-center py-8">
            <div className="w-16 h-16 rounded-full bg-muted mx-auto mb-4 flex items-center justify-center">
              <Sparkles className="w-8 h-8 text-muted-foreground/50" />
            </div>
            <p className="text-muted-foreground mb-2 font-mono">
              Your forecast is forming.
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
                "text-xl md:text-2xl text-primary leading-relaxed text-center italic max-w-2xl mx-auto transition-opacity duration-300 font-mono",
                isRefreshing && "opacity-0"
              )}
            >
              &quot;{currentForecast}&quot;
            </p>
          </div>
        </div>
      )}
    </section>
  );
}
