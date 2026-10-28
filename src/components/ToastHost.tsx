"use client";

import { useEffect, useRef, useState } from "react";
import { onToast, dotColor, type Notice } from "@/lib/notify";

const VISIBLE_MS = 4000; // 悬停 4 秒
const ANIM_MS = 300; // 收缩动画时长
const SWIPE_THRESHOLD = 70; // 拖过这个距离松手即划走

function ToastCard({ n, onDone }: { n: Notice; onDone: () => void }) {
  // in 顶部滑入 / show 停留 / drag 手动拖拽中 / out 消失动画（corner 朝铃铛 / left / right 朝拖动方向飞出）
  const [phase, setPhase] = useState<"in" | "show" | "drag" | "out">("in");
  const [outDir, setOutDir] = useState<"corner" | "left" | "right">("corner");
  const [dx, setDx] = useState(0);
  const doneRef = useRef(onDone);
  doneRef.current = onDone;
  const drag = useRef<{ startX: number; active: boolean } | null>(null);
  const timers = useRef<{ auto?: ReturnType<typeof setTimeout>; gone?: ReturnType<typeof setTimeout> }>({});

  const clearAuto = () => {
    clearTimeout(timers.current.auto);
    clearTimeout(timers.current.gone);
  };
  const startAuto = () => {
    timers.current.auto = setTimeout(() => {
      setOutDir("corner");
      setPhase("out");
    }, VISIBLE_MS);
    timers.current.gone = setTimeout(() => doneRef.current(), VISIBLE_MS + ANIM_MS);
  };

  useEffect(() => {
    const raf = requestAnimationFrame(() => setPhase("show"));
    startAuto();
    return () => {
      cancelAnimationFrame(raf);
      clearAuto();
    };
  }, []);

  const onPointerDown = (e: React.PointerEvent) => {
    if (phase === "out") return;
    drag.current = { startX: e.clientX, active: true };
    clearAuto(); // 拖拽期间暂停自动消失
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!drag.current?.active) return;
    setDx(e.clientX - drag.current.startX);
    setPhase("drag");
  };

  const endDrag = () => {
    if (!drag.current?.active) return;
    drag.current = null;
    if (Math.abs(dx) >= SWIPE_THRESHOLD) {
      // 划走：朝拖动方向飞出
      setOutDir(dx > 0 ? "right" : "left");
      setPhase("out");
      setTimeout(() => doneRef.current(), ANIM_MS);
    } else {
      // 没拖够距离：弹回原位，重新计时
      setDx(0);
      setPhase("show");
      startAuto();
    }
  };

  const motion =
    phase === "in"
      ? "-translate-y-16 opacity-0"
      : phase === "out"
        ? outDir === "left"
          ? "-translate-x-[60vw] opacity-0"
          : outDir === "right"
            ? "translate-x-[60vw] opacity-0"
            : "translate-x-24 -translate-y-8 scale-[0.6] opacity-0"
        : "translate-y-0 opacity-100";

  return (
    <div
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      style={phase === "drag" ? { transform: `translateX(${dx}px)` } : undefined}
      className={`pointer-events-auto flex cursor-grab touch-none select-none gap-2 rounded-lg border border-zinc-200 bg-white px-3 py-2.5 shadow-lg ${
        phase === "drag" ? "" : "transition-all duration-300"
      } ${motion}`}
    >
      <span
        className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${
          dotColor[n.type] ?? "bg-zinc-400"
        }`}
      />
      <div className="min-w-0 flex-1">
        <div className="text-xs font-medium text-zinc-900">{n.title}</div>
        <p className="mt-0.5 text-xs leading-5 text-zinc-600">{n.content}</p>
      </div>
    </div>
  );
}

export default function ToastHost() {
  const [items, setItems] = useState<Notice[]>([]);

  useEffect(
    () =>
      onToast((n) => {
        // 同时最多 4 条，超出丢弃最旧的
        setItems((prev) => [...prev.slice(-3), n]);
      }),
    []
  );

  return (
    <div className="pointer-events-none fixed left-1/2 top-3 z-[60] flex w-80 -translate-x-1/2 flex-col gap-2">
      {items.map((n) => (
        <ToastCard key={n.id} n={n} onDone={() => setItems((prev) => prev.filter((x) => x.id !== n.id))} />
      ))}
    </div>
  );
}
