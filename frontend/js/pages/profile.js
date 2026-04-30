/**
 * Profile Page Handler
 */

async function ProfilePage() {
    const app = Utils.$('#app');
    const user = AppState.user;

    if (!user) {
        ROUTER.navigate('/login');
        return;
    }

    const roleBadgeColor = {
        superadmin: '#ef4444',
        manager: '#f59e0b',
        staff: '#3b82f6',
        customer: '#94a3b8',
    };
    const roleColor = roleBadgeColor[user.role] || '#94a3b8';
    const roleLabel = user.role ? (user.role.charAt(0).toUpperCase() + user.role.slice(1)) : 'Customer';

    app.innerHTML = `
        <div class="profile-page fade-in container mt-4" style="max-width: 780px;">
            <h1 class="font-weight-bold mb-1" style="color: #1e293b;">My Profile</h1>
            <p class="text-muted mb-4">Manage your account information</p>

            <div class="row" style="gap: 0;">

                <!-- Left: Avatar + Info Card -->
                <div class="col-md-4 mb-4">
                    <div class="card p-4 text-center" style="border-radius: 18px; border: 1px solid #e2e8f0;">
                        <div style="width: 90px; height: 90px; background: var(--color-primary); color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 2.2rem; font-weight: 800; margin: 0 auto 16px;">
                            ${user.first_name.charAt(0).toUpperCase()}
                        </div>
                        <h4 class="font-weight-bold mb-1" style="color: #1e293b;">${user.first_name}</h4>
                        <p class="text-muted small mb-3">${user.email}</p>
                        <span style="background: ${roleColor}18; color: ${roleColor}; border: 1px solid ${roleColor}40; padding: 4px 14px; border-radius: 20px; font-size: 0.78rem; font-weight: 700;">
                            ${roleLabel}
                        </span>

                        <hr style="margin: 20px 0; border-color: #e2e8f0;">

                        <a href="#/orders" class="btn btn-light btn-block mb-2" style="border-radius: 10px; font-weight: 600; border: 1px solid #e2e8f0;">
                            My Orders
                        </a>
                        <button class="btn btn-light btn-block" id="btn-logout" style="border-radius: 10px; font-weight: 600; color: #ef4444; border: 1px solid #fecaca;">
                            Sign Out
                        </button>
                    </div>
                </div>

                <!-- Right: Details + Change Password -->
                <div class="col-md-8">
                    <!-- Account Info -->
                    <div class="card p-4 mb-4" style="border-radius: 18px; border: 1px solid #e2e8f0;">
                        <div class="d-flex justify-content-between align-items-center mb-3">
                            <h5 class="font-weight-bold mb-0" style="color: #1e293b;">Account Information</h5>
                            <button class="btn btn-sm btn-light" id="btn-edit-profile" style="border-radius: 8px; font-weight: 600; border: 1px solid #e2e8f0;">Edit</button>
                        </div>

                        <div id="profile-view">
                            <div class="mb-3">
                                <label class="text-muted" style="font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.5px;">Full Name</label>
                                <div class="font-weight-bold" style="color: #1e293b;">${user.first_name}</div>
                            </div>
                            <div class="mb-3">
                                <label class="text-muted" style="font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.5px;">Email Address</label>
                                <div class="font-weight-bold" style="color: #1e293b;">${user.email}</div>
                            </div>
                            <div>
                                <label class="text-muted" style="font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.5px;">Account Type</label>
                                <div class="font-weight-bold" style="color: #1e293b;">${roleLabel}</div>
                            </div>
                        </div>

                        <div id="profile-edit" style="display:none;">
                            <div class="mb-3">
                                <label class="font-weight-bold small">Full Name</label>
                                <input type="text" id="edit-name" class="form-control" value="${user.first_name}" style="border-radius:10px;">
                            </div>
                            <div class="mb-3">
                                <label class="font-weight-bold small">Email Address</label>
                                <input type="email" id="edit-email" class="form-control" value="${user.email}" style="border-radius:10px;">
                            </div>
                            <div class="d-flex gap-2" style="gap:10px;">
                                <button class="btn btn-primary" id="btn-save-profile" style="border-radius:10px; font-weight:700;">Save Changes</button>
                                <button class="btn btn-light" id="btn-cancel-edit" style="border-radius:10px;">Cancel</button>
                            </div>
                        </div>
                    </div>

                    <!-- Change Password -->
                    <div class="card p-4" style="border-radius: 18px; border: 1px solid #e2e8f0;">
                        <div class="d-flex justify-content-between align-items-center mb-3">
                            <h5 class="font-weight-bold mb-0" style="color: #1e293b;">Change Password</h5>
                        </div>
                        <div class="mb-3">
                            <label class="font-weight-bold small">Current Password</label>
                            <input type="password" id="current-password" class="form-control" placeholder="Enter current password" style="border-radius:10px;">
                        </div>
                        <div class="mb-3">
                            <label class="font-weight-bold small">New Password</label>
                            <input type="password" id="new-password" class="form-control" placeholder="Enter new password" style="border-radius:10px;">
                        </div>
                        <div class="mb-3">
                            <label class="font-weight-bold small">Confirm New Password</label>
                            <input type="password" id="confirm-password" class="form-control" placeholder="Confirm new password" style="border-radius:10px;">
                        </div>
                        <button class="btn btn-primary" id="btn-change-password" style="border-radius:10px; font-weight:700;">Update Password</button>
                    </div>
                </div>
            </div>
        </div>
    `;

    // Edit / Cancel
    Utils.$('#btn-edit-profile').addEventListener('click', () => {
        Utils.$('#profile-view').style.display = 'none';
        Utils.$('#profile-edit').style.display = 'block';
        Utils.$('#btn-edit-profile').style.display = 'none';
    });

    Utils.$('#btn-cancel-edit').addEventListener('click', () => {
        Utils.$('#profile-view').style.display = 'block';
        Utils.$('#profile-edit').style.display = 'none';
        Utils.$('#btn-edit-profile').style.display = '';
    });

    // Save profile
    Utils.$('#btn-save-profile').addEventListener('click', async () => {
        const name = Utils.$('#edit-name').value.trim();
        const email = Utils.$('#edit-email').value.trim();
        if (!name || !email) { Toast.error('Please fill in all fields.'); return; }
        try {
            await AuthModule.updateProfile({ first_name: name, email });
            Utils.$('#profile-view').innerHTML = `
                <div class="mb-3">
                    <label class="text-muted" style="font-size:0.75rem; text-transform:uppercase; letter-spacing:0.5px;">Full Name</label>
                    <div class="font-weight-bold" style="color:#1e293b;">${name}</div>
                </div>
                <div class="mb-3">
                    <label class="text-muted" style="font-size:0.75rem; text-transform:uppercase; letter-spacing:0.5px;">Email Address</label>
                    <div class="font-weight-bold" style="color:#1e293b;">${email}</div>
                </div>
                <div>
                    <label class="text-muted" style="font-size:0.75rem; text-transform:uppercase; letter-spacing:0.5px;">Account Type</label>
                    <div class="font-weight-bold" style="color:#1e293b;">${roleLabel}</div>
                </div>
            `;
            Utils.$('#profile-view').style.display = 'block';
            Utils.$('#profile-edit').style.display = 'none';
            Utils.$('#btn-edit-profile').style.display = '';
        } catch(e) {}
    });

    // Change password
    Utils.$('#btn-change-password').addEventListener('click', async () => {
        const current = Utils.$('#current-password').value;
        const newPass = Utils.$('#new-password').value;
        const confirm = Utils.$('#confirm-password').value;
        if (!current || !newPass || !confirm) { Toast.error('Please fill in all password fields.'); return; }
        try {
            await AuthModule.changePassword(current, newPass, confirm);
            Utils.$('#current-password').value = '';
            Utils.$('#new-password').value = '';
            Utils.$('#confirm-password').value = '';
        } catch(e) {}
    });

    // Logout
    Utils.$('#btn-logout').addEventListener('click', () => HeaderComponent.confirmLogout());
}
