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
    // Find the OLDEST journal entry that has not yet updated the profile
    const oldestEntryToProcess = await prisma.journalEntry.findFirst({
      where: {
        userId: userId,
        updatedProfile: false, // Only look at entries that haven't been processed
      },
      orderBy: {
        createdAt: "asc", // 'asc' means oldest first
      },
      select: {
        id: true, // We only need the ID to pass to the processing route
      },
    });

    const hasEntryToProcess = !!oldestEntryToProcess;

    // Return the entryId if it exists, and a boolean flag
    return NextResponse.json({
      hasEntryToProcess: hasEntryToProcess,
      entryId: oldestEntryToProcess ? oldestEntryToProcess.id : null,
    });
  } catch (error) {
    console.error("Profile check failed:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
