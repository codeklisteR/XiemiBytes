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
                    <a href="#/products" class="btn btn-primary btn-large">Order Now</a>
                    ${!AppState.isLoggedIn() ? '<a href="#/login" class="btn btn-secondary btn-large" style="margin-left: 10px;">Sign In</a>' : '<a href="#/orders" class="btn btn-secondary btn-large" style="margin-left: 10px;">My Orders</a>'}
                </div>
            </section>


            <!-- Signature Drinks Section -->
            
                <div class="container text-center">
                    <h2 class="signature-title"><span class="text-red">Best Seller Drinks</span></h2>
                    
                    <div class="signature-grid">
                        <div class="signature-item">
                            <img src="images/2.png" alt="Signature Drink 1">
                            <p class="signature-label">Red Velvet</p>
                        </div>
                        <div class="signature-item">
                            <img src="images/3.png" alt="Signature Drink 2">
                            <p class="signature-label">Green Apple</p>
                        </div>
                        <div class="signature-item">
                            <img src="images/4.png" alt="Signature Drink 3">
                            <p class="signature-label">Strawberry</p>
                        </div>
                        <div class="signature-item">
                            <img src="images/5.png" alt="Signature Drink 4">
                            <p class="signature-label">Wintermelon</p>
                        </div>
                        <div class="signature-item">
                            <img src="images/6.png" alt="Signature Drink 5">
                            <p class="signature-label">Matcha</p>
                        </div>
                    </div>
                </div>
                <div class="signature-wave"></div>
            
        </div>
    `;
}
