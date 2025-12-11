"use client";

import { useState } from "react";
import { format } from "date-fns";
import { MoreVertical } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export interface JournalEntry {
  id: string;
  content: string;
  createdAt: Date;
}

interface JournalEntryCardProps {
  entry: JournalEntry;
  maxLength?: number;
  onDelete?: (id: string) => Promise<void>;
}

export default function JournalEntryCard({
  entry,
  onDelete,
}: JournalEntryCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleCardClick = () => {
    setIsExpanded(!isExpanded);
  };

  const handleDropdownClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  const handleDeleteClick = () => {
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!onDelete) return;

    try {
      setIsDeleting(true);
      await onDelete(entry.id);
      setIsDeleteDialogOpen(false);
      setIsExpanded(false);
    } catch (error) {
      console.error("Error deleting entry:", error);
      // Error is already handled by the parent component via toast
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <Card
        className={cn(
          "cursor-pointer gap-2 hover:border-primary/40 transition-colors",
          isExpanded && "border-primary/40"
        )}
        onClick={handleCardClick}
      >
        <CardHeader className="flex flex-row items-center justify-between gap-4">
          <CardTitle className="flex-1">
            <time className="text-md text-foreground font-semibold">
              {format(entry.createdAt, "EEEE, d MMM yyyy h:mm a")}
            </time>
          </CardTitle>
          <div onClick={handleDropdownClick} className="flex-shrink-0">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon-sm" className="h-8 w-8">
                  <MoreVertical className="hover:text-red-500 text-muted-foreground h-4 w-4" />
                  <span className="sr-only">Open menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  variant="destructive"
                  onSelect={handleDeleteClick}
                  disabled={isDeleting}
                >
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>

        <CardContent>
          <p className="text-primary text-md font-semibold mb-4">
            Generating summary...
          </p>
          <div className="space-y-8 overflow-hidden">
            <div
              className={`transition-all duration-300 ease-in-out ${
                isExpanded ? "max-h-[5000px]" : ""
              }`}
            >
              <p
                className={`text-muted-foreground font-mono text-sm leading-relaxed whitespace-pre-wrap ${
                  !isExpanded ? "line-clamp-2" : ""
                }`}
              >
                {entry.content}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Entry</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this entry? This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
