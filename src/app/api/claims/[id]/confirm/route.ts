import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";

// 确认接单：任务完成，接单人积分到账并记一笔流水
export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "请先登录" }, { status: 401 });

  try {
    await prisma.$transaction(async (tx) => {
      const claim = await tx.taskClaim.findUnique({
        where: { id: Number(id) },
        include: { task: true },
      });
      if (!claim) throw new Error("接单记录不存在");
      const task = claim.task;
      if (task.publisherId !== user.id && user.role !== "ADMIN") {
        throw new Error("只有任务发布人可以确认");
      }
      if (claim.status !== "PENDING") throw new Error("该记录已处理过，不要重复确认");

      await tx.taskClaim.update({
        where: { id: claim.id },
        data: { status: "CONFIRMED", confirmedAt: new Date() },
      });
      await tx.task.update({
        where: { id: task.id },
        data: { status: "DONE" },
      });
      await tx.user.update({
        where: { id: claim.claimantId },
        data: { points: { increment: task.points } },
      });
      await tx.pointLog.create({
        data: {
          userId: claim.claimantId,
          delta: task.points,
          reason: `完成任务《${task.title}》`,
        },
      });
    });
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "确认失败" },
      { status: 400 }
    );
  }
}
