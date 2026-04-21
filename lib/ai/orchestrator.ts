import {
  generateJournalInsights,
  generateProfileInsights,
} from "@/lib/ai/gemini";
import { prisma } from "@/lib/prisma";

export type OrchestrationType = "journal_insight" | "profile_update";

type RunOrchestrationInput = {
  type: OrchestrationType;
  content: string;
  userId: string;
  profile?: string;
  currentEntryCreatedAt?: Date;
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

export async function runOrchestration({
  type,
  content,
  userId,
  profile,
  currentEntryCreatedAt,
}: RunOrchestrationInput) {
  // Keep userId in the contract even if unused right now.
  // It gives us a stable place to add per-user policy/logging later.
  void userId;

  if (type === "journal_insight") {
    return generateJournalInsights(content);
  }

  if (type === "profile_update") {
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
