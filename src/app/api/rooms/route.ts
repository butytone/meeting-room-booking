import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hasConflict } from "@/lib/time";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const activeOnly = searchParams.get("active") !== "false";
  const date = searchParams.get("date");
  const startTime = searchParams.get("startTime");
  const endTime = searchParams.get("endTime");

  const rooms = await prisma.room.findMany({
    where: activeOnly ? { isActive: true } : undefined,
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });

  // 按时间段查询：返回每间会议室在该时段是否可预订
  if (date && startTime && endTime && endTime > startTime) {
    const availability = await Promise.all(
      rooms.map(async (room) => {
        const bookings = await prisma.booking.findMany({
          where: { roomId: room.id, date, status: "confirmed" },
          select: { startTime: true, endTime: true },
        });
        const available = !hasConflict(startTime, endTime, bookings);
        return { ...room, available };
      })
    );
    return NextResponse.json(availability);
  }

  return NextResponse.json(rooms);
}
