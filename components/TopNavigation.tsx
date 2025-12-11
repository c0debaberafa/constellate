"use client";

import { useState, useEffect } from "react";
import { PenSquare, BookOpen, Sparkles, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useTyping } from "@/contexts/TypingContext";

export function TopNavigation() {
  const { theme, setTheme } = useTheme();
  const pathname = usePathname();
  const { isTyping, isMouseMoving } = useTyping();
  const shouldHideUI = isTyping && !isMouseMoving;
  const [mounted, setMounted] = useState(false);

  // Prevent hydration mismatch with next-themes
  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <nav
      className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 h-16 w-[95%] md:w-[80%] max-w-6xl bg-black/20 backdrop-blur-md border border-sidebar-border rounded-lg shadow-lg flex items-center justify-between px-2 md:px-4 transition-opacity duration-300 ${
        shouldHideUI ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
    >
      {/* Left side - New Entry and Journal */}
      <div className="flex items-center gap-1 md:gap-2">
        <Link
          href="/new-entry"
          className={`flex items-center justify-center h-9 px-3 rounded-md transition-colors ${
            pathname === "/new-entry"
              ? "bg-primary/10 text-primary"
              : "hover:bg-sidebar-accent/40 hover:text-sidebar-accent-foreground text-muted-foreground"
          }`}
        >
          <PenSquare className="h-4 w-4 md:mr-2" />
          <span className="hidden md:inline text-sm font-medium">
            New Entry
          </span>
        </Link>
        <Link
          href="/journal"
          className={`flex items-center justify-center h-9 px-3 rounded-md transition-colors ${
            pathname === "/journal"
              ? "bg-primary/10 text-primary"
              : "hover:bg-sidebar-accent/40 hover:text-sidebar-accent-foreground text-muted-foreground"
          }`}
        >
          <BookOpen className="h-4 w-4 md:mr-2" />
          <span className="hidden md:inline text-sm font-medium">Journal</span>
        </Link>
      </div>

      {/* Center - BookOpen Logo */}
      <div className="absolute left-1/2 -translate-x-1/2">
        <div className="flex h-8 w-8 md:h-10 md:w-10 items-center justify-center rounded-lg cursor-pointer text-muted-foreground hover:bg-sidebar-accent/40 hover:text-white transition-colors">
          <svg
            viewBox="-12 -12 269.2 269.2"
            aria-label="Fred logo"
            className="h-6 w-6 "
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

      {/* Right side - Insights and Theme Toggle */}
      <div className="flex items-center gap-1 md:gap-2">
        <Link
          href="/insights"
          className={`flex items-center justify-center h-9 px-3 rounded-md transition-colors ${
            pathname === "/insights"
              ? "bg-primary/10 text-primary"
              : "hover:bg-sidebar-accent/40 hover:text-sidebar-accent-foreground text-muted-foreground"
          }`}
        >
          <Sparkles className="h-4 w-4 md:mr-2" />
          <span className="hidden md:inline text-sm font-medium">Insights</span>
        </Link>
        <Button
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          variant="ghost"
          size="icon"
          className="h-9 w-9"
          suppressHydrationWarning
        >
          {mounted && theme === "dark" ? (
            <Sun className="h-4 w-4" />
          ) : (
            <Moon className="h-4 w-4" />
          )}
        </Button>
      </div>
    </nav>
  );
}
