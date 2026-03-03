import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import RoomCard from "@/components/RoomCard";

export default async function RoomsPage() {
  const user = await getSession();
  if (!user) redirect("/login");
  if (!user.namespaceId) redirect("/login");

  const rooms = await prisma.room.findMany({
    where: { namespaceId: user.namespaceId, isActive: true },
    orderBy: { name: "asc" },
  });

  return (
    <div>
      <h1 className="mb-6 text-xl font-semibold">会议室</h1>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {rooms.map((room) => (
          <RoomCard key={room.id} room={room} />
        ))}
      </div>
      {rooms.length === 0 && (
        <p className="text-gray-500">暂无会议室，请联系管理员添加。</p>
      )}
    </div>
  );
}
