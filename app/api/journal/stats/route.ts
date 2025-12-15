import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

export async function GET() {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const entries = await prisma.journalEntry.findMany({
      where: { userId },
      orderBy: { createdAt: "asc" },
    });

    const totalEntries = entries.length;

    if (entries.length === 0) {
      return NextResponse.json(
        {
          avgWordCount: 0,
          currentStreak: 0,
          longestStreak: 0,
          totalEntries: 0,
        },
        { status: 200 }
      );
    }

    // Calculate average word count
    const totalWords = entries.reduce((sum, entry) => {
      return sum + entry.content.trim().split(/\s+/).filter(Boolean).length;
    }, 0);
    const avgWordCount = Math.round(totalWords / entries.length);

    // Calculate streaks
    const dates = entries.map((entry) => {
      const date = new Date(entry.createdAt);
      date.setHours(0, 0, 0, 0);
      return date.getTime();
    });

    const uniqueDates = Array.from(new Set(dates)).sort((a, b) => a - b);

    // Calculate current streak (from today backwards)
    let currentStreak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayTime = today.getTime();

    // Check if there's an entry today or yesterday
    let checkDate = todayTime;
    let foundToday = uniqueDates.includes(checkDate);

    if (!foundToday) {
      // If no entry today, check yesterday
      checkDate = todayTime - 24 * 60 * 60 * 1000;
      foundToday = uniqueDates.includes(checkDate);
    }

    if (foundToday) {
      currentStreak = 1;
      let prevDate = checkDate - 24 * 60 * 60 * 1000;

      while (uniqueDates.includes(prevDate)) {
        currentStreak++;
        prevDate -= 24 * 60 * 60 * 1000;
      }
    }

    // Calculate longest streak
    let longestStreak = 0;
    let currentRun = 1;

    for (let i = 1; i < uniqueDates.length; i++) {
      const diff = uniqueDates[i] - uniqueDates[i - 1];
      const daysDiff = diff / (24 * 60 * 60 * 1000);

      if (daysDiff === 1) {
        currentRun++;
      } else {
        longestStreak = Math.max(longestStreak, currentRun);
        currentRun = 1;
      }
    }
    longestStreak = Math.max(longestStreak, currentRun);

    return NextResponse.json(
      {
        avgWordCount,
        currentStreak,
        longestStreak,
        totalEntries,
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("GET /api/journal/stats error", err);
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json(
      { error: "Failed to fetch journal stats", details: errorMessage },
      { status: 500 }
    );
  }
}
