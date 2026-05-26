/**
 * Login Page Handler
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
        <div class="auth-container">
            <div class="auth-card" id="auth-card-main" style="max-width:400px; border:1px solid var(--color-border); box-shadow:none;">
                <div class="text-center mb-3">
                    <h2 style="font-weight:800; color:#1e293b; margin-bottom:4px;">${message}</h2>
                    <p class="text-muted" style="font-size:0.92rem; margin-top:0; margin-bottom:20px;">${subMessage}</p>
                </div>
                <form id="login-form">
                    <div class="form-group mb-3">
                        <label for="email" style="font-size:0.85rem; font-weight:600; color:#475569;">Email Address</label>
                        <input type="email" id="email" class="form-control" placeholder="Enter your email" required style="border-radius:10px;">
                    </div>
                    <div class="form-group mb-3">
                        <label for="password" style="font-size:0.85rem; font-weight:600; color:#475569;">Password</label>
                        <input type="password" id="password" class="form-control" placeholder="Enter your password" required style="border-radius:10px;">
                    </div>
                    <div class="text-right mb-3">
                        <a href="#" id="forgot-link" style="font-size:0.85rem; color:var(--color-primary); font-weight:600;">Forgot password?</a>
                    </div>
                    <button type="submit" class="btn btn-primary btn-block mt-1" style="border-radius:10px; font-weight:700; padding:12px;">Sign In</button>
                </form>
                <div class="auth-links text-center mt-3">
                    <p style="font-size:0.9rem; color:#64748b;">Don't have an account? <a href="#/register" style="font-weight:600;">Register here</a></p>
                </div>
            </div>
        </div>
    `;

    const form = Utils.$('#login-form');
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = Utils.$('#email').value;
        const password = Utils.$('#password').value;

        try {
            Loader.show();
            const user = await AuthModule.login(email, password);
            const role = user?.role?.toLowerCase();
            if (['staff', 'manager', 'superadmin'].includes(role)) {
                ROUTER.navigate('/admin');
            } else {
                ROUTER.navigate('/');
            }
            Toast.show(CONSTANTS.MESSAGES.LOGIN_SUCCESS, 'success');
        } catch (error) {
            const msg = error?.message || CONSTANTS.MESSAGES.LOGIN_FAILED;
            Toast.show(msg, 'error');
        } finally {
            Loader.hide();
        }
    });

    Utils.$('#forgot-link').addEventListener('click', (e) => {
        e.preventDefault();
        showForgotPasswordForm();
    });
}

function showForgotPasswordForm() {
    const card = Utils.$('#auth-card-main');
    if (!card) return;

    card.innerHTML = `
        <div class="text-center mb-3">
            <div style="font-size:2.5rem; margin-bottom:8px;">🔐</div>
            <h4 style="font-weight:800; color:#1e293b; margin-bottom:4px;">Forgot Password?</h4>
            <p class="text-muted" style="font-size:0.88rem; margin-top:0; margin-bottom:20px;">Enter your email and we'll send you a reset link.</p>
        </div>
        <form id="forgot-form">
            <div class="form-group mb-4">
                <label style="font-size:0.85rem; font-weight:600; color:#475569;">Email Address</label>
                <input type="email" id="forgot-email" class="form-control" placeholder="your@email.com" required style="border-radius:10px;">
            </div>
            <button type="submit" class="btn btn-primary btn-block" style="border-radius:10px; font-weight:700; padding:12px;">Send Reset Link</button>
        </form>
        <div class="text-center mt-3">
            <a href="#" id="back-to-login" style="font-size:0.88rem; color:#64748b; font-weight:600;">← Back to Sign In</a>
        </div>
    `;

    Utils.$('#forgot-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = Utils.$('#forgot-email').value;
        Loader.show();
        await new Promise(r => setTimeout(r, 800));
        Loader.hide();
        showForgotSuccess(email);
    });

    Utils.$('#back-to-login').addEventListener('click', (e) => {
        e.preventDefault();
        LoginPage();
    });
}

function showForgotSuccess(email) {
    const card = Utils.$('#auth-card-main');
    if (!card) return;

    card.innerHTML = `
        <div class="text-center py-3">
            <div style="font-size:3rem; margin-bottom:12px;">📧</div>
            <h4 style="font-weight:800; color:#1e293b; margin-bottom:4px;">Check Your Email</h4>
            <p class="text-muted" style="font-size:0.9rem; margin-top:0; margin-bottom:4px;">We sent a password reset link to:</p>
            <p style="font-weight:700; color:#1e293b; margin-bottom:20px;">${email}</p>
            <p class="text-muted" style="font-size:0.82rem; margin-bottom:24px;">Didn't receive it? Check your spam folder or try again.</p>
            <button class="btn btn-outline-secondary btn-block" id="resend-btn" style="border-radius:10px; font-weight:600; margin-bottom:10px;">Resend Email</button>
            <a href="#" id="back-to-login2" style="font-size:0.88rem; color:#64748b; font-weight:600;">← Back to Sign In</a>
        </div>
    `;

    Utils.$('#resend-btn').addEventListener('click', async () => {
        Toast.show('Reset link resent!', 'success');
    });

    Utils.$('#back-to-login2').addEventListener('click', (e) => {
        e.preventDefault();
        LoginPage();
    });
}