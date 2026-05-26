/**
 * Admin Orders Management Page
 */

const ORDER_STATUS_LABELS = {
    pay: { label: 'Preparing', bg: '#fef9c3', color: '#854d0e' },
    claim: { label: 'To Claim', bg: '#dbeafe', color: '#1e40af' },
    done: { label: 'Done', bg: '#dcfce7', color: '#166534' },
    cancelled: { label: 'Cancelled', bg: '#fef2f2', color: '#991b1b' },
};

function isPosOrder(order) {
    return order && (order.order_mode === 'pos' || order.order_type === 'walkin');
}

function getStatusFlow(order) {
    if (order.status === 'cancelled' || order.status === 'done') {
        return { ...ORDER_STATUS_LABELS[order.status], next: null };
    }
    if (isPosOrder(order)) {
        if (order.status === 'pay') {
            return { ...ORDER_STATUS_LABELS.pay, next: 'done' };
        }
        return { label: order.status, next: null, bg: '#f1f5f9', color: '#64748b' };
    }
    if (order.status === 'pay') {
        return { ...ORDER_STATUS_LABELS.pay, next: 'claim' };
    }
    if (order.status === 'claim') {
        return { ...ORDER_STATUS_LABELS.claim, next: 'done' };
    }
    return { label: order.status, next: null, bg: '#f1f5f9', color: '#64748b' };
}

function findOrderByQr(orders, decodedText) {
    const raw = (decodedText || '').trim();
    if (!raw) return null;
    return orders.find(o => {
        if (o.id === raw) return true;
        if (o.order_qr === raw) return true;
        const numeric = raw.replace(/^ORD-?/i, '');
        if (numeric && String(o.db_id) === numeric) return true;
        if (o.id && raw.toUpperCase().includes(String(o.db_id))) return true;
        return false;
    });
}

