/**
 * Orders Page Handler
 * Active orders at top (emphasized), completed history at bottom
 */

const DONE_STATUSES = ['completed', 'cancelled', 'delivered'];

function getStatusStyle(status) {
    const s = status.toLowerCase().replace(/ /g, '_');
    if (s === 'ready_for_pickup' || s === 'ready') return { bg: '#dcfce7', color: '#166534', border: '#86efac', label: 'Ready for Pickup' };
    if (s === 'preparing') return { bg: '#fef9c3', color: '#854d0e', border: '#fde047', label: 'Preparing' };
    if (s === 'confirmed' || s === 'processing') return { bg: '#dbeafe', color: '#1e40af', border: '#93c5fd', label: 'Confirmed' };
    if (s === 'completed' || s === 'delivered') return { bg: '#f1f5f9', color: '#64748b', border: '#e2e8f0', label: 'Completed' };
    if (s === 'cancelled') return { bg: '#fef2f2', color: '#991b1b', border: '#fecaca', label: 'Cancelled' };
    return { bg: '#f1f5f9', color: '#64748b', border: '#e2e8f0', label: status };
}

function isActiveOrder(order) {
    return !DONE_STATUSES.includes(order.status.toLowerCase());
}

function renderOrderCard(order, isActive) {
    const style = getStatusStyle(order.status);
    const isReadyForPickup = order.status.toLowerCase().replace(/ /g, '_') === 'ready_for_pickup';

    return `
        <div class="order-card mb-4" style="
            border-radius: 16px;
            border: ${isActive ? '2px solid ' + style.border : '1px solid #e2e8f0'};
            box-shadow: ${isActive ? '0 4px 20px rgba(0,0,0,0.08)' : 'none'};
            overflow: hidden;
            background: white;
        ">
            <div class="px-4 py-3" style="background: ${isActive ? style.bg : '#f8fafc'}; border-bottom: 1px solid ${style.border};">
                <div class="d-flex justify-content-between align-items-center">
                    <div>
                        <span class="font-weight-bold" style="font-size: 1rem; color: #1e293b;">#${order.id}</span>
                        <span class="text-muted small ml-2">${order.date}</span>
                    </div>
                    <span style="
                        background: ${style.bg};
                        color: ${style.color};
                        border: 1px solid ${style.border};
                        padding: 4px 14px;
                        border-radius: 20px;
                        font-weight: 700;
                        font-size: 0.8rem;
                    ">${style.label}</span>
                </div>

                ${isReadyForPickup ? `
                    <div class="mt-3 py-2 px-3 text-center font-weight-bold" style="background: #166534; color: white; border-radius: 8px; font-size: 0.95rem;">
                        Your order is ready! Please pick it up at the counter.
                    </div>
                ` : ''}
            </div>

            <div class="p-4">
                ${order.items.map(item => `
                    <div class="d-flex justify-content-between align-items-start mb-2 pb-2 border-bottom">
                        <div>
                            <div class="font-weight-bold small">${item.quantity}x ${item.name}</div>
                            ${item.size ? `<div class="text-muted" style="font-size:0.75rem;">Size: ${item.size}${item.sugar_level ? ' · Sugar: ' + item.sugar_level : ''}${item.ice_level ? ' · Ice: ' + item.ice_level : ''}</div>` : ''}
                            ${item.addon ? `<div class="text-muted" style="font-size:0.75rem;">Add-on: ${item.addon}</div>` : ''}
                        </div>
                        <span class="small font-weight-bold" style="color:#1e293b;">${Utils.formatCurrency(item.price * item.quantity)}</span>
                    </div>
                `).join('')}

                <div class="d-flex justify-content-between font-weight-bold mt-3">
                    <span style="color:#64748b;">Total</span>
                    <span style="color: var(--color-primary); font-size: 1.1rem;">${Utils.formatCurrency(order.total)}</span>
                </div>
            </div>
        </div>
    `;
}

async function OrdersPage() {
    const app = Utils.$('#app');

    // Gate: not logged in
    if (!AppState.isLoggedIn()) {
        app.innerHTML = `
            <div class="fade-in container mt-4" style="max-width: 480px; margin: 100px auto; text-align: center;">
                <div style="width: 72px; height: 72px; background: #f1f5f9; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 20px;">
                    <svg width="32" height="32" fill="none" stroke="#94a3b8" stroke-width="2" viewBox="0 0 24 24"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>
                </div>
                <h3 class="font-weight-bold mb-2" style="color:#1e293b;">Sign in to view your orders</h3>
                <p class="text-muted mb-4" style="font-size: 0.95rem;">You need to be logged in to track your orders and view your order history.</p>
                <a href="#/login" class="btn btn-primary px-5 py-2" style="border-radius:10px; font-weight:700;">Sign In to Continue</a>
            </div>
        `;
        return;
    }

    try {
        Loader.show();
        const orders = await OrdersModule.getOrders();

        const activeOrders = orders.filter(isActiveOrder);
        const pastOrders = orders.filter(o => !isActiveOrder(o));

        if (orders.length === 0) {
            app.innerHTML = `
                <div class="container mt-4" style="max-width: 520px; margin: 80px auto; text-align: center;">
                    <div style="width: 80px; height: 80px; background: #f1f5f9; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 24px;">
                        <svg width="36" height="36" fill="none" stroke="#94a3b8" stroke-width="2" viewBox="0 0 24 24"><rect x="1" y="3" width="15" height="13"/><path d="M16 8h4l3 3v5h-7V8zM1 3l3 3"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>
                    </div>
                    <h2 class="font-weight-bold mb-2" style="color:#1e293b;">No orders yet</h2>
                    <p class="text-muted mb-4">Your order history will appear here once you place your first order.</p>
                    <a href="#/products" class="btn btn-primary px-5 py-2" style="border-radius:10px; font-weight:700;">Browse Menu</a>
                </div>
            `;
            return;
        }

        app.innerHTML = `
            <div class="orders-page fade-in container mt-4" style="max-width: 720px;">
                <h1 class="font-weight-bold mb-1" style="color: #1e293b;">My Orders</h1>
                <p class="text-muted mb-4">Track your current orders and view order history</p>

                ${activeOrders.length > 0 ? `
                    <div class="mb-2">
                        <p class="font-weight-bold mb-3" style="color: #1e293b; text-transform: uppercase; font-size: 0.75rem; letter-spacing: 1.5px;">
                            Active Orders (${activeOrders.length})
                        </p>
                        ${activeOrders.map(o => renderOrderCard(o, true)).join('')}
                    </div>
                ` : `
                    <div class="mb-4 p-4 text-center" style="border-radius: 14px; background: #f8fafc; border: 1px dashed #e2e8f0;">
                        <p class="text-muted mb-0 small">No active orders right now.</p>
                    </div>
                `}

                ${pastOrders.length > 0 ? `
                    <div class="mt-5">
                        <p class="font-weight-bold mb-3" style="color: #94a3b8; text-transform: uppercase; font-size: 0.75rem; letter-spacing: 1.5px;">
                            Order History (${pastOrders.length})
                        </p>
                        ${pastOrders.map(o => renderOrderCard(o, false)).join('')}
                    </div>
                ` : ''}
            </div>
        `;

    } catch (error) {
        app.innerHTML = `<div class="container mt-4"><p class="text-danger">Failed to load orders.</p></div>`;
    } finally {
        Loader.hide();
    }
}
