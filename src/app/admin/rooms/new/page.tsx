import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import RoomForm from "@/components/admin/RoomForm";

export default async function NewRoomPage() {
  const user = await getSession();
  if (!user) redirect("/login");
  if (user.role !== "admin") redirect("/dashboard");

  return (
    <div>
      <Link href="/admin/rooms" className="text-sm text-blue-600 hover:underline">
        ← 返回管理列表
      </Link>
      <h1 className="mt-4 mb-6 text-xl font-semibold">添加会议室</h1>
      <RoomForm />
    </div>
  );
}
