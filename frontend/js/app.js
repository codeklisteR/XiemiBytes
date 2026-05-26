/**
 * Application Entry Point
 */

document.addEventListener('DOMContentLoaded', async () => {
    console.log('🚀 XiemiBytes App Initializing...');

    // Render header
    HeaderComponent.render();

    // Register routes
    registerRoutes();

    // Setup middleware
    setupMiddleware();

    // Try to restore user session (skip on register page)
    const currentHash = window.location.hash.slice(1);
    if (Storage.getToken() && currentHash !== '/register') {
        try {
            await AuthModule.getCurrentUser();
        } catch (error) {
            console.warn('Session expired, please login again');
            AppState.logout();
        }
    } else if (currentHash === '/register') {
        // Always clear session when landing on register
        Storage.removeToken();
        Storage.removeUser();
    }

    FooterComponent.render();

    if (Storage.getToken()) {
        OrdersModule.startPolling();
    }

    // Trigger initial navigation
    ROUTER.navigate();

    // Subscribe to state changes
    AppState.subscribe((state, changes) => {
        if (changes.cart) {
            HeaderComponent.updateCartBadge();
        }

        if (changes.user || changes.isAuthenticated) {
            HeaderComponent.updateAuthMenu();
            if (changes.isAuthenticated && AppState.isLoggedIn()) {
                OrdersModule.startPolling();
            } else if (changes.isAuthenticated === false) {
                OrdersModule.stopPolling();
            }
        }
    });

    console.log('✓ App Initialized');
});

function registerRoutes() {
    // Public routes
    ROUTER.register('/', HomePage);
    ROUTER.register('/products', ProductsPage);
    ROUTER.register('/login', LoginPage);
    ROUTER.register('/register', RegisterPage);

    // Soft-auth routes — page handles its own friendly gate when not logged in
    ROUTER.register('/cart', CartPage);
    ROUTER.register('/orders', OrdersPage);

    // Hard-auth routes — router redirects to login if not authenticated
    ROUTER.register('/checkout', CheckoutPage, { requireAuth: true });
    ROUTER.register('/profile', ProfilePage, { requireAuth: true });

    // Staff routes — dashboard and order management
    ROUTER.register('/admin', AdminDashboardPage, { requireAuth: true, requireStaff: true });
    ROUTER.register('/admin/orders', AdminOrdersPage, { requireAuth: true, requireStaff: true });
    ROUTER.register('/admin/pos', AdminPOSPage, { requireAuth: true, requireStaff: true });

    // Manager+ only
    ROUTER.register('/admin/products', AdminProductsPage, { requireAuth: true, requireAdmin: true });
    ROUTER.register('/admin/reports', AdminReportsPage, { requireAuth: true, requireAdmin: true });

    // Superadmin only
    ROUTER.register('/admin/vouchers', AdminVouchersPage, { requireAuth: true, requireSuperAdmin: true });
    ROUTER.register('/admin/users', AdminUsersPage, { requireAuth: true, requireSuperAdmin: true });
}

function setupMiddleware() {
    // You can add middleware here for logging, analytics, etc.
    ROUTER.before(async (route, path) => {
        // Add any pre-navigation logic
        return true;
    });

    ROUTER.after(async (route, path) => {
        HeaderComponent.render();
        if (!path.startsWith('/admin')) {
            FooterComponent.render();
            OrdersModule.checkReadyNotifications?.();
        } else {
            FooterComponent.hide();
        }
    });
}