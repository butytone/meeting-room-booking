# 腾讯云轻量服务器部署 — 一步步操作指南

本文按顺序操作即可，无需先有服务器经验。你会在腾讯云买一台轻量服务器，在上面安装 Node.js、拉取代码、用 PM2 跑应用，再用 Nginx 让用户通过 80 端口访问。

---

## 第一步：注册 / 登录腾讯云

1. 打开浏览器，访问：**https://cloud.tencent.com**
2. 点击右上角 **免费注册** 或 **登录**。
3. 可用 **微信 / QQ / 邮箱** 注册或登录，按页面提示完成。
4. 登录后进入 **腾讯云控制台** 首页。

---

## 第二步：购买轻量应用服务器

1. 在控制台左上角搜索框输入 **轻量应用服务器**，回车；或直接打开：  
   **https://cloud.tencent.com/product/lighthouse**
2. 点击 **立即购买**（或 **新购**）。
3. 在购买页按下面选择：

   | 选项 | 选择 |
   |------|------|
   | **地域** | 选离你或用户近的，如 **上海** 或 **北京** |
   | **镜像** | 选 **系统镜像** → **Ubuntu** → **Ubuntu Server 22.04 LTS** |
   | **套餐** | 选 **1 核 2G** 或 **2 核 2G**（按需选，新用户常有优惠价） |
   | **时长** | 如 3 个月、6 个月或 1 年 |

4. 在 **设置主机** 处：
   - ** root 密码**：自己设一个密码（至少 8 位，含大小写+数字），**务必记下来**。
   - 若可选「自动生成密码」，建议仍自己设密码并保存。
5. 勾选 **同意服务条款**，点击 **立即购买**，按提示完成支付。
6. 支付成功后，点击 **进入控制台** 或从控制台左侧菜单进入 **轻量应用服务器**。

---

## 第三步：记下服务器 IP 并配置防火墙

1. 在 **轻量应用服务器** 列表里，找到刚买的这台，记下 **公网 IP**（例如 `43.xxx.xxx.xxx`）。
2. 点击该服务器 **名称** 或 **管理** 进入详情。
3. 在左侧或页面上找到 **防火墙** 或 **安全组**。
4. 点击 **添加规则**，按下面添加三条（若已有则不用重复添加）：

   | 端口 | 协议 | 策略 | 说明 |
   |------|------|------|------|
   | 22   | TCP  | 允许 | SSH 登录 |
   | 80   | TCP  | 允许 | 网站 HTTP |
   | 443  | TCP  | 允许 | 网站 HTTPS（可选） |

5. 保存后，防火墙配置完成。

---

## 第四步：用 SSH 登录服务器（在你自己的电脑上操作）

你的电脑是 **Windows**，可以用 **PowerShell** 或 **Windows 终端**。

1. 按 `Win + R`，输入 `powershell`，回车，打开 PowerShell。
2. 输入下面命令（把 `你的公网IP` 换成第三步记下的 IP，例如 `43.xxx.xxx.xxx`）：
   ```powershell
   ssh root@你的公网IP
   ```
3. 第一次连接会提示：
   ```text
   Are you sure you want to continue connecting (yes/no)?
   ```
   输入 **yes** 回车。
4. 提示 **Password:** 时，输入你在第二步设置的 **root 密码**（输入时不会显示，输完直接回车）。
5. 登录成功后，命令行前面会变成类似 `root@VM-xx-xx-ubuntu:~#`，表示已进入服务器。

---

## 第五步：在服务器上安装 Node.js

下面所有命令都是在 **已 SSH 登录的服务器** 上执行，一行一行复制粘贴即可。

**5.1 更新系统并安装 curl**

```bash
apt update && apt install -y curl
```

回车后等待执行完成（出现 `root@...` 提示符即完成）。

**5.2 添加 Node.js 20 源**

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
```

执行完可能有一两行提示，忽略即可。

**5.3 安装 Node.js**

```bash
apt install -y nodejs
```

**5.4 检查是否安装成功**

```bash
node -v
npm -v
```

应分别显示 `v20.x.x` 和 `10.x.x` 左右。若都有版本号，说明 Node.js 安装成功。

---

## 第六步：安装 Git 并克隆你的项目

**6.1 安装 Git**

```bash
apt install -y git
```

**6.2 创建目录并进入**

```bash
cd /var
mkdir -p www
cd www
```

**6.3 克隆 GitHub 仓库**

把下面的 `YOUR_USERNAME` 换成你的 GitHub 用户名，`YOUR_REPO` 换成仓库名（例如仓库是 `https://github.com/zhangsan/meetingBook`，则用户名为 `zhangsan`，仓库名为 `meetingBook`）：

