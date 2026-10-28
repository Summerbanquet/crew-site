import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import { logOp } from "@/lib/oplog";

// 标记兑换发货（仅管理员）：PENDING → DONE
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getSessionUser();
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "只有管理员可以标记发货" }, { status: 403 });
  }

  const { id } = await params;
  const numId = Number(id);
  const exists = await prisma.redeemLog.findUnique({
    where: { id: numId },
    include: { user: { select: { username: true } }, item: { select: { name: true } } },
  });
  if (!exists) {
    return NextResponse.json({ error: "兑换记录不存在" }, { status: 404 });
  }
  if (exists.status === "DONE") {
    return NextResponse.json({ error: "该记录已发货" }, { status: 400 });
  }

  const updated = await prisma.redeemLog.update({
    where: { id: numId },
    data: { status: "DONE" },
  });
  await logOp({
    userId: user.id,
    username: user.username,
    action: "ITEM_SHIP",
    detail: `标记发货：${exists.user.username} 兑换的《${exists.item.name}》`,
    req,
  });
  return NextResponse.json({ redeem: updated });
}
