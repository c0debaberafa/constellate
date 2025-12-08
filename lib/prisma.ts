import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const globalForPrisma = global as unknown as {
  prisma: PrismaClient | undefined;
  adapter: PrismaPg | undefined;
};

// Ensure DATABASE_URL is available
if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is not set");
}

// Create adapter with connection pool
const adapter =
  globalForPrisma.adapter ??
  new PrismaPg(
    new Pool({
      connectionString: process.env.DATABASE_URL,
    })
  );

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.adapter = adapter;
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
