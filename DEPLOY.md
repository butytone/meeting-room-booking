# 部署指南：无服务器、随时可访问

你的场景：没有自己的服务器、电脑不能 24 小时开机，希望应用**任何人、随时**都能用。下面按推荐程度排序。

---

## 方案一：Vercel + Neon（推荐，免费额度大）

**特点**：零服务器、全球访问、免费额度对个人/小团队足够；部署一次后长期可用。

| 服务   | 作用           | 免费额度简述 |
|--------|----------------|--------------|
| Vercel | 托管 Next.js   | 每月约 100 万次请求、100 次部署/天 |
| Neon   | 托管 PostgreSQL | 约 0.5GB 存储、按用量计 CU，小应用够用 |

**为什么不用本机 SQLite**：Vercel 是“无状态”的，每次请求可能在不同机器上跑，**没有持久化磁盘**，所以必须用**云数据库**。Neon 是托管 Postgres，和 Prisma 配合简单。

### 步骤概要

1. **把代码推到 GitHub**（若还没有）。
2. **在 Neon 建库**  
   - 打开 [neon.tech](https://neon.tech) 注册，新建一个 Project。  
   - 在控制台复制 **Connection string**（选 Postgres 的），形如：  
     `postgresql://user:pass@ep-xxx.region.aws.neon.tech/neondb?sslmode=require`
3. **本地改用 Postgres（一次性）**  
   - 在 `prisma/schema.prisma` 里，把 `datasource db` 改成：
     ```prisma
     datasource db {
       provider = "postgresql"
       url      = env("DATABASE_URL")
     }
     ```
   - Neon 控制台里若提供 **pooled connection** 地址（带 `-pooler`），建议用这个作为 `DATABASE_URL`，更适合 Vercel 的 serverless。  
   - 执行：
     ```bash
     npx prisma generate
     npx prisma db push
     ```
   - 若之前有 SQLite 数据，需要在 Neon 里重新建表；可用 `npm run db:seed` 填测试数据。
4. **在 Vercel 部署**  
   - 打开 [vercel.com](https://vercel.com)，用 GitHub 登录，**New Project** → 导入你的仓库。  
   - 在 Project 的 **Settings → Environment Variables** 里添加：  
     - `DATABASE_URL` = Neon 的 Connection string（建议用带 `-pooler` 的 pooled 连接串，Neon 控制台里可复制）。  
   - 保存后 **Redeploy**。  
   - 部署完成后会得到一个 `xxx.vercel.app` 的地址，即你的应用入口。

之后：把 `https://你的项目.vercel.app` 发给学院老师或任何人，即可随时使用；你本机关机也不影响。

### 可选：自定义域名

在 Vercel 项目里 **Settings → Domains** 可绑定自己的域名（例如 `meeting.学院.edu`），需在域名服务商处按提示添加 CNAME。

---

## 方案二：Railway（一条龙，可继续用 SQLite）

**特点**：一个平台同时跑“网站 + 数据库”，支持**持久化磁盘**，可以继续用当前 SQLite 或改用 Railway 提供的 Postgres，改造成本小。

- 打开 [railway.app](https://railway.app)，用 GitHub 登录。  
- **New Project** → **Deploy from GitHub repo**，选你的仓库。  
- Railway 会自动识别 Next.js，并提示配置环境变量。  
- **数据库**二选一：  
  - **保留 SQLite**：为项目挂载 **Volume**，把数据库文件路径（例如 `/data`）设到该 Volume，并在环境变量里把 `DATABASE_URL` 设为 `file:/data/dev.db`（需在 Railway 文档里确认当前推荐的挂载方式）。  
  - **改用 Postgres**：在同一个 Project 里 **New → Database → PostgreSQL**，Railway 会注入 `DATABASE_URL`；然后把 Prisma 的 `provider` 改为 `postgresql` 并 `prisma db push`，再部署。  

Railway 会分配一个 `xxx.railway.app` 的域名，应用会一直运行（注意当前免费额度有限，超出会按量计费，约几美元/月）。

---

## 方案三：Render（免费版会休眠）

**特点**：免费版可以跑 Next.js，但**约 15 分钟无人访问会休眠**，下次有人访问时要等几十秒“冷启动”，适合访问不频繁的场景。

- 打开 [render.com](https://render.com)，用 GitHub 登录。  
- **New → Web Service**，选你的仓库。  
- 运行时选 **Node**，Build 命令：`npm install && npx prisma generate && npm run build`，Start 命令：`npm run start`。  
- 环境变量里配置 `DATABASE_URL`。  
  - 免费版没有持久化盘，**不能**直接沿用本地 SQLite 文件，需要：  
    - 要么用 **Render 的 PostgreSQL**（同一账号里 New → PostgreSQL），把 Prisma 改为 `postgresql` 并填 `DATABASE_URL`；  
    - 要么用外部数据库（如 Neon、Turso）。  

适合“先跑起来、后面再迁到 Vercel+Neon 或 Railway”的过渡方案。

---

## 方案对比（按你的场景）

| 方案              | 是否要自己服务器 | 是否 24 小时在线 | 免费程度     | 推荐场景           |
|-------------------|------------------|------------------|--------------|--------------------|
| **Vercel + Neon** | 否               | 是               | 免费额度大   | **首选**，长期对外 |
| **Railway**       | 否               | 是               | 有限免费额度 | 想少改代码、一条龙 |
| **Render 免费**   | 否               | 会休眠           | 免费         | 试运行、低访问量   |

---

## 部署后建议

1. **环境变量**：`JWT_SECRET` 务必在 Vercel/Railway/Render 里设成**随机长字符串**，不要用默认值。  
2. **首次使用**：部署完成后访问一次首页/登录页，若用 Neon/Railway Postgres，确保已执行过 `prisma db push` 或迁移，必要时跑一次 `db:seed`。  
3. **分享方式**：把最终网址（或二维码）发到学院群/公众号，老师用浏览器或“添加到主屏幕”即可随时使用。

这样无需自己的服务器、电脑也不用常开，应用即可对学院内外任何人、随时可用。
