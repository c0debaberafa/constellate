// /app/api/webhooks/clerk/route.ts

import { Webhook } from "svix";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma"; // Your existing Prisma client

// --- CRITICAL CONFIGURATION for Webhooks in Next.js ---
// This disables the default Next.js JSON parser, allowing Svix to verify the raw body.
export const dynamic = "force-dynamic";
export const runtime = "nodejs"; // Ensure you are running in the Node.js runtime

// The type definition for the Clerk payload (simplified)
type UserPayload = {
  id: string; // The user's ID from Clerk (used as the primary key in your Prisma User table)
  email_addresses: { id: string; email_address: string }[];
  primary_email_address_id: string;
  first_name: string | null;
  last_name: string | null;
};
type WebhookEvent = { type: string; data: UserPayload };

export async function POST(req: Request) {
  console.log("--- WEBHOOK POST RECEIVED ---");
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SIGNING_SECRET;

  if (!WEBHOOK_SECRET) {
    return NextResponse.json(
      { message: "Missing CLERK_WEBHOOK_SECRET" },
      { status: 500 }
    );
  }

  // 1. Get Headers for Verification
  const headerPayload = await headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return NextResponse.json(
      { message: "Error occured -- no svix headers" },
      { status: 400 }
    );
  }

  // 2. Get the Raw Body (Needed for Svix verification)
  const body = await req.text();
  const wh = new Webhook(WEBHOOK_SECRET);
  let evt: WebhookEvent;

  try {
    // 3. Verify Signature (The Middleware/Proxy Check)
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error("Error verifying webhook:", err);
    return NextResponse.json(
      { message: "Error occured -- verification failed" },
      { status: 400 }
    );
  }

  console.log("Verified");

  // --- Database Logic Starts Here (Only runs after successful verification) ---
  const eventType = evt.type;
  const { id: clerkUserId, email_addresses, first_name, last_name } = evt.data;

  // Find the primary email
  const primaryEmail: string | null =
    email_addresses.find((e) => e.id === evt.data.primary_email_address_id)
      ?.email_address || null;

  // 4. Handle the 'user.created' event (The Sign-Up Action)
  if (eventType === "user.created") {
    try {
      // Use a transaction to ensure both User and UserProfile are created together
      await prisma.$transaction([
        // Create the User record using Clerk's ID
        prisma.user.create({
          data: {
            id: clerkUserId, // 💡 CRITICAL: This links your DB to Clerk
            email: primaryEmail || undefined,
            firstName: first_name,
            lastName: last_name,
          },
        }),
        // Initialize the UserProfile record
        prisma.userProfile.create({
          data: {
            userId: clerkUserId,
            aiProfile: {}, // Empty JSON object to start
          },
        }),
      ]);

      return NextResponse.json(
        { message: "User created and profile initialized" },
        { status: 201 }
      );
    } catch (err) {
      // Handle unique constraint errors if the webhook is sent twice
      console.error("--- PRISMA ERROR START ---");
      console.error(`Prisma transaction failed for user ${clerkUserId}:`, err);
      // Log the specific Prisma error code if available
      if (err && typeof err === "object" && "code" in err) {
        console.error(`Prisma Error Code: ${(err as { code: unknown }).code}`);
      }
      console.error("--- PRISMA ERROR END ---");
      return NextResponse.json(
        { message: "Database write failed" },
        { status: 500 }
      );
    }
  }

  // 5. Optionally handle user.deleted event for cleanup
  if (eventType === "user.deleted") {
    try {
      // Delete associated records first (cascading deletes, if configured)
      await prisma.user.delete({ where: { id: clerkUserId } });
      return NextResponse.json(
        { message: "User deleted successfully" },
        { status: 200 }
      );
    } catch (err) {
      console.error(`Prisma user deletion failed for ${clerkUserId}:`, err);
      return NextResponse.json({ message: "Deletion failed" }, { status: 500 });
    }
  }

  return NextResponse.json(
    { message: "Webhook received, event skipped" },
    { status: 200 }
  );
}
