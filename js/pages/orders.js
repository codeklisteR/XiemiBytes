/**
 * Orders Page Handler
 */

async function OrdersPage() {
    const app = Utils.$('#app');

    try {
        Loader.show();
        const orders = await OrdersModule.getOrders();
        
        app.innerHTML = `
            <div class="orders-page fade-in container mt-4">
                <h1>Your Orders</h1>
                <div class="orders-list mt-3">
                    ${orders.length === 0 ? '<p>You have no orders yet.</p>' : 
                        orders.map(order => `
                        <div class="order-card card mb-3 p-3">
                            <div class="order-header d-flex justify-content-between align-items-center">
                                <div>
                                    <span class="order-id">#${order.id}</span>
                                    <span class="order-date ml-2">${order.date}</span>
                                </div>
                                <span class="order-status badge badge-${order.status.toLowerCase()}">${order.status}</span>
                            </div>
                            <hr>
                            <div class="order-items">
                                ${order.items.map(item => `
                                    <div class="order-item d-flex justify-content-between">
                                        <span>${item.quantity}x ${item.name}</span>
                                        <span>${Utils.formatCurrency(item.price * item.quantity)}</span>
                                    </div>
                                `).join('')}
                            </div>
                            <hr>
                            <div class="order-footer d-flex justify-content-between font-weight-bold">
                                <span>Total</span>
                                <span>${Utils.formatCurrency(order.total)}</span>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    } catch (error) {
        app.innerHTML = `<div class="container mt-4"><p class="text-danger">Failed to load orders.</p></div>`;
    } finally {
        Loader.hide();
    }
}
