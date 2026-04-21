import {
  generateJournalInsights,
  generateProfileInsights,
  type JournalInsights,
  type ProfileInsights,
} from "@/lib/ai/gemini";
import { prisma } from "@/lib/prisma";

// Central orchestration boundary between API routes and model-specific code.
// Keeps request handlers thin and gives one place to add policy, telemetry,
// and future model-routing without touching route logic.
export type OrchestrationType = "journal_insight" | "profile_update";

type RunOrchestrationInput = {
  type: OrchestrationType;
  content: string;
  userId: string;
  profile?: string;
  currentEntryCreatedAt?: Date;
};

type JournalInsightInput = RunOrchestrationInput & {
  type: "journal_insight";
};

type ProfileUpdateInput = RunOrchestrationInput & {
  type: "profile_update";
  currentEntryCreatedAt: Date;
};

const SUMMARY_FALLBACK_MAX_CHARS = 180;

function getSummaryText(entry: { summary: unknown; content: string }): string {
  if (
    entry.summary &&
    typeof entry.summary === "object" &&
    !Array.isArray(entry.summary)
  ) {
    const summaryObject = entry.summary as { sentence?: unknown };
    if (typeof summaryObject.sentence === "string" && summaryObject.sentence.trim()) {
      return summaryObject.sentence.trim();
    }
  }

  const fallback = entry.content.trim();
  if (fallback.length <= SUMMARY_FALLBACK_MAX_CHARS) {
    return fallback;
  }
  return `${fallback.slice(0, SUMMARY_FALLBACK_MAX_CHARS)}...`;
}

async function getRecentSummaries(
  userId: string,
  currentEntryCreatedAt: Date
): Promise<string[]> {
  // Profile updates should react to near-term trajectory, not full history.
  // Pulling only the latest summaries keeps prompts contextual and bounded.
  const recentEntries = await prisma.journalEntry.findMany({
    where: {
      userId,
      createdAt: { lt: currentEntryCreatedAt },
    },
    select: {
      summary: true,
      content: true,
      createdAt: true,
    },
    orderBy: { createdAt: "desc" },
    take: 2,
  });

  return recentEntries.map(getSummaryText);
}

export async function runOrchestration(
  input: JournalInsightInput
): Promise<JournalInsights>;
export async function runOrchestration(
  input: ProfileUpdateInput
): Promise<ProfileInsights>;
export async function runOrchestration({
  type,
  content,
  userId,
  profile,
  currentEntryCreatedAt,
}: RunOrchestrationInput): Promise<JournalInsights | ProfileInsights> {
  // Keep userId in the contract even when a branch does not consume it yet.
  // This preserves a stable API for per-user controls/auditing later.
  void userId;

  if (type === "journal_insight") {
    return generateJournalInsights(content);
  }

  if (type === "profile_update") {
    // Profile generation needs an ordering anchor so we only use context that
    // existed before this entry, preventing future entries from leaking in.
    if (!currentEntryCreatedAt) {
      throw new Error(
        "currentEntryCreatedAt is required for profile_update orchestration."
      );
    }

    const recentSummaries = await getRecentSummaries(userId, currentEntryCreatedAt);
    return generateProfileInsights(content, profile ?? "{}", recentSummaries);
  }

  throw new Error(`Unsupported orchestration type: ${type satisfies never}`);
}
