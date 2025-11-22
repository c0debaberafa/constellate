"use client";

import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Pencil, Trash2 } from "lucide-react";

export interface JournalEntry {
  id: string;
  content: string;
  createdAt: Date;
  updatedAt?: Date;
}

interface JournalEntryCardProps {
  entry: JournalEntry;
  onEdit: (entry: JournalEntry) => void;
  onDelete: (id: string) => void;
}

export default function JournalEntryCard({
  entry,
  onEdit,
  onDelete,
}: JournalEntryCardProps) {
  return (
    <Card className="p-6 hover:shadow-md transition-smooth">
      <div className="space-y-4">
        <div className="flex justify-between items-start gap-4">
          <div className="flex-1">
            <time className="text-sm text-muted-foreground font-medium">
              {format(entry.createdAt, "EEEE, MMMM d, yyyy 'at' h:mm a")}
            </time>
            {entry.updatedAt && (
              <p className="text-xs text-muted-foreground mt-1">
                (edited {format(entry.updatedAt, "MMM d 'at' h:mm a")})
              </p>
            )}
          </div>
          <div className="flex gap-2">
            <Button
              onClick={() => onEdit(entry)}
              variant="secondary"
              size="sm"
              className="h-8 w-8 p-0"
            >
              <Pencil className="h-4 w-4" />
              <span className="sr-only">Edit entry</span>
            </Button>
            <Button
              onClick={() => onDelete(entry.id)}
              variant="secondary"
              size="sm"
              className="h-8 w-8 p-0 hover:bg-destructive/10 hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
              <span className="sr-only">Delete entry</span>
            </Button>
          </div>
        </div>
        <p className="text-foreground font-mono leading-relaxed whitespace-pre-wrap">
          {entry.content}
        </p>
      </div>
    </Card>
  );
}
