"use client";

import { Clock, TrendingUp } from "lucide-react";
import { ChartContainer, ChartTooltip } from "@/components/ui/chart";
import { ComposedChart, XAxis, YAxis, Line } from "recharts";

interface TimeStats {
  averageStartTime: number;
  averageEndTime: number;
  averageJournalingTime: number;
}

interface TimeTabProps {
  timeData: Array<{
    day: number;
    start: number | null;
    end: number | null;
  }>;
  timeStats: TimeStats;
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

// Format time as military time (HHMM)
const formatTimeMilitary = (decimal: number) => {
  // Ensure decimal is within valid range (0-24)
  const clampedDecimal = Math.max(0, Math.min(24, decimal));
  const hours = Math.floor(clampedDecimal);
  const minutes = Math.round((clampedDecimal - hours) * 60);
  // Handle 24:00 case
  if (hours === 24) {
    return "2400";
  }
  return `${hours.toString().padStart(2, "0")}${minutes
    .toString()
    .padStart(2, "0")}`;
};

const formatTime = (decimal: number) => {
  const hours = Math.floor(decimal);
  const minutes = Math.round((decimal - hours) * 60);
  const period = hours >= 12 ? "PM" : "AM";
  const displayHours = hours > 12 ? hours - 12 : hours === 0 ? 12 : hours;
  return `${displayHours}:${minutes.toString().padStart(2, "0")} ${period}`;
};

const chartConfig = {
  start: {
    label: "Start Time",
    color: "hsl(var(--fred-sage))",
  },
  end: {
    label: "End Time",
    color: "hsl(var(--fred-peach))",
  },
};

export default function TimeTab({
  timeData,
  timeStats,
  currentMonthLabel,
}: TimeTabProps) {
  //   // Debug: Log the timeData structure
  //   console.log("TimeTab timeData:", timeData);
  //   console.log("TimeTab timeData sample:", timeData.slice(0, 5));
  //   console.log(
  //     "TimeTab timeData keys:",
  //     timeData.length > 0 ? Object.keys(timeData[0]) : "empty"
  //   );

  return (
    <>
      <div className="rounded-lg bg-black/20 px-4 py-3 md:px-5 md:py-4">
        <ChartContainer config={chartConfig} className="h-[260px] w-full">
          <ComposedChart
            data={timeData}
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
              domain={[0, 24]}
              tick={{
                fill: "hsl(var(--muted-foreground))",
                fontSize: 12,
              }}
              axisLine={{
                stroke: "hsl(var(--muted-foreground))",
                strokeWidth: 1,
              }}
              tickLine={false}
              tickFormatter={formatTimeMilitary}
            />
            <ChartTooltip
              content={({ active, payload, label }) => {
                if (!active || !payload?.length) {
                  return null;
                }

                // Filter payload to only include start and end
                const filteredPayload = payload.filter(
                  (item) => item.dataKey === "start" || item.dataKey === "end"
                );
                if (filteredPayload.length === 0) {
                  return null;
                }

                return (
                  <div className="border-border/50 bg-background rounded-lg border px-2.5 py-1.5 text-xs shadow-xl">
                    <div className="flex flex-col gap-1">
                      <span className="text-primary font-medium">
                        {currentMonthLabel} {label}
                      </span>
                      {timeStats.averageStartTime > 0 && (
                        <span className="text-muted-foreground text-xs">
                          Avg. Start:{" "}
                          {formatTimeMilitary(timeStats.averageStartTime)}
                        </span>
                      )}
                      {timeStats.averageEndTime > 0 && (
                        <span className="text-muted-foreground text-xs">
                          Avg. End:{" "}
                          {formatTimeMilitary(timeStats.averageEndTime)}
                        </span>
                      )}
                    </div>
                    <div className="grid gap-1.5 mt-2">
                      {filteredPayload.map((item, index) => {
                        const value = item.value;
                        if (value === null || value === undefined) {
                          return null;
                        }
                        const timeValue =
                          typeof value === "number"
                            ? value
                            : parseFloat(String(value));
                        if (isNaN(timeValue)) {
                          return null;
                        }
                        return (
                          <div
                            key={`${item.dataKey}-${index}`}
                            className="flex items-center gap-2"
                          >
                            <div
                              className="h-2 w-2 rounded-full"
                              style={{
                                backgroundColor:
                                  item.dataKey === "start"
                                    ? "hsl(var(--primary))"
                                    : "hsl(var(--primary))",
                                border:
                                  item.dataKey === "end"
                                    ? "2px solid hsl(var(--background))"
                                    : "none",
                              }}
                            />
                            <span className="text-foreground">
                              {item.dataKey === "start"
                                ? "Started"
                                : "Finished"}
                              : {formatTimeMilitary(timeValue)}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              }}
              cursor={{
                fill: "hsl(var(--muted))",
                opacity: 0.35,
              }}
            />
            <Line
              type="monotone"
              dataKey="start"
              stroke="hsl(var(--primary))"
              strokeWidth={0}
              connectNulls={false}
              isAnimationActive={false}
              dot={{
                fill: "hsl(var(--primary))",
                strokeWidth: 0,
                r: 6,
              }}
              activeDot={{
                r: 8,
                fill: "hsl(var(--primary))",
              }}
            />
            <Line
              type="monotone"
              dataKey="end"
              stroke="hsl(var(--primary))"
              strokeWidth={0}
              connectNulls={false}
              isAnimationActive={false}
              dot={(props: {
                cx?: number;
                cy?: number;
                payload?: { end?: number | null };
                index?: number;
              }) => {
                const { cx, cy, payload, index } = props;
                if (
                  !cx ||
                  !cy ||
                  payload?.end === null ||
                  payload?.end === undefined
                ) {
                  return <g key={`end-dot-empty-${index ?? 0}`} />;
                }
                const size = 6;
                return (
                  <rect
                    key={`end-dot-${index ?? 0}-${cx}-${cy}`}
                    x={cx - size}
                    y={cy - size}
                    width={size * 2}
                    height={size * 2}
                    fill="hsl(var(--primary))"
                    stroke="hsl(var(--background))"
                    strokeWidth={2}
                  />
                );
              }}
              activeDot={(props: {
                cx?: number;
                cy?: number;
                index?: number;
              }) => {
                const { cx, cy, index } = props;
                if (!cx || !cy) {
                  return <g key={`end-active-empty-${index ?? 0}`} />;
                }
                const size = 8;
                return (
                  <rect
                    key={`end-active-${index ?? 0}-${cx}-${cy}`}
                    x={cx - size}
                    y={cy - size}
                    width={size * 2}
                    height={size * 2}
                    fill="hsl(var(--primary))"
                    stroke="hsl(var(--background))"
                    strokeWidth={2}
                  />
                );
              }}
            />
          </ComposedChart>
        </ChartContainer>
      </div>

      <div className="mt-6 grid grid-cols-3 gap-3">
        <StatCard
          icon={<Clock className="h-4 w-4" />}
          label="Avg. Start"
          value={
            timeStats.averageStartTime > 0
              ? formatTime(timeStats.averageStartTime)
              : "--"
          }
        />
        <StatCard
          icon={<Clock className="h-4 w-4" />}
          label="Avg. End"
          value={
            timeStats.averageEndTime > 0
              ? formatTime(timeStats.averageEndTime)
              : "--"
          }
        />
        <StatCard
          icon={<TrendingUp className="h-4 w-4" />}
          label="Avg. Duration"
          value={
            timeStats.averageJournalingTime > 0
              ? `${timeStats.averageJournalingTime}m`
              : "--"
          }
        />
      </div>
    </>
  );
}
