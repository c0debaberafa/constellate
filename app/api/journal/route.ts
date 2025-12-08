import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { content, createdAt } = body;

    if (!content || typeof content !== "string") {
      return NextResponse.json({ error: "Invalid content" }, { status: 400 });
    }

    const entry = await prisma.journalEntry.create({
      data: {
        content,
        createdAt: createdAt ? new Date(createdAt) : new Date(),
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({ entry }, { status: 200 });
  } catch (err) {
    console.error("POST /api/journal error", err);
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json(
      { error: "Failed to save journal entry", details: errorMessage },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const entries = await prisma.journalEntry.findMany({
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ entries }, { status: 200 });
  } catch (err) {
    console.error("GET /api/journal error", err);
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json(
      { error: "Failed to fetch journal entries", details: errorMessage },
      { status: 500 }
    );
  }
}
