// /app/api/profile/check/route.ts

import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    // Profile generation is processed FIFO so the version history reflects the
    // user's real chronology and remains explainable.
    const oldestEntryToProcess = await prisma.journalEntry.findFirst({
      where: {
        userId: userId,
        updatedProfile: false,
      },
      orderBy: {
        createdAt: "asc",
      },
      select: {
        id: true,
        createdAt: true,
      },
    });

    const hasEntryToProcess = !!oldestEntryToProcess;

    // Expose explicit processability state so clients can poll cheaply without
    // fetching or diffing the full journal list.
    return NextResponse.json({
      hasEntryToProcess: hasEntryToProcess,
      entryId: oldestEntryToProcess ? oldestEntryToProcess.id : null,
      entryCreatedAt: oldestEntryToProcess
        ? oldestEntryToProcess.createdAt
        : null,
    });
  } catch (error) {
    console.error("Profile check failed:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
