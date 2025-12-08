"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import AnimatedTextarea from "@/components/editor/AnimatedTextarea";
import { toast } from "sonner";
import { Save, PenSquare } from "lucide-react";
import { format } from "date-fns";

const NewEntry = () => {
  const [content, setContent] = useState("");
  const [cursorPos, setCursorPos] = useState(0);
  const [startTime, setStartTime] = useState<Date | null>(null);

  const handleChange = (newContent: string) => {
    setContent(newContent);

    if (newContent.trim() && !startTime) {
      setStartTime(new Date());
    }
  };

  async function saveEntry() {
    try {
      const res = await fetch("/api/journal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content,
          createdAt: startTime, // optional
        }),
      });

      if (!res.ok) {
        const errorText = await res.text();
        console.error("API error:", errorText);
        throw new Error(`Failed to save entry: ${res.status}`);
      }

      const data = await res.json();
      console.log("Saved:", data);
      return data;
    } catch (error) {
      console.error("Error saving entry:", error);
      throw error;
    }
  }

  const handleSubmit = async () => {
    if (!content.trim()) return;

    try {
      await saveEntry();
      toast.success("Entry saved successfully");
      setContent("");
      setStartTime(null);
    } catch (error) {
      toast.error("Failed to save entry. Please try again.");
      console.error("Save error:", error);
    }
  };

  const getWordCount = (text: string): number =>
    text.trim() === "" ? 0 : text.trim().split(/\s+/).length;

  const wordCount = getWordCount(content);

  return (
    <div className="px-4 py-8 sm:px-6 sm:py-12">
      <div className="max-w-6xl mx-auto">
        <header className="space-y-2">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <PenSquare className="h-8 w-8 text-primary" />
              <h1 className="text-3xl font-semibold text-foreground font-mono">
                New Entry
              </h1>
            </div>

            <Button
              onClick={handleSubmit}
              disabled={!content.trim()}
              size="lg"
              className="px-12"
            >
              <Save />
            </Button>
          </div>

          <div className="space-y-1">
            {startTime ? (
              <p className="text-muted-foreground font-mono">
                Started on {format(startTime, "EEEE, MMMM d, yyyy 'at' h:mm a")}{" "}
                | Word count: {wordCount}
              </p>
            ) : (
              <p className="text-muted-foreground font-mono">
                <em>&ldquo;Just show up at the page.&rdquo;</em> — Julia Cameron
              </p>
            )}
          </div>
        </header>

        <AnimatedTextarea
          value={content}
          onChange={handleChange}
          cursorPos={cursorPos}
          onCursorChange={setCursorPos}
          placeholder="Start writing..."
        />
      </div>
    </div>
  );
};

export default NewEntry;
