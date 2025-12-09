"use client";

import { useState, useEffect } from "react";
import JournalList from "@/components/JournalList";
import { JournalEntry } from "@/components/JournalEntryCard";
import { BookOpen } from "lucide-react";

export default function JournalPage() {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEntries = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await fetch("/api/journal");

        if (!response.ok) {
          throw new Error("Failed to fetch journal entries");
        }

        const data = await response.json();

        // Convert date strings to Date objects
        const entriesWithDates: JournalEntry[] = data.entries.map(
          (entry: { id: string; content: string; createdAt: string }) => ({
            id: entry.id,
            content: entry.content,
            createdAt: new Date(entry.createdAt),
          })
        );

        setEntries(entriesWithDates);
      } catch (err) {
        console.error("Error fetching entries:", err);
        setError(
          err instanceof Error ? err.message : "Failed to load journal entries"
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchEntries();
  }, []);

  return (
    <div className="justify-center md:w-[80%] px-4 py-8 mt-16 sm:px-6 sm:py-12">
      <div className="max-w-6xl mx-auto space-y-8">
        <header className="space-y-2 text-center">
          <div className="flex gap-3 justify-center items-center">
            <BookOpen className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-semibold text-foreground font-mono">
              Journal Entries
            </h1>
          </div>
          <p className="text-muted-foreground font-mono">
            Your reflections and thoughts
          </p>
        </header>

        <section>
          {isLoading ? (
            <div className="text-center py-16">
              <p className="text-muted-foreground text-lg">
                Loading entries...
              </p>
            </div>
          ) : error ? (
            <div className="text-center py-16">
              <p className="text-destructive text-lg">{error}</p>
            </div>
          ) : (
            <JournalList entries={entries} />
          )}
        </section>
      </div>
    </div>
  );
}
