"use client";

import { useState, useEffect, useRef } from "react";
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
  const editorContainerRef = useRef<HTMLDivElement>(null);

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
    <div className="w-[60%] px-0 sm:px-4 py-8">
      <header className="space-y-2 sticky top-0 mb-8 bg-background z-10 pt-4">
        <div className="">
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
        <div className="absolute -bottom-8 left-0 right-0 h-8 bg-gradient-to-b from-background to-transparent≈ pointer-events-none z-20" />
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
        <Button
          onClick={handleSubmit}
          disabled={!content.trim()}
          size="lg"
          className="px-4 py-2 border border-muted-foreground bg-primary-background hover:border-primary text-muted-foreground hover:text-primary-foreground"
        >
          <Save />
          Save
        </Button>
      </div>
    </div>
  );
};

export default NewEntry;
