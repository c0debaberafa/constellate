"use client";

import { useTheme } from "next-themes";
import { CheckCircle2, CircleAlert, CircleX, Sparkles } from "lucide-react";
import { Toaster as Sonner, type ToasterProps } from "sonner";
import { Spinner } from "@/components/ui/spinner";

export function Toaster(props: ToasterProps) {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      position="bottom-center"
      offset="2rem"
      expand={false}
      visibleToasts={4}
      icons={{
        loading: <Spinner className="size-4 text-primary" />,
        success: <CheckCircle2 className="size-4 text-primary" />,
        error: <CircleX className="size-4 text-primary" />,
        warning: <CircleAlert className="size-4 text-primary" />,
        info: <Sparkles className="size-4 text-primary" />,
      }}
      toastOptions={{
        classNames: {
          toast:
            "group border border-sidebar-border/80 bg-black/20 text-foreground shadow-lg backdrop-blur-md rounded-lg px-4 py-3",
          title: "font-mono text-sm tracking-tight text-foreground",
          description: "font-mono text-xs text-muted-foreground",
          actionButton:
            "bg-primary/10 text-primary hover:bg-primary/20 font-mono rounded-md px-3 border border-primary/30",
          cancelButton:
            "bg-sidebar-accent/40 text-sidebar-accent-foreground hover:bg-sidebar-accent/60 font-mono rounded-md px-3 border border-sidebar-border/70",
          success:
            "border-primary/40 bg-gradient-to-r from-primary/10 to-black/20 text-foreground",
          error:
            "border-destructive/40 bg-gradient-to-r from-destructive/15 to-black/20 text-foreground",
          warning:
            "border-amber-500/40 bg-gradient-to-r from-amber-500/15 to-black/20 text-foreground",
          info: "border-sidebar-border/80 bg-black/20 text-foreground",
        },
      }}
      {...props}
    />
  );
}
