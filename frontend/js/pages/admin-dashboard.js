/**
 * Admin Dashboard Page
 */
async function AdminDashboardPage() {
    const app = Utils.$('#app');

    // Sales period state: 'today' | 'yesterday' | 'all'
    let salesPeriod = 'today';

    async function loadDashboard() {
        const stats = await AdminModule.getStats();

        let allOrders = [];
        try {
            const ordersRes = await API.get('/admin/orders.php');
            allOrders = (ordersRes.data || []);
        } catch (e) { console.error('Failed to load orders', e); }

        // Compute filtered total sales from completed orders
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        const completedOrders = allOrders.filter(o => o.status === 'done');

        function computeSales(period) {
            if (period === 'all') {
                return completedOrders.reduce((sum, o) => sum + (parseFloat(o.total) || 0), 0);
            }
            return completedOrders.filter(o => {
                const d = new Date(o.date);
                d.setHours(0, 0, 0, 0);
                if (period === 'today') return d.getTime() === today.getTime();
                if (period === 'yesterday') return d.getTime() === yesterday.getTime();
                return false;
            }).reduce((sum, o) => sum + (parseFloat(o.total) || 0), 0);
        }

        function getPeriodLabel(period) {
            if (period === 'today') return 'Today\'s sales';
            if (period === 'yesterday') return 'Yesterday\'s sales';
            return 'Completed orders only';
        }

        const UPCOMING_STATUSES = ['pay', 'claim'];
        const upcomingOrders = allOrders
            .filter(o => UPCOMING_STATUSES.includes(o.status))
            .sort((a, b) => new Date(b.date) - new Date(a.date));

        const statusBadge = (status) => {
            const map = {
                pay: { bg: '#fef9c3', color: '#854d0e', label: 'Preparing' },
                claim: { bg: '#dceefc', color: '#0f3872', label: 'To Claim' },
                done: { bg: '#f1f5f9', color: '#64748b', label: 'Done' }
            };
            const s = map[status] || { bg: '#f1f5f9', color: '#64748b', label: status };
            return `<span style="background:${s.bg};color:${s.color};padding:2px 10px;border-radius:20px;font-size:0.72rem;font-weight:700;">${s.label}</span>`;
        };

        const typeBadge = (order) => {
            const isWalkin = order.order_type === 'walkin' || order.order_mode === 'pos';
            return isWalkin
                ? '<span style="background:#f1f5f9;color:#475569;padding:2px 8px;border-radius:4px;font-size:0.68rem;font-weight:700;">Walk-in</span>'
                : '<span style="background:#e0f2fe;color:#0369a1;padding:2px 8px;border-radius:4px;font-size:0.68rem;font-weight:700;">Online</span>';
        };

        function renderSalesCard() {
            const displaySales = computeSales(salesPeriod);
            const periodLabel = getPeriodLabel(salesPeriod);
            const periods = [
                { key: 'today', label: 'Today' },
                { key: 'yesterday', label: 'Yesterday' },
                { key: 'all', label: 'All Time' },
            ];
            return `
                <div class="card p-4 border-0 shadow-sm" style="background: linear-gradient(135deg, #a01a1a, #c0392b); color: white; border-radius: 16px; cursor: pointer; transition: transform 0.2s;" onclick="window.location.hash='#/admin/reports'" onmouseover="this.style.transform='translateY(-2px)'" onmouseout="this.style.transform='translateY(0)'">
                    <small style="opacity: 0.85; text-transform: uppercase; letter-spacing: 1px; font-weight: 600; font-size: 0.72rem;">Total Sales</small>
                    <h2 class="mt-2 mb-1" style="color: white; font-size: 2rem; font-weight: 900;" id="sales-amount">${Utils.formatCurrency(displaySales)}</h2>
                    <div class="small mb-3" style="opacity: 0.9;" id="sales-period-label">${periodLabel}</div>
                    <div class="d-flex" style="gap:6px;" onclick="event.stopPropagation()">
                        ${periods.map(p => `
                            <button class="sales-period-btn" data-period="${p.key}"
                                style="flex:1; border:none; border-radius:8px; padding:5px 0; font-size:0.72rem; font-weight:700; cursor:pointer;
                                background:${salesPeriod === p.key ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.2)'};
                                color:${salesPeriod === p.key ? '#a01a1a' : 'rgba(255,255,255,0.85)'};">
                                ${p.label}
                            </button>
                        `).join('')}
                    </div>
                </div>
            `;
        }

        app.innerHTML = `
            <div class="admin-dashboard fade-in container mt-4">
                <div class="d-flex justify-content-between align-items-center mb-5">
                    <div>
                        <h1 class="mb-0" style="font-weight: 800; color: #1e293b;">Dashboard</h1>
                    </div>
                </div>

                <div id="stats-grid" class="stats-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 40px;">
                    ${renderSalesCard()}
                    <div class="card p-4 border-0 shadow-sm" style="background: white; border-radius: 16px;">
                        <small class="text-muted" style="text-transform: uppercase; letter-spacing: 1px; font-weight: 600; font-size: 0.72rem;">Total Orders</small>
                        <h2 class="mt-2 mb-0" style="color: #1e293b; font-size: 2rem; font-weight: 900;">${stats.total_orders}</h2>
                        <div class="mt-2 small text-muted">All non-void orders</div>
                    </div>
                    <div class="card p-4 border-0 shadow-sm" style="background: white; border-radius: 16px; border-left: 4px solid #f59e0b;">
                        <small class="text-muted" style="text-transform: uppercase; letter-spacing: 1px; font-weight: 600; font-size: 0.72rem;">Live Queue</small>
                        <h2 class="mt-2 mb-0" style="color: #d97706; font-size: 2rem; font-weight: 900;">${stats.live_queue ?? stats.pending_orders ?? 0}</h2>
                        <div class="mt-2 small" style="color: #f59e0b; font-weight: 600;">Pending Orders</div>
                    </div>
                </div>

                <div class="row">
                    <div class="col-md-12 mb-4">
                        <div class="d-flex justify-content-between align-items-center mb-3">
                            <h5 class="mb-0 font-weight-bold" style="color: #1e293b; display: inline-flex; align-items: center; gap: 8px;">
                                <i class="bi bi-clock-history" style="color: var(--color-primary);"></i> Live Queue
                            </h5>
                            <a href="#/admin/orders" class="small text-primary font-weight-600" style="text-decoration: none; display: inline-flex; align-items: center; gap: 4px;">
                                View All <i class="bi bi-arrow-right" style="font-size: 0.8rem;"></i>
                            </a>
                        </div>
                        <div class="card border-0 shadow-sm" style="border-radius: 16px; display: flex; flex-direction: column; gap: 0; overflow: hidden;">
                            ${upcomingOrders.length === 0 ? `
                                <div style="text-align: center; padding: 48px 24px; color: #94a3b8;">
                                    <i class="bi bi-clipboard-check" style="font-size: 2.5rem; color: #cbd5e1; display: block; margin-bottom: 12px;"></i>
                                    <p class="mb-0 small" style="font-weight: 500;">No orders in queue right now.</p>
                                </div>
                            ` : upcomingOrders.slice(0, 8).map(order => `
                                <div onclick="window.location.hash='#/admin/orders?open=' + '${order.id}'"
                                    style="padding: 18px 24px; border-bottom: 1px solid #f1f5f9; cursor: pointer; transition: background 0.2s ease; display: flex; flex-direction: column; gap: 10px;"
                                    onmouseover="this.style.backgroundColor='#f8fafc'" 
                                    onmouseout="this.style.backgroundColor='transparent'">
                                    
                                    <div style="display: flex; justify-content: space-between; align-items: center; width: 100%;">
                                        <div style="display: flex; align-items: center; gap: 10px;">
                                            <span class="font-weight-bold" style="font-size: 1rem; color: #0f172a; letter-spacing: -0.01em; display: inline-flex; align-items: center; gap: 6px;">
                                                <i class="bi bi-receipt" style="color: #64748b; font-size: 0.9rem;"></i> ${order.id}
                                            </span>
                                            ${statusBadge(order.status)}
                                        </div>
                                        <div style="font-size: 1.05rem; color: #0f172a; font-weight: 800; letter-spacing: -0.01em;">
                                            ${Utils.formatCurrency(order.total)}
                                        </div>
                                    </div>
                                    
                                    <div style="display: flex; justify-content: space-between; align-items: center; width: 100%; border-top: 1px dashed #f1f5f9; padding-top: 8px;">
                                        <div style="font-size: 0.85rem; color: #475569; display: inline-flex; align-items: center; gap: 6px;">
                                            <i class="bi bi-person" style="font-size: 0.9rem; color: #94a3b8;"></i> ${order.customer}
                                        </div>
                                        <div style="display: flex; align-items: center; gap: 14px;">
                                            <div style="font-size: 0.78rem; color: #64748b; font-weight: 500; display: inline-flex; align-items: center; gap: 4px;">
                                                <i class="bi bi-clock" style="font-size: 0.75rem; color: #94a3b8;"></i> ${new Date(order.date).toLocaleTimeString('en-PH', { hour: '2-digit', minute: '2-digit' })}
                                            </div>
                                            <div style="display: inline-flex; align-items: center; scale: 0.95; transform-origin: right center;">
                                                ${typeBadge(order)}
                                            </div>
                                        </div>
                                    </div>

                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>

                <div class="mt-2">
                    <div class="d-flex justify-content-between align-items-center mb-3">
                        <h5 class="mb-0 font-weight-bold" style="color: #1e293b; display: flex; align-items: center; gap: 8px;">
                            <i class="bi bi-check-circle" style="color: #10b981;"></i> Recent Completed Orders
                        </h5>
                    </div>
                    <div class="card border-0 shadow-sm overflow-hidden" style="border-radius: 16px;">
                        <div class="list-group list-group-flush">
                            ${(stats.recent_activity || []).map(activity => `
                                <div class="list-group-item p-3 d-flex align-items-center justify-content-between border-0" style="border-bottom: 1px solid #f1f5f9 !important; transition: background 0.2s ease;" onmouseover="this.style.backgroundColor='#f8fafc'" onmouseout="this.style.backgroundColor='transparent'">
                                    <div class="d-flex align-items-center">
                                        <div>
                                            <div class="font-weight-bold" style="color: #1e293b; font-size: 0.95rem;">${activity.user || 'System'}</div>
                                            ${activity.order_id ? `<div style="margin-top: 4px;"><span style="background: #f1f5f9; color: #475569; font-size: 0.75rem; padding: 2px 8px; border-radius: 6px; display: inline-flex; align-items: center; gap: 4px;"><i class="bi bi-receipt" style="font-size: 0.7rem;"></i>${activity.order_id}</span></div>` : ''}
                                        </div>
                                    </div>
                                    <div class="text-right" style="display: flex; flex-direction: column; align-items: flex-end; gap: 6px;">
                                        ${activity.amount > 0 ? `<div class="font-weight-bold" style="font-size: 1rem; letter-spacing: -0.01em;">${Utils.formatCurrency(activity.amount)}</div>` : ''}
                                        <div style="font-size: 0.75rem; color: #8996a8; display: inline-flex; align-items: center; gap: 4px;">
                                            <i class="bi bi-clock" style="font-size: 0.7rem;"></i> ${activity.time}
                                        </div>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Attach sales period button listeners
        document.querySelectorAll('.sales-period-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                salesPeriod = btn.dataset.period;

                // Update button styles
                document.querySelectorAll('.sales-period-btn').forEach(b => {
                    const isActive = b.dataset.period === salesPeriod;
                    b.style.background = isActive ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.2)';
                    b.style.color = isActive ? '#a01a1a' : 'rgba(255,255,255,0.85)';
                });

                // Update displayed amount and label
                const amountEl = Utils.$('#sales-amount');
                const labelEl = Utils.$('#sales-period-label');
                if (amountEl) amountEl.textContent = Utils.formatCurrency(computeSales(salesPeriod));
                if (labelEl) labelEl.textContent = getPeriodLabel(salesPeriod);
            });
        });
    }

    try {
        Loader.show();
        await loadDashboard();
    } catch (error) {
        app.innerHTML = `<div class="container mt-4"><p class="text-danger">Failed to load dashboard stats.</p></div>`;
    } finally {
        Loader.hide();
    }
}