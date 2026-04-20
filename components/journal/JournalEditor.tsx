"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface JournalEditorProps {
  onSubmit: (content: string) => void;
  initialContent?: string;
  isEditing?: boolean;
  onCancel?: () => void;
}

export default function JournalEditor({
  onSubmit,
  initialContent = "",
  isEditing = false,
  onCancel,
}: JournalEditorProps) {
  const [content, setContent] = useState(initialContent);

  const handleSubmit = () => {
    if (content.trim()) {
      onSubmit(content);
      if (!isEditing) setContent("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      handleSubmit();
    }
  };

  return (
    <div className="space-y-4">
      <Textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="What's on your mind today?"
        className="min-h-[200px] font-mono text-base resize-none focus-visible:ring-primary"
      />
      <div className="flex gap-3 justify-end">
        {isEditing && onCancel && (
          <Button
            onClick={onCancel}
            variant="secondary"
            className="transition-smooth"
          >
            Cancel
          </Button>
        )}
        <Button
          onClick={handleSubmit}
          disabled={!content.trim()}
          className="transition-smooth"
        >
          {isEditing ? "Save Changes" : "Save Entry"}
        </Button>
      </div>
    </div>
  );
}
