import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";

const PAGE_SIZE = 50;

// 操作日志（仅管理员）：分页 + 按用户名/动作筛选
export async function GET(req: Request) {
  const user = await getSessionUser();
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "只有管理员可以查看操作日志" }, { status: 403 });
  }

  const url = new URL(req.url);
  const page = Math.max(1, Number(url.searchParams.get("page")) || 1);
  const qUser = url.searchParams.get("user")?.trim() || "";
  const qAction = url.searchParams.get("action")?.trim() || "";

  const where = {
    AND: [
      ...(qUser ? [{ username: { contains: qUser } }] : []),
      ...(qAction ? [{ action: qAction }] : []),
    ],
  };

  const [logs, total] = await Promise.all([
    prisma.operationLog.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: PAGE_SIZE,
      skip: (page - 1) * PAGE_SIZE,
    }),
    prisma.operationLog.count({ where }),
  ]);
  return NextResponse.json({ logs, total, page, pageSize: PAGE_SIZE });
}
