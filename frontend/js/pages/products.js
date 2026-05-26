/**
 * Menu Page (Products)
 */

const ADDON_PRICES = { 'None': 0, 'Pearls': 10, 'Nata de Coco': 10, 'Cheesecake': 15, 'Red Bean': 10, 'Oreo': 15 };

async function ProductsPage() {
    const app = Utils.$('#app');

    try {
        await ProductsModule.getCategories();
        await ProductsModule.getProducts();
        const { categories, products } = AppState;
        renderMenuUI(categories, products);
    } catch (error) {
        app.innerHTML = `
            <div class="container mt-4 text-center">
                <h2>Failed to load menu</h2>
                <p class="text-muted">${error.message}</p>
                <button class="btn btn-primary mt-2" onclick="ROUTER.navigate('/products')">Try Again</button>
            </div>
        `;
    }
}

function renderMenuUI(categories, products) {
    const app = Utils.$('#app');

    app.innerHTML = `
        <div class="products-page container" style="padding-bottom:48px;">
            <header class="mb-4" style="padding-top:24px;">
                <h1 class="page-section-title">Menu</h1>
                <p class="page-section-sub mb-0">Filter by category or search for your favorite drink</p>
            </header>

            <div class="search-bar-container mb-4">
                <input type="text" id="search-input" class="form-control" placeholder="Search drinks..." style="max-width:400px;">
            </div>

            <div class="category-pills-container mb-4">
                <div class="category-pills">
                    <button class="category-pill active" data-id="">All</button>
                    ${categories.map(cat => `
                        <button class="category-pill" data-id="${cat.id}">${cat.name}</button>
                    `).join('')}
                </div>
            </div>

            <div id="products-list" class="products-grid" style="display:grid; grid-template-columns:repeat(auto-fill,minmax(180px,1fr)); gap:16px;">
                ${renderMenuCards(products)}
            </div>
        </div>
    `;

    attachMenuListeners(categories);
}

function formatPriceRange(product) {
    const reg = product.price_regular ?? product.price;
    const lg = product.price_large ?? reg + 15;
    if (reg === lg) return Utils.formatCurrency(reg);
    return `${Utils.formatCurrency(reg)} – ${Utils.formatCurrency(lg)}`;
}

function renderMenuCards(products) {
    if (!products.length) {
        return `<p class="text-muted">No drinks found.</p>`;
    }
    return products.map(product => `
        <div class="menu-card product-card" data-product-str='${JSON.stringify(product).replace(/'/g, '&apos;')}'>
            <div class="menu-card-image">
                <img src="${product.image_url || 'images/placeholder.png'}" alt="${product.name}">
            </div>
            <div class="menu-card-body">
                <p class="text-muted small mb-1" style="font-size:0.75rem;">${product.category || ''}</p>
                <h3>${product.name}</h3>
                <span class="menu-card-price" data-price-display="${product.id}">${formatPriceRange(product)}</span>
            </div>
        </div>
    `).join('');
}

function attachMenuListeners(categories) {
    let currentCategory = '';
    let currentSearch = '';

    async function applyFilters() {
        const filters = {};
        if (currentCategory) filters.category = currentCategory;
        if (currentSearch) filters.search = currentSearch;
        await ProductsModule.getProducts(filters);
        const list = Utils.$('#products-list');
        if (list) list.innerHTML = renderMenuCards(AppState.products);
        attachCardListeners();
    }

    document.querySelectorAll('.category-pill').forEach(pill => {
        pill.addEventListener('click', async () => {
            document.querySelectorAll('.category-pill').forEach(p => p.classList.remove('active'));
            pill.classList.add('active');
            currentCategory = pill.dataset.id;
            await applyFilters();
        });
    });

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
        card.addEventListener('click', () => {
            const product = JSON.parse(card.dataset.productStr);
            showProductModal(product);
        });
    });
}

