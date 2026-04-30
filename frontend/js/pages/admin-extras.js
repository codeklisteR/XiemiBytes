/**
 * Admin Orders Management Page
 */
async function AdminOrdersPage() {
    const app = Utils.$('#app');

    try {
        Loader.show();
        // Mock data for orders
        const orders = [
            { id: 'ORD-1001', customer: 'Juan Dela Cruz', total: 450.00, status: 'preparing', date: '2024-04-29T10:30:00' },
            { id: 'ORD-1002', customer: 'Maria Clara', total: 120.00, status: 'ready_for_pickup', date: '2024-04-29T11:15:00' },
            { id: 'ORD-1003', customer: 'Jose Rizal', total: 890.00, status: 'confirmed', date: '2024-04-29T11:45:00' },
            { id: 'ORD-1004', customer: 'Andres Bonifacio', total: 320.00, status: 'completed', date: '2024-04-28T15:20:00' },
        ];

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
                    <table class="admin-table" style="width: 100%; border-collapse: collapse;">
                        <thead style="background: #f9fafb; border-bottom: 1px solid #e5e7eb;">
                            <tr>
                                <th class="p-3 text-left">Order ID</th>
                                <th class="p-3 text-left">Customer</th>
                                <th class="p-3 text-left">Total</th>
                                <th class="p-3 text-left">Date</th>
                                <th class="p-3 text-left">Status</th>
                                <th class="p-3 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${orders.map(order => `
                                <tr style="border-bottom: 1px solid #f3f4f6;">
                                    <td class="p-3"><strong>${order.id}</strong></td>
                                    <td class="p-3">${order.customer}</td>
                                    <td class="p-3">${Utils.formatCurrency(order.total)}</td>
                                    <td class="p-3"><small>${Utils.formatDateTime(order.date)}</small></td>
                                    <td class="p-3">
                                        <select class="form-control form-control-sm status-select" data-id="${order.id}" style="width: auto;">
                                            <option value="confirmed" ${order.status === 'confirmed' ? 'selected' : ''}>Confirmed</option>
                                            <option value="preparing" ${order.status === 'preparing' ? 'selected' : ''}>Preparing</option>
                                            <option value="ready_for_pickup" ${order.status === 'ready_for_pickup' ? 'selected' : ''}>Ready</option>
                                            <option value="completed" ${order.status === 'completed' ? 'selected' : ''}>Completed</option>
                                            <option value="cancelled" ${order.status === 'cancelled' ? 'selected' : ''}>Cancelled</option>
                                        </select>
                                    </td>
                                    <td class="p-3 text-right">
                                        <button class="btn btn-sm btn-outline-secondary">Details</button>
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
                Toast.success(`Order ${orderId} updated to ${newStatus}`);
            });
        });

    } catch (error) {
        Utils.error('Failed to load orders:', error);
    } finally {
        Loader.hide();
    }
}

/**
 * Admin Product Management Page
 */
