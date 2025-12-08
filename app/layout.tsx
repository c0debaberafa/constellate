"use client";

import "./globals.css";
import { AppSidebar } from "@/components/AppSidebar";
import { ThemeProvider } from "next-themes";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-background text-foreground antialiased font-mono">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <div className="flex min-h-screen w-full">
            <AppSidebar />
            <main className="flex-1 ml-16 flex justify-center">{children}</main>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
