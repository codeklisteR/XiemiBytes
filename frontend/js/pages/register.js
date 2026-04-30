/**
 * Register Page Handler
 */

async function RegisterPage() {
    const app = Utils.$('#app');

    app.innerHTML = `
        <div class="auth-page fade-in container mt-4">
            <div class="auth-card card mx-auto" style="max-width: 400px;">
                <h2 class="text-center">Create Account</h2>
                <form id="register-form" class="mt-3">
                    <div class="form-group mb-3">
                        <label>Full Name</label>
                        <input type="text" name="name" class="form-control" placeholder="John Doe" required>
                    </div>
                    <div class="form-group mb-3">
                        <label>Email</label>
                        <input type="email" name="email" class="form-control" placeholder="your@email.com" required>
                    </div>
                    <div class="form-group mb-3">
                        <label>Password</label>
                        <input type="password" name="password" class="form-control" placeholder="••••••••" required>
                    </div>
                    <button type="submit" class="btn btn-primary btn-block w-100">Register</button>
                </form>
                <p class="text-center mt-3">
                    Already have an account? <a href="#/login">Login here</a>
                </p>
            </div>
        </div>
    `;

    Utils.on(Utils.$('#register-form'), 'submit', async (e) => {
        e.preventDefault();
        const data = Utils.getFormData('#register-form');
        
        try {
            Loader.show();
            await AuthModule.register(data);
            ROUTER.navigate('/');
        } catch (error) {
            Utils.error('Registration failed:', error);
        } finally {
            Loader.hide();
        }
    });
}
