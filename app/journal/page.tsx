"use client";

import { useState, useEffect, useMemo } from "react";
import JournalList from "@/components/JournalList";
import JournalStats from "@/components/JournalStats";
import { JournalEntry } from "@/components/JournalEntryCard";
import { Target } from "lucide-react";
import { toast } from "sonner";
import { Spinner } from "@/components/ui/spinner";
import { Card } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { BarChart, Bar, XAxis, CartesianGrid } from "recharts";

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

  // Prepare chart data: word count by day of month
  const chartData = useMemo(() => {
    // Get current month
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

    // Initialize data for all days of the month
    const data = Array.from({ length: daysInMonth }, (_, i) => ({
      day: i + 1,
      wordCount: 0,
    }));

    // Group entries by day and calculate word counts
    entries.forEach((entry) => {
      const entryDate = new Date(entry.createdAt);
      if (
        entryDate.getMonth() === currentMonth &&
        entryDate.getFullYear() === currentYear
      ) {
        const day = entryDate.getDate();
        const wordCount = entry.content
          .trim()
          .split(/\s+/)
          .filter(Boolean).length;
        data[day - 1].wordCount += wordCount;
      }
    });

    return data;
  }, [entries]);

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
      window.location.reload();
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
    <div className="justify-start w-[95%] md:w-[80%] mt-8 px-4 py-16">
      <div className="max-w-6xl mx-auto space-y-4">
        <header className="space-y-4 text-start">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-primary/10">
              <Target className="w-5 h-5 text-primary" />
            </div>
            <h2 className="text-2xl font-semibold text-primary font-mono">
              Dashboard
            </h2>
          </div>
          <div className="flex flex-col justify-center items-start gap-4 mt-6">
            <Card className="w-full bg-black border-0 px-6">
              <ChartContainer
                config={{
                  wordCount: {
                    label: "Word Count",
                    color: "hsl(var(--primary))",
                  },
                }}
                className="h-[240px] w-full"
              >
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="day" tickFormatter={(value) => `${value}`} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar
                    dataKey="wordCount"
                    fill="var(--color-wordCount)"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ChartContainer>
            </Card>
            {stats && (
              <JournalStats
                avgWordCount={stats.avgWordCount}
                currentStreak={stats.currentStreak}
                longestStreak={stats.longestStreak}
                totalEntries={stats.totalEntries}
              />
            )}
          </div>
        </header>

        <section>
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-xl bg-primary/10">
              <Target className="w-5 h-5 text-primary" />
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
