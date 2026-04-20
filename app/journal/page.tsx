"use client";

import { useState, useEffect } from "react";
import JournalList from "@/components/JournalList";
import { JournalEntry } from "@/components/journal/JournalEntryCard";
import { BookOpen } from "lucide-react";
import { toast } from "sonner";
import { Spinner } from "@/components/ui/spinner";
import JournalDashboard from "@/components/journal/JournalDashboard";

export default function JournalPage() {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Helper function to map API response to JournalEntry format
  const mapEntry = (entry: any): JournalEntry => ({
    id: entry.id,
    content: entry.content,
    createdAt: new Date(entry.createdAt),
    startedAt: entry.startedAt ? new Date(entry.startedAt) : null,
    title: entry.title,
    summary: entry.summary,
    highlights: entry.highlights,
  });

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

        // Map entries with all fields including insights
        const entriesWithDates: JournalEntry[] = data.entries.map(mapEntry);

        setEntries(entriesWithDates);
      } catch (err) {
        console.error("Error fetching entries:", err);
        setError(
          err instanceof Error ? err.message : "Failed to load journal entries",
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchEntries();
  }, []);

  // Polling effect: Check for updated insights every 4 seconds
  // Only polls entries that are missing insights
  useEffect(() => {
    // Check if there are any entries missing insights
    const hasMissingInsights = entries.some(
      (entry) => !entry.summary || !entry.title || !entry.highlights,
    );

    // If all entries have insights, don't poll
    if (!hasMissingInsights) {
      return;
    }

    // Set up polling interval (4 seconds)
    const pollInterval = setInterval(async () => {
      try {
        const response = await fetch("/api/journal");

        if (!response.ok) {
          // Silently fail - don't show error for polling
          return;
        }

        const data = await response.json();
        const updatedEntries: JournalEntry[] = data.entries.map(mapEntry);

        // Update entries state, merging new insights with existing entries
        setEntries((prevEntries) => {
          // Create a map of existing entries for quick lookup
          const entryMap = new Map(prevEntries.map((e) => [e.id, e]));

          // Update with new data, preserving any local state
          return updatedEntries.map((updatedEntry) => {
            const existing = entryMap.get(updatedEntry.id);
            // If the entry now has insights that it didn't have before, update it
            if (
              existing &&
              (!existing.title || !existing.summary || !existing.highlights) &&
              (updatedEntry.title ||
                updatedEntry.summary ||
                updatedEntry.highlights)
            ) {
              // Entry got new insights - return the updated version
              return updatedEntry;
            }
            // Otherwise, keep the existing entry (preserves any local UI state)
            return existing || updatedEntry;
          });
        });
      } catch (err) {
        // Silently fail during polling - don't disrupt the UI
        console.error("Polling error (silent):", err);
      }
    }, 4000); // Poll every 4 seconds

    // Cleanup: stop polling when component unmounts or when all insights are ready
    return () => {
      clearInterval(pollInterval);
    };
  }, [entries]); // Re-run when entries change (to check if polling is still needed)

  // stats and chart data are now handled inside the JournalDashboard component

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
        prevEntries.filter((entry) => entry.id !== id),
      );

      toast.success("Entry deleted successfully");
      window.location.reload();
    } catch (error) {
      console.error("Error deleting entry:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to delete entry. Please try again.",
      );
      throw error; // Re-throw so the card component can handle it
    }
  };

  return (
    <div className="justify-start w-[95%] md:w-[80%] mt-12 px-4 py-16">
      <div className="max-w-6xl mx-auto space-y-8">
        <JournalDashboard entries={entries} />

        <section>
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-xl bg-primary/10">
              <BookOpen className="w-5 h-5 text-primary" />
            </div>
            <h2 className="text-2xl font-semibold text-primary font-mono">
              Entries
            </h2>
          </div>
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
