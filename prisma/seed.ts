import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // 确保有学院（namespace）
  const defaultNs = await prisma.namespace.upsert({
    where: { slug: "default" },
    update: { name: "测试学院" },
    create: { name: "测试学院", slug: "default" },
  });
  const computerNs = await prisma.namespace.upsert({
    where: { slug: "computer" },
    update: { name: "统计与数据科学学院" },
    create: { name: "统计与数据科学学院", slug: "computer" },
  });
  console.log("Seed namespaces: 测试学院, 统计与数据科学学院");

  // 回填：没有 namespaceId 的用户和会议室归到默认学院
  const updatedUsers = await prisma.user.updateMany({
    where: { namespaceId: null },
    data: { namespaceId: defaultNs.id },
  });
  const updatedRooms = await prisma.room.updateMany({
    where: { namespaceId: null },
    data: { namespaceId: defaultNs.id },
  });
  if (updatedUsers.count > 0 || updatedRooms.count > 0) {
    console.log("Backfill: users", updatedUsers.count, "rooms", updatedRooms.count, "-> default namespace");
  }

  const hash = await bcrypt.hash("123456", 10);
  const user = await prisma.user.upsert({
    where: { workId: "10001" },
    update: {},
    create: {
      namespaceId: defaultNs.id,
      workId: "10001",
      password: hash,
      name: "张老师",
      email: "zhang@example.edu.cn",
    },
  });
  console.log("Seed user:", user.workId, user.name, "namespace:", defaultNs.name);

  const existingRooms = await prisma.room.count({ where: { namespaceId: defaultNs.id } });
  if (existingRooms === 0) {
    await prisma.room.createMany({
      data: [
        { namespaceId: defaultNs.id, name: "第一会议室", capacity: 20, facilities: "投影仪,白板,视频会议" },
        { namespaceId: defaultNs.id, name: "第二会议室", capacity: 8, facilities: "白板,电视" },
        { namespaceId: defaultNs.id, name: "阶梯教室", capacity: 60, facilities: "投影仪,音响,麦克风" },
      ],
    });
    console.log("Seed rooms: 3 间 (测试学院)");
  }

  const computerRoomsCount = await prisma.room.count({ where: { namespaceId: computerNs.id } });
  if (computerRoomsCount === 0) {
    await prisma.room.createMany({
      data: [
        { namespaceId: computerNs.id, name: "机房A", capacity: 40, facilities: "投影仪,电脑" },
        { namespaceId: computerNs.id, name: "研讨室", capacity: 10, facilities: "白板,电视" },
      ],
    });
    console.log("Seed rooms: 2 间 (统计与数据科学学院)");
  }
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
