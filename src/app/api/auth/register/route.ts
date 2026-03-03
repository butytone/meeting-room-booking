import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { workId, name, phone, password, namespaceId } = body as {
      workId?: string;
      name?: string;
      phone?: string;
      password?: string;
      namespaceId?: string;
    };
    const w = workId?.trim();
    const n = name?.trim();
    const p = phone?.trim();
    if (!w || !n || !password) {
      return NextResponse.json(
        { error: "请填写工号、姓名和密码" },
        { status: 400 }
      );
    }
    if (!namespaceId?.trim()) {
      return NextResponse.json(
        { error: "请选择所属学院" },
        { status: 400 }
      );
    }
    if (!p) {
      return NextResponse.json(
        { error: "请填写手机号" },
        { status: 400 }
      );
    }
    if (password.length < 6) {
      return NextResponse.json(
        { error: "密码至少 6 位" },
        { status: 400 }
      );
    }
    const existing = await prisma.user.findUnique({ where: { workId: w } });
    if (existing) {
      return NextResponse.json(
        { error: "该工号已注册" },
        { status: 409 }
      );
    }
    const ns = await prisma.namespace.findUnique({ where: { id: namespaceId.trim() } });
    if (!ns) {
      return NextResponse.json({ error: "所选学院不存在" }, { status: 400 });
    }
    const hash = await bcrypt.hash(password, 10);
    await prisma.user.create({
      data: {
        namespaceId: ns.id,
        workId: w,
        name: n,
        phone: p,
        password: hash,
      },
    });
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "注册失败" }, { status: 500 });
  }
}
