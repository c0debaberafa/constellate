"use client";

import { Heart, Flower, Landmark, Flame, Anchor, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";

interface Pillar {
  icon: React.ReactNode;
  title: string;
  description: string;
  color: "primary" | "accent" | "muted" | "secondary";
}

interface PillarsProps {
  pillars?: Pillar[];
  isEmpty?: boolean;
}

const defaultPillars: Pillar[] = [
  {
    icon: <Heart className="w-6 h-6" />,
    title: "Connection",
    description:
      "You draw energy from meaningful relationships. Depth over breadth, always.",
    color: "accent",
  },
  {
    icon: <Landmark className="w-6 h-6" />,
    title: "Growth",
    description:
      "A quiet but persistent pull toward becoming. You&apos;re never quite done learning.",
    color: "primary",
  },
  {
    icon: <Flame className="w-6 h-6" />,
    title: "Expression",
    description:
      "The need to create and share what&apos;s inside you. Words, ideas, art — it matters.",
    color: "secondary",
  },
  {
    icon: <Anchor className="w-6 h-6" />,
    title: "Presence",
    description:
      "Grounding yourself in the now. Finding peace in small, ordinary moments.",
    color: "muted",
  },
];

const colorClasses = {
  primary: {
    bg: "bg-primary/10",
    icon: "text-primary",
    border: "border-primary/20",
  },
  accent: {
    bg: "bg-accent/40",
    icon: "text-accent-foreground",
    border: "border-accent/30",
  },
  secondary: {
    bg: "bg-secondary/50",
    icon: "text-secondary-foreground",
    border: "border-secondary/30",
  },
  muted: {
    bg: "bg-muted/60",
    icon: "text-muted-foreground",
    border: "border-muted/40",
  },
};

export default function Pillars({
  pillars = defaultPillars,
  isEmpty = false,
}: PillarsProps) {
  if (isEmpty) {
    return (
      <section className="mb-12">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-xl bg-primary/10">
            <Flower className="w-5 h-5 text-primary" />
          </div>
          <h2 className="text-2xl font-semibold text-foreground font-mono">
            Your Pillars
          </h2>
        </div>

        <Card className="p-8">
          <div className="text-center py-8">
            <div className="w-16 h-16 rounded-full bg-muted mx-auto mb-4 flex items-center justify-center">
              <Sparkles className="w-8 h-8 text-muted-foreground/50" />
            </div>
            <p className="text-muted-foreground mb-2 font-mono">
              Your pillars are forming.
            </p>
            <p className="text-sm text-muted-foreground/70 font-mono">
              As you journal more, I&apos;ll discover the themes that guide your
              life.
            </p>
          </div>
        </Card>
      </section>
    );
  }

  return (
    <section className="mb-12">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 rounded-xl bg-primary/10">
          <Flower className="w-5 h-5 text-primary" />
        </div>
        <h2 className="text-2xl font-semibold text-primary font-mono">
          Your Pillars
        </h2>
      </div>

      <p className="text-muted-foreground mb-6 font-mono">
        The foundations you return to, even when you don't notice.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {pillars.map((pillar, index) => {
          const colors = colorClasses[pillar.color];
          return (
            <Card
              key={index}
              className={cn(
                "p-6 transition-all duration-300 hover:shadow-md hover:-translate-y-0.5",
                colors.border
              )}
            >
              <div className={cn("inline-flex p-3 rounded-xl mb-4", colors.bg)}>
                <span className={colors.icon}>{pillar.icon}</span>
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2 font-mono">
                {pillar.title}
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed font-mono">
                {pillar.description}
              </p>
            </Card>
          );
        })}
      </div>
    </section>
  );
}
