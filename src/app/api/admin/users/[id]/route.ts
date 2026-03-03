import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/** 管理员：删除本学院用户（不能删除自己） */
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getSession();
  if (!user?.namespaceId) {
    return NextResponse.json({ error: "未登录或未归属学院" }, { status: 401 });
  }
  if (user.role !== "admin") {
    return NextResponse.json({ error: "仅管理员可删除用户" }, { status: 403 });
  }
  const { id } = await params;
  if (id === user.id) {
    return NextResponse.json({ error: "不能删除当前登录的管理员账号" }, { status: 400 });
  }
  const target = await prisma.user.findUnique({ where: { id } });
  if (!target) {
    return NextResponse.json({ error: "用户不存在" }, { status: 404 });
  }
  if (target.namespaceId !== user.namespaceId) {
    return NextResponse.json({ error: "只能删除本学院用户" }, { status: 403 });
  }
  try {
    // 先删除该用户的所有预订记录，再删除用户
    await prisma.booking.deleteMany({ where: { userId: id } });
    await prisma.user.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "删除失败" }, { status: 500 });
  }
}
