import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import CancelBookingButton from "./CancelBookingButton";

export default async function MyBookingsPage() {
  const user = await getSession();
  if (!user) redirect("/login");

  const bookings = await prisma.booking.findMany({
    where: { userId: user.id, status: "confirmed" },
    include: { room: true },
    orderBy: [{ date: "asc" }, { startTime: "asc" }],
  });

  return (
    <div>
      <h1 className="mb-6 text-xl font-semibold">我的预订</h1>
      <div className="space-y-3">
        {bookings.map((b) => (
          <div
            key={b.id}
            className="flex flex-wrap items-center justify-between gap-2 rounded-lg border bg-white p-4 shadow-sm"
          >
            <div>
              <p className="font-medium">{b.room.name}</p>
              <p className="text-sm text-gray-600">
                {b.date} {b.startTime}–{b.endTime}
              </p>
              {b.purpose && (
                <p className="text-sm text-gray-500">{b.purpose}</p>
              )}
            </div>
            <CancelBookingButton bookingId={b.id} />
          </div>
        ))}
      </div>
      {bookings.length === 0 && (
        <p className="text-gray-500">暂无预订。</p>
      )}
    </div>
  );
}
