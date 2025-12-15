// /lib/prisma.ts

import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

// 1. Create a single connection pool
const connectionPool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// 2. Create the adapter instance
const adapter = new PrismaPg(connectionPool);

const globalForPrisma = global as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    // 💡 CRITICAL FIX: The adapter is now correctly provided
    adapter: adapter,
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  });

// 3. Store the client on the global object during development to prevent hot-reload leaks
if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
