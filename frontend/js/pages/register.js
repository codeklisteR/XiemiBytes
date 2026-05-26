/**
 * Register Page
 */

async function RegisterPage() {
    const app = Utils.$('#app');

    localStorage.removeItem('mock_users');

    app.innerHTML = `
        <div class="auth-container">
            <div class="auth-card" style="max-width:440px; border:1px solid var(--color-border); box-shadow:none;">
                <div class="text-center mb-3">
                    <h2 style="font-weight:700; margin-bottom:4px;">Create Account</h2>
                    <p class="text-muted" style="font-size:0.93rem;">Register to order and track your drinks online.</p>
                </div>
                <form id="register-form">
                    <div class="form-group mb-3">
                        <label for="name">Full Name</label>
                        <input type="text" id="name" class="form-control" placeholder="John Doe" required>
                    </div>
                    <div class="form-group mb-3">
                        <label for="phone">Phone Number</label>
                        <input type="tel" id="phone" class="form-control" placeholder="09XX XXX XXXX" required maxlength="11">
                        <small class="text-muted">Required for order updates (10–11 digits)</small>
                    </div>
                    <div class="form-group mb-3">
                        <label for="email">Email Address</label>
                        <input type="email" id="email" class="form-control" placeholder="your@email.com" required>
                    </div>
                    <div class="form-group mb-4">
                        <label for="password">Password</label>
                        <input type="password" id="password" class="form-control" placeholder="At least 8 characters" required>
                    </div>
                    <button type="submit" class="btn btn-primary btn-block w-100">Create Account</button>
                </form>
                <div class="auth-links text-center mt-4">
                    <p class="text-muted">Already have an account? <a href="#/login">Sign in</a></p>
                </div>
            </div>
        </div>
    `;

    Utils.$('#register-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = Utils.$('#name').value.trim();
        const phone = Utils.$('#phone').value.replace(/\D/g, '');
        const email = Utils.$('#email').value.trim();
        const password = Utils.$('#password').value;

        if (name.length < 2) return Toast.show('Please enter your full name.', 'error');
        if (phone.length < 10 || phone.length > 11) return Toast.show('Please enter a valid phone number.', 'error');
        if (!email.includes('@')) return Toast.show('Please enter a valid email.', 'error');
        if (password.length < 8) return Toast.show('Password must be at least 8 characters.', 'error');

        try {
            Loader.show();
            await AuthModule.register({ username: name, email, phone, password });

            app.innerHTML = `
                <div class="auth-container">
                    <div class="auth-card text-center" style="max-width:440px; border:1px solid var(--color-border); box-shadow:none;">
                        <h2 style="font-weight:700; margin-bottom:8px;">Account Created</h2>
                        <p class="text-muted mb-4">You can now sign in and start ordering.</p>
                        <a href="#/login" class="btn btn-primary btn-block w-100">Sign In</a>
                    </div>
                </div>
            `;
        } catch (error) {
            Toast.show(error.message || 'Registration failed.', 'error');
        } finally {
            Loader.hide();
        }
    });
}
