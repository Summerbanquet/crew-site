import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { createSession } from "@/lib/auth";

export async function POST(req: Request) {
  const { username, password, phone } = await req.json();

  if (!username || String(username).trim().length < 2) {
    return NextResponse.json({ error: "用户名至少 2 个字符" }, { status: 400 });
  }
  if (!password || String(password).length < 6) {
    return NextResponse.json({ error: "密码至少 6 位" }, { status: 400 });
  }

  const name = String(username).trim();
  const exists = await prisma.user.findUnique({ where: { username: name } });
  if (exists) {
    return NextResponse.json({ error: "用户名已被占用" }, { status: 409 });
  }

  const user = await prisma.user.create({
    data: {
      username: name,
      passwordHash: await bcrypt.hash(String(password), 10),
      phone: phone ? String(phone).trim() : null,
    },
  });

  await createSession({ uid: user.id, username: user.username, role: user.role });
  return NextResponse.json({
    user: { id: user.id, username: user.username, role: user.role },
  });
}
