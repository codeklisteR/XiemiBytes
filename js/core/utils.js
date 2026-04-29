/**
 * Utility Functions
 * Common helper functions used throughout the app
 */

const Utils = {
    // ============ DOM HELPERS ============

    /**
     * Select single element
     */
    $(selector) {
        return document.querySelector(selector);
    },

    /**
     * Select multiple elements
     */
    $$(selector) {
        return document.querySelectorAll(selector);
    },

    /**
     * Create element with options
     */
    createElement(tag, options = {}) {
        const el = document.createElement(tag);
        if (options.class) el.className = options.class;
        if (options.id) el.id = options.id;
        if (options.html) el.innerHTML = options.html;
        if (options.text) el.textContent = options.text;
        if (options.attrs) {
            Object.entries(options.attrs).forEach(([key, value]) => {
                el.setAttribute(key, value);
            });
        }
        return el;
    },

    /**
     * Add event listener
     */
    on(element, event, handler) {
        if (element) {
            element.addEventListener(event, handler);
        }
    },

    /**
     * Remove event listener
     */
    off(element, event, handler) {
        if (element) {
            element.removeEventListener(event, handler);
        }
    },

    /**
     * Add CSS class
     */
    addClass(element, className) {
        if (element) {
            element.classList.add(className);
        }
    },

    /**
     * Remove CSS class
     */
    removeClass(element, className) {
        if (element) {
            element.classList.remove(className);
        }
    },

    /**
     * Toggle CSS class
     */
    toggleClass(element, className) {
        if (element) {
            element.classList.toggle(className);
        }
    },

    /**
     * Check if element has class
     */
    hasClass(element, className) {
        return element && element.classList.contains(className);
    },

    /**
     * Set element HTML
     */
    setHTML(element, html) {
        if (element) {
            element.innerHTML = html;
        }
    },

    /**
     * Get element value
     */
    getValue(selector) {
        const el = typeof selector === 'string' ? Utils.$(selector) : selector;
        return el ? el.value : '';
    },

    /**
     * Set element value
     */
    setValue(selector, value) {
        const el = typeof selector === 'string' ? Utils.$(selector) : selector;
        if (el) {
            el.value = value;
        }
    },

    /**
     * Clear form
     */
    clearForm(formSelector) {
        const form = typeof formSelector === 'string' ? Utils.$(formSelector) : formSelector;
        if (form) {
            form.reset();
        }
    },

    /**
     * Get form data as object
     */
    getFormData(formSelector) {
        const form = typeof formSelector === 'string' ? Utils.$(formSelector) : formSelector;
        if (!form) return {};

        const formData = new FormData(form);
        const data = {};
        formData.forEach((value, key) => {
            data[key] = value;
        });
        return data;
    },

    /**
     * Focus element
     */
    focus(selector) {
        const el = typeof selector === 'string' ? Utils.$(selector) : selector;
        if (el) el.focus();
    },

    // ============ STRING HELPERS ============

    /**
     * Format currency (Philippine Peso)
     */
    formatCurrency(amount) {
        return new Intl.NumberFormat('en-PH', {
            style: 'currency',
            currency: 'PHP',
            minimumFractionDigits: 2,
        }).format(amount);
    },

    /**
     * Format date (e.g., "Jan 15, 2024")
     */
    formatDate(date) {
        return new Date(date).toLocaleDateString('en-PH', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    },

    /**
     * Format time (e.g., "2:30 PM")
     */
    formatTime(date) {
        return new Date(date).toLocaleTimeString('en-PH', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true,
        });
    },

    /**
     * Format date and time
     */
    formatDateTime(date) {
        return new Date(date).toLocaleString('en-PH', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    },

    /**
     * Capitalize first letter
     */
    capitalize(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    },

    /**
     * Truncate text
     */
    truncate(str, length) {
        return str.length > length ? str.substring(0, length) + '...' : str;
    },

    // ============ VALIDATION ============

    /**
     * Validate email
     */
    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    },

    /**
     * Validate phone (Philippine format)
     */
    isValidPhone(phone) {
        const phoneRegex = /^(09|\\+639)\d{9}$/;
        return phoneRegex.test(phone.replace(/[-\s]/g, ''));
    },

    /**
     * Validate password
     */
    isValidPassword(password) {
        return password && password.length >= 6;
    },

    /**
     * Check if value is empty
     */
    isEmpty(value) {
        return (
            value === null ||
            value === undefined ||
            value === '' ||
            (Array.isArray(value) && value.length === 0) ||
            (typeof value === 'object' && Object.keys(value).length === 0)
        );
    },

    // ============ ARRAY HELPERS ============

    /**
     * Find item in array
     */
    findInArray(array, predicate) {
        return array.find(predicate);
    },

    /**
     * Filter array
     */
    filterArray(array, predicate) {
        return array.filter(predicate);
    },

    /**
     * Map array
     */
    mapArray(array, callback) {
        return array.map(callback);
    },

    /**
     * Group array by key
     */
    groupBy(array, key) {
        return array.reduce((result, item) => {
            const group = item[key];
            if (!result[group]) result[group] = [];
            result[group].push(item);
            return result;
        }, {});
    },

    /**
     * Sum array values
     */
    sum(array, key) {
        return array.reduce((total, item) => total + (key ? item[key] : item), 0);
    },

    // ============ ASYNC HELPERS ============

    /**
     * Debounce function
     */
    debounce(func, delay) {
        let timeoutId;
        return function debounced(...args) {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => func.apply(this, args), delay);
        };
    },

    /**
     * Throttle function
     */
    throttle(func, limit) {
        let inThrottle;
        return function throttled(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => (inThrottle = false), limit);
            }
        };
    },

    /**
     * Sleep/delay
     */
    async delay(ms) {
        return new Promise((resolve) => setTimeout(resolve, ms));
    },

    /**
     * Retry async function
     */
    async retry(fn, attempts = 3, delay = 1000) {
        for (let i = 0; i < attempts; i++) {
            try {
                return await fn();
            } catch (error) {
                if (i === attempts - 1) throw error;
                await this.delay(delay);
            }
        }
    },

    // ============ OBJECT HELPERS ============

    /**
     * Deep clone object
     */
    deepClone(obj) {
        return JSON.parse(JSON.stringify(obj));
    },

    /**
     * Merge objects
     */
    merge(...objects) {
        return Object.assign({}, ...objects);
    },

    /**
     * Deep merge objects
     */
    deepMerge(target, source) {
        const output = Object.assign({}, target);
        if (this.isObject(target) && this.isObject(source)) {
            Object.keys(source).forEach((key) => {
                if (this.isObject(source[key])) {
                    if (!(key in target)) Object.assign(output, { [key]: source[key] });
                    else output[key] = this.deepMerge(target[key], source[key]);
                } else {
                    Object.assign(output, { [key]: source[key] });
                }
            });
        }
        return output;
    },

    /**
     * Check if value is object
     */
    isObject(item) {
        return item && typeof item === 'object' && !Array.isArray(item);
    },

    // ============ URL HELPERS ============

    /**
     * Get query parameter
     */
    getQueryParam(name) {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get(name);
    },

    /**
     * Get all query parameters
     */
    getQueryParams() {
        const urlParams = new URLSearchParams(window.location.search);
        const params = {};
        urlParams.forEach((value, key) => {
            params[key] = value;
        });
        return params;
    },

    /**
     * Build query string
     */
    buildQueryString(params) {
        return Object.entries(params)
            .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
            .join('&');
    },

    /**
     * Get path parameter
     */
    getPathParam(pattern, path) {
        const regexPattern = pattern.replace(/:\w+/g, '([^/]+)');
        const regex = new RegExp(`^${regexPattern}$`);
        const match = path.match(regex);

        if (!match) return null;

        const paramNames = (pattern.match(/:\w+/g) || []).map((p) => p.slice(1));
        const params = {};

        paramNames.forEach((name, index) => {
            params[name] = match[index + 1];
        });

        return params;
    },

    // ============ LOGGING ============

    /**
     * Log message (development only)
     */
    log(message, data = null) {
        if (CONFIG.API.DEBUG) {
            console.log(`[${new Date().toLocaleTimeString()}] ${message}`, data || '');
        }
    },

    /**
     * Log error
     */
    error(message, error = null) {
        console.error(`[ERROR] ${message}`, error || '');
    },

    /**
     * Log warning
     */
    warn(message, data = null) {
        console.warn(`[WARNING] ${message}`, data || '');
    },
};

console.log('✓ Utils loaded');