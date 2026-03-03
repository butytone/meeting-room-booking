import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

/** 管理员：获取本学院用户列表（工号、姓名，不包含手机号） */
export async function GET() {
  const user = await getSession();
  if (!user?.namespaceId) {
    return NextResponse.json({ error: "未登录或未归属学院" }, { status: 401 });
  }
  if (user.role !== "admin") {
    return NextResponse.json({ error: "仅管理员可查看" }, { status: 403 });
  }
  const list = await prisma.user.findMany({
    where: { namespaceId: user.namespaceId },
    orderBy: { workId: "asc" },
    select: { id: true, workId: true, name: true },
  });
  return NextResponse.json(list);
}

/** 管理员：新增本学院用户 */
export async function POST(request: Request) {
  const user = await getSession();
  if (!user?.namespaceId) {
    return NextResponse.json({ error: "未登录或未归属学院" }, { status: 401 });
  }
  if (user.role !== "admin") {
    return NextResponse.json({ error: "仅管理员可添加用户" }, { status: 403 });
  }
  try {
    const body = await request.json();
    const { workId, name, password } = body as {
      workId?: string;
      name?: string;
      password?: string;
    };
    const w = workId?.trim();
    const n = name?.trim();
    if (!w || !n || !password) {
      return NextResponse.json(
        { error: "请填写工号、姓名和初始密码" },
        { status: 400 }
      );
    }
    if (password.length < 6) {
      return NextResponse.json({ error: "密码至少 6 位" }, { status: 400 });
    }
    const existing = await prisma.user.findUnique({ where: { workId: w } });
    if (existing) {
      return NextResponse.json({ error: "该工号已存在" }, { status: 409 });
    }
    const hash = await bcrypt.hash(password, 10);
    await prisma.user.create({
      data: {
        namespaceId: user.namespaceId,
        workId: w,
        name: n,
        password: hash,
        role: "user",
      },
    });
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "添加失败" }, { status: 500 });
  }
}