async function AdminOrdersPage() {
    const app = Utils.$('#app');

    let orders = [];
    let currentFilter = 'all';
    let currentTypeFilter = 'all';
    let dateFrom = '';
    let dateTo = '';
    let searchQuery = '';

    async function fetchOrders() {
        const params = new URLSearchParams();
        if (currentFilter !== 'all') params.append('status', currentFilter);
        if (currentTypeFilter !== 'all') params.append('order_type', currentTypeFilter);
        if (dateFrom) params.append('date_from', dateFrom);
        if (dateTo) params.append('date_to', dateTo);
        const qs = params.toString();
        const response = await API.get('/admin/orders.php' + (qs ? '?' + qs : ''));
        const rawOrders = response.data || [];
        orders = rawOrders.map(o => ({
            ...o,
            id: o.id || ('ORD-' + o.db_id.toString().padStart(4, '0')),
        }));
    }

    async function refreshOrdersUI(orderId = null) {
        await fetchOrders();
        renderTable();
        if (orderId) {
            return orders.find(o => o.id === orderId || o.db_id === orderId);
        }
        return null;
    }

    function getFilteredOrders() {
        return orders.filter(o => {
            const q = searchQuery.toLowerCase();
            const matchesSearch = !q ||
                o.id.toLowerCase().includes(q) ||
                o.customer.toLowerCase().includes(q) ||
                (o.email && o.email.toLowerCase().includes(q));
            return matchesSearch;
        });
    }

    const paymentBadge = (paymentStatus) => {
        const styles = {
            Paid: { bg: '#dcfce7', color: '#166534' },
            Refunded: { bg: '#fef3c7', color: '#92400e' },
            Unpaid: { bg: '#fef2f2', color: '#991b1b' },
        };
        const s = styles[paymentStatus] || styles.Unpaid;
        return `<span style="background:${s.bg};color:${s.color};padding:4px 12px;border-radius:20px;font-size:0.7rem;font-weight:600;">${paymentStatus || 'Unpaid'}</span>`;
    };

    const formatOrderTotal = (order) => {
        if (order.status === 'cancelled' && order.total_original > 0) {
            return `<span style="color:#94a3b8;text-decoration:line-through;font-size:0.8rem;margin-right:6px;">${Utils.formatCurrency(order.total_original)}</span><span>${Utils.formatCurrency(0)}</span>`;
        }
        return Utils.formatCurrency(order.total);
    };

    const typeBadge = (order) => {
        const label = order.order_type_label || (order.order_mode === 'pos' ? 'Walk-in' : 'Online');
        const isWalkin = isPosOrder(order);
        return `<span style="background:${isWalkin ? '#f1f5f9' : '#e0f2fe'};color:${isWalkin ? '#475569' : '#0369a1'};padding:4px 12px;border-radius:20px;font-size:0.72rem;font-weight:700;">${label}</span>`;
    };

    const renderStatusButton = (order) => {
        if (order.status === 'cancelled') {
            return `<span style="background:#fef2f2;color:#991b1b;padding:6px 14px;border-radius:20px;font-size:0.8rem;font-weight:700;">Cancelled</span>`;
        }
        const s = getStatusFlow(order);
        const label = order.status_label || s.label;
        const isDisabled = !s.next;
        return `
            <button class="status-btn btn btn-sm" data-id="${order.id}" data-status="${order.status}"
                ${isDisabled ? 'disabled style="background:'+s.bg+';color:'+s.color+';border-radius:20px;font-size:0.8rem;font-weight:700;padding:6px 14px;cursor:not-allowed;opacity:0.65;"' : 'style="background:'+s.bg+';color:'+s.color+';border-radius:20px;font-size:0.8rem;font-weight:700;padding:6px 14px;cursor:pointer;"'}>
                ${label}
            </button>
        `;
    };

    function renderTable() {
        const filtered = getFilteredOrders();
        const tbody = Utils.$('#orders-tbody');
        if (!tbody) return;

        if (filtered.length === 0) {
            tbody.innerHTML = `<tr><td colspan="8" class="p-5 text-center text-muted">No orders found.</td></tr>`;
            return;
        }

        tbody.innerHTML = filtered.map(order => `
            <tr style="border-bottom: 1px solid #f1f5f9; ${order.status === 'cancelled' ? 'opacity:0.6;' : ''}" onmouseenter="this.style.background='#f8fafc'" onmouseleave="this.style.background='white'">
                <td class="p-3 py-4" style="padding-left:24px!important;">
                    <span class="font-weight-bold" style="color:#1e293b; font-size:0.88rem;">${order.id}</span>
                </td>
                <td class="p-3 py-4"  style="padding:10px!important;">${typeBadge(order)}</td>
                <td class="p-3 py-4">
                    <div class="font-weight-bold" style="font-size:0.88rem; color:#1e293b;">${order.customer}</div>
                </td>
                <td class="p-3 py-4" style="font-size:0.88rem;">${formatOrderTotal(order)}</td>
                <td class="p-3 py-4">${paymentBadge(order.payment_status)}</td>
                <td class="p-3 py-4"><span class="text-muted" style="font-size:0.82rem;">${Utils.formatDateTime(order.date)}</span></td>
                <td class="p-3 py-4">${renderStatusButton(order)}</td>
                <td class="p-3 py-4 text-right" style="white-space:nowrap; padding-right:24px!important;">
                    <button class="btn btn-sm view-details" data-id="${order.id}" style="border-radius:6px; font-size:0.75rem; padding:6px 12px; border:1px solid #e2e8f0; background:white; color:#475569; font-weight:600;">Details</button>
                    ${order.status !== 'cancelled' && order.status !== 'done' ? `
                        <button class="btn btn-sm void-order" data-id="${order.id}" style="border-radius:6px; font-size:0.75rem; padding:6px 12px; margin-left:6px; border:1px solid #fecaca; background:#fef2f2; color:#991b1b; font-weight:600;">Cancel</button>
                    ` : ''}
                </td>
            </tr>
        `).join('');

        attachTableListeners();
    }

    function attachTableListeners() {
        Utils.$$('.status-btn').forEach(btn => {
            btn.addEventListener('click', async () => {
                const orderId = btn.dataset.id;
                const order = orders.find(o => o.id === orderId);
                if (!order) return;
                const sInfo = getStatusFlow(order);
                if (!sInfo.next) return;
                const nextStatus = sInfo.next;
                const nextInfo = ORDER_STATUS_LABELS[nextStatus] || { label: nextStatus };

                if (!isPosOrder(order) && nextStatus === 'done' && order.status === 'claim') {
                    showOrderDetails(order, () => refreshOrdersUI(orderId));
                    return;
                }

                const nextLabel = isPosOrder(order) && nextStatus === 'done' ? 'Done' : nextInfo.label;
                Modal.confirm(
                    `Update <strong>${orderId}</strong> from <strong>${sInfo.label}</strong> to <strong>${nextLabel}</strong>?`,
                    async () => {
                        try {
                            Loader.show();
                            await API.put('/admin/orders.php', { id: order.db_id, status: nextStatus });
                            await refreshOrdersUI(orderId);
                            Toast.success(`Order ${orderId} → ${nextLabel}`);
                        } catch (err) {
                            Toast.error(err.message || 'Failed to update status');
                        } finally {
                            Loader.hide();
                        }
                    }
                );
            });
        });

        Utils.$$('.view-details').forEach(btn => {
            btn.addEventListener('click', () => {
                const order = orders.find(o => o.id === btn.dataset.id);
                if (!order) {
                    Toast.error('Order not found.');
                    return;
                }
                showOrderDetails(order, () => refreshOrdersUI(order.id));
            });
        });

        Utils.$$('.void-order').forEach(btn => {
            btn.addEventListener('click', () => {
                const order = orders.find(o => o.id === btn.dataset.id);
                Modal.confirm(
                    `Cancel order <strong>${order.id}</strong>? This cannot be undone.`,
                    async () => {
                        try {
                            await API.put('/admin/orders.php', { action: 'cancelled', id: order.db_id });
                            await refreshOrdersUI();
                            Toast.success('Order cancelled');
                        } catch (e) {
                            Toast.error(e.message || 'Failed to cancel order');
                        }
                    }
                );
            });
        });
    }

    try {
        Loader.show();
        await fetchOrders();

        app.innerHTML = `
            <style>
                .admin-orders-filter-actions {
                    display: flex;
                    gap: 8px;
                    align-items: flex-end;
                    flex: 0 0 auto;
                    min-width: 200px;
                }
                .admin-orders-filter-actions .btn {
                    height: 42px;
                    padding: 0 18px;
                    border-radius: 10px;
                    font-size: 0.85rem;
                    font-weight: 500;
                    margin: 0;
                    flex: 1;
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    white-space: nowrap;
                }
            </style>
            <div class="admin-orders fade-in container mt-4">
                <div class="d-flex justify-content-between align-items-center mb-4">
                    <div>
                        <h1 class="mb-0" style="font-weight:600; color:#1e293b;">Order Management</h1>
                    </div>
                    <button class="btn btn-primary d-flex align-items-center px-3 py-2" id="btn-scan-qr" style="border-radius:10px; font-weight:500; gap:8px;">
                        Scan QR Code
                    </button>
                </div>

                <div class="card border-0 p-4 mb-4" style="border-radius:14px; border:1px solid #e2e8f0;">
                    <div class="d-flex align-items-end flex-wrap" style="gap: 16px;">
                        <div style="flex: 2; min-width: 200px;">
                            <label class="small text-muted font-weight-bold">Search</label>
                            <input type="text" id="orders-search" class="form-control" placeholder="Name, order ID, email..." style="border-radius:10px;">
                        </div>
                        <div style="flex: 1; min-width: 130px;">
                            <label class="small text-muted font-weight-bold">From</label>
                            <input type="date" id="filter-date-from" class="form-control" style="border-radius:10px;">
                        </div>
                        <div style="flex: 1; min-width: 130px;">
                            <label class="small text-muted font-weight-bold">To</label>
                            <input type="date" id="filter-date-to" class="form-control" style="border-radius:10px;">
                        </div>
                        <div style="flex: 1; min-width: 150px;">
                            <label class="small text-muted font-weight-bold">Order Type</label>
                            <select id="filter-order-type" class="form-control" style="border-radius:10px;">
                                <option value="all">All Types</option>
                                <option value="online">Online</option>
                                <option value="walkin">Walk-in</option>
                            </select>
                        </div>
                        <div class="admin-orders-filter-actions">
                            <button type="button" class="btn btn-primary" id="btn-apply-filters">Apply</button>
                            <button type="button" class="btn btn-outline-secondary" id="btn-clear-filters">Clear</button>
                        </div>
                    </div>
                    <div class="d-flex flex-wrap gap-2 mt-3">
                        ${[
                            { val: 'all', label: 'All' },
                            { val: 'pay', label: 'Preparing' },
                            { val: 'claim', label: 'To Claim' },
                            { val: 'done', label: 'Done' },
                            { val: 'cancelled', label: 'Cancelled' },
                        ].map(f => `
                            <button class="btn btn-sm filter-btn ${f.val === 'all' ? 'btn-primary' : 'btn-outline-secondary'}" data-filter="${f.val}" style="border-radius:8px; font-weight:600;">${f.label}</button>
                        `).join('')}
                    </div>
                </div>

                <div class="card border-0 overflow-hidden" style="border-radius:16px; border:1px solid #e2e8f0;">
                    <div style="overflow-x:auto;">
                        <table style="width:100%; border-collapse:collapse;">
                            <thead>
                                <tr style="border-bottom: 2px solid #f1f5f9;">
                                    <th class="p-3" style="font-size:0.75rem; text-transform:uppercase; color:#94a3b8; width: 140px; padding-left:24px!important;">Order ID</th>
                                    <th class="p-3" style="font-size:0.75rem; text-transform:uppercase; color:#94a3b8; width: 100px">Type</th>
                                    <th class="p-3" style="font-size:0.75rem; text-transform:uppercase; color:#94a3b8;">Customer</th>
                                    <th class="p-3" style="font-size:0.75rem; text-transform:uppercase; color:#94a3b8;">Total</th>
                                    <th class="p-3" style="font-size:0.75rem; text-transform:uppercase; color:#94a3b8;">Payment</th>
                                    <th class="p-3" style="font-size:0.75rem; text-transform:uppercase; color:#94a3b8;">Date</th>
                                    <th class="p-3" style="font-size:0.75rem; text-transform:uppercase; color:#94a3b8;">Status</th>
                                    <th class="p-3 text-right" style="font-size:0.75rem; text-transform:uppercase; color:#94a3b8; padding-right:24px!important;">Actions</th>
                                </tr>
                            </thead>
                            <tbody id="orders-tbody"></tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;

        Utils.$$('.filter-btn').forEach(btn => {
            btn.addEventListener('click', async () => {
                Utils.$$('.filter-btn').forEach(b => { b.classList.remove('btn-primary'); b.classList.add('btn-outline-secondary'); });
                btn.classList.add('btn-primary'); btn.classList.remove('btn-outline-secondary');
                currentFilter = btn.dataset.filter;
                Loader.show();
                try { await fetchOrders(); renderTable(); } finally { Loader.hide(); }
            });
        });

        Utils.$('#orders-search').addEventListener('input', (e) => { searchQuery = e.target.value; renderTable(); });

        async function applyFilters() {
            dateFrom = Utils.$('#filter-date-from')?.value || '';
            dateTo = Utils.$('#filter-date-to')?.value || '';
            currentTypeFilter = Utils.$('#filter-order-type')?.value || 'all';
            Loader.show();
            try {
                await fetchOrders();
                renderTable();
                Toast.success('Filters applied');
            } finally {
                Loader.hide();
            }
        }

        async function clearFilters() {
            dateFrom = '';
            dateTo = '';
            currentTypeFilter = 'all';
            currentFilter = 'all';
            searchQuery = '';
            const searchEl = Utils.$('#orders-search');
            const fromEl = Utils.$('#filter-date-from');
            const toEl = Utils.$('#filter-date-to');
            const typeEl = Utils.$('#filter-order-type');
            if (searchEl) searchEl.value = '';
            if (fromEl) fromEl.value = '';
            if (toEl) toEl.value = '';
            if (typeEl) typeEl.value = 'all';
            Utils.$$('.filter-btn').forEach(b => {
                b.classList.remove('btn-primary');
                b.classList.add('btn-outline-secondary');
                if (b.dataset.filter === 'all') {
                    b.classList.add('btn-primary');
                    b.classList.remove('btn-outline-secondary');
                }
            });
            Loader.show();
            try {
                await fetchOrders();
                renderTable();
            } finally {
                Loader.hide();
            }
        }

        Utils.$('#btn-apply-filters')?.addEventListener('click', applyFilters);
        Utils.$('#btn-clear-filters')?.addEventListener('click', clearFilters);

        Utils.$('#btn-scan-qr').addEventListener('click', () => {
            Modal.show({
                title: 'Scan Order QR',
                html: `<div class="text-center p-2"><p class="text-muted mb-3">Point camera at customer QR code.</p><div id="qr-reader" style="width:100%; border-radius:12px; min-height:250px; border:1px solid #e2e8f0;"></div></div>`,
                buttons: [{ text: 'Cancel', action: 'close', class: 'secondary' }],
                onOpen: () => {
                    if (typeof Html5QrcodeScanner === 'undefined') { Toast.error('QR Scanner not loaded.'); return; }
                    const scanner = new Html5QrcodeScanner("qr-reader", { fps: 10, qrbox: { width: 250, height: 250 } }, false);
                    scanner.render((decodedText) => {
                        scanner.clear(); Modal.hide();
                        const order = findOrderByQr(orders, decodedText);
                        if (order) {
                            showOrderDetails(order, () => refreshOrdersUI(order.id));
                            Toast.success('Order found');
                        } else {
                            Toast.error('Order not found: ' + decodedText);
                        }
                    }, () => {});
                    window._currentScanner = scanner;
                },
                onClose: () => { if (window._currentScanner) { try { window._currentScanner.clear(); } catch(e) {} window._currentScanner = null; } }
            });
        });

        renderTable();

        const queryStr = window.location.hash.split('?')[1];
        const urlParams = new URLSearchParams(queryStr || '');
        const openOrderId = urlParams.get('open');
        if (openOrderId) {
            const orderToOpen = orders.find(o => o.id === openOrderId);
            if (orderToOpen) {
                showOrderDetails(orderToOpen, () => refreshOrdersUI(orderToOpen.id));
                window.location.hash = window.location.hash.split('?')[0];
            }
        }

    } catch (error) {
        Utils.error('Failed to load orders:', error);
        app.innerHTML = `<div class="container mt-4"><p class="text-danger">Failed to load orders.</p></div>`;
    } finally {
        Loader.hide();
    }
}

function showOrderDetails(order, onUpdate) {
    if (!order) {
        Toast.error('Order details are unavailable.');
        return;
    }

    const pos = isPosOrder(order);
    const isPaid = order.payment_status === 'Paid';
    const isRefunded = order.payment_status === 'Refunded';
    const statusInfo = getStatusFlow(order);
    const statusLabel = order.status_label || ORDER_STATUS_LABELS[order.status]?.label || order.status;
    const change = (isPaid && order.amount_paid > order.total) ? order.amount_paid - order.total : 0;

    const itemsHtml = (order.items || []).length > 0
        ? (order.items || []).map(item => `
            <div style="background:#fff; border:1px solid #e2e8f0; border-radius:12px; padding:14px; margin-bottom:10px;">
                <div style="display:flex; justify-content:space-between; align-items:flex-start;">
                    <div>
                        <div style="font-size:1rem; font-weight:800; color:#1e293b;">${item.quantity}× ${item.name}</div>
                        <div style="font-size:0.8rem; color:#64748b; margin-top:6px; line-height:1.5;">
                            <strong>Size:</strong> ${item.size || 'Regular'} &nbsp;·&nbsp;
                            <strong>Sugar:</strong> ${item.sugar_level || '100%'} &nbsp;·&nbsp;
                            <strong>Ice:</strong> ${item.ice_level || 'Normal'}
                        </div>
                    </div>
                    <span style="font-size:1rem; font-weight:800; color:var(--color-primary); white-space:nowrap;">${Utils.formatCurrency((item.price || 0) * (item.quantity || 1))}</span>
                </div>
            </div>
        `).join('')
        : `<div class="text-muted p-3">No line items recorded.</div>`;

    const showTenderedInput = !pos && order.status === 'claim' && !isPaid;
    const buttons = [{ text: 'Close', action: 'close', class: 'secondary' }];

    if (order.status !== 'done' && order.status !== 'cancelled') {
        if (pos && order.status === 'pay') {
            buttons.push({ text: 'Mark as Done', action: 'complete_pos', class: 'primary' });
        } else if (!pos && order.status === 'claim') {
            buttons.push({ text: 'Complete Order', action: 'complete_online', class: 'primary' });
        }
    }

    Modal.show({
        title: `Order Details — ${order.id}`,
        html: `
            <div style="padding:4px 0;">
                <div style="display:flex; gap:8px; flex-wrap:wrap; margin-bottom:16px;">
                    <span style="background:#f1f5f9;padding:6px 14px;border-radius:20px;font-size:0.8rem;font-weight:700;">${order.order_type_label || (pos ? 'Walk-in' : 'Online')}</span>
                    <span style="background:${ORDER_STATUS_LABELS[order.status]?.bg || '#f1f5f9'};padding:6px 14px;border-radius:20px;font-size:0.8rem;font-weight:700;color:${ORDER_STATUS_LABELS[order.status]?.color || '#64748b'};">${statusLabel}</span>
                    <span style="background:${isRefunded ? '#fef3c7' : isPaid ? '#dcfce7' : '#fef2f2'};padding:6px 14px;border-radius:20px;font-size:0.8rem;font-weight:600;color:${isRefunded ? '#92400e' : isPaid ? '#166534' : '#991b1b'};">${order.payment_status || 'Unpaid'}</span>
                </div>
                <div style="background:#f8fafc; border-radius:12px; padding:14px; margin-bottom:16px;">
                    <div style="font-weight:700; color:#1e293b;">${order.customer}</div>
                    ${order.phone && !pos ? `<div class="text-muted small">${order.phone}</div>` : ''}
                    ${order.email && !pos ? `<div class="text-muted small">${order.email}</div>` : ''}
                    <div class="text-muted small mt-1">${Utils.formatDateTime(order.date)}</div>
                </div>
                <div style="font-size:0.7rem; text-transform:uppercase; letter-spacing:1px; font-weight:700; color:#94a3b8; margin-bottom:10px;">Order Items</div>
                ${itemsHtml}
                <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:12px; padding:14px; margin-top:12px;">
                    ${order.discount > 0 ? `<div style="display:flex;justify-content:space-between;color:#16a34a;margin-bottom:8px;"><span>Discount</span><span>-${Utils.formatCurrency(order.discount)}</span></div>` : ''}
                    <div style="display:flex;justify-content:space-between;font-weight:600;font-size:1.05rem;"><span>Total</span><span style="color:var(--color-primary);">${order.status === 'cancelled' && order.total_original ? Utils.formatCurrency(0) + ' <span style="color:#94a3b8;font-size:0.85rem;text-decoration:line-through;">(' + Utils.formatCurrency(order.total_original) + ')</span>' : Utils.formatCurrency(order.total)}</span></div>
                    <div style="display:flex;justify-content:space-between;margin-top:8px;font-size:0.85rem;"><span>Amount Paid</span><span style="font-weight:700;">${isPaid ? Utils.formatCurrency(order.amount_paid) : '—'}</span></div>
                    ${change > 0 ? `<div style="display:flex;justify-content:space-between;margin-top:4px;font-size:0.85rem;color:#16a34a;"><span>Change</span><span style="font-weight:700;">${Utils.formatCurrency(change)}</span></div>` : ''}
                </div>
                ${showTenderedInput ? `
                    <div style="background:#fff; border:1px solid #e2e8f0; border-radius:12px; padding:14px; margin-top:12px;">
                        <label class="font-weight-bold small">Amount Tendered / Cash Given (₱)</label>
                        <input type="number" id="amount-tendered" class="form-control mt-1" value="${order.total}" min="0" step="0.01" style="border-radius:10px;">
                        <div class="mt-2 small text-muted" id="change-due-preview"></div>
                    </div>
                ` : ''}
            </div>
        `,
        buttons,
        onOpen: () => {
            const tenderInput = Utils.$('#amount-tendered');
            const changePreview = Utils.$('#change-due-preview');
            const actionBtn = Utils.$('button[data-action="complete_online"]');
            if (actionBtn && showTenderedInput) {
                actionBtn.disabled = true;
                actionBtn.style.opacity = '0.5';
            }
            const updateState = () => {
                const tendered = parseFloat(tenderInput?.value) || 0;
                const changeDue = Math.max(0, tendered - order.total);
                if (changePreview) {
                    changePreview.textContent = changeDue > 0 ? `Change Due: ${Utils.formatCurrency(changeDue)}` : '';
                }
                if (actionBtn && showTenderedInput) {
                    const ok = tendered >= order.total;
                    actionBtn.disabled = !ok;
                    actionBtn.style.opacity = ok ? '1' : '0.5';
                }
            };
            if (tenderInput) {
                tenderInput.addEventListener('input', updateState);
                updateState();
            }
        },
        onComplete_pos: async () => {
            try {
                Loader.show();
                await API.put('/admin/orders.php', { id: order.db_id, status: 'done' });
                Modal.hide();
                if (onUpdate) await onUpdate();
                Toast.success('Walk-in order marked Done');
            } catch (e) {
                Toast.error(e.message || 'Update failed');
            } finally {
                Loader.hide();
            }
        },
        onComplete_online: async () => {
            const amtInput = Utils.$('#amount-tendered');
            const amountPaid = amtInput ? parseFloat(amtInput.value) || 0 : order.total;
            if (amountPaid < order.total) {
                Toast.error('Amount tendered must be at least the order total.');
                return false;
            }
            try {
                Loader.show();
                await API.put('/admin/orders.php', {
                    action: 'confirm_claim',
                    id: order.db_id,
                    total: order.total,
                    amount_paid: amountPaid,
                });
                Modal.hide();
                if (onUpdate) await onUpdate();
                Toast.success('Order completed — Paid and Done');
            } catch (e) {
                Toast.error(e.message || 'Update failed');
            } finally {
                Loader.hide();
            }
            return false;
        },
    });
}

function showOrderReceipt(order, onUpdate) {
    showOrderDetails(order, onUpdate);
}
