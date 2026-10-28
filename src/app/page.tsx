"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { refreshNotifications } from "@/lib/notify";

type Task = {
  id: number;
  title: string;
  content: string;
  points: number;
  headcount: number;
  deadline: string | null;
  status: string;
  publisher: { username: string };
  claims: { id: number; status: string; claimant: { username: string } }[];
};

const statusText: Record<string, { label: string; cls: string }> = {
  OPEN: { label: "招募中", cls: "bg-green-100 text-green-700" },
  DONE: { label: "已完成", cls: "bg-zinc-200 text-zinc-600" },
  CANCELLED: { label: "已取消", cls: "bg-red-100 text-red-700" },
};

export default function TaskHall() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [me, setMe] = useState<{ username: string; role: string } | null>(null);
  const [msg, setMsg] = useState("");

  const load = async () => {
    const res = await fetch("/api/tasks");
    const data = await res.json();
    setTasks(data.tasks ?? []);
  };

  useEffect(() => {
    load();
    fetch("/api/me")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => d && setMe(d.user))
      .catch(() => {});
  }, []);

  const claim = async (taskId: number) => {
    setMsg("");
    const res = await fetch(`/api/tasks/${taskId}/claim`, { method: "POST" });
    if (res.ok) {
      load();
      refreshNotifications(); // 立即拉新通知，顶部弹"接取成功"
    } else {
      const data = await res.json().catch(() => ({}));
      setMsg(data.error ?? "接取失败");
    }
  };

  // 选人完成：发布人/管理员从接取列表中选中一人
  const select = async (claimId: number) => {
    setMsg("");
    const res = await fetch(`/api/claims/${claimId}/confirm`, { method: "POST" });
    if (res.ok) {
      load();
      refreshNotifications();
    } else {
      const data = await res.json().catch(() => ({}));
      setMsg(data.error ?? "选择失败");
    }
  };

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold">任务大厅</h1>
      {!me && (
        <p className="text-sm text-zinc-500">
          登录后即可接单，具体事项到群里沟通。
        </p>
      )}
      {msg && (
        <p className="rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
          {msg}
        </p>
      )}

      {tasks.length === 0 && (
        <p className="py-12 text-center text-zinc-400">还没有任务，快去发布第一个吧</p>
      )}

      {tasks.map((t) => {
        const st = statusText[t.status] ?? { label: t.status, cls: "bg-zinc-100 text-zinc-600" };
        const pending = t.claims.filter((c) => c.status === "PENDING");
        const chosen = t.claims.find((c) => c.status === "CONFIRMED");
        const canClaim =
          t.status === "OPEN" &&
          me !== null &&
          me.username !== t.publisher.username &&
          !pending.some((c) => c.claimant.username === me.username);
        const canSelect =
          t.status === "OPEN" &&
          pending.length > 0 &&
          me !== null &&
          (me.username === t.publisher.username || me.role === "ADMIN");
        return (
          <div key={t.id} className="rounded-lg border border-zinc-200 bg-white p-4">
            <div className="flex items-center gap-2">
              <span className={`rounded px-2 py-0.5 text-xs font-medium ${st.cls}`}>
                {st.label}
              </span>
              <h2 className="font-semibold">
                <Link href={`/tasks/${t.id}`} className="hover:underline">
                  {t.title}
                </Link>
              </h2>
              <span className="ml-auto text-sm text-amber-600">+{t.points} 积分</span>
            </div>
            <p className="mt-2 whitespace-pre-wrap text-sm text-zinc-600">{t.content}</p>
            <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-zinc-400">
              <span className="rounded bg-zinc-100 px-1.5 py-0.5 text-zinc-600">
                招 {t.headcount} 人
              </span>
              <span>发布人：{t.publisher.username}</span>
              {t.deadline && <span>截止：{new Date(t.deadline).toLocaleString("zh-CN")}</span>}
              {t.status === "OPEN" && pending.length > 0 && (
                <span className="text-amber-600">{pending.length} 人已接</span>
              )}
              {chosen && <span>完成人：{chosen.claimant.username}</span>}
              {canClaim && (
                <button
                  onClick={() => claim(t.id)}
                  className="ml-auto rounded border-2 border-zinc-900 bg-white px-3 py-1 text-xs font-medium text-zinc-900 hover:bg-zinc-100"
                >
                  接单
                </button>
              )}
            </div>
            {canSelect && (
              <div className="mt-3 border-t border-zinc-100 pt-2">
                <p className="text-xs text-zinc-500">
                  选择接单人（选中即完成，TA 得 {t.points} 分，其余落选）：
                </p>
                <div className="mt-2 space-y-1.5">
                  {pending.map((c) => (
                    <div key={c.id} className="flex items-center gap-3 text-sm">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-zinc-900 text-xs font-medium text-white">
                        {c.claimant.username.charAt(0).toUpperCase()}
                      </span>
                      <span>{c.claimant.username}</span>
                      <button
                        onClick={() => select(c.id)}
                        className="ml-auto rounded bg-green-600 px-3 py-1 text-xs font-medium text-white hover:bg-green-500"
                      >
                        选 TA 完成（+{t.points} 分）
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