```bash
git clone https://github.com/YOUR_USERNAME/YOUR_REPO.git meeting-book
```

若仓库是 **私有**，需要带 Token：

```bash
git clone https://你的Token@github.com/YOUR_USERNAME/YOUR_REPO.git meeting-book
```

（Token 在 GitHub → Settings → Developer settings → Personal access tokens 里生成。）

**6.4 进入项目目录**

```bash
cd meeting-book
```

---

## 第七步：在服务器上配置 .env

**7.1 创建并编辑 .env 文件**

```bash
nano .env
```

会打开一个编辑器。

**7.2 写入两行（按你的实际内容修改）**

- 第一行：Neon 的数据库连接串（和本地 / Vercel 用的一样）。
- 第二行：生产环境用的 JWT 密钥（随机长字符串）。

示例（**务必改成你自己的**）：

```env
DATABASE_URL="postgresql://neondb_owner:xxxx@ep-xxx-pooler.xxx.aws.neon.tech/neondb?sslmode=require"
JWT_SECRET="请换成至少20位随机字符串"
```

- 若当前用 **http://** 访问（未配置 HTTPS），**不要**在 .env 里加 `COOKIE_SECURE=true`，否则登录后 Cookie 不生效、会一直停在登录页。等配置好 HTTPS 后用域名访问时，再在 .env 中增加一行 `COOKIE_SECURE=true`。

**7.3 保存并退出 nano**

- 按 **Ctrl + O** 保存；
- 回车确认；
- 再按 **Ctrl + X** 退出。

---

## 第八步：安装依赖并构建项目

仍在项目目录 `/var/www/meeting-book` 下执行：

**8.1 安装依赖**

```bash
npm install
```

等待完成（可能 1～2 分钟）。

**8.2 构建**

```bash
npm run build
```

等待出现 `Compiled successfully` 或类似提示。

**8.3 先手动跑一次看是否正常**

```bash
npm run start
```

保持这个窗口不关，在你自己的电脑浏览器里访问：**http://你的公网IP:3000**（例如 `http://43.xxx.xxx.xxx:3000`）。  
若能看到登录页，说明应用已跑起来。

**8.4 停止当前运行**

在服务器上按 **Ctrl + C** 停止，然后进行下一步，用 PM2 常驻运行。

---

## 第九步：用 PM2 让应用一直运行

**9.1 安装 PM2**

```bash
npm install -g pm2
```

**9.2 用 PM2 启动应用**

确保当前在项目目录：

```bash
cd /var/www/meeting-book
pm2 start npm --name "meeting-book" -- start
```

**9.3 设置开机自启**

```bash
pm2 startup
```

执行后，终端会提示你**再执行一行命令**（类似 `sudo env PATH=...`），**把那行整段复制下来执行一次**，然后再执行：

```bash
pm2 save
```

**9.4 查看状态**

```bash
pm2 status
```

列表中 `meeting-book` 应为 **online**。  
之后应用会一直运行，重启服务器也会自动拉起。

---

## 第十步：安装 Nginx，用 80 端口访问

这样用户访问 **http://你的IP**（不用加 `:3000`）即可。

**10.1 安装 Nginx**

```bash
apt install -y nginx
```

**10.2 新建站点配置文件**

```bash
nano /etc/nginx/sites-available/meeting-book
```

在打开的编辑器里**整段**粘贴下面内容（先不要改）：

