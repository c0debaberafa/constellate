"use client";

import JournalEntryCard, { JournalEntry } from "./JournalEntryCard";
import { BookOpen } from "lucide-react";

interface JournalListProps {
  entries: JournalEntry[];
  onDelete?: (id: string) => Promise<void>;
}

export default function JournalList({ entries, onDelete }: JournalListProps) {
  if (entries.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-muted-foreground text-lg">
          No entries yet. Start journaling to see your thoughts here.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4">
      {entries.map((entry) => (
        <JournalEntryCard key={entry.id} entry={entry} onDelete={onDelete} />
      ))}
    </div>
  );
}
