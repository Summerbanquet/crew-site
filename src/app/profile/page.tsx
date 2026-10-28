"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { refreshNotifications } from "@/lib/notify";

type Me = {
  user: { id: number; username: string; role: string; wechat: string | null; points: number };
  pointLogs: { id: number; delta: number; reason: string; createdAt: string }[];
  publishedTasks: {
    id: number;
    title: string;
    points: number;
    status: string;
    claim: { id: number; status: string; claimant: { username: string } } | null;
  }[];
  claims: {
    id: number;
    status: string;
    task: { id: number; title: string; points: number; status: string; publisher: { username: string } };
  }[];
};

const taskStatus: Record<string, string> = {
  OPEN: "招募中",
  PENDING: "待确认",
  DONE: "已完成",
  CANCELLED: "已取消",
};
const claimStatus: Record<string, string> = { PENDING: "待发单人确认", CONFIRMED: "已确认，积分到账" };

export default function ProfilePage() {
  const [data, setData] = useState<Me | null>(null);
  const [notLogin, setNotLogin] = useState(false);
  const [msg, setMsg] = useState("");

  const load = useCallback(async () => {
    const res = await fetch("/api/me");
    if (res.status === 401) {
      setNotLogin(true);
      return;
    }
    setData(await res.json());
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const confirm = async (claimId: number) => {
    setMsg("");
    const res = await fetch(`/api/claims/${claimId}/confirm`, { method: "POST" });
    if (res.ok) {
      load();
      refreshNotifications(); // 立即拉新通知（对方会收到"积分到账"顶部提醒）
    } else {
      const d = await res.json().catch(() => ({}));
      setMsg(d.error ?? "确认失败");
    }
  };

  const logout = async () => {
    await fetch("/api/logout", { method: "POST" });
    // 退出同样硬导航，避免导航栏残留已登录头像（原因见 login 页注释）
    window.location.assign("/");
  };

  if (notLogin) {
    return (
      <div className="py-12 text-center text-zinc-500">
        还没有登录，先去{" "}
        <Link href="/login" className="underline">登录</Link>
        {" "}或<Link href="/register" className="underline">注册</Link>
      </div>
    );
  }
  if (!data) return <p className="py-12 text-center text-zinc-400">加载中...</p>;

  const { user, pointLogs, publishedTasks, claims } = data;
  const pendingCount = publishedTasks.filter((t) => t.claim?.status === "PENDING").length;

  return (
    <div className="space-y-6">
      {/* 用户信息 */}
      <div className="flex items-center gap-3">
        <h1 className="text-xl font-bold">{user.username}</h1>
        {user.role === "ADMIN" && (
          <span className="rounded border border-zinc-900 bg-white px-2 py-0.5 text-xs text-zinc-900">管理员</span>
        )}
        {user.role === "SHOOTER" && (
          <span className="rounded border border-zinc-900 bg-white px-2 py-0.5 text-xs text-zinc-900">拍摄</span>
        )}
        {user.wechat && <span className="text-sm text-zinc-400">微信群昵称：{user.wechat}</span>}
        <button
          onClick={logout}
          className="ml-auto rounded border border-zinc-300 px-3 py-1 text-xs text-zinc-600 hover:bg-zinc-100"
        >
          退出登录
        </button>
      </div>
      {msg && <p className="rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">{msg}</p>}

      {/* ===== 积分板块 ===== */}
      <section className="rounded-lg border border-zinc-200 bg-white p-4">
        <div className="flex items-baseline gap-2">
          <h2 className="font-semibold">我的积分</h2>
          <span className="text-3xl font-bold text-amber-600">{user.points}</span>
        </div>
        <ul className="mt-3 divide-y divide-zinc-100 text-sm">
          {pointLogs.length === 0 && <li className="py-2 text-zinc-400">还没有积分记录</li>}
          {pointLogs.map((log) => (
            <li key={log.id} className="flex items-center py-2">
              <span className={log.delta >= 0 ? "text-green-600" : "text-red-600"}>
                {log.delta >= 0 ? `+${log.delta}` : log.delta}
              </span>
              <span className="ml-3 text-zinc-600">{log.reason}</span>
              <span className="ml-auto text-xs text-zinc-400">
                {new Date(log.createdAt).toLocaleString("zh-CN")}
              </span>
            </li>
          ))}
        </ul>
      </section>

      {/* ===== 任务板块 ===== */}
      <section className="space-y-4">
        <div className="rounded-lg border border-zinc-200 bg-white p-4">
          <h2 className="font-semibold">
            我发布的
            {pendingCount > 0 && (
              <span className="ml-2 rounded bg-amber-100 px-2 py-0.5 text-xs text-amber-700">
                {pendingCount} 条待确认
              </span>
            )}
          </h2>
          <ul className="mt-3 divide-y divide-zinc-100 text-sm">
            {publishedTasks.length === 0 && (
              <li className="py-2 text-zinc-400">
                还没发布过任务，
                {(user.role === "ADMIN" || user.role === "SHOOTER") && <Link href="/tasks/new" className="underline">去发布</Link>}
              </li>
            )}
            {publishedTasks.map((t) => (
              <li key={t.id} className="flex flex-wrap items-center gap-2 py-2">
                <span className="font-medium">{t.title}</span>
                <span className="text-xs text-zinc-400">{taskStatus[t.status] ?? t.status}</span>
                {t.claim && (
                  <span className="text-xs text-zinc-500">
                    接单人：{t.claim.claimant.username}
                  </span>
                )}
                {t.claim?.status === "PENDING" ? (
                  <button
                    onClick={() => confirm(t.claim!.id)}
                    className="ml-auto rounded bg-green-600 px-3 py-1 text-xs font-medium text-white hover:bg-green-500"
                  >
                    确认完成（+{t.points} 分到账）
                  </button>
                ) : (
                  <span className="ml-auto text-xs text-amber-600">+{t.points} 分</span>
                )}
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-lg border border-zinc-200 bg-white p-4">
          <h2 className="font-semibold">我接的</h2>
          <ul className="mt-3 divide-y divide-zinc-100 text-sm">
            {claims.length === 0 && <li className="py-2 text-zinc-400">还没有接过任务</li>}
            {claims.map((c) => (
              <li key={c.id} className="flex items-center gap-2 py-2">
                <span className="font-medium">{c.task.title}</span>
                <span className="text-xs text-zinc-400">
                  发布人：{c.task.publisher.username}
                </span>
                <span className="ml-auto text-xs text-zinc-500">
                  {claimStatus[c.status] ?? c.status}
                </span>
                <span className="text-xs text-amber-600">+{c.task.points} 分</span>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}
