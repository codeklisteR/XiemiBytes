/**
 * Home Page
 */

async function HomePage() {
    const app = Utils.$('#app');

    let featured = [];
    try {
        featured = await ProductsModule.getProducts();
        featured = featured.slice(0, 6);
    } catch (e) {
        featured = [];
    }

    const s = CONFIG.STORE;

    app.innerHTML = `
        <div class="home-page">
            <section class="hero-split">
                <div class="hero-split-left">
                    <p class="hero-eyebrow">Xiemi Coffee &amp; Tea</p>
                    <h1 class="hero-heading">${AppState.isLoggedIn()
                        ? `Welcome back,<br>${AppState.user.first_name}.`
                        : 'Fresh drinks,<br>made to order.'}</h1>
                    <div class="hero-actions">
                        <a href="#/products" class="btn-hero-primary">Browse the menu</a>
                        ${!AppState.isLoggedIn()
                            ? '<a href="#/register" class="btn-hero-secondary">Create Account</a>'
                            : '<a href="#/orders" class="btn-hero-secondary">My Orders</a>'}
                    </div>
                </div>
            </section>

            <section class="page-section">
                <div class="container">
                    <h2 class="page-section-title">Popular Drinks</h2>
                    <p class="page-section-sub">Customer favorites from our menu</p>
                    <div class="products-grid" style="display:grid; grid-template-columns:repeat(auto-fill,minmax(160px,1fr)); gap:16px;">
                        ${featured.length ? featured.map(p => `
                            <div class="menu-card home-product-card" style="cursor:pointer;" data-product-str='${JSON.stringify(p).replace(/'/g, '&apos;')}'>
                                <div class="menu-card-image">
                                    <img src="${p.image_url}" alt="${p.name}">
                                </div>
                                <div class="menu-card-body">
                                    <h3>${p.name}</h3>
                                    <span class="menu-card-price">from ${Utils.formatCurrency(p.price_regular)}</span>
                                </div>
                            </div>
                        `).join('') : `
                            <p class="text-muted">Menu loading soon. <a href="#/products">Browse menu</a></p>
                        `}
                    </div>
                    <div class="text-center mt-4">
                        <a href="#/products" class="btn btn-outline-primary">See Full Menu</a>
                    </div>
                </div>
            </section>

            <section class="page-section" style="background: #ffffff; border-top: 1px solid #e2e8f0; border-bottom: 1px solid #e2e8f0; padding: 60px 0;">
                <div class="container">
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 40px;">
                        
                        <div>
                            <h5 style="font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.05em; color: #b72222; font-weight: 700; margin-bottom: 16px;">
                                Location
                            </h5>
                            <h3 style="font-size: 1.1rem; font-weight: 700; color: #1e293b; margin-bottom: 12px;">
                                ${s.name}
                            </h3>
                            <p style="font-size: 0.9rem; color: #64748b; line-height: 1.6; margin: 0; max-width: 260px;">
                                ${s.address}
                            </p>
                        </div>
                        
                        <div>
                            <h5 style="font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.05em; color: #b72222; font-weight: 700; margin-bottom: 16px;">
                                Store Hours
                            </h5>
                            <h3 style="font-size: 1.1rem; font-weight: 700; color: #1e293b; margin-bottom: 4px;">
                                We're open daily
                            </h3>
                            <p style="font-size: 0.95rem; font-weight: 600; color: #0f172a; margin-bottom: 16px;">
                                ${s.hours}
                            </p>
                            
                            <div style="display: flex; gap: 10px; align-items: flex-start; background: #f8fafc; padding: 12px; border-radius: 8px; border: 1px solid #f1f5f9;">
                                <i class="bi bi-info-circle" style="color: #64748b; font-size: 0.95rem; margin-top: 2px;"></i>
                                <span style="font-size: 0.8rem; color: #64748b; line-height: 1.4;">
                                    All orders are for in-store pickup. No delivery at this time.
                                </span>
                            </div>
                        </div>

                        <div>
                            <h5 style="font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.05em; color: #b72222; font-weight: 700; margin-bottom: 16px;">
                                Contact
                            </h5>
                            <h3 style="font-size: 1.1rem; font-weight: 700; color: #1e293b; margin-bottom: 16px;">
                                Get in touch
                            </h3>
                            
                            <div style="margin-bottom: 14px; display: flex; align-items: center; gap: 10px;">
                                <div style="width: 32px; height: 32px; background: #f1f5f9; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: #64748b;">
                                    <i class="bi bi-telephone" style="font-size: 0.9rem;"></i>
                                </div>
                                <div>
                                    <div style="font-size: 0.7rem; text-transform: uppercase; color: #94a3b8; font-weight: 700; letter-spacing: 0.02em;">Call Us</div>
                                    <a href="tel:${s.phone || ''}" style="font-size: 0.95rem; font-weight: 600; color: #1e293b; text-decoration: none; transition: color 0.15s ease;"
                                    onmouseover="this.style.color='#d03934'" onmouseout="this.style.color='#1e293b'">
                                        ${s.phone || '0963 178 9811'}
                                    </a>
                                </div>
                            </div>
                            
                            <div style="display: flex; align-items: center; gap: 10px;">
                                <div style="width: 32px; height: 32px; background: #f1f5f9; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: #64748b;">
                                    <i class="bi bi-envelope" style="font-size: 0.9rem;"></i>
                                </div>
                                <div>
                                    <div style="font-size: 0.7rem; text-transform: uppercase; color: #94a3b8; font-weight: 700; letter-spacing: 0.02em;">Email Us</div>
                                    <a href="mailto:${s.email || ''}" style="font-size: 0.95rem; font-weight: 600; color: #1e293b; text-decoration: none; transition: color 0.15s ease; word-break: break-all;"
                                    onmouseover="this.style.color='#d03934'" onmouseout="this.style.color='#1e293b'">
                                        ${s.email || 'xiemi.casiguran.sorsogon@gmail.com'}
                                    </a>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </section>
           
        </div>
    `;

    // Attach product modal listeners for home cards
    document.querySelectorAll('.home-product-card').forEach(card => {
        card.addEventListener('click', () => {
            const product = JSON.parse(card.dataset.productStr);
            showProductModal(product);
        });
    });
}
