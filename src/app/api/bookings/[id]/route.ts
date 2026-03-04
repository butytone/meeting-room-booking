import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: "未登录" }, { status: 401 });
  const { id } = await params;
  const body = await request.json().catch(() => ({}));
  if (body.status === "cancelled") {
    const booking = await prisma.booking.findUnique({ where: { id } });
    if (!booking) return NextResponse.json({ error: "预订不存在" }, { status: 404 });
    if (booking.userId !== user.id) {
      return NextResponse.json({ error: "只能取消自己的预订" }, { status: 403 });
    }
    await prisma.booking.update({
      where: { id },
      data: { status: "cancelled" },
    });
    return NextResponse.json({ ok: true });
  }
  return NextResponse.json({ error: "无效操作" }, { status: 400 });
}

/** 取消单条预订 或 取消周期性会议（删除该系列全部预订） */
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: "未登录" }, { status: 401 });
  const { id } = await params;
  const { searchParams } = new URL(request.url);
  const cancelSeries = searchParams.get("cancelSeries") === "true";

  const booking = await prisma.booking.findUnique({ where: { id } });
  if (!booking) return NextResponse.json({ error: "预订不存在" }, { status: 404 });
  if (booking.userId !== user.id) {
    return NextResponse.json({ error: "只能取消自己的预订" }, { status: 403 });
  }

  if (cancelSeries && booking.recurrenceGroupId) {
    const result = await prisma.booking.deleteMany({
      where: { recurrenceGroupId: booking.recurrenceGroupId, userId: user.id },
    });
    return NextResponse.json({ ok: true, deleted: result.count });
  }

  await prisma.booking.update({
    where: { id },
    data: { status: "cancelled" },
  });
  return NextResponse.json({ ok: true });
}
