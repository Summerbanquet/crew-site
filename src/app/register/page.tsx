"use client";

import { useState } from "react";
import Link from "next/link";

export default function RegisterPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [wechat, setWechat] = useState("");
  const [role, setRole] = useState<"ACTOR" | "SHOOTER">("ACTOR");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password, wechat, role }),
    });
    setLoading(false);
    if (res.ok) {
      // 注册即登录，同样硬导航清掉缓存的老 layout（原因见 login 页注释）
      window.location.assign("/profile");
      return;
    }
    const data = await res.json().catch(() => ({}));
    setError(data.error ?? "注册失败");
  };

  return (
    <div className="mx-auto max-w-sm space-y-4">
      <h1 className="text-xl font-bold">注册</h1>
      <form onSubmit={submit} className="space-y-3 rounded-lg border bg-white p-4">
        <input
          className="w-full rounded border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-900"
          placeholder="用户名（至少 2 个字符）"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          type="password"
          className="w-full rounded border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-900"
          placeholder="密码（至少 6 位）"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <input
          className="w-full rounded border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-900"
          placeholder="微信群昵称（选填，方便剧组统计对名）"
          value={wechat}
          onChange={(e) => setWechat(e.target.value)}
        />
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setRole("ACTOR")}
            className={`rounded border p-2 text-left text-sm ${role === "ACTOR" ? "border-2 border-zinc-900" : "border-zinc-300 text-zinc-500"}`}
          >
            <span className="font-medium">普通演员</span>
            <span className="block text-xs text-zinc-400">接任务赚积分</span>
          </button>
          <button
            type="button"
            onClick={() => setRole("SHOOTER")}
            className={`rounded border p-2 text-left text-sm ${role === "SHOOTER" ? "border-2 border-zinc-900" : "border-zinc-300 text-zinc-500"}`}
          >
            <span className="font-medium">拍摄</span>
            <span className="block text-xs text-zinc-400">发布任务 + 接任务</span>
          </button>
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          disabled={loading}
          className="w-full rounded border-2 border-zinc-900 bg-white py-2 text-sm font-medium text-zinc-900 hover:bg-zinc-100 disabled:opacity-50"
        >
          {loading ? "注册中..." : "注册"}
        </button>
        <p className="text-center text-xs text-zinc-400">
          已有账号？<Link href="/login" className="text-zinc-900 underline">去登录</Link>
        </p>
      </form>
    </div>
  );
}
