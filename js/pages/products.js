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
                                <div class="product-card" style="cursor:pointer;" data-product-str='${JSON.stringify(product).replace(/'/g, "&apos;")}'>
                                    <div class="product-image">
                                        <img src="${product.image_url || 'images/placeholder.png'}" 
                                             alt="${product.name}">
                                    </div>
                                    <div class="product-info">
                                        <h3>${product.name}</h3>
                                        <p class="price">${Utils.formatCurrency(product.price)}</p>
                                        <button class="btn btn-primary">Customize</button>
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

    // Product Card click
    document.querySelectorAll('.product-card').forEach((card) => {
        card.addEventListener('click', (e) => {
            const productData = card.dataset.productStr;
            if (productData) {
                const product = JSON.parse(productData);
                showProductModal(product);
            }
        });
    });
}

function showProductModal(product) {
    // Show modal for selecting customizations
    Modal.show({
        title: product.name,
        html: `
            <div class="product-modal">
                <img src="${product.image_url || 'images/placeholder.png'}" alt="${product.name}" style="width:100%; max-height:200px; object-fit:cover; border-radius:8px; margin-bottom:15px;">
                <p>${product.description || 'Deliciously handcrafted.'}</p>
                <p class="price mt-1">${Utils.formatCurrency(product.price)}</p>
                
                <div class="form-group mt-2">
                    <label>Size</label>
                    <select id="custom-size" class="form-control">
                        <option value="Regular">Regular</option>
                        <option value="Large">Large (+ $1.00)</option>
                    </select>
                </div>

                <div class="form-group">
                    <label>Sugar Level</label>
                    <select id="custom-sugar" class="form-control">
                        <option value="100%">Normal (100%)</option>
                        <option value="75%">Less Sugar (75%)</option>
                        <option value="50%">Half Sugar (50%)</option>
                        <option value="25%">Slight Sugar (25%)</option>
                        <option value="0%">No Sugar (0%)</option>
                    </select>
                </div>

                <div class="form-group">
                    <label>Ice Level</label>
                    <select id="custom-ice" class="form-control">
                        <option value="Normal">Normal Ice</option>
                        <option value="Less">Less Ice</option>
                        <option value="None">No Ice</option>
                        <option value="Extra">Extra Ice</option>
                    </select>
                </div>

                <div class="form-group">
                    <label>Quantity</label>
                    <input type="number" id="custom-quantity" class="form-control" value="1" min="1">
                </div>
            </div>
        `,
        buttons: [
            { text: 'Cancel', action: 'close', class: 'secondary' },
            { text: 'Add to Cart', action: 'addcart', class: 'primary' },
        ],
        onAddcart: () => {
            const size = Utils.$('#custom-size').value;
            const sugar = Utils.$('#custom-sugar').value;
            const ice = Utils.$('#custom-ice').value;
            const quantity = parseInt(Utils.$('#custom-quantity').value) || 1;

            CartModule.addProduct(product, {
                size,
                sugar,
                ice,
                quantity
            });

            HeaderComponent.updateCartBadge();
            Modal.hide();
            Toast.show('Added to cart!');
        },
    });
}