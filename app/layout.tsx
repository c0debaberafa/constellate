"use client";

import "./globals.css";
import { TopNavigation } from "@/components/TopNavigation";
import { ThemeProvider } from "next-themes";
import { TypingProvider } from "@/contexts/TypingContext";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-background text-foreground antialiased font-mono">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <TypingProvider>
            <TopNavigation />
            <main className="flex justify-center min-h-screen">{children}</main>
          </TypingProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
