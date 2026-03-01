import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const room = await prisma.room.findUnique({ where: { id } });
  if (!room) return NextResponse.json({ error: "会议室不存在" }, { status: 404 });
  return NextResponse.json(room);
}
