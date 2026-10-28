import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";

export async function POST(req: Request) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "请先登录" }, { status: 401 });
  const { itemId } = await req.json();

  try {
    await prisma.$transaction(async (tx) => {
      const item = await tx.item.findUnique({ where: { id: Number(itemId) } });
      if (!item || !item.active) throw new Error("商品不存在或已下架");
      const me = await tx.user.findUnique({ where: { id: user.id } });
      if (!me || me.points < item.cost) throw new Error("积分不足");

      await tx.user.update({
        where: { id: user.id },
        data: { points: { decrement: item.cost } },
      });
      await tx.pointLog.create({
        data: { userId: user.id, delta: -item.cost, reason: `兑换《${item.name}》` },
      });
      await tx.redeemLog.create({
        data: { userId: user.id, itemId: item.id, pointsSpent: item.cost },
      });
    });
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "兑换失败" },
      { status: 400 }
    );
  }
}