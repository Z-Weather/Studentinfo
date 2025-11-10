# 学生信息管理系统

一个基于Web的学生信息管理系统，支持管理员和学生两种角色，提供完整的学生信息管理功能。

## 功能特性

### 管理员功能
- ✅ 登录认证（默认账号：admin/admin）
- ✅ 学生信息的增、删、改、查
- ✅ 学生信息搜索和筛选
- ✅ 分页显示
- ✅ 批量操作支持

### 学生功能
- ✅ 注册账号
- ✅ 登���查看个人信息
- ✅ 编辑个人资料
- ✅ 修改密码
- ✅ 导出个人信息

### 技术特性
- ✅ 响应式设计，支持移动端
- ✅ 现代化UI界面
- ✅ 完整的错误处理
- ✅ 数据验证和安全保护
- ✅ 会话管理

## 技术栈

- **前端**: HTML5, CSS3, JavaScript (ES6+)
- **后端**: Vercel Serverless Functions
- **数据库**: Neon (PostgreSQL)
- **部署**: Vercel

## 项目结构

```
student-info-system/
├── api/                          # Vercel Serverless Functions
│   ├── auth/
│   │   ├── admin/
│   │   │   └── login.js          # 管理员登录
│   │   └── student/
│   │       ├── login.js          # 学生登录
│   │       └── register.js       # 学生注册
│   └── students/
│       ├── index.js              # 获取/添加学生
│       └── [id].js               # 更新/删除学生
├── css/
│   └── styles.css                # 样式文件
├── js/
│   ├── auth.js                   # 认证功能
│   ├── admin.js                  # 管理员页面
│   └── student.js                # 学生页面
├── database/
│   └── schema.sql                # 数据库结构
├── index.html                    # 主页（登录/注册）
├── admin.html                    # 管理员页面
├── student.html                  # 学生页面
├── package.json                  # 项目配置
├── vercel.json                   # Vercel配置
└── README.md                     # 项目文档
```

## 快速开始

### 1. 环境准备

1. 注册 [Neon](https://neon.tech/) 账号并创建数据库
2. 注册 [Vercel](https://vercel.com/) 账号

### 2. 数据库初始化

1. 登录 Neon 控制台
2. 执行 `database/schema.sql` 文件创建表结构
3. 获取数据库连接字符串

### 3. 项目部署

1. 将项目推送到 GitHub 仓库
2. 在 Vercel 中导入项目
3. 配置环境变量：
   ```
   DATABASE_URL=postgresql://username:password@ep-xxxxx.us-east-1.aws.neon.tech/dbname?sslmode=require
   ```

### 4. 本地开发

```bash
# 安装依赖
npm install

# 启动本地开发服务器
npm run dev
```

访问 `http://localhost:3000` 查看应用。

## 数据库设计

### 管理员表 (admins)
| 字段 | 类型 | 说明 |
|------|------|------|
| id | SERIAL | 主键 |
| username | VARCHAR(50) | 用户名（唯一） |
| password | VARCHAR(255) | 密码 |
| created_at | TIMESTAMP | 创建时间 |

### 学生表 (students)
| 字段 | 类型 | 说明 |
|------|------|------|
| student_id | VARCHAR(20) | 学号（主键） |
| name | VARCHAR(50) | 姓名 |
| gender | VARCHAR(10) | 性别 |
| age | INTEGER | 年龄 |
| class_name | VARCHAR(50) | 班级 |
| major | VARCHAR(100) | 专业 |
| phone | VARCHAR(20) | 电话 |
| email | VARCHAR(100) | 邮箱 |
| password | VARCHAR(255) | 密码 |
| created_at | TIMESTAMP | 创建时间 |
| updated_at | TIMESTAMP | 更新时间 |

## API 接口

### 认证接口

#### 管理员登录
- **URL**: `POST /api/auth/admin/login`
- **Body**: `{ username, password }`
- **Response**: `{ success, message, admin }`

#### 学生登录
- **URL**: `POST /api/auth/student/login`
- **Body**: `{ studentId, password }`
- **Response**: `{ success, message, student }`

#### 学生注册
- **URL**: `POST /api/auth/student/register`
- **Body**: `{ studentId, name, gender, age, className, major, phone, email, password }`
- **Response**: `{ success, message, student }`

### 学生管理接口

#### 获取学生列表
- **URL**: `GET /api/students`
- **Query**: `{ search, class, major }`
- **Response**: `{ success, message, students, total }`

#### 获取单个学生
- **URL**: `GET /api/students/{id}`
- **Response**: `{ success, message, student }`

#### 添加学生
- **URL**: `POST /api/students`
- **Body**: 学生信息对象
- **Response**: `{ success, message, student }`

#### 更新学生
- **URL**: `PUT /api/students/{id}`
- **Body**: 学生信息对象
- **Response**: `{ success, message, student }`

#### 删除学生
- **URL**: `DELETE /api/students/{id}`
- **Response**: `{ success, message }`

## 默认账号

系统预置了一个默认管理员账号：
- 用户名：`admin`
- 密码：`admin`

**注意：首次登录后请立即修改密码！**

## 安全说明

1. **密码存储**: 当前版本为了简化使用明文密码存储，生产环境应使用 bcrypt 等加密方式
2. **会话管理**: 使用 localStorage 存储会话信息，生产环境建议使用 JWT 或其他安全方式
3. **输入验证**: 前后端都进行了基本的输入验证，防止SQL注入等攻击
4. **HTTPS**: 生产环境必须使用 HTTPS 协议

## 浏览器支持

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## 贡献指南

1. Fork 本项目
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开 Pull Request

## 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 支持

如有问题或建议，请提交 Issue 或联系项目维护者。

---

**注意**: 这是一个演示项目，生产环境使用前请务必完善安全措施。