// lib/prisma.ts
import { PrismaClient } from '@/generated/prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: ['query'], // Optional: log queries in development
})

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}