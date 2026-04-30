/**
 * Loading Spinner Component
 */

const Loader = {
    /**
     * Show loader
     */
    show() {
        const loader = Utils.$('#loader');
        if (loader) {
            loader.style.display = 'flex';
        }
    },

    /**
     * Hide loader
     */
    hide() {
        const loader = Utils.$('#loader');
        if (loader) {
            loader.style.display = 'none';
        }
    },
};

console.log('✓ Loader loaded');