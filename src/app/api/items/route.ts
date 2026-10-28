import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";

// 商品列表：默认只显示上架的（未登录也能看）；管理员带 ?all=1 可看全部（含下架）
export async function GET(req: Request) {
  const url = new URL(req.url);
  if (url.searchParams.get("all") === "1") {
    const user = await getSessionUser();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "只有管理员可以查看全部商品" }, { status: 403 });
    }
    const items = await prisma.item.findMany({ orderBy: { cost: "asc" } });
    return NextResponse.json({ items });
  }

  const items = await prisma.item.findMany({
    where: { active: true },
    orderBy: { cost: "asc" },
  });
  return NextResponse.json({ items });
}

// 新增商品（仅管理员）
export async function POST(req: Request) {
  const user = await getSessionUser();
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "只有管理员可以管理商品" }, { status: 403 });
  }

  const { name, description, icon, cost } = await req.json();
  if (!name || !String(name).trim()) {
    return NextResponse.json({ error: "商品名不能为空" }, { status: 400 });
  }
  const c = Number(cost);
  if (!Number.isInteger(c) || c < 0) {
    return NextResponse.json({ error: "积分价格必须是不小于 0 的整数" }, { status: 400 });
  }

  const item = await prisma.item.create({
    data: {
      name: String(name).trim(),
      description: String(description ?? "").trim(),
      icon: String(icon ?? "").trim() || "🎁",
      cost: c,
    },
  });
  return NextResponse.json({ item });
}
