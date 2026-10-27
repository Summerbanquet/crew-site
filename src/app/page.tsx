"use client";

import { useEffect, useState } from "react";

type Task = {
  id: number;
  title: string;
  content: string;
  points: number;
  deadline: string | null;
  status: string;
  publisher: { username: string };
  claim: { claimant: { username: string } } | null;
};

const statusText: Record<string, { label: string; cls: string }> = {
  OPEN: { label: "招募中", cls: "bg-green-100 text-green-700" },
  PENDING: { label: "待确认", cls: "bg-amber-100 text-amber-700" },
  DONE: { label: "已完成", cls: "bg-zinc-200 text-zinc-600" },
  CANCELLED: { label: "已取消", cls: "bg-red-100 text-red-700" },
};

export default function TaskHall() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [me, setMe] = useState<{ username: string } | null>(null);
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
    } else {
      const data = await res.json().catch(() => ({}));
      setMsg(data.error ?? "接单失败");
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
        const canClaim =
          t.status === "OPEN" && me && me.username !== t.publisher.username;
        return (
          <div key={t.id} className="rounded-lg border border-zinc-200 bg-white p-4">
            <div className="flex items-center gap-2">
              <span className={`rounded px-2 py-0.5 text-xs font-medium ${st.cls}`}>
                {st.label}
              </span>
              <h2 className="font-semibold">{t.title}</h2>
              <span className="ml-auto text-sm text-amber-600">+{t.points} 积分</span>
            </div>
            <p className="mt-2 whitespace-pre-wrap text-sm text-zinc-600">{t.content}</p>
            <div className="mt-3 flex items-center gap-3 text-xs text-zinc-400">
              <span>发布人：{t.publisher.username}</span>
              {t.deadline && <span>截止：{new Date(t.deadline).toLocaleString("zh-CN")}</span>}
              {t.claim && <span>接单人：{t.claim.claimant.username}</span>}
              {canClaim && (
                <button
                  onClick={() => claim(t.id)}
                  className="ml-auto rounded border-2 border-zinc-900 bg-white px-3 py-1 text-xs font-medium text-zinc-900 hover:bg-zinc-100"
                >
                  接单
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
