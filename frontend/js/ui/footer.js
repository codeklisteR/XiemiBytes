/**
 * Site footer for customer pages
 */
const FooterComponent = {
    render() {
        if (document.body.classList.contains('admin-layout')) return;

        let footer = Utils.$('#site-footer');
        if (!footer) {
            footer = document.createElement('footer');
            footer.id = 'site-footer';
            footer.className = 'site-footer';
            const app = Utils.$('#app');
            if (app && app.parentNode) {
                app.parentNode.insertBefore(footer, app.nextSibling);
            } else {
                document.body.appendChild(footer);
            }
        }

        const s = CONFIG.STORE;
        footer.innerHTML = `
                <div class="site-footer-inner" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 32px; padding-bottom: 32px; border-bottom: 1px solid #e2e8f0;">
                    
                    <div>
                        <h5 style="font-size: 0.75rem; text-transform: uppercase; color: #94a3b8; font-weight: 700; letter-spacing: 0.05em; margin-bottom: 16px;">
                            ${s.name}
                        </h5>
                        <p style="font-size: 0.88rem; line-height: 1.6; color: #64748b; margin: 0;">
                            Handcrafted milk tea and fruit beverages, made fresh for every order.
                        </p>
                    </div>

                    <div>
                        <h5 style="font-size: 0.75rem; text-transform: uppercase; color: #94a3b8; font-weight: 700; letter-spacing: 0.05em; margin-bottom: 16px;">
                            Visit Us
                        </h5>
                        <p style="font-size: 0.88rem; line-height: 1.6; color: #64748b; margin: 0;">
                            ${s.address || ''}${s.city ? `<br>${s.city}` : ''}
                        </p>
                    </div>

                    <div>
                        <h5 style="font-size: 0.75rem; text-transform: uppercase; color: #94a3b8; font-weight: 700; letter-spacing: 0.05em; margin-bottom: 16px;">
                            Store Hours
                        </h5>
                        <p style="font-size: 0.88rem; line-height: 1.6; color: #64748b; margin: 0;">
                            ${s.hours}
                        </p>
                    </div>

                    <div>
                        <h5 style="font-size: 0.75rem; text-transform: uppercase; color: #94a3b8; font-weight: 700; letter-spacing: 0.05em; margin-bottom: 16px;">
                            Quick Links
                        </h5>
                        <div style="display: flex; flex-direction: column; gap: 10px; font-size: 0.88rem;">
                            <a href="#/" style="color: #64748b; text-decoration: none; transition: color 0.15s ease;" onmouseover="this.style.color='#b72222'" onmouseout="this.style.color='#64748b'">Home</a>
                            <a href="#/products" style="color: #64748b; text-decoration: none; transition: color 0.15s ease;" onmouseover="this.style.color='#b72222'" onmouseout="this.style.color='#64748b'">Menu</a>
                            <a href="#/orders" style="color: #64748b; text-decoration: none; transition: color 0.15s ease;" onmouseover="this.style.color='#b72222'" onmouseout="this.style.color='#64748b'">My Orders</a>
                            <a href="#/cart" style="color: #64748b; text-decoration: none; transition: color 0.15s ease;" onmouseover="this.style.color='#b72222'" onmouseout="this.style.color='#64748b'">Cart</a>
                        </div>
                    </div>

                    <div>
                        <h5 style="font-size: 0.75rem; text-transform: uppercase; color: #94a3b8; font-weight: 700; letter-spacing: 0.05em; margin-bottom: 16px;">
                            Follow Us
                        </h5>
                        <div class="social-links" style="display: flex; gap: 12px; align-items: center;">
                            <a href="https://facebook.com" target="_blank" 
                            style="width: 36px; height: 36px; background: #f1f5f9; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: #475569; text-decoration: none; transition: all 0.2s;"
                            onmouseover="this.style.background='#1877f2'; this.style.color='#ffffff';" 
                            onmouseout="this.style.background='#f1f5f9'; this.style.color='#475569';">
                                <i class="bi bi-facebook" style="font-size: 1.05rem;"></i>
                            </a>
                            <a href="https://instagram.com" target="_blank" 
                            style="width: 36px; height: 36px; background: #f1f5f9; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: #475569; text-decoration: none; transition: all 0.2s;"
                            onmouseover="this.style.background='#e1306c'; this.style.color='#ffffff';" 
                            onmouseout="this.style.background='#f1f5f9'; this.style.color='#475569';">
                                <i class="bi bi-instagram" style="font-size: 1.05rem;"></i>
                            </a>
                            <a href="https://twitter.com" target="_blank" 
                            style="width: 36px; height: 36px; background: #f1f5f9; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: #475569; text-decoration: none; transition: all 0.2s;"
                            onmouseover="this.style.background='#000000'; this.style.color='#ffffff';" 
                            onmouseout="this.style.background='#f1f5f9'; this.style.color='#475569';">
                                <i class="bi bi-twitter-x" style="font-size: 0.95rem;"></i>
                            </a>
                        </div>
                    </div>
                </div>

                <div class="site-footer-bottom" style="padding-top: 24px; text-align: center; font-size: 0.8rem; color: #94a3b8;">
                    &copy; ${new Date().getFullYear()} ${s.name}. All rights reserved.
                </div>
        `;
    },

    hide() {
        const footer = Utils.$('#site-footer');
        if (footer) footer.style.display = 'none';
    },

    show() {
        const footer = Utils.$('#site-footer');
        if (footer) footer.style.display = '';
    },
};

console.log('✓ Footer loaded');
