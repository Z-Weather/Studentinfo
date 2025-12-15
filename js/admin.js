// 管理员页面功能
// ------------------------------------------------------------
// AdminDashboard 负责管理员端的学生信息管理：
// - 会话检查与页面初始化
// - 搜索、筛选、分页展示
// - 添加/编辑/删除学生（通过后端 API）
// - 模态框交互与用户消息提示
// ------------------------------------------------------------
class AdminDashboard {
    constructor() {
        this.currentEditingStudent = null;
        this.currentPage = 1;
        this.pageSize = 10;
        this.totalPages = 1;
        this.students = [];
        this.filteredStudents = [];
        this.init();
    }

    init() {
        // 初始化：确保已登录管理员 -> 绑定事件 -> 拉取学生数据
        this.checkAuth();
        this.setupEventListeners();
        this.loadStudents();
    }

    checkAuth() {
        // 会话校验：未登录则返回首页
        const adminSession = localStorage.getItem('adminSession');
        if (!adminSession) {
            window.location.href = '/';
            return;
        }

        const admin = JSON.parse(adminSession);
        document.getElementById('adminUsername').textContent = admin.username;
    }

    setupEventListeners() {
        // 退出登录：清理会话并回到登录页
        document.getElementById('logoutBtn').addEventListener('click', () => {
            localStorage.removeItem('adminSession');
            window.location.href = '/';
        });

        // 添加学生：打开学生信息编辑模态框
        document.getElementById('addStudentBtn').addEventListener('click', () => {
            this.openStudentModal();
        });

        // 搜索功能：支持按钮与 Enter 键触发
        document.getElementById('searchBtn').addEventListener('click', () => {
            this.searchStudents();
        });

        document.getElementById('searchInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.searchStudents();
            }
        });

        // 筛选功能：按班级与专业筛选
        document.getElementById('filterBtn').addEventListener('click', () => {
            this.filterStudents();
        });

        document.getElementById('resetBtn').addEventListener('click', () => {
            this.resetFilters();
        });

        // 分页
        document.getElementById('prevPageBtn').addEventListener('click', () => {
            if (this.currentPage > 1) {
                this.currentPage--;
                this.displayStudents();
            }
        });

        document.getElementById('nextPageBtn').addEventListener('click', () => {
            if (this.currentPage < this.totalPages) {
                this.currentPage++;
                this.displayStudents();
            }
        });

        // 学生表单提交
        document.getElementById('studentForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveStudent(e.target);
        });

        // 模态框关闭
        document.querySelectorAll('.modal-close').forEach(btn => {
            btn.addEventListener('click', () => {
                this.closeAllModals();
            });
        });

        // 点击模态框外部关闭
        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.closeAllModals();
                }
            });
        });

        // 删除确认
        document.getElementById('confirmDeleteBtn').addEventListener('click', () => {
            this.confirmDelete();
        });
    }

    async loadStudents() {
        try {
            this.showMessage('正在加载学生信息...', 'info');

            const response = await this.apiCall('/api/students?search=&class=&major=');

            if (response.success) {
                this.students = response.students;
                this.filteredStudents = [...this.students];
                this.updateFilters();
                this.displayStudents();
                this.showMessage(`成功加载 ${response.total} 条学生信息`, 'success');
            } else {
                this.showMessage('加载学生信息失败', 'error');
            }
        } catch (error) {
            this.showMessage('加载学生信息失败：' + error.message, 'error');
        }
    }

    searchStudents() {
        const searchTerm = document.getElementById('searchInput').value.toLowerCase().trim();

        if (searchTerm === '') {
            this.filteredStudents = [...this.students];
        } else {
            this.filteredStudents = this.students.filter(student =>
                student.name.toLowerCase().includes(searchTerm) ||
                student.student_id.toLowerCase().includes(searchTerm) ||
                student.class_name.toLowerCase().includes(searchTerm)
            );
        }

        this.currentPage = 1;
        this.displayStudents();
    }

    filterStudents() {
        const classFilter = document.getElementById('classFilter').value;
        const majorFilter = document.getElementById('majorFilter').value;
        const searchTerm = document.getElementById('searchInput').value.toLowerCase().trim();

        this.filteredStudents = this.students.filter(student => {
            let matchSearch = true;
            let matchClass = true;
            let matchMajor = true;

            if (searchTerm) {
                matchSearch = student.name.toLowerCase().includes(searchTerm) ||
                             student.student_id.toLowerCase().includes(searchTerm) ||
                             student.class_name.toLowerCase().includes(searchTerm);
            }

            if (classFilter) {
                matchClass = student.class_name === classFilter;
            }

            if (majorFilter) {
                matchMajor = student.major === majorFilter;
            }

            return matchSearch && matchClass && matchMajor;
        });

        this.currentPage = 1;
        this.displayStudents();
    }

    resetFilters() {
        document.getElementById('searchInput').value = '';
        document.getElementById('classFilter').value = '';
        document.getElementById('majorFilter').value = '';

        this.filteredStudents = [...this.students];
        this.currentPage = 1;
        this.displayStudents();
    }

    updateFilters() {
        // 更新班级筛选器
        const classFilter = document.getElementById('classFilter');
        const classes = [...new Set(this.students.map(s => s.class_name).filter(Boolean))];
        classFilter.innerHTML = '<option value="">所有班级</option>';
        classes.forEach(className => {
            classFilter.innerHTML += `<option value="${className}">${className}</option>`;
        });

        // 更新专业筛选器
        const majorFilter = document.getElementById('majorFilter');
        const majors = [...new Set(this.students.map(s => s.major).filter(Boolean))];
        majorFilter.innerHTML = '<option value="">所有专业</option>';
        majors.forEach(major => {
            majorFilter.innerHTML += `<option value="${major}">${major}</option>`;
        });
    }

    displayStudents() {
        const tbody = document.getElementById('studentsTableBody');
        const noDataMessage = document.getElementById('noDataMessage');

        // 计算分页
        this.totalPages = Math.ceil(this.filteredStudents.length / this.pageSize);
        const startIndex = (this.currentPage - 1) * this.pageSize;
        const endIndex = startIndex + this.pageSize;
        const pageStudents = this.filteredStudents.slice(startIndex, endIndex);

        // 更新分页信息
        document.getElementById('pageInfo').textContent = `第 ${this.currentPage} 页，共 ${this.totalPages} 页`;
        document.getElementById('prevPageBtn').disabled = this.currentPage === 1;
        document.getElementById('nextPageBtn').disabled = this.currentPage === this.totalPages;

        // 清空表格
        tbody.innerHTML = '';

        if (pageStudents.length === 0) {
            noDataMessage.style.display = 'block';
            document.querySelector('.table-container table').style.display = 'none';
            document.querySelector('.pagination').style.display = 'none';
        } else {
            noDataMessage.style.display = 'none';
            document.querySelector('.table-container table').style.display = 'table';
            document.querySelector('.pagination').style.display = 'flex';

            pageStudents.forEach(student => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${student.student_id}</td>
                    <td>${student.name}</td>
                    <td>${student.gender || '-'}</td>
                    <td>${student.age || '-'}</td>
                    <td>${student.class_name || '-'}</td>
                    <td>${student.major || '-'}</td>
                    <td>${student.phone || '-'}</td>
                    <td>${student.email || '-'}</td>
                    <td class="actions">
                        <button class="btn btn-sm btn-primary edit-btn" data-id="${student.student_id}">编辑</button>
                        <button class="btn btn-sm btn-danger delete-btn" data-id="${student.student_id}" data-name="${student.name}">删除</button>
                    </td>
                `;
                tbody.appendChild(row);
            });

            // 添加操作按钮事件
            tbody.querySelectorAll('.edit-btn').forEach(btn => {
                btn.addEventListener('click', () => {
                    this.editStudent(btn.dataset.id);
                });
            });

            tbody.querySelectorAll('.delete-btn').forEach(btn => {
                btn.addEventListener('click', () => {
                    this.deleteStudent(btn.dataset.id, btn.dataset.name);
                });
            });
        }
    }

    openStudentModal(student = null) {
        const modal = document.getElementById('studentModal');
        const modalTitle = document.getElementById('modalTitle');
        const form = document.getElementById('studentForm');

        this.currentEditingStudent = student;

        if (student) {
            // 编辑模式：填充现有数据，禁用学号（主键不可改）
            modalTitle.textContent = '编辑学生信息';
            form.studentId.value = student.student_id;
            form.studentId.disabled = true;
            form.name.value = student.name || '';
            form.gender.value = student.gender || '';
            form.age.value = student.age || '';
            form.className.value = student.class_name || '';
            form.major.value = student.major || '';
            form.phone.value = student.phone || '';
            form.email.value = student.email || '';
            form.password.value = '';
            form.password.placeholder = '留空则不修改密码';
        } else {
            // 添加模式：清空表单，允许输入学号与密码
            modalTitle.textContent = '添加学生';
            form.reset();
            form.studentId.disabled = false;
            form.password.placeholder = '请输入密码';
        }

        modal.classList.add('active');
    }

    closeAllModals() {
        // 统一关闭所有模态框并重置当前编辑状态
        document.querySelectorAll('.modal').forEach(modal => {
            modal.classList.remove('active');
        });
        this.currentEditingStudent = null;
    }

    editStudent(studentId) {
        const student = this.students.find(s => s.student_id === studentId);
        if (student) {
            this.openStudentModal(student);
        }
    }

    deleteStudent(studentId, studentName) {
        // 删除流程：先展示确认模态框，避免误删
        this.currentEditingStudent = studentId;
        document.getElementById('deleteStudentName').textContent = studentName;
        document.getElementById('deleteModal').classList.add('active');
    }

    async confirmDelete() {
        if (!this.currentEditingStudent) return;

        try {
            this.showMessage('正在删除学生信息...', 'info');

            const response = await this.apiCall(`/api/students/${this.currentEditingStudent}`, {
                method: 'DELETE'
            });

            if (response.success) {
                this.showMessage('删除学生信息成功', 'success');
                this.closeAllModals();
                this.loadStudents(); // 重新加载数据
            } else {
                this.showMessage('删除学生信息失败', 'error');
            }
        } catch (error) {
            this.showMessage('删除学生信息失败：' + error.message, 'error');
        }
    }

    async saveStudent(form) {
        // 保存学生信息：根据当前模式选择添加或更新
        const formData = new FormData(form);
        const studentData = {
            name: formData.get('name'),
            gender: formData.get('gender'),
            age: formData.get('age') ? parseInt(formData.get('age')) : null,
            className: formData.get('className'),
            major: formData.get('major'),
            phone: formData.get('phone'),
            email: formData.get('email')
        };

        // 只有在填写密码时才包含密码字段：避免无意覆盖
        const password = formData.get('password');
        if (password) {
            studentData.password = password;
        }

        try {
            this.showMessage(this.currentEditingStudent ? '正在更新学生信息...' : '正在添加学生...', 'info');

            let response;
            if (this.currentEditingStudent) {
                // 更新学生：PUT /api/students/:id
                response = await this.apiCall(`/api/students/${this.currentEditingStudent}`, {
                    method: 'PUT',
                    body: JSON.stringify(studentData)
                });
            } else {
                // 添加学生：POST /api/students
                studentData.studentId = formData.get('studentId');
                response = await this.apiCall('/api/students', {
                    method: 'POST',
                    body: JSON.stringify(studentData)
                });
            }

            if (response.success) {
                this.showMessage(this.currentEditingStudent ? '更新学生信息成功' : '添加学生成功', 'success');
                this.closeAllModals();
                this.loadStudents(); // 重新加载数据
            } else {
                this.showMessage(response.message || '操作失败', 'error');
            }
        } catch (error) {
            this.showMessage('操作失败：' + error.message, 'error');
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

        setTimeout(() => {
            messageElement.remove();
        }, 3000);
    }
}

// 初始化管理员仪表板
document.addEventListener('DOMContentLoaded', () => {
    window.adminDashboard = new AdminDashboard();
});
