/**
 * API Client
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

        if (data !== null && data !== undefined && ['POST', 'PUT', 'PATCH'].includes(method)) {
                config.body = JSON.stringify(data);
            }

        Utils.log(`${method} ${endpoint}`);

        try {
            const response = await fetch(url, config);
            const responseData = await this.parseResponse(response);

            if (!response.ok) {
                this.handleError(response.status, responseData, options);
            }

            return responseData;
        } catch (error) {
            if (error.name === 'TypeError' || error.name === 'AbortError') {
                this.handleException(error);
            }
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
    extractErrorMessage(data, fallback) {
        if (!data) return fallback;
        if (typeof data === 'string') return data;
        return data.message || data.error || data.details || fallback;
    }

    handleError(status, data, options = {}) {
        Utils.log(`API Error ${status}:`, data);
        const serverMessage = this.extractErrorMessage(data, null);

        switch (status) {
            case 401:
                if (options.skipAuthRedirect) {
                    throw new Error(serverMessage || CONSTANTS.MESSAGES.LOGIN_FAILED);
                }
                AppState.logout();
                ROUTER.navigate(CONFIG.ROUTES.LOGIN);
                throw new Error(serverMessage || CONSTANTS.MESSAGES.UNAUTHORIZED);

            case 403:
                throw new Error(serverMessage || CONSTANTS.MESSAGES.UNAUTHORIZED);

            case 404:
                throw new Error(serverMessage || CONSTANTS.MESSAGES.NOT_FOUND);

            case 422:
                throw new Error(serverMessage || CONSTANTS.MESSAGES.SOMETHING_WRONG);

            case 400:
                throw new Error(serverMessage || 'Invalid request. Please check your input.');

            case 500:
                throw new Error(serverMessage || 'Server error. Please try again later.');

            default:
                throw new Error(serverMessage || CONSTANTS.MESSAGES.SOMETHING_WRONG);
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

    delete(endpoint, data = null, options = {}) {
        return this.request('DELETE', endpoint, data, options);
    }

    async upload(endpoint, formData, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        const headers = {
            ...this.getAuthHeader(),
            ...options.headers,
        };

        try {
            const response = await fetch(url, {
                method: 'POST',
                headers,
                body: formData,
                signal: AbortSignal.timeout(this.timeout),
            });
            const responseData = await this.parseResponse(response);
            if (!response.ok) {
                this.handleError(response.status, responseData, options);
            }
            return responseData;
        } catch (error) {
            if (error.name === 'TypeError' || error.name === 'AbortError') {
                this.handleException(error);
            }
            throw error;
        }
    }
}

// Create global API instance
const API = new APIClient(CONFIG.API.BASE_URL);

console.log('✓ API Client loaded');