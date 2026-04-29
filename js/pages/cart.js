/**
 * Cart Page Handler
 */

async function CartPage() {
    const app = Utils.$('#app');

    const renderCart = () => {
        const { cart } = AppState;

        if (!cart || cart.items.length === 0) {
            app.innerHTML = `
                <div class="cart-page fade-in container mt-4 text-center">
                    <h2>Your Cart is Empty</h2>
                    <p class="mt-2 text-light">Looks like you haven't added anything to your cart yet.</p>
                    <a href="#/products" class="btn btn-primary mt-3">Browse Products</a>
                </div>
            `;
            return;
        }

        app.innerHTML = `
            <div class="cart-page fade-in container mt-4">
                <h2>Shopping Cart</h2>
                <div class="cart-layout" style="display: flex; gap: 30px; margin-top: 20px; flex-wrap: wrap;">
                    
                    <!-- Cart Items -->
                    <div class="cart-items" style="flex: 2; min-width: 300px;">
                        ${cart.items.map(item => `
                            <div class="cart-item card" style="display: flex; gap: 20px; padding: 15px; margin-bottom: 15px; align-items: center; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); background: white;">
                                <img src="${item.product.image_url || 'images/placeholder.png'}" alt="${item.product.name}" style="width: 80px; height: 80px; object-fit: cover; border-radius: 8px;">
                                <div class="item-details" style="flex: 1;">
                                    <h4 style="margin-bottom: 5px;">${item.product.name}</h4>
                                    ${(item.size || (item.options && item.options.size)) ? `<p style="font-size: 0.85rem; color: #666; margin-bottom: 4px;">Size: ${item.size || item.options.size} <br> Sugar: ${item.sugar || item.options.sugar} <br> Ice: ${item.ice || item.options.ice}</p>` : ''}
                                    <p class="price" style="color: var(--color-primary); font-weight: 600;">${Utils.formatCurrency(item.product.price)}</p>
                                </div>
                                <div class="item-actions" style="display: flex; align-items: center; gap: 10px;">
                                    <button class="btn btn-secondary btn-sm btn-decrease" data-id="${item.product.id}">-</button>
                                    <span style="font-weight: bold; width: 20px; text-align: center;">${item.quantity}</span>
                                    <button class="btn btn-secondary btn-sm btn-increase" data-id="${item.product.id}">+</button>
                                </div>
                                <button class="btn btn-danger btn-remove" data-id="${item.product.id}" style="background: #dc3545; color: white; padding: 5px 10px; border-radius: 4px; border: none; cursor: pointer;">Remove</button>
                            </div>
                        `).join('')}
                    </div>

                    <!-- Cart Summary -->
                    <div class="cart-summary card" style="flex: 1; min-width: 300px; padding: 20px; background: white; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); height: fit-content;">
                        <h3>Order Summary</h3>
                        <div style="display: flex; justify-content: space-between; margin-top: 15px;">
                            <span>Subtotal</span>
                            <span>${Utils.formatCurrency(cart.total)}</span>
                        </div>
                        <div style="display: flex; justify-content: space-between; margin-top: 10px;">
                            <span>Tax (8%)</span>
                            <span>${Utils.formatCurrency(cart.total * 0.08)}</span>
                        </div>
                        <hr style="margin: 15px 0; border: none; border-top: 1px solid var(--color-border);">
                        <div style="display: flex; justify-content: space-between; font-weight: bold; font-size: 1.2rem;">
                            <span>Total</span>
                            <span>${Utils.formatCurrency(cart.total * 1.08)}</span>
                        </div>
                        <button class="btn btn-primary btn-block mt-3" id="btn-checkout">Proceed to Checkout</button>
                    </div>
                </div>
            </div>
        `;

        attachCartListeners();
    };

    const attachCartListeners = () => {
        // Increase Quantity
        document.querySelectorAll('.btn-increase').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const productId = e.target.dataset.id;
                const item = AppState.cart.items.find(i => i.product.id == productId);
                if (item) {
                    CartModule.updateQuantity(productId, item.quantity + 1);
                    renderCart();
                }
            });
        });

        // Decrease Quantity
        document.querySelectorAll('.btn-decrease').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const productId = e.target.dataset.id;
                const item = AppState.cart.items.find(i => i.product.id == productId);
                if (item && item.quantity > 1) {
                    CartModule.updateQuantity(productId, item.quantity - 1);
                    renderCart();
                }
            });
        });

        // Remove Item
        document.querySelectorAll('.btn-remove').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const productId = e.target.dataset.id;
                CartModule.removeProduct(productId);
                renderCart();
            });
        });

        // Checkout Button
        const checkoutBtn = document.getElementById('btn-checkout');
        if (checkoutBtn) {
            checkoutBtn.addEventListener('click', () => {
                ROUTER.navigate('/checkout');
            });
        }
    };

    renderCart();
}
