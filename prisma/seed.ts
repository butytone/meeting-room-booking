import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const hash = await bcrypt.hash("123456", 10);
  const user = await prisma.user.upsert({
    where: { workId: "10001" },
    update: {},
    create: {
      workId: "10001",
      password: hash,
      name: "张老师",
      email: "zhang@example.edu.cn",
    },
  });
  console.log("Seed user:", user.workId, user.name);

  const existingRooms = await prisma.room.count();
  if (existingRooms === 0) {
    await prisma.room.createMany({
      data: [
        { name: "第一会议室", capacity: 20, facilities: "投影仪,白板,视频会议" },
        { name: "第二会议室", capacity: 8, facilities: "白板,电视" },
        { name: "阶梯教室", capacity: 60, facilities: "投影仪,音响,麦克风" },
      ],
    });
    console.log("Seed rooms: 3 间");
  }
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
