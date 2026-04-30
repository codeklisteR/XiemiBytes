/**
 * Admin Product Management Page
 */
async function AdminProductsPage() {
    const app = Utils.$('#app');

    try {
        Loader.show();
        const products = await ProductsModule.getProducts();

        app.innerHTML = `
            <div class="admin-products fade-in container mt-4">
                <div class="d-flex justify-content-between align-items-center mb-4">
                    <h1>Product Management</h1>
                    <button class="btn btn-primary" id="btn-add-product">+ Add New Product</button>
                </div>

                <div class="card overflow-hidden">
                    <table class="admin-table" style="width: 100%;">
                        <thead>
                            <tr>
                                <th class="p-4">Product</th>
                                <th class="p-4">Category</th>
                                <th class="p-4">Price</th>
                                <th class="p-4">Status</th>
                                <th class="p-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${products.map(p => `
                                <tr style="border-bottom: 1px solid #f1f5f9;">
                                    <td class="p-4">
                                        <div class="d-flex align-items-center">
                                            <div class="product-thumb mr-3" style="width: 45px; height: 45px; background: #f8fafc; border-radius: 8px; display: flex; align-items: center; justify-content: center; overflow: hidden; border: 1px solid #e2e8f0;">
                                                <img src="${p.image_url}" style="width: 100%; height: 100%; object-fit: contain; padding: 4px;">
                                            </div>
                                            <span class="font-weight-bold">${p.name}</span>
                                        </div>
                                    </td>
                                    <td class="p-4"><span class="text-muted small">${p.category_id <= 3 ? 'Milk Tea Series' : 'Fruit Tea Series'}</span></td>
                                    <td class="p-4" style="color: var(--color-primary); font-weight: 600;">${Utils.formatCurrency(p.price)}</td>
                                    <td class="p-4">
                                        <span class="badge badge-ready">Active</span>
                                    </td>
                                    <td class="p-4 text-right">
                                        <button class="btn btn-sm btn-outline-secondary edit-product" data-id="${p.id}">Edit</button>
                                        <button class="btn btn-sm btn-outline-danger delete-product ml-2" data-id="${p.id}">Delete</button>
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        `;

        // Event Listeners
        Utils.$('#btn-add-product').addEventListener('click', () => showProductForm());

        Utils.$$('.edit-product').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = btn.dataset.id;
                const product = products.find(p => p.id == id);
                showProductForm(product);
            });
        });

        Utils.$$('.delete-product').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = btn.dataset.id;
                if (confirm('Are you sure you want to delete this product?')) {
                    Toast.success('Product deleted successfully');
                }
            });
        });

    } catch (error) {
        Utils.error('Failed to load products:', error);
    } finally {
        Loader.hide();
    }
}

function showProductForm(product = null) {
    Modal.show({
        title: product ? 'Edit Product' : 'Add New Product',
        html: `
            <div class="p-2">
                <div class="form-group">
                    <label>Product Name</label>
                    <input type="text" class="form-control" value="${product ? product.name : ''}" placeholder="e.g. Classic Milk Tea">
                </div>
                <div class="row">
                    <div class="col-md-6">
                        <div class="form-group">
                            <label>Price</label>
                            <input type="number" class="form-control" value="${product ? product.price : ''}" placeholder="0.00">
                        </div>
                    </div>
                    <div class="col-md-6">
                        <div class="form-group">
                            <label>Category</label>
                            <select class="form-control">
                                <option>Milk Tea</option>
                                <option>Fruit Tea Series</option>
                                <option>Salty Cheese</option>
                            </select>
                        </div>
                    </div>
                </div>
                <div class="form-group">
                    <label>Description</label>
                    <textarea class="form-control" rows="3">${product ? product.description : ''}</textarea>
                </div>
                <div class="form-group">
                    <label>Product Image URL</label>
                    <input type="text" class="form-control" value="${product ? product.image_url : ''}" placeholder="https://...">
                </div>
            </div>
        `,
        buttons: [
            { text: 'Cancel', action: 'close', class: 'secondary' },
            { text: product ? 'Update Product' : 'Save Product', action: 'save', class: 'primary' }
        ],
        onSave: () => {
            Toast.success(product ? 'Product updated!' : 'Product added successfully!');
            Modal.hide();
            AdminProductsPage(); // Refresh
        }
    });
}
