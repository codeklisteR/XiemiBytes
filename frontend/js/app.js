/**
 * Application Entry Point
 * Initializes the app and registers routes
 */

document.addEventListener('DOMContentLoaded', async () => {
    console.log('🚀 XiemiBytes App Initializing...');

    // Render header
    HeaderComponent.render();

    // Register routes
    registerRoutes();

    // Setup middleware
    setupMiddleware();

    // Try to restore user session
    if (Storage.getToken()) {
        try {
            await AuthModule.getCurrentUser();
        } catch (error) {
            console.warn('Session expired, please login again');
            AppState.logout();
        }
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

    // Admin routes — Staff can access dashboard, pos, orders
    ROUTER.register('/admin', AdminDashboardPage, { requireAuth: true, requireStaff: true });
    ROUTER.register('/admin/pos', AdminPOSPage, { requireAuth: true, requireStaff: true });
    ROUTER.register('/admin/orders', AdminOrdersPage, { requireAuth: true, requireStaff: true });

    // Manager+ only
    ROUTER.register('/admin/products', AdminProductsPage, { requireAuth: true, requireAdmin: true });
    ROUTER.register('/admin/vouchers', AdminVouchersPage, { requireAuth: true, requireAdmin: true });
    ROUTER.register('/admin/reports', AdminReportsPage, { requireAuth: true, requireAdmin: true });

    // Superadmin only
    ROUTER.register('/admin/users', AdminUsersPage, { requireAuth: true, requireSuperAdmin: true });
}

function setupMiddleware() {
    // You can add middleware here for logging, analytics, etc.
    ROUTER.before(async (route, path) => {
        // Add any pre-navigation logic
        return true;
    });

    ROUTER.after(async (route, path) => {
        // Re-render header/sidebar on every navigation
        HeaderComponent.render();
    });
}