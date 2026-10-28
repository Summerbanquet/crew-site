"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { dotColor, toast, type Notice } from "@/lib/notify";

function fmtTime(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  const hm = `${pad(d.getHours())}:${pad(d.getMinutes())}`;
  return d.toDateString() === now.toDateString()
    ? hm
    : `${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${hm}`;
}

export default function NotificationCenter() {
  const [open, setOpen] = useState(false);
  const [list, setList] = useState<Notice[]>([]);
  const [unread, setUnread] = useState(0);
  const boxRef = useRef<HTMLDivElement>(null);
  // 已见过的最新通知 id：首次拉取只记基线不弹，之后新到且未读的弹顶部提醒
  const lastSeenId = useRef<number | null>(null);

  const fetchUnread = useCallback(async () => {
    const res = await fetch("/api/notifications");
    if (!res.ok) return;
    const data = await res.json();
    const fresh: Notice[] = data.notifications ?? [];
    setUnread(data.unread ?? 0);
    setList(fresh);
    const newest = fresh[0]?.id ?? 0;
    if (lastSeenId.current === null) {
      lastSeenId.current = newest;
    } else if (newest > lastSeenId.current) {
      fresh
        .filter((n) => n.id > lastSeenId.current! && !n.read)
        .reverse() // 按时间正序逐条弹
        .forEach((n) => toast(n));
      lastSeenId.current = newest;
    }
  }, []);

  // 挂载时 + 每 30 秒 + 切回浏览器标签页 + 操作成功后的即时刷新事件
  useEffect(() => {
    fetchUnread();
    const timer = setInterval(fetchUnread, 30_000);
    const onFocus = () => fetchUnread();
    const onRefresh = () => fetchUnread();
    window.addEventListener("focus", onFocus);
    window.addEventListener("notifications:refresh", onRefresh);
    return () => {
      clearInterval(timer);
      window.removeEventListener("focus", onFocus);
      window.removeEventListener("notifications:refresh", onRefresh);
    };
  }, [fetchUnread]);

  // 点击面板外部时收起
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  const markAllRead = async () => {
    await fetch("/api/notifications", { method: "POST" });
    setUnread(0);
    setList((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  // 点开面板停留满 3 秒视为已读，自动消除红点；不满 3 秒关闭则不计
  useEffect(() => {
    if (!open) return;
    const t = setTimeout(markAllRead, 3000);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  return (
    <div ref={boxRef} className="relative">
      <button
        aria-label="消息"
        onClick={() => setOpen((v) => !v)}
        className="relative flex h-8 w-8 items-center justify-center rounded text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900"
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
          <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
        </svg>
        {unread > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-medium leading-none text-white">
            {unread > 99 ? "99+" : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-10 z-50 w-80 overflow-hidden rounded-lg border border-zinc-200 bg-white shadow-lg">
          <div className="flex items-center justify-between border-b border-zinc-100 px-3 py-2">
            <span className="text-sm font-medium">我的消息</span>
            {unread > 0 && (
              <button
                onClick={markAllRead}
                className="text-xs text-zinc-500 hover:text-zinc-900"
              >
                全部已读
              </button>
            )}
          </div>
          <div className="max-h-80 overflow-y-auto">
            {list.length === 0 ? (
              <p className="px-3 py-6 text-center text-xs text-zinc-400">
                暂无消息
              </p>
            ) : (
              list.map((n) => (
                <div
                  key={n.id}
                  className={`flex gap-2 border-b border-zinc-50 px-3 py-2.5 last:border-b-0 ${
                    n.read ? "" : "bg-zinc-50"
                  }`}
                >
                  <span
                    className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${
                      dotColor[n.type] ?? "bg-zinc-400"
                    }`}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-medium text-zinc-900">
                        {n.title}
                        {!n.read && (
                          <span className="ml-1 inline-block h-1.5 w-1.5 rounded-full bg-red-500 align-middle" />
                        )}
                      </span>
                      <span className="shrink-0 text-[10px] text-zinc-400">
                        {fmtTime(n.createdAt)}
                      </span>
                    </div>
                    <p className="mt-0.5 text-xs leading-5 text-zinc-600">
                      {n.content}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
