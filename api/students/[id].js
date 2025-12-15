// 学生信息管理API - 根据ID获取、更新、删除学生信息
// ------------------------------------------------------------
// 职责：
// - GET    ：按学号查询单个学生信息
// - PUT    ：按学号更新指定字段（动态构建 UPDATE 语句）
// - DELETE ：按学号删除学生记录
// 通用：
// - CORS 与 OPTIONS 预检处理
// - 参数校验与统一错误响应
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
    res.setHeader('Access-Control-Allow-Methods', 'GET, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    const studentId = req.query.id;

    if (!studentId) {
        // 基本参数校验
        return res.status(400).json({
            success: false,
            message: '学号不能为空'
        });
    }

    if (req.method === 'GET') {
        try {
            const query = `
                SELECT student_id, name, gender, age, class_name, major, phone, email, created_at, updated_at
                FROM students
                WHERE student_id = $1
            `;

            const result = await pool.query(query, [studentId]);

            if (result.rows.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: '学生不存在'
                });
            }

            res.status(200).json({
                success: true,
                message: '获取学生信息成功',
                student: result.rows[0]
            });

        } catch (error) {
            // 统一错误日志与响应
            console.error('获取学生信息错误:', error);
            res.status(500).json({
                success: false,
                message: '服务器内部错误'
            });
        }
    } else if (req.method === 'PUT') {
        try {
            const {
                name,
                gender,
                age,
                className,
                major,
                phone,
                email,
                password
            } = req.body;

            // 检查学生是否存在：避免更新不存在的记录
            const checkQuery = 'SELECT student_id FROM students WHERE student_id = $1';
            const checkResult = await pool.query(checkQuery, [studentId]);

            if (checkResult.rows.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: '学生不存在'
                });
            }

            // 构建更新查询：仅更新传入的字段，避免覆盖未传字段
            let updateQuery = 'UPDATE students SET ';
            const updateParams = [];
            let paramIndex = 1;
            const updates = [];

            if (name !== undefined) {
                updates.push(`name = $${paramIndex}`);
                updateParams.push(name);
                paramIndex++;
            }

            if (gender !== undefined) {
                updates.push(`gender = $${paramIndex}`);
                updateParams.push(gender);
                paramIndex++;
            }

            if (age !== undefined) {
                updates.push(`age = $${paramIndex}`);
                updateParams.push(age);
                paramIndex++;
            }

            if (className !== undefined) {
                updates.push(`class_name = $${paramIndex}`);
                updateParams.push(className);
                paramIndex++;
            }

            if (major !== undefined) {
                updates.push(`major = $${paramIndex}`);
                updateParams.push(major);
                paramIndex++;
            }

            if (phone !== undefined) {
                updates.push(`phone = $${paramIndex}`);
                updateParams.push(phone);
                paramIndex++;
            }

            if (email !== undefined) {
                updates.push(`email = $${paramIndex}`);
                updateParams.push(email);
                paramIndex++;
            }

            if (password !== undefined) {
                // 注意：示例为明文存储，生产环境需加密
                updates.push(`password = $${paramIndex}`);
                updateParams.push(password);
                paramIndex++;
            }

            if (updates.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: '没有要更新的字段'
                });
            }

            updateQuery += updates.join(', ') + `, updated_at = CURRENT_TIMESTAMP WHERE student_id = $${paramIndex}`;
            updateParams.push(studentId);

            await pool.query(updateQuery, updateParams);

            // 获取更新后的学生信息
            const selectQuery = `
                SELECT student_id, name, gender, age, class_name, major, phone, email, updated_at
                FROM students
                WHERE student_id = $1
            `;

            const result = await pool.query(selectQuery, [studentId]);

            res.status(200).json({
                success: true,
                message: '更新学生信息成功',
                student: result.rows[0]
            });

        } catch (error) {
            console.error('更新学生信息错误:', error);
            res.status(500).json({
                success: false,
                message: '服务器内部错误'
            });
        }
    } else if (req.method === 'DELETE') {
        try {
            // 检查学生是否存在：避免误删或重复删除
            const checkQuery = 'SELECT student_id FROM students WHERE student_id = $1';
            const checkResult = await pool.query(checkQuery, [studentId]);

            if (checkResult.rows.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: '学生不存在'
                });
            }

            // 删除学生记录：严格按学号删除
            const deleteQuery = 'DELETE FROM students WHERE student_id = $1';
            await pool.query(deleteQuery, [studentId]);

            res.status(200).json({
                success: true,
                message: '删除学生成功'
            });

        } catch (error) {
            console.error('删除学生错误:', error);
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
