/**
 * Admin User Management Page
 */

async function AdminUsersPage() {
    const app = Utils.$('#app');

    if (!AppState.isSuperAdmin()) {
        ROUTER.push('/admin');
        Toast.error('Access Denied: Superadmin only.');
        return;
    }

    // Mock User Data — in memory so edits/deletes persist during the session
    let users = [
        { id: 1, name: 'Admin One', email: 'superadmin@xiemibytes.com', role: 'superadmin', status: 'active', last_login: '2 mins ago' },
        { id: 2, name: 'Manager Jane', email: 'manager@xiemibytes.com', role: 'manager', status: 'active', last_login: '1 hour ago' },
        { id: 3, name: 'Staff Bob', email: 'staff@xiemibytes.com', role: 'staff', status: 'active', last_login: 'Yesterday' },
        { id: 4, name: 'John Customer', email: 'john@example.com', role: 'customer', status: 'active', last_login: '3 days ago' },
    ];

    const ROLE_COLORS = {
        superadmin: { bg: '#fef2f2', color: '#dc2626', border: '#fecaca' },
        manager:    { bg: '#fffbeb', color: '#d97706', border: '#fde68a' },
        staff:      { bg: '#eff6ff', color: '#2563eb', border: '#bfdbfe' },
        customer:   { bg: '#f8fafc', color: '#64748b', border: '#e2e8f0' },
    };

    function getRoleStyle(role) {
        return ROLE_COLORS[role] || ROLE_COLORS.customer;
    }

    function renderUsers() {
        app.innerHTML = `
            <div class="admin-users fade-in p-4">

                <!-- Header -->
                <div class="d-flex justify-content-between align-items-center mb-4">
                    <div>
                        <h2 class="mb-1" style="font-weight: 800; color: #1e293b;">User Management</h2>
                        <p class="text-muted mb-0">Manage staff and customer accounts &mdash; ${users.length} total users</p>
                    </div>
                    <button class="btn btn-primary" id="btn-add-user" style="border-radius: 10px; font-weight: 700; padding: 10px 20px;">
                        + Create New User
                    </button>
                </div>

                <!-- Stats Row -->
                <div class="row mb-4" style="gap: 0;">
                    ${['superadmin','manager','staff','customer'].map(role => {
                        const count = users.filter(u => u.role === role).length;
                        const style = getRoleStyle(role);
                        const label = role.charAt(0).toUpperCase() + role.slice(1);
                        return `
                            <div class="col-md-3 mb-3">
                                <div class="card p-3" style="border-radius: 14px; border: 1px solid ${style.border}; background: ${style.bg};">
                                    <div style="font-size: 1.8rem; font-weight: 800; color: ${style.color};">${count}</div>
                                    <div style="font-size: 0.82rem; font-weight: 600; color: ${style.color};">${label}${count !== 1 ? 's' : ''}</div>
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>

                <!-- User Cards -->
                <div class="card border-0" style="border-radius: 16px; overflow: hidden; border: 1px solid #e2e8f0;">
                    ${users.map((user, idx) => {
                        const style = getRoleStyle(user.role);
                        const label = user.role.charAt(0).toUpperCase() + user.role.slice(1);
                        return `
                            <div class="user-row d-flex align-items-center px-4 py-3 ${idx < users.length - 1 ? 'border-bottom' : ''}" style="gap: 16px; background: white; transition: background 0.15s;" data-user-id="${user.id}">
                                
                                <!-- Avatar -->
                                <div style="width: 44px; height: 44px; background: ${style.bg}; border: 2px solid ${style.border}; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 1.1rem; color: ${style.color}; flex-shrink: 0;">
                                    ${user.name.charAt(0)}
                                </div>

                                <!-- Name + Email -->
                                <div style="flex: 1; min-width: 0;">
                                    <div class="font-weight-bold" style="color: #1e293b;">${user.name}</div>
                                    <div class="text-muted" style="font-size: 0.8rem;">${user.email}</div>
                                </div>

                                <!-- Role Badge -->
                                <div style="flex-shrink: 0;">
                                    <span style="background: ${style.bg}; color: ${style.color}; border: 1px solid ${style.border}; padding: 4px 12px; border-radius: 20px; font-size: 0.75rem; font-weight: 700;">
                                        ${label}
                                    </span>
                                </div>

                                <!-- Last Active -->
                                <div style="flex-shrink: 0; min-width: 100px; text-align: right;">
                                    <div class="text-muted" style="font-size: 0.8rem;">Last active</div>
                                    <div style="font-size: 0.82rem; color: #1e293b; font-weight: 600;">${user.last_login}</div>
                                </div>

                                <!-- Actions -->
                                <div style="flex-shrink: 0; display: flex; gap: 8px;">
                                    <button class="btn btn-sm btn-edit-user" data-user-id="${user.id}" style="border-radius: 8px; border: 1px solid #e2e8f0; background: white; color: #1e293b; font-weight: 600; padding: 6px 16px;">
                                        Edit
                                    </button>
                                    <button class="btn btn-sm btn-delete-user" data-user-id="${user.id}" style="border-radius: 8px; border: 1px solid #fecaca; background: #fef2f2; color: #dc2626; font-weight: 600; padding: 6px 16px;">
                                        Delete
                                    </button>
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
        `;

        attachListeners();
    }

    function showCreateModal() {
        Modal.show({
            title: 'Create New User',
            html: `
                <div style="padding: 4px 0;">
                    <div class="mb-3">
                        <label class="font-weight-bold small mb-1">Full Name</label>
                        <input type="text" id="new-user-name" class="form-control" placeholder="e.g. Juan dela Cruz" style="border-radius:10px;">
                    </div>
                    <div class="mb-3">
                        <label class="font-weight-bold small mb-1">Email Address</label>
                        <input type="email" id="new-user-email" class="form-control" placeholder="email@example.com" style="border-radius:10px;">
                    </div>
                    <div class="mb-3">
                        <label class="font-weight-bold small mb-1">Assign Role</label>
                        <select id="new-user-role" class="form-control" style="border-radius:10px;">
                            <option value="staff">Staff</option>
                            <option value="manager">Manager</option>
                            <option value="superadmin">Superadmin</option>
                            <option value="customer">Customer</option>
                        </select>
                    </div>
                    <div class="mb-3">
                        <label class="font-weight-bold small mb-1">Password</label>
                        <input type="password" id="new-user-password" class="form-control" placeholder="Min. 8 characters" style="border-radius:10px;">
                    </div>
                </div>
            `,
            buttons: [
                { text: 'Cancel', action: 'close', class: 'secondary' },
                { text: 'Create User', action: 'create', class: 'primary' },
            ],
            onCreate: () => {
                const name = Utils.$('#new-user-name')?.value?.trim();
                const email = Utils.$('#new-user-email')?.value?.trim();
                const role = Utils.$('#new-user-role')?.value;
                const password = Utils.$('#new-user-password')?.value;
                if (!name || !email || !password) { Toast.error('Please fill in all fields.'); return; }
                users.push({ id: Date.now(), name, email, role, status: 'active', last_login: 'Just now' });
                Toast.success(`User "${name}" created successfully.`);
                Modal.hide();
                renderUsers();
            }
        });
    }

    function showEditModal(userId) {
        const user = users.find(u => u.id === userId);
        if (!user) return;

        Modal.show({
            title: 'Edit User',
            html: `
                <div style="padding: 4px 0;">
                    <div class="mb-3">
                        <label class="font-weight-bold small mb-1">Full Name</label>
                        <input type="text" id="edit-user-name" class="form-control" value="${user.name}" style="border-radius:10px;">
                    </div>
                    <div class="mb-3">
                        <label class="font-weight-bold small mb-1">Email Address</label>
                        <input type="email" id="edit-user-email" class="form-control" value="${user.email}" style="border-radius:10px;">
                    </div>
                    <div class="mb-3">
                        <label class="font-weight-bold small mb-1">Role</label>
                        <select id="edit-user-role" class="form-control" style="border-radius:10px;">
                            <option value="staff" ${user.role === 'staff' ? 'selected' : ''}>Staff</option>
                            <option value="manager" ${user.role === 'manager' ? 'selected' : ''}>Manager</option>
                            <option value="superadmin" ${user.role === 'superadmin' ? 'selected' : ''}>Superadmin</option>
                            <option value="customer" ${user.role === 'customer' ? 'selected' : ''}>Customer</option>
                        </select>
                    </div>
                    <div class="mb-3">
                        <label class="font-weight-bold small mb-1">New Password <span class="text-muted font-weight-normal">(leave blank to keep current)</span></label>
                        <input type="password" id="edit-user-password" class="form-control" placeholder="••••••••" style="border-radius:10px;">
                    </div>
                </div>
            `,
            buttons: [
                { text: 'Cancel', action: 'close', class: 'secondary' },
                { text: 'Save Changes', action: 'save', class: 'primary' },
            ],
            onSave: () => {
                const name = Utils.$('#edit-user-name')?.value?.trim();
                const email = Utils.$('#edit-user-email')?.value?.trim();
                const role = Utils.$('#edit-user-role')?.value;
                if (!name || !email) { Toast.error('Name and email are required.'); return; }
                const idx = users.findIndex(u => u.id === userId);
                if (idx !== -1) { users[idx] = { ...users[idx], name, email, role }; }
                Toast.success(`User "${name}" updated.`);
                Modal.hide();
                renderUsers();
            }
        });
    }

    function confirmDelete(userId) {
        const user = users.find(u => u.id === userId);
        if (!user) return;

        Modal.confirm(
            `Are you sure you want to delete "${user.name}"? This action cannot be undone.`,
            () => {
                users = users.filter(u => u.id !== userId);
                Toast.success(`User "${user.name}" deleted.`);
                renderUsers();
            }
        );
    }

    function attachListeners() {
        Utils.$('#btn-add-user')?.addEventListener('click', showCreateModal);

        document.querySelectorAll('.btn-edit-user').forEach(btn => {
            btn.addEventListener('click', () => showEditModal(parseInt(btn.dataset.userId)));
        });

        document.querySelectorAll('.btn-delete-user').forEach(btn => {
            btn.addEventListener('click', () => confirmDelete(parseInt(btn.dataset.userId)));
        });
    }

    renderUsers();
}
