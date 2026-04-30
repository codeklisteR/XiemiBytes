/**
 * Header Component
 */

const HeaderComponent = {
    /**
     * Render header
     */
    render() {
        const header = Utils.$('#header');
        const sidebar = Utils.$('#sidebar');
        const cartCount = AppState.getCartItemCount();
        const path = window.location.hash.slice(1) || '/';
        const isAdminRoute = path.startsWith('/admin');

        if (isAdminRoute && AppState.isStaff()) {
            document.body.classList.add('admin-layout');
            sidebar.style.display = 'flex';
            header.style.display = 'none';
            this.renderSidebar(path);
            return;
        }

        document.body.classList.remove('admin-layout');
        sidebar.style.display = 'none';
        header.style.display = 'block';

        header.innerHTML = `
            <nav class="navbar">
                <div class="nav-brand">
                    <a href="#/">
                        <img src="images/xiemihead.png" alt="XiemiBytes" class="logo">
                        <span style="color: var(--color-primary); font-weight: bold;">XiemiBytes</span>
                    </a>
                </div>

                <ul class="nav-menu">
                    <li><a href="#/">Home</a></li>
                    <li><a href="#/products">Products</a></li>
                    <li><a href="#/orders">Orders</a></li>
                    <li>
                        <a href="#/cart" class="cart-link">
                            Cart <span class="cart-badge" id="cart-badge">${cartCount}</span>
                        </a>
                    </li>
                    ${AppState.isAdmin() ? '<li><a href="#/admin">Admin</a></li>' : ''}
                    <li id="auth-menu"></li>
                </ul>
            </nav>
        `;

        this.updateAuthMenu();
    },

    /**
     * Render Admin Sidebar
     */
    renderSidebar(currentPath) {
        const sidebar = Utils.$('#sidebar');
        const user = AppState.user;

        // Define all possible menu items
        const allItems = [
            { path: '/admin', label: 'Dashboard', roles: ['staff', 'manager', 'superadmin'] },
            { path: '/admin/pos', label: 'POS System', roles: ['staff', 'manager', 'superadmin'] },
            { path: '/admin/orders', label: 'Orders', roles: ['staff', 'manager', 'superadmin'] },
            { path: '/admin/products', label: 'Products', roles: ['manager', 'superadmin'] },
            { path: '/admin/vouchers', label: 'Vouchers', roles: ['manager', 'superadmin'] },
            { path: '/admin/reports', label: 'Sales Reports', roles: ['manager', 'superadmin'] },
            { path: '/admin/users', label: 'User Management', roles: ['superadmin'] },
        ];

        // Filter items based on user role
        const menuItems = allItems.filter(item => item.roles.includes(user.role));

        sidebar.innerHTML = `
            <div class="sidebar-header">
                <div class="sidebar-logo-img">X</div>
                <div class="sidebar-brand">Xiemi Admin ${user.role === 'superadmin' ? '★' : ''}</div>
            </div>
            
            <ul class="sidebar-menu">
                ${menuItems.map(item => `
                    <li class="sidebar-menu-item">
                        <a href="#${item.path}" class="${currentPath === item.path ? 'active' : ''}">
                            <span>${item.label}</span>
                        </a>
                    </li>
                `).join('')}
            </ul>

            <div class="sidebar-footer">
                <div class="sidebar-user">
                    <div class="sidebar-user-avatar">
                        ${user ? user.first_name.charAt(0) : 'A'}
                    </div>
                    <div class="sidebar-user-info">
                        <div class="sidebar-user-name">${user ? user.first_name : 'Admin'}</div>
                        <div class="sidebar-user-role">${user ? user.role : 'Staff'}</div>
                    </div>
                </div>
                <div class="sidebar-actions">
                    <a href="#/profile" class="btn btn-sm w-100 mb-1" style="border-color: var(--admin-sidebar-border); color: var(--admin-sidebar-text-muted); background: transparent; border: 1px solid var(--admin-sidebar-border);">
                        My Profile
                    </a>
                    <a href="#/" class="btn btn-sm w-100 mb-1" style="border-color: var(--admin-sidebar-border); color: var(--admin-sidebar-text-muted); background: transparent; border: 1px solid var(--admin-sidebar-border);">
                        Exit to Shop
                    </a>
                    <button class="btn btn-sm btn-danger w-100" onclick="HeaderComponent.confirmLogout()">
                        Logout
                    </button>
                </div>
            </div>
        `;
    },

    /**
     * Update auth menu based on login state
     */
    updateAuthMenu() {
        const authMenu = Utils.$('#auth-menu');

        if (AppState.isLoggedIn()) {
            authMenu.innerHTML = `
                <div class="user-menu">
                    <button class="btn-user">${AppState.user.first_name}</button>
                    <div class="dropdown">
                        <a href="#/profile">Profile</a>
                        <a href="#/orders">My Orders</a>
                        ${AppState.isStaff() ? '<a href="#/admin">Admin Panel</a>' : ''}
                        <hr>
                        <a href="#" onclick="HeaderComponent.confirmLogout(); return false;">Logout</a>
                    </div>
                </div>
            `;
        } else {
            authMenu.innerHTML = `
                <a href="#/login" class="btn btn-primary">Login</a>
                <a href="#/register" class="btn btn-secondary">Register</a>
            `;
        }
    },

    /**
     * Update cart badge
     */
    updateCartBadge() {
        const badge = Utils.$('#cart-badge');
        if (badge) {
            const count = AppState.getCartItemCount();
            badge.textContent = count;
            badge.style.display = count > 0 ? 'inline' : 'none';
        }
    },
    /**
     * Confirm logout before executing
     */
    confirmLogout() {
        Modal.confirm(
            'Are you sure you want to sign out?',
            () => AuthModule.logout()
        );
    },
};

console.log('✓ Header loaded');