/**
 * Products Page Handler
 */

async function ProductsPage() {
    const app = Utils.$('#app');

    try {
        // Load data
        await ProductsModule.getCategories();
        await ProductsModule.getProducts();

        const { categories, products } = AppState;

        // Render page
        app.innerHTML = `
            <div class="products-page">
                <div class="page-header">
                    <h1>Our Products</h1>
                    <p>Browse our selection of premium coffee and tea</p>
                </div>

                <div class="products-container">
                    <!-- Sidebar -->
                    <aside class="sidebar">
                        <div class="filter-group">
                            <h3>Categories</h3>
                            <div class="category-list">
                                <label class="category-item">
                                    <input type="radio" name="category" value="" checked>
                                    All Products
                                </label>
                                ${categories
                                    .map(
                                        (cat) => `
                                    <label class="category-item">
                                        <input type="radio" name="category" value="${cat.id}">
                                        ${cat.name}
                                    </label>
                                `
                                    )
                                    .join('')}
                            </div>
                        </div>

                        <div class="filter-group">
                            <h3>Search</h3>
                            <input type="text" id="search-input" class="form-control" placeholder="Search...">
                        </div>
                    </aside>

                    <!-- Products Grid -->
                    <main class="products-grid">
                        <div class="grid" id="products-list">
                            ${products
                                .map(
                                    (product) => `
                                <div class="product-card" data-product-id="${product.id}">
                                    <div class="product-image">
                                        <img src="${product.image_url || 'images/placeholder.png'}" 
                                             alt="${product.name}">
                                    </div>
                                    <div class="product-info">
                                        <h3>${product.name}</h3>
                                        <p class="price">${Utils.formatCurrency(product.price)}</p>
                                        <button class="btn btn-primary btn-add-to-cart"
                                                data-product='${JSON.stringify(product)}'>
                                            Add to Cart
                                        </button>
                                    </div>
                                </div>
                            `
                                )
                                .join('')}
                        </div>
                    </main>
                </div>
            </div>
        `;

        // Attach listeners
        attachProductsListeners();
    } catch (error) {
        app.innerHTML = `
            <div class="error-message">
                <h2>Failed to load products</h2>
                <p>${error.message}</p>
                <button class="btn btn-primary" onclick="ROUTER.navigate()">Try Again</button>
            </div>
        `;
    }
}

function attachProductsListeners() {
    // Category filter
    document.querySelectorAll('input[name="category"]').forEach((radio) => {
        radio.addEventListener('change', async (e) => {
            const categoryId = e.target.value;
            if (categoryId) {
                // Filter by category (implement backend logic)
                await ProductsModule.getProducts({ category: categoryId });
            } else {
                await ProductsModule.getProducts();
            }
            ProductsPage(); // Re-render
        });
    });

    // Search
    const searchInput = Utils.$('#search-input');
    if (searchInput) {
        searchInput.addEventListener(
            'input',
            Utils.debounce(async (e) => {
                if (e.target.value.trim()) {
                    await ProductsModule.searchProducts(e.target.value);
                } else {
                    await ProductsModule.getProducts();
                }
                ProductsPage(); // Re-render
            }, CONFIG.UI.DEBOUNCE_DELAY)
        );
    }

    // Add to cart buttons
    document.querySelectorAll('.btn-add-to-cart').forEach((btn) => {
        btn.addEventListener('click', (e) => {
            const productData = e.target.dataset.product;
            const product = JSON.parse(productData);

            // Show variant/addon selection modal if needed
            if (product.variants && product.variants.length > 0) {
                showProductModal(product);
            } else {
                CartModule.addProduct(product);
                HeaderComponent.updateCartBadge();
            }
        });
    });
}

function showProductModal(product) {
    // Show modal for selecting variants, addons, etc.
    Modal.show({
        title: product.name,
        html: `
            <div class="product-modal">
                <p>${product.description}</p>
                <p class="price">${Utils.formatCurrency(product.price)}</p>
                
                ${
                    product.variants && product.variants.length > 0
                        ? `
                    <div class="form-group">
                        <label>Size</label>
                        <select id="variant-select" class="form-control">
                            <option value="">Select size</option>
                            ${product.variants.map((v) => `<option value="${JSON.stringify(v)}">${v.name}</option>`).join('')}
                        </select>
                    </div>
                `
                        : ''
                }

                <div class="form-group">
                    <label>Quantity</label>
                    <input type="number" id="quantity-input" class="form-control" value="1" min="1">
                </div>

                <div class="form-group">
                    <label>Special Instructions (Optional)</label>
                    <textarea id="instructions-input" class="form-control" rows="3"></textarea>
                </div>
            </div>
        `,
        buttons: [
            { text: 'Cancel', action: 'close', class: 'secondary' },
            { text: 'Add to Cart', action: 'addcart', class: 'primary' },
        ],
        onAddcart: () => {
            const variant = Utils.$('#variant-select').value ? JSON.parse(Utils.$('#variant-select').value) : null;
            const quantity = parseInt(Utils.$('#quantity-input').value) || 1;
            const instructions = Utils.$('#instructions-input').value;

            CartModule.addProduct(product, {
                variant,
                quantity,
                instructions,
            });

            HeaderComponent.updateCartBadge();
            Modal.hide();
        },
    });
}