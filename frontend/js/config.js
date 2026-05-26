const CONFIG = {
    // API Configuration
    API: {
        BASE_URL: 'http://localhost/backend',
        TIMEOUT: 10000,
        DEBUG: true, // Set to false in production
    },

    // Local Storage Keys
    STORAGE: {
        TOKEN: 'auth_token',
        USER: 'auth_user',
        CART: 'cart_items',
        PREFERENCES: 'user_preferences',
    },

    // Routes
    ROUTES: {
        HOME: '/',
        PRODUCTS: '/products',
        PRODUCT_DETAIL: '/products/:id',
        CART: '/cart',
        CHECKOUT: '/checkout',
        ORDERS: '/orders',
        ORDER_DETAIL: '/orders/:id',
        ORDER_TRACKING: '/orders/:id/tracking',
        LOGIN: '/login',
        REGISTER: '/register',
        PROFILE: '/profile',
        ADMIN_DASHBOARD: '/admin',
        ADMIN_ORDERS: '/admin/orders',
        ADMIN_PRODUCTS: '/admin/products',
        ADMIN_POS: '/admin/pos',
        ADMIN_REPORTS: '/admin/reports',
    },

    // Business Rules
    BUSINESS: {
        MIN_PURCHASE_FOR_POINTS: 500,
        POINTS_PER_PESO: 1,
        SERVICE_CHARGE_PERCENTAGE: 0,
        TAX_PERCENTAGE: 0,
        ITEMS_PER_PAGE: 12,
        ADMIN_ITEMS_PER_PAGE: 10,
    },

    // Store info (pickup location, hours)

    STORE: {
        name: 'Xiemi Coffee and Tea',
        address: 'Casiguran Port Street, Casiguran, Philippines, 4702',
        hours: 'Monday – Sunday, 9:00 AM – 7:00 PM',
        phone: '0963 178 9811',
        email: 'xiemi.casiguran.sorsogon@gmail.com',

    },

    // UI Configuration
    UI: {
        TOAST_DURATION: 3000,
        DEBOUNCE_DELAY: 300,
        ANIMATION_DURATION: 300,
        ORDER_POLL_INTERVAL: 20000,
    },

    // Environment
    ENV: {
        isDevelopment: window.location.hostname === 'localhost',
        isProduction: window.location.hostname !== 'localhost',
    },
};

console.log('✓ Config loaded');