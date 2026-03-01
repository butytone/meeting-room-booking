# 学院会议室预订系统

Next.js 全栈 + SQLite + Prisma，教师工号/密码登录，会议室管理，预订与冲突检测，我的预订查看/取消。

## 技术栈

- **Next.js 15** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **Prisma** + **SQLite**
- **jose** (JWT) + **bcryptjs** (密码哈希)

## 快速开始

```bash
# 安装依赖
npm install

# 配置 .env 中的 DATABASE_URL（PostgreSQL，如 Neon 连接串）后：
npx prisma generate
npx prisma db push

# 填充测试数据（可选：1 个教师 + 3 间会议室）
npm run db:seed
```

测试账号：工号 `10001`，密码 `123456`。

```bash
# 开发
npm run dev
```

浏览器打开 [http://localhost:3000](http://localhost:3000)，未登录会跳转登录页。

**部署到公网（无服务器、随时可访问）**：见 [DEPLOY.md](./DEPLOY.md)，推荐 **Vercel + Neon** 免费方案。

## 功能

- **登录/退出**：工号 + 密码，Session 存于 Cookie（JWT）
- **会议室列表**：`/rooms`，点击进入详情
- **会议室详情**：`/rooms/[id]`，可跳转预订并预选该房间
- **预订**：`/book`，选日期、时间段、会议室，提交时自动检测冲突
- **我的预订**：`/my-bookings`，查看、取消

## 目录结构

```
src/
├── app/
│   ├── layout.tsx, page.tsx, globals.css
│   ├── login/
│   ├── dashboard/
│   ├── rooms/          # 列表 + [id] 详情
│   ├── book/           # 预订
│   ├── my-bookings/
│   └── api/
│       ├── auth/       # login, logout
│       ├── rooms/      # GET 列表, GET [id]
│       └── bookings/   # GET(mine/冲突查询), POST, PATCH(取消)
├── lib/                # prisma, auth, time(冲突判断)
└── components/         # Nav, RoomCard, BookingForm
```

## 环境变量

复制 `.env.example` 为 `.env`，并填写：

- `DATABASE_URL`：PostgreSQL 连接串（本地无 Postgres 时可用 [Neon](https://neon.tech) 免费建库获取；部署到 Vercel 时在同一 Neon 项目中填入连接串，建议用带 `-pooler` 的地址）
- `JWT_SECRET`：登录签名的密钥，生产环境请修改

## 向老师推广、随时使用（PWA + 微信）

本系统已支持 **PWA**，老师用手机即可「像小程序一样」使用，无需单独安装 App。

### 推荐用法（最简单）

1. **部署到公网**  
   将项目部署到一台有域名的服务器（如学院服务器），并配置 HTTPS（必须，否则无法「添加到主屏幕」）。

2. **发链接 / 二维码**  
   - 把登录页或首页链接发到学院教师群（如 `https://yourschool.edu/meeting`）。  
   - 老师用 **微信** 点开链接即可在微信内置浏览器里使用；也可复制链接到系统浏览器打开。

3. **「添加到主屏幕」（可选，更像 App）**  
   - **安卓**：在 Chrome 或微信内置浏览器中打开链接 → 菜单 →「添加到主屏幕」或「安装应用」。  
   - **苹果**：在 Safari 中打开链接（可从微信「在浏览器中打开」）→ 分享 →「添加到主屏幕」。  
   添加后，桌面会出现「会议室预订」图标，点开即用，无需再找链接。

4. **PWA 图标（可选）**  
   若希望主屏幕图标显示为自定义图标，请将两张 PNG 放入项目根目录的 `public/` 下：  
   - `icon-192.png`（192×192 像素）  
   - `icon-512.png`（512×512 像素）  
   可用 [RealFaviconGenerator](https://realfavicongenerator.net/) 或任意图标工具生成。未放置时部分浏览器会使用默认图标，不影响使用。

### 若要做成「微信小程序」

- **可以做到**，但需要：  
  - 学院/学校有 **企业主体** 并已认证的微信公众号或小程序账号；  
  - 用 **微信小程序** 前端（如 Taro、uni-app）重写一版界面，**后端可继续用当前 Next.js 的 API**（登录、会议室、预订等接口不变）。  
- 开发量比「发链接 + PWA」大，且需提交微信审核；适合学院已有小程序运营、且希望统一在微信内使用的场景。  
- 若仅希望老师「随时能打开」，**发链接 + 添加到主屏幕** 通常已足够。

## 后续可做

- 会议室管理后台（admin/rooms 增删改）
- 接入学校统一认证（替换工号密码登录）
- 会议室照片上传（如存本地或 OSS）
