/**
 * Vouchers Module
 * Handles voucher and discount operations
 */

const VouchersModule = {
    /**
     * Get user vouchers
     */
    async getVouchers() {
        try {
            /*
            // REAL BACKEND API CALL:
            const response = await API.get('/vouchers');
            return response.data || response;
            */

            // Simulate network delay
            await new Promise(resolve => setTimeout(resolve, 400));

            // Mock Vouchers Data
            return [
                { id: 1, code: 'WELCOME10', description: '10% off your first order', discount: 0.1, expiry: '2023-12-31' },
                { id: 2, code: 'COFFEE20', description: '20% off on all coffee drinks', discount: 0.2, expiry: '2023-11-30' }
            ];
        } catch (error) {
            Toast.error(error.message);
            return [];
        }
    },

    /**
     * Validate voucher code
     */
    async validateVoucher(code) {
        try {
            /*
            // REAL BACKEND API CALL:
            const response = await API.post('/vouchers/validate', { code });
            return response.data || response;
            */

            await new Promise(resolve => setTimeout(resolve, 300));

            const voucher = MOCK_VOUCHERS.find(v => v.code === code.toUpperCase() && v.status === 'active');
            if (!voucher) throw new Error('Invalid or expired voucher code');

            return {
                valid: true,
                code: voucher.code,
                type: voucher.type,       // 'percentage' or 'fixed'
                discount: voucher.discount,
                message: voucher.type === 'percentage'
                    ? `${voucher.discount}% discount applied!`
                    : `₱${voucher.discount} off applied!`
            };
        } catch (error) {
            Toast.error(error.message);
            throw error;
        }
    }
};

console.log('✓ Vouchers Module loaded');
