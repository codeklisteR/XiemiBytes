/**
 * Products Module
 * Handles product operations
 */

const ProductsModule = {
    /**
     * Get all products
     */
    async getProducts(filters = {}) {
        try {
            const params = new URLSearchParams();
            if (filters.category) params.append('category_id', filters.category);
            if (filters.search) params.append('search', filters.search);
            if (filters.page) params.append('page', filters.page);

            const endpoint = `/products${params.toString() ? '?' + params.toString() : ''}`;
            const response = await API.get(endpoint);

            const products = response.data || response;
            AppState.setState({ products });

            return products;
        } catch (error) {
            Toast.error(error.message);
            throw error;
        }
    },

    /**
     * Get single product
     */
    async getProduct(id) {
        try {
            const response = await API.get(`/products/${id}`);
            return response.data || response;
        } catch (error) {
            Toast.error(error.message);
            throw error;
        }
    },

    /**
     * Get categories
     */
    async getCategories() {
        try {
            const response = await API.get('/categories');
            const categories = response.data || response;
            AppState.setState({ categories });
            return categories;
        } catch (error) {
            Utils.error('Failed to load categories', error);
            return [];
        }
    },

    /**
     * Search products
     */
    async searchProducts(query) {
        try {
            const response = await API.get(`/products/search/${query}`);
            const products = response.data || response;
            AppState.setState({ products });
            return products;
        } catch (error) {
            Toast.error(error.message);
            throw error;
        }
    },
};

console.log('✓ Products Module loaded');