"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function NewTaskPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [points, setPoints] = useState("10");
  const [deadline, setDeadline] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const res = await fetch("/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        content,
        points: Number(points),
        deadline: deadline || null,
      }),
    });
    setLoading(false);
    if (res.ok) {
      router.push("/");
      router.refresh();
    } else {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "发布失败");
    }
  };

  const input =
    "w-full rounded border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-900";

  return (
    <div className="mx-auto max-w-lg space-y-4">
      <h1 className="text-xl font-bold">发布任务</h1>
      <form onSubmit={submit} className="space-y-3 rounded-lg border bg-white p-4">
        <input
          className={input}
          placeholder="任务标题，如：周三 8:00 横店群演 20 名"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <textarea
          className={`${input} min-h-24`}
          placeholder="任务详情：要求、集合地点、注意事项等（具体沟通在群里进行）"
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
        <div className="flex gap-3">
          <label className="flex-1 text-xs text-zinc-500">
            完成可得积分
            <input
              type="number"
              min={0}
              className={`${input} mt-1`}
              value={points}
              onChange={(e) => setPoints(e.target.value)}
            />
          </label>
          <label className="flex-1 text-xs text-zinc-500">
            截止时间（选填）
            <input
              type="datetime-local"
              className={`${input} mt-1`}
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
            />
          </label>
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          disabled={loading}
          className="w-full rounded border-2 border-zinc-900 bg-white py-2 text-sm font-medium text-zinc-900 hover:bg-zinc-100 disabled:opacity-50"
        >
          {loading ? "发布中..." : "发布"}
        </button>
        <p className="text-center text-xs text-zinc-400">拍摄身份或管理员可发布</p>
      </form>
    </div>
  );
}
