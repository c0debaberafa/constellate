"use client";

import { useState, useLayoutEffect } from "react";
import { PenSquare, BookOpen, Sparkles, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { useTyping } from "@/contexts/TypingContext";

const menuItems = [
  { title: "New Entry", url: "/new-entry", icon: PenSquare },
  { title: "Journal Entries", url: "/journal", icon: BookOpen },
  { title: "Reflections", url: "/reflections", icon: Sparkles },
];

export function AppSidebar() {
  const { theme, setTheme } = useTheme();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const { isTyping, isMouseMoving } = useTyping();
  const shouldHideUI = isTyping && !isMouseMoving;

  // Prevent hydration mismatch with next-themes
  useLayoutEffect(() => {
    setMounted(true);
  }, []);

  return (
    <TooltipProvider>
      <aside
        className={`fixed left-0 top-0 z-10 h-screen w-16 bg-sidebar flex flex-col transition-opacity duration-300 ${
          shouldHideUI ? "opacity-0 pointer-events-none" : "opacity-100"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-center h-16 ">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <BookOpen className="h-5 w-5 text-primary" />
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 flex flex-col items-center py-4 gap-2">
          {menuItems.map((item) => (
            <Tooltip key={item.title}>
              <TooltipTrigger asChild>
                <Link
                  href={item.url}
                  className={`group flex items-center justify-center h-10 w-10 rounded-md transition-colors ${
                    pathname === item.url
                      ? "bg-primary/10"
                      : "hover:bg-sidebar-accent/40 hover:text-sidebar-accent-foreground "
                  }`}
                >
                  <item.icon
                    className={`h-5 w-5 group-hover:text-primary ${
                      pathname === item.url
                        ? "text-primary"
                        : "text-muted-foreground"
                    }`}
                  />
                </Link>
              </TooltipTrigger>
              <TooltipContent side="right" className="">
                <p className="font-bold">{item.title}</p>
              </TooltipContent>
            </Tooltip>
          ))}
        </nav>

        {/* Footer */}
        <div className="p-2" suppressHydrationWarning>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                variant="ghost"
                size="icon"
                className="h-10 w-10"
              >
                {mounted && theme === "dark" ? (
                  <Sun className="h-5 w-5" />
                ) : (
                  <Moon className="h-5 w-5" />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">
              <p>{mounted && theme === "dark" ? "Light Mode" : "Dark Mode"}</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </aside>
    </TooltipProvider>
  );
}
