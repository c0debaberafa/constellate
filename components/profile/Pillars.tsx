"use client";

import { useState } from "react";
import {
  Heart,
  Flower,
  Flame,
  Sparkles,
  Atom,
  Waves,
  Wind,
  Eclipse,
  Rainbow,
  Moon,
  Brain,
  Sprout,
  Anchor,
  Snowflake,
  Rose,
  TreePalm,
  TreePine,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";

export type IconName =
  | "Flame"
  | "Atom"
  | "Waves"
  | "Wind"
  | "Eclipse"
  | "Rainbow"
  | "Moon"
  | "Heart"
  | "Brain"
  | "Flower"
  | "Sprout"
  | "Anchor"
  | "Snowflake"
  | "Rose"
  | "TreePalm"
  | "TreePine";

export interface Pillar {
  iconName?: IconName;
  title: string;
  description: string;
  motivation?: string;
  color: "primary" | "accent" | "muted" | "secondary";
}

interface PillarsProps {
  pillars?: Pillar[];
  isEmpty?: boolean;
}

const iconComponents: Record<
  IconName,
  React.ComponentType<{ className?: string }>
> = {
  Flame,
  Atom,
  Waves,
  Wind,
  Eclipse,
  Rainbow,
  Moon,
  Heart,
  Brain,
  Flower,
  Sprout,
  Anchor,
  Snowflake,
  Rose,
  TreePalm,
  TreePine,
};

interface PillarCardProps {
  pillar: Pillar;
}

function PillarCard({ pillar }: PillarCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  const IconComponent =
    (pillar.iconName && iconComponents[pillar.iconName]) || Heart;

  return (
    <Card
      className={cn(
        "p-6 transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 border border-border",
        isHovered ? "border-primary/40" : ""
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="inline-flex p-3 rounded-xl mb-4 bg-muted/60">
        <span
          className={cn(isHovered ? "text-primary" : "text-muted-foreground")}
        >
          <IconComponent className="w-6 h-6" />
        </span>
      </div>
      <h3
        className={cn("text-xl font-semibold text-foreground mb-2 font-mono")}
      >
        {pillar.title}
      </h3>
      <p
        className={cn(
          "text-sm leading-relaxed font-mono transition-colors duration-200",
          isHovered ? "text-primary" : "text-muted-foreground"
        )}
      >
        {isHovered && pillar.motivation
          ? pillar.motivation
          : pillar.description}
      </p>
    </Card>
  );
}

const defaultPillars: Pillar[] = [
  {
    iconName: "Heart",
    title: "Connection",
    description:
      "You draw energy from meaningful relationships. Depth over breadth, always.",
    color: "accent",
  },
  {
    iconName: "Flower",
    title: "Growth",
    description:
      "A quiet but persistent pull toward becoming. You&apos;re never quite done learning.",
    color: "primary",
  },
  {
    iconName: "Flame",
    title: "Expression",
    description:
      "The need to create and share what&apos;s inside you. Words, ideas, art — it matters.",
    color: "secondary",
  },
  {
    iconName: "TreePine",
    title: "Presence",
    description:
      "Grounding yourself in the now. Finding peace in small, ordinary moments.",
    color: "muted",
  },
];

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
          <h2 className="text-2xl font-semibold text-primary font-mono">
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

      <p className="text-muted-foreground mb-6 text-sm font-mono">
        The foundations you return to, even when you don&apos;t notice.
      </p>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {pillars.map((pillar, index) => {
          return <PillarCard key={index} pillar={pillar} />;
        })}
      </div>
    </section>
  );
}
