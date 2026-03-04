import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { hasConflict } from "@/lib/time";
import { getRecurrenceDates } from "@/lib/recurrence";
import { randomBytes } from "crypto";

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
    const room = await prisma.room.findUnique({
      where: { id: roomId },
      select: { namespaceId: true },
    });
    if (!room || room.namespaceId !== user.namespaceId) {
      return NextResponse.json({ error: "无权查看该会议室" }, { status: 403 });
    }
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
    const { roomId, date, startTime, endTime, bookerName, purpose, recurrenceRule, recurrenceEndDate } = body as {
      roomId?: string;
      date?: string;
      startTime?: string;
      endTime?: string;
      bookerName?: string;
      purpose?: string;
      recurrenceRule?: string;
      recurrenceEndDate?: string;
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
    if (room.namespaceId !== user.namespaceId) {
      return NextResponse.json({ error: "无权预订该会议室" }, { status: 403 });
    }

    const validRules = ["daily", "weekdays", "weekly", "biweekly"];
    const isRecurring = recurrenceRule && validRules.includes(recurrenceRule) && recurrenceEndDate;
    if (isRecurring && recurrenceEndDate < date) {
      return NextResponse.json({ error: "结束重复日期不能早于开始日期" }, { status: 400 });
    }

    const datesToBook: string[] = isRecurring
      ? getRecurrenceDates(date, recurrenceRule!, recurrenceEndDate!)
      : [date];

    for (const d of datesToBook) {
      const existing = await prisma.booking.findMany({
        where: { roomId, date: d, status: "confirmed" },
        select: { startTime: true, endTime: true },
      });
      if (hasConflict(startTime, endTime, existing)) {
        return NextResponse.json(
          { error: `日期 ${d} 该时段已被预订，请更换时间或结束重复日期` },
          { status: 409 }
        );
      }
    }

    const groupId = isRecurring ? randomBytes(12).toString("hex") : null;

    const created = await prisma.$transaction(
      datesToBook.map((d) =>
        prisma.booking.create({
          data: {
            userId: user.id,
            roomId,
            date: d,
            startTime,
            endTime,
            bookerName: name,
            purpose: purpose ?? null,
            recurrenceGroupId: groupId,
            recurrenceRule: isRecurring ? recurrenceRule! : null,
            recurrenceEndDate: isRecurring ? recurrenceEndDate! : null,
          },
          include: { room: true },
        })
      )
    );

    return NextResponse.json(isRecurring ? { recurring: true, count: created.length, first: created[0] } : created[0]);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "预订失败" }, { status: 500 });
  }
}
