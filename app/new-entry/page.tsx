"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import MonkeyEditor from "@/components/MonkeyEditor";
import { toast } from "sonner";
import { Save } from "lucide-react";
import { useTyping } from "@/contexts/TypingContext";

const NewEntry = () => {
  const [content, setContent] = useState("");
  const [cursorPos, setCursorPos] = useState(0);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const { isTyping, setIsTyping, isMouseMoving } = useTyping();

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
          createdAt: startTime,
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
  const shouldHideUI = isTyping && !isMouseMoving;
  const progress = Math.min((wordCount / 750) * 100, 100);

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
    <div className="w-[90%] md:w-[60%]">
      <header className="sticky top-0 h-36 mb-4 bg-background z-10">
        <div className="absolute bottom-0 w-full py-2">
          <p className="mb-2 text-muted-foreground font-mono">
            {wordCount} / 750
          </p>
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
