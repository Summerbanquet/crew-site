import { NextResponse } from "next/server";
import { clearSession, getSessionUser } from "@/lib/auth";
import { logOp } from "@/lib/oplog";

export async function POST(req: Request) {
  const user = await getSessionUser();
  await clearSession();
  if (user) {
    await logOp({
      userId: user.id,
      username: user.username,
      action: "LOGOUT",
      detail: "退出登录",
      req,
    });
  }
  return NextResponse.json({ ok: true });
}
