"use client";

import { useState } from "react";
import JournalEditor from "@/components/JournalEditor";
import JournalList from "@/components/JournalList";
import { JournalEntry } from "@/components/JournalEntryCard";
import { Separator } from "@/components/ui/separator";
import { BookOpen } from "lucide-react";

export default function JournalPage() {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [editingEntry, setEditingEntry] = useState<JournalEntry | null>(null);

  const handleAddEntry = (content: string) => {
    const newEntry: JournalEntry = {
      id: crypto.randomUUID(),
      content,
      createdAt: new Date(),
    };
    setEntries([newEntry, ...entries]);
  };

  const handleEditEntry = (content: string) => {
    if (!editingEntry) return;

    setEntries(
      entries.map((entry) =>
        entry.id === editingEntry.id
          ? { ...entry, content, updatedAt: new Date() }
          : entry
      )
    );
    setEditingEntry(null);
  };

  const handleDeleteEntry = (id: string) => {
    setEntries(entries.filter((entry) => entry.id !== id));
  };

  const startEditing = (entry: JournalEntry) => {
    setEditingEntry(entry);
    // window.scrollTo is fine because this is a client component
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="px-4 py-8 sm:px-6 sm:py-12">
      <div className="max-w-6xl mx-auto space-y-8">
        <header className="space-y-2">
          <div className="flex items-center gap-3">
            <BookOpen className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-semibold text-foreground font-mono">
              Journal Entries
            </h1>
          </div>
          <p className="text-muted-foreground font-mono">
            Your reflections and thoughts
          </p>
        </header>

        {editingEntry && (
          <section className="space-y-4">
            <h2 className="text-xl font-medium text-foreground font-mono">
              Edit Entry
            </h2>
            <JournalEditor
              onSubmit={handleEditEntry}
              initialContent={editingEntry.content}
              isEditing={true}
              onCancel={() => setEditingEntry(null)}
            />
            <Separator className="my-8" />
          </section>
        )}

        <section>
          <JournalList
            entries={entries}
            onEdit={startEditing}
            onDelete={handleDeleteEntry}
          />
        </section>
      </div>
    </div>
  );
}
