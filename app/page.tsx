import { BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Home() {
  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-3.5rem)] px-4">
      <div className="max-w-2xl mx-auto text-center space-y-8">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mb-4">
          <BookOpen className="w-10 h-10 text-primary" />
        </div>

        <div className="space-y-4">
          <h1 className="text-5xl font-semibold text-foreground font-mono">
            FRED
          </h1>
          <p className="text-xl text-primary font-medium font-mono">
            Focused reflection every day.
          </p>
          <p className="text-lg text-muted-foreground font-mono">
            Your companion for daily self-reflection
          </p>
        </div>

        <div className="space-y-4 pt-8">
          <p className="text-muted-foreground max-w-md mx-auto font-mono">
            Discover clarity through journaling. Take a moment each day to
            reflect, understand yourself better, and cultivate inner calm.
          </p>

          <Link href="/new-entry">
            <Button size="lg" className="px-8 py-6 text-lg">
              Begin Your Journey
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
