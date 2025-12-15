// 学生页面功能
// ------------------------------------------------------------
// StudentDashboard 负责学生端的个人信息管理：
// - 会话检查与页面初始化
// - 查看与编辑个人信息
// - 修改密码与导出信息
// - 模态框交互与用户消息提示
// ------------------------------------------------------------
class StudentDashboard {
    constructor() {
        this.studentInfo = null;
        this.init();
    }

    init() {
        // 初始化：确保已登录学生 -> 绑定事件 -> 拉取个人信息
        this.checkAuth();
        this.setupEventListeners();
        this.loadStudentInfo();
    }

    checkAuth() {
        // 会话校验：未登录则返回首页
        const studentSession = localStorage.getItem('studentSession');
        if (!studentSession) {
            window.location.href = '/';
            return;
        }

        const student = JSON.parse(studentSession);
        document.getElementById('studentName').textContent = student.name;
    }

    setupEventListeners() {
        // 退出登录：清理会话并回到登录页
        document.getElementById('logoutBtn').addEventListener('click', () => {
            localStorage.removeItem('studentSession');
            window.location.href = '/';
        });

        // 编辑信息：打开编辑模态框
        document.getElementById('editInfoBtn').addEventListener('click', () => {
            this.openEditModal();
        });

        // 修改密码：打开密码修改模态框
        document.getElementById('changePasswordBtn').addEventListener('click', () => {
            this.openPasswordModal();
        });

        // 导出信息：将个人信息导出为文件（实现见 exportStudentInfo）
        document.getElementById('exportInfoBtn').addEventListener('click', () => {
            this.exportStudentInfo();
        });

        // 编辑表单提交：阻止原生提交并调用保存逻辑
        document.getElementById('editForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveStudentInfo(e.target);
        });

