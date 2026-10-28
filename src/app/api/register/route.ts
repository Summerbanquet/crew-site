import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { createSession } from "@/lib/auth";
import { logOp } from "@/lib/oplog";

export async function POST(req: Request) {
  const { username, password, wechat, role } = await req.json();

  if (!username || String(username).trim().length < 2) {
    return NextResponse.json({ error: "用户名至少 2 个字符" }, { status: 400 });
  }
  if (!password || String(password).length < 6) {
    return NextResponse.json({ error: "密码至少 6 位" }, { status: 400 });
  }

  const name = String(username).trim();
  const exists = await prisma.user.findUnique({ where: { username: name } });
  if (exists) {
    await logOp({ username: name, action: "REGISTER", detail: "注册失败：用户名已被占用", ok: false, req });
    return NextResponse.json({ error: "用户名已被占用" }, { status: 409 });
  }

  // 身份白名单：只认这两个值，其余一律当普通演员（管理员不开放注册）
  const roleValue = role === "SHOOTER" ? "SHOOTER" : "ACTOR";

  const user = await prisma.user.create({
    data: {
      username: name,
      passwordHash: await bcrypt.hash(String(password), 10),
      wechat: wechat ? String(wechat).trim() : null,
      role: roleValue,
    },
  });

  await createSession({ uid: user.id, username: user.username, role: user.role });
  await logOp({
    userId: user.id,
    username: user.username,
    action: "REGISTER",
    detail: `注册成功（${roleValue === "SHOOTER" ? "拍摄" : "普通演员"}）`,
    req,
  });
  return NextResponse.json({
    user: { id: user.id, username: user.username, role: user.role },
  });
}
