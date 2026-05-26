/**
 * Cart Module
 * Handles shopping cart operations
 */

const CartModule = {
    /**
     * Add product to cart
     */
    addProduct(product, options = {}) {
        try {
            AppState.addToCart(product, options);
            Toast.success(CONSTANTS.MESSAGES.ITEM_ADDED_TO_CART);
            return true;
        } catch (error) {
            Toast.error(error.message);
            return false;
        }
    },

    /**
     * Remove item from cart
     */
    removeItem(itemId) {
        try {
            AppState.removeFromCart(itemId);
            Toast.success(CONSTANTS.MESSAGES.ITEM_REMOVED_FROM_CART);
            return true;
        } catch (error) {
            Toast.error(error.message);
            return false;
        }
    },

    /**
     * Update item quantity
     */
    updateQuantity(itemId, quantity) {
        if (quantity < 1) {
            this.removeItem(itemId);
            return;
        }

        AppState.updateCartItem(itemId, { quantity });
    },

    /**
     * Clear cart
     */
    clearCart() {
        AppState.clearCart();
        Toast.success('Cart cleared');
    },

    /**
     * Apply discount/voucher
     */
    applyDiscount(discountAmount) {
        AppState.cart.discount = discountAmount;
        AppState.setState({ cart: AppState.cart });
    },

    /**
     * Get cart
     */
    getCart() {
        return AppState.cart;
    },

    /**
     * Get item count
     */
    getItemCount() {
        return AppState.getCartItemCount();
    },
};

console.log('✓ Cart Module loaded');