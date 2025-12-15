// 认证相关功能
// ------------------------------------------------------------
// 该文件实现前端认证与会话相关的核心逻辑，包括：
// 1) 表单展示切换（管理员登录/学生登录/学生注册）
// 2) 表单提交事件处理（登录与注册）
// 3) 前端基础校验（例如密码确认一致性）
// 4) 统一的 API 调用封装与消息提示
// 5) 已有会话的自动跳转（提升用户体验）
// 使用方式：在页面加载完成后初始化 AuthManager（见文末 DOMContentLoaded）
// ------------------------------------------------------------
class AuthManager {
    constructor() {
        this.currentUser = null;
        this.init();
    }

    init() {
        // 初始化阶段：绑定事件 + 检查是否已有登录会话
        this.setupEventListeners();
        this.checkExistingSession();
    }

    setupEventListeners() {
        // 认证选择器按钮事件：控制三种表单的显示
        document.getElementById('adminLoginBtn').addEventListener('click', () => {
            this.showForm('admin');
        });

        document.getElementById('studentLoginBtn').addEventListener('click', () => {
            this.showForm('student-login');
        });

        document.getElementById('studentRegisterBtn').addEventListener('click', () => {
            this.showForm('student-register');
        });

        // 表单提交事件：阻止原生提交，改为前端异步处理
        document.getElementById('adminLogin').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleAdminLogin(e.target);
        });

        document.getElementById('studentLogin').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleStudentLogin(e.target);
        });

        document.getElementById('studentRegister').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleStudentRegister(e.target);
        });

        // 密码确认验证：输入时即时提示，提高表单可用性
        document.getElementById('regConfirmPassword').addEventListener('input', (e) => {
            const password = document.getElementById('regPassword').value;
            const confirmPassword = e.target.value;

            if (password !== confirmPassword) {
                e.target.setCustomValidity('密码不匹配');
            } else {
                e.target.setCustomValidity('');
            }
        });
    }

    showForm(formType) {
        // 隐藏所有表单，移除按钮高亮，再显示目标表单
        document.querySelectorAll('.auth-form').forEach(form => {
            form.classList.remove('active');
        });

        // 移除所有按钮的活动状态
        document.querySelectorAll('.selector-btn').forEach(btn => {
            btn.classList.remove('active');
        });

        // 显示选中的表单并高亮对应按钮
        switch(formType) {
            case 'admin':
                document.getElementById('adminLoginForm').classList.add('active');
                document.getElementById('adminLoginBtn').classList.add('active');
                break;
            case 'student-login':
                document.getElementById('studentLoginForm').classList.add('active');
                document.getElementById('studentLoginBtn').classList.add('active');
                break;
            case 'student-register':
                document.getElementById('studentRegisterForm').classList.add('active');
                document.getElementById('studentRegisterBtn').classList.add('active');
                break;
        }
    }

    async handleAdminLogin(form) {
        // 管理员登录流程：收集表单 -> 调用后端 -> 存储会话 -> 页面跳转
        const formData = new FormData(form);
        const username = formData.get('username');
        const password = formData.get('password');

        try {
            this.showMessage('正在登录...', 'info');

            const response = await this.apiCall('/api/auth/admin/login', {
                method: 'POST',
                body: JSON.stringify({ username, password })
            });

            if (response.success) {
                this.showMessage('登录成功！', 'success');
                // 保存会话信息：仅保存必要的标识数据，避免敏感信息泄露
                localStorage.setItem('adminSession', JSON.stringify({
                    id: response.admin.id,
                    username: response.admin.username,
                    type: 'admin'
                }));

                // 跳转到管理员页面：稍作延迟以展示提示
                setTimeout(() => {
                    window.location.href = '/admin.html';
                }, 1000);
            } else {
                this.showMessage(response.message || '登录失败', 'error');
            }
        } catch (error) {
            // 统一错误提示：后端错误或网络异常
            this.showMessage('登录失败：' + error.message, 'error');
        }
    }

    async handleStudentLogin(form) {
        // 学生登录流程：与管理员登录类似
        const formData = new FormData(form);
        const studentId = formData.get('studentId');
        const password = formData.get('password');

        try {
            this.showMessage('正在登录...', 'info');

            const response = await this.apiCall('/api/auth/student/login', {
                method: 'POST',
                body: JSON.stringify({ studentId, password })
            });

            if (response.success) {
                this.showMessage('登录成功！', 'success');
                // 保存会话信息：用于后续页面展示与权限分流
                localStorage.setItem('studentSession', JSON.stringify({
                    studentId: response.student.student_id,
                    name: response.student.name,
                    type: 'student'
                }));

                // 跳转到学生页面
                setTimeout(() => {
                    window.location.href = '/student.html';
                }, 1000);
            } else {
                this.showMessage(response.message || '登录失败', 'error');
            }
        } catch (error) {
            this.showMessage('登录失败：' + error.message, 'error');
        }
    }

    async handleStudentRegister(form) {
        // 学生注册流程：前端做基础校验，后端做严格校验与入库
        const formData = new FormData(form);
        const password = formData.get('password');
        const confirmPassword = formData.get('confirmPassword');

        // 验证密码匹配：避免无效请求
        if (password !== confirmPassword) {
            this.showMessage('密码不匹配', 'error');
            return;
        }

        try {
            this.showMessage('正在注册...', 'info');

            // 采集表单字段并进行基本类型处理
            const studentData = {
                studentId: formData.get('studentId'),
                name: formData.get('name'),
                gender: formData.get('gender'),
                age: parseInt(formData.get('age')),
                className: formData.get('className'),
                major: formData.get('major'),
                phone: formData.get('phone'),
                email: formData.get('email'),
                password: password
            };

            const response = await this.apiCall('/api/auth/student/register', {
                method: 'POST',
                body: JSON.stringify(studentData)
            });

            if (response.success) {
                this.showMessage('注册成功！请登录', 'success');
                // 清空表单并引导用户前往登录
                form.reset();
                setTimeout(() => {
                    this.showForm('student-login');
                }, 1500);
            } else {
                this.showMessage(response.message || '注册失败', 'error');
            }
        } catch (error) {
            this.showMessage('注册失败：' + error.message, 'error');
        }
    }

    async apiCall(endpoint, options = {}) {
        // 统一的 API 调用封装：规范请求头、错误处理与返回结构
        const defaultOptions = {
            headers: {
                'Content-Type': 'application/json',
            }
        };

        const finalOptions = {
            ...defaultOptions,
            ...options,
            headers: {
                ...defaultOptions.headers,
                ...options.headers
            }
        };

        const response = await fetch(endpoint, finalOptions);
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || '请求失败');
        }

        return data;
    }

    showMessage(message, type = 'info') {
        // 在页面右上角/指定区域展示短暂消息提示
        const messageArea = document.getElementById('messageArea');
        const messageElement = document.createElement('div');
        messageElement.className = `message ${type}`;
        messageElement.textContent = message;

        messageArea.appendChild(messageElement);

        // 3秒后自动移除消息
        setTimeout(() => {
            messageElement.remove();
        }, 3000);
    }

    checkExistingSession() {
        // 如果已登录，直接分流到对应页面，避免重复登录
        const adminSession = localStorage.getItem('adminSession');
        const studentSession = localStorage.getItem('studentSession');

        if (adminSession) {
            window.location.href = '/admin.html';
        } else if (studentSession) {
            window.location.href = '/student.html';
        }
    }

    logout() {
        // 清理所有会话信息并返回主页
        localStorage.removeItem('adminSession');
        localStorage.removeItem('studentSession');
        window.location.href = '/';
    }
}

// 全局工具函数
function showMessage(message, type = 'info') {
    // 备用消息函数：当页面没有消息区域时自动创建
    const messageArea = document.getElementById('messageArea') || createMessageArea();
    const messageElement = document.createElement('div');
    messageElement.className = `message ${type}`;
    messageElement.textContent = message;

    messageArea.appendChild(messageElement);

    setTimeout(() => {
        messageElement.remove();
    }, 3000);
}

function createMessageArea() {
    // 动态创建消息区域：兼容不同页面结构
    const messageArea = document.createElement('div');
    messageArea.id = 'messageArea';
    messageArea.className = 'message-area';
    document.body.appendChild(messageArea);
    return messageArea;
}

// 初始化认证管理器
document.addEventListener('DOMContentLoaded', () => {
    // 页面就绪后实例化并接管表单逻辑
    window.authManager = new AuthManager();
});
