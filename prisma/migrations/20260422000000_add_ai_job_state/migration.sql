-- Add durable, DB-backed AI enrichment job state to journal entries.
-- This allows retries across process restarts without external queue infra.
ALTER TABLE "JournalEntry"
ADD COLUMN "aiStatus" TEXT NOT NULL DEFAULT 'pending',
ADD COLUMN "aiAttempts" INTEGER NOT NULL DEFAULT 0;
