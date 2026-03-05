"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function Nav({
  name,
  namespaceName,
  role,
}: {
  name: string | null;
  namespaceName?: string | null;
  role?: string | null;
}) {
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  };

  const closeMenu = () => setMobileOpen(false);

  const linkCls = "block rounded-lg px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 active:bg-blue-100 md:rounded-none md:px-0 md:py-0 md:bg-transparent md:hover:bg-transparent";
  const linkClsDesktop = "md:inline-block";

  const mobileMenuLinks = name ? (
    <>
      <Link href="/dashboard" className={`${linkCls} ${linkClsDesktop}`} onClick={closeMenu}>首页</Link>
      {role !== "admin" && (
        <Link href="/rooms" className={`${linkCls} ${linkClsDesktop}`} onClick={closeMenu}>会议室</Link>
      )}
      {role !== "admin" && (
        <>
          <Link href="/book" className={`${linkCls} ${linkClsDesktop}`} onClick={closeMenu}>预订</Link>
          <Link href="/my-bookings" className={`${linkCls} ${linkClsDesktop}`} onClick={closeMenu}>我的预订</Link>
        </>
      )}
      {role === "admin" && (
        <>
          <Link href="/admin/rooms" className={`${linkCls} ${linkClsDesktop}`} onClick={closeMenu}>管理会议室</Link>
          <Link href="/admin/users" className={`${linkCls} ${linkClsDesktop}`} onClick={closeMenu}>管理用户</Link>
        </>
      )}
      <Link href="/change-password" className={`${linkCls} ${linkClsDesktop}`} onClick={closeMenu}>修改密码</Link>
      <div className="border-t border-gray-100 pt-2 md:hidden">
        <button
          type="button"
          onClick={() => { handleLogout(); closeMenu(); }}
          className="w-full rounded-lg px-4 py-3 text-left text-red-600 hover:bg-red-50 active:bg-red-100"
        >
          退出登录
        </button>
      </div>
    </>
  ) : (
    <Link href="/login" className={`${linkCls} ${linkClsDesktop}`} onClick={closeMenu}>登录</Link>
  );

  const desktopRight = name ? (
    <>
      <Link href="/dashboard" className="text-gray-700 hover:text-blue-600">首页</Link>
      {role !== "admin" && <Link href="/rooms" className="text-gray-700 hover:text-blue-600">会议室</Link>}
      {role !== "admin" && (
        <>
          <Link href="/book" className="text-gray-700 hover:text-blue-600">预订</Link>
          <Link href="/my-bookings" className="text-gray-700 hover:text-blue-600">我的预订</Link>
        </>
      )}
      {role === "admin" && (
        <>
          <Link href="/admin/rooms" className="text-gray-700 hover:text-blue-600">管理会议室</Link>
          <Link href="/admin/users" className="text-gray-700 hover:text-blue-600">管理用户</Link>
        </>
      )}
      <Link href="/change-password" className="text-gray-700 hover:text-blue-600">修改密码</Link>
      {namespaceName && (
        <span className="rounded bg-gray-100 px-2 py-0.5 text-sm text-gray-600">{namespaceName}</span>
      )}
      <span className="truncate max-w-[6rem] text-gray-500 lg:max-w-none">{name}</span>
      <button
        type="button"
        onClick={handleLogout}
        className="rounded bg-gray-200 px-3 py-1.5 text-sm hover:bg-gray-300"
      >
        退出
      </button>
    </>
  ) : (
    <Link href="/login" className="text-gray-700 hover:text-blue-600">登录</Link>
  );

  return (
    <nav className="relative border-b bg-white px-4 py-3 shadow-sm">
      <div className="relative mx-auto max-w-6xl">
        <div className="flex min-h-[2.5rem] items-center justify-between gap-2">
          <Link href="/" className="shrink-0 text-lg font-semibold text-blue-600">
            会议室预订
          </Link>

          {/* 手机端：已登录显示学院+用户名+汉堡；未登录只显示登录链接 */}
          <div className="flex min-w-0 flex-1 items-center justify-end gap-2 md:hidden">
            {name ? (
              <>
                <div className="flex min-w-0 shrink items-center gap-2">
                  {namespaceName && (
                    <span className="shrink-0 rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-600">{namespaceName}</span>
                  )}
                  <span className="min-w-0 truncate text-sm text-gray-600">{name}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setMobileOpen((o) => !o)}
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-gray-600 active:bg-gray-200"
                  aria-label={mobileOpen ? "关闭菜单" : "打开菜单"}
                >
                  {mobileOpen ? (
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  ) : (
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                  )}
                </button>
              </>
            ) : (
              <Link href="/login" className="text-sm font-medium text-blue-600 hover:underline">登录</Link>
            )}
          </div>

          {/* 桌面端：横向菜单（含学院、用户名） */}
          <div className="hidden items-center gap-4 md:flex">
            {desktopRight}
          </div>
        </div>

        {/* 手机端：悬浮下拉菜单（不占位、不推开下方内容） */}
        {mobileOpen && (
          <div className="absolute left-0 right-0 top-full z-50 mt-1 md:hidden">
            <div className="rounded-xl border border-gray-200 bg-white py-2 shadow-xl">
              {mobileMenuLinks}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
