"use client";

import { useState } from "react";
import Link from "next/link";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const res = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    if (res.ok) {
      // 登录切换全局身份，必须硬导航整页刷新：
      // 客户端路由会复用缓存的老 layout（老头像），refresh 与 push 有时序竞争救不回来
      window.location.assign("/profile");
      return;
    }
    setLoading(false);
    const data = await res.json().catch(() => ({}));
    setError(data.error ?? "登录失败");
  };

  return (
    <div className="mx-auto max-w-sm space-y-4">
      <h1 className="text-xl font-bold">登录</h1>
      <form onSubmit={submit} className="space-y-3 rounded-lg border bg-white p-4">
        <input
          className="w-full rounded border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-900"
          placeholder="用户名"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          type="password"
          className="w-full rounded border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-900"
          placeholder="密码"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          disabled={loading}
          className="w-full rounded border-2 border-zinc-900 bg-white py-2 text-sm font-medium text-zinc-900 hover:bg-zinc-100 disabled:opacity-50"
        >
          {loading ? "登录中..." : "登录"}
        </button>
        <p className="text-center text-xs text-zinc-400">
          没有账号？<Link href="/register" className="text-zinc-900 underline">去注册</Link>
        </p>
      </form>
    </div>
  );
}
