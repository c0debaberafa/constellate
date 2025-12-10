import { BookOpen } from "lucide-react";
interface JournalStatsProps {
  avgWordCount: number;
  currentStreak: number;
  longestStreak: number;
  totalEntries: number;
}

export default function JournalStats({
  avgWordCount,
  currentStreak,
  longestStreak,
  totalEntries,
}: JournalStatsProps) {
  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-card border rounded-lg p-6">
          <h3 className="text-sm font-medium text-muted-foreground mb-2">
            Current Streak
          </h3>
          <p className="text-2xl font-semibold text-primary">{currentStreak}</p>
        </div>
        <div className="bg-card border rounded-lg p-6">
          <h3 className="text-sm font-medium text-muted-foreground mb-2">
            Longest Streak
          </h3>
          <p className="text-2xl font-semibold text-primary">{longestStreak}</p>
        </div>
        <div className="bg-card border rounded-lg p-6">
          <h3 className="text-sm font-medium text-muted-foreground mb-2">
            Total Entries
          </h3>
          <p className="text-2xl font-semibold text-primary">{totalEntries}</p>
        </div>
        <div className="bg-card border rounded-lg p-6">
          <h3 className="text-sm font-medium text-muted-foreground mb-2">
            Average Word Count
          </h3>
          <p className="text-2xl font-semibold text-primary">{avgWordCount}</p>
        </div>
      </div>
    </>
  );
}
