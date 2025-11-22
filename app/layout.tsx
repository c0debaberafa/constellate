"use client";

import "./globals.css";
import { AppSidebar } from "@/components/AppSidebar";
import { ThemeProvider } from "next-themes";
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-background text-foreground antialiased font-mono">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <SidebarProvider>
            <div className="flex min-h-screen w-full">
              <AppSidebar />
              <SidebarInset className="flex-1">
                <header className="sticky top-0 z-10 flex h-14 items-center border-b bg-background px-4">
                  <SidebarTrigger />
                </header>
                <main className="flex-1">{children}</main>
              </SidebarInset>
            </div>
          </SidebarProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
