/**
 * Admin Orders Management Page
 */
async function AdminOrdersPage() {
    const app = Utils.$('#app');

    try {
        Loader.show();
        // Use External Mock Data
        const orders = MOCK_ORDERS;

        app.innerHTML = `
            <div class="admin-orders fade-in container mt-4">
                <div class="d-flex justify-content-between align-items-center mb-4">
                    <h1>Order Management</h1>
                    <div class="filters">
                        <select class="form-control form-control-sm">
                            <option>All Status</option>
                            <option>Preparing</option>
                            <option>Ready</option>
                            <option>Completed</option>
                        </select>
                    </div>
                </div>

                <div class="card overflow-hidden">
                    <table class="admin-table" style="width: 100%;">
                        <thead>
                            <tr>
                                <th class="p-4">Order ID</th>
                                <th class="p-4">Customer</th>
                                <th class="p-4">Total</th>
                                <th class="p-4">Date</th>
                                <th class="p-4">Status</th>
                                <th class="p-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${orders.map(order => `
                                <tr style="border-bottom: 1px solid #f1f5f9;">
                                    <td class="p-4"><strong>${order.id}</strong></td>
                                    <td class="p-4">${order.customer}</td>
                                    <td class="p-4" style="color: var(--color-primary); font-weight: 600;">${Utils.formatCurrency(order.total)}</td>
                                    <td class="p-4"><small class="text-muted">${Utils.formatDateTime(order.date)}</small></td>
                                    <td class="p-4">
                                        <select class="form-control form-control-sm status-select badge-${order.status}" data-id="${order.id}" style="width: auto; border: none; cursor: pointer;">
                                            <option value="confirmed" ${order.status === 'confirmed' ? 'selected' : ''}>Confirmed</option>
                                            <option value="preparing" ${order.status === 'preparing' ? 'selected' : ''}>Preparing</option>
                                            <option value="ready_for_pickup" ${order.status === 'ready_for_pickup' ? 'selected' : ''}>Ready</option>
                                            <option value="completed" ${order.status === 'completed' ? 'selected' : ''}>Completed</option>
                                            <option value="cancelled" ${order.status === 'cancelled' ? 'selected' : ''}>Cancelled</option>
                                        </select>
                                    </td>
                                    <td class="p-4 text-right">
                                        <button class="btn btn-sm btn-outline-secondary view-details" data-id="${order.id}">Details</button>
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        `;

        // Add event listeners for status changes
        Utils.$$('.status-select').forEach(select => {
            select.addEventListener('change', (e) => {
                const orderId = e.target.dataset.id;
                const newStatus = e.target.value;
                
                // Update class for coloring
                e.target.className = `form-control form-control-sm status-select badge-${newStatus}`;
                
                Toast.success(`Order ${orderId} status: ${newStatus.replace(/_/g, ' ')}`);
            });
        });

        // Add event listeners for details button
        Utils.$$('.view-details').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const orderId = btn.dataset.id;
                const order = orders.find(o => o.id === orderId);
                showOrderDetails(order);
            });
        });

    } catch (error) {
        Utils.error('Failed to load orders:', error);
    } finally {
        Loader.hide();
    }
}

function showOrderDetails(order) {
    Modal.show({
        title: `Order Details: ${order.id}`,
        html: `
            <div class="p-2">
                <div class="d-flex justify-content-between mb-3 pb-2 border-bottom">
                    <div>
                        <p class="mb-0 text-muted small">Customer</p>
                        <h4 class="mb-0">${order.customer}</h4>
                    </div>
                    <div class="text-right">
                        <p class="mb-0 text-muted small">Date</p>
                        <p class="mb-0">${Utils.formatDateTime(order.date)}</p>
                    </div>
                </div>

                <div class="mb-4">
                    <p class="font-weight-bold mb-2">Order Items</p>
                    <div class="p-3 bg-light rounded">
                        <div class="d-flex justify-content-between mb-1">
                            <span>Classic Milk Tea (L) x2</span>
                            <span>₱180.00</span>
                        </div>
                        <div class="d-flex justify-content-between mb-1">
                            <span>Okinawa Milk Tea (R) x1</span>
                            <span>₱100.00</span>
                        </div>
                        <div class="d-flex justify-content-between pt-2 mt-2 border-top">
                            <strong>Total Amount</strong>
                            <strong class="text-primary">${Utils.formatCurrency(order.total)}</strong>
                        </div>
                    </div>
                </div>

                <div>
                    <p class="font-weight-bold mb-2">Internal Notes</p>
                    <textarea class="form-control" rows="2" placeholder="Add a note..."></textarea>
                </div>
            </div>
        `,
        buttons: [
            { text: 'Close', action: 'close', class: 'secondary' },
            { text: 'Print Receipt', action: 'print', class: 'primary' }
        ],
        onPrint: () => {
            Toast.show('Generating receipt...');
        }
    });
}
