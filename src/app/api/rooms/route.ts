import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { hasConflict } from "@/lib/time";

export async function GET(request: Request) {
  const user = await getSession();
  if (!user?.namespaceId) {
    return NextResponse.json({ error: "未登录或未归属学院" }, { status: 401 });
  }
  const { searchParams } = new URL(request.url);
  const activeOnly = searchParams.get("active") !== "false";
  const date = searchParams.get("date");
  const startTime = searchParams.get("startTime");
  const endTime = searchParams.get("endTime");

  const forAdmin = searchParams.get("admin") === "true" && user.role === "admin";
  const rooms = await prisma.room.findMany({
    where: {
      namespaceId: user.namespaceId,
      ...(activeOnly && !forAdmin ? { isActive: true } : {}),
    },
    orderBy: { name: "asc" },
    select: forAdmin
      ? { id: true, name: true, capacity: true, facilities: true, description: true, photoUrls: true, isActive: true }
      : { id: true, name: true },
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

/** 管理员：新增会议室 */
export async function POST(request: Request) {
  const user = await getSession();
  if (!user?.namespaceId) {
    return NextResponse.json({ error: "未登录或未归属学院" }, { status: 401 });
  }
  if (user.role !== "admin") {
    return NextResponse.json({ error: "仅管理员可添加会议室" }, { status: 403 });
  }
  try {
    const body = await request.json();
    const { name, capacity, facilities, description, photoUrls, isActive } = body as {
      name?: string;
      capacity?: number;
      facilities?: string;
      description?: string;
      photoUrls?: string;
      isActive?: boolean;
    };
    if (!name?.trim()) {
      return NextResponse.json({ error: "请填写会议室名称" }, { status: 400 });
    }
    const capacityNum = capacity != null ? Number(capacity) : 10;
    if (Number.isNaN(capacityNum) || capacityNum < 1) {
      return NextResponse.json({ error: "容量须为正整数" }, { status: 400 });
    }
    const room = await prisma.room.create({
      data: {
        namespaceId: user.namespaceId,
        name: name.trim(),
        capacity: capacityNum,
        facilities: (facilities ?? "").trim() || "—",
        description: description?.trim() || null,
        photoUrls: photoUrls?.trim() || null,
        isActive: isActive !== false,
      },
    });
    return NextResponse.json(room);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "添加失败" }, { status: 500 });
  }
}
