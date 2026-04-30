/**
 * Modal Dialog Component
 */

const Modal = {
    /**
     * Show modal
     */
    show(options = {}) {
        const {
            title = '',
            content = '',
            html = '',
            buttons = [{ text: 'Close', action: 'close' }],
            size = 'md',
            onClose = null,
            onOpen = null,
        } = options;

        const root = Utils.$('#modal-root');
        const modal = Utils.createElement('div', {
            class: 'modal-overlay',
            html: `
                <div class="modal modal-${size}">
                    <div class="modal-header">
                        <h2 class="modal-title">${title}</h2>
                        <button class="modal-close">&times;</button>
                    </div>
                    <div class="modal-body">
                        ${html || `<p>${content}</p>`}
                    </div>
                    <div class="modal-footer">
                        ${buttons
                            .map(
                                (btn) => `
                            <button class="btn btn-${btn.class || 'secondary'}" 
                                    data-action="${btn.action || ''}">
                                ${btn.text}
                            </button>
                        `
                            )
                            .join('')}
                    </div>
                </div>
            `,
        });

        root.appendChild(modal);

        // Close button
        modal.querySelector('.modal-close').addEventListener('click', () => {
            modal.remove();
            if (onClose) onClose();
        });

        // Button actions
        modal.querySelectorAll('.btn[data-action]').forEach((btn) => {
            btn.addEventListener('click', (e) => {
                const action = e.target.dataset.action;
                const handlerKey = `on${action.charAt(0).toUpperCase() + action.slice(1)}`;

                if (action === 'close') {
                    modal.remove();
                    if (onClose) onClose();
                } else if (typeof options[handlerKey] === 'function') {
                    // Call the handler — if it doesn't throw, close the modal
                    options[handlerKey]();
                    // Only close if handler didn't already call Modal.hide()
                    if (modal.isConnected) modal.remove();
                }
            });
        });

        // Close on overlay click
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
                if (onClose) onClose();
            }
        });

        // onOpen callback after DOM is ready
        if (onOpen) setTimeout(onOpen, 0);

        return modal;
    },

    /**
     * Hide/remove the currently open modal
     */
    hide() {
        const root = Utils.$('#modal-root');
        if (root) root.innerHTML = '';
    },

    /**
     * Confirm dialog
     */
    confirm(message, onConfirm, onCancel) {
        return this.show({
            title: 'Confirm',
            content: message,
            buttons: [
                { text: 'Cancel', action: 'cancel', class: 'secondary' },
                { text: 'Confirm', action: 'confirm', class: 'primary' },
            ],
            onCancel: onCancel || (() => {}),
            onConfirm: onConfirm || (() => {}),
        });
    },

    /**
     * Alert dialog
     */
    alert(message) {
        return this.show({
            title: 'Alert',
            content: message,
            buttons: [{ text: 'OK', action: 'close', class: 'primary' }],
        });
    },
};

console.log('✓ Modal loaded');