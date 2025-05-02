import { PrismaClient } from "@prisma/client";

// Keep PrismaClient as singleton during development to avoid connection limit issues
const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma || new PrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
