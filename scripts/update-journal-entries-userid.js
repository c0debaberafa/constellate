/**
 * Script to update existing JournalEntry records with a userId
 *
 * Usage:
 * 1. Get your Clerk userId (check your Clerk dashboard or add console.log in your API)
 * 2. Run: node scripts/update-journal-entries-userid.js <your-user-id>
 *
 * Example:
 *   node scripts/update-journal-entries-userid.js user_2abc123xyz
 */

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  const userId = process.argv[2];

  if (!userId) {
    console.error("❌ Error: userId is required");
    console.log("\nUsage:");
    console.log(
      "  node scripts/update-journal-entries-userid.js <your-user-id>"
    );
    console.log("\nTo find your userId:");
    console.log("  - Check your Clerk dashboard");
    console.log("  - Or temporarily add this to your API route:");
    console.log("    const { userId } = auth();");
    console.log("    console.log('Your userId:', userId);");
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
    console.log("\n📋 Next steps:");
    console.log("1. Verify the entries are correctly assigned");
    console.log(
      "2. Update prisma/schema.prisma: change 'userId String?' to 'userId String'"
    );
    console.log("3. Update the relation: change 'user User?' to 'user User'");
    console.log("4. Run: npx prisma migrate dev --name make_userid_required");
  } catch (error) {
    console.error("❌ Error updating entries:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main();
