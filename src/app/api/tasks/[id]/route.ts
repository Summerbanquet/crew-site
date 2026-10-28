import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// 任务详情：未登录也能看
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const numId = Number(id);
  if (!Number.isInteger(numId)) {
    return NextResponse.json({ error: "任务不存在" }, { status: 404 });
  }

  const task = await prisma.task.findUnique({
    where: { id: numId },
    include: {
      publisher: { select: { username: true } },
      claim: { include: { claimant: { select: { username: true } } } },
    },
  });
  if (!task) return NextResponse.json({ error: "任务不存在" }, { status: 404 });

  return NextResponse.json({ task });
}
