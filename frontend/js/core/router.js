/**
 * Client-Side Router
 * Handles navigation and page rendering
 */

class Router {
    constructor() {
        this.routes = [];
        this.currentRoute = null;
        this.beforeHooks = [];
        this.afterHooks = [];

        // Listen to hash changes
        window.addEventListener('hashchange', () => this.navigate());
        window.addEventListener('popstate', () => this.navigate());
    }

    /**
     * Register a route
     */
    register(path, handler, options = {}) {
        this.routes.push({
            path,
            handler,
            options: {
                requireAuth: false,
                requireAdmin: false,
                requireStaff: false,
                requireSuperAdmin: false,
                ...options,
            },
        });
    }

    /**
     * Add before hook
     */
    before(hook) {
        this.beforeHooks.push(hook);
    }

    /**
     * Add after hook
     */
    after(hook) {
        this.afterHooks.push(hook);
    }

    /**
     * Navigate to route
     */
    async navigate(path = null) {
        const targetPath = path || this.getCurrentPath();
        console.log('ROUTER: Navigating to', targetPath);
        const route = this.findRoute(targetPath);

        if (!route) {
            console.warn('ROUTER: Route not found', targetPath);
            this.renderNotFound();
            return;
        }

        // Check authentication
        if (route.options.requireAuth && !AppState.isLoggedIn()) {
            const reason = targetPath.includes('cart') ? 'cart_auth' : 
                          targetPath.includes('orders') ? 'orders_auth' : 'auth_required';
            this.push(`${CONFIG.ROUTES.LOGIN}?reason=${reason}`);
            return;
        }

        // Check admin access
        if (route.options.requireAdmin && !AppState.isAdmin()) {
            this.renderUnauthorized();
            return;
        }

        // Check staff access
        if (route.options.requireStaff && !AppState.isStaff()) {
            this.renderUnauthorized();
            return;
        }

        // Check superadmin access
        if (route.options.requireSuperAdmin && !AppState.isSuperAdmin()) {
            this.renderUnauthorized();
            return;
        }

        // Run before hooks
        for (const hook of this.beforeHooks) {
            const proceed = await hook(route, targetPath);
            if (proceed === false) return;
        }

        // Show loader
        Loader.show();

        try {
            // Render page
            console.log('ROUTER: Executing handler for', targetPath);
            await route.handler(targetPath);
            this.currentRoute = route;
            console.log('ROUTER: Successfully rendered', targetPath);

            // Update URL if different
            if (this.getCurrentPath() !== targetPath) {
                window.location.hash = `#${targetPath}`;
            }

            // Run after hooks
            for (const hook of this.afterHooks) {
                await hook(route, targetPath);
            }

            // Scroll to top
            window.scrollTo(0, 0);
        } catch (error) {
            Utils.error('Route handler error:', error);
            this.renderError(error.message);
        } finally {
            Loader.hide();
        }
    }

    /**
     * Find matching route
     */
    findRoute(path) {
        // Exact match
        const exactRoute = this.routes.find((r) => r.path === path);
        if (exactRoute) return exactRoute;

        // Pattern match
        for (const route of this.routes) {
            const regex = this.patternToRegex(route.path);
            if (regex.test(path)) {
                return route;
            }
        }

        return null;
    }

    /**
     * Convert route pattern to regex
     */
    patternToRegex(pattern) {
        const regexPattern = pattern.replace(/:\w+/g, '([^/]+)');
        return new RegExp(`^${regexPattern}$`);
    }

    /**
     * Get current path from hash
     */
    getCurrentPath() {
        const hash = window.location.hash.slice(1);
        const path = hash.split('?')[0];
        return path || CONFIG.ROUTES.HOME;
    }

    /**
     * Navigate to path
     */
    push(path) {
        window.location.hash = `#${path}`;
    }

    /**
     * Render 404 page
     */
    renderNotFound() {
        const app = Utils.$('#app');
        app.innerHTML = `
            <div class="error-page">
                <div class="error-content">
                    <h1>404</h1>
                    <h2>Page Not Found</h2>
                    <p>The page you're looking for doesn't exist.</p>
                    <a href="#/" class="btn btn-primary">Back to Home</a>
                </div>
            </div>
        `;
    }

    /**
     * Render 403 page
     */
    renderUnauthorized() {
        const app = Utils.$('#app');
        app.innerHTML = `
            <div class="error-page">
                <div class="error-content">
                    <h1>403</h1>
                    <h2>Access Denied</h2>
                    <p>You don't have permission to access this page.</p>
                    <a href="#/" class="btn btn-primary">Back to Home</a>
                </div>
            </div>
        `;
    }

    /**
     * Render error page
     */
    renderError(message = 'Something went wrong') {
        const app = Utils.$('#app');
        app.innerHTML = `
            <div class="error-page">
                <div class="error-content">
                    <h1>Error</h1>
                    <p>${message}</p>
                    <a href="#/" class="btn btn-primary">Back to Home</a>
                </div>
            </div>
        `;
    }
}

// Global router instance
const ROUTER = new Router();

console.log('✓ Router loaded');