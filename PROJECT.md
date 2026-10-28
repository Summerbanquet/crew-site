# 剧组小站 · 项目框架（新对话给 AI 看这份就够了）

> 用法：开新对话时把本文件全文粘贴给 AI，或让它直接读取 `C:\Users\xiaya\Desktop\剧组网站\crew-site\PROJECT.md`。

## 一句话项目

为剧组人群搭建的国内网站：**任务发布 → 群内沟通 → 网站多人接取 → 发单人挑选完成人 → 积分到账 → 商城兑换** 的闭环，后续叠加陪玩点单。找人靠微信群，网站只做登记、挑选、积分。

## 我（老大）的情况与角色

- 个人身份起步、无企业主体；主要自己在 VS Code 里写代码，AI 负责：教我操作步骤 / 我明确说"你来"时代我改
- 用户主要在国内 → 域名实名 + ICP 备案 + 国内服务器路线
- GitHub 账号：**Summerbanquet**，本机已装 GitHub CLI 且已登录（装在 `C:\Program Files\GitHub CLI`，命令 `gh`）
- 本机环境：Windows，Node 24 / npm 11 / Git / VS Code（含 ESLint、Prettier、Tailwind、SQLite Viewer 扩展）；npm 源已换 npmmirror；PowerShell 执行策略已放宽为 CurrentUser RemoteSigned
- 本机有代理跑在 `127.0.0.1:7897`，访问 GitHub 时挂上、用完即清

## 已实现功能（本地全部跑通）

1. **用户系统**：账号密码注册登录（bcrypt 哈希 + JWT Cookie 会话），微信群昵称仅作资料不验证；三种角色——ACTOR 普通演员（只接单）/ SHOOTER 拍摄（发布+接单）/ ADMIN 管理员（均可），注册时自选"普通演员/拍摄"，管理员不开放注册；登录后导航栏右上角显示头像（用户名首字圆形）+ 用户名，点击进个人主页，未登录显示登录/注册；个人主页有管理员/拍摄身份徽章
2. **任务闭环（多人接取 + 选人模式）**：发布（标题/详情/积分/**人数必填**/截止时间选填）→ 大厅展示（招募中/已完成/已取消，实时显示"N 人已接"、"招 N 人"徽章）→ 登录用户点【接单】报名（可多人同时接取，不能接自己发的、不能重复接）→ 发布人（拍摄/管理员）在**任务大厅卡片 / 任务详情页 / 个人主页**三处看到接单者列表，点绿色【选 TA 完成（+N 分）】选中一人 → 任务完成：被选中者积分自动 +N 记流水（事务保证）、其余接取者自动落选；任务标题可点击进详情页（状态/详情/发布人/接单者列表/接单按钮）
3. **个人主页**：积分板块（总分+流水明细）；任务板块（我发布的——待确认列表+确认按钮 / 我接的——状态展示）
4. **积分商城**（老大亲手按教程完成）：商品表 + 兑换记录表；`/mall` 页面展示商品（emoji 图标+积分价）；【兑换】走事务——校验积分→扣分→记流水→写兑换记录；成功/失败（含"积分不足"）都有提示；**商品管理**：管理员专属 /mall/manage 页面——新增商品、编辑（名称/图标/描述/积分价）、上架/下架（不删商品以保兑换记录），商城页右上角有仅管理员可见的入口；**兑换记录管理**：同页下方——谁/何时/兑什么/发货状态列表，一键【标记已发货】（PENDING→DONE）
5. **消息中心 + 顶部弹窗提醒**：导航栏头像左侧铃铛，未读红点角标（数字，99+ 截断）；五类站内消息——CLAIM 有人接取（发发布人，含当前人数）/ CLAIMED 接取成功（发接取人）/ CONFIRMED 被选中积分到账 / REJECTED 未被选中（落选，红点）/ REDEEM 兑换扣分；通知写入与业务同事务；新消息到达时页面顶部弹白卡片提醒，悬停 4 秒朝铃铛方向收缩消失，可手动拖拽划走（拖过 70px 飞出、不足弹回恢复计时）；**点开面板停留满 3 秒自动标记已读消除红点，不足 3 秒关闭不计**；未登录无铃铛；30 秒轮询 + 窗口聚焦 + 操作成功事件三种刷新时机；首次打开只亮红点不补弹历史
6. **操作日志（管理员）**：新表 OperationLog（弱关联，用户注销后日志保留）；十类动作全记录——注册/登录/退出/发布任务/接取/选人完成/兑换/新增商品/编辑上下架/标记发货，成功失败都记（登录失败含尝试的用户名），带时间/IP（本地 ::1，生产走 Nginx 后记真实 IP）；管理员专属 `/admin/logs` 分页查看 + 按用户名/动作筛选，导航入口在**头像右侧**（仅管理员可见）；日志写失败不影响业务
7. **发布校验**：任务标题/要求/积分/人数必填（前端 required+min+红字提示，后端 400 拦截），截止时间选填
8. **界面**：白底黑字浅色主题（锁定 light 模式，不跟随系统深色）；主要按钮为白底黑边样式
8. 现有示例数据：任务大厅 3 条示例任务（周一14点巫师装扮群演/今晚9点指定装扮拍摄+工具人/周三晚6点图文拍摄）；商城 4 件商品（小零食15分/奶茶券50分/定制T恤100分/电影票200分）

