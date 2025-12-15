/**
 * Utility function to ensure a Clerk user exists in the database
 * This uses upsert to create the user if they don't exist, or do nothing if they do
 *
 * @param userId - The Clerk user ID
 * @returns Promise that resolves when the user is ensured to exist
 */
import { prisma } from "./prisma";

export async function ensureUserExists(userId: string): Promise<void> {
  try {
    await prisma.user.upsert({
      where: { id: userId },
      update: {}, // No updates needed if user exists
      create: { id: userId }, // Create user if they don't exist
    });
  } catch (error) {
    console.error(`Failed to ensure user ${userId} exists:`, error);
    // Don't throw - we don't want to break the request if this fails
    // The foreign key constraint will catch it anyway if needed
  }
}
