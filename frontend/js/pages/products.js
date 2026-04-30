/**
 * Products Page Handler
 */

const ADDON_PRICES = { 'None': 0, 'Pearls': 10, 'Nata de Coco': 10, 'Cheesecake': 15, 'Red Bean': 10, 'Oreo': 15 };
const SIZE_PRICE_MOD = { 'Regular': 0, 'Large': 15 };

async function ProductsPage() {
    const app = Utils.$('#app');

    try {
        await ProductsModule.getCategories();
        await ProductsModule.getProducts();

        const { categories, products } = AppState;
        renderProductsUI(categories, products);
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

function renderProductsUI(categories, products) {
    const app = Utils.$('#app');

    app.innerHTML = `
        <div class="products-page container">
            <div class="search-bar-container mb-5">
                <div class="search-wrapper">
                    <input type="text" id="search-input" class="form-control" placeholder="Search your favorite drink...">
                </div>
            </div>

            <div class="category-pills-container mb-4">
                <div class="category-pills">
                    <button class="category-pill active" data-id="">All Products</button>
                    ${categories.map(cat => `
                        <button class="category-pill" data-id="${cat.id}">${cat.name}</button>
                    `).join('')}
                </div>
            </div>

            <div class="products-container">
                <main class="products-grid">
                    <div class="grid" id="products-list">
                        ${renderProductCards(products)}
                    </div>
                </main>
            </div>
        </div>
    `;

    attachProductsListeners(categories);
}

function renderProductCards(products) {
    if (products.length === 0) {
        return `<div class="text-center py-5 w-100"><p class="text-muted">No products found.</p></div>`;
    }
    return products.map(product => `
        <div class="product-card" style="cursor:pointer;" data-product-str='${JSON.stringify(product).replace(/'/g, "&apos;")}'>
            <div class="product-image">
                <img src="${product.image_url || 'images/placeholder.png'}" alt="${product.name}">
            </div>
            <div class="product-info">
                <div class="d-flex justify-content-between align-items-center">
                    <div>
                        <h3>${product.name}</h3>
                        <p class="price">${Utils.formatCurrency(product.price)}</p>
                    </div>
                    <button class="btn btn-primary btn-plus">+</button>
                </div>
            </div>
        </div>
    `).join('');
}

function attachProductsListeners(categories) {
    let currentCategory = '';
    let currentSearch = '';

    async function applyFilters() {
        const filters = {};
        if (currentCategory) filters.category = currentCategory;
        if (currentSearch) filters.search = currentSearch;
        await ProductsModule.getProducts(filters);
        const { products } = AppState;
        const list = Utils.$('#products-list');
        if (list) list.innerHTML = renderProductCards(products);
        attachCardListeners();
    }

    // Category filter
    document.querySelectorAll('.category-pill').forEach(pill => {
        pill.addEventListener('click', async (e) => {
            document.querySelectorAll('.category-pill').forEach(p => p.classList.remove('active'));
            pill.classList.add('active');
            currentCategory = pill.dataset.id;
            await applyFilters();
        });
    });

    // Search
    const searchInput = Utils.$('#search-input');
    if (searchInput) {
        searchInput.addEventListener('input', Utils.debounce(async (e) => {
            currentSearch = e.target.value.trim();
            await applyFilters();
        }, CONFIG.UI.DEBOUNCE_DELAY));
    }

    attachCardListeners();
}

function attachCardListeners() {
    document.querySelectorAll('.product-card').forEach(card => {
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
    const addonOptions = Object.entries(ADDON_PRICES).map(([name, price]) => `
        <label class="addon-option d-flex align-items-center gap-2 mb-2" style="cursor:pointer; padding: 8px 12px; border: 1px solid #e2e8f0; border-radius: 8px;">
            <input type="checkbox" value="${name}" data-price="${price}" class="addon-checkbox" ${name === 'None' ? 'disabled' : ''}>
            <span style="flex:1;">${name}</span>
            <span class="text-muted small">${price > 0 ? '+₱' + price : 'Free'}</span>
        </label>
    `).join('');

    Modal.show({
        title: product.name,
        html: `
            <div class="product-modal">
                <img src="${product.image_url || 'images/placeholder.png'}" alt="${product.name}" style="width:100%; max-height:200px; object-fit:contain; background:#f9f9f9; border-radius:8px; margin-bottom:15px; padding:10px;">
                <p class="text-muted small">${product.description || 'Deliciously handcrafted.'}</p>

                <div class="d-flex justify-content-between align-items-center mb-3 p-3" style="background:#f8fafc; border-radius:10px;">
                    <span class="font-weight-bold">Base Price</span>
                    <span class="h5 mb-0 font-weight-bold" style="color: var(--color-primary);" id="modal-price-display">${Utils.formatCurrency(product.price)}</span>
                </div>

                <div class="form-group">
                    <label class="font-weight-bold small">Size</label>
                    <select id="custom-size" class="form-control" style="border-radius:8px;">
                        <option value="Regular" data-mod="0">Regular</option>
                        <option value="Large" data-mod="15">Large (+₱15.00)</option>
                    </select>
                </div>

                <div class="form-group">
                    <label class="font-weight-bold small">Sugar Level</label>
                    <select id="custom-sugar" class="form-control" style="border-radius:8px;">
                        <option value="100%">Normal (100%)</option>
                        <option value="75%">Less Sugar (75%)</option>
                        <option value="50%">Half Sugar (50%)</option>
                        <option value="25%">Slight Sugar (25%)</option>
                        <option value="0%">No Sugar (0%)</option>
                    </select>
                </div>

                <div class="form-group">
                    <label class="font-weight-bold small">Ice Level</label>
                    <select id="custom-ice" class="form-control" style="border-radius:8px;">
                        <option value="Normal">Normal Ice</option>
                        <option value="Less">Less Ice</option>
                        <option value="None">No Ice</option>
                        <option value="Extra">Extra Ice</option>
                    </select>
                </div>

                <div class="form-group">
                    <label class="font-weight-bold small">Quantity</label>
                    <input type="number" id="custom-quantity" class="form-control" value="1" min="1" style="border-radius:8px;">
                </div>

                <div class="form-group">
                    <label class="font-weight-bold small d-flex justify-content-between">
                        <span>Add-ons <span class="text-muted font-weight-normal">(Optional, max 3)</span></span>
                        <span id="addon-count-label" class="small text-muted">0 / 3 selected</span>
                    </label>
                    <div id="addon-options">
                        ${addonOptions}
                    </div>
                </div>

                <div class="mt-3 p-3 rounded" style="background:#f0fdf4; border: 1px solid #bbf7d0; border-radius: 10px;">
                    <div class="d-flex justify-content-between align-items-center">
                        <span class="font-weight-bold">Total to Add</span>
                        <span class="h4 mb-0 font-weight-bold" style="color: var(--color-primary);" id="modal-total-display">${Utils.formatCurrency(product.price)}</span>
                    </div>
                </div>
            </div>
        `,
        buttons: [
            { text: 'Cancel', action: 'close', class: 'secondary' },
            {
                text: AppState.isLoggedIn() ? 'Add to Cart' : 'Sign in to Order',
                action: 'addcart',
                class: 'primary'
            },
        ],
        onOpen: () => {
            // Price update logic
            function updatePrice() {
                const sizeEl = Utils.$('#custom-size');
                const sizeMod = parseInt(sizeEl.options[sizeEl.selectedIndex].dataset.mod) || 0;
                const checkedAddons = [...document.querySelectorAll('.addon-checkbox:checked')];
                const addonsTotal = checkedAddons.reduce((s, cb) => s + parseInt(cb.dataset.price || 0), 0);
                const total = (product.price + sizeMod + addonsTotal);
                const qty = parseInt(Utils.$('#custom-quantity')?.value) || 1;
                if (Utils.$('#modal-price-display')) {
                    Utils.$('#modal-price-display').textContent = Utils.formatCurrency(product.price + sizeMod);
                }
                if (Utils.$('#modal-total-display')) {
                    Utils.$('#modal-total-display').textContent = Utils.formatCurrency(total * qty);
                }
            }

            Utils.$('#custom-size')?.addEventListener('change', updatePrice);
            Utils.$('#custom-quantity')?.addEventListener('input', updatePrice);

            // Addon checkbox logic: max 3
            document.querySelectorAll('.addon-checkbox').forEach(cb => {
                cb.addEventListener('change', () => {
                    const checked = [...document.querySelectorAll('.addon-checkbox:checked')];
                    const countLabel = Utils.$('#addon-count-label');
                    if (checked.length > 3) {
                        cb.checked = false;
                        Toast.error('Maximum 3 add-ons allowed.');
                        return;
                    }
                    if (countLabel) countLabel.textContent = `${checked.length} / 3 selected`;
                    updatePrice();
                });
            });
        },
        onAddcart: () => {
            if (!AppState.isLoggedIn()) {
                Modal.hide();
                Toast.show('Please sign in to start ordering');
                ROUTER.navigate('/login');
                return;
            }
            const size = Utils.$('#custom-size').value;
            const sugar = Utils.$('#custom-sugar').value;
            const ice = Utils.$('#custom-ice').value;
            const quantity = parseInt(Utils.$('#custom-quantity').value) || 1;
            const selectedAddons = [...document.querySelectorAll('.addon-checkbox:checked')].map(cb => cb.value);

            CartModule.addProduct(product, { size, sugar, ice, addons: selectedAddons, quantity });
            HeaderComponent.updateCartBadge();
            Modal.hide(); // Close modal on add to cart
        },
    });
}