## 后续待做（按优先级，均未开始）

- 剧组统计增强：报名名单导出（Excel）、按任务导出微信群昵称
- 任务补充：取消任务、编辑任务、积分排行榜、兑换限一人一次（现在同一商品可重复兑换）
- 陪玩点单板块：订单形态，**平台不经手资金**（展示+下单登记，钱私下结算）
- 短信验证码登录：等备案下来用已备案域名申请签名（约 0.045 元/条）
- 微信登录 / 微信支付宝支付：需先注册个体户/公司，个人主体做不了，远期再说

## 技术栈与项目现状

- **栈**：Next.js 16（App Router + TypeScript + Tailwind）+ Prisma 6.19（锁定 6.x）+ SQLite
- **项目位置**：`C:\Users\xiaya\Desktop\剧组网站\crew-site`（长期开发目录）
- **GitHub 仓库**：https://github.com/Summerbanquet/crew-site （公开，master 分支；本地与远程同步，2026-10-28 五次功能推送：96e600b 商城/角色 MVP、c724083 消息中心+弹窗+校验+登录修复、01cace4 多人接取+选人模式、1028459 操作日志+兑换管理+任务人数+自动已读；.env / dev.db / node_modules 已确认不在仓库里）
- **数据库八张表**：User / Task / TaskClaim / PointLog / Item / RedeemLog / Notification / OperationLog（schema 在 `prisma/schema.prisma`，库文件 `prisma/dev.db`）
- **API**：register / login / logout / me / tasks(GET列表,POST发布·校验标题要求积分人数必填) / tasks/[id](GET详情) / tasks/[id]/claim / claims/[id]/confirm(选中一人) / items(GET商品,?all=1管理端全部,POST新增) / items/[id](PUT编辑/上下架) / redeem(POST兑换) / notifications(GET消息列表+未读数,POST全部已读) / admin/logs(GET操作日志,分页筛选) / admin/redeems(GET兑换记录) / redeems/[id](PUT标记发货)
- **页面**：/ 任务大厅、/tasks/[id] 任务详情、/login、/register、/profile、/tasks/new、/mall、/mall/manage 商品管理（仅 ADMIN）
- **测试账号**：admin / admin123（管理员）；xiaoming / 123456（普通演员；积分以数据库为准）
- 代码结构、常用命令详见同目录 `AGENTS.md`

## 常用命令（都在项目目录跑）

- 启动开发：`npm run dev` → http://localhost:3000；predev 钩子会自动清 .next 冷启动（防崩，见"坑"），启动多花几秒属正常；页面左下角的浮标是 Next.js 开发指示器，上线后消失，与权限无关
- 改了表结构：改 `prisma/schema.prisma` → **先停掉 dev 服务器（终端 Ctrl+C）** → `npx prisma migrate dev --name 变更名`
- 灌示例数据：`node --env-file=.env prisma/seed.js`（seed 里任务/商品都按名称查重，可重复跑）
- 推代码到 GitHub：`git add -A` → `git commit -m "说明"` → 前面挂 `HTTPS_PROXY=http://127.0.0.1:7897` 跑 `git push`（或用已登录的 `gh`）

## 部署路线（已定，未执行）

1. 腾讯云：轻量应用服务器 2核2G4M，约 99 元/年（选**续费不涨价**那档），Ubuntu 22.04，地域北京/上海/广州（**不选香港**）
2. 域名腾讯云注册（.com）→ 域名实名（1~3 天）→ 提交 **ICP 备案**（个人，1~4 周），备案号挂网站底部
3. 备案下来：域名解析 → 服务器上 clone GitHub 仓库 → Nginx 反代 → HTTPS 免费证书 → 上线
4. 升级路线：SQLite → MySQL；个人备案**不能经营**，陪玩资金一律私下结算不经平台

## 已定关键决策（新对话请遵守，不要推翻）

- 登录起步只用账号密码，不买短信、不做微信登录
- 平台不经手任何资金；积分只做展示兑换，暂无消费闭环之外的功能
- 发布任务权限给 SHOOTER（拍摄）和 ADMIN，普通演员只接单（注册时自选身份，接口有白名单防伪造）；商城商品第一版无库存、无单人限购，发货线下处理（RedeemLog.status 手动改）
- SQLite 起步，部署时可平滑换 MySQL，不要一上来就上重架构
- 界面保持白底黑字浅色主题，不要改回深色或高饱和色

## 更新日志（2026-10-27 ~ 10-28，AI 协作会话）

