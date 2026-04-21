"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import MonkeyEditor from "@/components/MonkeyEditor";
import { toast } from "sonner";
import { Save, Pencil } from "lucide-react";
import { useTyping } from "@/contexts/TypingContext";

const SAVE_ENTRY_TOAST_ID = "save-entry";

type JournalEntry = {
  id: string;
  title: string | null;
  summary: unknown | null;
  highlights: unknown | null;
  aiStatus?: "pending" | "processing" | "completed" | "failed";
  aiAttempts?: number;
};

const hasInsights = (entry: JournalEntry) =>
  Boolean(entry.title && entry.summary && entry.highlights);
const MAX_AI_RETRIES = 3;

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const NewEntry = () => {
  const [content, setContent] = useState("");
  const [cursorPos, setCursorPos] = useState(0);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [goalWordCount, setGoalWordCount] = useState(750);
  const [isEditingGoal, setIsEditingGoal] = useState(false);
  const { isTyping, setIsTyping, isMouseMoving } = useTyping();

  const handleChange = (newContent: string) => {
    setContent(newContent);

    // Reset startTime when content becomes empty
    if (!newContent.trim() && startTime) {
      setStartTime(null);
    }
    // Set startTime when starting from an empty entry
    else if (newContent.trim() && !startTime) {
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
          startedAt: startTime,
        }),
      });

      if (!res.ok) {
        const errorText = await res.text();
        console.error("API error:", errorText);
        throw new Error(`Failed to save entry: ${res.status}`);
      }

      const data = await res.json();
      console.log("Saved:", data);
      return data as { entry: JournalEntry };
    } catch (error) {
      console.error("Error saving entry:", error);
      throw error;
    }
  }

  const monitorJournalInsights = async (entryId: string) => {
    const maxAttempts = 30;
    const pollIntervalMs = 3000;

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      await sleep(pollIntervalMs);

      try {
        const response = await fetch("/api/journal");
        if (!response.ok) {
          continue;
        }

        const data = (await response.json()) as { entries?: JournalEntry[] };
        const updatedEntry = data.entries?.find((entry) => entry.id === entryId);

        if (updatedEntry && hasInsights(updatedEntry)) {
          toast.success("Journal insights generated.", { id: `insights-${entryId}` });
          return;
        }

        if (
          updatedEntry?.aiStatus === "failed" &&
          (updatedEntry.aiAttempts ?? 0) >= MAX_AI_RETRIES
        ) {
          toast.error("Journal insights failed after retries.", {
            id: `insights-${entryId}`,
            description: "Your entry is saved. You can retry by reloading journal.",
          });
          return;
        }
      } catch (error) {
        console.error("Insights polling error:", error);
      }
    }

    toast.error("Journal insights are taking longer than expected.", {
      id: `insights-${entryId}`,
      description: "Your entry is saved. Insights will appear once ready.",
    });
  };

  const handleSubmit = async () => {
    if (!content.trim()) return;

    toast.loading("Saving your entry...", { id: SAVE_ENTRY_TOAST_ID });

    try {
      const { entry } = await saveEntry();
      toast.success("Journal entry saved.", { id: SAVE_ENTRY_TOAST_ID });
      toast.loading("Generating journal insights...", { id: `insights-${entry.id}` });
      setContent("");
      setStartTime(null);
      void monitorJournalInsights(entry.id);
    } catch (error) {
      toast.error("Failed to save journal entry.", {
        id: SAVE_ENTRY_TOAST_ID,
        description: "Please try again.",
      });
      console.error("Save error:", error);
    }
  };

  const getWordCount = (text: string): number =>
    text.trim() === "" ? 0 : text.trim().split(/\s+/).length;

  const wordCount = getWordCount(content);
  const shouldHideUI = isTyping && !isMouseMoving;
  const progress = Math.min((wordCount / goalWordCount) * 100, 100);

  const handleGoalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    if (!isNaN(value) && value > 0) {
      setGoalWordCount(value);
    }
  };

  const handleGoalBlur = () => {
    setIsEditingGoal(false);
  };

  const handleGoalKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      setIsEditingGoal(false);
    }
  };

  // Auto-scroll to keep cursor centered
  useEffect(() => {
    if (!isTyping) return; // Only auto-scroll while typing

    const cursorElement = document.querySelector(".cursor") as HTMLElement;
    if (!cursorElement) return;

    // Get cursor position relative to viewport
    const cursorRect = cursorElement.getBoundingClientRect();
    const cursorY = cursorRect.top + cursorRect.height / 2; // Center of cursor
    const viewportHeight = window.innerHeight;
    const centerY = viewportHeight / 2;

    // Calculate distance from center
    const distanceFromCenter = cursorY - centerY;

    // If cursor is past the center (or within a threshold), scroll to keep it centered
    const threshold = 50; // pixels from center before scrolling
    if (Math.abs(distanceFromCenter) > threshold) {
      const currentScrollY = window.scrollY;
      const targetScrollY = currentScrollY + distanceFromCenter;

      window.scrollTo({
        top: targetScrollY,
        behavior: "smooth",
      });
    }
  }, [cursorPos, content, isTyping]);

  return (
    <div className="w-[80%] md:w-[60%]">
      {/* Primary colored logo that appears when TopNavigation fades out */}
      <div
        className={`fixed top-12 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 transition-opacity duration-300 ${
          shouldHideUI ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      >
        <div className="flex h-8 w-8 md:h-10 md:w-10 items-center justify-center rounded-lg text-primary">
          <svg
            viewBox="-12 -12 269.2 269.2"
            aria-label="Constellate logo"
            className={`h-6 w-6 ${isTyping ? "typing-blink" : ""}`}
            fill="none"
            stroke="currentColor"
            strokeWidth={32}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polygon points="9 236.2 9 9 122.6 122.6 9 236.2" />
            <polygon points="236.2 236.2 236.2 9 122.6 122.6 236.2 236.2" />
          </svg>
        </div>
      </div>

      <header className="sticky top-0 h-36 mb-4 bg-background z-10">
        <div className="absolute bottom-0 w-full py-2">
          <div className="flex items-center gap-2 mb-2">
            <p className="text-muted-foreground font-mono">
              {wordCount} /{" "}
              {isEditingGoal ? (
                <input
                  type="number"
                  value={goalWordCount}
                  onChange={handleGoalChange}
                  onBlur={handleGoalBlur}
                  onKeyDown={handleGoalKeyDown}
                  className="w-16 px-1 bg-background border-b border-muted-foreground text-muted-foreground font-mono focus:outline-none focus:border-primary"
                  autoFocus
                  min="1"
                />
              ) : (
                goalWordCount
              )}
            </p>
            <button
              onClick={() => setIsEditingGoal(true)}
              className={`transition-opacity duration-300 ${
                shouldHideUI ? "opacity-0 pointer-events-none" : "opacity-100"
              }`}
              aria-label="Edit word count goal"
            >
              <Pencil className="h-3 w-3 text-muted-foreground hover:text-primary transition-colors" />
            </button>
          </div>
          {/* Progress bar */}
          <div className="w-full h-1 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
        {/* Gradient fade - positioned at bottom of header to fade content below */}
        <div className="absolute -bottom-4 left-0 right-0 h-4 bg-gradient-to-b from-background to-transparent pointer-events-none z-20" />
      </header>

      <MonkeyEditor
        value={content}
        onChange={handleChange}
        cursorPos={cursorPos}
        onCursorChange={setCursorPos}
        placeholder="&ldquo;Just show up at the page.&rdquo; — Julia Cameron"
        onTypingChange={setIsTyping}
      />

      <div
        className={`flex items-center justify-start py-8 gap-4 transition-opacity duration-800 ${
          shouldHideUI ? "opacity-0 pointer-events-none" : "opacity-100"
        }`}
      >
        <div className="flex flex-col gap-4">
          <Button
            onClick={handleSubmit}
            disabled={!content.trim()}
            size="lg"
            className="px-4 py-2 w-32 border border-muted-foreground bg-primary-background hover:border-primary text-muted-foreground hover:text-primary-foreground"
          >
            <Save />
            Save
          </Button>
          {startTime && (
            <span className="text-xs text-muted-foreground">
              Started {format(startTime, "EEEE, h:mm a d.MM.yyyy")}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default NewEntry;