```nginx
server {
    listen 80;
    server_name _;

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

然后 **Ctrl + O** 保存，回车，**Ctrl + X** 退出。

**10.3 启用该配置**

```bash
ln -sf /etc/nginx/sites-available/meeting-book /etc/nginx/sites-enabled/
```

**10.4 删除默认站点（避免和 80 冲突）**

```bash
rm -f /etc/nginx/sites-enabled/default
```

**10.5 检查配置并重载 Nginx**

```bash
nginx -t
```

应显示 `syntax is ok` 和 `test is successful`。然后：

```bash
systemctl reload nginx
```

**10.6 在浏览器访问**

打开：**http://你的公网IP**（不加 `:3000`）。  
应能打开会议室预订的登录页，用测试账号（如工号 10001、密码 123456）能登录即表示部署成功。

---

## 第十一步（可选）：以后如何更新代码

当你改了代码并推送到 GitHub 后，在服务器上执行（**不要用 sudo**，用当初 clone 时的用户执行）：

```bash
cd /var/www/meeting-book
git pull
npm install
npm run build
pm2 restart meeting-book
```

即可完成一次更新。

---

## 第十二步：把 IP 改成域名访问

### 1. 准备一个域名

- **自己买域名**：在腾讯云 DNSPod、阿里云万网、GoDaddy 等购买（如 `meeting.example.com`）。
- **用学校/单位域名**：向管理员申请子域名，例如 `meeting.学院.edu.cn`，并让你做解析或把 A 记录指向你的服务器 IP。

### 2. 做 DNS 解析（把域名指到服务器）

在**域名服务商**的解析控制台里添加一条 **A 记录**：

| 记录类型 | 主机记录 | 记录值 | 说明 |
|----------|----------|--------|------|
| A | @ 或 www 或 meeting | **146.56.195.78**（你的服务器公网 IP） | 用 @ 表示主域名，用 meeting 表示 meeting.xxx.com |

- 例如要访问 `meeting.xxx.com`：主机记录填 **meeting**，记录值填 **146.56.195.78**。
- 保存后等待几分钟到几十分钟生效（可用 `ping meeting.xxx.com` 看是否解析到该 IP）。

### 3. 在服务器上改 Nginx 配置

SSH 登录服务器后执行：

```bash
sudo nano /etc/nginx/sites-available/meeting-book
```

把其中的 `server_name _;` 改成你的域名，例如：

```nginx
server_name meeting.你的域名.com;
```

若同时想用 www：`server_name meeting.你的域名.com www.meeting.你的域名.com;`  
保存（Ctrl+O，回车）并退出（Ctrl+X）。

然后检查并重载 Nginx：

```bash
sudo nginx -t
sudo systemctl reload nginx
```

### 4. 用域名访问

浏览器打开 **http://你的域名**（如 `http://meeting.你的域名.com`），应能打开会议室预订系统。

### 5. 可选：开启 HTTPS（推荐）

域名能访问后，在服务器上执行：

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d 你的域名
```

按提示选邮箱、同意条款，certbot 会自动配置 HTTPS。之后用 **https://你的域名** 访问即可，证书会自动续期。

---

## 常见问题

**Q：点击登录后一直停在登录页，进不到首页？**

- 多半是会话 Cookie 在 **HTTP** 下未生效。代码里只有在 `.env` 中设置 `COOKIE_SECURE=true` 时才会给 Cookie 加 Secure；若未设置，Cookie 不会带 Secure，可在 HTTP 下正常使用。
- **请确认**服务器 `.env` 里**没有**写 `COOKIE_SECURE=true`。若当前用 `http://你的IP` 访问，不要加这一行。保存后执行 `pm2 restart meeting-book` 再试登录。
- 若已加 `COOKIE_SECURE=true`，请删掉该行或改为 `COOKIE_SECURE=false`，重启应用后再登录。

**Q：已在腾讯云开启了 HTTPS，但用 https://146.56.195.78/dashboard 打不开？**

- **原因一：HTTPS 不能直接用 IP 访问。**  
  SSL 证书是发给**域名**的（例如 `meeting.xxx.edu.cn`），不是发给 IP 的。所以浏览器访问 `https://146.56.195.78` 时会证书不匹配或无法建立安全连接，属于正常现象。

- **正确做法：用域名 + 在服务器上配置 HTTPS**
  1. **先有一个域名**，并在域名服务商处把该域名的 **A 记录** 解析到 `146.56.195.78`（见上文第十二步）。
  2. **在腾讯云轻量服务器防火墙里放行 443 端口**（若未放行）：  
     轻量应用服务器 → 你的实例 → 防火墙 → 添加规则：端口 **443**，协议 **TCP**，策略 **允许**。
  3. **SSH 登录服务器**，在服务器上执行（把 `你的域名` 换成实际域名，如 `meeting.xxx.edu.cn`）：
     ```bash
     sudo apt install -y certbot python3-certbot-nginx
     sudo certbot --nginx -d 你的域名
     ```
     按提示输入邮箱、同意条款，certbot 会自动为 Nginx 配置 443 和证书。
  4. 之后用 **https://你的域名/dashboard** 访问（不要用 `https://146.56.195.78`）。

