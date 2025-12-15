// 学生注册API
// ------------------------------------------------------------
// 该 Serverless Function 负责学生注册：
// - 处理 CORS 与仅允许 POST 方法
// - 校验必填字段、年龄范围与邮箱格式
// - 检查学号唯一性，防止重复注册
// - 将新学生写入数据库并返回基础信息（不含密码）
// 安全提示：当前示例使用明文密码，生产环境需使用加密存储（如 bcrypt）
// ------------------------------------------------------------
const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

module.exports = async (req, res) => {
    // 设置CORS头：允许跨域访问与预检请求
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ success: false, message: '方法不允许' });
    }

    try {
        // 解构请求体：前端传入的注册信息
        const {
            studentId,
            name,
            gender,
            age,
            className,
            major,
            phone,
            email,
            password
        } = req.body;

        // 验证必填字段：后端兜底校验，增强数据可靠性
        if (!studentId || !name || !gender || !age || !className || !major || !phone || !email || !password) {
            return res.status(400).json({
                success: false,
                message: '请填写完整的注册信息'
            });
        }

        // 验证年龄范围：符合业务规则 [15, 50]
        if (age < 15 || age > 50) {
            return res.status(400).json({
                success: false,
                message: '年龄必须在15-50岁之间'
            });
        }

        // 验证邮箱格式：正则简单校验基本形态
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                success: false,
                message: '请输入有效的邮箱地址'
            });
        }

        // 检查学号是否已存在：保持主键唯一性
        const checkQuery = 'SELECT student_id FROM students WHERE student_id = $1';
        const checkResult = await pool.query(checkQuery, [studentId]);

        if (checkResult.rows.length > 0) {
            return res.status(409).json({
                success: false,
                message: '该学号已被注册'
            });
        }

        // 插入新学生记录：写入基本信息与密码（示例为明文）
        const insertQuery = `
            INSERT INTO students (
                student_id, name, gender, age, class_name, major, phone, email, password
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
            RETURNING student_id, name, gender, age, class_name, major, phone, email
        `;

        const insertResult = await pool.query(insertQuery, [
            studentId, name, gender, age, className, major, phone, email, password
        ]);

        const newStudent = insertResult.rows[0];

        res.status(201).json({
            success: true,
            message: '注册成功',
            student: newStudent
        });

    } catch (error) {
        // 统一错误日志与响应：避免泄露内部细节
        console.error('学生注册错误:', error);
        res.status(500).json({
            success: false,
            message: '服务器内部错误'
        });
    }
};
