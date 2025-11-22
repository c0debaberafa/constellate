"use client";

import JournalEntryCard, { JournalEntry } from "./JournalEntryCard";

interface JournalListProps {
  entries: JournalEntry[];
  onEdit: (entry: JournalEntry) => void;
  onDelete: (id: string) => void;
}

export default function JournalList({
  entries,
  onEdit,
  onDelete,
}: JournalListProps) {
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
    <div className="space-y-4">
      {entries.map((entry) => (
        <JournalEntryCard
          key={entry.id}
          entry={entry}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
