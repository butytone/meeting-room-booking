import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import BookingGroupRow from "./BookingGroupRow";

export default async function MyBookingsPage() {
  const user = await getSession();
  if (!user) redirect("/login");

  const allBookings = await prisma.booking.findMany({
    where: { userId: user.id, status: "confirmed" },
    include: { room: true },
    orderBy: [{ date: "asc" }, { startTime: "asc" }],
  });

  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  const today = `${y}-${m}-${d}`;
  const currentTime = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
  const bookings = allBookings.filter(
    (b) => b.date > today || (b.date === today && b.endTime > currentTime)
  );

  const groups: { key: string; isSeries: boolean; first: (typeof bookings)[0]; count: number }[] = [];
  const seenGroupIds = new Set<string>();
  for (const b of bookings) {
    if (b.recurrenceGroupId) {
      if (!seenGroupIds.has(b.recurrenceGroupId)) {
        seenGroupIds.add(b.recurrenceGroupId);
        const sameGroup = bookings.filter((x) => x.recurrenceGroupId === b.recurrenceGroupId);
        groups.push({ key: b.recurrenceGroupId, isSeries: true, first: sameGroup[0], count: sameGroup.length });
      }
    } else {
      groups.push({ key: b.id, isSeries: false, first: b, count: 1 });
    }
  }

  return (
    <div>
      <h1 className="mb-6 text-xl font-semibold">我的预订</h1>
      <div className="space-y-3">
        {groups.map((g) => (
          <BookingGroupRow
            key={g.key}
            isSeries={g.isSeries}
            first={g.first}
            count={g.count}
          />
        ))}
      </div>
      {groups.length === 0 && (
        <p className="text-gray-500">暂无预订。</p>
      )}
    </div>
  );
}
