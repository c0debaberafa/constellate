/**
 * Script to update existing JournalEntry records with a userId
 *
 * Usage:
 * 1. Get your Clerk userId (you can find this in your Clerk dashboard or from your auth session)
 * 2. Update the USER_ID constant below with your actual userId
 * 3. Run: npx tsx scripts/update-journal-entries-userid.ts
 *
 * Or use it interactively by running: npx tsx scripts/update-journal-entries-userid.ts <your-user-id>
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Get userId from command line argument or set it here
  const userId = process.argv[2] || process.env.USER_ID;

  if (!userId) {
    console.error("❌ Error: userId is required");
    console.log("\nUsage:");
    console.log(
      "  npx tsx scripts/update-journal-entries-userid.ts <your-user-id>"
    );
    console.log("\nOr set USER_ID environment variable:");
    console.log(
      "  USER_ID=<your-user-id> npx tsx scripts/update-journal-entries-userid.ts"
    );
    console.log("\nTo find your userId:");
    console.log("  - Check your Clerk dashboard");
    console.log(
      "  - Or add a console.log in your API route: console.log(auth().userId)"
    );
    process.exit(1);
  }

  try {
    // First, ensure the User exists (create if it doesn't)
    await prisma.user.upsert({
      where: { id: userId },
      update: {},
      create: { id: userId },
    });
    console.log(`✅ User ${userId} exists or was created`);

    // Find all entries without a userId
    const entriesWithoutUserId = await prisma.journalEntry.findMany({
      where: { userId: null },
    });

    if (entriesWithoutUserId.length === 0) {
      console.log("✅ All entries already have a userId assigned");
      return;
    }

    console.log(
      `\n📝 Found ${entriesWithoutUserId.length} entries without userId`
    );
    console.log("Entry IDs:", entriesWithoutUserId.map((e) => e.id).join(", "));

    // Update all entries to use this userId
    const result = await prisma.journalEntry.updateMany({
      where: { userId: null },
      data: { userId: userId },
    });

    console.log(
      `\n✅ Successfully updated ${result.count} entries with userId: ${userId}`
    );
    console.log("\nNext steps:");
    console.log("1. Verify the entries are correctly assigned");
    console.log("2. Run: npx prisma migrate dev --name make_userid_required");
    console.log("   (This will create a migration to make userId required)");
  } catch (error) {
    console.error("❌ Error updating entries:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main();
