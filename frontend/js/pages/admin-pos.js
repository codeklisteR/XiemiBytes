const POS_ADDON_PRICES = { 'None': 0, 'Pearls': 10, 'Nata de Coco': 10, 'Cheesecake': 15, 'Red Bean': 10, 'Oreo': 15 };

let posCart = [];
let posDiscount = 0;
let posAmountPaid = 0;
let posOrderNumber = null;
let posOrderDate = null;
let posOrderCounter = 1000;
let posCustomerName = 'Walk-in';
let posCheckoutInProgress = false;

async function AdminPOSPage() {
    const app = Utils.$('#app');
    posCart = [];
    posDiscount = 0;
    posAmountPaid = 0;
    posCustomerName = 'Walk-in';
    posOrderCounter++;
    posOrderNumber = posOrderCounter;
    posOrderDate = new Date().toLocaleDateString();

    app.innerHTML = `
        <div class="admin-pos fade-in">

            <!-- Left: Product Grid -->
            <div class="pos-products" style="padding: 24px 28px; overflow-y: auto;">

                <!-- Header -->
                <div class="d-flex justify-content-between align-items-center mb-4">
                    <div>
                        <h2 class="mb-1" style="font-weight: 800; color: #1e293b; letter-spacing: -0.5px;">POS System</h2>
                    </div>
                    <a href="#/admin" class="btn btn-sm btn-outline-secondary px-4 py-2" style="border-radius: 10px; font-weight: 600;">Back to Dashboard</a>
                </div>

                <!-- Search -->
                <div style="max-width: 100%; margin-bottom: 16px;">
                    <div class="search-wrapper">
                        <input type="text" id="pos-search" class="form-control" placeholder="Search your favorite drink...">
                    </div>
                </div>

                <!-- Category Pills -->
                <div style="margin-bottom: 16px; overflow-x: auto;">
                    <div class="category-pills" id="pos-category-pills">
                        <button class="category-pill active" data-cat="all">All Items</button>
                    </div>
                </div>

                <!-- Product Grid -->
                <div id="pos-grid-container" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(175px, 1fr)); gap: 16px;">
                </div>
            </div>

            <!-- Right: Current Order -->
            <div class="pos-cart shadow-sm" style="background: white; border-left: 1px solid #e2e8f0;">

                <!-- Order Header -->
                <div class="border-bottom bg-white" style="flex-shrink: 0; padding: 28px 16px 16px 16px;">
                    <div class="d-flex justify-content-between align-items-center">
                        <div>
                            <h4 class="mb-1" style="font-weight: 800; color: #1e293b;">Current Order</h4>
                            <p class="text-muted small mb-0" id="pos-date-display" style="letter-spacing: 0.5px;"></p>
                        </div>
                        <button class="btn btn-light text-danger d-flex align-items-center justify-content-center" id="btn-clear-cart" title="Clear Cart" style="width: 38px; height: 38px; border-radius: 10px; flex-shrink: 0;">
                            Clear
                        </button>
                    </div>
                </div>

                <!-- Cart Items -->
                <div id="pos-cart-items-container" style="flex: 1; min-height: 0; overflow-y: auto; padding: 12px 16px;"></div>

                <!-- Controls -->
                <div class="bg-white border-top" style="flex-shrink: 0; z-index: 10; padding: 16px;">

                    <!-- Summary rows -->
                    <div id="pos-summary-container" class="mb-3"></div>

                    <!-- Divider -->
                    <div style="border-top: 1px solid #e2e8f0; margin-bottom: 14px;"></div>

                    <!-- Walk-in customer name (guest — no account created) -->
                    <div class="mb-3">
                        <label class="text-muted font-weight-bold mb-1 d-block" style="font-size: 0.7rem; letter-spacing: 1px; text-transform: uppercase;">Customer Name</label>
                        <input type="text" id="pos-customer-name" class="form-control" value="Walk-in" placeholder="Guest name" style="border-radius: 10px; border: 1px solid #e2e8f0;">
                    </div>

                    <!-- Discount -->
                    <div class="mb-2">
                        <label class="text-muted font-weight-bold mb-1 d-block" style="font-size: 0.7rem; letter-spacing: 1px; text-transform: uppercase;">Discount (%)</label>
                        <div class="d-flex flex-wrap gap-1 mb-2" id="pos-discount-btns">
                            <button type="button" class="btn btn-sm btn-outline-secondary pos-disc-btn" data-disc="0" style="border-radius:8px; font-size:0.75rem;">0%</button>
                            <button type="button" class="btn btn-sm btn-outline-secondary pos-disc-btn" data-disc="5" style="border-radius:8px; font-size:0.75rem;">5%</button>
                            <button type="button" class="btn btn-sm btn-outline-secondary pos-disc-btn" data-disc="10" style="border-radius:8px; font-size:0.75rem;">10%</button>
                            <button type="button" class="btn btn-sm btn-outline-secondary pos-disc-btn" data-disc="15" style="border-radius:8px; font-size:0.75rem;">15%</button>
                            <button type="button" class="btn btn-sm btn-outline-secondary pos-disc-btn" data-disc="20" style="border-radius:8px; font-size:0.75rem;">20%</button>
                            <button type="button" class="btn btn-sm btn-outline-secondary pos-disc-btn" data-disc="50" style="border-radius:8px; font-size:0.75rem;">50%</button>
                        </div>
                        <input type="number" id="pos-discount" class="form-control form-control-sm" value="0" min="0" max="100" style="border-radius: 10px; border: 1px solid #e2e8f0; width: 100%;">
                    </div>

                    <!-- Amount Paid -->
                    <div style="margin-bottom: 20px;">
                        <label class="text-muted font-weight-bold mb-1 d-block" style="font-size: 0.7rem; letter-spacing: 1px; text-transform: uppercase;">Amount Paid</label>
                        <input type="number" id="pos-amount-paid" class="form-control" placeholder="0.00" style="border-radius: 10px; font-weight: 700; border: 1px solid #e2e8f0 !important; width: 100%; box-shadow: none !important; outline: none; height: 40px;">
                    </div>

                    <button class="btn btn-primary btn-block" id="btn-pos-charge" disabled style="border-radius: 14px; letter-spacing: 0.5px; height: 48px; font-size: 0.95rem; box-shadow: 0 6px 15px rgba(var(--color-primary-rgb), 0.25);">
                        Charge
                    </button>
                </div>
            </div>
        </div>
    `;

    function updatePOSUI() {
        const cartContainer = Utils.$('#pos-cart-items-container');
        const summaryContainer = Utils.$('#pos-summary-container');
        const chargeBtn = Utils.$('#btn-pos-charge');
        const dateDisplay = Utils.$('#pos-date-display');

        dateDisplay.innerText = posOrderDate;

        if (posCart.length === 0) {
            cartContainer.innerHTML = `
                <div style="display:flex; flex-direction:column; align-items:center; justify-content:center; min-height:280px; text-align:center; padding:24px;">
                    
                    <h5 style="font-weight:700; color:#64748b; margin-bottom:6px;">Cart is empty</h5>
                    <p style="color:#94a3b8; font-size:0.875rem; margin:0;">Select products to begin sale</p>
                </div>
            `;
        } else {
            cartContainer.innerHTML = posCart.map((item, index) => {
                const addonsLabel = item.addons && item.addons.filter(a => a !== 'None').length > 0
                    ? item.addons.filter(a => a !== 'None').join(', ')
                    : null;
                const customDetails = [
                    item.size || null,
                    item.sugar ? `${item.sugar} sugar` : null,
                    item.ice ? `${item.ice} ice` : null,
                    addonsLabel ? `+${addonsLabel}` : null
                ].filter(Boolean).join(' · ');

                return `
                <div class="d-flex justify-content-between align-items-start mb-3 pb-3 border-bottom">
                    <div style="flex: 1; min-width: 0;">
                        <div class="font-weight-bold" style="font-size: 0.95rem; color: #1e293b; margin-bottom: 2px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${item.name}</div>
                        ${customDetails ? `<div class="text-muted" style="font-size: 0.7rem; margin-bottom: 3px; line-height: 1.4;">${customDetails}</div>` : ''}
                        <div class="text-muted small">${Utils.formatCurrency(item.unitPrice)} × <strong style="color:#1e293b;">${item.quantity}</strong></div>
                    </div>
                    <div class="d-flex align-items-center gap-2 ms-2" style="flex-shrink: 0;">
                        <span class="font-weight-bold" style="font-size:1rem; color:#1e293b;">${Utils.formatCurrency(item.unitPrice * item.quantity)}</span>
                        <button class="btn btn-sm btn-light text-danger remove-pos-item" data-index="${index}" style="border-radius:8px; width:28px; height:28px; padding:0; display:flex; align-items:center; justify-content:center; border:1px solid #fee2e2;">&times;</button>
                    </div>
                </div>`;
            }).join('');
        }

        const subtotal = posCart.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0);
        const discountAmount = (subtotal * posDiscount) / 100;
        const total = subtotal - discountAmount;
        const change = posAmountPaid > 0 ? posAmountPaid - total : 0;

        summaryContainer.innerHTML = `
        <div style="font-family: 'Inter', sans-serif; padding: 2px 0;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
                <span style="font-size: 0.78rem; color: #64748b; font-weight: 500;">Subtotal</span>
                <span style="font-size: 0.78rem; font-weight: 600; color: #1e293b;">${Utils.formatCurrency(subtotal)}</span>
            </div>
            
            ${posDiscount > 0 ? `
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
                    <span style="font-size: 0.78rem; font-weight: 500;">Discount (${posDiscount}%)</span>
                    <span style="font-size: 0.78rem; font-weight: 600;">-${Utils.formatCurrency(discountAmount)}</span>
                </div>
            ` : ''}
            
            <div style="margin: 6px 0; border-top: 1px solid #e2e8f0;"></div>
            
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                <span style="font-size: 0.8rem; font-weight: 700; color: #0f172a; letter-spacing: 0.02em;">TOTAL</span>
                <span style="font-size: 1.1rem; font-weight: 800; color: var(--color-primary); letter-spacing: -0.01em;">${Utils.formatCurrency(total)}</span>
            </div>
            
            <div style="display: flex; justify-content: space-between; align-items: center; padding: 6px 10px; background: ${change >= 0 ? '#f0fdf4' : '#fef2f2'}; border: 1px solid ${change >= 0 ? '#bbf7d0' : '#fecaca'}; border-radius: 6px;">
                <span style="font-size: 0.75rem; font-weight: 600; color: #64748b;">Change Due</span>
                <span style="font-size: 0.88rem; font-weight: 700; color: ${change >= 0 ? '#166534' : '#991b1b'};">${Utils.formatCurrency(change)}</span>
            </div>
        </div>
        `;

        chargeBtn.disabled = posCart.length === 0 || posAmountPaid < total;
        chargeBtn.style.whiteSpace = 'nowrap';
        chargeBtn.innerHTML = `Charge${total > 0 ? ' \u2014 ' + Utils.formatCurrency(total) : ''}`;

        Utils.$$('.remove-pos-item').forEach(btn => {
            btn.addEventListener('click', () => {
                posCart.splice(parseInt(btn.dataset.index), 1);
                updatePOSUI();
            });
        });
    }

    function showPOSProductModal(product) {
        const addonOptions = Object.entries(POS_ADDON_PRICES).map(([name, price]) => `
            <label class="addon-option d-flex align-items-center gap-2 mb-2" style="cursor:pointer; padding:8px 12px; border:1px solid #e2e8f0; border-radius:8px;">
                <input type="checkbox" value="${name}" data-price="${price}" class="pos-addon-checkbox" ${name === 'None' ? 'disabled' : ''}>
                <span style="flex:1;">${name}</span>
                <span class="text-muted small">${price > 0 ? '+₱' + price : 'Free'}</span>
            </label>
        `).join('');

        Modal.show({
            title: product.name,
            html: `
                <div class="product-modal">
                    <img src="${product.image_url || 'images/placeholder.png'}" alt="${product.name}" style="width:100%; max-height:180px; object-fit:contain; background:#f9f9f9; border-radius:8px; margin-bottom:15px; padding:10px;">
                    <p class="text-muted small">${product.description || 'Deliciously handcrafted.'}</p>

                    <div class="d-flex justify-content-between align-items-center mb-3 p-3" style="background:#f8fafc; border-radius:10px;">
                        <span class="font-weight-bold">Base Price</span>
                        <span class="h5 mb-0 font-weight-bold" style="color:var(--color-primary);" id="pos-modal-base-price">${Utils.formatCurrency(product.price)}</span>
                    </div>

                    <div class="form-group">
                        <label class="font-weight-bold small">Size</label>
                        <select id="pos-custom-size" class="form-control" style="border-radius:8px;">
                            <option value="Regular" data-mod="0">Regular</option>
                            <option value="Large" data-mod="15">Large (+₱15.00)</option>
                        </select>
                    </div>

                    <div class="form-group">
                        <label class="font-weight-bold small">Sugar Level</label>
                        <select id="pos-custom-sugar" class="form-control" style="border-radius:8px;">
                            <option value="100%">Normal (100%)</option>
                            <option value="75%">Less Sugar (75%)</option>
                            <option value="50%">Half Sugar (50%)</option>
                            <option value="25%">Slight Sugar (25%)</option>
                            <option value="0%">No Sugar (0%)</option>
                        </select>
                    </div>

                    <div class="form-group">
                        <label class="font-weight-bold small">Ice Level</label>
                        <select id="pos-custom-ice" class="form-control" style="border-radius:8px;">
                            <option value="Normal">Normal Ice</option>
                            <option value="Less">Less Ice</option>
                            <option value="None">No Ice</option>
                            <option value="Extra">Extra Ice</option>
                        </select>
                    </div>

                    <div class="form-group">
                        <label class="font-weight-bold small">Quantity</label>
                        <input type="number" id="pos-custom-quantity" class="form-control" value="1" min="1" style="border-radius:8px;">
                    </div>

                    <div class="form-group">
                        <label class="font-weight-bold small d-flex justify-content-between">
                            <span>Add-ons <span class="text-muted font-weight-normal">(Optional, max 3)</span></span>
                            <span id="pos-addon-count-label" class="small text-muted">0 / 3 selected</span>
                        </label>
                        <div id="pos-addon-options">${addonOptions}</div>
                    </div>

                    <div class="mt-3 p-3" style="background:#f0fdf4; border:1px solid #bbf7d0; border-radius:10px;">
                        <div class="d-flex justify-content-between align-items-center">
                            <span class="font-weight-bold">Total to Add</span>
                            <span class="h4 mb-0 font-weight-bold" style="color:var(--color-primary);" id="pos-modal-total">${Utils.formatCurrency(product.price)}</span>
                        </div>
                    </div>
                </div>
            `,
            buttons: [
                { text: 'Cancel', action: 'close', class: 'secondary' },
                { text: 'Add to Order', action: 'addtocart', class: 'primary' }
            ],
            onOpen: () => {
                function recalc() {
                    const sizeEl = Utils.$('#pos-custom-size');
                    const sizeMod = parseInt(sizeEl.options[sizeEl.selectedIndex].dataset.mod) || 0;
                    const addonsTotal = [...document.querySelectorAll('.pos-addon-checkbox:checked')]
                        .reduce((s, cb) => s + parseInt(cb.dataset.price || 0), 0);
                    const qty = parseInt(Utils.$('#pos-custom-quantity')?.value) || 1;
                    if (Utils.$('#pos-modal-base-price')) Utils.$('#pos-modal-base-price').textContent = Utils.formatCurrency(product.price + sizeMod);
                    if (Utils.$('#pos-modal-total')) Utils.$('#pos-modal-total').textContent = Utils.formatCurrency((product.price + sizeMod + addonsTotal) * qty);
                }

                Utils.$('#pos-custom-size')?.addEventListener('change', recalc);
                Utils.$('#pos-custom-quantity')?.addEventListener('input', recalc);

                document.querySelectorAll('.pos-addon-checkbox').forEach(cb => {
                    cb.addEventListener('change', () => {
                        const checked = [...document.querySelectorAll('.pos-addon-checkbox:checked')];
                        if (checked.length > 3) { cb.checked = false; Toast.error('Maximum 3 add-ons allowed.'); return; }
                        const countLabel = Utils.$('#pos-addon-count-label');
                        if (countLabel) countLabel.textContent = `${checked.length} / 3 selected`;
                        recalc();
                    });
                });
            },
            onAddtocart: () => {
                const sizeEl = Utils.$('#pos-custom-size');
                const sizeMod = parseInt(sizeEl.options[sizeEl.selectedIndex].dataset.mod) || 0;
                const addonsTotal = [...document.querySelectorAll('.pos-addon-checkbox:checked')]
                    .reduce((s, cb) => s + parseInt(cb.dataset.price || 0), 0);

                posCart.push({
                    id: product.id,
                    name: product.name,
                    price: product.price,
                    unitPrice: product.price + sizeMod + addonsTotal,
                    size: sizeEl.value,
                    sugar: Utils.$('#pos-custom-sugar').value,
                    ice: Utils.$('#pos-custom-ice').value,
                    addons: [...document.querySelectorAll('.pos-addon-checkbox:checked')].map(cb => cb.value),
                    quantity: parseInt(Utils.$('#pos-custom-quantity').value) || 1
                });

                Modal.hide();
                updatePOSUI();
                Toast.show('Item added to cart', 'success');
            }
        });
    }

    try {
        Loader.show();
        await ProductsModule.getProducts();
        const { products } = AppState;

        const grid = Utils.$('#pos-grid-container');
        grid.innerHTML = products.map(product => `
                    <div class="add-to-pos" data-id="${product.id}" style="
                        cursor: pointer;
                        background: white;
                        border-radius: 16px;
                        overflow: hidden;
                        border: 1px solid #cbd5e1;
                        display: flex;
                        flex-direction: column;
                        transition: transform 0.15s ease, border-color 0.15s ease;
                    "
                    onmouseover="this.style.borderColor='var(--color-primary)';"
                    onmouseout="this.style.transform=''; this.style.borderColor='#cbd5e1';">
                        <div style="height: 150px; background: #f8fafc; display: flex; align-items: center; justify-content: center; overflow: hidden; border-bottom: 1px solid #f1f5f9;">
                            <img src="${product.image_url || 'images/placeholder.png'}" alt="${product.name}" style="width: 100%; height: 100%; object-fit: contain; padding: 10px;">
                        </div>
                        <div style="padding: 12px 14px; flex: 1; display: flex; flex-direction: column;">
                            <div style="font-size: 0.88rem; font-weight: 700; color: #1e293b; margin-bottom: 6px; line-height: 1.3;">${product.name}</div>
                            <div style="display: flex; justify-content: space-between; align-items: center; margin-top: auto;">
                                <span style="color: var(--color-primary); font-weight: 800; font-size: 1rem;">${Utils.formatCurrency(product.price)}</span>
                            </div>
                        </div>
                    </div>
        `).join('');

        Utils.$$('.add-to-pos').forEach(card => {
            card.addEventListener('click', () => {
                const product = products.find(p => p.id == card.dataset.id);
                showPOSProductModal(product);
            });
        });

        Utils.$('#pos-search').addEventListener('input', Utils.debounce((e) => {
            const q = e.target.value.trim().toLowerCase();
            Utils.$$('.add-to-pos').forEach(card => {
                const product = products.find(p => p.id == card.dataset.id);
                card.style.display = (!q || product.name.toLowerCase().includes(q)) ? '' : 'none';
            });
        }, 200));

        Utils.$('#pos-discount').addEventListener('input', (e) => {
            posDiscount = parseFloat(e.target.value) || 0;
            Utils.$$('.pos-disc-btn').forEach(b => b.classList.toggle('btn-primary', parseInt(b.dataset.disc) === posDiscount));
            updatePOSUI();
        });

        Utils.$$('.pos-disc-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                posDiscount = parseFloat(btn.dataset.disc) || 0;
                Utils.$('#pos-discount').value = posDiscount;
                Utils.$$('.pos-disc-btn').forEach(b => b.classList.remove('btn-primary'));
                btn.classList.add('btn-primary');
                updatePOSUI();
            });
        });

        Utils.$('#pos-amount-paid').addEventListener('input', (e) => { posAmountPaid = parseFloat(e.target.value) || 0; updatePOSUI(); });

        // Load categories dynamically
        try {
            const catRes = await API.get('/admin/categories.php');
            const categories = catRes.data || [];
            const pillsContainer = Utils.$('#pos-category-pills');

            // Reset to only the hardcoded "All Items" pill before appending
            pillsContainer.innerHTML = '<button class="category-pill active" data-cat="all">All Items</button>';

            const seenCats = new Set(['all']);
            categories.forEach(cat => {
                const name = (cat.name || '').trim();
                const key = name.toLowerCase();
                if (!name || seenCats.has(key)) return;
                seenCats.add(key);
                const btn = document.createElement('button');
                btn.className = 'category-pill';
                btn.dataset.cat = name;
                btn.textContent = name;
                pillsContainer.appendChild(btn);
            });

            Utils.$$('.category-pill').forEach(pill => {
                pill.addEventListener('click', () => {
                    Utils.$$('.category-pill').forEach(p => p.classList.remove('active'));
                    pill.classList.add('active');
                    const cat = pill.dataset.cat;
                    Utils.$$('.add-to-pos').forEach(card => {
                        const product = products.find(p => p.id == card.dataset.id);
                        card.style.display = (cat === 'all' || product.category === cat) ? '' : 'none';
                    });
                });
            });
        } catch (e) { console.warn('Categories load failed', e); }

        Utils.$('#pos-customer-name')?.addEventListener('input', (e) => {
            posCustomerName = (e.target.value || 'Walk-in').trim() || 'Walk-in';
        });

        Utils.$('#btn-clear-cart').addEventListener('click', () => {
            if (posCart.length > 0 && confirm('Clear current order?')) {
                posCart = []; posDiscount = 0; posAmountPaid = 0;
                posCustomerName = 'Walk-in';
                posOrderCounter++; posOrderNumber = posOrderCounter;
                posOrderDate = new Date().toLocaleDateString();
                Utils.$('#pos-discount').value = 0;
                Utils.$('#pos-amount-paid').value = '';
                const nameInput = Utils.$('#pos-customer-name');
                if (nameInput) nameInput.value = 'Walk-in';
                updatePOSUI();
            }
        });

        Utils.$('#btn-pos-charge').addEventListener('click', async () => {
            const chargeBtn = Utils.$('#btn-pos-charge');
            if (posCheckoutInProgress || !chargeBtn) return;
            posCheckoutInProgress = true;
            chargeBtn.disabled = true;

            const subtotal = posCart.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0);
            const discountAmount = (subtotal * posDiscount) / 100;
            const total = subtotal - discountAmount;

            if (posAmountPaid < total) {
                Toast.error('Please enter an amount paid that is equal to or greater than the total.');
                posCheckoutInProgress = false;
                chargeBtn.disabled = false;
                return;
            }

            const change = posAmountPaid - total;
            const customerName = (Utils.$('#pos-customer-name')?.value || posCustomerName || 'Walk-in').trim() || 'Walk-in';
            posCustomerName = customerName;

            try {
                Loader.show();
                const result = await API.post('/admin/pos-checkout.php', {
                    items: posCart.map(item => ({
                        product_id: item.id,
                        quantity: item.quantity,
                        size: item.size || 'Regular',
                        sugar_level: item.sugar || '100%',
                        ice_level: item.ice || 'Normal',
                        addons: item.addons || [],
                        unit_price: item.unitPrice,
                    })),
                    subtotal,
                    discount: discountAmount,
                    total,
                    amount_paid: posAmountPaid,
                    payment_method: 'cash_pos',
                    source: 'pos',
                    customer_name: customerName,
                }, { headers: { Authorization: `Bearer ${AppState.token}` } });

                posOrderNumber = result.order_qr;

                const receiptItems = [...posCart];
                const receiptDiscount = posDiscount;
                const receiptDiscountAmount = discountAmount;
                const receiptTotal = total;
                const receiptAmountPaid = posAmountPaid;
                const receiptChange = change;

                posCart = []; posDiscount = 0; posAmountPaid = 0;
                posOrderCounter++;
                posOrderDate = new Date().toLocaleDateString();
                Utils.$('#pos-discount').value = 0;
                Utils.$('#pos-amount-paid').value = '';
                updatePOSUI();

                Modal.show({
                    title: `Receipt — Order #${posOrderNumber}`,
                    html: `
                        <div style="padding:4px 0;">
                            <!-- Customer + Date row -->
                            <div style="display:flex; justify-content:space-between; align-items:flex-start; background:#f8fafc; border:1px solid #e2e8f0; border-radius:12px; padding:14px 16px; margin-bottom:16px;">
                                <div>
                                    <div style="font-size:0.7rem; text-transform:uppercase; letter-spacing:1px; font-weight:700; color:#94a3b8; margin-bottom:4px;">Cashier</div>
                                    <div style="font-weight:700; color:#1e293b; font-size:0.95rem;">POS Sale</div>
                                </div>
                                <div style="text-align:right;">
                                    <div style="font-size:0.7rem; text-transform:uppercase; letter-spacing:1px; font-weight:700; color:#94a3b8; margin-bottom:4px;">Date & Time</div>
                                    <div style="font-size:0.85rem; color:#1e293b;">${new Date().toLocaleString()}</div>
                                </div>
                            </div>

                            <!-- Items -->
                            <div style="margin-bottom:16px;">
                                <div style="font-size:0.7rem; text-transform:uppercase; letter-spacing:1px; font-weight:700; color:#94a3b8; margin-bottom:10px;">Order Items</div>
                                ${receiptItems.map(item => `
                                    <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:10px; padding-bottom:10px; border-bottom:1px dashed #e2e8f0;">
                                        <div>
                                            <div style="font-size:0.88rem; font-weight:700; color:#1e293b;">${item.quantity}× ${item.name}</div>
                                            <div style="font-size:0.75rem; color:#94a3b8; margin-top:2px;">${item.size || 'Regular'} · ${item.sugar || '100%'} sugar · ${item.ice || 'Normal'} ice${item.addons && item.addons.filter(a=>a!=='None').length ? ' · ' + item.addons.filter(a=>a!=='None').join(', ') : ''}</div>
                                        </div>
                                        <span style="font-size:0.88rem; font-weight:700; color:#1e293b; white-space:nowrap; margin-left:12px;">${Utils.formatCurrency(item.unitPrice * item.quantity)}</span>
                                    </div>
                                `).join('')}
                            </div>

                            <!-- Payment Summary -->
                            <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:12px; padding:14px 16px;">
                                ${receiptDiscountAmount > 0 ? `
                                    <div style="display:flex; justify-content:space-between; font-size:0.85rem; color:#16a34a; margin-bottom:8px;">
                                        <span>Discount (${receiptDiscount}%)</span><span>-${Utils.formatCurrency(receiptDiscountAmount)}</span>
                                    </div>
                                ` : ''}
                                <div style="display:flex; justify-content:space-between; align-items:center; font-weight:700; border-top:1px solid #e2e8f0; padding-top:10px; margin-bottom:8px;">
                                    <span style="font-size:0.95rem;">Total</span>
                                    <span style="color:var(--color-primary); font-size:1.1rem;">${Utils.formatCurrency(receiptTotal)}</span>
                                </div>
                                <div style="display:flex; justify-content:space-between; font-size:0.85rem; color:#64748b; margin-bottom:6px;">
                                    <span>Payment Method</span><span>Cash (POS)</span>
                                </div>
                                <div style="display:flex; justify-content:space-between; font-size:0.85rem; margin-bottom:6px;">
                                    <span>Amount Paid</span>
                                    <span style="font-weight:700;">${receiptAmountPaid > 0 ? Utils.formatCurrency(receiptAmountPaid) : '—'}</span>
                                </div>
                                ${receiptAmountPaid > 0 ? `
                                <div style="display:flex; justify-content:space-between; font-size:0.85rem; color:#16a34a; font-weight:700; margin-bottom:6px;">
                                    <span>Change Due</span><span>${Utils.formatCurrency(receiptChange)}</span>
                                </div>` : ''}
                                <div style="display:flex; justify-content:space-between; align-items:center; border-top:1px solid #e2e8f0; padding-top:10px; margin-top:4px;">
                                    <span style="font-size:0.85rem;">Customer</span>
                                    <span style="font-weight:700; font-size:0.85rem;">${customerName}</span>
                                </div>
                                <div style="display:flex; justify-content:space-between; align-items:center; margin-top:6px;">
                                    <span style="font-size:0.85rem;">Order Status</span>
                                    <span style="font-weight:700; font-size:0.85rem; color:#854d0e; background:#fef9c3; border:1px solid #fde047; padding:2px 10px; border-radius:20px;">Preparing</span>
                                </div>
                                <div style="display:flex; justify-content:space-between; align-items:center; margin-top:6px;">
                                    <span style="font-size:0.85rem;">Payment Status</span>
                                    <span style="font-weight:700; font-size:0.85rem; color:#166534; background:#f0fdf4; border:1px solid #bbf7d0; padding:2px 10px; border-radius:20px;">Paid</span>
                                </div>
                            </div>
                        </div>
                    `,
                    buttons: [{ text: 'Close & New Sale', action: 'close', class: 'primary' }],
                    onClose: () => {
                        posCart = []; posDiscount = 0; posAmountPaid = 0;
                        posOrderCounter++; posOrderNumber = posOrderCounter;
                        posOrderDate = new Date().toLocaleDateString();
                        Utils.$('#pos-discount').value = 0;
                        Utils.$('#pos-amount-paid').value = '';
                        updatePOSUI();
                    }
                });
            } catch (error) {
                const msg = error?.details || error?.error || error?.message || 'Failed to complete order.';
                Toast.error(typeof msg === 'string' ? msg : 'Failed to complete order. Please try again.');
                console.error('POS checkout error:', error);
            } finally {
                Loader.hide();
                posCheckoutInProgress = false;
                updatePOSUI();
            }
        });

        updatePOSUI();

    } catch (error) {
        Utils.error('POS Init Error:', error);
    } finally {
        Loader.hide();
    }
}