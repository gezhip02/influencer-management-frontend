# 🚀 Knnector.com 生产环境部署文档

## 📋 部署概览

您的 Next.js 项目现在已经配置为静态导出模式，可以部署到阿里云 ECS 上的 Nginx 服务器。

## 🏗️ 架构说明

```
用户访问 knnector.com
        ↓
    Nginx 反向代理
    ├── 静态文件服务 (前端)
    └── API 代理 (后端)
```

## 📁 文件结构

```
/var/www/knnector/
├── frontend/          # Next.js 静态文件
│   ├── index.html
│   ├── _next/
│   └── ...
└── nginx.conf        # Nginx 配置文件
```

## 🔧 部署步骤

### 1. 构建静态文件

在本地运行：
```bash
# 设置生产环境
export NODE_ENV=production

# 构建静态文件
npm run build

# 静态文件将生成在 out/ 目录
```

### 2. 上传文件到服务器

将 `out/` 目录的所有文件上传到服务器：
```bash
# 创建目录
mkdir -p /var/www/knnector/frontend

# 上传静态文件
scp -r ./out/* user@your-server:/var/www/knnector/frontend/
```

### 3. 配置环境变量

创建生产环境配置文件：
```bash
# .env.production 内容：
NEXT_PUBLIC_API_BASE_URL=/api
NEXT_PUBLIC_USE_MOCK=false
```

## 🌐 Nginx 配置

### 完整的 Nginx 配置文件

创建 `/etc/nginx/sites-available/knnector.com`：

```nginx
# HTTP 重定向到 HTTPS
server {
    listen 80;
    server_name knnector.com www.knnector.com;
    return 301 https://$server_name$request_uri;
}

# HTTPS 主配置
server {
    listen 443 ssl http2;
    server_name knnector.com www.knnector.com;
    
    # SSL 配置
    ssl_certificate /path/to/your/certificate.crt;
    ssl_certificate_key /path/to/your/private.key;
    ssl_session_timeout 1d;
    ssl_session_cache shared:SSL:50m;
    ssl_session_tickets off;
    
    # 现代 SSL 配置
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    
    # 安全头部
    add_header Strict-Transport-Security "max-age=63072000; includeSubDomains; preload";
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    add_header Referrer-Policy "strict-origin-when-cross-origin";
    
    # 文档根目录
    root /var/www/knnector/frontend;
    index index.html;
    
    # Gzip 压缩
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types
        text/plain
        text/css
        text/xml
        text/javascript
        application/javascript
        application/xml+rss
        application/json;
    
    # 静态文件缓存
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        add_header Vary Accept-Encoding;
        access_log off;
    }
    
    # Next.js 构建文件缓存
    location /_next/static/ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        access_log off;
    }
    
    # API 代理到后端服务
    location /api/ {
        proxy_pass http://localhost:8080/api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # 超时设置
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
        
        # CORS 处理（如果需要）
        add_header Access-Control-Allow-Origin $http_origin always;
        add_header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS" always;
        add_header Access-Control-Allow-Headers "Accept, Authorization, Cache-Control, Content-Type, DNT, If-Modified-Since, Keep-Alive, Origin, User-Agent, X-Requested-With" always;
        add_header Access-Control-Allow-Credentials true always;
        
        if ($request_method = 'OPTIONS') {
            return 204;
        }
    }
    
    # 前端路由处理（SPA 路由）
    location / {
        try_files $uri $uri/ $uri.html /index.html;
        
        # 安全头部
        add_header X-Frame-Options DENY always;
        add_header X-Content-Type-Options nosniff always;
        add_header X-XSS-Protection "1; mode=block" always;
    }
    
    # 动态路由处理（Next.js 静态导出）
    location ~ ^/(products|influencers|fulfillment|bd-performance)/([^/]+)/?$ {
        try_files $uri $uri/ $uri.html /$1/$2.html /index.html;
    }
    
    location ~ ^/(products|influencers)/([^/]+)/edit/?$ {
        try_files $uri $uri/ $uri.html /$1/$2/edit.html /index.html;
    }
    
    # 错误页面
    error_page 404 /404.html;
    error_page 500 502 503 504 /50x.html;
    
    # 访问日志
    access_log /var/log/nginx/knnector.com.access.log;
    error_log /var/log/nginx/knnector.com.error.log;
}
```

