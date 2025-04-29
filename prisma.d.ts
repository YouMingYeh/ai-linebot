import { Prisma as PrismaNamespace } from '@prisma/client';

declare global {
  namespace NodeJS {
    interface Global {
      prisma: PrismaNamespace.PrismaClient;
    }
  }
}