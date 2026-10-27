<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## 剧组小站：项目说明

> 需求全貌、部署路线、已定决策见 `PROJECT.md`（新对话给 AI 看它就够了）。

剧组统计 + 任务接单 MVP。技术栈：Next.js 16（App Router + Tailwind）+ Prisma + SQLite。

### 常用命令

- 启动开发：`npm run dev`（http://localhost:3000）
- 改了表结构：改 `prisma/schema.prisma` 后跑 `npx prisma migrate dev --name 变更名`
- 灌种子数据：`node --env-file=.env prisma/seed.js`
- 看数据库：VS Code 装 SQLite Viewer 扩展，点开 `prisma/dev.db`

### 代码结构

- `prisma/schema.prisma`：四张表 User / Task / TaskClaim / PointLog
- `src/lib/`：db.ts（Prisma 单例）、auth.ts（Cookie + JWT 会话）
- `src/app/api/`：register、login、logout、me、tasks（GET 列表 / POST 发布）、tasks/[id]/claim（接单）、claims/[id]/confirm（确认+积分到账）
- `src/app/`：page.tsx 任务大厅、login/register、profile（积分+任务两板块）、tasks/new 发布

### 业务流程

发布（仅 ADMIN）→ 用户在大厅点接单（任务变"待确认"）→ 发单人/管理员在个人主页点确认 → 任务完成、接单人积分自动到账并记流水。

### 测试账号

- admin / admin123（管理员，能发布任务）
- xiaoming / 123456（普通用户）

### 注意

- `.env` 里的 SESSION_SECRET 是登录密钥，不要提交到公开仓库；SQLite 库 `prisma/dev.db` 同理。
- 环境要求 Node 20+（seed 用了 --env-file）。
