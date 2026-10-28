// 消息/弹窗共享工具：client 组件间用，纯模块不依赖 React
export type Notice = {
  id: number;
  type: string;
  title: string;
  content: string;
  read: boolean;
  createdAt: string;
};

// 各类消息的小圆点颜色：接单待确认橙、接取/确认完成绿、兑换灰
export const dotColor: Record<string, string> = {
  CLAIM: "bg-amber-500",
  CLAIMED: "bg-emerald-500",
  CONFIRMED: "bg-emerald-500",
  REDEEM: "bg-zinc-400",
};

// ---- toast 事件总线：NotificationCenter 发现新消息时广播，ToastHost 订阅显示 ----
type Listener = (n: Notice) => void;
let listeners: Listener[] = [];

export function onToast(cb: Listener) {
  listeners.push(cb);
  return () => {
    listeners = listeners.filter((l) => l !== cb);
  };
}

export function toast(n: Notice) {
  listeners.forEach((l) => l(n));
}

// 接单/确认/兑换成功后调用：让消息中心立即拉取新通知（新通知会自动弹顶部提醒）
export function refreshNotifications() {
  window.dispatchEvent(new Event("notifications:refresh"));
}
