// 学生登录API
const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

module.exports = async (req, res) => {
    // 设置CORS头
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
        const { studentId, password } = req.body;

        if (!studentId || !password) {
            return res.status(400).json({
                success: false,
                message: '学号和密码不能为空'
            });
        }

        // 查询学生信息
        const query = `
            SELECT student_id, name, gender, age, class_name, major, phone, email, password
            FROM students
            WHERE student_id = $1
        `;
        const result = await pool.query(query, [studentId]);

        if (result.rows.length === 0) {
            return res.status(401).json({
                success: false,
                message: '学号或密码错误'
            });
        }

        const student = result.rows[0];

        // 注意：这里为了简化，直接比较明文密码
        // 实际生产环境中应该使用 bcrypt 等加密方式
        if (student.password !== password) {
            return res.status(401).json({
                success: false,
                message: '学号或密码错误'
            });
        }

        // 返回成功响应（不包含密码）
        res.status(200).json({
            success: true,
            message: '登录成功',
            student: {
                student_id: student.student_id,
                name: student.name,
                gender: student.gender,
                age: student.age,
                class_name: student.class_name,
                major: student.major,
                phone: student.phone,
                email: student.email
            }
        });

    } catch (error) {
        console.error('学生登录错误:', error);
        res.status(500).json({
            success: false,
            message: '服务器内部错误'
        });
    }
};