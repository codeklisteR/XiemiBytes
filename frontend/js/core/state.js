/**
 * Global Application State
 * Simple state management without external dependencies
 */

class AppStateManager {
    constructor() {
        // Auth
        this.user = null;
        this.token = null;
        this.isAuthenticated = false;

        // UI
        this.currentPage = null;
        this.isLoading = false;
        this.error = null;

        // Cart
        this.cart = {
            items: [],
            subtotal: 0,
            discount: 0,
            tax: 0,
            total: 0,
        };

        // Other data
        this.products = [];
        this.categories = [];
        this.orders = [];

        // Observers for reactivity
        this.observers = [];

        // Initialize from storage
        this.initialize();
    }

    /**
     * Initialize state from localStorage
     */
    initialize() {
        const token = Storage.getToken();
        const user = Storage.getUser();
        const cart = Storage.getCart();

        if (token && user) {
            this.token = token;
            this.user = user;
            this.isAuthenticated = true;
        }

        if (cart && cart.length > 0) {
            this.cart.items = cart;
            this.calculateCartTotals();
        }
    }

    /**
     * Subscribe to state changes
     */
    subscribe(callback) {
        this.observers.push(callback);
        return () => {
            this.observers = this.observers.filter((obs) => obs !== callback);
        };
    }

    /**
     * Notify all observers
     */
    notify(changes = {}) {
        this.observers.forEach((callback) => {
            try {
                callback(this, changes);
            } catch (error) {
                Utils.error('Observer error:', error);
            }
        });
    }

    /**
     * Update state
     */
    setState(updates) {
        const changes = {};

        Object.entries(updates).forEach(([key, value]) => {
            if (this[key] !== value) {
                changes[key] = value;
                this[key] = value;
            }
        });

        if (Object.keys(changes).length > 0) {
            this.persistState(changes);
            this.notify(changes);
        }
    }

    /**
     * Persist state to localStorage
     */
    persistState(changes) {
        if (changes.user) {
            Storage.setUser(this.user);
        }
        if (changes.token) {
            Storage.setToken(this.token);
        }
        if (changes.cart) {
            Storage.setCart(this.cart.items);
        }
    }

    /**
     * Login
     */
    login(user, token) {
        this.setState({
            user,
            token,
            isAuthenticated: true,
        });
    }

    /**
     * Logout
     */
    logout() {
        Storage.removeToken();
        Storage.removeUser();
        Storage.removeCart();

        this.setState({
            user: null,
            token: null,
            isAuthenticated: false,
            cart: { items: [], subtotal: 0, discount: 0, tax: 0, total: 0 },
        });
    }

    // ============ CART OPERATIONS ============

    /**
     * Add item to cart
     */
    addToCart(product, options = {}) {
        const SIZE_MODIFIER = options.size === 'Large' ? 15 : 0;
        const ADDON_PRICES = { 'Pearls': 10, 'Nata de Coco': 10, 'Cheesecake': 15, 'Red Bean': 10, 'Oreo': 15, 'None': 0 };
        const addons = options.addons || [];
        const addonsTotal = addons.reduce((sum, a) => sum + (ADDON_PRICES[a] || 0), 0);
        const unitPrice = product.price + SIZE_MODIFIER + addonsTotal;

        const item = {
            id: Date.now().toString(),
            product,
            size: options.size || 'Regular',
            sugar: options.sugar || '100%',
            ice: options.ice || 'Normal',
            addons: addons,
            quantity: options.quantity || 1,
            unitPrice: unitPrice,
        };

        this.cart.items.push(item);
        this.calculateCartTotals();
        this.setState({ cart: this.cart });

        return item;
    }

    /**
     * Remove item from cart
     */
    removeFromCart(itemId) {
        this.cart.items = this.cart.items.filter((item) => item.id !== itemId);
        this.calculateCartTotals();
        this.setState({ cart: this.cart });
    }

    /**
     * Update cart item
     */
    updateCartItem(itemId, updates) {
        const item = this.cart.items.find((i) => i.id === itemId);
        if (item) {
            Object.assign(item, updates);
            this.calculateCartTotals();
            this.setState({ cart: this.cart });
        }
    }

    /**
     * Clear cart
     */
    clearCart() {
        this.setState({
            cart: { items: [], subtotal: 0, discount: 0, tax: 0, total: 0 },
        });
    }

    /**
     * Calculate cart totals
     */
    calculateCartTotals() {
        const subtotal = this.cart.items.reduce((sum, item) => {
            const price = item.unitPrice || item.product.price;
            return sum + price * item.quantity;
        }, 0);

        const discount = this.cart.discount || 0;
        const total = subtotal - discount;

        this.cart.subtotal = Math.round(subtotal * 100) / 100;
        this.cart.tax = 0;
        this.cart.total = Math.round(total * 100) / 100;
    }

    // ============ HELPER METHODS ============

    /**
     * Check if user is authenticated
     */
    isLoggedIn() {
        return this.isAuthenticated && this.token !== null;
    }

    /**
     * Check if user has role
     */
    hasRole(role) {
        return this.user && this.user.role === role;
    }

    /**
     * Check if user is admin (Manager or Superadmin)
     */
    isAdmin() {
        return this.user && [CONSTANTS.USER_ROLE.MANAGER, CONSTANTS.USER_ROLE.SUPERADMIN].includes(this.user.role);
    }

    /**
     * Check if user is staff (Staff, Manager, or Superadmin)
     */
    isStaff() {
        return this.user && [CONSTANTS.USER_ROLE.STAFF, CONSTANTS.USER_ROLE.MANAGER, CONSTANTS.USER_ROLE.SUPERADMIN].includes(this.user.role);
    }

    /**
     * Check if user is superadmin
     */
    isSuperAdmin() {
        return this.user && this.user.role === CONSTANTS.USER_ROLE.SUPERADMIN;
    }

    /**
     * Get cart item count
     */
    getCartItemCount() {
        return this.cart.items.reduce((count, item) => count + item.quantity, 0);
    }
}

// Global state instance
const AppState = new AppStateManager();

console.log('✓ AppState loaded');