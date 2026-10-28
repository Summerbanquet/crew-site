import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";

// 兑换记录（仅管理员）：谁兑了什么、发货状态
export async function GET() {
  const user = await getSessionUser();
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "只有管理员可以查看兑换记录" }, { status: 403 });
  }

  const redeems = await prisma.redeemLog.findMany({
    orderBy: { createdAt: "desc" },
    take: 200,
    include: {
      user: { select: { username: true } },
      item: { select: { name: true, icon: true } },
    },
  });
  return NextResponse.json({ redeems });
}
