"use client";

import { useState } from "react";
import { format } from "date-fns";
import { MoreVertical } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { X } from "lucide-react";

export interface JournalEntry {
  id: string;
  content: string;
  createdAt: Date;
}

interface JournalEntryCardProps {
  entry: JournalEntry;
  maxLength?: number;
}

const DEFAULT_MAX_LENGTH = 240;

export default function JournalEntryCard({
  entry,
  maxLength = DEFAULT_MAX_LENGTH,
}: JournalEntryCardProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const truncatedContent =
    entry.content.length > maxLength
      ? entry.content.slice(0, maxLength) + "..."
      : entry.content;

  const handleCardClick = () => {
    setIsDialogOpen(true);
  };

  const handleDropdownClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <>
      <Card
        className="p-6 hover:shadow-md transition-smooth relative cursor-pointer w-full h-full"
        onClick={handleCardClick}
      >
        <div className="space-y-4">
          <time className="text-sm text-foreground font-medium">
            {format(entry.createdAt, "EEEE, d.MM.yyyy h:mm a")}
          </time>
          <p className="text-muted-foreground font-mono text-xs leading-relaxed whitespace-pre-wrap">
            {truncatedContent}
          </p>
        </div>
        <div onClick={handleDropdownClick}>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon-sm"
                className="absolute bottom-2 right-2 h-8 w-8"
              >
                <MoreVertical className="h-4 w-4" />
                <span className="sr-only">Open menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem variant="destructive" onSelect={() => {}}>
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent
          className="w-full max-w-2xl max-h-[85vh]"
          showCloseButton={false}
        >
          <DialogHeader className="flex-shrink-0">
            <div className="flex items-center justify-between">
              <DialogTitle className="text-sm text-foreground font-medium">
                {format(entry.createdAt, "EEEE, d.MM.yyyy h:mm a")}
              </DialogTitle>
              <DialogClose asChild>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="h-8 w-8 opacity-70 hover:opacity-100"
                >
                  <X className="h-4 w-4" />
                  <span className="sr-only">Close</span>
                </Button>
              </DialogClose>
            </div>
          </DialogHeader>
          <div className="mt-4 pb-12 overflow-y-auto flex-1 min-h-0">
            <p className="text-muted-foreground font-mono text-sm leading-relaxed whitespace-pre-wrap">
              {entry.content}
            </p>
          </div>
          <div
            onClick={handleDropdownClick}
            className="absolute bottom-2 right-2"
          >
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon-sm" className="h-8 w-8">
                  <MoreVertical className="h-4 w-4" />
                  <span className="sr-only">Open menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem variant="destructive" onSelect={() => {}}>
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
