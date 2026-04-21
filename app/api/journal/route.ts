import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { runOrchestration } from "@/lib/ai/orchestrator";
import { auth } from "@clerk/nextjs/server";

type AIStatus = "pending" | "processing" | "completed" | "failed";

const MAX_AI_RETRIES = 3;
const RETRYABLE_STATUSES: AIStatus[] = ["pending", "failed"];
const PROCESSING_STALE_MS = 2 * 60 * 1000;

// Durability improvement: job state is persisted in Postgres, so a process crash
// does not lose "what still needs work". Any future GET can recover and resume.
//
// Limitation: this is still in-process execution, so it lacks queue guarantees
// like leasing, delayed retries, dead-lettering, and worker autoscaling.
async function processMissingInsights(
  candidates: Awaited<ReturnType<typeof prisma.journalEntry.findMany>>
) {
  if (candidates.length === 0) {
    return;
  }

  console.log(`Starting insight generation for ${candidates.length} entries...`);

  for (const entry of candidates) {
    try {
      const processingStaleBefore = new Date(Date.now() - PROCESSING_STALE_MS);
      const claimed = await prisma.journalEntry.updateMany({
        where: {
          id: entry.id,
          aiAttempts: { lt: MAX_AI_RETRIES },
          OR: [
            { aiStatus: { in: RETRYABLE_STATUSES } },
            {
              aiStatus: "processing",
              updatedAt: { lt: processingStaleBefore },
            },
          ],
        },
        data: {
          aiStatus: "processing",
        },
      });

      if (claimed.count === 0) {
        // Another request already processed/claimed this entry or it exhausted retries.
        continue;
      }

      const aiInsights = await runOrchestration({
        type: "journal_insight",
        content: entry.content,
        userId: entry.userId,
      });

      await prisma.journalEntry.update({
        where: { id: entry.id },
        data: {
          title: aiInsights.title,
          summary: aiInsights.summary,
          highlights: aiInsights.highlights,
          aiStatus: "completed",
        },
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      console.error(`❌ Insight generation failed for ID ${entry.id}:`, errorMessage);

      await prisma.journalEntry.update({
        where: { id: entry.id },
        data: {
          aiStatus: "failed",
          aiAttempts: { increment: 1 },
        },
      });
    }
  }

  console.log("Insight processing complete.");
}

function isRetryableAIJob(entry: { aiStatus: string; aiAttempts: number }) {
  if (entry.aiAttempts >= MAX_AI_RETRIES) {
    return false;
  }

  if (RETRYABLE_STATUSES.includes(entry.aiStatus as AIStatus)) {
    return true;
  }

  // Crash recovery path: a long-stuck "processing" job is treated as retryable.
  return false;
}

function isStaleProcessingJob(entry: {
  aiStatus: string;
  aiAttempts: number;
  updatedAt: Date;
}) {
  return (
    entry.aiStatus === "processing" &&
    entry.aiAttempts < MAX_AI_RETRIES &&
    Date.now() - new Date(entry.updatedAt).getTime() > PROCESSING_STALE_MS
  );
}

export async function POST(req: Request) {
  const { userId } = await auth(); // get user ID
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { content, startedAt } = body;

    if (!content || typeof content !== "string") {
      return NextResponse.json({ error: "Invalid content" }, { status: 400 });
    }

    const entry = await prisma.journalEntry.create({
      data: {
        userId: userId,
        content,
        startedAt: startedAt ? new Date(startedAt) : null,
        aiStatus: "pending",
        aiAttempts: 0,
        // createdAt and updatedAt are automatically handled by Prisma
      },
    });

    // We return immediately after persistence and run AI out-of-band.
    // This keeps write latency predictable and avoids coupling UX to model time.
    processMissingInsights([entry]).catch((error) => {
      console.error("Background insight generation error after save:", error);
    });

    return NextResponse.json({ entry }, { status: 200 });
  } catch (err) {
    console.error("POST /api/journal error", err);
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json(
      { error: "Failed to save journal entry", details: errorMessage },
      { status: 500 }
    );
  }
}

export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const entries = await prisma.journalEntry.findMany({
      where: { userId: userId },
      orderBy: { createdAt: "desc" },
    });

    const retryableEntries = entries.filter(
      (entry) => isRetryableAIJob(entry) || isStaleProcessingJob(entry),
    );

    // GET acts as a simple recovery trigger: if earlier background attempts were
    // interrupted, reading the journal can safely kick off remaining work.
    processMissingInsights(retryableEntries).catch((error) => {
      console.error("Background insight generation error on GET:", error);
    });

    // UI uses this metadata to drive polling/progress without blocking reads.
    return NextResponse.json(
      {
        entries,
        missingInsightsCount: retryableEntries.length,
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("GET /api/journal error", err);
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json(
      { error: "Failed to fetch journal entries", details: errorMessage },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Accepting id in query or body keeps this endpoint compatible with both
    // fetch styles used by browser clients.
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    let entryId = id;
    if (!entryId) {
      try {
        const body = await req.json();
        entryId = body.id;
      } catch {
        // Body might be empty; query-param callers are still valid.
      }
    }

    if (!entryId || typeof entryId !== "string") {
      return NextResponse.json(
        { error: "Entry ID is required" },
        { status: 400 }
      );
    }

    await prisma.journalEntry.delete({
      where: { id: entryId, userId },
    });

    return NextResponse.json(
      { message: "Entry deleted successfully" },
      { status: 200 }
    );
  } catch (err) {
    console.error("DELETE /api/journal error", err);
    const errorMessage = err instanceof Error ? err.message : "Unknown error";

    // Handle Prisma not found error
    if (errorMessage.includes("Record to delete does not exist")) {
      return NextResponse.json({ error: "Entry not found" }, { status: 404 });
    }

    return NextResponse.json(
      { error: "Failed to delete journal entry", details: errorMessage },
      { status: 500 }
    );
  }
}
