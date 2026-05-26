// Handles voucher operations
const VouchersModule = {
    // Get all available vouchers for current user
    async getVouchers() {
        try {
            const response = await API.get('/vouchers/get-vouchers.php', {
                headers: {
                    Authorization: `Bearer ${AppState.token}`
                }
            });
            return response.data || response;
        } catch (error) {
            Toast.error(error.message);
            return [];
        }
    },

    // Claim a specific voucher
    async claimVoucher(voucherId) {
        try {
            const response = await API.post('/vouchers/claim-voucher.php', { voucher_id: voucherId }, {
                headers: {
                    Authorization: `Bearer ${AppState.token}`
                }
            });
            return response;
        } catch (error) {
            Toast.error(error.message);
            throw error;
        }
    },

    // Validate a voucher code at checkout
    async validateVoucher(code, total = 0) {
        try {
            const response = await API.post('/vouchers/validate.php', { code, total }, {
                headers: {
                    Authorization: `Bearer ${AppState.token}`
                }
            });
            return response.data || response;
        } catch (error) {
            throw error;
        }
    }
};

console.log('✓ Vouchers Module loaded');
