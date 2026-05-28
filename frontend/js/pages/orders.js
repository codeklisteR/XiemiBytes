/**
 * Orders Page
 */

const PAST_STATUSES = ['done', 'void', 'cancelled', 'completed'];

function getStatusMeta(status) {
    const s = (status || '').toLowerCase();
    if (s === 'claim') return { key: 'claim', label: 'Ready for Pickup', bannerClass: 'status-claim', active: true, ready: true };
    if (s === 'pay') return { key: 'pay', label: 'To Pay / Preparing', bannerClass: 'status-pay', active: true, ready: false };
    if (s === 'done') return { key: 'done', label: 'Completed', bannerClass: 'status-done', active: false, ready: false };
    if (s === 'void' || s === 'cancelled') return { key: 'done', label: 'Cancelled', bannerClass: 'status-done', active: false, ready: false };
    return { key: 'pay', label: status, bannerClass: 'status-pay', active: true, ready: false };
}

function isActiveOrder(order) {
    return !PAST_STATUSES.includes((order.status || '').toLowerCase());
}

function formatOrderDateTime(dateStr) {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleString('en-PH', {
        month: 'short', day: 'numeric', year: 'numeric',
        hour: '2-digit', minute: '2-digit', hour12: true,
    });
}

function renderOrderCard(order, isActive) {
    const meta = getStatusMeta(order.status);
    const store = CONFIG.STORE;
    const firstImage = order.items?.[0]?.image_url || 'images/placeholder.png';

    const xiemiBrandRed = '#b72525';
    let accentBg = '#f8fafc';
    let statusColor = '#475569';
    let statusBg = '#e2e8f0';

    if (meta.key === 'claim') {
        accentBg = '#f0fdf4';
        statusColor = '#15803d';
        statusBg = '#dcfce7';
    } else if (meta.key === 'pay' && isActive) {
        accentBg = '#fffbeb';
        statusColor = '#b45309';
        statusBg = '#fef3c7';
    }

    const itemsHtml = (order.items || []).map((item, i, arr) => `
        <div style="font-family: 'Inter', sans-serif; display: flex; align-items: center; justify-content: space-between; padding: 12px 0; ${i < arr.length - 1 ? 'border-bottom: 1px dashed #e2e8f0;' : ''}">
            <div style="display: flex; align-items: center; gap: 14px; min-width: 0; flex: 1;">
                
                <div style="width: 52px; height: 52px; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; padding: 4px;">
                    <img src="${item.image_url || 'images/placeholder.png'}" alt="" style="width: 100%; height: 100%; object-fit: contain;">
                </div>
                
                <div style="min-width: 0; flex: 1;">
                    <div style="font-weight: 700; color: #1e293b; font-size: 0.92rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                        <span margin-right: 4px;">${item.quantity}×</span> ${item.name}
                    </div>
                    <div style="color: #64748b; font-size: 0.78rem; font-weight: 500; margin-top: 1px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                        ${[item.size, item.sugar_level ? 'Sugar ' + item.sugar_level : '', item.ice_level].filter(Boolean).join(' · ')}
                    </div>
                </div>
            </div>
            <span style="font-family: 'Inter', sans-serif; font-weight: 700; color: #0f172a; font-size: 0.92rem; padding-left: 12px; flex-shrink: 0;">
                ${Utils.formatCurrency((item.price || 0) * (item.quantity || 1))}
            </span>
        </div>
    `).join('');

    return `
        <div class="order-card-row" style="font-family: 'Inter', sans-serif; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 14px; margin-bottom: 20px; padding: 20px; display: flex; flex-direction: column; gap: 16px; box-shadow: 0 1px 3px rgba(0,0,0,0.01);">
            
            <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px;">
                <div>
                    <span font-weight: 400; font-size: 1.15rem; color: #0f172a; letter-spacing: -0.01em;">${order.id}</span>
                    <span style="color: #cbd5e1; margin: 0 8px; padding: 4px;"></span>
                    <span style="color: #64748b; font-size: 0.8rem; font-weight: 500; display: inline-flex; align-items: center; gap: 4px;">
                        <i class="bi bi-clock" style="font-size: 0.75rem; color: #94a3b8;"></i> ${formatOrderDateTime(order.date)}
                    </span>
                </div>
                <div style="display: flex; align-items: center; gap: 8px;">
                    <span style="background: ${statusBg}; color: ${statusColor}; padding: 4px 10px; border-radius: 6px; font-size: 0.72rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.02em;">${meta.label}</span>
                    <span style="background: #f8fafc; color: #64748b; border: 1px solid #e2e8f0; padding: 3px 8px; border-radius: 6px; font-size: 0.72rem; font-weight: 600;">${order.payment_status || 'Unpaid'}</span>
                </div>
            </div>

            <div style="background: #f8fafc; border-radius: 10px; padding: 4px 16px; border: 1px solid #f1f5f9;">
                ${itemsHtml || '<p class="text-muted small my-3" style="font-weight: 500;">No items in this checkout record</p>'}
            </div>

            ${meta.ready ? `
                <div style="font-size: 0.82rem; color: #475569; background: #f8fafc; border: 1px solid #f1f5f9; padding: 12px 14px; border-radius: 10px; font-weight: 600; display: flex; align-items: center; gap: 8px;">
                    <i class="bi bi-geo-alt-fill" style="color: #64748b;"></i> Ready for pick up at <strong>${store.name}</strong> (${store.hours})
                </div>
            ` : ''}

            <div style="display: flex; justify-content: space-between; align-items: center; padding-top: 4px;">
                <div>
                    <span style="font-size: 0.75rem; color: #94a3b8; text-transform: uppercase; font-weight: 700; letter-spacing: 0.05em;">TO PAY</span>
                    <div style="font-weight: 800; font-size: 1.4rem; color: #0f172a; margin-top: -1px; letter-spacing: -0.02em;">${Utils.formatCurrency(order.total)}</div>
                </div>
                ${isActive ? `
                    <button class="btn view-qr-btn" data-id="${order.id}" data-qr="${order.order_qr || order.id}" style="font-family: 'Inter', sans-serif; background: #0f172a; color: white; border: none; padding: 10px 20px; font-size: 0.82rem;  border-radius: 10px; display: inline-flex; align-items: center; gap: 8px; cursor: pointer; transition: all 0.15s ease; box-shadow: 0 4px 12px rgba(15,23,42,0.06);"
                            onmouseover="this.style.background='${xiemiBrandRed}';" 
                            onmouseout="this.style.background='#0f172a';"
                        <i class="bi bi-qr-code-scan" style="font-size: 0.9rem;"></i> View QR Code
                    </button>
                ` : ''}
            </div>
        </div>
    `;
}

