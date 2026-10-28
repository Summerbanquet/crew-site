"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Item = { id: number; name: string; description: string; icon: string; cost: number };

export default function MallPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [me, setMe] = useState<{ username: string; points: number; role: string } | null>(null);
  const [msg, setMsg] = useState("");

  const loadMe = () =>
    fetch("/api/me").then((r) => (r.ok ? r.json() : null)).then((d) => d && setMe(d.user)).catch(() => {});

  useEffect(() => {
    fetch("/api/items").then((r) => r.json()).then((d) => setItems(d.items ?? []));
    loadMe();
  }, []);

  const redeem = async (itemId: number) => {
    setMsg("");
    const r = await fetch("/api/redeem", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ itemId }),
    });
    if (r.ok) {
      alert("🎉 兑换成功！积分已扣除");
      loadMe();
    } else {
      const d = await r.json().catch(() => ({}));
      alert(d.error ?? "兑换失败");
      setMsg(d.error ?? "兑换失败");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center">
        <h1 className="text-xl font-bold">积分商城</h1>
        {me?.role === "ADMIN" && (
          <Link
            href="/mall/manage"
            className="ml-auto rounded border-2 border-zinc-900 bg-white px-3 py-1 text-xs font-medium hover:bg-zinc-100"
          >
            商品管理
          </Link>
        )}
      </div>
      {me && <p className="text-sm text-zinc-500">当前积分：{me.points}</p>}
      {msg && <p className="rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">{msg}</p>}
      <div className="grid grid-cols-2 gap-4">
        {items.map((it) => (
          <div key={it.id} className="rounded-lg border border-zinc-200 bg-white p-4">
            <div className="text-3xl">{it.icon}</div>
            <h2 className="mt-2 font-semibold">{it.name}</h2>
            <p className="mt-1 text-xs text-zinc-500">{it.description}</p>
            <div className="mt-3 flex items-center">
              <span className="text-sm text-amber-600">{it.cost} 积分</span>
              {me && (
                <button
                  onClick={() => redeem(it.id)}
                  className="ml-auto rounded border-2 border-zinc-900 bg-white px-3 py-1 text-xs font-medium hover:bg-zinc-100"
                >
                  兑换
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}