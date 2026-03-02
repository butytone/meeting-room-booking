# 国内轻量服务器部署指南

适用于腾讯云轻量应用服务器、阿里云轻量/ECS 等，让**大陆用户**稳定访问。整体流程：买服务器 → 装 Node.js → 拉代码、构建 → 用 PM2 常驻 → 用 Nginx 做反向代理（可选 HTTPS）。

---

## 一、购买轻量服务器

### 腾讯云 Lighthouse（推荐）

1. 打开 [腾讯云轻量应用服务器](https://cloud.tencent.com/product/lighthouse)
2. 点击 **立即购买**，选择：
   - **地域**：选离用户近的（如上海、北京）
   - **镜像**：**应用镜像** → **Node.js**，或 **系统镜像** → **Ubuntu 22.04**
   - **套餐**：1 核 2G、2 核 2G 即可（约 ￥50/年起，新用户常有优惠）
3. 设置 root 密码并购买
4. 在控制台记下服务器 **公网 IP**

### 阿里云

- [阿里云轻量应用服务器](https://www.aliyun.com/product/swas)：类似腾讯云，选 Ubuntu 22.04 即可。
- 或 [ECS 云服务器](https://www.aliyun.com/product/ecs)：新用户常有优惠。

---

## 二、登录服务器并放行端口

1. 本地用 SSH 登录（把 `你的公网IP` 换成实际 IP）：
   ```bash
   ssh root@你的公网IP
   ```
2. 在云控制台 **防火墙 / 安全组** 中放行：
   - **22**（SSH）
   - **80**（HTTP）
   - **443**（HTTPS，若要用 SSL）

---

## 三、安装 Node.js（LTS）

以 **Ubuntu 22.04** 为例，用 NodeSource 安装 Node.js 20：

```bash
# 更新并安装 curl
apt update && apt install -y curl

# 添加 NodeSource 源（Node.js 20）
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -

# 安装 Node.js
apt install -y nodejs

# 验证
node -v   # 应显示 v20.x.x
npm -v
```

若系统是 **CentOS / Rocky**，可改用：

```bash
curl -fsSL https://rpm.nodesource.com/setup_20.x | bash -
yum install -y nodejs
```

---

## 四、安装 Git 并克隆项目

```bash
apt install -y git

# 创建目录并克隆（把 YOUR_USERNAME/YOUR_REPO 换成你的 GitHub 仓库）
cd /var
mkdir -p www
cd www
git clone https://github.com/YOUR_USERNAME/YOUR_REPO.git meeting-book
cd meeting-book
```

若仓库为私有，需配置 SSH 密钥或使用 Personal Access Token：

```bash
git clone https://你的Token@github.com/YOUR_USERNAME/YOUR_REPO.git meeting-book
```

---

## 五、配置环境变量并构建

1. 在服务器上创建 `.env`：
   ```bash
   cd /var/www/meeting-book
   nano .env
   ```
2. 填入（与本地/Vercel 一致）：
   ```env
   DATABASE_URL="postgresql://..."
   JWT_SECRET="你的随机长字符串"
   ```
   - `DATABASE_URL`：可继续用 **Neon** 的连接串（国内访问可能略慢），或改用**腾讯云/阿里云 PostgreSQL** 的连接串。
   - `JWT_SECRET`：生产环境务必用随机字符串。
3. 保存后安装依赖并构建：
   ```bash
   npm install
   npm run build
   ```
4. 测试运行（确认能启动后再用 PM2）：
   ```bash
   npm run start
   ```
   在浏览器访问 `http://你的公网IP:3000`，能看到登录页即可。按 `Ctrl+C` 停止。

---

## 六、用 PM2 常驻进程

1. 安装 PM2：
   ```bash
   npm install -g pm2
   ```
2. 在项目目录用 PM2 启动：
   ```bash
   cd /var/www/meeting-book
   pm2 start npm --name "meeting-book" -- start
   ```
3. 设置开机自启：
   ```bash
   pm2 startup
   pm2 save
   ```
4. 常用命令：
   ```bash
   pm2 status        # 查看状态
   pm2 logs meeting-book   # 看日志
   pm2 restart meeting-book   # 重启
   ```

---

## 七、安装 Nginx 并做反向代理

这样用户通过 **80 端口**（或 HTTPS 443）访问，而不是 `:3000`。

1. 安装 Nginx：
   ```bash
   apt install -y nginx
   ```
2. 新建站点配置（把 `你的域名或IP` 换成实际域名或服务器 IP）：
   ```bash
   nano /etc/nginx/sites-available/meeting-book
   ```
3. 写入以下内容（`your_domain_or_ip` 替换成域名或 IP，如 `meeting.xxx.edu.cn` 或服务器公网 IP）：
   ```nginx
   server {
       listen 80;
       server_name your_domain_or_ip;

       location / {
           proxy_pass http://127.0.0.1:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```
4. 启用配置并重载 Nginx：
   ```bash
   ln -sf /etc/nginx/sites-available/meeting-book /etc/nginx/sites-enabled/
   nginx -t
   systemctl reload nginx
   ```
5. 浏览器访问 `http://你的域名或IP`（无需加 `:3000`），应能打开应用。

---

## 八、可选：HTTPS（Let's Encrypt）

若有**域名**且已解析到该服务器 IP，可免费申请证书：

```bash
apt install -y certbot python3-certbot-nginx
certbot --nginx -d 你的域名
```

按提示选择为 `meeting-book` 站点配置 HTTPS，并可选自动续期。之后用 `https://你的域名` 访问。

---

## 九、后续更新代码

在服务器上拉取最新代码并重新构建、重启：

```bash
cd /var/www/meeting-book
git pull
npm install
npm run build
pm2 restart meeting-book
```

---

## 十、数据库说明

- **继续用 Neon**：把 Neon 的 `DATABASE_URL` 写在服务器 `.env` 即可，国内访问可能稍慢但一般可用。
- **改用国内库**：在腾讯云/阿里云购买 **云数据库 PostgreSQL**，在控制台拿到连接串，替换 `.env` 中的 `DATABASE_URL`，然后在本地或服务器执行一次 `npx prisma db push` 和 `npm run db:seed`（若需要测试数据）。

---

## 简要清单

| 步骤 | 命令/操作 |
|------|------------|
| 买服务器 | 腾讯云 Lighthouse / 阿里云轻量，Ubuntu 22.04 |
| 放行端口 | 22、80、443 |
| 装 Node.js | NodeSource 安装 Node 20 |
| 克隆项目 | `git clone` 到 `/var/www/meeting-book` |
| 配置 .env | DATABASE_URL、JWT_SECRET |
| 构建 | `npm install` → `npm run build` |
| 常驻 | `pm2 start npm --name "meeting-book" -- start` |
| 反向代理 | Nginx 把 80 转到 127.0.0.1:3000 |
| 可选 HTTPS | `certbot --nginx -d 域名` |

按顺序做完后，大陆用户即可通过 **http(s)://你的域名或IP** 稳定访问。
