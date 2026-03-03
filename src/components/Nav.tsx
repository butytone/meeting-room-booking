"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

export default function Nav({ name, namespaceName }: { name: string | null; namespaceName?: string | null }) {
  const router = useRouter();
  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  };

  return (
    <nav className="border-b bg-white px-4 py-3 shadow-sm">
      <div className="mx-auto flex max-w-6xl items-center justify-between">
        <Link href="/" className="text-lg font-semibold text-blue-600">
          会议室预订
        </Link>
        <div className="flex items-center gap-4">
          {name ? (
            <>
              <Link href="/dashboard" className="text-gray-700 hover:text-blue-600">
                首页
              </Link>
              <Link href="/rooms" className="text-gray-700 hover:text-blue-600">
                会议室
              </Link>
              <Link href="/book" className="text-gray-700 hover:text-blue-600">
                预订
              </Link>
              <Link href="/my-bookings" className="text-gray-700 hover:text-blue-600">
                我的预订
              </Link>
              {namespaceName && (
                <span className="rounded bg-gray-100 px-2 py-0.5 text-sm text-gray-600">{namespaceName}</span>
              )}
              <span className="text-gray-500">{name}</span>
              <button
                type="button"
                onClick={handleLogout}
                className="rounded bg-gray-200 px-3 py-1 text-sm hover:bg-gray-300"
              >
                退出
              </button>
            </>
          ) : (
            <Link href="/login" className="text-gray-700 hover:text-blue-600">
              登录
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
