/**
 * Login & Register Page Handlers
 */

async function LoginPage() {
    const app = Utils.$('#app');
    const params = Utils.getQueryParams();
    const reason = params.reason;
    
    let message = 'Welcome Back';
    let subMessage = 'Please sign in to continue.';

    if (reason === 'cart_auth') {
        message = 'Login to Checkout';
        subMessage = 'You need to sign in to your account to review your cart and proceed with your order.';
    } else if (reason === 'orders_auth') {
        message = 'View Your Orders';
        subMessage = 'Sign in to see your order history and track your current deliveries.';
    }

    app.innerHTML = `
        <div class="auth-container fade-in">
            <div class="auth-card">
                <div class="text-center mb-4">
                    <h2>${message}</h2>
                    <p class="text-muted">${subMessage}</p>
                </div>
                <form id="login-form">
                    <div class="form-group">
                        <label for="email">Email Address</label>
                        <input type="email" id="email" class="form-control" placeholder="Enter your email" required>
                    </div>
                    <div class="form-group">
                        <label for="password">Password</label>
                        <input type="password" id="password" class="form-control" placeholder="Enter your password" required>
                    </div>
                    <button type="submit" class="btn btn-primary btn-block mt-2">Sign In</button>
                    <div class="mt-3 text-center">
                        <small class="text-muted">Or for testing:</small><br>
                        <button type="button" id="admin-demo-btn" class="btn btn-sm btn-outline-secondary mt-1">Login as Admin (Demo)</button>
                    </div>
                </form>
                <div class="auth-links">
                    <p>Don't have an account? <a href="#/register">Register here</a></p>
                </div>
            </div>
        </div>
    `;

    // Attach event listener
    const form = Utils.$('#login-form');
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = Utils.$('#email').value;
        const password = Utils.$('#password').value;

        try {
            Loader.show();
            const user = await AuthModule.login(email, password);
            
            // Redirect based on role
            if (user.role === 'admin' || user.role === 'super_admin' || user.role === 'staff') {
                ROUTER.navigate('/admin');
            } else {
                ROUTER.navigate('/');
            }
            
            Toast.show('Successfully logged in!', 'success');
        } catch (error) {
            Toast.show(error.message || 'Login failed', 'error');
        } finally {
            Loader.hide();
        }
    });

    // Admin demo button helper
    const adminBtn = Utils.$('#admin-demo-btn');
    if (adminBtn) {
        adminBtn.addEventListener('click', () => {
            Utils.$('#email').value = 'admin@xiemibytes.com';
            Utils.$('#password').value = 'password123';
            form.dispatchEvent(new Event('submit'));
        });
    }
}

async function RegisterPage() {
    const app = Utils.$('#app');

    app.innerHTML = `
        <div class="auth-container fade-in">
            <div class="auth-card">
                <h2>Create Account</h2>
                <form id="register-form">
                    <div class="form-group">
                        <label for="name">Full Name</label>
                        <input type="text" id="name" class="form-control" placeholder="John Doe" required>
                    </div>
                    <div class="form-group">
                        <label for="email">Email Address</label>
                        <input type="email" id="email" class="form-control" placeholder="Enter your email" required>
                    </div>
                    <div class="form-group">
                        <label for="password">Password</label>
                        <input type="password" id="password" class="form-control" placeholder="Create a password" required>
                    </div>
                    <button type="submit" class="btn btn-primary btn-block mt-2">Register</button>
                </form>
                <div class="auth-links">
                    <p>Already have an account? <a href="#/login">Sign in</a></p>
                </div>
            </div>
        </div>
    `;

    // Attach event listener
    const form = Utils.$('#register-form');
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = Utils.$('#name').value;
        const email = Utils.$('#email').value;
        const password = Utils.$('#password').value;

        try {
            Loader.show();
            await AuthModule.register({ name, email, password });
            ROUTER.navigate('/');
            Toast.show('Registration successful!', 'success');
        } catch (error) {
            Toast.show(error.message || 'Registration failed', 'error');
        } finally {
            Loader.hide();
        }
    });
}
