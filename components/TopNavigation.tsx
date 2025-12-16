"use client";

import { PenSquare, BookOpen, Sparkles } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTyping } from "@/contexts/TypingContext";
import { UserButton, SignedIn, SignedOut, SignUpButton } from "@clerk/nextjs";

export function TopNavigation() {
  const pathname = usePathname();
  const { isTyping, isMouseMoving } = useTyping();
  const shouldHideUI = isTyping && !isMouseMoving;

  return (
    <nav
      className={`fixed group hover:border-white/40 transition-all top-4 left-1/2 -translate-x-1/2 z-50 h-16 w-[95%] md:w-[80%] max-w-6xl bg-black/20 backdrop-blur-md border border-sidebar-border rounded-lg shadow-lg flex items-center justify-between px-2 md:px-4  duration-300 ${
        shouldHideUI ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
    >
      {/* Left side - New Entry and Journal */}
      <div className="flex items-center gap-1 md:gap-2">
        <SignedIn>
          <Link
            href="/new-entry"
            className={`flex items-center justify-center h-9 px-3 rounded-md transition-colors ${
              pathname === "/new-entry"
                ? "bg-primary/10 text-primary"
                : "hover:bg-sidebar-accent/40 hover:text-sidebar-accent-foreground text-muted-foreground group-hover:text-white"
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
                : "hover:bg-sidebar-accent/40 hover:text-sidebar-accent-foreground text-muted-foreground group-hover:text-white"
            }`}
          >
            <BookOpen className="h-4 w-4 md:mr-2" />
            <span className="hidden md:inline text-sm font-medium">
              Journal
            </span>
          </Link>
        </SignedIn>
      </div>

      {/* Center - BookOpen Logo */}
      <div className="absolute left-1/2 -translate-x-1/2">
        <Link href="/">
          <div className="flex h-8 w-8 md:h-10 md:w-10 items-center justify-center rounded-lg cursor-pointer text-muted-foreground group-hover:text-white hover:bg-sidebar-accent/40 hover:text-white transition-colors">
            <svg
              viewBox="-12 -12 269.2 269.2"
              aria-label="Constellate logo"
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
        </Link>
      </div>

      {/* Right side - Insights and User */}
      <div className="flex items-center gap-1 md:gap-2">
        <SignedIn>
          <Link
            href="/insights"
            className={`flex items-center justify-center h-9 px-3 rounded-md transition-colors ${
              pathname === "/insights"
                ? "bg-primary/10 text-primary "
                : "hover:bg-sidebar-accent/40 hover:text-sidebar-accent-foreground text-muted-foreground group-hover:text-white"
            }`}
          >
            <Sparkles className="h-4 w-4 md:mr-2" />
            <span className="hidden md:inline text-sm font-medium">
              Insights
            </span>
          </Link>
        </SignedIn>
        <SignedIn>
          <UserButton
            appearance={{
              elements: {
                userButtonAvatarBox:
                  "h-8 w-8 border border-sidebar-border/80 rounded-full",
                userButtonPopoverCard:
                  "bg-background/95 border border-sidebar-border/80 rounded-xl shadow-lg",
                userButtonPopoverHeaderTitle:
                  "font-mono text-sm text-foreground",
                userButtonPopoverHeaderSubtitle:
                  "font-mono text-xs text-muted-foreground",
                userButtonPopoverActionButton:
                  "font-mono text-xs bg-transparent hover:bg-sidebar-accent/40 text-muted-foreground hover:text-sidebar-accent-foreground rounded-md",
                userButtonPopoverFooter:
                  "border-t border-sidebar-border/60 mt-2 pt-2",
              },
            }}
          />
        </SignedIn>
        <SignedOut>
          <SignUpButton mode="modal">
            <button className="inline-flex items-center justify-center h-9 px-3 rounded-md border border-sidebar-border bg-primary text-xs font-mono text-black hover:bg-sidebar-accent/40 hover:text-sidebar-accent-foreground transition-colors">
              Sign up
            </button>
          </SignUpButton>
        </SignedOut>
      </div>
    </nav>
  );
}
