"use client";

import { useState, useMemo } from "react";
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
import {
  HoverCard,
  HoverCardTrigger,
  HoverCardContent,
} from "@/components/ui/hover-card";

export interface JournalEntry {
  id: string;
  content: string;
  createdAt: Date;
  title?: string | null;
  summary?: {
    sentence: string;
    bullets: string[];
  } | null;
  highlights?: Array<{
    quote: string;
    annotation: string;
  }> | null;
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
  const [isHovered, setIsHovered] = useState(false);

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

  // Calculate word count for the entry
  const wordCount = useMemo(() => {
    const getWordCount = (text: string): number =>
      text.trim() === "" ? 0 : text.trim().split(/\s+/).length;
    return getWordCount(entry.content);
  }, [entry.content]);

  // Process content to highlight quotes with hover cards
  const highlightedContent = useMemo(() => {
    if (!entry.highlights || entry.highlights.length === 0) {
      return null; // Return null to indicate no processing needed
    }

    const content = entry.content;
    const parts: Array<{
      text: string;
      isHighlight?: boolean;
      annotation?: string;
    }> = [];

    // Find all quote positions in the content
    const highlightsWithPositions = entry.highlights
      .map((highlight) => {
        const quoteText = highlight.quote.trim();
        let position = -1;
        let actualQuote = quoteText;

        // Create a flexible regex pattern that treats newlines as whitespace
        // Escape special regex characters, then replace whitespace with flexible whitespace pattern
        const escapedQuote = quoteText.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        // Replace any sequence of whitespace (including newlines) with a flexible whitespace pattern
        const flexiblePattern = escapedQuote.replace(/\s+/g, "\\s+");
        const regex = new RegExp(flexiblePattern, "i");
        const match = content.match(regex);

        if (match && match.index !== undefined) {
          position = match.index;
          actualQuote = match[0];
        } else {
          // Try without surrounding quotes
          const unquoted = quoteText.replace(/^["']|["']$/g, "");
          if (unquoted !== quoteText) {
            const escapedUnquoted = unquoted.replace(
              /[.*+?^${}()|[\]\\]/g,
              "\\$&"
            );
            const flexibleUnquotedPattern = escapedUnquoted.replace(
              /\s+/g,
              "\\s+"
            );
            const unquotedRegex = new RegExp(flexibleUnquotedPattern, "i");
            const unquotedMatch = content.match(unquotedRegex);
            if (unquotedMatch && unquotedMatch.index !== undefined) {
              position = unquotedMatch.index;
              actualQuote = unquotedMatch[0];
            }
          }
        }

        return position !== -1 ? { ...highlight, position, actualQuote } : null;
      })
      .filter((h): h is NonNullable<typeof h> => h !== null)
      .sort((a, b) => a.position - b.position);

    // If no highlights found, return null
    if (highlightsWithPositions.length === 0) {
      return null;
    }

    // Build parts array
    let lastIndex = 0;
    highlightsWithPositions.forEach((highlight) => {
      // Add text before this highlight
      if (highlight.position > lastIndex) {
        parts.push({ text: content.substring(lastIndex, highlight.position) });
      }

      // Add the highlighted quote
      parts.push({
        text: highlight.actualQuote,
        isHighlight: true,
        annotation: highlight.annotation,
      });

      lastIndex = highlight.position + highlight.actualQuote.length;
    });

    // Add remaining text after last highlight
    if (lastIndex < content.length) {
      parts.push({ text: content.substring(lastIndex) });
    }

    return parts;
  }, [entry.content, entry.highlights]);

  return (
    <>
      <Card
        className={cn(
          "cursor-pointer gap-2 hover:border-primary/40 transition",
          isExpanded && "border-primary/40"
        )}
        onClick={handleCardClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <CardHeader className="flex flex-row items-center justify-between gap-2">
          <CardTitle className="flex-1">
            <time
              className={cn(
                "text-md font-regular transition-colors duration-200",
                isHovered || isExpanded
                  ? "text-foreground"
                  : "text-muted-foreground"
              )}
            >
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
          <div className="space-y-2 overflow-hidden border-t py-2">
            {/* Title or Loading State */}
            {entry.title ? (
              <h3 className="text-primary text-lg lowercase font-semibold italic mb-2">
                {entry.title}
              </h3>
            ) : (
              <p className="text-primary text-md font-semibold mb-2">
                Generating summary...
              </p>
            )}

            {/* Summary Section */}
            {entry.summary ? (
              <div className="space-y-2 animate-in fade-in duration-300">
                <p className="text-primary text-sm italic leading-relaxed">
                  {entry.summary.sentence}
                </p>
                {entry.summary.bullets && entry.summary.bullets.length > 0 && (
                  <ul className="list-disc list-inside space-y-1 text-primary text-sm">
                    {entry.summary.bullets.map((bullet, idx) => (
                      <li key={idx}>{bullet}</li>
                    ))}
                  </ul>
                )}
              </div>
            ) : null}

            {/* Entry Content with Highlighted Quotes */}
            <div
              className={`transition-all duration-300 ease-in-out ${
                isExpanded ? "max-h-[5000px]" : ""
              }`}
            >
              <div className="mt-4 pt-4 border-t border-border/50">
                <p
                  className={cn(
                    "text-xs mb-2 font-semibold uppercase tracking-wide transition-colors duration-200",
                    isHovered || isExpanded
                      ? "text-foreground"
                      : "text-muted-foreground"
                  )}
                >
                  Full Entry {`(${wordCount} words)`}
                </p>
                <div
                  className={cn(
                    "font-mono text-sm leading-relaxed whitespace-pre-wrap transition-colors duration-200",
                    !isExpanded ? "line-clamp-2" : "",
                    isHovered || isExpanded
                      ? "text-foreground"
                      : "text-muted-foreground"
                  )}
                >
                  {highlightedContent ? (
                    highlightedContent.map((part, idx) => {
                      if (part.isHighlight && part.annotation) {
                        return (
                          <HoverCard key={idx}>
                            <HoverCardTrigger asChild>
                              <span className="text-primary underline font-regular">
                                {part.text}
                              </span>
                            </HoverCardTrigger>
                            <HoverCardContent className="w-80">
                              <p className="italic text-primary text-sm leading-relaxed">
                                {part.annotation}
                              </p>
                            </HoverCardContent>
                          </HoverCard>
                        );
                      }
                      return <span key={idx}>{part.text}</span>;
                    })
                  ) : (
                    <span>{entry.content}</span>
                  )}
                </div>
              </div>
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
