import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";

// 选中接取人：被选中者积分到账，同任务其他接取者落选，双方都发通知
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
      if (!claim) throw new Error("接取记录不存在");
      const task = claim.task;
      if (task.publisherId !== user.id && user.role !== "ADMIN") {
        throw new Error("只有任务发布人可以选择");
      }
      if (task.status !== "OPEN") throw new Error("该任务已结束，不要重复选择");
      if (claim.status !== "PENDING") throw new Error("该记录已处理过");

      await tx.taskClaim.update({
        where: { id: claim.id },
        data: { status: "CONFIRMED", confirmedAt: new Date() },
      });
      // 其余接取者落选
      const rejected = await tx.taskClaim.updateMany({
        where: { taskId: task.id, status: "PENDING", id: { not: claim.id } },
        data: { status: "REJECTED" },
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
      // 通知：被选中者积分到账；落选者提醒
      await tx.notification.create({
        data: {
          userId: claim.claimantId,
          type: "CONFIRMED",
          title: "积分到账",
          content: `你被选中完成任务《${task.title}》，积分 +${task.points}`,
        },
      });
      if (rejected.count > 0) {
        const others = await tx.taskClaim.findMany({
          where: { taskId: task.id, status: "REJECTED" },
          select: { claimantId: true },
        });
        await tx.notification.createMany({
          data: others.map((o) => ({
            userId: o.claimantId,
            type: "REJECTED",
            title: "未被选中",
            content: `任务《${task.title}》已选他人完成，下次再来`,
          })),
        });
      }
    });
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "选择失败" },
      { status: 400 }
    );
  }
}
