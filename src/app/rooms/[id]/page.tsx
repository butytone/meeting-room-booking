import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import RoomBookedSlotsWithDatePicker from "@/components/RoomBookedSlotsWithDatePicker";

export default async function RoomDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await getSession();
  if (!user) redirect("/login");
  if (!user.namespaceId) redirect("/login");
  const { id } = await params;
  const room = await prisma.room.findUnique({ where: { id } });
  if (!room || !room.isActive || room.namespaceId !== user.namespaceId) notFound();

  const photos = room.photoUrls ? room.photoUrls.split(",").map((s) => s.trim()).filter(Boolean) : [];

  return (
    <div>
      <Link href="/rooms" className="text-sm text-blue-600 hover:underline">
        ← 返回列表
      </Link>
      <div className="mt-4 overflow-hidden rounded-lg border bg-white shadow-sm">
        <div className="aspect-video bg-gray-100">
          {photos[0] ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={photos[0]}
              alt={room.name}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-gray-400">
              暂无图片
            </div>
          )}
        </div>
        <div className="p-4">
          <h1 className="text-xl font-semibold">{room.name}</h1>
          <p className="text-gray-600">容量 {room.capacity} 人</p>
          <p className="mt-2 text-gray-700">{room.facilities}</p>
          {room.description && (
            <p className="mt-2 text-sm text-gray-500">{room.description}</p>
          )}
          <Link
            href={`/book?roomId=${room.id}`}
            className="mt-4 inline-block rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
          >
            预订此会议室
          </Link>
          <RoomBookedSlotsWithDatePicker roomId={room.id} />
        </div>
      </div>
    </div>
  );
}
