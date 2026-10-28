"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";

type Log = {
  id: number;
  username: string;
  action: string;
  detail: string;
  ok: boolean;
  ip: string | null;
  createdAt: string;
};

const actionText: Record<string, string> = {
  REGISTER: "注册",
  LOGIN: "登录",
  LOGOUT: "退出",
  PUBLISH: "发布任务",
  CLAIM: "接取任务",
  SELECT: "选人完成",
  REDEEM: "兑换",
  ITEM_CREATE: "新增商品",
  ITEM_UPDATE: "编辑/上下架",
  ITEM_SHIP: "标记发货",
};

const PAGE_SIZE = 50;

export default function AdminLogsPage() {
  const [me, setMe] = useState<{ role: string } | null>(null);
  const [meLoaded, setMeLoaded] = useState(false);
  const [logs, setLogs] = useState<Log[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [qUser, setQUser] = useState("");
  const [qAction, setQAction] = useState("");
  const [filterUser, setFilterUser] = useState("");
  const [filterAction, setFilterAction] = useState("");

  useEffect(() => {
    fetch("/api/me")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => setMe(d?.user ?? null))
      .catch(() => {})
      .finally(() => setMeLoaded(true));
  }, []);

  const load = useCallback(async (p: number) => {
    const params = new URLSearchParams({ page: String(p) });
    if (filterUser) params.set("user", filterUser);
    if (filterAction) params.set("action", filterAction);
    const r = await fetch(`/api/admin/logs?${params}`);
    if (r.ok) {
      const d = await r.json();
      setLogs(d.logs ?? []);
      setTotal(d.total ?? 0);
      setPage(p);
    }
  }, [filterUser, filterAction]);

  useEffect(() => {
    if (me?.role === "ADMIN") load(1);
  }, [me, load]);

  if (!meLoaded) return <p className="py-12 text-center text-zinc-400">加载中...</p>;
  if (me?.role !== "ADMIN") {
    return (
      <div className="py-12 text-center text-zinc-500">
        仅管理员可访问，<Link href="/" className="underline">回任务大厅</Link>
      </div>
    );
  }

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const input =
    "rounded border border-zinc-300 px-3 py-1.5 text-sm outline-none focus:border-zinc-900";

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold">操作日志</h1>

      {/* 筛选 */}
      <div className="flex flex-wrap items-center gap-2">
        <input
          className={input}
          placeholder="按用户名筛选"
          value={qUser}
          onChange={(e) => setQUser(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && (setFilterUser(qUser), setFilterAction(qAction), load(1))}
        />
        <select
          className={input}
          value={qAction}
          onChange={(e) => { setQAction(e.target.value); setFilterUser(qUser); setFilterAction(e.target.value); load(1); }}
        >
          <option value="">全部动作</option>
          {Object.entries(actionText).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </select>
        <button
          onClick={() => { setFilterUser(qUser); setFilterAction(qAction); load(1); }}
          className="rounded border-2 border-zinc-900 bg-white px-4 py-1.5 text-sm font-medium hover:bg-zinc-100"
        >
          查询
        </button>
      </div>

      {/* 日志表 */}
      <div className="overflow-x-auto rounded-lg border border-zinc-200 bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-100 text-left text-xs text-zinc-500">
              <th className="px-3 py-2 font-medium">时间</th>
              <th className="px-3 py-2 font-medium">用户</th>
              <th className="px-3 py-2 font-medium">动作</th>
              <th className="px-3 py-2 font-medium">详情</th>
              <th className="px-3 py-2 font-medium">结果</th>
              <th className="px-3 py-2 font-medium">IP</th>
            </tr>
          </thead>
          <tbody>
            {logs.length === 0 && (
              <tr><td colSpan={6} className="px-3 py-6 text-center text-zinc-400">没有符合条件的日志</td></tr>
            )}
            {logs.map((l) => (
              <tr key={l.id} className="border-b border-zinc-50 last:border-b-0">
                <td className="whitespace-nowrap px-3 py-2 text-xs text-zinc-400">
                  {new Date(l.createdAt).toLocaleString("zh-CN")}
                </td>
                <td className="whitespace-nowrap px-3 py-2">{l.username}</td>
                <td className="whitespace-nowrap px-3 py-2 text-xs">
                  <span className="rounded bg-zinc-100 px-2 py-0.5 text-zinc-600">
                    {actionText[l.action] ?? l.action}
                  </span>
                </td>
                <td className="px-3 py-2 text-zinc-600">{l.detail}</td>
                <td className="whitespace-nowrap px-3 py-2">
                  <span className={`text-xs ${l.ok ? "text-green-600" : "text-red-500"}`}>
                    {l.ok ? "成功" : "失败"}
                  </span>
                </td>
                <td className="whitespace-nowrap px-3 py-2 text-xs text-zinc-400">{l.ip ?? "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 分页 */}
      <div className="flex items-center justify-between text-sm text-zinc-500">
        <span>共 {total} 条 · 第 {page}/{totalPages} 页</span>
        <div className="flex gap-2">
          <button
            disabled={page <= 1}
            onClick={() => load(page - 1)}
            className="rounded border border-zinc-300 px-3 py-1 hover:bg-zinc-100 disabled:opacity-40"
          >
            上一页
          </button>
          <button
            disabled={page >= totalPages}
            onClick={() => load(page + 1)}
            className="rounded border border-zinc-300 px-3 py-1 hover:bg-zinc-100 disabled:opacity-40"
          >
            下一页
          </button>
        </div>
      </div>
    </div>
  );
}
