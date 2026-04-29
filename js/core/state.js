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
        const item = {
            id: Date.now().toString(),
            product,
            variant: options.variant || null,
            quantity: options.quantity || 1,
            addons: options.addons || [],
            instructions: options.instructions || '',
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
            const basePrice = item.product.price;
            const variantModifier = item.variant?.price_modifier || 0;
            const addonsTotal = item.addons.reduce((s, addon) => s + addon.price, 0);
            return sum + (basePrice + variantModifier + addonsTotal) * item.quantity;
        }, 0);

        const tax = subtotal * (CONFIG.BUSINESS.TAX_PERCENTAGE / 100);
        const discount = this.cart.discount || 0;
        const total = subtotal + tax - discount;

        this.cart.subtotal = Math.round(subtotal * 100) / 100;
        this.cart.tax = Math.round(tax * 100) / 100;
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
     * Check if user is admin
     */
    isAdmin() {
        return this.user && [CONSTANTS.USER_ROLE.ADMIN, CONSTANTS.USER_ROLE.SUPER_ADMIN].includes(this.user.role);
    }

    /**
     * Check if user is staff
     */
    isStaff() {
        return this.user && [CONSTANTS.USER_ROLE.STAFF, CONSTANTS.USER_ROLE.ADMIN, CONSTANTS.USER_ROLE.SUPER_ADMIN].includes(this.user.role);
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