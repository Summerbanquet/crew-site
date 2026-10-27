import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "剧组小站",
  description: "剧组统计与任务接单",
};

const navLink = "text-zinc-600 hover:text-zinc-900 transition-colors";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-white text-zinc-900">
        <header className="border-b border-zinc-200 bg-white">
          <nav className="mx-auto flex h-12 w-full max-w-3xl items-center gap-5 px-4 text-sm">
            <Link href="/" className="font-bold text-zinc-900">
              剧组小站
            </Link>
            <Link href="/" className={navLink}>
              任务大厅
            </Link>
            <Link href="/tasks/new" className={navLink}>
              发布任务
            </Link>
            <Link href="/profile" className={navLink}>
              我的主页
            </Link>
            <div className="ml-auto flex gap-5">
              <Link href="/login" className={navLink}>
                登录
              </Link>
              <Link href="/register" className={navLink}>
                注册
              </Link>
            </div>
          </nav>
        </header>
        <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-8">
          {children}
        </main>
      </body>
    </html>
  );
}
