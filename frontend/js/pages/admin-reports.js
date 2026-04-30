async function AdminReportsPage() {
    const app = Utils.$('#app');

    app.innerHTML = `
        <div class="admin-reports fade-in container mt-4">
            <div class="d-flex justify-content-between align-items-center mb-5">
                <div>
                    <h1 class="mb-0">Sales Analytics</h1>
                    <p class="text-muted">Track your business performance and growth.</p>
                </div>
                <div class="d-flex gap-2">
                    <select class="form-control" style="width: auto;">
                        <option>Last 7 Days</option>
                        <option>Last 30 Days</option>
                        <option>This Year</option>
                    </select>
                    <button class="btn btn-primary" id="btn-export-report">📤 Export PDF</button>
                </div>
            </div>

            <div class="stats-grid mb-5" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 24px;">
                <div class="card p-4 border-0 shadow-sm" style="border-radius: 16px;">
                    <div class="d-flex align-items-center mb-3">
                        <div style="width: 10px; height: 10px; background: var(--color-primary); border-radius: 50%; margin-right: 10px;"></div>
                        <small class="text-muted font-weight-bold" style="text-transform: uppercase;">Net Revenue (MTD)</small>
                    </div>
                    <h2 style="font-size: 2.2rem; margin-bottom: 5px;">₱42,500.00</h2>
                    <span class="text-success small font-weight-bold">↑ 12.5% vs last month</span>
                </div>
                <div class="card p-4 border-0 shadow-sm" style="border-radius: 16px;">
                    <div class="d-flex align-items-center mb-3">
                        <div style="width: 10px; height: 10px; background: #fbbf24; border-radius: 50%; margin-right: 10px;"></div>
                        <small class="text-muted font-weight-bold" style="text-transform: uppercase;">Average Order Value</small>
                    </div>
                    <h2 style="font-size: 2.2rem; margin-bottom: 5px;">₱185.00</h2>
                    <span class="text-muted small">Based on 230 orders</span>
                </div>
                <div class="card p-4 border-0 shadow-sm" style="border-radius: 16px;">
                    <div class="d-flex align-items-center mb-3">
                        <div style="width: 10px; height: 10px; background: #10b981; border-radius: 50%; margin-right: 10px;"></div>
                        <small class="text-muted font-weight-bold" style="text-transform: uppercase;">Total Customers</small>
                    </div>
                    <h2 style="font-size: 2.2rem; margin-bottom: 5px;">1,248</h2>
                    <span class="text-success small font-weight-bold">↑ 48 new this week</span>
                </div>
            </div>

            <div class="row">
                <div class="col-lg-8 mb-4">
                    <div class="card p-4 border-0 shadow-sm h-100" style="border-radius: 16px;">
                        <h3 class="mb-4">Daily Sales Performance</h3>
                        <div class="chart-container" style="height: 250px; display: flex; align-items: flex-end; gap: 15px; padding-top: 30px; position: relative;">
                            ${[40, 70, 45, 90, 65, 80, 100].map(h => `
                                <div style="flex: 1; background: linear-gradient(to top, var(--color-primary), #818cf8); height: ${h}%; border-radius: 8px 8px 0 0; position: relative; transition: all 0.3s ease; cursor: pointer;" onmouseover="this.style.opacity='0.8'" onmouseout="this.style.opacity='1'">
                                    <small style="position: absolute; top: -25px; left: 50%; transform: translateX(-50%); font-size: 0.75rem; font-weight: bold; color: #4b5563;">₱${h * 100}</small>
                                </div>
                            `).join('')}
                        </div>
                        <div class="d-flex justify-content-between mt-3 text-muted px-2">
                            <small>Mon</small><small>Tue</small><small>Wed</small><small>Thu</small><small>Fri</small><small>Sat</small><small>Sun</small>
                        </div>
                    </div>
                </div>

                <div class="col-lg-4 mb-4">
                    <div class="card p-4 border-0 shadow-sm h-100" style="border-radius: 16px;">
                        <h3 class="mb-4">Top Categories</h3>
                        <div class="category-breakdown mt-2">
                            <div class="mb-4">
                                <div class="d-flex justify-content-between mb-2">
                                    <span class="font-weight-bold">Classic Milk Tea</span>
                                    <span class="text-primary font-weight-bold">65%</span>
                                </div>
                                <div style="height: 10px; background: #f1f5f9; border-radius: 10px; overflow: hidden;">
                                    <div style="width: 65%; height: 100%; background: var(--color-primary); border-radius: 10px;"></div>
                                </div>
                            </div>
                            <div class="mb-4">
                                <div class="d-flex justify-content-between mb-2">
                                    <span class="font-weight-bold">Fruit Tea</span>
                                    <span class="text-warning font-weight-bold">25%</span>
                                </div>
                                <div style="height: 10px; background: #f1f5f9; border-radius: 10px; overflow: hidden;">
                                    <div style="width: 25%; height: 100%; background: #fbbf24; border-radius: 10px;"></div>
                                </div>
                            </div>
                            <div class="mb-4">
                                <div class="d-flex justify-content-between mb-2">
                                    <span class="font-weight-bold">Salty Cheese</span>
                                    <span class="text-success font-weight-bold">10%</span>
                                </div>
                                <div style="height: 10px; background: #f1f5f9; border-radius: 10px; overflow: hidden;">
                                    <div style="width: 10%; height: 100%; background: #10b981; border-radius: 10px;"></div>
                                </div>
                            </div>
                        </div>
                        <div class="mt-auto pt-3 border-top">
                            <p class="text-muted small mb-0 text-center">Data updated every 15 minutes.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;

    Utils.$('#btn-export-report').addEventListener('click', () => {
        Toast.show('Generating analytics report...');
        setTimeout(() => Toast.success('Report downloaded successfully!'), 2000);
    });
}
