import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";

// 编辑商品（仅管理员）：名称 / 描述 / 图标 / 积分价 / 上下架
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getSessionUser();
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "只有管理员可以管理商品" }, { status: 403 });
  }

  const { id } = await params;
  const numId = Number(id);
  if (!Number.isInteger(numId)) {
    return NextResponse.json({ error: "商品不存在" }, { status: 404 });
  }
  const exists = await prisma.item.findUnique({ where: { id: numId } });
  if (!exists) {
    return NextResponse.json({ error: "商品不存在" }, { status: 404 });
  }

  const { name, description, icon, cost, active } = await req.json();
  if (name !== undefined && !String(name).trim()) {
    return NextResponse.json({ error: "商品名不能为空" }, { status: 400 });
  }
  const c = cost === undefined ? undefined : Number(cost);
  if (c !== undefined && (!Number.isInteger(c) || c < 0)) {
    return NextResponse.json({ error: "积分价格必须是不小于 0 的整数" }, { status: 400 });
  }

  const item = await prisma.item.update({
    where: { id: numId },
    data: {
      ...(name !== undefined && { name: String(name).trim() }),
      ...(description !== undefined && { description: String(description).trim() }),
      ...(icon !== undefined && { icon: String(icon).trim() || "🎁" }),
      ...(c !== undefined && { cost: c }),
      ...(active !== undefined && { active: Boolean(active) }),
    },
  });
  return NextResponse.json({ item });
}