async function OrdersPage() {
    const app = Utils.$('#app');

    if (!AppState.isLoggedIn()) {
        app.innerHTML = `
            <div class="container mt-4 text-center" style="max-width:480px; margin:80px auto;">
                <h3>Sign in to view orders</h3>
                <p class="text-muted mb-4">Track active orders and order history.</p>
                <a href="#/login" class="btn btn-primary">Sign In</a>
            </div>
        `;
        return;
    }

    OrdersModule.requestNotificationPermission();

    try {
        Loader.show();
        const orders = await OrdersModule.getOrders();

        orders.forEach(o => {
            if (o.status === 'claim') {
                const key = String(o.db_id || o.id);
                if (!OrdersModule._notifiedOrders.has(key)) {
                    OrdersModule._notifiedOrders.add(key);
                    OrdersModule.saveNotifiedToStorage();
                }
            }
        });

        const activeOrders = orders.filter(isActiveOrder);
        const pastOrders = orders.filter(o => !isActiveOrder(o));

        if (orders.length === 0) {
            app.innerHTML = `
                <div class="container mt-4 text-center" style="max-width:520px; margin:80px auto;">
                    <h2>No orders yet</h2>
                    <p class="text-muted mb-4">Your orders will appear here after you place one.</p>
                    <a href="#/products" class="btn btn-primary">Browse Menu</a>
                </div>
            `;
            return;
        }

        app.innerHTML = `
            <div class="orders-page container mt-4" style="max-width:720px; padding-bottom:48px;">
                <h1 class="page-section-title">My Orders</h1>
                <p class="page-section-sub">Active orders update automatically. You will be notified when ready for pickup.</p>

                <section class="mb-5">
                    <h2 style="font-size:0.8rem; text-transform:uppercase; letter-spacing:0.05em; color:var(--color-text-light); margin-bottom:16px;">
                        Active Orders (${activeOrders.length})
                    </h2>
                    ${activeOrders.length
                        ? activeOrders.map(o => renderOrderCard(o, true)).join('')
                        : '<p class="text-muted" style="padding:24px; border:1px dashed var(--color-border); border-radius:8px; text-align:center;">No active orders.</p>'}
                </section>

                ${pastOrders.length ? `
                    <section>
                        <h2 style="font-size:0.8rem; text-transform:uppercase; letter-spacing:0.05em; color:var(--color-text-light); margin-bottom:16px; margin-top:16px;">
                            Past Orders (${pastOrders.length})
                        </h2>
                        ${pastOrders.map(o => renderOrderCard(o, false)).join('')}
                    </section>
                ` : ''}
            </div>
        `;

        Utils.$$('.view-qr-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const orderQr = btn.dataset.qr;
                Modal.show({
                    title: 'Pickup QR Code',
                    html: `
                        <div class="text-center">
                            <p class="text-muted small mb-3">Show this at the counter when collecting your order.</p>
                            <div id="modal-qrcode-container" style="display:inline-block; padding:12px; border:1px solid var(--color-border);"></div>
                            <p class="font-weight-bold mt-3">${btn.dataset.id}</p>
                        </div>
                    `,
                    buttons: [{ text: 'Close', action: 'close', class: 'secondary' }],
                    onOpen: () => {
                        const container = document.getElementById('modal-qrcode-container');
                        if (container && typeof QRCode !== 'undefined') {
                            new QRCode(container, {
                                text: orderQr,
                                width: 200,
                                height: 200,
                                correctLevel: QRCode.CorrectLevel.H,
                            });
                        }
                    },
                });
            });
        });

        OrdersModule.startPolling();

    } catch (error) {
        app.innerHTML = `<div class="container mt-4"><p class="text-danger">Failed to load orders.</p></div>`;
    } finally {
        Loader.hide();
    }
}
