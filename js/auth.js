// 认证相关功能
class AuthManager {
    constructor() {
        this.currentUser = null;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.checkExistingSession();
    }

    setupEventListeners() {
        // 认证选择器按钮事件
        document.getElementById('adminLoginBtn').addEventListener('click', () => {
            this.showForm('admin');
        });

        document.getElementById('studentLoginBtn').addEventListener('click', () => {
            this.showForm('student-login');
        });

        document.getElementById('studentRegisterBtn').addEventListener('click', () => {
            this.showForm('student-register');
        });

        // 表单提交事件
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

        // 密码确认验证
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
        // 隐藏所有表单
        document.querySelectorAll('.auth-form').forEach(form => {
            form.classList.remove('active');
        });

        // 移除所有按钮的活动状态
        document.querySelectorAll('.selector-btn').forEach(btn => {
            btn.classList.remove('active');
        });

        // 显示选中的表单
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
                // 保存会话信息
                localStorage.setItem('adminSession', JSON.stringify({
                    id: response.admin.id,
                    username: response.admin.username,
                    type: 'admin'
                }));

                // 跳转到管理员页面
                setTimeout(() => {
                    window.location.href = '/admin.html';
                }, 1000);
            } else {
                this.showMessage(response.message || '登录失败', 'error');
            }
        } catch (error) {
            this.showMessage('登录失败：' + error.message, 'error');
        }
    }

    async handleStudentLogin(form) {
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
                // 保存会话信息
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
        const formData = new FormData(form);
        const password = formData.get('password');
        const confirmPassword = formData.get('confirmPassword');

        // 验证密码匹配
        if (password !== confirmPassword) {
            this.showMessage('密码不匹配', 'error');
            return;
        }

        try {
            this.showMessage('正在注册...', 'info');

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
                // 清空表单
                form.reset();
                // 切换到登录页面
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
        const adminSession = localStorage.getItem('adminSession');
        const studentSession = localStorage.getItem('studentSession');

        if (adminSession) {
            window.location.href = '/admin.html';
        } else if (studentSession) {
            window.location.href = '/student.html';
        }
    }

    logout() {
        localStorage.removeItem('adminSession');
        localStorage.removeItem('studentSession');
        window.location.href = '/';
    }
}

// 全局工具函数
function showMessage(message, type = 'info') {
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
    const messageArea = document.createElement('div');
    messageArea.id = 'messageArea';
    messageArea.className = 'message-area';
    document.body.appendChild(messageArea);
    return messageArea;
}

// 初始化认证管理器
document.addEventListener('DOMContentLoaded', () => {
    window.authManager = new AuthManager();
});