- 操作日志上线（add_operation_log 迁移）：OperationLog 表（弱关联）；lib/oplog.ts 助手（失败吞错不影响业务）；十类动作在八个接口埋点，成功/失败/带 IP；/admin/logs 管理页（分页 50 条/页、按用户名/动作筛选），导航入口在头像右侧仅管理员可见
- 兑换记录管理：/mall/manage 下方兑换列表 + 标记已发货（PUT /api/redeems/[id]）——待办"商城管理（剩余）"完成
- 任务人数：Task.headcount（add_task_headcount 迁移，默认 1）发布必填正整数；大厅/详情"招 N 人"徽章；旧任务默认 1
- 消息自动已读：点开铃铛面板满 3 秒自动 POST 全部已读消除红点；不足 3 秒关闭面板则取消计时
- 任务模型重构（multi_claim_select 迁移）：单人抢单改**多人接取 + 发布人选人**；TaskClaim 去 taskId 唯一约束、Task.claim→claims；任务状态只剩 OPEN/DONE/CANCELLED，接取记录 PENDING 待选/CONFIRMED 被选中/REJECTED 落选；旧"待确认"任务已自动转招募中、原接取记录可直接选人；选人接口 = 原 confirm 接口（事务：选中+落选+任务完成+加分+双方通知）
- 大厅/详情页/个人主页：发布人视角内嵌接单者列表+「选 TA 完成」按钮；接取者视角"待发布人选择/被选中/未被选中"三态
- 消息中心 + 顶部弹窗：Notification 表；接取/选人/兑换事务内写通知；导航栏铃铛（红点数字角标，下拉看最近 30 条 + 全部已读）；新消息顶部弹卡片 4 秒自动朝铃铛收缩，支持拖拽划走（70px 阈值，拖动中暂停计时）；商城兑换的 alert 已移除
- 发布校验：标题/要求/积分必填（前端+后端双层）
- 登录态修复：登录/注册/退出改 `window.location.assign` 整页跳转——客户端路由会复用缓存的老 layout（头像不换人），refresh 与 push 时序竞争救不回来；**同浏览器多窗口共享 Cookie，同时测多账号要用无痕窗口或双浏览器**
- 导航栏：登录后右上角变头像（用户名首字圆形）+ 用户名，点击进个人主页；修复"积分商城"链接嵌套在"登录"链接里的老 bug
- 三级角色上线：ACTOR 普通演员（只接单）/ SHOOTER 拍摄（发布+接单）/ ADMIN（均可）；注册页自选身份，注册接口白名单——伪造 ADMIN 注册会被降级为 ACTOR
- 注册资料：手机号字段整体换成微信群昵称（数据库列迁移 phone → wechat，老手机号数据已清）
- 任务详情页 `/tasks/[id]`：大厅标题可点击进入；新增接口 `GET /api/tasks/[id]`
- 商品管理页 `/mall/manage`（仅 ADMIN）：新增 / 编辑（名称、图标、描述、积分价）/ 上下架商品
- 稳定性两连修：① `layout.tsx` 加 `export const instant = false`（否则 Next 16 预渲染撞 cookies() 变 Blocking Route，链接点击不跳转）；② predev 钩子每次启动自动清 .next（否则复用旧缓存的服务器遇到动态路由必崩渲染进程）

## 坑与注意事项（都已踩过，别再踩）

- npmmirror 的 `prisma@latest` 是 8.0.0-rc 测试版，**锁 6.x**；装依赖报网络错误重试一次即可
- `.env` 追加变量必须另起一行（曾因没换行导致变量粘连、库连不上）
- **Windows 上跑 prisma migrate / generate 前必须停 dev 服务器**，否则报 EPERM（query engine dll 被占用）
- 改 schema 后 VS Code 若还报"属性不存在"，是 TS 服务缓存：Ctrl+Shift+P → Restart TS Server
- seed.js 里 require 的 ESLint 红色警告是无害的，无视
- `SESSION_SECRET`（.env）和 `prisma/dev.db` 永远不提交公开仓库
- PowerShell 已放开脚本限制，勿再动执行策略
- 根布局读登录 Cookie（头像区），layout.tsx 必须带 `export const instant = false`（已加）：Next 16 cacheComponents 下预渲染撞上 cookies() 会变成 Blocking Route，**症状是点链接没反应**（彻底修法是 Suspense 流式，见官方文档 authentication-with-cache-components）
- dev 服务器刷 "Jest worker ... exceeding retry limit" / 页面全 500 / 左下角角标爆红"Failed to generate static paths"：**复用旧 .next 的服务器遇到动态路由必崩渲染进程**（已多次复现，16.4.3 最新版仍存在）。已根治：`package.json` 的 predev 钩子每次 `npm run dev` 前自动删 .next 冷启动（`scripts/clean-next.mjs`），代价是每次启动多编译几秒。手动急救方子：停服务器 + 删 .next 再重启