        // 密码表单提交：阻止原生提交并调用修改密码逻辑
        document.getElementById('passwordForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.changePassword(e.target);
        });

        // 模态框关闭：统一关闭行为
        document.querySelectorAll('.modal-close').forEach(btn => {
            btn.addEventListener('click', () => {
                this.closeAllModals();
            });
        });

        // 点击模态框外部关闭：提升易用性
        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.closeAllModals();
                }
            });
        });

        // 密码确认验证：输入时即时提示，提高表单可用性
        document.getElementById('confirmNewPassword').addEventListener('input', (e) => {
            const newPassword = document.getElementById('newPassword').value;
            const confirmNewPassword = e.target.value;

            if (newPassword !== confirmNewPassword) {
                e.target.setCustomValidity('密码不匹配');
            } else {
                e.target.setCustomValidity('');
            }
        });
    }

    async loadStudentInfo() {
        try {
            const studentSession = JSON.parse(localStorage.getItem('studentSession'));
            const studentId = studentSession.studentId;

            this.showMessage('正在加载个人信息...', 'info');

            const response = await this.apiCall(`/api/students/${studentId}`);

            if (response.success) {
                this.studentInfo = response.student;
                this.displayStudentInfo();
                this.showMessage('加载个人信息成功', 'success');
            } else {
                this.showMessage('加载个人信息失败', 'error');
            }
        } catch (error) {
            this.showMessage('加载个人信息失败：' + error.message, 'error');
        }
    }

    displayStudentInfo() {
        if (!this.studentInfo) return;

        // 更新头部信息
        document.getElementById('profileName').textContent = this.studentInfo.name || '未知';
        document.getElementById('profileStudentId').textContent = `学号：${this.studentInfo.student_id || '未知'}`;
        document.getElementById('profileClass').textContent = `班级：${this.studentInfo.class_name || '未知'}`;

        // 更新头像
        const firstChar = (this.studentInfo.name || '学').charAt(0);
        document.getElementById('avatarText').textContent = firstChar;

        // 更新基本信息
        document.getElementById('profileGender').textContent = this.studentInfo.gender || '-';
        document.getElementById('profileAge').textContent = this.studentInfo.age || '-';
        document.getElementById('profileMajor').textContent = this.studentInfo.major || '-';

        // 更新联系方式
        document.getElementById('profilePhone').textContent = this.studentInfo.phone || '-';
        document.getElementById('profileEmail').textContent = this.studentInfo.email || '-';

        // 更新系统信息
        if (this.studentInfo.created_at) {
            const createdDate = new Date(this.studentInfo.created_at).toLocaleDateString('zh-CN');
            document.getElementById('profileCreatedAt').textContent = createdDate;
        }

        if (this.studentInfo.updated_at) {
            const updatedDate = new Date(this.studentInfo.updated_at).toLocaleDateString('zh-CN');
            document.getElementById('profileUpdatedAt').textContent = updatedDate;
        }

        // 更新导航栏用户信息
        document.getElementById('studentName').textContent = this.studentInfo.name;
    }

    openEditModal() {
        if (!this.studentInfo) return;

        const form = document.getElementById('editForm');

        // 填充当前信息
        form.gender.value = this.studentInfo.gender || '';
        form.age.value = this.studentInfo.age || '';
        form.className.value = this.studentInfo.class_name || '';
        form.major.value = this.studentInfo.major || '';
        form.phone.value = this.studentInfo.phone || '';
        form.email.value = this.studentInfo.email || '';

        document.getElementById('editModal').classList.add('active');
    }

    openPasswordModal() {
        const form = document.getElementById('passwordForm');
        form.reset();
        document.getElementById('passwordModal').classList.add('active');
    }

    closeAllModals() {
        document.querySelectorAll('.modal').forEach(modal => {
            modal.classList.remove('active');
        });
    }

    async saveStudentInfo(form) {
        const formData = new FormData(form);
        const studentData = {
            gender: formData.get('gender'),
            age: formData.get('age') ? parseInt(formData.get('age')) : null,
            className: formData.get('className'),
            major: formData.get('major'),
            phone: formData.get('phone'),
            email: formData.get('email')
        };

        try {
            this.showMessage('正在保存个人信息...', 'info');

            const studentSession = JSON.parse(localStorage.getItem('studentSession'));
            const studentId = studentSession.studentId;

            const response = await this.apiCall(`/api/students/${studentId}`, {
                method: 'PUT',
                body: JSON.stringify(studentData)
            });

            if (response.success) {
                this.showMessage('保存个人信息成功', 'success');
                this.closeAllModals();
                // 重新加载信息
                await this.loadStudentInfo();
            } else {
                this.showMessage(response.message || '保存失败', 'error');
            }
        } catch (error) {
            this.showMessage('保存失败：' + error.message, 'error');
        }
    }

    async changePassword(form) {
        const formData = new FormData(form);
        const currentPassword = formData.get('currentPassword');
        const newPassword = formData.get('newPassword');
        const confirmNewPassword = formData.get('confirmNewPassword');

        // 验证新密码匹配
        if (newPassword !== confirmNewPassword) {
            this.showMessage('新密码不匹配', 'error');
            return;
        }

        // 验证当前密码（这里简化处理，实际应该先验证当前密码是否正确）
        if (!currentPassword || !newPassword) {
            this.showMessage('请填写完整的密码信息', 'error');
            return;
        }

        try {
            this.showMessage('正在修改密码...', 'info');

            const studentSession = JSON.parse(localStorage.getItem('studentSession'));
            const studentId = studentSession.studentId;

            const response = await this.apiCall(`/api/students/${studentId}`, {
                method: 'PUT',
                body: JSON.stringify({ password: newPassword })
            });

            if (response.success) {
                this.showMessage('修改密码成功', 'success');
                this.closeAllModals();
                form.reset();
            } else {
                this.showMessage(response.message || '修改密码失败', 'error');
            }
        } catch (error) {
            this.showMessage('修改密码失败：' + error.message, 'error');
        }
    }

    exportStudentInfo() {
        if (!this.studentInfo) {
            this.showMessage('暂无信息可导出', 'error');
            return;
        }

        // 创建导出数据
        const exportData = {
            学号: this.studentInfo.student_id,
            姓名: this.studentInfo.name,
            性别: this.studentInfo.gender || '',
            年龄: this.studentInfo.age || '',
            班级: this.studentInfo.class_name || '',
            专业: this.studentInfo.major || '',
            电话: this.studentInfo.phone || '',
            邮箱: this.studentInfo.email || '',
            注册时间: this.studentInfo.created_at ? new Date(this.studentInfo.created_at).toLocaleString('zh-CN') : '',
            最后更新: this.studentInfo.updated_at ? new Date(this.studentInfo.updated_at).toLocaleString('zh-CN') : ''
        };

        // 创建CSV内容
        const headers = Object.keys(exportData);
        const values = Object.values(exportData);

        let csvContent = '\ufeff'; // UTF-8 BOM
        csvContent += headers.join(',') + '\n';
        csvContent += values.map(value => `"${value}"`).join(',');

        // 创建下载链接
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);

        link.setAttribute('href', url);
        link.setAttribute('download', `学生信息_${this.studentInfo.name}_${this.studentInfo.student_id}.csv`);
        link.style.visibility = 'hidden';

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        this.showMessage('信息导出成功', 'success');
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

        setTimeout(() => {
            messageElement.remove();
        }, 3000);
    }
}

// 初始化学生仪表板
document.addEventListener('DOMContentLoaded', () => {
    window.studentDashboard = new StudentDashboard();
});
