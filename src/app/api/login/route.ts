import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { createSession } from "@/lib/auth";
import { logOp } from "@/lib/oplog";

export async function POST(req: Request) {
  const { username, password } = await req.json();
  if (!username || !password) {
    return NextResponse.json({ error: "请输入用户名和密码" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({
    where: { username: String(username).trim() },
  });
  if (!user || !(await bcrypt.compare(String(password), user.passwordHash))) {
    await logOp({
      username: String(username).trim(),
      action: "LOGIN",
      detail: "登录失败：用户名或密码错误",
      ok: false,
      req,
    });
    return NextResponse.json({ error: "用户名或密码错误" }, { status: 401 });
  }

  await createSession({ uid: user.id, username: user.username, role: user.role });
  await logOp({
    userId: user.id,
    username: user.username,
    action: "LOGIN",
    detail: "登录成功",
    req,
  });
  return NextResponse.json({
    user: { id: user.id, username: user.username, role: user.role },
  });
}