- 若你在腾讯云控制台用的是**负载均衡（CLB）的 HTTPS**：证书是绑在「域名」上的，访问时也要用控制台里绑定的那个域名，不能用 IP。同时确保后端转发到你这台轻量服务器的 80 或 3000 端口且安全组/防火墙已放行。

**Q：SSH 连不上（超时或拒绝）**  
- 检查第三步防火墙是否放行了 **22** 端口。  
- 确认 IP 和 root 密码无误（密码粘贴时注意不要多空格）。

**Q：访问 http://IP 显示 502 Bad Gateway**  
- 先执行 `pm2 status` 看 meeting-book 是否为 online。  
- 若不是，执行 `pm2 logs meeting-book` 看报错，或先 `cd /var/www/meeting-book` 再 `npm run start` 看终端报错。

**Q：想用域名访问**  
- 在域名服务商处把域名 A 记录解析到这台服务器的公网 IP。  
- 把 Nginx 里 `server_name _;` 改成 `server_name 你的域名;`，然后执行 `nginx -t` 和 `systemctl reload nginx`。  
- 若要 HTTPS，可再安装 `certbot` 用 Let's Encrypt 免费证书（见 DEPLOY-CN.md 第八节）。

**Q：如何在服务器上修改 JWT_SECRET？修改后要执行什么？**

1. **SSH 登录服务器**后，进入项目目录并编辑 `.env`：
   ```bash
   cd /var/www/meeting-book
   nano .env
   ```
2. 找到 `JWT_SECRET=` 这一行，把等号后面的值改成你在本地生成的**强随机字符串**（整段替换，保留引号）。例如：
   ```env
   JWT_SECRET="你粘贴过来的那串随机字符"
   ```
3. **Ctrl + O** 保存，回车，**Ctrl + X** 退出。
4. **必须重启应用**，新的密钥才会生效：
   ```bash
   pm2 restart meeting-book
   ```
5. **说明**：修改 JWT_SECRET 后，之前签发的登录态都会失效，所有用户需要重新登录，这是正常现象。

**Q：git pull 报错 insufficient permission for adding an object to repository database .git/objects**

- 说明当前用户对 `.git` 目录没有写权限，多半是之前用 **sudo git clone**，仓库属主是 root。
- **一次性修复**：把整个项目目录的属主改成当前用户，之后都用该用户执行 git pull（不要再用 sudo）：
  ```bash
  sudo chown -R $(whoami):$(whoami) /var/www/meeting-book
  cd /var/www/meeting-book
  git pull
  ```
- 若 PM2 是用 root 启动的，可改为用当前用户启动，或保持 root 则用 `sudo chown -R root:root` 后继续用 `sudo git pull`（不推荐，建议用同一普通用户做 clone/pull 和 pm2）。

**Q：执行 git pull 报错 GnuTLS recv error (-110) 或 TLS connection was non-properly terminated**

- 这是连接 GitHub 时 TLS 被中断，常见于网络不稳定或访问 GitHub 受限（如国内服务器）。
- **不要用 sudo git pull**：用当前登录用户执行 `cd /var/www/meeting-book` 后直接 `git pull`，否则可能权限或配置不对。
- **可尝试**：
  1. 多试几次：有时是临时网络问题。
  2. 增大 HTTP 缓冲后重试：
     ```bash
     git config --global http.postBuffer 524288000
     cd /var/www/meeting-book && git pull
     ```
  3. **改用 SSH 拉取**（需先在服务器配置 GitHub SSH 公钥）：
     ```bash
     cd /var/www/meeting-book
     git remote set-url origin git@github.com:butytone/meeting-room-booking.git
     git pull
     ```
  4. 若服务器在国内且无法直连 GitHub，可配置 HTTP 代理后再执行 `git pull`，或在本机拉取后通过 scp/rsync 把代码同步到服务器。

**Q：数据库连不上**  
- 确认服务器上 `.env` 里的 `DATABASE_URL` 和本地/Neon 控制台中的一致（尤其是密码和 `-pooler` 地址）。  
- 若用国内云数据库，把连接串换成腾讯云/阿里云 PostgreSQL 的地址即可。

---

按 **第一步 → 第十步** 顺序做下来，即可在腾讯云轻量服务器上完成部署，大陆用户通过 **http://你的公网IP** 稳定访问。
