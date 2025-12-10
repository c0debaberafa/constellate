import { Card } from "@/components/ui/card";
import { Sparkles, TrendingUp, Brain, Heart } from "lucide-react";

const Reflections = () => {
  return (
    <div className="w-[80%] py-8 sm:px-6 sm:py-12 mt-16">
      <div className="max-w-6xl mx-auto space-y-8">
        <header className="space-y-2">
          <div className="flex items-center gap-3">
            <Sparkles className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-semibold text-foreground font-mono">
              Reflections
            </h1>
          </div>
          <p className="text-muted-foreground font-mono">
            Your mental landscape and insights
          </p>
        </header>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card className="p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <Sparkles className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-medium text-foreground font-mono">
                  AI Insights
                </h3>
                <p className="text-sm text-muted-foreground font-mono">
                  Coming soon
                </p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground font-mono">
              Discover patterns and insights from your journal entries
            </p>
          </Card>

          <Card className="p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <TrendingUp className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-medium text-foreground font-mono">
                  Progress Tracking
                </h3>
                <p className="text-sm text-muted-foreground font-mono">
                  Coming soon
                </p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground font-mono">
              Visualize your journaling journey and growth over time
            </p>
          </Card>

          <Card className="p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <Brain className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-medium text-foreground font-mono">
                  Mental Landscape
                </h3>
                <p className="text-sm text-muted-foreground font-mono">
                  Coming soon
                </p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground font-mono">
              Interactive map of your thoughts and emotional themes
            </p>
          </Card>

          <Card className="p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <Heart className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-medium text-foreground font-mono">
                  Mood Analysis
                </h3>
                <p className="text-sm text-muted-foreground font-mono">
                  Coming soon
                </p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground font-mono">
              Track emotional patterns and well-being trends
            </p>
          </Card>
        </div>

        <div className="text-center py-12">
          <p className="text-muted-foreground text-sm font-mono">
            Keep journaling to unlock personalized insights and reflections
          </p>
        </div>
      </div>
    </div>
  );
};

export default Reflections;
