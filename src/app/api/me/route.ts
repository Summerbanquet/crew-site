import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";

// 个人主页数据：积分 + 流水、我发布的（含待确认）、我接的
export async function GET() {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "未登录" }, { status: 401 });

  const [pointLogs, publishedTasks, claims] = await Promise.all([
    prisma.pointLog.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 50,
    }),
    prisma.task.findMany({
      where: { publisherId: user.id },
      orderBy: { createdAt: "desc" },
      include: {
        claim: { include: { claimant: { select: { id: true, username: true } } } },
      },
    }),
    prisma.taskClaim.findMany({
      where: { claimantId: user.id },
      orderBy: { createdAt: "desc" },
      include: {
        task: { include: { publisher: { select: { username: true } } } },
      },
    }),
  ]);

  return NextResponse.json({
    user: {
      id: user.id,
      username: user.username,
      role: user.role,
      phone: user.phone,
      points: user.points,
    },
    pointLogs,
    publishedTasks,
    claims,
  });
}
