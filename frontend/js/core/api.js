/**
 * API Client
 * Handles all HTTP requests to the backend
 */

class APIClient {
    constructor(baseURL) {
        this.baseURL = baseURL;
        this.timeout = CONFIG.API.TIMEOUT;
        this.defaultHeaders = {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        };
    }

    /**
     * Get authorization header
     */
    getAuthHeader() {
        const token = Storage.getToken();
        if (!token) return {};

        return {
            Authorization: `Bearer ${token}`,
        };
    }

    /**
     * Make HTTP request
     */
    async request(method, endpoint, data = null, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        const headers = {
            ...this.defaultHeaders,
            ...this.getAuthHeader(),
            ...options.headers,
        };

        const config = {
            method,
            headers,
            signal: AbortSignal.timeout(this.timeout),
        };

        if (data && ['POST', 'PUT', 'PATCH'].includes(method)) {
            config.body = JSON.stringify(data);
        }

        Utils.log(`${method} ${endpoint}`);

        try {
            const response = await fetch(url, config);
            const responseData = await this.parseResponse(response);

            if (!response.ok) {
                this.handleError(response.status, responseData);
            }

            return responseData;
        } catch (error) {
            this.handleException(error);
            throw error;
        }
    }

    /**
     * Parse response
     */
    async parseResponse(response) {
        const contentType = response.headers.get('content-type');

        if (contentType && contentType.includes('application/json')) {
            return await response.json();
        }

        return await response.text();
    }

    /**
     * Handle API errors
     */
    handleError(status, data) {
        Utils.log(`API Error ${status}:`, data);

        switch (status) {
            case 401:
                // Unauthorized - logout
                AppState.logout();
                ROUTER.navigate(CONFIG.ROUTES.LOGIN);
                throw new Error(CONSTANTS.MESSAGES.UNAUTHORIZED);

            case 403:
                throw new Error(CONSTANTS.MESSAGES.UNAUTHORIZED);

            case 404:
                throw new Error(CONSTANTS.MESSAGES.NOT_FOUND);

            case 422:
                // Validation error
                throw {
                    status,
                    message: data.message || CONSTANTS.MESSAGES.SOMETHING_WRONG,
                    errors: data.errors || {},
                };

            case 500:
                throw new Error('Server error. Please try again later.');

            default:
                throw new Error(data.message || CONSTANTS.MESSAGES.SOMETHING_WRONG);
        }
    }

    /**
     * Handle network errors
     */
    handleException(error) {
        if (error.name === 'AbortError') {
            throw new Error('Request timeout. Please check your connection.');
        }

        if (!navigator.onLine) {
            throw new Error(CONSTANTS.MESSAGES.NETWORK_ERROR);
        }

        Utils.error('API Exception:', error);
        throw new Error(CONSTANTS.MESSAGES.NETWORK_ERROR);
    }

    // ============ HTTP METHODS ============

    get(endpoint, options = {}) {
        return this.request('GET', endpoint, null, options);
    }

    post(endpoint, data = {}, options = {}) {
        return this.request('POST', endpoint, data, options);
    }

    put(endpoint, data = {}, options = {}) {
        return this.request('PUT', endpoint, data, options);
    }

    patch(endpoint, data = {}, options = {}) {
        return this.request('PATCH', endpoint, data, options);
    }

    delete(endpoint, options = {}) {
        return this.request('DELETE', endpoint, null, options);
    }
}

// Create global API instance
const API = new APIClient(CONFIG.API.BASE_URL);

console.log('✓ API Client loaded');