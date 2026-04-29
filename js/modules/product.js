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
            
            // Mock Products Data
            const mockProducts = [
                { id: 1, name: 'Classic Milk Tea', price: 90.00, description: 'Traditional black tea with creamy milk and chewy pearls.', category_id: 1, image_url: 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=300&h=300&fit=crop' },
                { id: 2, name: 'Okinawa Milk Tea', price: 100.00, description: 'Roasted brown sugar flavor for a rich, earthy sweetness.', category_id: 1, image_url: 'https://images.unsplash.com/photo-1541658016709-82735e85bcb3?w=300&h=300&fit=crop' },
                { id: 3, name: 'Taro Milk Tea', price: 95.00, description: 'Sweet and creamy taro with a hint of vanilla.', category_id: 1, image_url: 'https://images.unsplash.com/photo-1594266103132-7a8767799532?w=300&h=300&fit=crop' },
                { id: 4, name: 'Wintermelon Milk Tea', price: 95.00, description: 'Refreshing wintermelon flavor with a smooth milk base.', category_id: 1, image_url: 'https://images.unsplash.com/photo-1594266103099-3f628f244198?w=300&h=300&fit=crop' },
                { id: 5, name: 'Matcha Milk Tea', price: 110.00, description: 'Premium Japanese matcha whisked into creamy milk.', category_id: 2, image_url: 'https://images.unsplash.com/photo-1515823662972-da6a2e4d3002?w=300&h=300&fit=crop' },
                { id: 6, name: 'Hokkaido Milk Tea', price: 105.00, description: 'Buttery caramel notes with rich Hokkaido-style milk.', category_id: 1, image_url: 'https://images.unsplash.com/photo-1594266103091-6e3e56277977?w=300&h=300&fit=crop' }
            ];

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
            /*
            // REAL BACKEND API CALL:
            const response = await API.get('/categories');
            const categories = response.data || response;
            AppState.setState({ categories });
            return categories;
            */

            // Simulate network delay
            await new Promise(resolve => setTimeout(resolve, 300));
            
            // Mock Categories
            const mockCategories = [
                { id: 1, name: 'Classic Series' },
                { id: 2, name: 'Specialty Brews' },
                { id: 3, name: 'Fruit Teas' }
            ];

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