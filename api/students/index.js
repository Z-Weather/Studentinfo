// 学生信息管理API - 获取所有学生信息
// ------------------------------------------------------------
// 职责：
// - GET：按搜索词/班级/专业筛选学生列表并分页（分页在前端处理）
// - POST：由管理员添加新学生（包含基本校验与唯一性检查）
// 通用：
// - CORS 与 OPTIONS 预检处理
// - 统一错误响应与日志
// ------------------------------------------------------------
const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

module.exports = async (req, res) => {
    // 设置CORS头：允许跨域与预检
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method === 'GET') {
        try {
            // 获取查询参数：search/class/major 均为可选
            const { search, class: className, major } = req.query;

            let query = `
                SELECT student_id, name, gender, age, class_name, major, phone, email, created_at, updated_at
                FROM students
                WHERE 1=1
            `;

            const params = [];
            let paramIndex = 1;

            // 添加搜索条件：模糊匹配姓名/学号/班级
            if (search) {
                query += ` AND (
                    name ILIKE $${paramIndex} OR
                    student_id ILIKE $${paramIndex} OR
                    class_name ILIKE $${paramIndex}
                )`;
                params.push(`%${search}%`);
                paramIndex++;
            }

            // 添加班级筛选：模糊匹配班级名
            if (className) {
                query += ` AND class_name ILIKE $${paramIndex}`;
                params.push(`%${className}%`);
                paramIndex++;
            }

            // 添加专业筛选：模糊匹配专业名
            if (major) {
                query += ` AND major ILIKE $${paramIndex}`;
                params.push(`%${major}%`);
                paramIndex++;
            }

            // 排序：按学号升序
            query += ` ORDER BY student_id ASC`;

            const result = await pool.query(query, params);

            res.status(200).json({
                success: true,
                message: '获取学生信息成功',
                students: result.rows,
                total: result.rows.length
            });

        } catch (error) {
            // 统一错误日志与响应
            console.error('获取学生信息错误:', error);
            res.status(500).json({
                success: false,
                message: '服务器内部错误'
            });
        }
    } else if (req.method === 'POST') {
        // 添加新学生（由管理员操作）
        try {
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

            // 验证必填字段：基本兜底校验
            if (!studentId || !name || !password) {
                return res.status(400).json({
                    success: false,
                    message: '学号、姓名和密码不能为空'
                });
            }

            // 检查学号是否已存在：保持主键唯一性
            const checkQuery = 'SELECT student_id FROM students WHERE student_id = $1';
            const checkResult = await pool.query(checkQuery, [studentId]);

            if (checkResult.rows.length > 0) {
                return res.status(409).json({
                    success: false,
                    message: '该学号已存在'
                });
            }

            // 插入新学生：示例使用明文密码，生产需加密
            const insertQuery = `
                INSERT INTO students (
                    student_id, name, gender, age, class_name, major, phone, email, password
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
                RETURNING student_id, name, gender, age, class_name, major, phone, email, created_at
            `;

            const insertResult = await pool.query(insertQuery, [
                studentId, name, gender || null, age || null, className || null,
                major || null, phone || null, email || null, password
            ]);

            res.status(201).json({
                success: true,
                message: '添加学生成功',
                student: insertResult.rows[0]
            });

        } catch (error) {
            console.error('添加学生错误:', error);
            res.status(500).json({
                success: false,
                message: '服务器内部错误'
            });
        }
    } else {
        res.status(405).json({
            success: false,
            message: '方法不允许'
        });
    }
};