async function AdminProductsPage() {
    const app = Utils.$('#app');

    try {
        Loader.show();
        const products = await ProductModule.getProducts();

        app.innerHTML = `
            <div class="admin-products fade-in container mt-4">
                <div class="d-flex justify-content-between align-items-center mb-4">
                    <h1>Product Management</h1>
                    <button class="btn btn-primary" onclick="alert('Add Product Modal coming soon!')">+ Add New Product</button>
                </div>

                <div class="card overflow-hidden">
                    <table class="admin-table" style="width: 100%; border-collapse: collapse;">
                        <thead style="background: #f9fafb; border-bottom: 1px solid #e5e7eb;">
                            <tr>
                                <th class="p-3 text-left">Product</th>
                                <th class="p-3 text-left">Category</th>
                                <th class="p-3 text-left">Price</th>
                                <th class="p-3 text-left">Status</th>
                                <th class="p-3 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${products.map(p => `
                                <tr style="border-bottom: 1px solid #f3f4f6;">
                                    <td class="p-3">
                                        <div class="d-flex align-items-center">
                                            <img src="${p.image_url}" style="width: 40px; height: 40px; object-fit: cover; border-radius: 4px; margin-right: 12px;">
                                            <strong>${p.name}</strong>
                                        </div>
                                    </td>
                                    <td class="p-3"><small>${p.category_id === 1 ? 'Milk Tea' : 'Fruit Tea'}</small></td>
                                    <td class="p-3">${Utils.formatCurrency(p.price)}</td>
                                    <td class="p-3">
                                        <span class="badge badge-success">In Stock</span>
                                    </td>
                                    <td class="p-3 text-right">
                                        <button class="btn btn-sm btn-outline-secondary">Edit</button>
                                        <button class="btn btn-sm btn-outline-danger ml-2">Delete</button>
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        `;

    } catch (error) {
        Utils.error('Failed to load products:', error);
    } finally {
        Loader.hide();
    }
}

/**
 * Admin Sales Reports Page
 */
async function AdminReportsPage() {
    const app = Utils.$('#app');

    app.innerHTML = `
        <div class="admin-reports fade-in container mt-4">
            <h1 class="mb-4">Sales Analytics</h1>

            <div class="stats-grid mb-4" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 20px;">
                <div class="card p-3">
                    <small class="text-muted">Net Revenue (MTD)</small>
                    <h2 class="text-primary">₱42,500.00</h2>
                    <small class="text-success">↑ 12% from last month</small>
                </div>
                <div class="card p-3">
                    <small class="text-muted">Average Order Value</small>
                    <h2 class="text-primary">₱185.00</h2>
                </div>
                <div class="card p-3">
                    <small class="text-muted">Total Customers</small>
                    <h2 class="text-primary">1,248</h2>
                </div>
            </div>

            <div class="row" style="display: flex; gap: 20px;">
                <div class="card p-4" style="flex: 2;">
                    <h3>Daily Sales Performance</h3>
                    <div class="chart-placeholder mt-3" style="height: 200px; display: flex; align-items: flex-end; gap: 10px; padding-top: 20px;">
                        ${[40, 70, 45, 90, 65, 80, 100].map(h => `
                            <div style="flex: 1; background: var(--color-primary); height: ${h}%; border-radius: 4px 4px 0 0; position: relative;">
                                <small style="position: absolute; top: -20px; left: 50%; transform: translateX(-50%); font-size: 0.7rem;">${h * 10}</small>
                            </div>
                        `).join('')}
                    </div>
                    <div class="d-flex justify-content-between mt-2 text-muted">
                        <small>Mon</small><small>Tue</small><small>Wed</small><small>Thu</small><small>Fri</small><small>Sat</small><small>Sun</small>
                    </div>
                </div>

                <div class="card p-4" style="flex: 1;">
                    <h3>Top Categories</h3>
                    <div class="mt-3">
                        <div class="mb-3">
                            <div class="d-flex justify-content-between mb-1">
                                <small>Classic Milk Tea</small>
                                <small>65%</small>
                            </div>
                            <div style="height: 8px; background: #eee; border-radius: 4px; overflow: hidden;">
                                <div style="width: 65%; height: 100%; background: var(--color-primary);"></div>
                            </div>
                        </div>
                        <div class="mb-3">
                            <div class="d-flex justify-content-between mb-1">
                                <small>Fruit Tea</small>
                                <small>25%</small>
                            </div>
                            <div style="height: 8px; background: #eee; border-radius: 4px; overflow: hidden;">
                                <div style="width: 25%; height: 100%; background: var(--color-secondary);"></div>
                            </div>
                        </div>
                        <div class="mb-3">
                            <div class="d-flex justify-content-between mb-1">
                                <small>Add-ons</small>
                                <small>10%</small>
                            </div>
                            <div style="height: 8px; background: #eee; border-radius: 4px; overflow: hidden;">
                                <div style="width: 10%; height: 100%; background: #34d399;"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

/**
 * Admin Vouchers Page
 */
async function AdminVouchersPage() {
    const app = Utils.$('#app');

    // Mock Voucher Data
    const vouchers = [
        { id: 1, code: 'WELCOME20', discount: 20, type: 'percentage', expiry: '2024-12-31', status: 'active' },
        { id: 2, code: 'MILKTEALOVE', discount: 50, type: 'fixed', expiry: '2024-06-30', status: 'active' },
        { id: 3, code: 'SUMMER2024', discount: 15, type: 'percentage', expiry: '2024-08-31', status: 'expired' },
    ];

    app.innerHTML = `
        <div class="admin-vouchers fade-in container mt-4">
            <div class="d-flex justify-content-between align-items-center mb-4">
                <h1>Voucher Management</h1>
                <button class="btn btn-primary">+ Create New Voucher</button>
            </div>

            <div class="card">
                <table class="admin-table" style="width: 100%; border-collapse: collapse;">
                    <thead style="background: #f9fafb; border-bottom: 1px solid #e5e7eb;">
                        <tr>
                            <th class="p-3 text-left">Code</th>
                            <th class="p-3 text-left">Discount</th>
                            <th class="p-3 text-left">Expiry</th>
                            <th class="p-3 text-left">Status</th>
                            <th class="p-3 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${vouchers.map(v => `
                            <tr style="border-bottom: 1px solid #f3f4f6;">
                                <td class="p-3"><strong>${v.code}</strong></td>
                                <td class="p-3">${v.type === 'percentage' ? v.discount + '%' : Utils.formatCurrency(v.discount)}</td>
                                <td class="p-3">${Utils.formatDate(v.expiry)}</td>
                                <td class="p-3">
                                    <span class="badge badge-${v.status === 'active' ? 'success' : 'danger'}">
                                        ${Utils.capitalize(v.status)}
                                    </span>
                                </td>
                                <td class="p-3 text-right">
                                    <button class="btn btn-sm btn-outline-secondary">Edit</button>
                                    <button class="btn btn-sm btn-outline-danger ml-2">Delete</button>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        </div>
    `;
}
