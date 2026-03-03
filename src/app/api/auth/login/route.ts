import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { setSession } from "@/lib/auth";
import bcrypt from "bcryptjs";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { workId, password } = body as { workId?: string; password?: string };
    if (!workId || !password) {
      return NextResponse.json({ error: "请填写工号和密码" }, { status: 400 });
    }
    const user = await prisma.user.findUnique({
      where: { workId: workId.trim() },
      include: { namespace: { select: { name: true } } },
    });
    if (!user) {
      return NextResponse.json({ error: "工号或密码错误" }, { status: 401 });
    }
    const ok = await bcrypt.compare(password, user.password);
    if (!ok) {
      return NextResponse.json({ error: "工号或密码错误" }, { status: 401 });
    }
    await setSession({
      id: user.id,
      workId: user.workId,
      name: user.name,
      namespaceId: user.namespaceId,
      namespaceName: user.namespace?.name ?? null,
      role: user.role ?? "user",
    });
    return NextResponse.json({
      user: {
        id: user.id,
        workId: user.workId,
        name: user.name,
        namespaceName: user.namespace?.name ?? null,
        role: user.role ?? "user",
      },
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "登录失败" }, { status: 500 });
  }
}
