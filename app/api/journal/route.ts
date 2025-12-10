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

export async function DELETE(req: Request) {
  try {
    // Extract the entry ID from the request
    // We can get it from query params: /api/journal?id=xxx
    // or from the request body
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    // If not in query params, try the body
    let entryId = id;
    if (!entryId) {
      try {
        const body = await req.json();
        entryId = body.id;
      } catch {
        // Body might be empty, that's okay
      }
    }

    if (!entryId || typeof entryId !== "string") {
      return NextResponse.json(
        { error: "Entry ID is required" },
        { status: 400 }
      );
    }

    // Delete the entry using Prisma
    await prisma.journalEntry.delete({
      where: { id: entryId },
    });

    return NextResponse.json(
      { message: "Entry deleted successfully" },
      { status: 200 }
    );
  } catch (err) {
    console.error("DELETE /api/journal error", err);
    const errorMessage = err instanceof Error ? err.message : "Unknown error";

    // Handle Prisma not found error
    if (errorMessage.includes("Record to delete does not exist")) {
      return NextResponse.json({ error: "Entry not found" }, { status: 404 });
    }

    return NextResponse.json(
      { error: "Failed to delete journal entry", details: errorMessage },
      { status: 500 }
    );
  }
}
