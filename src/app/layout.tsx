import type { Metadata } from "next";
import Link from "next/link";
import { getSessionUser } from "@/lib/auth";
import "./globals.css";


// 根布局读登录 Cookie（头像区），必须声明为请求时渲染：
// 否则 Next 16 cacheComponents 预渲染撞上 cookies() 会变成 Blocking Route，拦截所有链接跳转
export const instant = false;

export const metadata: Metadata = {
  title: "剧组小站",
  description: "剧组统计与任务接单",
};

const navLink = "text-zinc-600 hover:text-zinc-900 transition-colors";

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
    const user = await getSessionUser();
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
            {(user?.role === "SHOOTER" || user?.role === "ADMIN") && (
              <Link href="/tasks/new" className={navLink}>
                发布任务
              </Link>
            )}
            <Link href="/profile" className={navLink}>
              我的主页
            </Link>
            <Link href="/mall" className={navLink}>
              积分商城
            </Link>
            <div className="ml-auto flex items-center gap-5">
              {user ? (
                <Link
                  href="/profile"
                  className="flex items-center gap-2 rounded px-1 py-1 hover:bg-zinc-100"
                >
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-zinc-900 text-xs font-medium text-white">
                    {user.username.charAt(0).toUpperCase()}
                  </span>
                  <span className={navLink}>{user.username}</span>
                </Link>
              ) : (
                <>
                  <Link href="/login" className={navLink}>
                    登录
                  </Link>
                  <Link href="/register" className={navLink}>
                    注册
                  </Link>
                </>
              )}
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
