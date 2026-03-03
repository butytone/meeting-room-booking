import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/** 获取所有学院列表（注册时选择学院用，无需登录） */
export async function GET() {
  const list = await prisma.namespace.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true, slug: true },
  });
  return NextResponse.json(list);
}
