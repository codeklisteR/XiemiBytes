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
            /*
            // REAL BACKEND API CALL:
            const response = await API.post('/auth/login', {
                email,
                password,
            });

            AppState.login(response.user, response.token);
            Toast.success(CONSTANTS.MESSAGES.LOGIN_SUCCESS);

            return response.user;
            */

            // Simulate network delay
            await new Promise(resolve => setTimeout(resolve, 500));

            // Mock successful login response
            // Use 'admin@xiemibytes.com' to test admin access
            // Mock role determination
            let role = CONSTANTS.USER_ROLE.CUSTOMER;
            if (email === 'staff@xiemibytes.com') role = CONSTANTS.USER_ROLE.STAFF;
            if (email === 'manager@xiemibytes.com') role = CONSTANTS.USER_ROLE.MANAGER;
            if (email === 'superadmin@xiemibytes.com') role = CONSTANTS.USER_ROLE.SUPERADMIN;

            const mockUser = {
                id: 1,
                first_name: Utils.capitalize(role),
                email: email,
                role: role
            };
            const mockToken = 'mock-jwt-token-123';

            AppState.login(mockUser, mockToken);
            Toast.success(CONSTANTS.MESSAGES.LOGIN_SUCCESS || 'Login successful!');

            return mockUser;
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
            /*
            // REAL BACKEND API CALL:
            const response = await API.post('/auth/register', data);

            AppState.login(response.user, response.token);
            Toast.success(CONSTANTS.MESSAGES.REGISTRATION_SUCCESS);

            return response.user;
            */

            // Simulate network delay
            await new Promise(resolve => setTimeout(resolve, 500));

            // Mock successful registration response
            const firstName = data.name ? data.name.split(' ')[0] : 'User';
            const mockUser = { id: Date.now(), first_name: firstName, email: data.email, role: 'user' };
            const mockToken = 'mock-jwt-token-123';

            AppState.login(mockUser, mockToken);
            Toast.success(CONSTANTS.MESSAGES.REGISTRATION_SUCCESS || 'Registration successful!');

            return mockUser;
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
            /*
            // REAL BACKEND API CALL:
            await API.post('/auth/logout', {});
            */

            // Simulate network delay
            await new Promise(resolve => setTimeout(resolve, 300));
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
            /*
            // REAL BACKEND API CALL:
            const response = await API.get('/auth/user');
            AppState.setState({ user: response.user });
            return response.user;
            */

            // Simulate network delay
            await new Promise(resolve => setTimeout(resolve, 300));

            // Restore user from localStorage if token exists
            const storedUser = Storage.getUser();
            if (Storage.getToken() && storedUser) {
                AppState.setState({ user: storedUser });
                return storedUser;
            }
            throw new Error('Not authenticated');
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
            /*
            // REAL BACKEND API CALL:
            const response = await API.put('/auth/profile', data);
            AppState.setState({ user: response.user });
            Toast.success(CONSTANTS.MESSAGES.PROFILE_UPDATED);
            return response.user;
            */

            // Simulate network delay
            await new Promise(resolve => setTimeout(resolve, 300));

            const newUser = { ...AppState.user, ...data };
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
            /*
            // REAL BACKEND API CALL:
            await API.post('/auth/change-password', {
                current_password: currentPassword,
                new_password: newPassword,
                new_password_confirmation: confirmPassword,
            });
            */

            // Simulate network delay
            await new Promise(resolve => setTimeout(resolve, 500));

            Toast.success('Password changed successfully');
            return true;
        } catch (error) {
            Toast.error(error.message);
            throw error;
        }
    },
};

console.log('✓ Auth Module loaded');