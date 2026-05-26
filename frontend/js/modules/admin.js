/**
 * Admin Module
 * Handles administrative operations
 */

const AdminModule = {
    /**
     * Get dashboard stats
     */
    async getStats() {
        try {
            const response = await API.get('/admin/stats.php');
            return response || {
                total_sales: 0,
                total_orders: 0,
                total_customers: 0,
                recent_activity: []
            };
        } catch (error) {
            Toast.error(error.message);
            throw error;
        }
    }
};

console.log('✓ Admin Module loaded');
