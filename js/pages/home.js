/**
 * Home Page Handler
 */

async function HomePage() {
    const app = Utils.$('#app');

    // Render page
    app.innerHTML = `
        <div class="home-page fade-in">
            <!-- Hero Section -->
            <section class="hero">
                <h1>Welcome ${AppState.isLoggedIn() ? 'back, ' + AppState.user.first_name : 'to XiemiBytes'}</h1>
                <p>Discover our premium selection of handcrafted coffees, teas, and delicious treats.</p>
                <div class="mt-2">
                    <a href="#/products" class="btn btn-primary btn-large">Shop Now</a>
                    ${!AppState.isLoggedIn() ? '<a href="#/login" class="btn btn-secondary btn-large" style="margin-left: 10px;">Sign In</a>' : '<a href="#/orders" class="btn btn-secondary btn-large" style="margin-left: 10px;">My Orders</a>'}
                </div>
            </section>

            <!-- Featured Categories -->
            <section class="container mt-4 text-center">
                <h2>Our Specialties</h2>
                <div class="grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; margin-top: 20px; padding: 0 20px;">
                    <div class="card" style="padding: 20px; background: white; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                        <h3>Classic Series</h3>
                        <p class="mt-1" style="color: #666;">Authentic tea blends with the perfect creamy balance.</p>
                    </div>
                    <div class="card" style="padding: 20px; background: white; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                        <h3>Specialty Brews</h3>
                        <p class="mt-1" style="color: #666;">Unique flavors including Matcha and Okinawa specialties.</p>
                    </div>
                    <div class="card" style="padding: 20px; background: white; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                        <h3>Fruit Teas</h3>
                        <p class="mt-1" style="color: #666;">Refreshing fruit-infused teas for a vibrant burst of flavor.</p>
                    </div>
                </div>
            </section>
        </div>
    `;
}
