import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getSession();
  if (!user?.namespaceId) {
    return NextResponse.json({ error: "未登录或未归属学院" }, { status: 401 });
  }
  const { id } = await params;
  const room = await prisma.room.findUnique({ where: { id } });
  if (!room) return NextResponse.json({ error: "会议室不存在" }, { status: 404 });
  if (room.namespaceId !== user.namespaceId) {
    return NextResponse.json({ error: "无权查看该会议室" }, { status: 403 });
  }
  return NextResponse.json(room);
}

/** 管理员：更新会议室 */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getSession();
  if (!user?.namespaceId) {
    return NextResponse.json({ error: "未登录或未归属学院" }, { status: 401 });
  }
  if (user.role !== "admin") {
    return NextResponse.json({ error: "仅管理员可修改会议室" }, { status: 403 });
  }
  const { id } = await params;
  const room = await prisma.room.findUnique({ where: { id } });
  if (!room) return NextResponse.json({ error: "会议室不存在" }, { status: 404 });
  if (room.namespaceId !== user.namespaceId) {
    return NextResponse.json({ error: "无权操作该会议室" }, { status: 403 });
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
    const data: {
      name?: string;
      capacity?: number;
      facilities?: string;
      description?: string | null;
      photoUrls?: string | null;
      isActive?: boolean;
    } = {};
    if (name !== undefined) data.name = String(name).trim();
    if (capacity !== undefined) {
      const n = Number(capacity);
      if (Number.isNaN(n) || n < 1) {
        return NextResponse.json({ error: "容量须为正整数" }, { status: 400 });
      }
      data.capacity = n;
    }
    if (facilities !== undefined) data.facilities = String(facilities).trim() || "—";
    if (description !== undefined) data.description = description ? String(description).trim() : null;
    if (photoUrls !== undefined) data.photoUrls = photoUrls ? String(photoUrls).trim() : null;
    if (isActive !== undefined) data.isActive = Boolean(isActive);
    const updated = await prisma.room.update({
      where: { id },
      data,
    });
    return NextResponse.json(updated);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "更新失败" }, { status: 500 });
  }
}

/** 管理员：删除会议室（同时删除该会议室下所有预订记录，需前端确认） */
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getSession();
  if (!user?.namespaceId) {
    return NextResponse.json({ error: "未登录或未归属学院" }, { status: 401 });
  }
  if (user.role !== "admin") {
    return NextResponse.json({ error: "仅管理员可删除会议室" }, { status: 403 });
  }
  const { id } = await params;
  const room = await prisma.room.findUnique({ where: { id } });
  if (!room) return NextResponse.json({ error: "会议室不存在" }, { status: 404 });
  if (room.namespaceId !== user.namespaceId) {
    return NextResponse.json({ error: "无权操作该会议室" }, { status: 403 });
  }
  try {
    await prisma.room.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "删除失败" }, { status: 500 });
  }
}
