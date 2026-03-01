# 学院会议室预订系统 - 技术方案与结构

## 一、技术栈确认

| 选型 | 说明 | 是否合适 |
|------|------|----------|
| **Next.js** | App Router 全栈、API Routes、服务端组件，你熟悉前端即可快速上手 | ✅ 合适 |
| **SQLite** | 单文件数据库，零配置，适合学院内部、单机/单实例部署 | ✅ 合适 |
| **Prisma** | 类型安全 ORM、迁移、SQLite 支持好，与 Next 集成简单 | ✅ 合适 |

**结论：技术栈轻量且完整，适合你的需求。** 后续若需多机或高并发，可把 SQLite 换成 PostgreSQL/MySQL，Prisma 只需改 `datasource` 和少量 SQL 方言。

---

## 二、数据库表结构（Prisma Schema 已生成）

- **users**：教师账号（工号 `workId`、密码、姓名等）
- **rooms**：会议室（名称、容量、设施、照片 URL、是否可用）
- **bookings**：预订记录（用户、会议室、日期、时间段、用途、状态）

**冲突检测逻辑**：同一 `roomId` + `date` 下，若新区间的 `[startTime, endTime]` 与已有有效预订（`status = 'confirmed'`）重叠，则不允许创建。可在 API 层用 Prisma 查该房间该日所有 confirmed 预订，再在 JS 里判断时间区间是否相交。

---

## 三、项目目录结构（推荐）

```
meetingBook/
├── prisma/
│   ├── schema.prisma      # 数据模型（已创建）
│   └── dev.db             # SQLite 数据库文件（git 可忽略）
├── src/
│   ├── app/
│   │   ├── layout.tsx           # 根布局（导航、登录态）
│   │   ├── page.tsx             # 首页（未登录跳登录，已登录跳仪表盘/预订）
│   │   ├── globals.css
│   │   ├── login/
│   │   │   └── page.tsx         # 登录页
│   │   ├── dashboard/           # 已登录后的主界面
│   │   │   └── page.tsx         # 仪表盘（快捷入口：预订 / 我的预订 / 管理会议室）
│   │   ├── rooms/
│   │   │   ├── page.tsx         # 会议室列表（名称、容量、设施、照片）
│   │   │   └── [id]/page.tsx    # 会议室详情 + 预订入口
│   │   ├── book/
│   │   │   └── page.tsx         # 预订：选日期、时间段、会议室，冲突检测
│   │   ├── my-bookings/
│   │   │   └── page.tsx         # 我的预订列表（查看/取消）
│   │   ├── admin/               # 可选：仅管理员可进
│   │   │   └── rooms/
│   │   │       ├── page.tsx     # 会议室管理列表
│   │   │       └── new/page.tsx # 新增/编辑会议室
│   │   └── api/
│   │       ├── auth/
│   │       │   └── login/route.ts   # POST 登录
│   │       ├── rooms/
│   │       │   ├── route.ts         # GET 列表
│   │       │   └── [id]/route.ts   # GET/PATCH 单间
│   │       ├── bookings/
│   │       │   ├── route.ts         # GET 我的预订 | POST 创建（含冲突检测）
│   │       │   └── [id]/route.ts   # PATCH 取消
│   │       └── bookings/conflict/route.ts  # 可选：GET 某房间某日已占用时段
│   ├── lib/
│   │   ├── prisma.ts       # PrismaClient 单例
│   │   ├── auth.ts         # 简单 session（cookie + 内存/DB）
│   │   └── time.ts         # 时间段冲突判断
│   └── components/         # 公共组件（RoomCard、BookingForm、Nav 等）
├── public/
├── .env                    # DATABASE_URL="file:./dev.db"
├── .env.example
├── next.config.js
├── package.json
├── tsconfig.json
└── README.md
```

---

## 四、下一步建议

1. 在项目根目录执行：`npx create-next-app@latest . --ts --tailwind --app --no-src-dir`，然后按需把生成内容挪到 `src/` 下，或直接用 `--no-src-dir` 则用 `app/` 在根目录。
2. 安装 Prisma：`npm i prisma @prisma/client`，`npx prisma generate`，`npx prisma db push`（或 `migrate dev`）初始化数据库。
3. 在 `src/app/api/auth/login` 实现工号+密码校验，登录成功后写 session；在需要登录的页面/API 里校验 session。
4. 实现 `src/lib/time.ts` 中的时间段重叠判断，在 `POST /api/bookings` 中先查同房间同日的 confirmed 预订，再调用该函数，无冲突再 `create`。

如果你愿意，我可以按上述结构帮你从零生成一版可运行的 Next + Prisma + SQLite 脚手架（含登录、会议室列表、预订与我的预订接口与页面骨架）。