function showProductModal(product) {
    const variants = product.variants?.length
        ? product.variants
        : [
            { size: 'Regular', price: product.price_regular || product.price, markup: 0 },
            { size: 'Large', price: product.price_large || product.price + 15, markup: 15 },
        ];

    let selectedSize = variants[0].size;
    let selectedPrice = variants[0].price;

    const sizeButtonsHtml = variants.map((v, i) => `
        <button type="button" class="size-option-btn ${i === 0 ? 'active' : ''}" data-size="${v.size}" data-price="${v.price}">
            <span class="size-label">${v.size}</span>
            <span class="size-price">${Utils.formatCurrency(v.price)}</span>
        </button>
    `).join('');

    const addonOptions = Object.entries(ADDON_PRICES).map(([name, price]) => `
        <label class="d-flex align-items-center gap-2 mb-2" style="cursor:pointer; padding:8px 12px; border:1px solid var(--color-border); border-radius:8px;">
            <input type="checkbox" value="${name}" data-price="${price}" class="addon-checkbox" ${name === 'None' ? 'disabled' : ''}>
            <span style="flex:1;">${name}</span>
            <span class="text-muted small">${price > 0 ? '+' + Utils.formatCurrency(price) : 'Free'}</span>
        </label>
    `).join('');

    // Staff/admin users cannot add to cart from the menu
    const isStaff = AppState.isStaff();

    const modalButtons = isStaff
        ? [{ text: 'Close', action: 'close', class: 'secondary' }]
        : [
            { text: 'Cancel', action: 'close', class: 'secondary' },
            { text: AppState.isLoggedIn() ? 'Add to Cart' : 'Sign in to Order', action: 'addcart', class: 'primary' },
        ];

    Modal.show({
        title: product.name,
        html: `
            <div class="product-modal">
                <img src="${product.image_url || 'images/placeholder.png'}" alt="${product.name}" style="width:100%; max-height:200px; object-fit:contain; background:#fafafa; border-radius:8px; margin-bottom:16px; padding:12px; border:1px solid var(--color-border);">
                <p class="text-muted small">${product.category || 'Beverage'}</p>

                <div class="form-group mt-3">
                    <label class="font-weight-bold small">Size</label>
                    <div class="size-options mt-2" id="size-options">${sizeButtonsHtml}</div>
                </div>

                <div class="form-group mt-3">
                    <label class="font-weight-bold small">Sugar Level</label>
                    <select id="custom-sugar" class="form-control">
                        <option value="100%">100%</option>
                        <option value="75%">75%</option>
                        <option value="50%">50%</option>
                        <option value="25%">25%</option>
                        <option value="0%">0%</option>
                    </select>
                </div>

                <div class="form-group mt-3">
                    <label class="font-weight-bold small">Ice Level</label>
                    <select id="custom-ice" class="form-control">
                        <option value="Normal">Normal</option>
                        <option value="Less">Less</option>
                        <option value="None">No Ice</option>
                        <option value="Extra">Extra</option>
                    </select>
                </div>

                <div class="form-group mt-3">
                    <label class="font-weight-bold small">Quantity</label>
                    <input type="number" id="custom-quantity" class="form-control" value="1" min="1">
                </div>

                <div class="form-group mt-3">
                    <label class="font-weight-bold small">Add-ons <span class="text-muted">(max 3)</span></label>
                    <div id="addon-options">${addonOptions}</div>
                </div>

                <div class="mt-3 pt-3" style="border-top:1px solid var(--color-border);">
                    <div class="d-flex justify-content-between align-items-center">
                        <span class="font-weight-bold">Total</span>
                        <span class="font-weight-bold" style="color:var(--color-primary); font-size:1.2rem;" id="modal-total-display">${Utils.formatCurrency(selectedPrice)}</span>
                    </div>
                </div>
            </div>
        `,
        buttons: modalButtons,
        onOpen: () => {
            function updateTotal() {
                const addonsTotal = [...document.querySelectorAll('.addon-checkbox:checked')]
                    .reduce((s, cb) => s + parseInt(cb.dataset.price || 0), 0);
                const qty = parseInt(Utils.$('#custom-quantity')?.value) || 1;
                const total = (selectedPrice + addonsTotal) * qty;
                const el = Utils.$('#modal-total-display');
                if (el) el.textContent = Utils.formatCurrency(total);
            }

            document.querySelectorAll('.size-option-btn').forEach(btn => {
                btn.addEventListener('click', () => {
                    document.querySelectorAll('.size-option-btn').forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');
                    selectedSize = btn.dataset.size;
                    selectedPrice = parseFloat(btn.dataset.price);
                    updateTotal();
                });
            });

            Utils.$('#custom-quantity')?.addEventListener('input', updateTotal);
            document.querySelectorAll('.addon-checkbox').forEach(cb => {
                cb.addEventListener('change', () => {
                    const checked = [...document.querySelectorAll('.addon-checkbox:checked')];
                    if (checked.length > 3) {
                        cb.checked = false;
                        Toast.error('Maximum 3 add-ons.');
                        return;
                    }
                    updateTotal();
                });
            });
        },
        onAddcart: () => {
            if (!AppState.isLoggedIn()) {
                Modal.hide();
                ROUTER.navigate('/login');
                return;
            }
            const addonsTotal = [...document.querySelectorAll('.addon-checkbox:checked')]
                .reduce((s, cb) => s + parseInt(cb.dataset.price || 0), 0);
            const unitPrice = selectedPrice + addonsTotal;

            CartModule.addProduct(product, {
                size: selectedSize,
                sugar: Utils.$('#custom-sugar').value,
                ice: Utils.$('#custom-ice').value,
                addons: [...document.querySelectorAll('.addon-checkbox:checked')].map(cb => cb.value),
                quantity: parseInt(Utils.$('#custom-quantity').value) || 1,
                unitPrice,
            });
            HeaderComponent.updateCartBadge();
            Modal.hide();
        },
    });
}