"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { refreshNotifications } from "@/lib/notify";

type Task = {
  id: number;
  title: string;
  content: string;
  points: number;
  deadline: string | null;
  status: string;
  createdAt: string;
  publisher: { username: string };
  claim: { claimant: { username: string } } | null;
};

const statusText: Record<string, { label: string; cls: string }> = {
  OPEN: { label: "招募中", cls: "bg-green-100 text-green-700" },
  PENDING: { label: "待确认", cls: "bg-amber-100 text-amber-700" },
  DONE: { label: "已完成", cls: "bg-zinc-200 text-zinc-600" },
  CANCELLED: { label: "已取消", cls: "bg-red-100 text-red-700" },
};

export default function TaskDetailPage() {
  const params = useParams<{ id: string }>();
  const [task, setTask] = useState<Task | null>(null);
  const [me, setMe] = useState<{ username: string } | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [msg, setMsg] = useState("");
  const [claiming, setClaiming] = useState(false);

  const load = async () => {
    const res = await fetch(`/api/tasks/${params.id}`);
    if (res.status === 404) {
      setNotFound(true);
      return;
    }
    const data = await res.json();
    setTask(data.task);
  };

  useEffect(() => {
    load();
    fetch("/api/me")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => d && setMe(d.user))
      .catch(() => {});
  }, []);

  const claim = async () => {
    setMsg("");
    setClaiming(true);
    const res = await fetch(`/api/tasks/${params.id}/claim`, { method: "POST" });
    setClaiming(false);
    if (res.ok) {
      load();
      refreshNotifications(); // 立即拉新通知，顶部弹"接取成功"
    } else {
      const data = await res.json().catch(() => ({}));
      setMsg(data.error ?? "接单失败");
    }
  };

  if (notFound) {
    return (
      <div className="py-12 text-center text-zinc-500">
        任务不存在，<Link href="/" className="underline">回任务大厅</Link>
      </div>
    );
  }
  if (!task) return <p className="py-12 text-center text-zinc-400">加载中...</p>;

  const st = statusText[task.status] ?? { label: task.status, cls: "bg-zinc-100 text-zinc-600" };
  const canClaim =
    task.status === "OPEN" && me && me.username !== task.publisher.username;

  return (
    <div className="space-y-4">
      <Link href="/" className="text-sm text-zinc-500 hover:text-zinc-900">
        ← 返回任务大厅
      </Link>
      <div className="rounded-lg border border-zinc-200 bg-white p-4">
        <div className="flex items-center gap-2">
          <span className={`rounded px-2 py-0.5 text-xs font-medium ${st.cls}`}>
            {st.label}
          </span>
          <h1 className="text-lg font-bold">{task.title}</h1>
          <span className="ml-auto text-sm text-amber-600">+{task.points} 积分</span>
        </div>
        <p className="mt-3 whitespace-pre-wrap text-sm text-zinc-700">{task.content}</p>
        <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-zinc-100 pt-3 text-xs text-zinc-400">
          <span>发布人：{task.publisher.username}</span>
          {task.deadline && <span>截止：{new Date(task.deadline).toLocaleString("zh-CN")}</span>}
          {task.claim && <span>接单人：{task.claim.claimant.username}</span>}
          <span>发布时间：{new Date(task.createdAt).toLocaleString("zh-CN")}</span>
        </div>
        {msg && (
          <p className="mt-3 rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
            {msg}
          </p>
        )}
        <div className="mt-4">
          {canClaim ? (
            <button
              onClick={claim}
              disabled={claiming}
              className="rounded border-2 border-zinc-900 bg-white px-4 py-1.5 text-sm font-medium text-zinc-900 hover:bg-zinc-100 disabled:opacity-50"
            >
              {claiming ? "接单中..." : "接单"}
            </button>
          ) : task.status === "OPEN" && !me ? (
            <p className="text-sm text-zinc-500">登录后即可接单，具体事项到群里沟通。</p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
