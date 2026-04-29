/**
 * Admin Dashboard Handler
 */

async function AdminDashboardPage() {
    const app = Utils.$('#app');

    try {
        Loader.show();
        const stats = await AdminModule.getStats();

        app.innerHTML = `
            <div class="admin-dashboard fade-in container mt-4">
                <div class="d-flex justify-content-between align-items-center">
                    <h1>Admin Dashboard</h1>
                    <a href="#/admin/pos" class="btn btn-secondary">Open POS System</a>
                </div>

                <div class="stats-grid mt-4" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px;">
                    <div class="card p-3 text-center">
                        <small class="text-muted">Total Sales</small>
                        <h2 class="text-primary">${Utils.formatCurrency(stats.total_sales)}</h2>
                    </div>
                    <div class="card p-3 text-center">
                        <small class="text-muted">Orders Today</small>
                        <h2 class="text-primary">${stats.total_orders}</h2>
                    </div>
                    <div class="card p-3 text-center">
                        <small class="text-muted">New Customers</small>
                        <h2 class="text-primary">${stats.total_customers}</h2>
                    </div>
                </div>

                <div class="recent-activity mt-5">
                    <h3>Recent Activity</h3>
                    <div class="card mt-2">
                        <ul class="list-group list-group-flush">
                            ${stats.recent_activity.map(activity => `
                                <li class="list-group-item d-flex justify-content-between">
                                    <span><strong>${activity.user}</strong>: ${activity.action}</span>
                                    <small class="text-muted">${activity.time}</small>
                                </li>
                            `).join('')}
                        </ul>
                    </div>
                </div>
            </div>
        `;
    } catch (error) {
        app.innerHTML = `<div class="container mt-4"><p class="text-danger">Admin access required.</p></div>`;
    } finally {
        Loader.hide();
    }
}
