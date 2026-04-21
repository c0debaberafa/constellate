import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { runOrchestration } from "@/lib/ai/orchestrator";
import { auth } from "@clerk/nextjs/server";

// helper function to sleep for a given number of milliseconds
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// async backoff functon to respect tier limits
async function processMissingInsights(
  missingAI: Awaited<ReturnType<typeof prisma.journalEntry.findMany>>
) {
  console.log(`Starting insight generation for ${missingAI.length} entries...`);

  const maxRetries = 3; // prevent infinite loops
  const initialDelayMs = 20000; // start with a 20-second delay (to respect the free tier limit)

  for (const entry of missingAI) {
    let attempt = 0;
    let success = false;

    // Retry block for each individual entry
    while (attempt < maxRetries && !success) {
      attempt++;
      // generate journal insights and update database
      try {
        // pauses the loop until the Promise resolves
        const aiInsights = await runOrchestration({
          type: "journal_insight",
          content: entry.content,
          userId: entry.userId,
        });

        // only runs if the AI call succeeded
        await prisma.journalEntry.update({
          where: { id: entry.id },
          data: {
            title: aiInsights.title,
            summary: aiInsights.summary,
            highlights: aiInsights.highlights,
          },
        });

        console.log(`✅ Success for entry ID: ${entry.id}`);
        success = true; // exit the retry loop
      } catch (error) {
        // Check for the 429 rate limit error
        if (error instanceof Error && error.message.includes("429")) {
          const delay = initialDelayMs * Math.pow(2, attempt - 1); // exponential backoff
          const waitTime = Math.min(delay, 60000); // max wait time of 60 seconds

          console.warn(
            `🛑 Rate limit hit for ID ${
              entry.id
            } (Attempt ${attempt}/${maxRetries}). Waiting ${
              waitTime / 1000
            }s...`
          );

          await sleep(waitTime); // AWAIT the pause

          if (attempt === maxRetries) {
            console.error(
              `❌ Permanent failure for entry ID ${entry.id} after ${maxRetries} retries.`
            );
          }
        } else {
          // Handle other errors (Prisma, JSON parsing, etc.)
          const errorMessage =
            error instanceof Error ? error.message : String(error);
          console.error(
            `❌ Non-retryable error for ID ${entry.id}:`,
            errorMessage
          );
          success = true; // Stop retrying this entry
        }
      }
    }
  }
  console.log("Insight processing complete.");
}

function hasMissingInsights(entry: {
  summary: string | null;
  title: string | null;
  highlights: string | null;
}) {
  return !entry.summary || !entry.title || !entry.highlights;
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
        // createdAt and updatedAt are automatically handled by Prisma
      },
    });

    // Fire-and-forget insight generation after save so POST stays fast.
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

    const missingAI = entries.filter(hasMissingInsights);

    // Return entries immediately, even if some are still generating insights
    return NextResponse.json(
      {
        entries,
        missingInsightsCount: missingAI.length,
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
    // Extract the entry ID from the request
    // We can get it from query params: /api/journal?id=xxx
    // or from the request body
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    // If not in query params, try the body
    let entryId = id;
    if (!entryId) {
      try {
        const body = await req.json();
        entryId = body.id;
      } catch {
        // Body might be empty, that's okay
      }
    }

    if (!entryId || typeof entryId !== "string") {
      return NextResponse.json(
        { error: "Entry ID is required" },
        { status: 400 }
      );
    }

    // Delete the entry using Prisma
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
