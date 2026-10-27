// 初始数据：管理员账号 + 演示任务。运行：node prisma/seed.js
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  const admin = await prisma.user.upsert({
    where: { username: "admin" },
    update: {},
    create: {
      username: "admin",
      passwordHash: await bcrypt.hash("admin123", 10),
      role: "ADMIN",
      phone: "13800000000",
    },
  });

  await prisma.user.upsert({
    where: { username: "xiaoming" },
    update: {},
    create: {
      username: "xiaoming",
      passwordHash: await bcrypt.hash("123456", 10),
      role: "USER",
      phone: "13900000000",
    },
  });

  if ((await prisma.task.count()) === 0) {
    await prisma.task.create({
      data: {
        title: "周三 8:00 横店群演 20 名",
        content: "古装戏群演，管午饭，集合地点群里通知。先到先得，接单后群里对暗号。",
        points: 20,
        publisherId: admin.id,
      },
    });
  }

  console.log("种子数据完成：admin/admin123（管理员）、xiaoming/123456（普通用户）");
}

main().finally(() => prisma.$disconnect());
