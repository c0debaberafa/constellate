"use client";

import { Sprout, ChevronDown } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";

interface LivingEssayProps {
  content?: string;
  isEmpty?: boolean;
}

export default function LivingEssay({
  content,
  isEmpty = false,
}: LivingEssayProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const sampleContent = `Your journal entries over the past few months reveal a person in beautiful transition. There's a recurring thread of seeking authenticity — not the performative kind, but the quiet, honest kind that emerges when no one is watching.

You write often about small moments: the way morning light falls through your window, conversations that felt meaningful, the gap between who you are and who you're becoming. This attention to nuance suggests a deepening relationship with your inner life.

There's also a gentle wrestling with ambition. You want to create, to matter, to leave something behind — but you're learning that rushing doesn't serve you. The entries from late evenings often carry more tenderness than those written in the hurried mornings.

What strikes me most is your growing capacity for self-compassion. Earlier entries held more judgment; recent ones hold more curiosity. You're learning to be a kinder witness to your own unfolding.`;

  if (isEmpty) {
    return (
      <section className="mb-12">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-xl bg-primary/10">
            <Sprout className="w-5 h-5 text-primary" />
          </div>
          <h2 className="text-2xl font-semibold text-foreground font-mono">
            Living Essay
          </h2>
        </div>

        <Card className="p-8">
          <div className="text-center py-8">
            <div className="w-16 h-16 rounded-full bg-muted mx-auto mb-4 flex items-center justify-center">
              <Sprout className="w-8 h-8 text-muted-foreground/50" />
            </div>
            <p className="text-muted-foreground mb-2 font-mono">
              Your story is still being written.
            </p>
            <p className="text-sm text-muted-foreground/70 font-mono">
              Keep journaling, and I&apos;ll weave your reflections into an
              evolving narrative.
            </p>
          </div>
        </Card>
      </section>
    );
  }

  const displayContent = content || sampleContent;
  const paragraphs = displayContent.split("\n\n");
  const previewParagraphs = paragraphs.slice(0, 2);
  const hasMore = paragraphs.length > 2;

  return (
    <section className="mb-12">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 rounded-xl bg-primary/10">
          <Sprout className="w-5 h-5 text-primary" />
        </div>
        <h2 className="text-2xl font-semibold text-primary font-mono">
          Living Essay
        </h2>
      </div>

      <p className="text-muted-foreground mb-6 font-mono">
        Your story, woven from every word you've written.
      </p>

      <Card
        className={`p-8 hover:border-primary/40 transition-colors ', ${
          isExpanded ? "border-primary/40" : ""
        }`}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="prose prose-lg max-w-none">
          {(isExpanded ? paragraphs : previewParagraphs).map(
            (paragraph, index) => (
              <p
                key={index}
                className="text-foreground/90 leading-relaxed mb-4 last:mb-0 font-mono"
              >
                {paragraph}
              </p>
            )
          )}
        </div>

        {hasMore && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="mt-6 flex items-center gap-2 text-primary hover:text-primary/80 transition-colors group font-mono"
          >
            <span className="text-sm font-medium">
              {isExpanded ? "Show less" : "Continue reading"}
            </span>
            <ChevronDown
              className={cn(
                "w-4 h-4 transition-transform duration-300",
                isExpanded && "rotate-180"
              )}
            />
          </button>
        )}
      </Card>
    </section>
  );
}
