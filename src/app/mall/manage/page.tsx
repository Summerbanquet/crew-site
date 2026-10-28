"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Item = {
  id: number;
  name: string;
  description: string;
  icon: string;
  cost: number;
  active: boolean;
};

type Redeem = {
  id: number;
  pointsSpent: number;
  status: string;
  createdAt: string;
  user: { username: string };
  item: { name: string; icon: string };
};

const input =
  "w-full rounded border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-900";

export default function ManageMallPage() {
  const [me, setMe] = useState<{ role: string } | null>(null);
  const [meLoaded, setMeLoaded] = useState(false);
  const [items, setItems] = useState<Item[]>([]);
  const [redeems, setRedeems] = useState<Redeem[]>([]);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  // 新增商品表单
  const [newName, setNewName] = useState("");
  const [newIcon, setNewIcon] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newCost, setNewCost] = useState("10");

  // 编辑中的商品
  const [editingId, setEditingId] = useState<number | null>(null);
  const [eName, setEName] = useState("");
  const [eIcon, setEIcon] = useState("");
  const [eDesc, setEDesc] = useState("");
  const [eCost, setECost] = useState("");

  useEffect(() => {
    fetch("/api/me")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => setMe(d?.user ?? null))
      .catch(() => {})
      .finally(() => setMeLoaded(true));
  }, []);

  const load = async () => {
    const r = await fetch("/api/items?all=1");
    if (r.ok) {
      const d = await r.json();
      setItems(d.items ?? []);
    }
  };

  const loadRedeems = async () => {
    const r = await fetch("/api/admin/redeems");
    if (r.ok) {
      const d = await r.json();
      setRedeems(d.redeems ?? []);
    }
  };

  useEffect(() => {
    if (me?.role === "ADMIN") {
      load();
      loadRedeems();
    }
  }, [me]);

  // 标记发货
  const ship = async (id: number) => {
    setMsg("");
    setErr("");
    const r = await fetch(`/api/redeems/${id}`, { method: "PUT" });
    if (r.ok) {
      setMsg("已标记发货");
      loadRedeems();
    } else {
      const d = await r.json().catch(() => ({}));
      setErr(d.error ?? "操作失败");
    }
  };

  const create = async () => {
    setMsg("");
    setErr("");
    const r = await fetch("/api/items", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: newName,
        icon: newIcon,
        description: newDesc,
        cost: Number(newCost),
      }),
    });
    if (r.ok) {
      setNewName("");
      setNewIcon("");
      setNewDesc("");
      setNewCost("10");
      setMsg("商品已上架");
      load();
    } else {
      const d = await r.json().catch(() => ({}));
      setErr(d.error ?? "新增失败");
    }
  };

  const startEdit = (it: Item) => {
    setMsg("");
    setErr("");
    setEditingId(it.id);
    setEName(it.name);
    setEIcon(it.icon);
    setEDesc(it.description);
    setECost(String(it.cost));
  };

  const saveEdit = async () => {
    if (editingId == null) return;
    setMsg("");
    setErr("");
    const r = await fetch(`/api/items/${editingId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: eName,
        icon: eIcon,
        description: eDesc,
        cost: Number(eCost),
      }),
    });
    if (r.ok) {
      setEditingId(null);
      setMsg("已保存");
      load();
    } else {
      const d = await r.json().catch(() => ({}));
      setErr(d.error ?? "保存失败");
    }
  };

  const toggleActive = async (it: Item) => {
    setMsg("");
    setErr("");
    const r = await fetch(`/api/items/${it.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: !it.active }),
    });
    if (r.ok) {
      setMsg(it.active ? `已下架《${it.name}》` : `已上架《${it.name}》`);
      load();
    } else {
      const d = await r.json().catch(() => ({}));
      setErr(d.error ?? "操作失败");
    }
  };

  if (!meLoaded) {
    return <p className="py-12 text-center text-zinc-400">加载中...</p>;
  }
  if (me?.role !== "ADMIN") {
    return (
      <div className="py-12 text-center text-zinc-500">
        仅管理员可访问，
        <Link href="/mall" className="underline">回积分商城</Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center">
        <h1 className="text-xl font-bold">商城管理</h1>
        <Link href="/mall" className="ml-auto text-sm text-zinc-500 hover:text-zinc-900">
          ← 返回积分商城
        </Link>
      </div>
      {msg && <p className="rounded border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700">{msg}</p>}
      {err && <p className="rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">{err}</p>}

      {/* 新增商品 */}
      <div className="rounded-lg border border-zinc-200 bg-white p-4">
        <h2 className="font-semibold">新增商品</h2>
        <div className="mt-3 grid grid-cols-[4rem_1fr_6rem] gap-2">
          <input className={input} placeholder="🎁" value={newIcon} onChange={(e) => setNewIcon(e.target.value)} />
          <input className={input} placeholder="商品名" value={newName} onChange={(e) => setNewName(e.target.value)} />
          <input
            type="number"
            min={0}
            className={input}
            placeholder="积分"
            value={newCost}
            onChange={(e) => setNewCost(e.target.value)}
          />
        </div>
        <input
          className={`${input} mt-2`}
          placeholder="商品描述（选填）"
          value={newDesc}
          onChange={(e) => setNewDesc(e.target.value)}
        />
        <button
          onClick={create}
          className="mt-3 rounded border-2 border-zinc-900 bg-white px-4 py-1.5 text-sm font-medium hover:bg-zinc-100"
        >
          上架新商品
        </button>
      </div>

      {/* 商品列表 */}
      <div className="space-y-2">
        {items.map((it) => (
          <div key={it.id} className="rounded-lg border border-zinc-200 bg-white p-4">
            {editingId === it.id ? (
              <div className="space-y-2">
                <div className="grid grid-cols-[4rem_1fr_6rem] gap-2">
                  <input className={input} value={eIcon} onChange={(e) => setEIcon(e.target.value)} />
                  <input className={input} value={eName} onChange={(e) => setEName(e.target.value)} />
                  <input
                    type="number"
                    min={0}
                    className={input}
                    value={eCost}
                    onChange={(e) => setECost(e.target.value)}
                  />
                </div>
                <input className={input} value={eDesc} onChange={(e) => setEDesc(e.target.value)} />
                <div className="flex gap-2">
                  <button
                    onClick={saveEdit}
                    className="rounded border-2 border-zinc-900 bg-white px-4 py-1.5 text-sm font-medium hover:bg-zinc-100"
                  >
                    保存
                  </button>
                  <button
                    onClick={() => setEditingId(null)}
                    className="rounded border border-zinc-300 px-4 py-1.5 text-sm text-zinc-600 hover:bg-zinc-100"
                  >
                    取消
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-wrap items-center gap-3">
                <span className="text-2xl">{it.icon}</span>
                <span className="font-medium">{it.name}</span>
                <span className="text-sm text-amber-600">{it.cost} 积分</span>
                <span
                  className={`rounded px-2 py-0.5 text-xs ${
                    it.active ? "bg-green-100 text-green-700" : "bg-zinc-200 text-zinc-500"
                  }`}
                >
                  {it.active ? "上架中" : "已下架"}
                </span>
                <div className="ml-auto flex gap-2">
                  <button
                    onClick={() => startEdit(it)}
                    className="rounded border border-zinc-300 px-3 py-1 text-xs text-zinc-600 hover:bg-zinc-100"
                  >
                    编辑
                  </button>
                  <button
                    onClick={() => toggleActive(it)}
                    className="rounded border border-zinc-300 px-3 py-1 text-xs text-zinc-600 hover:bg-zinc-100"
                  >
                    {it.active ? "下架" : "上架"}
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* 兑换记录 */}
      <div className="rounded-lg border border-zinc-200 bg-white p-4">
        <h2 className="font-semibold">兑换记录（{redeems.length}）</h2>
        <ul className="mt-3 divide-y divide-zinc-100 text-sm">
          {redeems.length === 0 && (
            <li className="py-2 text-zinc-400">还没有兑换记录</li>
          )}
          {redeems.map((r) => (
            <li key={r.id} className="flex flex-wrap items-center gap-3 py-2">
              <span className="text-xl">{r.item.icon}</span>
              <span className="font-medium">{r.user.username}</span>
              <span className="text-xs text-zinc-500">兑换《{r.item.name}》</span>
              <span className="text-xs text-amber-600">-{r.pointsSpent} 分</span>
              <span className="text-xs text-zinc-400">
                {new Date(r.createdAt).toLocaleString("zh-CN")}
              </span>
              <span className="ml-auto flex items-center gap-2">
                <span
                  className={`rounded px-2 py-0.5 text-xs ${
                    r.status === "DONE"
                      ? "bg-zinc-200 text-zinc-500"
                      : "bg-amber-100 text-amber-700"
                  }`}
                >
                  {r.status === "DONE" ? "已发货" : "待发货"}
                </span>
                {r.status === "PENDING" && (
                  <button
                    onClick={() => ship(r.id)}
                    className="rounded bg-green-600 px-3 py-1 text-xs font-medium text-white hover:bg-green-500"
                  >
                    标记已发货
                  </button>
                )}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
