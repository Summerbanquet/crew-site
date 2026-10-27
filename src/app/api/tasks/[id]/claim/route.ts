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
