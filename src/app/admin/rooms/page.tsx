import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import AdminRoomsClient from "./AdminRoomsClient";

export default async function AdminRoomsPage() {
  const user = await getSession();
  if (!user) redirect("/login");
  if (user.role !== "admin") redirect("/dashboard");

  const rooms = await prisma.room.findMany({
    where: { namespaceId: user.namespaceId },
    orderBy: { name: "asc" },
  });

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-semibold">管理会议室</h1>
        <Link
          href="/admin/rooms/new"
          className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
        >
          添加会议室
        </Link>
      </div>
      <AdminRoomsClient rooms={rooms} />
    </div>
  );
}
