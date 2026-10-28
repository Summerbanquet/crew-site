import { prisma } from "@/lib/db";

// 记录操作日志：日志写失败不影响业务，直接吞掉
export async function logOp(opts: {
  userId?: number | null;
  username: string;
  action: string;
  detail: string;
  ok?: boolean;
  req?: Request;
}) {
  try {
    const fwd = opts.req?.headers.get("x-forwarded-for");
    const ip =
      fwd?.split(",")[0]?.trim() || opts.req?.headers.get("x-real-ip") || null;
    await prisma.operationLog.create({
      data: {
        userId: opts.userId ?? null,
        username: opts.username,
        action: opts.action,
        detail: opts.detail,
        ok: opts.ok ?? true,
        ip,
      },
    });
  } catch {
    // 日志失败不影响业务
  }
}
