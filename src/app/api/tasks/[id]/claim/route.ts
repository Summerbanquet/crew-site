import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";

// 接取：任务保持招募中，多人都能接取，等发布人从中选择
export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "请先登录再接单" }, { status: 401 });

  try {
    const claim = await prisma.$transaction(async (tx) => {
      const task = await tx.task.findUnique({ where: { id: Number(id) } });
      if (!task) throw new Error("任务不存在");
      if (task.status !== "OPEN") throw new Error("该任务已结束接取");
      if (task.publisherId === user.id) throw new Error("不能接自己发布的任务");

      const dup = await tx.taskClaim.findFirst({
        where: { taskId: task.id, claimantId: user.id, status: "PENDING" },
      });
      if (dup) throw new Error("你已经接取过该任务，等发布人选择即可");

      const c = await tx.taskClaim.create({
        data: { taskId: task.id, claimantId: user.id },
      });
      const count = await tx.taskClaim.count({
        where: { taskId: task.id, status: "PENDING" },
      });
      // 站内消息：发布人（有人接取）+ 接取人（接取成功）
      await tx.notification.createMany({
        data: [
          {
            userId: task.publisherId,
            type: "CLAIM",
            title: "有人接取",
            content: `「${user.username}」接取了你的任务《${task.title}》，当前 ${count} 人接取，可从中选择`,
          },
          {
            userId: user.id,
            type: "CLAIMED",
            title: "接取成功",
            content: `你已接取任务《${task.title}》，等待发布人选择，被选中积分 +${task.points}`,
          },
        ],
      });
      return c;
    });
    return NextResponse.json({ claim });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "接取失败" },
      { status: 400 }
    );
  }
}
