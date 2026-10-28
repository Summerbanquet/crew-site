// 初始数据：管理员账号 + 示例任务。运行：node --env-file=.env prisma/seed.js
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();


// 示例任务：按标题查重，库里没有才插入（可重复运行）
const demoTasks = [
  {
    title: "周一 14:00 群演 4 名（巫师装扮）",
    content: "需要巫师装扮 4 名。\n群里接龙后才可接取。\n完成 +10 积分。",
    points: 10,
  },
  {
    title: "今晚 21:00 拍摄 2 名（指定装扮）+ 工具人 1 名",
    content: "两名指定装扮（详见群内说明），另需一名工具人。\n确认装扮后方可接取，先到先得。\n完成 +20 积分。",
    points: 20,
  },
  {
    title: "图文拍摄 2 名（周三晚 18:00）",
    content: "周三晚上 6 点，随意服装。\n需确认台词，群里接龙后接取。\n完成 +10 积分。",
    points: 10,
  },
];

// 商城示例商品
const demoItems = [
  { name: "小零食一份", icon: "🍪", description: "拍摄现场能量补给", cost: 15 },
  { name: "奶茶券一张", icon: "🧋", description: "指定奶茶店中杯任选", cost: 50 },
  { name: "剧组定制 T 恤", icon: "👕", description: "印剧组 Logo 的文化衫", cost: 100 },
  { name: "电影票一张", icon: "🎬", description: "全国通兑券", cost: 200 },
];

async function main() {
  const admin = await prisma.user.upsert({
    where: { username: "admin" },
    update: {},
    create: {
      username: "admin",
      passwordHash: await bcrypt.hash("admin123", 10),
      role: "ADMIN",
      wechat: "剧组群主",
    },
  });

  await prisma.user.upsert({
    where: { username: "xiaoming" },
    update: {},
    create: {
      username: "xiaoming",
      passwordHash: await bcrypt.hash("123456", 10),
      role: "ACTOR",
      wechat: "小明同学",
    },
  });

  let inserted = 0;
  for (const t of demoTasks) {
    const exists = await prisma.task.findFirst({ where: { title: t.title } });
    if (!exists) {
      await prisma.task.create({ data: { ...t, publisherId: admin.id } });
      inserted++;
    }
  }

    for (const it of demoItems) {
    const exists = await prisma.item.findFirst({ where: { name: it.name } });
    if (!exists) await prisma.item.create({ data: it });
  }

  console.log(
    `种子数据完成：admin/admin123、xiaoming/123456；本次新插入任务 ${inserted} 条`
  );
}

main().finally(() => prisma.$disconnect());
