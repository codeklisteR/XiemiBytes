/**
 * Login & Register Page Handlers
 */

async function LoginPage() {
    const app = Utils.$('#app');

    app.innerHTML = `
        <div class="auth-container fade-in">
            <div class="auth-card">
                <h2>Welcome Back</h2>
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
            await AuthModule.login(email, password);
            ROUTER.navigate('/');
            Toast.show('Successfully logged in!', 'success');
        } catch (error) {
            Toast.show(error.message || 'Login failed', 'error');
        } finally {
            Loader.hide();
        }
    });
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
