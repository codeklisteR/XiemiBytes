let posCart = [];
let posDiscount = 0;
let posAmountPaid = 0;

async function AdminPOSPage() {
    const app = Utils.$('#app');
    posCart = [];
    posDiscount = 0;
    posAmountPaid = 0;

    // 1. Initial Shell Render
    app.innerHTML = `
        <div class="admin-pos fade-in" style="display: flex; overflow: hidden; background: #f8fafc;">
            <!-- Left Side: Product Selection -->
            <div class="pos-products" style="flex: 1; overflow-y: auto; padding: 32px;">
                <div class="d-flex justify-content-between align-items-center mb-5">
                    <div>
                        <h2 class="mb-1" style="font-weight: 800; color: #1e293b; letter-spacing: -0.5px;">POS System</h2>
                        <p class="text-muted small mb-0">Select items to start a sale</p>
                    </div>
                    <a href="#/admin" class="btn btn-sm btn-outline-secondary px-4 py-2" style="border-radius: 10px; font-weight: 600;">Back to Dashboard</a>
                </div>

                <div class="search-wrapper mb-5">
                    <input type="text" id="pos-search" class="form-control" placeholder="Search product or scan barcode..." style="border-radius: 14px; padding: 15px 24px; border: 1px solid #e2e8f0; max-width: 550px; box-shadow: 0 2px 4px rgba(0,0,0,0.02);">
                </div>

                <div class="pos-category-tabs d-flex gap-3 mb-5 overflow-auto pb-2">
                    <button class="category-pill active" data-cat="all">All Items</button>
                    <button class="category-pill" data-cat="1">Milk Tea</button>
                    <button class="category-pill" data-cat="7">Fruit Tea</button>
                    <button class="category-pill" data-cat="3">Wintermelon</button>
                </div>

                <div class="pos-grid" id="pos-grid-container" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 20px;">
                    <!-- Products loaded here -->
                </div>
            </div>

            <!-- Right Side: Current Transaction -->
            <div class="pos-cart shadow-sm" style="flex: 0 0 440px; background: white; display: flex; flex-direction: column; border-left: 1px solid #e2e8f0;">
                <div class="p-4 border-bottom bg-white">
                    <div class="d-flex justify-content-between align-items-center">
                        <div>
                            <h4 class="mb-1" style="font-weight: 800; color: #1e293b;">Current Order</h4>
                            <p class="text-muted tiny mb-0" id="pos-date-display" style="letter-spacing: 0.5px;"></p>
                        </div>
                        <button class="btn btn-light text-danger d-flex align-items-center justify-content-center" id="btn-clear-cart" title="Clear Cart" style="width: 40px; height: 40px; border-radius: 10px;">
                            <span style="font-size: 1.2rem;">🗑️</span>
                        </button>
                    </div>
                </div>

                <div class="pos-items px-4 py-3" id="pos-cart-items-container" style="flex: 1; overflow-y: auto;">
                    <!-- Cart items loaded here -->
                </div>

                <!-- Payment & Summary -->
                <div class="pos-controls p-4 bg-white border-top shadow-lg" style="z-index: 10;">
                    <div class="row g-4 mb-4">
                        <div class="col-6">
                            <label class="text-muted font-weight-bold mb-2 d-block" style="font-size: 0.7rem; letter-spacing: 1px; text-transform: uppercase;">Discount (%)</label>
                            <input type="number" id="pos-discount" class="form-control py-2" value="0" min="0" max="100" style="border-radius: 10px; border: 1px solid #e2e8f0;">
                        </div>
                        <div class="col-6">
                            <label class="text-muted font-weight-bold mb-2 d-block" style="font-size: 0.7rem; letter-spacing: 1px; text-transform: uppercase;">Amount Paid</label>
                            <input type="number" id="pos-amount-paid" class="form-control py-2" placeholder="0.00" style="border-radius: 10px; font-weight: 700; border: 1px solid #e2e8f0;">
                        </div>
                    </div>

                    <div class="pos-summary pt-4 border-top" id="pos-summary-container">
                        <!-- Summary calculated here -->
                    </div>

                    <button class="btn btn-primary btn-block btn-lg py-3 mt-4" id="btn-pos-charge" disabled style="border-radius: 14px; font-weight: 800; letter-spacing: 0.5px; box-shadow: 0 6px 15px rgba(var(--color-primary-rgb), 0.25);">
                        COMPLETE ORDER
                    </button>
                </div>
            </div>
        </div>
    `;

    // 2. State Update Function (Avoids full page re-render)
    function updatePOSUI() {
        const cartContainer = Utils.$('#pos-cart-items-container');
        const summaryContainer = Utils.$('#pos-summary-container');
        const chargeBtn = Utils.$('#btn-pos-charge');
        const dateDisplay = Utils.$('#pos-date-display');

        dateDisplay.innerText = new Date().toLocaleDateString() + ' | Order #' + Math.floor(Math.random() * 9000 + 1000);

        // Update Cart List
        if (posCart.length === 0) {
            cartContainer.innerHTML = `
                <div class="text-center py-5" style="margin-top: 40px;">
                    <div style="font-size: 4rem; margin-bottom: 20px;">🛍️</div>
                    <h5 class="font-weight-bold" style="color: #64748b;">Cart is empty</h5>
                    <p class="text-muted small">Select products to begin sale</p>
                </div>
            `;
        } else {
            cartContainer.innerHTML = posCart.map((item, index) => `
                <div class="d-flex justify-content-between align-items-center mb-4 pb-4 border-bottom animate-slide-in">
                    <div style="flex: 1;">
                        <div class="font-weight-bold" style="font-size: 1rem; color: #1e293b; margin-bottom: 4px;">${item.name}</div>
                        <div class="text-muted small">${Utils.formatCurrency(item.price)} <span class="mx-2" style="opacity: 0.5;">×</span> <strong style="color: #1e293b;">${item.quantity}</strong></div>
                    </div>
                    <div class="d-flex align-items-center gap-4">
                        <span class="font-weight-bold" style="font-size: 1.1rem; color: #1e293b;">${Utils.formatCurrency(item.price * item.quantity)}</span>
                        <button class="btn btn-sm btn-light text-danger remove-pos-item" data-index="${index}" style="border-radius: 8px; width: 32px; height: 32px; padding: 0; display: flex; align-items: center; justify-content: center; border: 1px solid #fee2e2;">&times;</button>
                    </div>
                </div>
            `).join('');
        }

        // Update Summary
        const subtotal = posCart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const discountAmount = (subtotal * posDiscount) / 100;
        const total = subtotal - discountAmount;
        const change = posAmountPaid > 0 ? posAmountPaid - total : 0;

        summaryContainer.innerHTML = `
            <div class="d-flex justify-content-between mb-3">
                <span class="text-muted font-weight-bold" style="font-size: 0.9rem;">Subtotal</span>
                <span class="font-weight-bold" style="color: #1e293b;">${Utils.formatCurrency(subtotal)}</span>
            </div>
            ${posDiscount > 0 ? `
                <div class="d-flex justify-content-between mb-3 text-success">
                    <span class="font-weight-bold" style="font-size: 0.9rem;">Discount (${posDiscount}%)</span>
                    <span class="font-weight-bold">-${Utils.formatCurrency(discountAmount)}</span>
                </div>
            ` : ''}
            <div class="d-flex justify-content-between align-items-center mt-2 mb-4 pt-2 border-top">
                <span class="h5 mb-0" style="font-weight: 900; color: #1e293b; text-transform: uppercase; letter-spacing: 0.5px;">Total</span>
                <span class="h3 mb-0" style="font-weight: 900; color: var(--color-primary);">${Utils.formatCurrency(total)}</span>
            </div>
            
            <div class="d-flex justify-content-between align-items-center p-3 rounded-xl" style="background: ${change >= 0 ? '#f0fdf4' : '#fef2f2'}; border: 1px solid ${change >= 0 ? '#bbf7d0' : '#fecaca'}; border-radius: 12px;">
                <span class="text-muted font-weight-bold" style="font-size: 0.85rem;">Change Due</span>
                <span class="h4 mb-0 font-weight-bold" style="color: ${change >= 0 ? '#166534' : '#991b1b'};">${Utils.formatCurrency(change)}</span>
            </div>
        `;

        // Update Charge Button State
        chargeBtn.disabled = posCart.length === 0 || (posAmountPaid < total && posAmountPaid !== 0);
        chargeBtn.innerHTML = `COMPLETE ORDER ${total > 0 ? '— ' + Utils.formatCurrency(total) : ''}`;

        // Re-attach listeners to new DOM elements
        attachPOSActionListeners();
    }

    function attachPOSActionListeners() {
        // Remove item
        Utils.$$('.remove-pos-item').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const index = btn.dataset.index;
                posCart.splice(index, 1);
                updatePOSUI();
            });
        });
    }

    // 3. Initial Setup & Grid Rendering
    try {
        Loader.show();
        await ProductsModule.getProducts();
        const { products } = AppState;

        const grid = Utils.$('#pos-grid-container');
        grid.innerHTML = products.map(product => `
            <div class="pos-card card border-0 shadow-sm p-3 text-center transition-all add-to-pos" data-id="${product.id}" style="cursor: pointer; background: white; border-radius: 16px; border: 1px solid transparent;">
                <div style="height: 110px; display: flex; align-items: center; justify-content: center; background: #f8fafc; border-radius: 12px; margin-bottom: 12px; overflow: hidden; border: 1px solid #f1f5f9;">
                    <img src="${product.image_url}" style="width: 100%; height: 100%; object-fit: contain; padding: 6px;">
                </div>
                <div style="font-size: 0.85rem; font-weight: 700; height: 2.4em; overflow: hidden; color: #1e293b; line-height: 1.2; margin-bottom: 4px;">${product.name}</div>
                <div style="color: var(--color-primary); font-weight: 800; font-size: 1rem;">${Utils.formatCurrency(product.price)}</div>
            </div>
        `).join('');

        // Static Listeners (Don't need re-attaching)
        Utils.$$('.add-to-pos').forEach(card => {
            card.addEventListener('click', () => {
                const id = card.dataset.id;
                const product = products.find(p => p.id == id);
                const existing = posCart.find(item => item.id == id);
                if (existing) {
                    existing.quantity++;
                } else {
                    posCart.push({ ...product, quantity: 1 });
                }
                updatePOSUI();
            });
        });

        Utils.$('#pos-discount').addEventListener('input', (e) => {
            posDiscount = parseFloat(e.target.value) || 0;
            updatePOSUI();
        });

        Utils.$('#pos-amount-paid').addEventListener('input', (e) => {
            posAmountPaid = parseFloat(e.target.value) || 0;
            updatePOSUI();
        });

        Utils.$('#btn-clear-cart').addEventListener('click', () => {
            if (posCart.length > 0 && confirm('Clear current order?')) {
                posCart = [];
                posDiscount = 0;
                posAmountPaid = 0;
                Utils.$('#pos-discount').value = 0;
                Utils.$('#pos-amount-paid').value = '';
                updatePOSUI();
            }
        });

        Utils.$('#btn-pos-charge').addEventListener('click', () => {
            const subtotal = posCart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
            const discountAmount = (subtotal * posDiscount) / 100;
            const total = subtotal - discountAmount;
            const change = posAmountPaid - total;

            Modal.show({
                title: 'Order Finalized',
                html: `
                    <div class="text-center p-4">
                        <div style="font-size: 4rem; margin-bottom: 15px;">🎉</div>
                        <h3 style="font-weight: 800; color: #1e293b;">Sale Completed</h3>
                        <div class="mt-4 p-4 rounded-xl" style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 16px;">
                            <div class="d-flex justify-content-between mb-2">
                                <span class="text-muted">Total Sale:</span>
                                <strong style="font-size: 1.1rem;">${Utils.formatCurrency(total)}</strong>
                            </div>
                            <div class="d-flex justify-content-between mb-3 pb-3 border-bottom">
                                <span class="text-muted">Paid Amount:</span>
                                <strong style="font-size: 1.1rem;">${Utils.formatCurrency(posAmountPaid)}</strong>
                            </div>
                            <div class="d-flex justify-content-between">
                                <span class="font-weight-bold" style="color: #64748b;">Change Due:</span>
                                <strong class="text-success" style="font-size: 1.5rem;">${Utils.formatCurrency(change)}</strong>
                            </div>
                        </div>
                    </div>
                `,
                buttons: [{ text: 'Close & New Sale', action: 'close', class: 'primary' }],
                onClose: () => {
                    posCart = [];
                    posDiscount = 0;
                    posAmountPaid = 0;
                    Utils.$('#pos-discount').value = 0;
                    Utils.$('#pos-amount-paid').value = '';
                    updatePOSUI();
                }
            });
        });

        // Initialize UI
        updatePOSUI();

    } catch (error) {
        Utils.error('POS Init Error:', error);
    } finally {
        Loader.hide();
    }
}
