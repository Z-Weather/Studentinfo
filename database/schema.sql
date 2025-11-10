-- 学生信息管理系统数据库结构
-- 使用 Neon 数据库

-- 创建管理员表
CREATE TABLE IF NOT EXISTS admins (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 创建学生表
CREATE TABLE IF NOT EXISTS students (
    student_id VARCHAR(20) PRIMARY KEY,  -- 学号作为主键
    name VARCHAR(50) NOT NULL,
    gender VARCHAR(10),
    age INTEGER,
    class_name VARCHAR(50),
    major VARCHAR(100),
    phone VARCHAR(20),
    email VARCHAR(100),
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 插入默认管理员账号 (用户名: admin, 密码: admin)
-- 注意：这里密码是明文，实际使用时需要在应用层加密
INSERT INTO admins (username, password)
VALUES ('admin', 'admin')
ON CONFLICT (username) DO NOTHING;

-- 创建索引以优化查询性能
CREATE INDEX IF NOT EXISTS idx_students_name ON students(name);
CREATE INDEX IF NOT EXISTS idx_students_class ON students(class_name);
CREATE INDEX IF NOT EXISTS idx_students_major ON students(major);

-- 添加更新时间触发器
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_students_updated_at
    BEFORE UPDATE ON students
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();