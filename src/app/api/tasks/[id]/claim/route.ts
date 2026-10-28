import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";

// 接单：任务从"招募中"变为"待确认"，等待发单人确认
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
      if (task.status !== "OPEN") throw new Error("手慢了，该任务已被别人先接");
      if (task.publisherId === user.id) throw new Error("不能接自己发布的任务");

      const c = await tx.taskClaim.create({
        data: { taskId: task.id, claimantId: user.id },
      });
      await tx.task.update({
        where: { id: task.id },
        data: { status: "PENDING" },
      });
      // 站内消息：发布人（待确认）+ 接单人（接取成功）
      await tx.notification.createMany({
        data: [
          {
            userId: task.publisherId,
            type: "CLAIM",
            title: "待确认",
            content: `「${user.username}」接取了你的任务《${task.title}》，请在个人主页确认完成`,
          },
          {
            userId: user.id,
            type: "CLAIMED",
            title: "接取成功",
            content: `你成功接取了任务《${task.title}》，发布人确认后积分 +${task.points} 到账`,
          },
        ],
      });
      return c;
    });
    return NextResponse.json({ claim });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "接单失败" },
      { status: 400 }
    );
  }
}
