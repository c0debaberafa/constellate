"use client";

import JournalEntryCard, { JournalEntry } from "./JournalEntryCard";

interface JournalListProps {
  entries: JournalEntry[];
}

export default function JournalList({ entries }: JournalListProps) {
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
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
      {entries.map((entry) => (
        <JournalEntryCard key={entry.id} entry={entry} />
      ))}
    </div>
  );
}
