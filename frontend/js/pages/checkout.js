/**
 * Checkout Page
 */

async function CheckoutPage() {
    const app = Utils.$('#app');
    const { cart } = AppState;

    if (!cart || cart.items.length === 0) {
        ROUTER.navigate('/cart');
        return;
    }

    let appliedVoucher = null;
    let usePoints = false;
    const POINTS_DISCOUNT = 90;

    let activeVouchers = [];
    try {
        const res = await VouchersModule.getVouchers();
        activeVouchers = Array.isArray(res) ? res : (res.data || []);
    } catch (e) {}

    function getDiscount(subtotal) {
        let discount = 0;
        if (appliedVoucher) {
            if (appliedVoucher.type === 'percentage') discount += subtotal * (appliedVoucher.discount / 100);
            if (appliedVoucher.type === 'fixed') discount += appliedVoucher.discount;
        }
        if (usePoints) discount += POINTS_DISCOUNT;
        return discount;
    }

    function renderSummary() {
        const subtotal = cart.subtotal || cart.total;
        const discount = getDiscount(subtotal);
        const total = Math.max(0, subtotal - discount);
        const summaryEl = Utils.$('#checkout-summary');
        if (!summaryEl) return;

        summaryEl.innerHTML = `
            <div class="checkout-line"><span>Subtotal</span><span>${Utils.formatCurrency(subtotal)}</span></div>
            ${appliedVoucher ? `<div class="checkout-line checkout-line-discount"><span>Voucher (${appliedVoucher.code})</span><span>-${Utils.formatCurrency(appliedVoucher.type === 'percentage' ? subtotal * (appliedVoucher.discount / 100) : appliedVoucher.discount)}</span></div>` : ''}
            ${usePoints ? `<div class="checkout-line checkout-line-discount"><span>Points (100 pts)</span><span>-${Utils.formatCurrency(POINTS_DISCOUNT)}</span></div>` : ''}
            <div class="checkout-line"><span>Pickup</span><span>Free</span></div>
            <hr class="checkout-divider">
            <div class="checkout-line checkout-line-total"><span>Total</span><span>${Utils.formatCurrency(total)}</span></div>
        `;

        const voucherSummary = Utils.$('#checkout-voucher-summary');
        if (voucherSummary) {
            voucherSummary.innerHTML = appliedVoucher
                ? `<span class="checkout-voucher-applied">${appliedVoucher.code} applied</span>`
                : `<span class="text-muted small">No voucher applied</span>`;
        }

        const placeBtn = Utils.$('#btn-place-order');
        if (placeBtn) placeBtn.dataset.total = total;
    }

    function showVoucherModal() {
        const subtotal = cart.subtotal || cart.total;
        const listHtml = activeVouchers.length
            ? activeVouchers.map(v => `
                <button type="button" class="checkout-voucher-option ${appliedVoucher?.code === v.code ? 'is-selected' : ''} ${v.claimed ? 'is-used' : ''}" data-code="${v.code}" data-claimed="${v.claimed ? '1' : '0'}" ${v.claimed ? 'disabled' : ''}>
                    <div>
                        <span class="checkout-voucher-code">${v.code}</span>
                        <span class="checkout-voucher-desc">${v.description || ''}</span>
                    </div>
                    ${v.expiry ? `<span class="checkout-voucher-exp">Exp. ${v.expiry}</span>` : ''}
                </button>
            `).join('')
            : '<p class="text-muted small mb-0">No vouchers available right now.</p>';

        Modal.show({
            title: 'Available Vouchers',
            html: `
                <p class="text-muted small mb-3">Select a voucher or enter a code below.</p>
                <div class="checkout-voucher-modal-list mb-3">${listHtml}</div>
                <div class="d-flex gap-2">
                    <input type="text" id="voucher-modal-input" class="form-control" placeholder="Enter code" style="text-transform:uppercase;">
                    <button type="button" class="btn btn-outline-primary" id="btn-modal-apply-voucher" style="white-space:nowrap;">Apply</button>
                </div>
                <div id="voucher-modal-feedback" class="mt-2 small"></div>
            `,
            buttons: [
                { text: 'Remove voucher', action: 'remove', class: 'secondary' },
                { text: 'Done', action: 'close', class: 'primary' },
            ],
            onOpen: () => {
                Utils.$$('.checkout-voucher-option').forEach(el => {
                    if (el.dataset.claimed === '1') return;
                    el.addEventListener('click', async () => {
                        const code = el.dataset.code;
                        try {
                            appliedVoucher = await VouchersModule.validateVoucher(code, subtotal);
                            Utils.$('#voucher-modal-feedback').innerHTML = `<span style="color:#166534;">${appliedVoucher.message || 'Applied.'}</span>`;
                            renderSummary();
                        } catch (err) {
                            Utils.$('#voucher-modal-feedback').innerHTML = `<span style="color:#ef4444;">${err.message}</span>`;
                        }
                    });
                });

                Utils.$('#btn-modal-apply-voucher')?.addEventListener('click', async () => {
                    const code = Utils.$('#voucher-modal-input')?.value.trim();
                    const feedback = Utils.$('#voucher-modal-feedback');
                    if (!code) {
                        feedback.innerHTML = '<span style="color:#ef4444;">Enter a code.</span>';
                        return;
                    }
                    try {
                        appliedVoucher = await VouchersModule.validateVoucher(code, subtotal);
                        feedback.innerHTML = `<span style="color:#166534;">${appliedVoucher.message || 'Applied.'}</span>`;
                        renderSummary();
                    } catch (err) {
                        appliedVoucher = null;
                        feedback.innerHTML = `<span style="color:#ef4444;">${err.message}</span>`;
                        renderSummary();
                    }
                });
            },
            onRemove: () => {
                appliedVoucher = null;
                renderSummary();
                Modal.hide();
            },
        });
    }

    const store = CONFIG.STORE;
    const subtotal = cart.subtotal || cart.total;

    app.innerHTML = `
        <style>
            .checkout-page { max-width: 920px; padding-bottom: 48px; }
            .checkout-line { display: flex; justify-content: space-between; font-size: 0.9rem; margin-bottom: 8px; color: #475569; }
            .checkout-line-discount { color: #166534; }
            .checkout-line-total { font-weight: 600; color: #1e293b; font-size: 1rem; }
            .checkout-line-total span:last-child { color: var(--color-primary); }
            .checkout-divider { border: none; border-top: 1px solid var(--color-border); margin: 12px 0; }
            .checkout-item { display: flex; gap: 12px; padding-bottom: 14px; margin-bottom: 14px; border-bottom: 1px solid var(--color-border); }
            .checkout-item:last-child { border-bottom: none; margin-bottom: 0; padding-bottom: 0; }
            .checkout-item-img { width: 52px; height: 52px; object-fit: contain; border: 1px solid var(--color-border); border-radius: 8px; flex-shrink: 0; }
            .checkout-item-name { font-weight: 500; color: #1e293b; font-size: 0.95rem; }
            .checkout-item-meta { font-size: 0.8rem; color: #64748b; margin-top: 2px; }
            .checkout-item-price { font-weight: 500; font-size: 0.9rem; white-space: nowrap; }
            .checkout-voucher-applied { color: #166534; font-size: 0.85rem; font-weight: 500; }
            .checkout-voucher-option {
                display: flex; justify-content: space-between; align-items: center; width: 100%;
                text-align: left; padding: 12px 14px; margin-bottom: 8px;
                border: 1px solid var(--color-border); border-radius: 8px; background: #fff; cursor: pointer;
            }
            .checkout-voucher-option:hover:not(:disabled) { border-color: var(--color-primary); }
            .checkout-voucher-option.is-selected { border-color: var(--color-primary); background: #fef2f2; }
            .checkout-voucher-option.is-used { opacity: 0.5; cursor: not-allowed; }
            .checkout-voucher-code { display: block; font-weight: 600; font-size: 0.9rem; color: #1e293b; }
            .checkout-voucher-desc { display: block; font-size: 0.78rem; color: #64748b; }
            .checkout-voucher-exp { font-size: 0.75rem; color: #94a3b8; }
        </style>
        <div class="checkout-page container mt-4">
            <h1 class="page-section-title">Checkout</h1>
            <p class="page-section-sub">Review your order before placing</p>

            <div class="row">
                <div class="col-lg-7">
                    <div class="profile-panel mb-4">
                        <h5 class="mb-3" style="font-weight:600;font-size:1rem;">Your Items</h5>
                        ${cart.items.map(item => `
                            <div class="checkout-item">
                                <img src="${item.product.image_url || 'images/placeholder.png'}" alt="" class="checkout-item-img">
                                <div style="flex:1;min-width:0;">
                                    <div class="checkout-item-name">${item.product.name}</div>
                                    <div class="checkout-item-meta">${item.size || 'Regular'} · ${item.sugar || '100%'} sugar · ${item.ice || 'Normal'} ice</div>
                                    ${item.addons?.length ? `<div class="checkout-item-meta">+ ${item.addons.filter(a => a !== 'None').join(', ') || item.addons.join(', ')}</div>` : ''}
                                    <div class="checkout-item-meta">Qty ${item.quantity}</div>
                                </div>
                                <span class="checkout-item-price">${Utils.formatCurrency((item.unitPrice || item.product.price) * item.quantity)}</span>
                            </div>
                        `).join('')}
                    </div>

                    <div class="profile-panel mb-4">
                        <div class="d-flex justify-content-between align-items-center mb-2">
                            <h5 class="mb-0" style="font-weight:600;font-size:1rem;">Voucher</h5>
                            <button type="button" class="btn btn-sm btn-outline-primary" id="btn-open-vouchers">Choose voucher</button>
                        </div>
                        <p id="checkout-voucher-summary" class="mb-0"><span class="text-muted small">No voucher applied</span></p>
                    </div>

                    <div class="profile-panel mb-4">
                        <h5 class="mb-2" style="font-weight:600;font-size:1rem;">Loyalty Points</h5>
                        <p class="text-muted small mb-2">Balance: <strong>${AppState.user?.pts || 0} points</strong></p>
                        ${(AppState.user?.pts || 0) >= 100 ? `
                            <label class="d-flex align-items-center gap-2 mt-1" style="font-size:0.9rem;cursor:pointer;">
                                <input type="checkbox" id="use-points-checkbox">
                                <span>Use 100 points for ₱90 off</span>
                            </label>
                        ` : `<p class="text-muted small mb-0">Need ${100 - (AppState.user?.pts || 0)} more points to redeem.</p>`}
                    </div>

                    <div class="profile-panel">
                        <h5 class="mb-2" style="font-weight:600;font-size:1rem;">Pickup at Store</h5>
                        <p class="mb-1" style="font-size:0.9rem;"><strong>${store.name}</strong></p>
                        <p class="text-muted small mb-2">${store.address}</p>
                        <p class="text-muted small mb-0">${store.hours}</p>
                        <p class="text-muted small mt-2 mb-0">Payment: Cash on pickup at the counter.</p>
                    </div>
                </div>

                <div class="col-lg-5">
                    <div class="profile-panel" style="position:sticky; top:80px;">
                        <h5 class="mb-3" style="font-weight:600;font-size:1rem;">Order Summary</h5>
                        <div id="checkout-summary"></div>
                        <button class="btn btn-primary btn-block py-2 mt-4" id="btn-place-order" data-total="${subtotal}">Place Order</button>
                        <a href="#/cart" class="btn btn-light btn-block mt-2">Back to Cart</a>
                    </div>
                </div>
            </div>
        </div>
    `;

    renderSummary();

    Utils.$('#btn-open-vouchers')?.addEventListener('click', showVoucherModal);

    const ptsCheckbox = Utils.$('#use-points-checkbox');
    if (ptsCheckbox) {
        ptsCheckbox.addEventListener('change', (e) => {
            usePoints = e.target.checked;
            renderSummary();
        });
    }

    Utils.$('#btn-place-order').addEventListener('click', async () => {
        try {
            Loader.show();
            const finalTotal = parseFloat(Utils.$('#btn-place-order').dataset.total);
            const result = await OrdersModule.placeOrder({
                cust_id: AppState.user.id,
                items: cart.items.map(item => ({
                    product_id: item.product.id,
                    quantity: item.quantity,
                    size: item.size || 'Regular',
                    sugar_level: item.sugar || '100%',
                    ice_level: item.ice || 'Normal',
                    addons: item.addons || [],
                    unit_price: item.unitPrice || item.product.price,
                })),
                subtotal: cart.subtotal || cart.total,
                voucher_code: appliedVoucher ? appliedVoucher.code : null,
                use_points: usePoints,
                discount: getDiscount(cart.subtotal || cart.total),
                total: finalTotal,
                payment_method: 'cash_on_pickup',
            });

            CartModule.clearCart();

            app.innerHTML = `
                <div class="container mt-4 text-center" style="max-width:560px; margin:48px auto; padding-bottom:48px;">
                    <h2 class="page-section-title">Order Placed</h2>
                    <p class="text-muted">Reference: <strong>${result.order_qr || result.order_id}</strong></p>
                    <div id="checkout-qrcode" style="display:inline-block; margin:20px 0; padding:12px; border:1px solid var(--color-border);"></div>

                    <div class="profile-panel text-left mt-4">
                        <h5 class="mb-3" style="font-weight:600;font-size:1rem;">What happens next</h5>
                        <ol class="instructions-list" style="font-size:0.9rem;color:#475569;">
                            <li>Your order is sent to the store and enters the queue.</li>
                            <li>Pay at the counter when you pick up (cash on pickup).</li>
                            <li>Show your QR code to staff when collecting your order.</li>
                            <li>You will be notified when your order is ready for pickup.</li>
                        </ol>
                        <div class="pickup-location-box mt-3" style="font-size:0.88rem;">
                            <strong>Pickup location</strong><br>
                            ${store.name}<br>
                            ${store.address}, ${store.city}<br>
                            ${store.hours}
                        </div>
                    </div>

                    <div class="mt-4 d-flex justify-content-center gap-2 flex-wrap">
                        <a href="#/orders" class="btn btn-primary">Track My Order</a>
                        <a href="#/products" class="btn btn-light">Order More</a>
                    </div>
                </div>
            `;

            setTimeout(() => {
                const qrContainer = document.getElementById('checkout-qrcode');
                if (qrContainer && typeof QRCode !== 'undefined') {
                    new QRCode(qrContainer, {
                        text: String(result?.order_qr || result?.order_id),
                        width: 160,
                        height: 160,
                        correctLevel: QRCode.CorrectLevel.H,
                    });
                }
            }, 50);

            OrdersModule.requestNotificationPermission();

        } catch (error) {
            Toast.error(error.message || 'Failed to place order. Please try again.');
        } finally {
            Loader.hide();
        }
    });
}
