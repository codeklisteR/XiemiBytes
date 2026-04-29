/**
 * Admin POS Page Handler
 */

async function AdminPOSPage() {
    const app = Utils.$('#app');

    app.innerHTML = `
        <div class="admin-pos fade-in" style="display: flex; height: calc(100vh - 60px); overflow: hidden;">
            <!-- Left Side: Product Selection -->
            <div class="pos-products" style="flex: 2; padding: 20px; overflow-y: auto; background: #f8f9fa;">
                <div class="d-flex justify-content-between">
                    <h2>POS System</h2>
                    <a href="#/admin" class="btn btn-sm btn-outline-secondary">Back to Dashboard</a>
                </div>
                <div class="pos-category-tabs mt-3 d-flex gap-2 mb-3">
                    <button class="btn btn-outline-primary btn-sm active">All</button>
                    <button class="btn btn-outline-primary btn-sm">Coffee</button>
                    <button class="btn btn-outline-primary btn-sm">Tea</button>
                </div>
                <div class="pos-grid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 15px;">
                    <p>Loading products...</p>
                </div>
            </div>

            <!-- Right Side: Current Transaction -->
            <div class="pos-cart" style="flex: 1; border-left: 2px solid #ddd; padding: 20px; display: flex; flex-direction: column; background: white;">
                <h3>Current Sale</h3>
                <div class="pos-items mt-3" style="flex: 1; overflow-y: auto;">
                    <p class="text-muted text-center mt-5">Scan or select items</p>
                </div>
                <div class="pos-footer mt-auto pt-3 border-top">
                    <div class="d-flex justify-content-between h4">
                        <span>Total</span>
                        <span>₱0.00</span>
                    </div>
                    <button class="btn btn-primary btn-block btn-lg mt-3">CHARGE</button>
                </div>
            </div>
        </div>
    `;

    // Fetch products to populate grid
    try {
        const products = await ProductsModule.getProducts();
        const grid = Utils.$('.pos-grid');
        grid.innerHTML = products.map(product => `
            <div class="pos-card card p-2 text-center" style="cursor: pointer;">
                <img src="${product.image_url}" style="width: 100%; height: 100px; object-fit: cover; border-radius: 4px;">
                <div class="mt-2" style="font-size: 0.9rem; font-weight: bold;">${product.name}</div>
                <div class="text-primary">${Utils.formatCurrency(product.price)}</div>
            </div>
        `).join('');
    } catch (error) {
        Utils.error('POS Error:', error);
    }
}
