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
