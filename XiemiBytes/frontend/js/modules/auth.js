/**
 * Authentication Module
 * Handles user login, registration, and authentication state
 */

const AuthModule = {
    /**
     * User login
     */
    async login(email, password) {
        try {
            const response = await API.post('/auth/login', {
                email,
                password,
            });

            AppState.login(response.user, response.token);
            Toast.success(CONSTANTS.MESSAGES.LOGIN_SUCCESS);

            return response.user;
        } catch (error) {
            Toast.error(error.message);
            throw error;
        }
    },

    /**
     * User registration
     */
    async register(data) {
        try {
            const response = await API.post('/auth/register', data);

            AppState.login(response.user, response.token);
            Toast.success(CONSTANTS.MESSAGES.REGISTRATION_SUCCESS);

            return response.user;
        } catch (error) {
            if (error.errors) {
                Object.values(error.errors).forEach((messages) => {
                    messages.forEach((msg) => Toast.error(msg));
                });
            } else {
                Toast.error(error.message);
            }
            throw error;
        }
    },

    /**
     * User logout
     */
    async logout() {
        try {
            await API.post('/auth/logout', {});
        } catch (error) {
            Utils.error('Logout error:', error);
        } finally {
            AppState.logout();
            Toast.success(CONSTANTS.MESSAGES.LOGOUT_SUCCESS);
            ROUTER.push(CONFIG.ROUTES.HOME);
        }
    },

    /**
     * Get current user
     */
    async getCurrentUser() {
        try {
            const response = await API.get('/auth/user');
            AppState.setState({ user: response.user });
            return response.user;
        } catch (error) {
            AppState.logout();
            throw error;
        }
    },

    /**
     * Update profile
     */
    async updateProfile(data) {
        try {
            const response = await API.put('/auth/profile', data);
            AppState.setState({ user: response.user });
            Toast.success(CONSTANTS.MESSAGES.PROFILE_UPDATED);
            return response.user;
        } catch (error) {
            Toast.error(error.message);
            throw error;
        }
    },

    /**
     * Change password
     */
    async changePassword(currentPassword, newPassword, confirmPassword) {
        if (newPassword !== confirmPassword) {
            Toast.error(CONSTANTS.MESSAGES.PASSWORD_MISMATCH);
            throw new Error(CONSTANTS.MESSAGES.PASSWORD_MISMATCH);
        }

        try {
            await API.post('/auth/change-password', {
                current_password: currentPassword,
                new_password: newPassword,
                new_password_confirmation: confirmPassword,
            });

            Toast.success('Password changed successfully');
            return true;
        } catch (error) {
            Toast.error(error.message);
            throw error;
        }
    },
};

console.log('✓ Auth Module loaded');