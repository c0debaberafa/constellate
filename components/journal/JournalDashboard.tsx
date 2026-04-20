"use client";

import { useEffect, useMemo, useState } from "react";
import { BarChart3, Clock, Target } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { JournalEntry } from "@/components/journal/JournalEntryCard";
import WordCountTab from "@/components/WordCountTab";
import TimeTab from "@/components/TimeTab";

interface JournalStatsData {
  avgWordCount: number;
  currentStreak: number;
  longestStreak: number;
  totalEntries: number;
}

interface JournalDashboardProps {
  entries: JournalEntry[];
}

// Convert Date to decimal hours (e.g., 7:30 AM = 7.5)
const dateToDecimalHours = (date: Date): number => {
  const hours = date.getHours();
  const minutes = date.getMinutes();
  return hours + minutes / 60;
};

export default function JournalDashboard({ entries }: JournalDashboardProps) {
  const [stats, setStats] = useState<JournalStatsData | null>(null);

  // Pull streak + word-count summary from the API
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
      }
    };

    fetchStats();
  }, []);

  // Compute monthly word count series for the current month
  const wordCountData = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

    const data = Array.from({ length: daysInMonth }, (_, i) => ({
      day: i + 1,
      words: 0,
    }));

    entries.forEach((entry) => {
      const entryDate = new Date(entry.createdAt);
      if (
        entryDate.getMonth() === currentMonth &&
        entryDate.getFullYear() === currentYear
      ) {
        const dayIndex = entryDate.getDate() - 1;
        if (dayIndex >= 0 && dayIndex < data.length) {
          const words =
            entry.content.trim() === ""
              ? 0
              : entry.content.trim().split(/\s+/).filter(Boolean).length;
          data[dayIndex].words += words;
        }
      }
    });

    return data;
  }, [entries]);

  const currentMonthLabel = useMemo(() => {
    const now = new Date();
    return now.toLocaleDateString(undefined, { month: "short" });
  }, []);

  // Compute time data for entries with createdAt (end times)
  // Start times only shown if startedAt exists
  const timeData = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

    // Filter entries that have createdAt (all entries should have this)
    const entriesWithTime = entries.filter((entry) => entry.createdAt);

    // Initialize data structure
    const data = Array.from({ length: daysInMonth }, (_, i) => ({
      day: i + 1,
      start: null as number | null,
      end: null as number | null,
    }));

    entriesWithTime.forEach((entry) => {
      // Handle both Date objects and date strings from API
      const endDate = new Date(entry.createdAt); // End time is when entry was saved (createdAt)
      const startDate = entry.startedAt ? new Date(entry.startedAt) : null;

      // Use createdAt to determine which day/month to show
      // Only process entries from the current month (based on createdAt date)
      if (
        endDate.getMonth() === currentMonth &&
        endDate.getFullYear() === currentYear &&
        !isNaN(endDate.getTime())
      ) {
        const dayIndex = endDate.getDate() - 1;
        if (dayIndex >= 0 && dayIndex < data.length) {
          // Set start time from startedAt (only if it exists)
          if (startDate && !isNaN(startDate.getTime())) {
            data[dayIndex].start = dateToDecimalHours(startDate);
          }
          // Always set end time from createdAt (when entry was saved)
          data[dayIndex].end = dateToDecimalHours(endDate);
        }
      }
    });

    return data;
  }, [entries]);

  // Calculate time statistics
  // End times calculated from all entries with createdAt
  // Start times and duration only calculated from entries with startedAt
  const timeStats = useMemo(() => {
    // All entries with createdAt (for end time stats)
    const entriesWithEndTime = entries.filter((entry) => entry.createdAt);

    // Only entries with startedAt (for start time and duration stats)
    const entriesWithStartTime = entries.filter(
      (entry) => entry.startedAt && entry.createdAt,
    );

    if (entriesWithEndTime.length === 0) {
      return {
        averageStartTime: 0,
        averageEndTime: 0,
        averageJournalingTime: 0,
      };
    }

    // Calculate end time average from all entries
    let totalEndTime = 0;
    let endTimeCount = 0;

    entriesWithEndTime.forEach((entry) => {
      const endDate = new Date(entry.createdAt);
      if (!isNaN(endDate.getTime())) {
        totalEndTime += dateToDecimalHours(endDate);
        endTimeCount++;
      }
    });

    // Calculate start time average and duration only from entries with startedAt
    let totalStartTime = 0;
    let totalDuration = 0;
    let startTimeCount = 0;

    entriesWithStartTime.forEach((entry) => {
      const startDate = new Date(entry.startedAt!);
      const endDate = new Date(entry.createdAt);

      if (!isNaN(startDate.getTime()) && !isNaN(endDate.getTime())) {
        totalStartTime += dateToDecimalHours(startDate);
        totalDuration +=
          (endDate.getTime() - startDate.getTime()) / (1000 * 60); // duration in minutes
        startTimeCount++;
      }
    });

    return {
      averageStartTime:
        startTimeCount > 0 ? totalStartTime / startTimeCount : 0,
      averageEndTime: endTimeCount > 0 ? totalEndTime / endTimeCount : 0,
      averageJournalingTime:
        startTimeCount > 0 ? Math.round(totalDuration / startTimeCount) : 0,
    };
  }, [entries]);

  return (
    <section className="mb-12 text-start">
      <div className="mb-4 flex items-center gap-3">
        <div className="rounded-xl bg-primary/10 p-2">
          <Target className="h-5 w-5 text-primary" />
        </div>
        <div className="space-y-1">
          <h2 className="font-mono text-2xl font-semibold text-primary">
            Dashboard
          </h2>
        </div>
      </div>

      <Card className="border border-border/50 bg-card/80 p-4 md:p-6 transition-colors hover:border-primary/40 dashboard-card group/dashboard">
        <CardContent className="p-0">
          <Tabs defaultValue="wordcount" className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-black/20 border border-border/50 rounded-md p-1">
              <TabsTrigger
                value="wordcount"
                className="flex items-center gap-2 rounded-md px-3 py-1.5 text-xs font-mono text-muted-foreground transition-colors data-[state=inactive]:group-hover/dashboard:text-white hover:bg-sidebar-accent/40 hover:text-sidebar-accent-foreground data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:shadow-sm"
              >
                <BarChart3 className="h-4 w-4" />
                <span className="hidden sm:inline">Word Count</span>
                <span className="sm:hidden">Words</span>
              </TabsTrigger>
              <TabsTrigger
                value="time"
                className="flex items-center gap-2 rounded-md px-3 py-1.5 text-xs font-mono text-muted-foreground transition-colors data-[state=inactive]:group-hover/dashboard:text-white hover:bg-sidebar-accent/40 hover:text-sidebar-accent-foreground data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:shadow-sm"
              >
                <Clock className="h-4 w-4" />
                <span className="hidden sm:inline">Start / End Time</span>
                <span className="sm:hidden">Time</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="wordcount" className="mt-6">
              <WordCountTab
                wordCountData={wordCountData}
                stats={stats}
                currentMonthLabel={currentMonthLabel}
              />
            </TabsContent>

            <TabsContent value="time" className="mt-6">
              <TimeTab
                timeData={timeData}
                timeStats={timeStats}
                currentMonthLabel={currentMonthLabel}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </section>
  );
}
