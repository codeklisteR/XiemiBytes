/**
 * Products Module
 */

const ProductsModule = {

    async getProducts(filters = {}) {
        try {
            const params = new URLSearchParams();
            if (filters.category) params.append('category', filters.category);
            if (filters.search) params.append('search', filters.search);

            const endpoint = `/products/products.php?${params.toString()}`;
            const response = await API.get(endpoint);
            const raw = response.data || response;

            const products = raw.map(p => {
                const variants = (p.variants || []).map(v => ({
                    size: v.size,
                    markup: parseFloat(v.markup || 0),
                    price: parseFloat(v.price || 0),
                    image_url: v.image_url || p.var_img || 'images/placeholder.png',
                }));

                const regular = variants.find(v => v.size === 'Regular') || variants[0];
                const large = variants.find(v => v.size === 'Large') || variants[variants.length - 1];

                return {
                    id: p.product_id,
                    name: p.prod_name,
                    price: parseFloat(regular?.price || p.unit_price || 0),
                    price_regular: parseFloat(regular?.price || p.unit_price || 0),
                    price_large: parseFloat(large?.price || (parseFloat(p.unit_price || 0) + 15)),
                    description: p.prod_categ,
                    category: p.prod_categ,
                    image_url: p.var_img || regular?.image_url || 'images/placeholder.png',
                    variants,
                };
            });

            AppState.setState({ products });
            return products;
        } catch (error) {
            Toast.error(error.message);
            throw error;
        }
    },

    async getProduct(id) {
        try {
            const response = await API.get(`/products/product.php?id=${id}`);
            const p = response.data || response;

            return {
                id: p.product_id,
                name: p.prod_name,
                price: parseFloat(p.unit_price || 0),
                description: p.prod_categ,
                category: p.prod_categ,
                image_url: p.var_img || 'images/placeholder.png',
            };
        } catch (error) {
            Toast.error(error.message);
            throw error;
        }
    },

    async getCategories() {
        try {
            const response = await API.get('/products/categories.php');
            const raw = response.data || response;
            AppState.setState({ categories: raw });
            return raw;
        } catch (error) {
            Toast.error(error.message);
            throw error;
        }
    },
};

console.log('✓ Products Module loaded');
