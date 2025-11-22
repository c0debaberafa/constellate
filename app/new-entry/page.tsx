"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Save, PenSquare } from "lucide-react";
import { format } from "date-fns";

const NewEntry = () => {
  const [content, setContent] = useState("");
  const [startTime, setStartTime] = useState<Date | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  }, [content]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    setContent(newContent);

    // Set start time when user first starts typing
    if (newContent.trim() && !startTime) {
      setStartTime(new Date());
    }
  };

  const handleSubmit = () => {
    if (content.trim()) {
      // Placeholder: This will connect to backend later
      // startTime can be passed as part of the journal entry data
      toast.success("Entry saved successfully");
      setContent("");
      setStartTime(null);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      handleSubmit();
    }
  };

  const getWordCount = (text: string): number => {
    return text.trim() === "" ? 0 : text.trim().split(/\s+/).length;
  };

  const wordCount = getWordCount(content);

  return (
    <div className="px-4 py-8 sm:px-6 sm:py-12">
      <div className="max-w-6xl mx-auto space-y-8">
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
            <p className="text-muted-foreground font-mono">
              <em>&ldquo;Just show up at the page.&rdquo;</em> - Julia Cameron,
              The Artist&apos;s Way
            </p>
            {startTime && (
              <>
                <p className="text-sm text-muted-foreground font-mono">
                  Started on{" "}
                  {format(startTime, "EEEE, MMMM d, yyyy 'at' h:mm a")} | Word
                  count: {wordCount}
                </p>
              </>
            )}
          </div>
        </header>

        <Textarea
          ref={textareaRef}
          value={content}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder="Start writing..."
          spellCheck={false}
          className="font-mono text-lg resize-none border-none bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-muted-foreground/40 overflow-hidden"
          style={{ minHeight: "auto", height: "auto" }}
        />
      </div>
    </div>
  );
};

export default NewEntry;