### 简化版 Nginx 配置（如果不使用 HTTPS）

```nginx
server {
    listen 80;
    server_name knnector.com www.knnector.com;
    
    root /var/www/knnector/frontend;
    index index.html;
    
    # Gzip 压缩
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
    
    # 静态文件缓存
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
        expires 1y;
        add_header Cache-Control "public";
    }
    
    # API 代理
    location /api/ {
        proxy_pass http://localhost:8080/api/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    # 前端路由
    location / {
        try_files $uri $uri/ $uri.html /index.html;
    }
}
```

## 🎯 部署命令

### 启用站点配置

```bash
# 创建软链接
sudo ln -s /etc/nginx/sites-available/knnector.com /etc/nginx/sites-enabled/

# 测试配置
sudo nginx -t

# 重新加载 Nginx
sudo systemctl reload nginx

# 或重启 Nginx
sudo systemctl restart nginx
```

### 设置文件权限

```bash
# 设置所有者
sudo chown -R www-data:www-data /var/www/knnector/

# 设置权限
sudo chmod -R 755 /var/www/knnector/
```

## 🔐 SSL 证书配置

### 使用 Let's Encrypt（推荐）

```bash
# 安装 Certbot
sudo apt install certbot python3-certbot-nginx

# 获取证书
sudo certbot --nginx -d knnector.com -d www.knnector.com

# 自动续期
sudo crontab -e
# 添加：0 12 * * * /usr/bin/certbot renew --quiet
```

### 手动证书

如果您有购买的 SSL 证书：
1. 将 `.crt` 文件放在 `/etc/ssl/certs/knnector.com.crt`
2. 将 `.key` 文件放在 `/etc/ssl/private/knnector.com.key`
3. 更新 Nginx 配置中的证书路径

## 🔍 监控和日志

### 检查服务状态

```bash
# 检查 Nginx 状态
sudo systemctl status nginx

# 检查配置语法
sudo nginx -t

# 查看访问日志
sudo tail -f /var/log/nginx/knnector.com.access.log

# 查看错误日志
sudo tail -f /var/log/nginx/knnector.com.error.log
```

### 性能优化

```bash
# 检查 Nginx 进程
ps aux | grep nginx

# 查看连接数
sudo netstat -tlnp | grep :80
sudo netstat -tlnp | grep :443
```

## 🧪 测试部署

### 1. 本地测试

```bash
# 测试 DNS 解析
nslookup knnector.com

# 测试连接
curl -I http://knnector.com
curl -I https://knnector.com
```

### 2. 功能测试

1. 访问 `https://knnector.com` 验证首页
2. 测试 API 调用：`https://knnector.com/api/health`
3. 测试动态路由：`https://knnector.com/products/1`
4. 测试表单提交和数据交互

## ⚠️ 注意事项

### 1. 后端服务配置

确保后端服务运行在 `localhost:8080` 并配置正确的 CORS：

```javascript
// 后端 CORS 配置示例
app.use(cors({
  origin: ['https://knnector.com', 'https://www.knnector.com'],
  credentials: true
}));
```

### 2. 防火墙设置

```bash
# 开放端口
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

### 3. 域名 DNS 设置

确保域名 DNS 记录指向您的服务器 IP：
- A 记录：`knnector.com` → `your-server-ip`
- A 记录：`www.knnector.com` → `your-server-ip`

## 🔄 更新部署流程

```bash
#!/bin/bash
# deploy.sh - 部署脚本

# 1. 本地构建
npm run build

# 2. 备份当前版本
sudo cp -r /var/www/knnector/frontend /var/www/knnector/frontend.backup.$(date +%Y%m%d_%H%M%S)

# 3. 上传新版本
rsync -avz --delete ./out/ user@server:/var/www/knnector/frontend/

# 4. 重新加载 Nginx
ssh user@server "sudo nginx -t && sudo systemctl reload nginx"

echo "部署完成！"
```

## 📞 问题排查

常见问题及解决方案：

1. **404 错误**：检查文件路径和 Nginx 配置
2. **API 调用失败**：检查代理配置和后端服务状态
3. **静态资源 404**：检查文件权限和缓存配置
4. **路由不工作**：检查 `try_files` 配置

需要帮助时，可以查看错误日志：
```bash
sudo tail -f /var/log/nginx/error.log
```