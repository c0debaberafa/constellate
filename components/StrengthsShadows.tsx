"use client";

import { Sun, Moon, Sparkles } from "lucide-react";
import { Card } from "@/components/ui/card";

interface StrengthShadowItem {
  title: string;
  writeup: string;
}

interface StrengthsShadowsProps {
  strengths?: StrengthShadowItem[];
  shadows?: StrengthShadowItem[];
  isEmpty?: boolean;
}

const defaultStrengths: StrengthShadowItem[] = [
  {
    title: "Deep empathy",
    writeup: "you feel what others feel, sometimes before they do.",
  },
  {
    title: "Pattern recognition",
    writeup: "you notice connections others miss.",
  },
  {
    title: "Resilient optimism",
    writeup: "you find light even in difficult moments.",
  },
  {
    title: "Authentic expression",
    writeup: "your words carry your true voice.",
  },
];

const defaultShadows: StrengthShadowItem[] = [
  {
    title: "Overthinking",
    writeup: "your active mind sometimes loops on worry.",
  },
  {
    title: "Self-doubt",
    writeup: "the inner critic speaks louder than it should.",
  },
  {
    title: "Boundaries",
    writeup: "saying no feels harder than it needs to be.",
  },
  {
    title: "Perfectionism",
    writeup: "good enough doesn&apos;t always feel like enough.",
  },
];

export default function StrengthsShadows({
  strengths = defaultStrengths,
  shadows = defaultShadows,
  isEmpty = false,
}: StrengthsShadowsProps) {
  return (
    <section className="mb-12">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 rounded-xl bg-primary/10">
          <Sun className="w-5 h-5 text-primary" />
        </div>
        <h2 className="text-2xl font-semibold text-primary font-mono">
          Strengths &amp; Shadows
        </h2>
      </div>

      <p className="text-muted-foreground mb-6 font-mono">
        The light you stand in, and the darkness behind you.
      </p>

      {isEmpty ? (
        <Card className="p-8">
          <div className="text-center py-8">
            <div className="w-16 h-16 rounded-full bg-muted mx-auto mb-4 flex items-center justify-center">
              <Sparkles className="w-8 h-8 text-muted-foreground/50" />
            </div>
            <p className="text-muted-foreground mb-2 font-mono">
              Still learning who you are.
            </p>
            <p className="text-sm text-muted-foreground/70 font-mono">
              Your strengths and shadows will emerge as you continue to reflect.
            </p>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Strengths */}
          <Card className="border-primary/20 bg-gradient-to-br from-primary/10 to-card p-6">
            <div className="flex items-center gap-2 mb-5">
              <Sun className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-semibold text-foreground font-mono">
                Where You Shine
              </h3>
            </div>
            <ul className="space-y-4">
              {strengths.map((strength, index) => (
                <li key={index} className="flex gap-3">
                  <span className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-primary mt-2.5" />
                  <span className="text-foreground/85 text-sm leading-relaxed font-mono">
                    <span className="font-bold text-primary">
                      {strength.title}
                    </span>{" "}
                    — {strength.writeup}
                  </span>
                </li>
              ))}
            </ul>
          </Card>

          {/* Shadows */}
          <Card className="border-accent/30 bg-gradient-to-br from-accent/20 to-card p-6">
            <div className="flex items-center gap-2 mb-5">
              <Moon className="w-5 h-5 text-accent-foreground/70" />
              <h3 className="text-lg font-semibold text-foreground font-mono">
                What You&apos;re Working Through
              </h3>
            </div>
            <ul className="space-y-4">
              {shadows.map((shadow, index) => (
                <li key={index} className="flex gap-3">
                  <span className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-accent-foreground/50 mt-2.5" />
                  <span className="text-foreground/85 text-sm leading-relaxed font-mono">
                    <span className="font-bold text-primary">
                      {shadow.title}
                    </span>{" "}
                    — {shadow.writeup}
                  </span>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      )}
    </section>
  );
}
