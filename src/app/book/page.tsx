import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import BookingForm from "@/components/BookingForm";

export default async function BookPage({
  searchParams,
}: {
  searchParams: Promise<{ roomId?: string }>;
}) {
  const user = await getSession();
  if (!user) redirect("/login");
  if (!user.namespaceId) {
    redirect("/login"); // 未归属学院时视为未就绪，可后续做单独提示页
  }
  const { roomId: defaultRoomId } = await searchParams;

  const rooms = await prisma.room.findMany({
    where: { namespaceId: user.namespaceId, isActive: true },
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });

  return (
    <div>
      <h1 className="mb-6 text-xl font-semibold">预订会议室</h1>
      <div className="max-w-md">
        <BookingForm rooms={rooms} defaultRoomId={defaultRoomId ?? undefined} defaultBookerName={user.name} />
      </div>
    </div>
  );
}
