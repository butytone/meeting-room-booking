import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

/** 所有用户可修改自己的密码 */
export async function POST(request: Request) {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: "未登录" }, { status: 401 });
  try {
    const body = await request.json();
    const { oldPassword, newPassword } = body as { oldPassword?: string; newPassword?: string };
    if (!oldPassword || !newPassword) {
      return NextResponse.json({ error: "请填写原密码和新密码" }, { status: 400 });
    }
    if (newPassword.length < 6) {
      return NextResponse.json({ error: "新密码至少 6 位" }, { status: 400 });
    }
    const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
    if (!dbUser) return NextResponse.json({ error: "用户不存在" }, { status: 404 });
    const ok = await bcrypt.compare(oldPassword, dbUser.password);
    if (!ok) return NextResponse.json({ error: "原密码错误" }, { status: 400 });
    const hash = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hash },
    });
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "修改失败" }, { status: 500 });
  }
}
