/**
 * Authentication Module
 * Handles user login, registration, and authentication state
 */

const AuthModule = {
    // DONE
    async login(email, password) {
        try {
            const response = await API.post('/auth/login.php', {
                email,
                password,
            }, { skipAuthRedirect: true });

            AppState.login(response.user, response.token);

            return response.user;
        } catch (error) {
            throw error;
        }
    },

    /**
     * User registration
     */
    async register(data) {
        try {
            const response = await API.post('/auth/register.php', {
                username: data.username,
                email: data.email,
                phone: data.phone,
                password: data.password,
            });

            Toast.success(response.message || 'Registration successful');

            return response.user;

        } catch (error) {
            Toast.error(error.message);
            throw error;
        }
    },

    /**
     * User logout
     */
    async logout() {
        try {
            // If backend implements logout, we can call it here:
            // await API.post('/auth/logout.php', {});
        } catch (error) {
            Utils.error('Logout error:', error);
        } finally {
            AppState.logout();
            Toast.success(CONSTANTS.MESSAGES.LOGOUT_SUCCESS);
            ROUTER.push(CONFIG.ROUTES.LOGIN);
        }
    },

    /**
     * Get current user
     */
    async getCurrentUser() {
        try {
            const token = AppState.token;

            if (!token) {
                throw new Error('Not authenticated');
            }

            const response = await API.get('/auth/user.php', {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

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
            const response = await API.post('/auth/user.php', data, {
                headers: {
                    Authorization: `Bearer ${AppState.token}`
                }
            });
            const newUser = response.user || { ...AppState.user, ...data };
            AppState.setState({ user: newUser });
            Toast.success(CONSTANTS.MESSAGES.PROFILE_UPDATED || 'Profile updated!');
            return newUser;
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
            const response = await API.post('/auth/change-password.php', {
                current_password: currentPassword,
                new_password: newPassword,
                new_password_confirmation: confirmPassword,
            }, {
                headers: {
                    Authorization: `Bearer ${AppState.token}`
                }
            });

            Toast.success(response.message || 'Password changed successfully');
            return true;

        } catch (error) {
            Toast.error(error.message);
            throw error;
        }
    },
};

console.log('✓ Auth Module loaded');