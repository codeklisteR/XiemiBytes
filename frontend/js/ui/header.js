/**
 * Header Component
 */

const HeaderComponent = {

    // --- Online-order sound notification ----------------------------------------
    // Plays a soft chime when a NEW online order arrives.
    // Call HeaderComponent.startOrderPoll() once the admin is logged in.
    // -------------------------------------------------------------------------
    _lastKnownOrderIds: null,
    _pollInterval: null,

    playOrderChime() {
        try {
            const ctx = new (window.AudioContext || window.webkitAudioContext)();

            function beep(freq, startTime, duration, gain) {
                const osc = ctx.createOscillator();
                const env = ctx.createGain();
                osc.connect(env);
                env.connect(ctx.destination);
                osc.type = 'sine';
                osc.frequency.setValueAtTime(freq, startTime);
                env.gain.setValueAtTime(0, startTime);
                env.gain.linearRampToValueAtTime(gain, startTime + 0.02);
                env.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
                osc.start(startTime);
                osc.stop(startTime + duration);
            }

            const t = ctx.currentTime;
            beep(880, t,        0.18, 0.25);
            beep(1100, t + 0.14, 0.18, 0.22);
            beep(1320, t + 0.28, 0.28, 0.20);
        } catch (e) {
            // AudioContext not available or blocked — fail silently
        }
    },

    startOrderPoll() {
        if (this._pollInterval) return; // already running
        if (!AppState.isStaff()) return;

        // Initialise with current IDs so we don't chime on first load
        this._initOrderIds();

        this._pollInterval = setInterval(async () => {
            try {
                const res = await API.get('/admin/orders.php');
                const orders = res.data || [];
                // Only consider online orders (not pos/walkin) with status 'pay' (newly placed)
                const onlineNew = orders.filter(o =>
                    o.order_mode !== 'pos' && o.order_type !== 'walkin' && o.order_status === 'pay'
                );
                const currentIds = new Set(onlineNew.map(o => o.db_id || o.id));

                if (this._lastKnownOrderIds !== null) {
                    const isNew = [...currentIds].some(id => !this._lastKnownOrderIds.has(id));
                    if (isNew) {
                        this.playOrderChime();
                        Toast.show('New online order received!', 'success');
                    }
                }

                this._lastKnownOrderIds = currentIds;
            } catch (_) {
                // Network error — ignore
            }
        }, 20000); // poll every 20 s
    },

    stopOrderPoll() {
        if (this._pollInterval) {
            clearInterval(this._pollInterval);
            this._pollInterval = null;
        }
        this._lastKnownOrderIds = null;
    },

    async _initOrderIds() {
        try {
            const res = await API.get('/admin/orders.php');
            const orders = res.data || [];
            const onlineNew = orders.filter(o =>
                o.order_mode !== 'pos' && o.order_type !== 'walkin' && o.order_status === 'pay'
            );
            this._lastKnownOrderIds = new Set(onlineNew.map(o => o.db_id || o.id));
        } catch (_) {
            this._lastKnownOrderIds = new Set();
        }
    },
    // ---------------------------------------------------------------------------

    /**
     * Render header
     */
    render() {
        const header = Utils.$('#header');
        const sidebar = Utils.$('#sidebar');
        const cartCount = AppState.getCartItemCount();
        const path = window.location.hash.slice(1) || '/';
        const isAdminRoute = path.startsWith('/admin');
        const isStaff = AppState.isStaff();

        if (isAdminRoute && isStaff) {
            document.body.classList.add('admin-layout');
            sidebar.style.display = 'flex';
            header.style.display = 'none';
            this.renderSidebar(path);
            // Start polling for new online orders once the admin sidebar is shown
            this.startOrderPoll();
            return;
        }

        document.body.classList.remove('admin-layout');
        sidebar.style.display = 'none';
        header.style.display = 'block';

        // If an admin/staff member visits the shop, hide Orders + Cart nav items
        const hideCustomerLinks = isStaff;

        header.innerHTML = `
            <nav class="navbar" style="background: #ffffff; box-shadow: 0 1px 3px rgba(0,0,0,0.05); padding: 14px 24px; display: flex; align-items: center; justify-content: space-between;">
                <div class="nav-brand">
                    <a href="#/" style="display: flex; align-items: center; gap: 10px; text-decoration: none;">
                        <img src="images/xiemihead.png" alt="XiemiBytes" class="logo" style="height: 36px; width: auto; object-fit: contain;">
                        <span style="color: var(--color-primary); font-weight: 700; font-size: 1.25rem; letter-spacing: -0.02em;">XiemiBytes</span>
                    </a>
                </div>

                <ul class="nav-menu" style="display: flex; align-items: center; gap: 28px; list-style: none; margin: 0; padding: 0;">
                    <li><a href="#/" style="color: #475569; font-weight: 500; text-decoration: none; font-size: 0.95rem; transition: color 0.15s ease;" onmouseover="this.style.color='var(--color-primary)'" onmouseout="this.style.color='#475569'">Home</a></li>
                    <li><a href="#/products" style="color: #475569; font-weight: 500; text-decoration: none; font-size: 0.95rem; transition: color 0.15s ease;" onmouseover="this.style.color='var(--color-primary)'" onmouseout="this.style.color='#475569'">Menu</a></li>

                    ${!hideCustomerLinks ? `
                    <li><a href="#/orders" style="color: #475569; font-weight: 500; text-decoration: none; font-size: 0.95rem; transition: color 0.15s ease;" onmouseover="this.style.color='var(--color-primary)'" onmouseout="this.style.color='#475569'">Orders</a></li>
                    <li>
                        <a href="#/cart" class="cart-link" style="color: #475569; font-weight: 500; text-decoration: none; font-size: 0.95rem; display: flex; align-items: center; gap: 6px; position: relative; padding: 4px 8px;">
                            <i class="bi bi-bag" style="font-size: 1.1rem;"></i>
                            <span>Cart</span>
                            <span class="cart-badge" id="cart-badge" style="background: var(--color-primary); color: #ffffff; font-size: 0.72rem; font-weight: 700; min-width: 18px; height: 18px; border-radius: 10px; display: ${cartCount > 0 ? 'flex' : 'none'}; align-items: center; justify-content: center; padding: 0 5px; margin-left: 2px;">
                                ${cartCount}
                            </span>
                        </a>
                    </li>
                    ` : ''}

                    ${isStaff ? '<li><a href="#/admin" style="color: var(--color-primary); font-weight: 700; text-decoration: none; font-size: 0.95rem;">Admin Panel</a></li>' : ''}
                    <li id="auth-menu" style="display: flex; align-items: center;"></li>
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

        const allItems = [
            { path: '/admin',          label: 'Dashboard',       icon: 'bi-speedometer2',      roles: ['staff', 'manager', 'superadmin'] },
            { path: '/admin/pos',      label: 'POS System',      icon: 'bi-shop-window',       roles: ['staff', 'manager', 'superadmin'] },
            { path: '/admin/orders',   label: 'Orders',          icon: 'bi-receipt',           roles: ['staff', 'manager', 'superadmin'] },
            { path: '/admin/products', label: 'Products',        icon: 'bi-cup-straw',         roles: ['manager', 'superadmin'] },
            { path: '/admin/reports',  label: 'Sales Reports',   icon: 'bi-bar-chart-line',    roles: ['manager', 'superadmin'] },
            { path: '/admin/vouchers', label: 'Vouchers',        icon: 'bi-ticket-perforated', roles: ['superadmin'] },
            { path: '/admin/users',    label: 'User Management', icon: 'bi-people',            roles: ['superadmin'] },
        ];

        const currentRole = (user && user.role) ? user.role.toLowerCase() : '';
        const menuItems = allItems.filter(item => item.roles.includes(currentRole));

        sidebar.innerHTML = `
            <div class="sidebar-header">
                <div class="sidebar-logo-img">X</div>
                <div class="sidebar-brand">Xiemi Admin ${user && user.role === 'superadmin' ? '★' : ''}</div>
            </div>
            
            <ul class="sidebar-menu">
                ${menuItems.map(item => `
                    <li class="sidebar-menu-item">
                        <a href="#${item.path}" class="${currentPath === item.path ? 'active' : ''}" style="display: flex; align-items: center; gap: 12px;">
                            <i class="bi ${item.icon}"></i>
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
     * Update auth menu based on login state.
     * When the logged-in user is staff/admin, the dropdown omits
     * customer-only links (My Orders, Cart).
     */
    updateAuthMenu() {
        const authMenu = Utils.$('#auth-menu');
        const isStaff = AppState.isStaff();

        if (AppState.isLoggedIn()) {
            const firstName = (AppState.user && AppState.user.first_name) ? AppState.user.first_name : 'User';
            
            authMenu.innerHTML = `
                <div class="user-menu" id="user-menu-wrapper" style="position: relative;">
                    <button class="btn-user" id="user-menu-btn" style="background: #f8fafc; border: 1px solid #e2e8f0; padding: 6px 14px; border-radius: 20px; color: #1e293b; font-weight: 600; font-size: 0.9rem; display: flex; align-items: center; gap: 6px; cursor: pointer;">
                        <span>${firstName}</span>
                        <i class="bi bi-chevron-down" style="font-size: 0.75rem; color: #64748b;"></i>
                    </button>
                    <div class="dropdown" id="user-dropdown">
                        <a href="#/profile">Profile</a>
                        ${!isStaff ? `<a href="#/orders">My Orders</a>` : ''}
                        <hr>
                        <a href="#" id="logout-link">Logout</a>
                    </div>
                </div>
            `;

            const btn = Utils.$('#user-menu-btn');
            const dropdown = Utils.$('#user-dropdown');

            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                dropdown.classList.toggle('open');
            });

            Utils.$('#logout-link').addEventListener('click', (e) => {
                e.preventDefault();
                dropdown.classList.remove('open');
                HeaderComponent.confirmLogout();
            });

            document.addEventListener('click', function closeDropdown(e) {
                const wrapper = Utils.$('#user-menu-wrapper');
                if (!wrapper || !wrapper.contains(e.target)) {
                    dropdown.classList.remove('open');
                    document.removeEventListener('click', closeDropdown);
                }
            });
        } else {
            authMenu.innerHTML = `
                <div style="display: flex; align-items: center; gap: 10px;">
                    <a href="#/login" class="btn btn-primary" style="padding: 7px 18px; font-size: 0.9rem; font-weight: 600; border-radius: 20px; text-decoration: none;">Login</a>
                    <a href="#/register" class="btn btn-secondary" style="padding: 7px 18px; font-size: 0.9rem; font-weight: 600; border-radius: 20px; text-decoration: none; border: 1px solid #e2e8f0;">Register</a>
                </div>
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
            badge.style.display = count > 0 ? 'flex' : 'none';
        }
    },
    
    /**
     * Confirm logout before executing
     */
    confirmLogout() {
        // Stop polling when logging out
        this.stopOrderPoll();
        Modal.confirm(
            'Are you sure you want to sign out?',
            () => AuthModule.logout()
        );
    },
};

console.log('✓ Header loaded');