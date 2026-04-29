/**
 * Local Storage Wrapper
 * Safe storage operations with fallback
 */

const Storage = {
    /**
     * Set item in localStorage
     */
    set(key, value) {
        try {
            const data = typeof value === 'string' ? value : JSON.stringify(value);
            localStorage.setItem(key, data);
            return true;
        } catch (error) {
            Utils.error('Storage.set failed', error);
            return false;
        }
    },

    /**
     * Get item from localStorage
     */
    get(key, parseJSON = true) {
        try {
            const data = localStorage.getItem(key);
            if (data === null) return null;
            return parseJSON ? JSON.parse(data) : data;
        } catch (error) {
            Utils.error('Storage.get failed', error);
            return null;
        }
    },

    /**
     * Remove item from localStorage
     */
    remove(key) {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (error) {
            Utils.error('Storage.remove failed', error);
            return false;
        }
    },

    /**
     * Clear all localStorage
     */
    clear() {
        try {
            localStorage.clear();
            return true;
        } catch (error) {
            Utils.error('Storage.clear failed', error);
            return false;
        }
    },

    /**
     * Check if key exists
     */
    has(key) {
        return localStorage.getItem(key) !== null;
    },

    // Convenient getters/setters for common data
    setToken(token) {
        return this.set(CONFIG.STORAGE.TOKEN, token);
    },

    getToken() {
        return this.get(CONFIG.STORAGE.TOKEN, false);
    },

    removeToken() {
        return this.remove(CONFIG.STORAGE.TOKEN);
    },

    setUser(user) {
        return this.set(CONFIG.STORAGE.USER, user);
    },

    getUser() {
        return this.get(CONFIG.STORAGE.USER);
    },

    removeUser() {
        return this.remove(CONFIG.STORAGE.USER);
    },

    setCart(cart) {
        return this.set(CONFIG.STORAGE.CART, cart);
    },

    getCart() {
        return this.get(CONFIG.STORAGE.CART) || [];
    },

    removeCart() {
        return this.remove(CONFIG.STORAGE.CART);
    },
};

console.log('✓ Storage loaded');