/**
 * Checkout Page Handler
 */

async function CheckoutPage() {
    const app = Utils.$('#app');
    const { cart } = AppState;

    if (!cart || cart.items.length === 0) {
        ROUTER.navigate('/cart');
        return;
    }

    app.innerHTML = `
        <div class="checkout-page fade-in container mt-4">
            <h1>Checkout</h1>
            <div class="row mt-3">
                <div class="col-md-8">
                    <div class="card p-4">
                        <h3>Delivery Details</h3>
                        <form id="checkout-form" class="mt-3">
                            <div class="form-group">
                                <label>Delivery Address</label>
                                <textarea class="form-control" placeholder="123 Main St, City" required></textarea>
                            </div>
                            <div class="form-group">
                                <label>Payment Method</label>
                                <select class="form-control">
                                    <option value="cod">Cash on Delivery</option>
                                    <option value="card">Credit/Debit Card</option>
                                    <option value="gcash">GCash</option>
                                </select>
                            </div>
                            <button type="submit" class="btn btn-primary btn-block mt-4">Place Order</button>
                        </form>
                    </div>
                </div>
                <div class="col-md-4">
                    <div class="card p-3">
                        <h3>Summary</h3>
                        <hr>
                        <div class="d-flex justify-content-between">
                            <span>Subtotal</span>
                            <span>${Utils.formatCurrency(cart.total)}</span>
                        </div>
                        <div class="d-flex justify-content-between">
                            <span>Delivery Fee</span>
                            <span>₱0.00</span>
                        </div>
                        <hr>
                        <div class="d-flex justify-content-between font-weight-bold">
                            <span>Total</span>
                            <span>${Utils.formatCurrency(cart.total)}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;

    const form = Utils.$('#checkout-form');
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        try {
            Loader.show();
            const result = await OrdersModule.placeOrder({
                items: cart.items,
                total: cart.total
            });
            
            CartModule.clearCart();
            app.innerHTML = `
                <div class="text-center mt-5">
                    <div class="success-icon" style="font-size: 5rem; color: #28a745;">✓</div>
                    <h2>Thank you for your order!</h2>
                    <p class="mt-2">Order ID: ${result.order_id}</p>
                    <a href="#/orders" class="btn btn-primary mt-3">View My Orders</a>
                </div>
            `;
        } catch (error) {
            Toast.show('Failed to place order', 'error');
        } finally {
            Loader.hide();
        }
    });
}
