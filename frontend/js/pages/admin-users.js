/**
 * Admin User Management Page — Superadmin only
 */
async function AdminUsersPage() {
    const app = Utils.$('#app');

    if (!AppState.isSuperAdmin()) {
        app.innerHTML = `
            <div class="container mt-5 text-center">
                <div class="card border-0 shadow-sm p-5 mx-auto" style="max-width:400px; border-radius:16px;">
                    <i class="bi bi-shield-lock" style="font-size:3rem; color:#cbd5e1;"></i>
                    <h4 class="mt-3 font-weight-bold" style="color:#1e293b;">Access Restricted</h4>
                    <p class="text-muted">User Management is only accessible to Super Admins.</p>
                    <a href="#/admin" class="btn btn-primary mt-2" style="border-radius:10px;">Back to Dashboard</a>
                </div>
            </div>`;
        return;
    }

    let users = [];
    try {
        Loader.show();
        const res = await API.get('/admin/users.php');
        if (res && res.data) users = res.data;
    } catch (e) {
        Toast.error("Failed to load users");
    } finally {
        Loader.hide();
    }

    const ROLE_COLOR = {
        superadmin: { bg: '#fef2f2', color: '#dc2626', border: '#fecaca', label: 'Superadmin' },
        manager:    { bg: '#fffbeb', color: '#d97706', border: '#fde68a', label: 'Admin' },
        staff:      { bg: '#eff6ff', color: '#2563eb', border: '#bfdbfe', label: 'Staff' },
        customer:   { bg: '#f8fafc', color: '#64748b', border: '#e2e8f0', label: 'Customer' },
    };
    const STATUS_COLOR = {
        active:  { bg: '#dcfce7', color: '#166534', label: 'Active' },
        banned:  { bg: '#fef2f2', color: '#991b1b', label: 'Banned' },
    };

    function badge(map, key) {
        const s = map[key] || map.active || map.customer;
        return `<span style="display:inline-block;background:${s.bg};color:${s.color};padding:3px 10px;border-radius:20px;font-size:0.72rem;font-weight:700;white-space:nowrap;">${s.label}</span>`;
    }

    function renderPage() {
        const staff    = users.filter(u => u.role !== 'customer');
        const customers = users.filter(u => u.role === 'customer');

        app.innerHTML = `
        <div class="admin-products fade-in container mt-4">

            <!-- Title -->
            <div class="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h1 class="mb-0" style="font-weight:800; color:#1e293b;">User Management</h1>
                    <p class="text-muted small mb-0 mt-1">${users.length} total users &nbsp;·&nbsp; Superadmin access only</p>
                </div>
                <button id="btn-add-user" class="btn btn-primary" style="border-radius:10px; font-weight:700; white-space:nowrap;">
                    + Add Account
                </button>
            </div>

            <!-- Stat chips -->
            <div class="d-flex flex-wrap mb-4" style="gap:10px;">
                ${['superadmin','manager','staff','customer'].map(role => {
                    const count = users.filter(u => u.role === role).length;
                    const s = ROLE_COLOR[role];
                    return `<div style="background:${s.bg};border:1px solid ${s.border};color:${s.color};border-radius:12px;padding:8px 16px;font-size:0.82rem;font-weight:700;">
                        ${count} ${s.label}${count !== 1 ? 's' : ''}
                    </div>`;
                }).join('')}
            </div>

            <!-- Staff table -->
            <p style="font-size:0.72rem;font-weight:700;text-transform:uppercase;letter-spacing:1.5px;color:#94a3b8;margin-bottom:10px;">Staff & Admins</p>
            <div class="card border-0 shadow-sm overflow-hidden mb-4" style="border-radius:16px;">
                <div style="overflow-x:auto;">
                    <table style="width:100%;border-collapse:collapse;">
                        <thead>
                            <tr style="border-bottom:2px solid #f1f5f9;">
                                <th style="padding:12px 16px;font-size:0.72rem;text-transform:uppercase;letter-spacing:1px;color:#94a3b8;font-weight:700;text-align:left;background:white;">User</th>
                                <th style="padding:12px 16px;font-size:0.72rem;text-transform:uppercase;letter-spacing:1px;color:#94a3b8;font-weight:700;text-align:left;background:white;">Role</th>
                                <th style="padding:12px 16px;font-size:0.72rem;text-transform:uppercase;letter-spacing:1px;color:#94a3b8;font-weight:700;text-align:left;background:white;">Status</th>
                                <th style="padding:12px 16px;font-size:0.72rem;text-transform:uppercase;letter-spacing:1px;color:#94a3b8;font-weight:700;text-align:left;background:white;">Last Active</th>
                                <th style="padding:12px 16px;font-size:0.72rem;text-transform:uppercase;letter-spacing:1px;color:#94a3b8;font-weight:700;text-align:right;background:white;">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${staff.length === 0
                                ? `<tr><td colspan="5" style="padding:24px;text-align:center;color:#94a3b8;font-size:0.88rem;">No staff accounts.</td></tr>`
                                : staff.map((u, i) => {
                                    const rc = ROLE_COLOR[u.role] || ROLE_COLOR.customer;
                                    return `
                                    <tr style="border-bottom:${i < staff.length - 1 ? '1px solid #f1f5f9' : 'none'};" onmouseenter="this.style.background='#f8fafc'" onmouseleave="this.style.background='white'">
                                        <td style="padding:12px 16px;">
                                            <div style="display:flex;align-items:center;gap:10px;">
                                                <div style="width:36px;height:36px;background:${rc.bg};border:2px solid ${rc.border};border-radius:10px;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:0.9rem;color:${rc.color};flex-shrink:0;">${u.name.charAt(0)}</div>
                                                <div>
                                                    <div style="font-weight:700;color:#1e293b;font-size:0.88rem;">${u.name}</div>
                                                    <div style="color:#94a3b8;font-size:0.75rem;">${u.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td style="padding:12px 16px;">${badge(ROLE_COLOR, u.role)}</td>
                                        <td style="padding:12px 16px;">${badge(STATUS_COLOR, u.status)}</td>
                                        <td style="padding:12px 16px;color:#64748b;font-size:0.82rem;">${u.last_login || '—'}</td>
                                        <td style="padding:12px 16px;text-align:right;white-space:nowrap;">
                                            <button class="btn btn-sm btn-outline-primary btn-edit-user mr-1" data-id="${u.id}" style="border-radius:8px;font-size:0.8rem;">Edit</button>
                                            <button class="btn btn-sm btn-outline-danger btn-delete-user" data-id="${u.id}" style="border-radius:8px;font-size:0.8rem;">Delete</button>
                                        </td>
                                    </tr>`;
                                }).join('')}
                        </tbody>
                    </table>
                </div>
            </div>

            <!-- Customers table -->
            <p style="font-size:0.72rem;font-weight:700;text-transform:uppercase;letter-spacing:1.5px;color:#94a3b8;margin-bottom:10px;">Customer Accounts</p>
            <div class="card border-0 shadow-sm overflow-hidden" style="border-radius:16px;">
                <div style="overflow-x:auto;">
                    <table style="width:100%;border-collapse:collapse;">
                        <thead>
                            <tr style="border-bottom:2px solid #f1f5f9;">
                                <th style="padding:12px 16px;font-size:0.72rem;text-transform:uppercase;letter-spacing:1px;color:#94a3b8;font-weight:700;text-align:left;background:white;">Customer</th>
                                <th style="padding:12px 16px;font-size:0.72rem;text-transform:uppercase;letter-spacing:1px;color:#94a3b8;font-weight:700;text-align:left;background:white;">Status</th>
                                <th style="padding:12px 16px;font-size:0.72rem;text-transform:uppercase;letter-spacing:1px;color:#94a3b8;font-weight:700;text-align:left;background:white;">Last Active</th>
                                <th style="padding:12px 16px;font-size:0.72rem;text-transform:uppercase;letter-spacing:1px;color:#94a3b8;font-weight:700;text-align:right;background:white;">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${customers.length === 0
                                ? `<tr><td colspan="4" style="padding:24px;text-align:center;color:#94a3b8;font-size:0.88rem;">No customer accounts.</td></tr>`
                                : customers.map((u, i) => {
                                    const isBanned = u.status === 'banned';
                                    return `
                                    <tr style="border-bottom:${i < customers.length - 1 ? '1px solid #f1f5f9' : 'none'};" onmouseenter="this.style.background='#f8fafc'" onmouseleave="this.style.background='white'">
                                        <td style="padding:12px 16px;">
                                            <div style="display:flex;align-items:center;gap:10px;">
                                                <div style="width:36px;height:36px;background:#f8fafc;border:2px solid #e2e8f0;border-radius:10px;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:0.9rem;color:#64748b;flex-shrink:0;">${u.name.charAt(0)}</div>
                                                <div>
                                                    <div style="font-weight:700;color:#1e293b;font-size:0.88rem;">${u.name}</div>
                                                    <div style="color:#94a3b8;font-size:0.75rem;">${u.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td style="padding:12px 16px;">${badge(STATUS_COLOR, u.status)}</td>
                                        <td style="padding:12px 16px;color:#64748b;font-size:0.82rem;">${u.last_login || '—'}</td>
                                        <td style="padding:12px 16px;text-align:right;white-space:nowrap;">
                                            <button class="btn btn-sm btn-ban-toggle" data-id="${u.id}"
                                                style="border-radius:8px;font-size:0.8rem;border:1px solid ${isBanned ? '#bbf7d0' : '#fecaca'};background:${isBanned ? '#f0fdf4' : '#fef2f2'};color:${isBanned ? '#166534' : '#dc2626'};font-weight:600;padding:5px 14px;cursor:pointer;">
                                                ${isBanned ? 'Unban' : 'Ban'}
                                            </button>
                                        </td>
                                    </tr>`;
                                }).join('')}
                        </tbody>
                    </table>
                </div>
            </div>

        </div>`;

        attachListeners();
    }

    function showCreateModal() {
        Modal.show({
            title: 'Add Staff / Admin Account',
            html: `
                <div style="padding:4px 0;">
                    <div class="mb-3">
                        <label class="font-weight-bold small mb-1" style="color:#475569;">Full Name</label>
                        <input type="text" id="new-name" class="form-control" placeholder="e.g. Juan dela Cruz" style="border-radius:10px;">
                    </div>
                    <div class="mb-3">
                        <label class="font-weight-bold small mb-1" style="color:#475569;">Email Address</label>
                        <input type="email" id="new-email" class="form-control" placeholder="email@xiemibytes.com" style="border-radius:10px;">
                    </div>
                    <div class="mb-3">
                        <label class="font-weight-bold small mb-1" style="color:#475569;">Role</label>
                        <select id="new-role" class="form-control" style="border-radius:10px;">
                            <option value="staff">Staff</option>
                            <option value="manager">Admin (Manager)</option>
                        </select>
                    </div>
                    <div class="mb-1">
                        <label class="font-weight-bold small mb-1" style="color:#475569;">Temporary Password</label>
                        <input type="password" id="new-password" class="form-control" placeholder="Min. 8 characters" style="border-radius:10px;">
                    </div>
                </div>`,
            buttons: [
                { text: 'Cancel', action: 'close', class: 'secondary' },
                { text: 'Create Account', action: 'create', class: 'primary' },
            ],
            onCreate: async () => {
                const name = Utils.$('#new-name')?.value?.trim();
                const email = Utils.$('#new-email')?.value?.trim();
                const role = Utils.$('#new-role')?.value;
                const password = Utils.$('#new-password')?.value;
                if (!name || !email || !password) { Toast.error('Please fill in all fields.'); return; }
                
                try {
                    Loader.show();
                    await API.post('/admin/users.php', { name, email, role, password });
                    Toast.success(`Account for "${name}" created.`);
                    Modal.hide();
                    const res = await API.get('/admin/users.php');
                    users = res.data;
                    renderPage();
                } catch(e) {
                    Toast.error("Failed to create user");
                } finally {
                    Loader.hide();
                }
            }
        });
    }

    function showEditModal(userId) {
        const u = users.find(x => x.id === userId);
        if (!u || u.role === 'customer') return;
        Modal.show({
            title: `Edit: ${u.name}`,
            html: `
                <div style="padding:4px 0;">
                    <div class="mb-3">
                        <label class="font-weight-bold small mb-1" style="color:#475569;">Full Name</label>
                        <input type="text" id="edit-name" class="form-control" value="${u.name}" style="border-radius:10px;">
                    </div>
                    <div class="mb-3">
                        <label class="font-weight-bold small mb-1" style="color:#475569;">Email Address</label>
                        <input type="email" id="edit-email" class="form-control" value="${u.email}" style="border-radius:10px;">
                    </div>
                    <div class="mb-3">
                        <label class="font-weight-bold small mb-1" style="color:#475569;">Role</label>
                        <select id="edit-role" class="form-control" style="border-radius:10px;">
                            <option value="staff"      ${u.role==='staff'?'selected':''}>Staff</option>
                            <option value="manager"    ${u.role==='manager'?'selected':''}>Admin (Manager)</option>
                            <option value="superadmin" ${u.role==='superadmin'?'selected':''}>Superadmin</option>
                        </select>
                    </div>
                    <div class="mb-1">
                        <label class="font-weight-bold small mb-1" style="color:#475569;">New Password <span class="text-muted font-weight-normal">(leave blank to keep)</span></label>
                        <input type="password" id="edit-password" class="form-control" placeholder="••••••••" style="border-radius:10px;">
                    </div>
                </div>`,
            buttons: [
                { text: 'Cancel', action: 'close', class: 'secondary' },
                { text: 'Save Changes', action: 'save', class: 'primary' },
            ],
            onSave: async () => {
                const name  = Utils.$('#edit-name')?.value?.trim();
                const email = Utils.$('#edit-email')?.value?.trim();
                const role  = Utils.$('#edit-role')?.value;
                const password = Utils.$('#edit-password')?.value;
                if (!name || !email) { Toast.error('Name and email are required.'); return; }
                
                try {
                    Loader.show();
                    await API.put('/admin/users.php', { id: u.id, name, email, role, password });
                    Toast.success(`"${name}" updated.`);
                    Modal.hide();
                    const res = await API.get('/admin/users.php');
                    users = res.data;
                    renderPage();
                } catch(e) {
                    Toast.error("Failed to update user");
                } finally {
                    Loader.hide();
                }
            }
        });
    }

    function attachListeners() {
        Utils.$('#btn-add-user')?.addEventListener('click', showCreateModal);

        document.querySelectorAll('.btn-edit-user').forEach(btn =>
            btn.addEventListener('click', () => showEditModal(btn.dataset.id)));

        document.querySelectorAll('.btn-delete-user').forEach(btn =>
            btn.addEventListener('click', () => {
                const u = users.find(x => x.id === btn.dataset.id);
                if (!u) return;
                Modal.confirm(`Delete "${u.name}"? This cannot be undone.`, async () => {
                    try {
                        Loader.show();
                        await API.delete(`/admin/users.php?id=${u.id}`);
                        users = users.filter(x => x.id !== u.id);
                        Toast.success(`"${u.name}" deleted.`);
                        renderPage();
                    } catch(e) {
                        Toast.error("Failed to delete user");
                    } finally {
                        Loader.hide();
                    }
                });
            }));

        document.querySelectorAll('.btn-ban-toggle').forEach(btn =>
            btn.addEventListener('click', () => {
                const u = users.find(x => x.id === btn.dataset.id);
                if (!u) return;
                const next = u.status === 'banned' ? 'active' : 'banned';
                Modal.confirm(`${next === 'banned' ? 'Ban' : 'Unban'} "${u.name}"?`, async () => {
                    try {
                        Loader.show();
                        await API.put('/admin/users.php', { id: u.id, action: 'toggle_status', status: next });
                        u.status = next;
                        Toast.show(`"${u.name}" ${next === 'banned' ? 'banned' : 'unbanned'}.`, next === 'banned' ? 'error' : 'success');
                        renderPage();
                    } catch(e) {
                        Toast.error("Failed to update status");
                    } finally {
                        Loader.hide();
                    }
                });
            }));
    }

    renderPage();
}