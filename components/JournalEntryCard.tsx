"use client";

import { format } from "date-fns";
import { Card } from "@/components/ui/card";

export interface JournalEntry {
  id: string;
  content: string;
  createdAt: Date;
}

interface JournalEntryCardProps {
  entry: JournalEntry;
  maxLength?: number;
}

const DEFAULT_MAX_LENGTH = 240;

export default function JournalEntryCard({
  entry,
  maxLength = DEFAULT_MAX_LENGTH,
}: JournalEntryCardProps) {
  const truncatedContent =
    entry.content.length > maxLength
      ? entry.content.slice(0, maxLength) + "..."
      : entry.content;

  return (
    <Card className="p-6 hover:shadow-md transition-smooth">
      <div className="space-y-4">
        <time className="text-sm text-foreground font-medium">
          {format(entry.createdAt, "EEEE, MMMM d, yyyy 'at' h:mm a")}
        </time>
        <p className="text-muted-foreground font-mono leading-relaxed whitespace-pre-wrap">
          {truncatedContent}
        </p>
      </div>
    </Card>
  );
}
