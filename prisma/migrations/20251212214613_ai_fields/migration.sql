-- AlterTable
ALTER TABLE "JournalEntry" ADD COLUMN     "embedding" DOUBLE PRECISION[],
ADD COLUMN     "highlights" JSONB,
ADD COLUMN     "summary" JSONB,
ADD COLUMN     "title" TEXT;
