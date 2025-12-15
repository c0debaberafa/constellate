"use client";

import { useEffect, useMemo, useState } from "react";
import {
  BarChart3,
  Clock,
  Flame,
  Target,
  FileText,
  TrendingUp,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  LineChart,
  Line,
  ReferenceLine,
} from "recharts";
import { JournalEntry } from "@/components/JournalEntryCard";

interface JournalStatsData {
  avgWordCount: number;
  currentStreak: number;
  longestStreak: number;
  totalEntries: number;
}

interface JournalDashboardProps {
  entries: JournalEntry[];
}

// Placeholder time-tracking data until real journaling-time analytics exist
const timeData = [
  { day: "Mon", start: 7.5, end: 8.0 },
  { day: "Tue", start: 6.0, end: 6.5 },
  { day: "Wed", start: 8.0, end: 8.75 },
  { day: "Thu", start: 7.0, end: 7.5 },
  { day: "Fri", start: 9.0, end: 9.5 },
  { day: "Sat", start: 10.0, end: 11.0 },
  { day: "Sun", start: 8.5, end: 9.25 },
];

const timeStats = {
  averageStartTime: 7.8,
  averageEndTime: 8.4,
  averageJournalingTime: 36, // minutes
};

const formatTime = (decimal: number) => {
  const hours = Math.floor(decimal);
  const minutes = Math.round((decimal - hours) * 60);
  const period = hours >= 12 ? "PM" : "AM";
  const displayHours = hours > 12 ? hours - 12 : hours === 0 ? 12 : hours;
  return `${displayHours}:${minutes.toString().padStart(2, "0")} ${period}`;
};

const chartConfig = {
  words: {
    label: "Words",
    color: "hsl(var(--fred-lavender))",
  },
  start: {
    label: "Start Time",
    color: "hsl(var(--fred-sage))",
  },
  end: {
    label: "End Time",
    color: "hsl(var(--fred-peach))",
  },
};

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
}

function StatCard({ icon, label, value }: StatCardProps) {
  return (
    <div className="flex flex-col items-center gap-1 rounded-lg bg-black p-3 text-center">
      <div className="text-fred-sage text-primary">{icon}</div>
      <span className="text-lg font-semibold text-white">{value}</span>
      <span className="text-xs text-primary">{label}</span>
    </div>
  );
}

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

      <Card className="border border-border/50 bg-card/80 p-4 md:p-6 shadow-sm transition-colors hover:border-primary/40 dashboard-card group/dashboard">
        <CardContent className="p-0">
          <Tabs defaultValue="wordcount" className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-black/20 border border-sidebar-border rounded-md p-1">
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
              <div className="rounded-lg bg-black border border-border/60 px-4 py-3 md:px-5 md:py-4">
                <ChartContainer
                  config={chartConfig}
                  className="h-[260px] w-full"
                >
                  <BarChart
                    data={wordCountData}
                    margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
                  >
                    <XAxis
                      dataKey="day"
                      tick={{
                        fill: "hsl(var(--muted-foreground))",
                        fontSize: 12,
                      }}
                      axisLine={{
                        stroke: "hsl(var(--muted-foreground))",
                        strokeWidth: 1,
                      }}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{
                        fill: "hsl(var(--muted-foreground))",
                        fontSize: 12,
                      }}
                      axisLine={{
                        stroke: "hsl(var(--muted-foreground))",
                        strokeWidth: 1,
                      }}
                      tickLine={false}
                    />
                    <ChartTooltip
                      content={
                        <ChartTooltipContent
                          formatter={(value, name) =>
                            name === "words" ? `${value} words` : String(value)
                          }
                          labelFormatter={(label) => (
                            <div className="flex flex-col gap-1">
                              <span className="text-primary">
                                {currentMonthLabel} {label}
                              </span>
                              {stats && (
                                <span className="text-muted-foreground">
                                  Average: {stats.avgWordCount.toLocaleString()}
                                </span>
                              )}
                            </div>
                          )}
                        />
                      }
                      cursor={{
                        fill: "hsl(var(--muted))",
                        opacity: 0.35,
                      }}
                    />
                    <Bar
                      dataKey="words"
                      fill="hsl(var(--primary))"
                      radius={[8, 8, 0, 0]}
                      maxBarSize={48}
                    />
                    {stats && (
                      <ReferenceLine
                        y={stats.avgWordCount}
                        stroke="hsl(var(--primary))"
                      />
                    )}
                  </BarChart>
                </ChartContainer>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
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
            </TabsContent>

            <TabsContent value="time" className="mt-6">
              <div className="rounded-lg bg-black border border-border/60 px-4 py-3 md:px-5 md:py-4">
                <ChartContainer
                  config={chartConfig}
                  className="h-[260px] w-full"
                >
                  <LineChart
                    data={timeData}
                    margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
                  >
                    <CartesianGrid
                      stroke="hsl(var(--muted-foreground))"
                      className="opacity-60"
                    />
                    <XAxis
                      dataKey="day"
                      tick={{
                        fill: "hsl(var(--muted-foreground))",
                        fontSize: 12,
                      }}
                      axisLine={{
                        stroke: "hsl(var(--muted-foreground))",
                        strokeWidth: 1,
                      }}
                      tickLine={false}
                    />
                    <YAxis
                      domain={[5, 12]}
                      tick={{
                        fill: "hsl(var(--muted-foreground))",
                        fontSize: 12,
                      }}
                      axisLine={{
                        stroke: "hsl(var(--muted-foreground))",
                        strokeWidth: 1,
                      }}
                      tickLine={false}
                      tickFormatter={formatTime}
                    />
                    <ChartTooltip
                      content={
                        <ChartTooltipContent
                          formatter={(value, name) => (
                            <span>
                              {name === "start" ? "Started" : "Finished"}:{" "}
                              {formatTime(value as number)}
                            </span>
                          )}
                        />
                      }
                    />
                    <Line
                      type="monotone"
                      dataKey="start"
                      stroke="hsl(var(--fred-sage))"
                      strokeWidth={2}
                      dot={{
                        fill: "hsl(var(--fred-sage))",
                        strokeWidth: 0,
                        r: 4,
                      }}
                      activeDot={{
                        r: 6,
                        fill: "hsl(var(--fred-sage))",
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="end"
                      stroke="hsl(var(--fred-peach))"
                      strokeWidth={2}
                      dot={{
                        fill: "hsl(var(--fred-peach))",
                        strokeWidth: 0,
                        r: 4,
                      }}
                      activeDot={{
                        r: 6,
                        fill: "hsl(var(--fred-peach))",
                      }}
                    />
                  </LineChart>
                </ChartContainer>
              </div>
              <div className="mt-4 flex justify-center gap-6 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-fred-sage" />
                  <span>Start Time</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-fred-peach" />
                  <span>End Time</span>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-3 gap-3">
                <StatCard
                  icon={<Clock className="h-4 w-4" />}
                  label="Avg. Start"
                  value={formatTime(timeStats.averageStartTime)}
                />
                <StatCard
                  icon={<Clock className="h-4 w-4" />}
                  label="Avg. End"
                  value={formatTime(timeStats.averageEndTime)}
                />
                <StatCard
                  icon={<TrendingUp className="h-4 w-4" />}
                  label="Avg. Duration"
                  value={`${timeStats.averageJournalingTime}m`}
                />
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </section>
  );
}
