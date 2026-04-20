"use client";

import { Flame, Target, TrendingUp, FileText } from "lucide-react";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, ReferenceLine } from "recharts";

interface JournalStatsData {
  avgWordCount: number;
  currentStreak: number;
  longestStreak: number;
  totalEntries: number;
}

interface WordCountTabProps {
  wordCountData: Array<{ day: number; words: number }>;
  stats: JournalStatsData | null;
  currentMonthLabel: string;
}

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
}

function StatCard({ icon, label, value }: StatCardProps) {
  return (
    <div className="flex flex-col items-center gap-1 rounded-lg bg-black/20 border-border/50 p-3 text-center">
      <div className="text-fred-sage text-primary">{icon}</div>
      <span className="text-lg font-semibold text-muted-foreground group-hover/dashboard:text-white transition">
        {value}
      </span>
      <span className="text-xs text-muted-foreground">{label}</span>
    </div>
  );
}

const chartConfig = {
  words: {
    label: "Words",
    color: "hsl(var(--fred-lavender))",
  },
};

export default function WordCountTab({
  wordCountData,
  stats,
  currentMonthLabel,
}: WordCountTabProps) {
  return (
    <>
      <div className="rounded-lg bg-black/20  px-4 py-3 md:px-5 md:py-4">
        <ChartContainer config={chartConfig} className="h-[260px] w-full">
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
    </>
  );
}
