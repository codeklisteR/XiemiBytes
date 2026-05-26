/**
 * Orders Module
 */

const OrdersModule = {
    _notifiedOrders: new Set(),
    _pollTimer: null,

    async getOrders() {
        try {
            const response = await API.get('/orders/get-order.php', {
                headers: { Authorization: `Bearer ${AppState.token}` },
            });
            return Array.isArray(response) ? response : (response.data || []);
        } catch (error) {
            Toast.error(error.message);
            throw error;
        }
    },

    async placeOrder(orderData) {
        try {
            const response = await API.post('/orders/place-order.php', orderData, {
                headers: { Authorization: `Bearer ${AppState.token}` },
            });
            return response;
        } catch (error) {
            Toast.error(error.message);
            throw error;
        }
    },

    async checkReadyNotifications() {
        if (!AppState.isLoggedIn()) return;

        try {
            const orders = await this.getOrders();
            const readyOrders = orders.filter(o => o.status === 'claim');

            readyOrders.forEach(order => {
                const key = String(order.db_id || order.id);
                if (this._notifiedOrders.has(key)) return;
                this._notifiedOrders.add(key);
                this.notifyReadyForPickup(order);
            });
        } catch (e) {
            // silent fail on background poll
        }
    },

    notifyReadyForPickup(order) {
        const store = CONFIG.STORE;
        const msg = `Order ${order.id} is ready for pickup at ${store.name}, ${store.address}.`;

        Toast.show('Your order is ready for pickup!', 'success', 6000);

        if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('Order Ready for Pickup', {
                body: msg,
                icon: 'images/xiemihead.png',
            });
        }
    },

    requestNotificationPermission() {
        if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission();
        }
    },

    startPolling() {
        if (this._pollTimer) return;
        this.checkReadyNotifications();
        this._pollTimer = setInterval(() => {
            this.checkReadyNotifications();
        }, CONFIG.UI.ORDER_POLL_INTERVAL || 20000);
    },

    stopPolling() {
        if (this._pollTimer) {
            clearInterval(this._pollTimer);
            this._pollTimer = null;
        }
    },

    loadNotifiedFromStorage() {
        try {
            const saved = sessionStorage.getItem('notified_ready_orders');
            if (saved) {
                JSON.parse(saved).forEach(id => this._notifiedOrders.add(String(id)));
            }
        } catch (e) {}
    },

    saveNotifiedToStorage() {
        try {
            sessionStorage.setItem(
                'notified_ready_orders',
                JSON.stringify([...this._notifiedOrders])
            );
        } catch (e) {}
    },
};

OrdersModule.loadNotifiedFromStorage();

console.log('✓ Orders Module loaded');
