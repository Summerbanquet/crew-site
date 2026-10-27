import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { prisma } from "./db";

const COOKIE_NAME = "session";
const secret = new TextEncoder().encode(
  process.env.SESSION_SECRET ?? "dev-secret-change-me"
);

export type SessionPayload = { uid: number; username: string; role: string };

// 登录成功后调用：把用户信息签成 JWT 写进 httpOnly Cookie
export async function createSession(payload: SessionPayload) {
  const token = await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("7d")
    .sign(secret);
  const jar = await cookies();
  jar.set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function clearSession() {
  const jar = await cookies();
  jar.delete(COOKIE_NAME);
}

// 每次请求解析 Cookie，返回当前登录用户（含最新积分），未登录返回 null
export async function getSessionUser() {
  const jar = await cookies();
  const token = jar.get(COOKIE_NAME)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret);
    const uid = Number(payload.uid);
    if (!uid) return null;
    return await prisma.user.findUnique({ where: { id: uid } });
  } catch {
    return null;
  }
}
