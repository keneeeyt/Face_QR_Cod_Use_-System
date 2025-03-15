import { PrismaClient } from "@prisma/client";

// Define a global variable to store the Prisma client instance.
// This helps in reusing the same instance across different parts of the application.
const globalForPrisma = global as unknown as { prisma: PrismaClient | undefined };

// Initialize the Prisma client. If a global instance already exists, use it;
// otherwise, create a new instance.
const prisma = globalForPrisma.prisma ?? new PrismaClient();

// In non-production environments, store the Prisma client instance globally.
// This prevents creating multiple instances, which can exhaust database connections.
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

// Export the Prisma client instance for use in other parts of the application.
export const db = prisma;