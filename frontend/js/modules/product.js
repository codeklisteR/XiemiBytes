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
            /*
            // REAL BACKEND API CALL:
            const params = new URLSearchParams();
            if (filters.category) params.append('category_id', filters.category);
            if (filters.search) params.append('search', filters.search);
            if (filters.page) params.append('page', filters.page);

            const endpoint = `/products${params.toString() ? '?' + params.toString() : ''}`;
            const response = await API.get(endpoint);

            const products = response.data || response;
            AppState.setState({ products });
            return products;
            */

            // Simulate network delay
            await new Promise(resolve => setTimeout(resolve, 300));
            
            // Use External Mock Products Data
            const mockProducts = MOCK_PRODUCTS;

            let filtered = [...mockProducts];
            if (filters.category) {
                filtered = filtered.filter(p => p.category_id == filters.category);
            }
            if (filters.search) {
                filtered = filtered.filter(p => p.name.toLowerCase().includes(filters.search.toLowerCase()));
            }

            AppState.setState({ products: filtered });
            return filtered;
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
            // Simulate network delay
            await new Promise(resolve => setTimeout(resolve, 300));
            
            // Use External Mock Categories
            const mockCategories = MOCK_CATEGORIES;

            AppState.setState({ categories: mockCategories });
            return mockCategories;
        } catch (error) {
            Utils.error('Failed to load categories', error);
            return [];
        }
    },

    /**
     * Search products
     */
    async searchProducts(query) {
        /*
        // REAL BACKEND API CALL:
        try {
            const response = await API.get(`/products/search/${query}`);
            const products = response.data || response;
            AppState.setState({ products });
            return products;
        } catch (error) {
            Toast.error(error.message);
            throw error;
        }
        */
        return this.getProducts({ search: query });
    },
};

console.log('✓ Products Module loaded');