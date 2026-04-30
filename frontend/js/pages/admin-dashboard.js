async function AdminDashboardPage() {
    const app = Utils.$('#app');

    try {
        Loader.show();
        const stats = await AdminModule.getStats();

        app.innerHTML = `
            <div class="admin-dashboard fade-in container mt-4">
                <div class="d-flex justify-content-between align-items-center mb-5">
                    <div>
                        <h1 class="mb-0">Dashboard</h1>
                        <p class="text-muted">Welcome back to the management suite.</p>
                    </div>
                    <div class="d-flex gap-2">
                        <button class="btn btn-outline-secondary" onclick="Toast.show('Refreshing data...')">Refresh</button>
                        <a href="#/admin/pos" class="btn btn-primary shadow-sm">Open POS System</a>
                    </div>
                </div>

                <div class="stats-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 24px;">
                    <div class="card p-4 border-0 shadow-sm" style="background: linear-gradient(135deg, #4f46e5, #6366f1); color: white; border-radius: 16px;">
                        <small style="opacity: 0.8; text-transform: uppercase; letter-spacing: 1px; font-weight: 600;">Gross Revenue</small>
                        <h2 class="mt-2 mb-0" style="color: white; font-size: 2.2rem;">${Utils.formatCurrency(stats.total_sales)}</h2>
                        <div class="mt-3 small" style="opacity: 0.9;">↑ 12% from last week</div>
                    </div>
                    <div class="card p-4 border-0 shadow-sm" style="background: white; border-radius: 16px;">
                        <small class="text-muted" style="text-transform: uppercase; letter-spacing: 1px; font-weight: 600;">Total Orders</small>
                        <h2 class="mt-2 mb-0" style="color: #1e293b; font-size: 2.2rem;">${stats.total_orders}</h2>
                        <div class="mt-3 small text-success">↑ 5% since yesterday</div>
                    </div>
                    <div class="card p-4 border-0 shadow-sm" style="background: white; border-radius: 16px;">
                        <small class="text-muted" style="text-transform: uppercase; letter-spacing: 1px; font-weight: 600;">Active Customers</small>
                        <h2 class="mt-2 mb-0" style="color: #1e293b; font-size: 2.2rem;">${stats.total_customers}</h2>
                        <div class="mt-3 small text-muted">Total registered users</div>
                    </div>
                </div>

                <div class="row mt-5">
                    <div class="col-md-8">
                        <div class="d-flex justify-content-between align-items-center mb-3">
                            <h3 class="mb-0">Recent Activity</h3>
                            <a href="#/admin/orders" class="small text-primary">View All</a>
                        </div>
                        <div class="card border-0 shadow-sm overflow-hidden" style="border-radius: 16px;">
                            <div class="list-group list-group-flush">
                                ${stats.recent_activity.map(activity => `
                                    <div class="list-group-item p-4 d-flex align-items-center justify-content-between border-0" style="border-bottom: 1px solid #f1f5f9 !important;">
                                        <div class="d-flex align-items-center">
                                            <div class="activity-icon mr-3" style="width: 40px; height: 40px; background: #f8fafc; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 1.2rem;">
                                                ${activity.action.includes('Order') ? '☕' : '👤'}
                                            </div>
                                            <div>
                                                <div class="font-weight-bold" style="color: #1e293b;">${activity.user}</div>
                                                <div class="text-muted small">${activity.action}</div>
                                            </div>
                                        </div>
                                        <div class="text-right">
                                            <div class="small font-weight-bold">${activity.time}</div>
                                            <div class="text-muted tiny" style="font-size: 0.7rem;">via Website</div>
                                        </div>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    </div>

                    <div class="col-md-4">
                        <h3 class="mb-3">Quick Actions</h3>
                        <div class="card border-0 shadow-sm p-4" style="border-radius: 16px;">
                            <div class="d-grid gap-3" style="display: grid; gap: 12px;">
                                <button class="btn btn-outline-primary btn-block text-left" onclick="ROUTER.navigate('/admin/products')">📦 Add New Product</button>
                                <button class="btn btn-outline-primary btn-block text-left" onclick="ROUTER.navigate('/admin/vouchers')">🎟️ Create Voucher</button>
                                <button class="btn btn-outline-primary btn-block text-left" onclick="ROUTER.navigate('/admin/reports')">📊 Export Report</button>
                                <hr class="my-2">
                                <button class="btn btn-secondary btn-block text-left" onclick="AuthModule.logout()">🚪 System Logout</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    } catch (error) {
        app.innerHTML = `<div class="container mt-4"><p class="text-danger">Failed to load dashboard stats.</p></div>`;
    } finally {
        Loader.hide();
    }
}
