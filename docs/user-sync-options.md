# Options for Syncing Clerk Users to Neon Database

This document outlines different approaches to ensure Clerk users are synced to your Neon database.

## ✅ **Option 1: Helper Function (IMPLEMENTED - Recommended)**

**Status:** ✅ Already implemented in your codebase

**How it works:**

- Created `lib/user-sync.ts` with `ensureUserExists()` function
- Call it in API routes before database operations
- Uses `upsert` to create user if missing, or do nothing if exists

**Pros:**

- ✅ Simple and straightforward
- ✅ No additional infrastructure needed
- ✅ Works immediately
- ✅ Handles edge cases gracefully
- ✅ Minimal performance impact (only runs when needed)

**Cons:**

- ⚠️ Must remember to call it in each API route
- ⚠️ Small overhead on first request per user

**Usage:**

```typescript
import { ensureUserExists } from "@/lib/user-sync";

export async function POST(req: Request) {
  const { userId } = auth();
  if (!userId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await ensureUserExists(userId); // Ensures user exists before operations

  // ... rest of your code
}
```

**Already integrated in:**

- `app/api/journal/route.ts` (POST, GET, DELETE)

---

## Option 2: Next.js Middleware

**Status:** ❌ Not implemented (example provided)

**How it works:**

- Create `middleware.ts` at project root
- Runs on every request before route handlers
- Automatically ensures user exists for authenticated requests

**Pros:**

- ✅ Centralized - one place to handle user sync
- ✅ Runs automatically on every request
- ✅ Ensures user exists before any route handler runs

**Cons:**

- ⚠️ Runs on EVERY request (even static assets if not configured)
- ⚠️ Adds latency to every request
- ⚠️ Need to be careful with route matching

**Implementation:**

Create `middleware.ts` in project root:

```typescript
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

export async function middleware(request: NextRequest) {
  // Only run on API routes
  if (!request.nextUrl.pathname.startsWith("/api/")) {
    return NextResponse.next();
  }

  const { userId } = auth();

  // Only sync if user is authenticated
  if (userId) {
    try {
      await prisma.user.upsert({
        where: { id: userId },
        update: {},
        create: { id: userId },
      });
    } catch (error) {
      console.error(`Failed to sync user ${userId}:`, error);
      // Don't block the request
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: "/api/:path*", // Only run on API routes
};
```

**Note:** This approach runs on every API request, which might be overkill. The helper function approach is usually better.

---

## Option 3: Clerk Webhooks

**Status:** ❌ Not implemented (example provided)

**How it works:**

- Clerk sends webhook events when users are created/updated/deleted
- Create a webhook endpoint to handle these events
- Sync users to database in real-time

**Pros:**

- ✅ Real-time sync
- ✅ Handles user deletions/updates automatically
- ✅ Decoupled from your app logic
- ✅ Most "correct" approach for production

**Cons:**

- ⚠️ More complex setup
- ⚠️ Requires webhook endpoint
- ⚠️ Need to configure Clerk dashboard
- ⚠️ Need to handle webhook security (signature verification)

**Implementation:**

1. **Create webhook endpoint** `app/api/webhooks/clerk/route.ts`:

```typescript
import { Webhook } from "svix";
import { headers } from "next/headers";
import { WebhookEvent } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    throw new Error("Please add CLERK_WEBHOOK_SECRET to .env.local");
  }

  // Get the headers
  const headerPayload = await headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response("Error occurred -- no svix headers", {
      status: 400,
    });
  }

  // Get the body
  const payload = await req.json();
  const body = JSON.stringify(payload);

  // Create a new Svix instance with your secret.
  const wh = new Webhook(WEBHOOK_SECRET);

  let evt: WebhookEvent;

  // Verify the payload with the headers
  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error("Error verifying webhook:", err);
    return new Response("Error occurred", {
      status: 400,
    });
  }

  // Handle the webhook
  const eventType = evt.type;

  if (eventType === "user.created") {
    const { id } = evt.data;
    await prisma.user.upsert({
      where: { id },
      update: {},
      create: { id },
    });
  } else if (eventType === "user.deleted") {
    const { id } = evt.data;
    await prisma.user.delete({
      where: { id },
    });
  }

  return new Response("", { status: 200 });
}
```

2. **Install svix package:**

```bash
npm install svix
```

3. **Add to `.env.local`:**

```
CLERK_WEBHOOK_SECRET=whsec_...
```

4. **Configure in Clerk Dashboard:**
   - Go to Clerk Dashboard → Webhooks
   - Add endpoint: `https://yourdomain.com/api/webhooks/clerk`
   - Subscribe to: `user.created`, `user.deleted`
   - Copy the webhook secret to `.env.local`

---

## Recommendation

**Use Option 1 (Helper Function)** - It's already implemented and is the simplest, most practical solution for your use case.

**Consider Option 3 (Webhooks)** if:

- You need to handle user deletions
- You want real-time sync
- You're building a production app with many users
- You want the most "correct" architecture

**Avoid Option 2 (Middleware)** unless you have a specific need - it adds overhead to every request.
