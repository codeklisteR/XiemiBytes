/**
 * Checkout Page Handler
 * Cash on Pickup only — customer picks up at store
 * Supports voucher code redemption
 */

async function CheckoutPage() {
    const app = Utils.$('#app');
    const { cart } = AppState;

    if (!cart || cart.items.length === 0) {
        ROUTER.navigate('/cart');
        return;
    }

    let appliedVoucher = null;

    function getDiscount(subtotal) {
        if (!appliedVoucher) return 0;
        if (appliedVoucher.type === 'percentage') return subtotal * (appliedVoucher.discount / 100);
        if (appliedVoucher.type === 'fixed') return appliedVoucher.discount;
        return 0;
    }

    function renderSummary() {
        const subtotal = cart.subtotal || cart.total;
        const discount = getDiscount(subtotal);
        const total = Math.max(0, subtotal - discount);

        const summaryEl = Utils.$('#checkout-summary');
        if (!summaryEl) return;

        summaryEl.innerHTML = `
            <div class="d-flex justify-content-between mb-2">
                <span class="text-muted">Items (${cart.items.reduce((c, i) => c + i.quantity, 0)})</span>
                <span class="font-weight-bold">${Utils.formatCurrency(subtotal)}</span>
            </div>
            ${appliedVoucher ? `
                <div class="d-flex justify-content-between mb-2" style="color: #16a34a;">
                    <span class="font-weight-bold">Voucher (${appliedVoucher.code})</span>
                    <span class="font-weight-bold">-${Utils.formatCurrency(discount)}</span>
                </div>
            ` : ''}
            <div class="d-flex justify-content-between mb-4">
                <span class="text-muted">Delivery</span>
                <span class="font-weight-bold" style="color: #16a34a;">Free (Pickup)</span>
            </div>
            <hr style="margin: 0 0 16px; border-color: #e2e8f0;">
            <div class="d-flex justify-content-between">
                <span class="font-weight-bold" style="font-size: 1.1rem; color: #1e293b;">Total</span>
                <span class="font-weight-bold" style="font-size: 1.4rem; color: var(--color-primary);">${Utils.formatCurrency(total)}</span>
            </div>
        `;

        const placeBtn = Utils.$('#btn-place-order');
        if (placeBtn) placeBtn.dataset.total = total;
    }

    const subtotal = cart.subtotal || cart.total;

    app.innerHTML = `
        <div class="checkout-page fade-in container mt-4" style="max-width: 920px;">
            <h1 class="font-weight-bold mb-1" style="color: #1e293b;">Checkout</h1>
            <p class="text-muted mb-4">Review your order and confirm pickup details</p>

            <div class="row">
                <!-- Left -->
                <div class="col-md-7">

                    <!-- Order Items -->
                    <div class="card p-4 mb-4" style="border-radius: 16px; border: 1px solid #e2e8f0;">
                        <h5 class="font-weight-bold mb-3" style="color: #1e293b;">Your Items</h5>
                        ${cart.items.map(item => `
                            <div class="d-flex justify-content-between align-items-center mb-3 pb-3 border-bottom">
                                <div class="d-flex align-items-center gap-3">
                                    <img src="${item.product.image_url || 'images/placeholder.png'}" style="width: 52px; height: 52px; object-fit: cover; border-radius: 10px; background: #f8fafc; flex-shrink:0;">
                                    <div>
                                        <div class="font-weight-bold" style="color: #1e293b;">${item.product.name}</div>
                                        <div class="text-muted" style="font-size:0.75rem;">
                                            ${item.size || 'Regular'}
                                            ${item.sugar ? ' · ' + item.sugar + ' sugar' : ''}
                                            ${item.ice ? ' · ' + item.ice + ' ice' : ''}
                                            ${item.addons && item.addons.length > 0 ? ' · ' + item.addons.join(', ') : ''}
                                        </div>
                                        <div class="text-muted small">Qty: ${item.quantity}</div>
                                    </div>
                                </div>
                                <span class="font-weight-bold">${Utils.formatCurrency((item.unitPrice || item.product.price) * item.quantity)}</span>
                            </div>
                        `).join('')}
                    </div>

                    <!-- Voucher -->
                    <div class="card p-4 mb-4" style="border-radius: 16px; border: 1px solid #e2e8f0;">
                        <h5 class="font-weight-bold mb-3" style="color: #1e293b;">Apply Voucher</h5>
                        <div class="d-flex gap-2" style="gap: 10px;">
                            <input type="text" id="voucher-input" class="form-control" placeholder="Enter voucher code (e.g. WELCOME20)" style="border-radius: 10px; text-transform: uppercase;">
                            <button class="btn btn-outline-primary" id="btn-apply-voucher" style="border-radius: 10px; white-space: nowrap; font-weight: 700; padding: 0 20px;">Apply</button>
                        </div>
                        <div id="voucher-feedback" class="mt-2 small"></div>
                        <p class="text-muted small mt-2 mb-0">Try: <code>WELCOME20</code> (20% off) or <code>MILKTEALOVE</code> (₱50 off)</p>
                    </div>

                    <!-- Pickup Info -->
                    <div class="card p-4" style="border-radius: 16px; border: 1px solid #e2e8f0; background: #f8fafc;">
                        <h5 class="font-weight-bold mb-3" style="color: #1e293b;">Pickup Location</h5>
                        <div>
                            <div class="font-weight-bold" style="color: #1e293b; font-size: 1rem;">XiemiBytes</div>
                            <div class="text-muted small mt-1">123 Bubble Tea Street, Brgy. Maligaya</div>
                            <div class="text-muted small">Quezon City, Metro Manila 1100</div>
                            <div class="mt-2 small font-weight-bold" style="color: var(--color-primary);">Mon–Sun: 9:00 AM – 9:00 PM</div>
                        </div>
                        <div class="mt-3 p-3 rounded" style="background: #fff7ed; border: 1px solid #fed7aa; border-radius: 10px;">
                            <div class="small font-weight-bold" style="color: #92400e;">Cash on Pickup</div>
                            <div class="small text-muted mt-1">Please prepare the exact amount or bring change. Payment is collected at the counter.</div>
                        </div>
                    </div>
                </div>

                <!-- Right: Summary -->
                <div class="col-md-5">
                    <div class="card p-4" style="border-radius: 16px; border: 1px solid #e2e8f0; position: sticky; top: 20px;">
                        <h5 class="font-weight-bold mb-4" style="color: #1e293b;">Order Summary</h5>
                        <div id="checkout-summary"></div>

                        <button class="btn btn-primary btn-block py-3 mt-4" id="btn-place-order" data-total="${subtotal}" style="border-radius: 12px; font-weight: 800; font-size: 1rem;">
                            Place Order
                        </button>
                        <a href="#/cart" class="btn btn-light btn-block mt-2" style="border-radius: 12px; font-weight: 600;">
                            Back to Cart
                        </a>
                    </div>
                </div>
            </div>
        </div>
    `;

    // Initial summary render
    renderSummary();

    // Voucher apply
    Utils.$('#btn-apply-voucher').addEventListener('click', async () => {
        const code = Utils.$('#voucher-input').value.trim();
        const feedback = Utils.$('#voucher-feedback');
        if (!code) { feedback.innerHTML = '<span style="color:#ef4444;">Please enter a voucher code.</span>'; return; }

        const btn = Utils.$('#btn-apply-voucher');
        btn.disabled = true;
        btn.textContent = 'Checking...';

        try {
            const result = await VouchersModule.validateVoucher(code);
            appliedVoucher = result;
            feedback.innerHTML = `<span style="color:#16a34a; font-weight:600;">Applied: ${result.message}</span>`;
            Toast.success(result.message);
            renderSummary();
        } catch (e) {
            feedback.innerHTML = `<span style="color:#ef4444;">${e.message || 'Invalid voucher.'}</span>`;
            appliedVoucher = null;
            renderSummary();
        } finally {
            btn.disabled = false;
            btn.textContent = 'Apply';
        }
    });

    // Place order
    Utils.$('#btn-place-order').addEventListener('click', async () => {
        try {
            Loader.show();
            const finalTotal = parseFloat(Utils.$('#btn-place-order').dataset.total);
            const result = await OrdersModule.placeOrder({
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
                discount: appliedVoucher ? getDiscount(cart.subtotal || cart.total) : 0,
                total: finalTotal,
                payment_method: 'cash_on_pickup',
            });

            CartModule.clearCart();
            app.innerHTML = `
                <div class="fade-in container mt-4" style="max-width: 520px; margin: 60px auto; text-align: center;">
                    <div style="width: 80px; height: 80px; background: #dcfce7; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 24px;">
                        <svg width="36" height="36" fill="none" stroke="#16a34a" stroke-width="2.5" viewBox="0 0 24 24"><path d="M20 6L9 17l-5-5"/></svg>
                    </div>
                    <h2 class="font-weight-bold" style="color: #1e293b;">Order Placed!</h2>
                    <p class="text-muted mt-2">Your order has been received. Please pick it up at the store.</p>
                    <div class="card mt-4 p-4" style="border-radius: 16px; border: 1px solid #e2e8f0;">
                        <div class="text-muted small">Order Reference</div>
                        <div class="h3 font-weight-bold mt-1 mb-1" style="color: var(--color-primary);">${result.order_id}</div>
                        <div class="text-muted small">Show this to the staff at the counter</div>
                    </div>
                    <div class="mt-4 d-flex justify-content-center" style="gap: 12px;">
                        <a href="#/orders" class="btn btn-primary px-4" style="border-radius: 10px;">View My Orders</a>
                        <a href="#/products" class="btn btn-light px-4" style="border-radius: 10px;">Order More</a>
                    </div>
                </div>
            `;
        } catch (error) {
            Toast.error('Failed to place order. Please try again.');
        } finally {
            Loader.hide();
        }
    });
}
