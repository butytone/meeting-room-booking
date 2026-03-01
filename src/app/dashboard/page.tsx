import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth";

export default async function DashboardPage() {
  const user = await getSession();
  if (!user) redirect("/login");

  return (
    <div>
      <h1 className="mb-6 text-xl font-semibold">欢迎，{user.name}</h1>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Link
          href="/rooms"
          className="rounded-lg border bg-white p-6 shadow-sm transition hover:shadow-md"
        >
          <h2 className="font-medium text-blue-600">会议室</h2>
          <p className="mt-1 text-sm text-gray-600">查看会议室列表与详情</p>
        </Link>
        <Link
          href="/book"
          className="rounded-lg border bg-white p-6 shadow-sm transition hover:shadow-md"
        >
          <h2 className="font-medium text-blue-600">预订会议室</h2>
          <p className="mt-1 text-sm text-gray-600">选择日期与时间段进行预订</p>
        </Link>
        <Link
          href="/my-bookings"
          className="rounded-lg border bg-white p-6 shadow-sm transition hover:shadow-md"
        >
          <h2 className="font-medium text-blue-600">我的预订</h2>
          <p className="mt-1 text-sm text-gray-600">查看或取消自己的预订</p>
        </Link>
      </div>
    </div>
  );
}
