<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify it at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## 剧组小站：项目说明

> 需求全貌、部署路线、已定决策、踩坑记录见 `PROJECT.md`（新对话给 AI 看它就够了）。

剧组统计 + 任务接单 MVP。技术栈：Next.js 16（App Router + Tailwind）+ Prisma + SQLite。

### 常用命令

- 启动开发：`npm run dev`（predev 钩子会自动清 .next 防缓存崩坏，启动多花几秒属正常）→ http://localhost:3000
- 改了表结构：改 `prisma/schema.prisma` → **先停 dev 服务器** → `npx prisma migrate dev --name 变更名`
- 灌种子数据：`node --env-file=.env prisma/seed.js`（按名称查重，可重复跑）
- 看数据库：VS Code 的 SQLite Viewer 点开 `prisma/dev.db`，或 `npx prisma studio`（网页版，可改数据）

### 代码结构

- `prisma/schema.prisma`：六张表 User / Task / TaskClaim / PointLog / Item / RedeemLog；User.role 三级（ACTOR 普通演员只接单 / SHOOTER 拍摄可发布 / ADMIN 均可），User.wechat 为微信群昵称（选填资料）
- `src/lib/`：db.ts（Prisma 单例）、auth.ts（Cookie + JWT 会话；getSessionUser 每次请求现查数据库，改身份即时生效）
- `src/app/api/`：register（含角色白名单，ADMIN 不可注册）/ login / logout / me / tasks（GET 列表，POST 发布限 SHOOTER+ADMIN）/ tasks/[id]（GET 详情）/ tasks/[id]/claim（接单，登录即可）/ claims/[id]/confirm（确认+积分到账）/ items（GET 商品，?all=1 管理端看全部限 ADMIN；POST 新增限 ADMIN）/ items/[id]（PUT 编辑/上下架限 ADMIN）/ redeem（POST 兑换）
- `src/app/`：page.tsx 任务大厅（标题可点进详情）、tasks/[id] 任务详情、login/register（注册自选身份）、profile（积分+任务两板块+身份徽章）、tasks/new 发布、mall 积分商城、mall/manage 商品管理（仅 ADMIN）
- `layout.tsx`：含 `export const instant = false`（必须保留，删了链接跳转会坏，见 PROJECT.md 坑）
- `scripts/clean-next.mjs`：predev 钩子，每次 dev 前清 .next（防渲染进程崩坏，别删）

### 业务流程

发布（SHOOTER/ADMIN）→ 用户在大厅或详情页接单（任务变"待确认"，不能接自己发的）→ 发单人/管理员在个人主页点确认 → 任务完成、接单人积分自动到账并记流水 → 商城兑换。

### 测试账号

- admin / admin123（管理员：能发布任务、进 /mall/manage 商品管理）
- xiaoming / 123456（普通演员）

### 注意

- `.env` 的 SESSION_SECRET 与 `prisma/dev.db` 不提交公开仓库
- 环境要求 Node 20+（seed 用了 --env-file）
- 更多踩坑记录（instant=false、.next 崩坏急救等）见 `PROJECT.md` 的"坑与注意事项"
