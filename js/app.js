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
            HeaderComponent.updateAuthMenu();
        } catch (error) {
            console.warn('Session expired, please login again');
            AppState.logout();
        }
    }

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

    // Protected routes (require authentication)
    ROUTER.register('/cart', CartPage, { requireAuth: true });
    ROUTER.register('/checkout', CheckoutPage, { requireAuth: true });
    ROUTER.register('/orders', OrdersPage, { requireAuth: true });
    ROUTER.register('/profile', ProfilePage, { requireAuth: true });

    // Admin routes (require admin role)
    ROUTER.register('/admin', AdminDashboardPage, { requireAuth: true, requireAdmin: true });
    ROUTER.register('/admin/orders', AdminOrdersPage, { requireAuth: true, requireAdmin: true });
    ROUTER.register('/admin/products', AdminProductsPage, { requireAuth: true, requireAdmin: true });
    ROUTER.register('/admin/pos', AdminPOSPage, { requireAuth: true, requireStaff: true });
    ROUTER.register('/admin/reports', AdminReportsPage, { requireAuth: true, requireAdmin: true });
}

function setupMiddleware() {
    // You can add middleware here for logging, analytics, etc.
    ROUTER.before(async (route, path) => {
        // Add any pre-navigation logic
        return true;
    });

    ROUTER.after(async (route, path) => {
        // Add any post-navigation logic
    });
}