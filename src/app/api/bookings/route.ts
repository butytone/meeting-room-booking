import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { hasConflict } from "@/lib/time";

export async function GET(request: Request) {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: "未登录" }, { status: 401 });
  const { searchParams } = new URL(request.url);
  const mine = searchParams.get("mine") === "true";
  if (mine) {
    const list = await prisma.booking.findMany({
      where: { userId: user.id, status: "confirmed" },
      include: { room: true },
      orderBy: [{ date: "asc" }, { startTime: "asc" }],
    });
    return NextResponse.json(list);
  }
  const roomId = searchParams.get("roomId");
  const date = searchParams.get("date");
  if (roomId && date) {
    const existing = await prisma.booking.findMany({
      where: { roomId, date, status: "confirmed" },
      select: {
        startTime: true,
        endTime: true,
        purpose: true,
        bookerName: true,
        user: { select: { name: true } },
      },
    });
    return NextResponse.json(
      existing.map((b) => ({
        startTime: b.startTime,
        endTime: b.endTime,
        purpose: b.purpose,
        userName: (b.bookerName && b.bookerName.trim()) ? b.bookerName.trim() : "",
      }))
    );
  }
  return NextResponse.json({ error: "缺少 roomId 或 date" }, { status: 400 });
}

export async function POST(request: Request) {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: "未登录" }, { status: 401 });
  try {
    const body = await request.json();
    const { roomId, date, startTime, endTime, bookerName, purpose } = body as {
      roomId?: string;
      date?: string;
      startTime?: string;
      endTime?: string;
      bookerName?: string;
      purpose?: string;
    };
    if (!roomId || !date || !startTime || !endTime) {
      return NextResponse.json(
        { error: "请填写会议室、日期、开始时间、结束时间" },
        { status: 400 }
      );
    }
    if (endTime <= startTime) {
      return NextResponse.json(
        { error: "结束时间必须晚于开始时间" },
        { status: 400 }
      );
    }
    const name = bookerName?.trim();
    if (!name) {
      return NextResponse.json(
        { error: "预订人不能为空" },
        { status: 400 }
      );
    }
    const room = await prisma.room.findUnique({ where: { id: roomId } });
    if (!room || !room.isActive) {
      return NextResponse.json({ error: "会议室不存在或已停用" }, { status: 400 });
    }
    const existing = await prisma.booking.findMany({
      where: { roomId, date, status: "confirmed" },
      select: { startTime: true, endTime: true },
    });
    if (hasConflict(startTime, endTime, existing)) {
      return NextResponse.json({ error: "该时间段已被预订，请另选时间" }, { status: 409 });
    }
    const booking = await prisma.booking.create({
      data: {
        userId: user.id,
        roomId,
        date,
        startTime,
        endTime,
        bookerName: name,
        purpose: purpose ?? null,
      },
      include: { room: true },
    });
    return NextResponse.json(booking);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "预订失败" }, { status: 500 });
  }
}
