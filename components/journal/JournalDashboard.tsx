"use client";

import { useEffect, useMemo, useState } from "react";
import { Flame, Target, TrendingUp, FileText } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { JournalEntry } from "@/components/journal/JournalEntryCard";
import CalendarHeatmap from "react-calendar-heatmap";
import "react-calendar-heatmap/dist/styles.css";

interface JournalStatsData {
  avgWordCount: number;
  currentStreak: number;
  longestStreak: number;
  totalEntries: number;
}

interface JournalDashboardProps {
  entries: JournalEntry[];
}

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
}

function StatCard({ icon, label, value }: StatCardProps) {
  return (
    <div className="flex flex-col items-center gap-1 rounded-lg bg-black/20 border-border/50 p-3 text-center">
      <div className="text-primary">{icon}</div>
      <span className="text-lg font-semibold text-muted-foreground transition group-hover/dashboard:text-white">
        {value}
      </span>
      <span className="text-xs text-muted-foreground">{label}</span>
    </div>
  );
}

export default function JournalDashboard({ entries }: JournalDashboardProps) {
  const [stats, setStats] = useState<JournalStatsData | null>(null);
  const [tooltip, setTooltip] = useState<{
    visible: boolean;
    x: number;
    y: number;
    text: string;
  }>({ visible: false, x: 0, y: 0, text: "" });
  const now = new Date();
  const heatmapStartDate = new Date(now.getFullYear(), 0, 1);
  const heatmapEndDate = new Date(now.getFullYear(), 11, 31);
  const tooltipDateFormatter = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });

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
  }, [entries.length]);

  const heatmapValues = useMemo(() => {
    const dailyWordTotals = new Map<string, number>();
    const toDateKey = (date: Date) => date.toISOString().split("T")[0];

    entries.forEach((entry) => {
      const entryDate = new Date(entry.createdAt);
      if (Number.isNaN(entryDate.getTime())) {
        return;
      }

      const key = toDateKey(entryDate);
      const words =
        entry.content.trim() === ""
          ? 0
          : entry.content.trim().split(/\s+/).filter(Boolean).length;

      dailyWordTotals.set(key, (dailyWordTotals.get(key) ?? 0) + words);
    });

    const values: Array<{ date: string; count: number }> = [];
    const cursorDate = new Date(heatmapStartDate);

    while (cursorDate <= heatmapEndDate) {
      const key = toDateKey(cursorDate);
      values.push({ date: key, count: dailyWordTotals.get(key) ?? 0 });
      cursorDate.setDate(cursorDate.getDate() + 1);
    }

    return values;
  }, [entries, heatmapStartDate, heatmapEndDate]);

  const formatTooltipText = (
    value: { date?: string; count?: number } | undefined,
  ) => {
    if (!value?.date) {
      return "";
    }

    const dateLabel = tooltipDateFormatter.format(new Date(value.date));
    return `${dateLabel}: ${Number(value.count ?? 0)} words`;
  };

  return (
    <section className="mb-8 text-start">
      <div className="mb-4 flex items-center">
        <h2 className="font-mono text-md font-semibold text-muted-foreground text-center">
          OVERVIEW
        </h2>
      </div>

      <Card className="border border-border/50 bg-card/80 p-4 md:p-6 transition-colors hover:border-primary/40 dashboard-card group/dashboard">
        <CardContent className="p-0">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <StatCard
              icon={<Flame className="h-4 w-4" />}
              label="Longest Streak"
              value={stats ? `${stats.longestStreak} days` : "--"}
            />
            <StatCard
              icon={<Target className="h-4 w-4" />}
              label="Current Streak"
              value={stats ? `${stats.currentStreak} days` : "--"}
            />
            <StatCard
              icon={<TrendingUp className="h-4 w-4" />}
              label="Avg. Words"
              value={stats ? stats.avgWordCount : "--"}
            />
            <StatCard
              icon={<FileText className="h-4 w-4" />}
              label="Total Entries"
              value={stats ? stats.totalEntries : "--"}
            />
          </div>

          <div
            className="relative mt-6 rounded-lg border border-border/50 bg-black/20 p-4"
            onMouseMove={(event) => {
              setTooltip((prev) =>
                prev.visible
                  ? { ...prev, x: event.clientX, y: event.clientY }
                  : prev,
              );
            }}
          >
            <CalendarHeatmap
              startDate={heatmapStartDate}
              endDate={heatmapEndDate}
              values={heatmapValues}
              classForValue={(value) => {
                const count = Number(value?.count ?? 0);
                if (!count) return "journal-heatmap-empty";
                if (count < 250) return "journal-heatmap-level-1";
                if (count < 500) return "journal-heatmap-level-2";
                if (count < 1000) return "journal-heatmap-level-3";
                return "journal-heatmap-level-4";
              }}
              titleForValue={(value) => {
                return formatTooltipText(
                  value as { date?: string; count?: number },
                );
              }}
              onMouseOver={(event, value) => {
                const text = formatTooltipText(
                  value as { date?: string; count?: number },
                );
                if (!text) return;
                setTooltip({
                  visible: true,
                  x: event.clientX,
                  y: event.clientY,
                  text,
                });
              }}
              onMouseLeave={() => {
                setTooltip((prev) => ({ ...prev, visible: false }));
              }}
              showWeekdayLabels={false}
              showMonthLabels={false}
            />
            {tooltip.visible && (
              <div
                className="pointer-events-none fixed z-50 rounded-md border border-border bg-background px-2 py-1 text-xs text-foreground shadow-md"
                style={{
                  left: tooltip.x + 12,
                  top: tooltip.y + 12,
                }}
              >
                {tooltip.text}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
