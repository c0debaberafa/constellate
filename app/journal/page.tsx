"use client";

import { useState, useEffect } from "react";
import JournalList from "@/components/JournalList";
import JournalStats from "@/components/JournalStats";
import { JournalEntry } from "@/components/JournalEntryCard";
import { BookOpen } from "lucide-react";
import { toast } from "sonner";
import { Spinner } from "@/components/ui/spinner";

interface JournalStatsData {
  avgWordCount: number;
  currentStreak: number;
  longestStreak: number;
  totalEntries: number;
}

export default function JournalPage() {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<JournalStatsData | null>(null);

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

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch("/api/journal/stats");

        if (!response.ok) {
          throw new Error("Failed to fetch journal stats");
        }

        const data = await response.json();
        setStats(data);
      } catch (err) {
        console.error("Error fetching stats:", err);
        // Don't show error to user, just log it
      }
    };

    fetchStats();
  }, []);

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/journal?id=${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete entry");
      }

      // Optimistically remove the entry from the list
      setEntries((prevEntries) =>
        prevEntries.filter((entry) => entry.id !== id)
      );

      toast.success("Entry deleted successfully");
    } catch (error) {
      console.error("Error deleting entry:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to delete entry. Please try again."
      );
      throw error; // Re-throw so the card component can handle it
    }
  };

  return (
    <div className="justify-center w-[95%] md:w-[80%] py-4 mt-16 sm:py-12">
      <div className="max-w-6xl mx-auto space-y-4">
        <header className="space-y-2 text-center">
          <div className="flex gap-3 justify-center items-center">
            <BookOpen className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-semibold text-primary font-mono">
              Journal
            </h1>
          </div>
        </header>

        {stats && (
          <JournalStats
            avgWordCount={stats.avgWordCount}
            currentStreak={stats.currentStreak}
            longestStreak={stats.longestStreak}
            totalEntries={stats.totalEntries}
          />
        )}

        <section>
          {isLoading ? (
            <div className="flex justify-center">
              <div className="flex flex-row items-center gap-2">
                <Spinner className="h-4 w-4" />
                <p className="text-muted-foreground text-lg">
                  Loading entries...
                </p>
              </div>
            </div>
          ) : error ? (
            <div className="text-center py-16">
              <p className="text-destructive text-lg">{error}</p>
            </div>
          ) : (
            <JournalList entries={entries} onDelete={handleDelete} />
          )}
        </section>
      </div>
    </div>
  );
}
