# 部署指南

本指南将帮助您将学生信息管理系统部署到 Vercel 平台。

## 前置要求

1. GitHub 账号
2. Vercel 账号
3. Neon 数据库账号

## 步骤 1: 准备 Neon 数据库

### 1.1 创建数据库
1. 访问 [Neon Console](https://console.neon.tech/)
2. 创建新项目
3. 选择区域（推荐选择离用户最近的区域）
4. 设置数据库名称（如：student_management）

### 1.2 初始化数据库结构
1. 在 Neon Console 中打开 SQL 编辑器
2. 复制并执行 `database/schema.sql` 中的内容
3. 确认表创建成功

### 1.3 获取连接字符串
1. 在项目详情页找到 Connection Details
2. 复制 Connection String，格式如：
   ```
   postgresql://username:password@ep-xxxxx.us-east-1.aws.neon.tech/dbname?sslmode=require
   ```

## 步骤 2: 推送代码到 GitHub

### 2.1 创建仓库
```bash
git init
git add .
git commit -m "Initial commit: 学生信息管理系统"
```

### 2.2 推送到 GitHub
1. 在 GitHub 创建新仓库 `student-info-system`
2. 推送代码：
```bash
git remote add origin https://github.com/yourusername/student-info-system.git
git branch -M main
git push -u origin main
```

## 步骤 3: 部署到 Vercel

### 3.1 导入项目
1. 访问 [Vercel Dashboard](https://vercel.com/dashboard)
2. 点击 "Add New..." → "Project"
3. 导入 GitHub 仓库 `student-info-system`
4. Vercel 会自动检测项目配置

### 3.2 配置环境变量
在部署配置页面添加环境变量：

```
DATABASE_URL=postgresql://username:password@ep-xxxxx.us-east-1.aws.neon.tech/dbname?sslmode=require
```

**重要**: 将 `username:password@ep-xxxxx.us-east-1.aws.neon.tech/dbname` 替换为您的实际数据库信息。

### 3.3 部署设置
- **Framework Preset**: Other
- **Root Directory**: ./
- **Build Command**: 留空（无需构建）
- **Output Directory**: public（留空使用默认）
- **Install Command**: `npm install`

### 3.4 完成部署
1. 点击 "Deploy" 按钮
2. 等待部署完成
3. 获取部署 URL（如：https://student-info-system.vercel.app）

## 步骤 4: 验证部署

### 4.1 测试功能
1. 访问部署的 URL
2. 测试管理员登录（admin/admin）
3. 测试学生注册和登录
4. 测试学生信息管理功能

### 4.2 ���查日志
如果遇到问题：
1. 在 Vercel Dashboard 查看函数日志
2. 检查环境变量配置
3. 验证数据库连接

## 常见问题

### Q: 部署后出现 500 错误
**A**: 检查环境变量配置，确保 `DATABASE_URL` 正确设置。

### Q: 数据库连接失败
**A**:
1. 确认 Neon 数据库正在运行
2. 验证连接字符串格式
3. 检查网络连接

### Q: 函数调用失败
**A**:
1. 查看 Vercel 函数日志
2. 检查 API 路由配置
3. 验证 `vercel.json` 配置

### Q: 中文显示乱码
**A**:
1. 确保数据库字符集为 UTF-8
2. 检查 HTML 文件的 `<meta charset="UTF-8">` 标签

## 自定义域名（可选）

### 1. 添加域名
1. 在 Vercel 项目设置中点击 "Domains"
2. 添加您的域名（如：www.yourdomain.com）

### 2. 配置 DNS
按照 Vercel 提示配置 DNS 记录：
```
Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

### 3. 验证 SSL
Vercel 会自动为您的域名配置 SSL 证书。

## 性能优化建议

### 1. 数据库优化
- 为常用查询字段添加索引
- 定期清理无用数据
- 监控数据库性能

### 2. 缓存策略
- 启用 Vercel Edge Caching
- 合理设置缓存头
- 考虑使用 CDN

### 3. 代码优化
- 压缩 CSS 和 JavaScript
- 优化图片资源
- 减少 HTTP 请求

## 监控和维护

### 1. 错误监控
- 启用 Vercel Analytics
- 设置错误通知
- 定期检查函数日志

### 2. 备份策略
- 定期备份 Neon 数据库
- 保存部署配置
- 维护代码版本

### 3. 安全维护
- 定期更新依赖
- 监控安全漏洞
- 及时修复问题

## 生产环境注意事项

### 1. 安全加固
- 修改默认管理员密码
- 启用 HTTPS
- 配置防火墙规则

### 2. 数据保护
- 实施密码加密
- 设置访问权限
- 遵守数据保护法规

### 3. 扩展性考虑
- 评估并发用户数
- 规划数据库扩容
- 考虑负载均衡

---

**完成以上步骤后，您的学生信息管理系统就可以在生产环境中运行了！**