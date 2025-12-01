# 学生信息管理系统 - Claude 开发指南

## Commands (常用命令)

- **启动开发服务器**: `npm run dev` 或 `vercel dev`
- **构建**: `npm run build` (当前为空构建步骤，纯静态项目)
- **启动**: `npm start` (等同于 `vercel dev`)

**重要备注：Testing is handled manually by the user. Do not run tests automatically.** (测试由用户手动进行，不要自动运行测试)

## Tech Stack (技术栈)

### 前端技术栈
- **基础框架**: 纯 HTML5 + CSS3 + JavaScript (ES6+)
- **CSS架构**: 移动优先的响应式设计，CSS Grid + Flexbox布局
- **UI框架**: 无第三方UI框架，自定义组件系统
- **状态管理**: 基于localStorage的简单会话管理
- **构建工具**: 无构建步骤，直接运行源码

### 后端技术栈
- **运行环境**: Vercel Serverless Functions
- **数据库**: Neon PostgreSQL 云数据库
- **ORM/数据库驱动**: pg (node-postgres) 原生驱动
- **API架构**: RESTful API 设计

### 部署与DevOps
- **部署平台**: Vercel
- **数据库服务**: Neon.tech
- **环境配置**: 基于环境变量的配置管理

## Project Structure (架构分析)

### 核心目录结构
```
/                          # 项目根目录
├── index.html            # 主登录页面入口
├── admin.html            # 管理员专用页面
├── student.html          # 学生专用页面
├── css/
│   └── styles.css        # 全局样式文件（移动优先响应式设计）
├── js/
│   ├── auth.js          # 认证管理器（AuthManager类）
│   ├── admin.js         # 管理员功能（AdminDashboard类）
│   └── student.js       # 学生功能（StudentDashboard类）
├── api/
│   ├── auth/            # 认证相关API端点
│   │   ├── admin/login.js      # 管理员登录API
│   │   ├── student/login.js    # 学生登录API
│   │   └── student/register.js # 学生注册API
│   └── students/
│       ├── index.js     # 学生信息CRUD API（GET, POST）
│       └── [id].js      # 单个学生操作API（GET, PUT, DELETE）
├── database/
│   └── schema.sql       # 数据库结构定义和初始数据
└── 配置文件 (.env.example, package.json, vercel.json)
```

### 核心业务逻辑位置
- **认证逻辑**: `js/auth.js` + `api/auth/` 目录
- **数据管理**: `js/admin.js` + `api/students/` 目录
- **用户界面**: 各HTML文件 + `css/styles.css`
- **数据��层**: `database/schema.sql` + 各API文件中的数据库操作

### 数据流向
1. **用户交互**: HTML页面 → JavaScript类 → API调用
2. **服务处理**: Vercel Serverless Functions → 数据库操作
3. **数据返回**: 响应格式化 → 前端界面更新

## Code Style & Conventions (代码风格与规范)

### 命名风格约定
- **变量/函数**: 驼峰命名法 (camelCase)
  - 示例: `studentInfo`, `loadStudents()`, `currentEditingStudent`
- **常量**: 大写下划线 (UPPER_SNAKE_CASE)
  - 示例: `DATABASE_URL`, `JWT_SECRET`
- **CSS类名**: 短横线连接 (kebab-case)
  - 示例: `.form-container`, `.modal-content`, `.btn-primary`
- **数据库字段**: 下划线连接 (snake_case)
  - 示例: `student_id`, `class_name`, `created_at`
- **文件名**: 短横线连接 (kebab-case) - 用于资源文件
  - 示例: `index.html`, `styles.css`
- **API端点**: REST风格路径
  - 示例: `/api/students/[id].js`, `/api/auth/admin/login.js`

### JavaScript代码规范

#### 类结构与组件写法
- **主架构**: 使用ES6 Class进行模块化设计
- **类组织模式**:
  ```javascript
  class ManagerName {
      constructor() {
          // 初始化状态
          this.init();
      }

      init() {
          // 设置事件监听器
          this.setupEventListeners();
          // 初始化数据
          this.loadData();
      }

      setupEventListeners() {
          // DOM事件绑定
      }

      // 业务方法...

      showMessage(message, type = 'info') {
          // 统一消息提示方法
      }
  }
  ```

#### 异步处理模式
- **API调用**: 统一的async/await模式
- **错误处理**: try-catch包装 + 用户友好提示
- **响应格式**: 统一JSON格式 `{success: boolean, message: string, data?: any}`

#### DOM操作约定
- **选择器优先级**: getElementById > querySelector
- **事件监听**: 使用addEventListener进行事件绑定
- **动态元素**: 使用document.createElement和模板字符串

### API开发规范

#### Vercel Serverless Functions结构
```javascript
// 标准API结构
const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

module.exports = async (req, res) => {
    // CORS设置
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // OPTIONS预检处理
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    // 方法验证
    if (req.method !== 'POST') {
        return res.status(405).json({ success: false, message: '方法不允许' });
    }

    try {
        // 业务逻辑处理
        const result = await pool.query(query, params);
        res.status(200).json({ success: true, message: '操作成功', data: result.rows });
    } catch (error) {
        console.error('API错误:', error);
        res.status(500).json({ success: false, message: '服务器内部错误' });
    }
};
```

### 数据库操作约定
- **查询方式**: 使用参数化查询防止SQL注入
- **连接池**: 使用pg连接池管理数据库连接
- **索引策略**: 在常用查询字段上建立索引 (name, class_name, major)

### CSS架构约定
- **布局**: 移动优先的响应式设计
- **方法论**: BEM-like的CSS类命名
- **布局系统**: CSS Grid (主要布局) + Flexbox (组件内部)
- **断点**: 768px (tablet), 480px (mobile)
- **动画**: CSS3 transition和keyframes动画

### 安全约定
- **密码存储**: 当前为明文（需改进），建议使用bcrypt
- **会话管理**: localStorage简单存储（建议升级为JWT）
- **输入验证**: 前后端双重验证
- **SQL安全**: 参数化查询防止注入

### 错误处理约定
- **用户界面**: 右上角消息提示，3秒自动消失
- **API错误**: 统一错误格式和HTTP状态码
- **日志记录**: console.error用于调试，生产环境建议使用日志服务

### 代码组织原则
- **单一职责**: 每个类和函数专注单一功能
- **DRY原则**: 公共功能提取到基类或工具函数
- **配置外化**: 敏感信息通过环境变量管理
- **无框架依赖**: 保持轻量级，避免不必要的第三方依赖