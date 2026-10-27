import { PrismaClient } from "@prisma/client";

// 全局单例：开发时热重载不会反复新建数据库连接
const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined };

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
