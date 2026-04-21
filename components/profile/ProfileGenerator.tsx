"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Sparkles } from "lucide-react";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";

export default function ProfileGenerator() {
  const { userId, isLoaded } = useAuth();
  const router = useRouter();

  const [hasNewEntry, setHasNewEntry] = useState(false);
  const [entryIdToProcess, setEntryIdToProcess] = useState<string | null>(null);
  const [entryCreatedAt, setEntryCreatedAt] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Function to check for pending entries
  const checkProcessingStatus = async () => {
    if (!isLoaded || !userId) {
      return;
    }

    try {
      const response = await fetch("/api/profile/check");
      if (!response.ok) {
        // Silently fail - don't show error for polling
        return;
      }

      const data = await response.json();
      setHasNewEntry(data.hasEntryToProcess);
      setEntryIdToProcess(data.entryId);
      setEntryCreatedAt(data.entryCreatedAt || null);

      // Clear status message if no entry to process
      if (!data.hasEntryToProcess) {
        setStatusMessage(null);
        setEntryCreatedAt(null);
      }
    } catch (err) {
      // Silently fail during polling - don't disrupt the UI
      console.error("Profile check error (silent):", err);
    }
  };

  // Check on component load and when auth is ready
  useEffect(() => {
    if (isLoaded && userId) {
      checkProcessingStatus();
    }
  }, [isLoaded, userId]);

  // Polling effect: Check for new entries every 4 seconds
  // Only polls when there's no entry currently being processed
  useEffect(() => {
    if (!isLoaded || !userId || isProcessing) {
      return;
    }

    const pollInterval = setInterval(() => {
      checkProcessingStatus();
    }, 4000); // Poll every 4 seconds

    return () => {
      clearInterval(pollInterval);
    };
  }, [isLoaded, userId, isProcessing]);

  // Handle the "Generate Insights" button click
  const handleGenerateInsights = async () => {
    if (!entryIdToProcess || isProcessing) {
      return;
    }

    setIsProcessing(true);
    setStatusMessage("Generating insights...");
    toast.loading("Generating user insights...", { id: "generate-user-insights" });

    try {
      const response = await fetch("/api/profile/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ entryId: entryIdToProcess }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || "Failed to generate insights. Please try again."
        );
      }

      const data = await response.json();
      setStatusMessage(
        `Success! Profile updated to version ${data.newVersion}.`
      );
      toast.success("User insights generated successfully.", {
        id: "generate-user-insights",
        description: `Profile updated to version ${data.newVersion}.`,
      });

      // Reset state
      setHasNewEntry(false);
      setEntryIdToProcess(null);
      setEntryCreatedAt(null);

      // Check for another entry immediately (sequential processing)
      await checkProcessingStatus();

      // Dispatch custom event to refresh insights data
      window.dispatchEvent(new Event("profileUpdated"));

      // Also refresh the router to ensure latest data
      router.refresh();
    } catch (error) {
      console.error("Error generating insights:", error);
      toast.error("Failed to generate user insights.", {
        id: "generate-user-insights",
        description:
          error instanceof Error
            ? error.message
            : "Please try again in a moment.",
      });
      setStatusMessage(
        error instanceof Error
          ? error.message
          : "Failed to generate insights. Please try again."
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const displayMessage = (() => {
    if (isProcessing && entryCreatedAt) {
      return `Generating insights for ${new Date(
        entryCreatedAt
      ).toLocaleString()}`;
    }

    if (hasNewEntry && entryCreatedAt) {
      return `New insights ready for ${new Date(
        entryCreatedAt
      ).toLocaleString()}`;
    }

    if (!hasNewEntry && !isProcessing) {
      return "No new insights available. Create a new entry to update.";
    }

    return null;
  })();

  return (
    <Card className="p-6 border-primary/20 bg-gradient-to-br from-primary/5 to-card">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-primary/10">
            <Sparkles className="w-5 h-5 text-primary" />
          </div>
          <div>
            {displayMessage && (
              <p className="text-sm mt-1 font-mono text-primary">
                {displayMessage}
              </p>
            )}
          </div>
        </div>

        {hasNewEntry && (
          <Button
            onClick={handleGenerateInsights}
            disabled={isProcessing || !entryIdToProcess}
            className="font-mono"
          >
            {isProcessing ? (
              <>
                <Spinner className="h-4 w-4" />
                Processing...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Generate Insights
              </>
            )}
          </Button>
        )}
      </div>
    </Card>
  );
}
