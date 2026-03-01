import Link from "next/link";

type Room = { id: string; name: string; capacity: number; facilities: string; photoUrls: string | null };

export default function RoomCard({ room }: { room: Room }) {
  const photos = room.photoUrls ? room.photoUrls.split(",").filter(Boolean) : [];
  const firstPhoto = photos[0]?.trim();

  return (
    <Link
      href={`/rooms/${room.id}`}
      className="block overflow-hidden rounded-lg border bg-white shadow transition hover:shadow-md"
    >
      <div className="aspect-video bg-gray-100">
        {firstPhoto ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={firstPhoto}
            alt={room.name}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-gray-400">
            暂无图片
          </div>
        )}
      </div>
      <div className="p-3">
        <h3 className="font-medium text-gray-900">{room.name}</h3>
        <p className="text-sm text-gray-500">容量 {room.capacity} 人</p>
        <p className="mt-1 truncate text-sm text-gray-600">{room.facilities}</p>
      </div>
    </Link>
  );
}
