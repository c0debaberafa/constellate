// /app/api/profile/generate/route.ts

import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
import { runOrchestration } from "@/lib/ai/orchestrator";

// Generates exactly one next profile version from one journal entry.
// This route is the write-side coordinator for the evolving profile pipeline.
export async function POST(request: Request) {
  const { userId } = await auth();
  if (!userId) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const { entryId } = await request.json();
    if (!entryId) {
      return new NextResponse("Missing entryId in request body.", {
        status: 400,
      });
    }

    // Read entry and profile together so we can make one consistency decision
    // (process now vs reject) from a single point-in-time view.
    const [entryToProcess, userProfile] = await prisma.$transaction([
      prisma.journalEntry.findUnique({
        where: { id: entryId, userId: userId },
        select: { content: true, updatedProfile: true, createdAt: true },
      }),
      prisma.userProfile.findUnique({
        where: { userId: userId },
        select: { version: true, aiProfile: true },
      }),
    ]);

    if (!entryToProcess || entryToProcess.updatedProfile) {
      // Treat duplicate processing requests as conflict to preserve monotonic
      // profile history and idempotent client behavior.
      return new NextResponse("Entry not found or already processed.", {
        status: 409,
      });
    }

    if (!userProfile) {
      return new NextResponse("User profile not found.", {
        status: 404,
      });
    }

    // Versioning is explicit so profile consumers can time-travel and compare.
    const currentVersion = userProfile.version || 0;
    const nextVersion = currentVersion + 1;

    // Feed the model only the latest snapshot, not the entire profile history,
    // to keep prompt cost predictable as usage grows.
    let latestProfileVersion: Record<string, unknown> | null = null;
    if (
      userProfile.aiProfile &&
      typeof userProfile.aiProfile === "object" &&
      !Array.isArray(userProfile.aiProfile)
    ) {
      const aiProfile = userProfile.aiProfile as Record<string, unknown>;
      if (currentVersion > 0) {
        latestProfileVersion =
          (aiProfile[`v${currentVersion}`] as Record<string, unknown>) || null;
      }
    }

    // Empty-object seed keeps the first generation path uniform.
    const existingInsightsString = latestProfileVersion
      ? JSON.stringify(latestProfileVersion)
      : "{}";

    // TEMPORARY: Log sizes for debugging
    console.log("=== Profile Generation Size Debug ===");
    console.log(
      "Journal entry content length:",
      entryToProcess.content.length,
      "chars"
    );
    console.log(
      "Journal entry word count:",
      entryToProcess.content.split(/\s+/).length,
      "words"
    );
    console.log(
      "Profile string length (latest version only):",
      existingInsightsString.length,
      "chars"
    );
    console.log("Profile string (first 200 chars):", existingInsightsString);
    console.log("Current version:", currentVersion);
    console.log("Next version:", nextVersion);
    console.log(
      "Sending latest version only:",
      currentVersion > 0 ? `v${currentVersion}` : "none (first generation)"
    );
    console.log("=====================================");

    // AI call happens outside the write transaction to avoid long-held locks.
    const newInsightsFromAI = await runOrchestration({
      type: "profile_update",
      content: entryToProcess.content,
      profile: existingInsightsString,
      userId,
      currentEntryCreatedAt: entryToProcess.createdAt,
    });

    // Persist both profile version bump and entry processing marker atomically:
    // either both commit or neither, preventing split-brain state.
    const existingAiProfile =
      userProfile.aiProfile &&
      typeof userProfile.aiProfile === "object" &&
      !Array.isArray(userProfile.aiProfile)
        ? (userProfile.aiProfile as Record<string, unknown>)
        : ({} as Record<string, unknown>);

    await prisma.$transaction([
      prisma.userProfile.update({
        where: { userId: userId },
        data: {
          version: nextVersion,
          aiProfile: {
            ...existingAiProfile,
            [`v${nextVersion}`]: {
              ...(newInsightsFromAI as Record<string, unknown>),
              updatingEntryId: entryId,
              updatingEntryCreatedAt: entryToProcess.createdAt,
            },
          } as Prisma.InputJsonValue,
        },
      }),

      prisma.journalEntry.update({
        where: { id: entryId },
        data: { updatedProfile: true },
      }),
    ]);

    return NextResponse.json(
      {
        message: "Profile successfully updated.",
        newVersion: nextVersion,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Profile generation and update failed:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
