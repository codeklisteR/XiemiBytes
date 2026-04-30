/**
 * Cart Page Handler
 */

async function CartPage() {
    const app = Utils.$('#app');

    // Gate: not logged in
    if (!AppState.isLoggedIn()) {
        app.innerHTML = `
            <div class="fade-in container mt-4" style="max-width: 480px; margin: 100px auto; text-align: center;">
                <div style="width: 72px; height: 72px; background: #f1f5f9; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 20px;">
                    <svg width="32" height="32" fill="none" stroke="#94a3b8" stroke-width="2" viewBox="0 0 24 24"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
                </div>
                <h3 class="font-weight-bold mb-2" style="color:#1e293b;">Sign in to view your cart</h3>
                <p class="text-muted mb-4" style="font-size: 0.95rem;">You need to be logged in to add items and place orders. It only takes a moment!</p>
                <a href="#/login" class="btn btn-primary px-5 py-2" style="border-radius:10px; font-weight:700;">Sign In to Continue</a>
            </div>
        `;
        return;
    }

    const renderCart = () => {
        const { cart } = AppState;

        if (!cart || cart.items.length === 0) {
            app.innerHTML = `
                <div class="fade-in container mt-4" style="max-width: 520px; margin: 80px auto; text-align: center;">
                    <div style="width: 80px; height: 80px; background: #f1f5f9; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 24px; font-size: 2.2rem;">
                        <svg width="36" height="36" fill="none" stroke="#94a3b8" stroke-width="2" viewBox="0 0 24 24"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
                    </div>
                    <h2 class="font-weight-bold mb-2" style="color:#1e293b;">Your cart is empty</h2>
                    <p class="text-muted mb-4">Looks like you haven't added anything yet. Start adding your favorite drinks!</p>
                    <a href="#/products" class="btn btn-primary px-5 py-2" style="border-radius:10px; font-weight:700;">Browse Menu</a>
                </div>
            `;
            return;
        }

        const subtotal = cart.subtotal || cart.total;

        app.innerHTML = `
            <div class="cart-page fade-in container mt-4" style="max-width: 1000px;">
                <div class="d-flex justify-content-between align-items-center mb-4">
                    <div>
                        <h1 class="font-weight-bold mb-1" style="color: #1e293b;">Shopping Cart</h1>
                        <p class="text-muted small mb-0">${cart.items.length} item(s) in your cart</p>
                    </div>
                    <a href="#/products" class="btn btn-light px-4" style="border-radius:10px; font-weight:600; border: 1px solid #e2e8f0;">
                        + Add More Items
                    </a>
                </div>

                <div class="cart-layout" style="display: flex; gap: 28px; flex-wrap: wrap;">

                    <!-- Cart Items -->
                    <div class="cart-items" style="flex: 2; min-width: 300px;">
                        ${cart.items.map(item => `
                            <div class="cart-item" style="display: flex; gap: 16px; padding: 16px; margin-bottom: 12px; align-items: center; border-radius: 14px; border: 1px solid #e2e8f0; background: white;">
                                <img src="${item.product.image_url || 'images/placeholder.png'}" alt="${item.product.name}" style="width: 72px; height: 72px; object-fit: cover; border-radius: 10px; flex-shrink: 0; background: #f8fafc;">

                                <div style="flex: 1; min-width: 0;">
                                    <div class="font-weight-bold" style="color: #1e293b; margin-bottom: 4px; font-size: 1rem;">${item.product.name}</div>
                                    <div style="font-size: 0.78rem; color: #94a3b8; line-height: 1.7;">
                                        <span>Size: ${item.size || 'Regular'}</span>
                                        &nbsp;&middot;&nbsp;<span>Sugar: ${item.sugar || '100%'}</span>
                                        &nbsp;&middot;&nbsp;<span>Ice: ${item.ice || 'Normal'}</span>
                                        ${item.addons && item.addons.length > 0 ? `<br>Add-ons: <span style="color:#64748b; font-weight:600;">${item.addons.join(', ')}</span>` : ''}
                                    </div>
                                    <div class="mt-1" style="color: var(--color-primary); font-weight: 700; font-size: 0.9rem;">${Utils.formatCurrency(item.unitPrice || item.product.price)} each</div>
                                </div>

                                <div style="display: flex; flex-direction: column; align-items: flex-end; gap: 10px; flex-shrink: 0;">
                                    <span style="font-weight: 800; font-size: 1.05rem; color: #1e293b;">${Utils.formatCurrency((item.unitPrice || item.product.price) * item.quantity)}</span>

                                    <div style="display: flex; align-items: center; gap: 0; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
                                        <button class="btn-cart-action btn-decrease" data-item-id="${item.id}" style="width:34px; height:34px; border:none; background:white; cursor:pointer; font-size:1.1rem; font-weight:700; color:#64748b;">-</button>
                                        <span style="width:34px; text-align:center; font-weight:700; color:#1e293b;">${item.quantity}</span>
                                        <button class="btn-cart-action btn-increase" data-item-id="${item.id}" style="width:34px; height:34px; border:none; background:white; cursor:pointer; font-size:1.1rem; font-weight:700; color:#64748b;">+</button>
                                    </div>

                                    <button class="btn-cart-remove" data-item-id="${item.id}" style="font-size: 0.75rem; color: #ef4444; background: none; border: none; cursor: pointer; text-decoration: underline; padding: 0;">Remove</button>
                                </div>
                            </div>
                        `).join('')}
                    </div>

                    <!-- Order Summary -->
                    <div style="flex: 1; min-width: 280px;">
                        <div style="background: white; border-radius: 16px; padding: 24px; border: 1px solid #e2e8f0; position: sticky; top: 20px;">
                            <h4 class="font-weight-bold mb-4" style="color: #1e293b;">Order Summary</h4>

                            <div class="d-flex justify-content-between mb-2">
                                <span class="text-muted">Subtotal</span>
                                <span class="font-weight-bold">${Utils.formatCurrency(subtotal)}</span>
                            </div>
                            <div class="d-flex justify-content-between mb-3">
                                <span class="text-muted">Delivery</span>
                                <span class="font-weight-bold" style="color: #16a34a;">Free (Pickup)</span>
                            </div>
                            <hr style="margin: 12px 0; border-color: #e2e8f0;">
                            <div class="d-flex justify-content-between mb-4">
                                <span class="font-weight-bold" style="font-size: 1.1rem;">Total</span>
                                <span class="font-weight-bold" style="font-size: 1.3rem; color: var(--color-primary);">${Utils.formatCurrency(subtotal)}</span>
                            </div>

                            <button class="btn btn-primary btn-block py-3" id="btn-checkout" style="border-radius:12px; font-weight:800; font-size:1rem;">
                                Proceed to Checkout
                            </button>
                            <a href="#/products" class="btn btn-light btn-block mt-2" style="border-radius:12px; font-weight:600;">
                                Continue Shopping
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        `;

        attachCartListeners();
    };

    const attachCartListeners = () => {
        // Increase
        document.querySelectorAll('.btn-increase').forEach(btn => {
            btn.addEventListener('click', () => {
                const itemId = btn.dataset.itemId;
                const item = AppState.cart.items.find(i => i.id === itemId);
                if (item) {
                    AppState.updateCartItem(itemId, { quantity: item.quantity + 1 });
                    renderCart();
                }
            });
        });

        // Decrease
        document.querySelectorAll('.btn-decrease').forEach(btn => {
            btn.addEventListener('click', () => {
                const itemId = btn.dataset.itemId;
                const item = AppState.cart.items.find(i => i.id === itemId);
                if (item) {
                    if (item.quantity > 1) {
                        AppState.updateCartItem(itemId, { quantity: item.quantity - 1 });
                    } else {
                        AppState.removeFromCart(itemId);
                    }
                    renderCart();
                }
            });
        });

        // Remove
        document.querySelectorAll('.btn-cart-remove').forEach(btn => {
            btn.addEventListener('click', () => {
                const itemId = btn.dataset.itemId;
                AppState.removeFromCart(itemId);
                HeaderComponent.updateCartBadge();
                renderCart();
            });
        });

        // Checkout
        const checkoutBtn = document.getElementById('btn-checkout');
        if (checkoutBtn) {
            checkoutBtn.addEventListener('click', () => ROUTER.navigate('/checkout'));
        }
    };

    renderCart();
}
