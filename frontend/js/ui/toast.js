/**
 * Toast Notification Component
 * Shows temporary notifications to user
 */

const Toast = {
    /**
     * Show toast message
     */
    show(message, type = 'info', duration = CONFIG.UI.TOAST_DURATION) {
        const container = Utils.$('#toast-root');
        const toast = Utils.createElement('div', {
            class: `toast toast-${type}`,
            html: `
                <div class="toast-content">
                    <span class="toast-message">${message}</span>
                    <button class="toast-close">&times;</button>
                </div>
            `,
        });

        container.appendChild(toast);

        // Auto remove after duration
        const timeout = setTimeout(() => {
            toast.remove();
        }, duration);

        // Manual close
        toast.querySelector('.toast-close').addEventListener('click', () => {
            clearTimeout(timeout);
            toast.remove();
        });

        return toast;
    },

    /**
     * Show success toast
     */
    success(message) {
        return this.show(message, 'success');
    },

    /**
     * Show error toast
     */
    error(message) {
        return this.show(message, 'error', 5000);
    },

    /**
     * Show info toast
     */
    info(message) {
        return this.show(message, 'info');
    },

    /**
     * Show warning toast
     */
    warning(message) {
        return this.show(message, 'warning', 5000);
    },
};

console.log('✓ Toast loaded');