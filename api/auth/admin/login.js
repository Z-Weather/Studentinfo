// 管理员登录API
// ------------------------------------------------------------
// 职责：验证管理员用户名与密码，返回基础管理员信息
// 流程：CORS -> 方法校验 -> 参数校验 -> 查询管理员 -> 明文密码对比 -> 返回JSON
// 安全提示：示例代码使用明文密码，生产环境需加密（如 bcrypt）
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
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ success: false, message: '方法不允许' });
    }

    try {
        // 基本参数校验
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({
                success: false,
                message: '用户名和密码不能为空'
            });
        }

        // 查询管理员信息：读取密码用于对比，其余字段用于返回
        const query = 'SELECT id, username, password FROM admins WHERE username = $1';
        const result = await pool.query(query, [username]);

        if (result.rows.length === 0) {
            return res.status(401).json({
                success: false,
                message: '用户名或密码错误'
            });
        }

        const admin = result.rows[0];

        // 注意：这里为了简化，直接比较明文密码
        // 实际生产环境中应该使用 bcrypt 等加密方式
        if (admin.password !== password) {
            return res.status(401).json({
                success: false,
                message: '用户名或密码错误'
            });
        }

        // 返回成功响应（不包含密码）：保护隐私
        res.status(200).json({
            success: true,
            message: '登录成功',
            admin: {
                id: admin.id,
                username: admin.username
            }
        });

    } catch (error) {
        // 统一错误处理
        console.error('管理员登录错误:', error);
        res.status(500).json({
            success: false,
            message: '服务器内部错误'
        });
    }
};
