import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";

// 任务大厅列表（未登录也能看）
export async function GET() {
  const tasks = await prisma.task.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      publisher: { select: { username: true } },
      claim: { include: { claimant: { select: { username: true } } } },
    },
  });
  return NextResponse.json({ tasks });
}

// 发布任务（拍摄或管理员）
export async function POST(req: Request) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "请先登录" }, { status: 401 });
  if (user.role !== "SHOOTER" && user.role !== "ADMIN") {
    return NextResponse.json({ error: "只有拍摄身份或管理员可以发布任务" }, { status: 403 });
  }

  const { title, content, points, deadline } = await req.json();
  if (!title || !String(title).trim()) {
    return NextResponse.json({ error: "标题不能为空" }, { status: 400 });
  }
  const p = Number(points);
  if (!Number.isInteger(p) || p < 0) {
    return NextResponse.json({ error: "积分必须是不小于 0 的整数" }, { status: 400 });
  }

  const task = await prisma.task.create({
    data: {
      title: String(title).trim(),
      content: String(content ?? "").trim(),
      points: p,
      deadline: deadline ? new Date(deadline) : null,
      publisherId: user.id,
    },
  });
  return NextResponse.json({ task });
}
