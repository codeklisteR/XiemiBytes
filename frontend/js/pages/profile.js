/**
 * Profile Page
 */

async function ProfilePage() {
    const app = Utils.$('#app');
    const user = AppState.user;

    if (!user) {
        ROUTER.navigate('/login');
        return;
    }

    const isStaff = AppState.isStaff();

    // Only load vouchers for non-staff users
    let vouchers = [];
    if (!isStaff) {
        try {
            const res = await VouchersModule.getVouchers();
            vouchers = Array.isArray(res) ? res : (res.data || []);
        } catch (e) {}
    }

    const pts = user.pts ?? 0;

    // Capitalise role for display
    function formatRole(role) {
        if (!role) return 'Customer';
        const map = {
            superadmin: 'Super Admin',
            manager: 'Manager',
            staff: 'Staff',
            customer: 'Customer',
        };
        return map[role.toLowerCase()] || role.charAt(0).toUpperCase() + role.slice(1);
    }

    const roleLabel = formatRole(user.role);
    const roleColor = user.role === 'superadmin' ? '#7c3aed'
        : user.role === 'manager' ? '#a01a1a'
        : user.role === 'staff' ? '#0369a1'
        : '#64748b';

    app.innerHTML = `
        <div class="profile-page container mt-4" style="max-width:900px; padding-bottom:48px;">
            <h1 class="page-section-title">My Account</h1>
            <p class="page-section-sub">Manage your profile${isStaff ? '' : ', points, and vouchers'}</p>

            <div class="profile-grid">
                <nav class="profile-nav">
                    <a href="#/profile" class="active">Profile</a>
                    ${!isStaff ? `<a href="#/orders">My Orders</a>` : ''}
                    ${!isStaff ? `<a href="#/cart">Cart</a>` : ''}
                    <button type="button" id="btn-logout">Sign Out</button>
                </nav>

                <div>
                    <div class="profile-panel mb-4">
                        <div class="d-flex justify-content-between align-items-start flex-wrap gap-3">
                            <div>
                                <div style="width:64px; height:64px; background:var(--color-primary); color:#fff; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:1.5rem; font-weight:700; margin-bottom:12px;">
                                    ${user.first_name.charAt(0).toUpperCase()}
                                </div>
                                <h2 style="font-size:1.25rem; font-weight:700; margin-bottom:4px;">${user.first_name}</h2>
                                <p class="text-muted small mb-0">${user.email}</p>
                                ${user.phone ? `<p class="text-muted small">${user.phone}</p>` : ''}
                                <span style="display:inline-block; margin-top:8px; background:${roleColor}18; color:${roleColor}; border:1px solid ${roleColor}40; padding:2px 12px; border-radius:20px; font-size:0.78rem; font-weight:700;">
                                    ${roleLabel}
                                </span>
                            </div>
                            ${!isStaff ? `
                            <div style="text-align:right;">
                                <div class="text-muted small">Loyalty Points</div>
                                <div class="points-display">${pts}</div>
                                <p class="text-muted small mt-1">10 points per completed order</p>
                            </div>
                            ` : ''}
                        </div>
                    </div>

                    <div class="profile-panel mb-4">
                        <div class="d-flex justify-content-between align-items-center mb-3">
                            <h3 style="font-size:1rem; font-weight:700; margin:0;">Account Details</h3>
                            <button class="btn btn-sm btn-light" id="btn-edit-profile">Edit</button>
                        </div>
                        <div id="profile-view">
                            <p><span class="text-muted">Name</span><br><strong>${user.first_name}</strong></p>
                            <p class="mt-2"><span class="text-muted">Email</span><br><strong>${user.email}</strong></p>
                        </div>
                        <div id="profile-edit" style="display:none;">
                            <div class="form-group mb-2">
                                <label class="small">Full Name</label>
                                <input type="text" id="edit-name" class="form-control" value="${user.first_name}">
                            </div>
                            <div class="form-group mb-3">
                                <label class="small">Email</label>
                                <input type="email" id="edit-email" class="form-control" value="${user.email}">
                            </div>
                            <button class="btn btn-primary btn-sm" id="btn-save-profile">Save</button>
                            <button class="btn btn-light btn-sm" id="btn-cancel-edit">Cancel</button>
                        </div>
                    </div>

                    ${!isStaff ? `
                    <div class="profile-panel mb-4">
                        <h3 style="font-size:1rem; font-weight:700; margin-bottom:12px;">My Vouchers</h3>
                        ${vouchers.length ? vouchers.map(v => `
                            <div style="padding:12px 0; border-bottom:1px solid var(--color-border);">
                                <code style="font-weight:700; color:var(--color-primary);">${v.code}</code>
                                <div class="text-muted small">${v.description}</div>
                                <div class="small mt-1">${v.claimed ? 'Used' : 'Available'} · Exp. ${v.expiry || 'N/A'}</div>
                            </div>
                        `).join('') : '<p class="text-muted small">No vouchers available. Check back during promotions.</p>'}
                    </div>
                    ` : ''}

                    <div class="profile-panel">
                        <h3 style="font-size:1rem; font-weight:700; margin-bottom:12px;">Change Password</h3>
                        <div class="form-group mb-2">
                            <label class="small">Current Password</label>
                            <input type="password" id="current-password" class="form-control">
                        </div>
                        <div class="form-group mb-2">
                            <label class="small">New Password</label>
                            <input type="password" id="new-password" class="form-control">
                        </div>
                        <div class="form-group mb-3">
                            <label class="small">Confirm Password</label>
                            <input type="password" id="confirm-password" class="form-control">
                        </div>
                        <button class="btn btn-primary btn-sm" id="btn-change-password">Update Password</button>
                    </div>
                </div>
            </div>
        </div>
    `;

    Utils.$('#btn-edit-profile')?.addEventListener('click', () => {
        Utils.$('#profile-view').style.display = 'none';
        Utils.$('#profile-edit').style.display = 'block';
        Utils.$('#btn-edit-profile').style.display = 'none';
    });

    Utils.$('#btn-cancel-edit')?.addEventListener('click', () => {
        Utils.$('#profile-view').style.display = 'block';
        Utils.$('#profile-edit').style.display = 'none';
        Utils.$('#btn-edit-profile').style.display = '';
    });

    Utils.$('#btn-save-profile')?.addEventListener('click', async () => {
        const name = Utils.$('#edit-name').value.trim();
        const email = Utils.$('#edit-email').value.trim();
        if (!name || !email) return Toast.error('Fill in all fields.');
        try {
            await AuthModule.updateProfile({ first_name: name, email });
            Utils.$('#profile-view').innerHTML = `
                <p><span class="text-muted">Name</span><br><strong>${name}</strong></p>
                <p class="mt-2"><span class="text-muted">Email</span><br><strong>${email}</strong></p>
            `;
            Utils.$('#profile-view').style.display = 'block';
            Utils.$('#profile-edit').style.display = 'none';
            Utils.$('#btn-edit-profile').style.display = '';
        } catch (e) {}
    });

    Utils.$('#btn-change-password')?.addEventListener('click', async () => {
        await AuthModule.changePassword(
            Utils.$('#current-password').value,
            Utils.$('#new-password').value,
            Utils.$('#confirm-password').value
        );
    });

    Utils.$('#btn-logout')?.addEventListener('click', () => HeaderComponent.confirmLogout());
}