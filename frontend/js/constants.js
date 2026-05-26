const CONSTANTS = {
    // Status Types
    ORDER_STATUS: {
        CONFIRMED: 'confirmed',
        PREPARING: 'preparing',
        READY_FOR_PICKUP: 'ready_for_pickup',
        COMPLETED: 'completed',
        CANCELLED: 'cancelled',
    },

    PAYMENT_STATUS: {
        UNPAID: 'unpaid',
        PAID: 'paid',
    },

    PAYMENT_METHOD: {
        CASH_ON_PICKUP: 'cash_on_pickup',
    },

    USER_ROLE: {
        CUSTOMER: 'customer',
        STAFF: 'staff',
        MANAGER: 'manager',
        SUPERADMIN: 'superadmin',
    },

    DISCOUNT_TYPE: {
        PERCENTAGE: 'percentage',
        FIXED_AMOUNT: 'fixed_amount',
    },

    // Messages
    MESSAGES: {
        // Success
        LOGIN_SUCCESS: 'Logged in successfully',
        LOGOUT_SUCCESS: 'Logged out successfully',
        REGISTRATION_SUCCESS: 'Account created successfully',
        ITEM_ADDED_TO_CART: 'Item added to cart',
        ITEM_REMOVED_FROM_CART: 'Item removed from cart',
        ORDER_PLACED: 'Order placed successfully',
        PROFILE_UPDATED: 'Profile updated successfully',

        // Error
        INVALID_EMAIL: 'Please enter a valid email',
        INVALID_PHONE: 'Please enter a valid phone number',
        PASSWORD_MISMATCH: 'Passwords do not match',
        LOGIN_FAILED: 'Invalid email or password',
        NETWORK_ERROR: 'Network error. Please try again.',
        SOMETHING_WRONG: 'Something went wrong. Please try again.',
        UNAUTHORIZED: 'You are not authorized to perform this action',
        NOT_FOUND: 'The requested item was not found',
    },

    // HTTP Status Codes
    HTTP: {
        OK: 200,
        CREATED: 201,
        BAD_REQUEST: 400,
        UNAUTHORIZED: 401,
        FORBIDDEN: 403,
        NOT_FOUND: 404,
        SERVER_ERROR: 500,
    },
};

console.log('✓ Constants loaded');