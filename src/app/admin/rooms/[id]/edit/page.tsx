import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import RoomForm from "@/components/admin/RoomForm";

export default async function EditRoomPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await getSession();
  if (!user) redirect("/login");
  if (user.role !== "admin") redirect("/dashboard");
  const { id } = await params;
  const room = await prisma.room.findUnique({ where: { id } });
  if (!room || room.namespaceId !== user.namespaceId) notFound();

  return (
    <div>
      <Link href="/admin/rooms" className="text-sm text-blue-600 hover:underline">
        ← 返回管理列表
      </Link>
      <h1 className="mt-4 mb-6 text-xl font-semibold">编辑会议室：{room.name}</h1>
      <RoomForm room={room} />
    </div>
  );
}
