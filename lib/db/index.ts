import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

/** Reuse the client across hot reloads in development to avoid exhausting connections. */
export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

/** Backwards-compatible alias used by data access code. */
export const db = prisma;

export const isDatabaseConfigured = Boolean(process.env.DATABASE_URL);
