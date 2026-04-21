// /app/api/profile/route.ts

import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    // This endpoint is a read model for the profile UI: return version + payload
    // without requiring clients to understand storage internals.
    const userProfile = await prisma.userProfile.findUnique({
      where: { userId: userId },
      select: {
        version: true,
        aiProfile: true,
        updatedAt: true,
      },
    });

    if (!userProfile) {
      // Returning an initialized shape avoids null-branching in the client and
      // keeps first-run UX deterministic before any profile generation occurs.
      return NextResponse.json(
        {
          version: 0,
          aiProfile: null,
          updatedAt: null,
        },
        { status: 200 }
      );
    }

    return NextResponse.json(userProfile, { status: 200 });
  } catch (error) {
    console.error("Profile fetch failed:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
