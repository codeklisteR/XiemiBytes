/**
 * Header Component
 */

const HeaderComponent = {
    /**
     * Render header
     */
    render() {
        const header = Utils.$('#header');
        const cartCount = AppState.getCartItemCount();

        header.innerHTML = `
            <nav class="navbar">
                <div class="nav-brand">
                    <a href="#/">
                        <img src="images/logo.png" alt="XiemiBytes" class="logo">
                        <span class="brand-name">XiemiBytes</span>
                    </a>
                </div>

                <ul class="nav-menu">
                    <li><a href="#/">Home</a></li>
                    <li><a href="#/products">Products</a></li>
                    <li><a href="#/orders">Orders</a></li>
                    <li>
                        <a href="#/cart" class="cart-link">
                            Cart <span class="cart-badge" id="cart-badge">${cartCount}</span>
                        </a>
                    </li>
                    ${AppState.isAdmin() ? '<li><a href="#/admin">Admin</a></li>' : ''}
                    <li id="auth-menu"></li>
                </ul>
            </nav>
        `;

        this.updateAuthMenu();
    },

    /**
     * Update auth menu based on login state
     */
    updateAuthMenu() {
        const authMenu = Utils.$('#auth-menu');

        if (AppState.isLoggedIn()) {
            authMenu.innerHTML = `
                <div class="user-menu">
                    <button class="btn-user">${AppState.user.first_name}</button>
                    <div class="dropdown">
                        <a href="#/profile">Profile</a>
                        <a href="#/orders">My Orders</a>
                        ${AppState.isAdmin() ? '<a href="#/admin">Admin</a>' : ''}
                        <hr>
                        <a href="#" onclick="AuthModule.logout(); return false;">Logout</a>
                    </div>
                </div>
            `;
        } else {
            authMenu.innerHTML = `
                <a href="#/login" class="btn btn-primary">Login</a>
                <a href="#/register" class="btn btn-secondary">Register</a>
            `;
        }
    },

    /**
     * Update cart badge
     */
    updateCartBadge() {
        const badge = Utils.$('#cart-badge');
        if (badge) {
            const count = AppState.getCartItemCount();
            badge.textContent = count;
            badge.style.display = count > 0 ? 'inline' : 'none';
        }
    },
};

console.log('✓ Header loaded');