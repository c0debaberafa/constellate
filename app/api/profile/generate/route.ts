// /app/api/profile/generate/route.ts

import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateProfileInsights } from "@/lib/ai/gemini"; // Your existing AI function

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

    // 1. Fetch the necessary data for processing
    const [entryToProcess, userProfile] = await prisma.$transaction([
      // Securely fetch the entry content and status
      prisma.journalEntry.findUnique({
        where: { id: entryId, userId: userId },
        select: { content: true, updatedProfile: true },
      }),
      // Fetch the profile for current state and version
      prisma.userProfile.findUnique({
        where: { userId: userId },
        select: { version: true, aiProfile: true },
      }),
    ]);

    if (!entryToProcess || entryToProcess.updatedProfile) {
      // Check if the entry exists or has already been processed (avoid double-processing)
      return new NextResponse("Entry not found or already processed.", {
        status: 409,
      });
    }

    if (!userProfile) {
      // UserProfile should exist, but handle the case if it doesn't
      return new NextResponse("User profile not found.", {
        status: 404,
      });
    }

    // 2. Prepare data for AI generation
    const currentVersion = userProfile.version || 0;
    const nextVersion = currentVersion + 1;

    // Convert existing insights (JSONB) to a string for the AI prompt
    const existingInsightsString = userProfile.aiProfile
      ? JSON.stringify(userProfile.aiProfile)
      : "{}";

    // 3. Call the AI function
    // Note: This is the most time-consuming step outside the transaction
    const newInsightsFromAI = await generateProfileInsights(
      entryToProcess.content,
      existingInsightsString
    );

    // 4. Update the Profile and Journal Entry atomically using a transaction
    // We do this inside the transaction to prevent race conditions or partial updates.
    // Ensure aiProfile is an object before spreading (handle null case)
    const existingAiProfile =
      userProfile.aiProfile &&
      typeof userProfile.aiProfile === "object" &&
      !Array.isArray(userProfile.aiProfile)
        ? (userProfile.aiProfile as Record<string, unknown>)
        : {};

    await prisma.$transaction([
      // A. Update the UserProfile
      prisma.userProfile.update({
        where: { userId: userId },
        data: {
          version: nextVersion, // Increment the version counter
          // Store the new insights object under its version key
          aiProfile: {
            ...existingAiProfile, // Spread existing versioned insights
            [`v${nextVersion}`]: newInsightsFromAI, // Add the new version
          },
        },
      }),

      // B. Mark the JournalEntry as processed
      prisma.journalEntry.update({
        where: { id: entryId },
        data: { updatedProfile: true },
      }),
    ]);

    // 5. Return success
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
