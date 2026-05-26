/**
 * Admin Product Management Page
 */
async function AdminProductsPage() {
    const app = Utils.$('#app');
 
    try {
        Loader.show();

        // Fetch products and categories in parallel
        const [response, catRes] = await Promise.all([
            API.get('/admin/products.php'),
            API.get('/admin/categories.php').catch(() => ({ data: [] }))
        ]);

        let products = response.data || [];
        let categories = catRes.data || [];
        let searchQuery = '';
        let categoryFilter = 'all';

        function getCategoryLabel(catId) {
            const found = categories.find(c => String(c.id) === String(catId) || c.name === catId);
            return found ? found.name : (catId || 'Others');
        }

        function buildCategoryOptions(selectedId = '') {
            return categories.map(c =>
                `<option value="${c.id}" ${String(c.id) === String(selectedId) ? 'selected' : ''}>${c.name}</option>`
            ).join('');
        }

        function buildFilterOptions() {
            return `<option value="all">All Categories</option>` +
                categories.map(c =>
                    `<option value="${c.id}" ${String(c.id) === String(categoryFilter) ? 'selected' : ''}>${c.name}</option>`
                ).join('');
        }

        function renderTable() {
            const tbody = Utils.$('#products-tbody');
            if (!tbody) return;

            const filteredProducts = products.filter(p => {
                const matchesSearch = !searchQuery || p.name.toLowerCase().includes(searchQuery.toLowerCase());
                const matchesCat = categoryFilter === 'all' ||
                    String(p.category_id) === String(categoryFilter) ||
                    p.category_id === categoryFilter;
                return matchesSearch && matchesCat;
            });

            if (filteredProducts.length === 0) {
                tbody.innerHTML = `<tr><td colspan="5" class="p-5 text-center text-muted">No products found.</td></tr>`;
            } else {
                tbody.innerHTML = filteredProducts.map(p => {
                    const isActive = p.status === 'active';
                    return `
                        <tr style="border-bottom:1px solid #f1f5f9;" onmouseenter="this.style.background='#f8fafc'" onmouseleave="this.style.background='white'">
                            <td class="p-3">
                                <div class="d-flex align-items-center">
                                    <div style="width:48px; height:48px; background:#f8fafc; border-radius:10px; overflow:hidden; border:1px solid #e2e8f0; flex-shrink:0; margin-right:12px;">
                                        <img src="${p.image_url}" class="prod-img-${p.id}" style="width:100%; height:100%; object-fit:contain; padding:4px; transition: transform 0.3s ease;">
                                    </div>
                                    <div>
                                        <div style="font-size:0.9rem; color:#1e293b;">${p.name}</div>
                                    </div>
                                </div>
                            </td>
                            <td class="p-3"><span class="text-muted small">${getCategoryLabel(p.category_id)}</span></td>
                            <td class="p-3">
                                <div style="font-size:0.88rem; font-weight: 500; ">${Utils.formatCurrency(p.price_regular)}</div>
                                <div class="text-muted" style="font-size:0.75rem;">Large: ${Utils.formatCurrency(p.price_large)}</div>
                            </td>
                            <td class="p-3">
                                <span style="background:${isActive ? '#dcfce7' : '#f1f5f9'};color:${isActive ? '#166534' : '#94a3b8'};padding:3px 12px;border-radius:20px;font-size:0.72rem;font-weight:700;">
                                    ${isActive ? 'Active' : 'Inactive'}
                                </span>
                            </td>
                            <td class="p-3 text-right" style="white-space:nowrap;">
                                <button class="btn btn-sm btn-outline-primary edit-product mr-1" data-id="${p.id}" style="border-radius:8px; font-size:0.8rem;">Edit</button>
                                <button class="btn btn-sm ${isActive ? 'btn-outline-warning' : 'btn-outline-success'} toggle-status mr-1" data-id="${p.id}" style="border-radius:8px; font-size:0.8rem;">
                                    ${isActive ? 'Deactivate' : 'Activate'}
                                </button>
                                <button class="btn btn-sm btn-outline-danger delete-product" data-id="${p.id}" style="border-radius:8px; font-size:0.8rem;">Delete</button>
                            </td>
                        </tr>
                    `;
                }).join('');
            }
 
            // Edit button
            Utils.$$('.edit-product').forEach(btn => {
                btn.addEventListener('click', () => {
                    const product = products.find(p => p.id == btn.dataset.id);
                    showProductForm(product, categories, async (updated) => {
                        try {
                            await API.put('/admin/products.php', updated);
                            const idx = products.findIndex(p => p.id == updated.id);
                            if (idx !== -1) products[idx] = { ...products[idx], ...updated };
                            renderTable();
                        } catch (e) {
                            Toast.error('Failed to update product');
                        }
                    });
                });
            });
 
            // Toggle status (Deactivate / Activate) button
            Utils.$$('.toggle-status').forEach(btn => {
                btn.addEventListener('click', async () => {
                    const product = products.find(p => p.id == btn.dataset.id);
                    if (!product) return;
                    const newStatus = product.status === 'active' ? 'inactive' : 'active';
                    const label = newStatus === 'inactive' ? 'deactivated (not available)' : 'activated';
                    if (confirm(`${newStatus === 'inactive' ? 'Deactivate' : 'Activate'} "${product.name}"?`)) {
                        try {
                            const updated = { ...product, status: newStatus };
                            await API.put('/admin/products.php', updated);
                            product.status = newStatus;
                            renderTable();
                            Toast.success(`"${product.name}" ${label}`);
                        } catch (e) {
                            Toast.error('Failed to update status');
                        }
                    }
                });
            });
 
            // Delete
            Utils.$$('.delete-product').forEach(btn => {
                btn.addEventListener('click', async () => {
                    const product = products.find(p => p.id == btn.dataset.id);
                    if (product && confirm(`Delete "${product.name}"? This cannot be undone.`)) {
                        try {
                            await API.delete('/admin/products.php', { id: product.id });
                            products = products.filter(p => p.id != btn.dataset.id);
                            renderTable();
                            Toast.success('Product deleted.');
                        } catch (e) {
                            Toast.error('Failed to delete product');
                        }
                    }
                });
            });
        }

        function refreshFilterDropdown() {
            const sel = Utils.$('#filter-category');
            if (sel) sel.innerHTML = buildFilterOptions();
        }
 
        app.innerHTML = `
            <div class="admin-products fade-in container mt-4">
                <div class="d-flex justify-content-between align-items-center mb-4">
                    <div>
                        <h1 class="mb-0" style="font-weight:800; color:#1e293b;">Product Management</h1>
                    </div>
                    <div class="d-flex" style="gap:10px;">
                        <button class="btn btn-outline-secondary" id="btn-add-category" style="border-radius:10px; font-weight:600;">+ Add Category</button>
                        <button class="btn btn-primary" id="btn-add-product" style="border-radius:10px; font-weight:700;">+ Add Product</button>
                    </div>
                </div>
 
                <div class="card border-0 shadow-sm p-4 mb-4" style="border-radius:14px;">
                    <div class="d-flex align-items-end flex-wrap" style="gap: 16px;">
                        <div style="flex: 2; min-width: 200px;">
                            <label class="small text-muted font-weight-bold">Search Products</label>
                            <input type="text" id="products-search" class="form-control" placeholder="Product name..." style="border-radius:10px;">
                        </div>
                        <div style="flex: 1; min-width: 150px;">
                            <label class="small text-muted font-weight-bold">Category</label>
                            <select id="filter-category" class="form-control" style="border-radius:10px;">
                                ${buildFilterOptions()}
                            </select>
                        </div>
                    </div>
                </div>

                <div class="card border-0 shadow-sm overflow-hidden" style="border-radius:16px;">
                    <div style="overflow-x:auto;">
                        <table style="width:100%; border-collapse:collapse;">
                            <thead>
                                <tr style="border-bottom: 2px solid #f1f5f9;">
                                    <th class="p-2" style="background:white; font-size:0.72rem; text-transform:uppercase; letter-spacing:1px; color:#94a3b8; font-weight:700; padding-left:16px!important;">Product</th>
                                    <th class="p-2" style="background:white; font-size:0.72rem; text-transform:uppercase; letter-spacing:1px; color:#94a3b8; font-weight:700;">Category</th>
                                    <th class="p-2" style="background:white; font-size:0.72rem; text-transform:uppercase; letter-spacing:1px; color:#94a3b8; font-weight:700;">Price</th>
                                    <th class="p-2" style="background:white; font-size:0.72rem; text-transform:uppercase; letter-spacing:1px; color:#94a3b8; font-weight:700;">Status</th>
                                    <th class="p-2 text-right" style="background:white; font-size:0.72rem; text-transform:uppercase; letter-spacing:1px; color:#94a3b8; font-weight:700; padding-right:16px!important;">Actions</th>
                                </tr>
                            </thead>
                            <tbody id="products-tbody"></tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;

        // Add Category button
        Utils.$('#btn-add-category').addEventListener('click', () => {
            Modal.show({
                title: 'Add New Category',
                html: `
                    <div class="p-1">
                        <div class="form-group mb-2">
                            <label style="font-size:0.82rem; font-weight:700; color:#475569;">Category Name</label>
                            <input type="text" id="cat-name" class="form-control" placeholder="e.g. Seasonal Special" style="border-radius:10px;">
                        </div>
                        <small class="text-muted">This will appear as a filterable category on product forms and the menu.</small>
                    </div>
                `,
                buttons: [
                    { text: 'Cancel', action: 'close', class: 'secondary' },
                    { text: 'Add Category', action: 'save', class: 'primary' }
                ],
                onSave: async () => {
                    const name = Utils.$('#cat-name')?.value?.trim();
                    if (!name) { Toast.error('Category name is required.'); return false; }
                    try {
                        Loader.show();
                        const res = await API.post('/admin/categories.php', { name });
                        const newCat = { id: res.id || name, name: res.name || name };
                        categories.push(newCat);
                        refreshFilterDropdown();
                        Toast.success(`Category "${name}" added.`);
                        Modal.hide();
                    } catch (e) {
                        Toast.error(e.message || 'Failed to add category');
                        return false;
                    } finally {
                        Loader.hide();
                    }
                }
            });
        });
 
        Utils.$('#btn-add-product').addEventListener('click', () => {
            showProductForm(null, categories, async (newProduct) => {
                try {
                    const res = await API.post('/admin/products.php', newProduct);
                    newProduct.id = res.id;
                    newProduct.status = 'active';
                    products.push(newProduct);
                    renderTable();
                } catch (e) {
                    Toast.error('Failed to create product');
                }
            });
        });

        Utils.$('#products-search')?.addEventListener('input', (e) => {
            searchQuery = e.target.value;
            renderTable();
        });

        Utils.$('#filter-category')?.addEventListener('change', (e) => {
            categoryFilter = e.target.value;
            renderTable();
        });
 
        renderTable();
 
    } catch (error) {
        Utils.error('Failed to load products:', error);
        Toast.error('Could not load products from backend.');
    } finally {
        Loader.hide();
    }
}
 
function showProductForm(product = null, categories = [], onSave) {
    function buildCatOptions(selectedId) {
        return categories.map(c =>
            `<option value="${c.id}" ${String(c.id) === String(selectedId) ? 'selected' : ''}>${c.name}</option>`
        ).join('');
    }

    Modal.show({
        title: product ? `Edit: ${product.name}` : 'Add New Product',
        html: `
            <div class="p-1">
                <div class="form-group mb-3">
                    <label style="font-size:0.82rem; font-weight:700; color:#475569;">Product Name</label>
                    <input type="text" id="pf-name" class="form-control" value="${product ? product.name : ''}" placeholder="e.g. Classic Milk Tea" style="border-radius:10px;">
                </div>
 
                <div class="row mb-3">
                    <div class="col-6">
                        <label style="font-size:0.82rem; font-weight:700; color:#475569;">Regular Price (₱)</label>
                        <input type="number" id="pf-price-regular" class="form-control" value="${product ? product.price_regular || product.price : ''}" placeholder="90.00" style="border-radius:10px;">
                    </div>
                    <div class="col-6">
                        <label style="font-size:0.82rem; font-weight:700; color:#475569;">Large Price (₱)</label>
                        <input type="number" id="pf-price-large" class="form-control" value="${product ? product.price_large || (product.price + 20) : ''}" placeholder="110.00" style="border-radius:10px;">
                    </div>
                </div>
                
                <div class="row mb-3">
                    <div class="col-12">
                        <label style="font-size:0.82rem; font-weight:700; color:#475569;">Category</label>
                        <select id="pf-category" class="form-control" style="border-radius:10px;">
                            ${buildCatOptions(product ? product.category_id : (categories[0] ? categories[0].id : ''))}
                        </select>
                    </div>
                </div>
 
                <div class="form-group mb-3">
                    <label style="font-size:0.82rem; font-weight:700; color:#475569;">Description</label>
                    <textarea id="pf-description" class="form-control" rows="3" placeholder="Brief description..." style="border-radius:10px; resize:vertical;">${product ? product.description || '' : ''}</textarea>
                </div>
 
                <div class="form-group mb-3">
                    <label style="font-size:0.82rem; font-weight:700; color:#475569;">Product Image</label>
                    <input type="file" id="pf-image-file" class="form-control" accept="image/jpeg,image/png,image/gif,image/webp" style="border-radius:10px;">
                    <small class="text-muted d-block mt-1">Upload from your device, or enter a URL below.</small>
                    <input type="text" id="pf-image" class="form-control mt-2" value="${product ? product.image_url || '' : ''}" placeholder="images/product.png" style="border-radius:10px;">
                    <div id="pf-image-preview" class="mt-2" style="display:${product && product.image_url ? 'block' : 'none'};">
                        <img src="${product ? product.image_url : ''}" alt="Preview" style="max-height:80px; border-radius:8px; border:1px solid #e2e8f0;">
                    </div>
                </div>
 
                ${product ? `
                <div class="form-group mb-1">
                    <label style="font-size:0.82rem; font-weight:700; color:#475569;">Availability</label>
                    <select id="pf-status" class="form-control" style="border-radius:10px;">
                        <option value="active" ${product.status === 'active' ? 'selected' : ''}>Active (Available)</option>
                        <option value="inactive" ${product.status === 'inactive' ? 'selected' : ''}>Inactive (Not Available)</option>
                    </select>
                </div>
                ` : ''}
            </div>
        `,
        buttons: [
            { text: 'Cancel', action: 'close', class: 'secondary' },
            { text: product ? 'Update Product' : 'Add Product', action: 'save', class: 'primary' }
        ],
        onOpen: () => {
            const fileInput = Utils.$('#pf-image-file');
            const urlInput = Utils.$('#pf-image');
            const preview = Utils.$('#pf-image-preview');
            if (fileInput) {
                fileInput.addEventListener('change', () => {
                    const file = fileInput.files[0];
                    if (!file) return;
                    const reader = new FileReader();
                    reader.onload = (e) => {
                        if (preview) {
                            preview.style.display = 'block';
                            preview.innerHTML = `<img src="${e.target.result}" alt="Preview" style="max-height:80px; border-radius:8px; border:1px solid #e2e8f0;">`;
                        }
                    };
                    reader.readAsDataURL(file);
                });
            }
            if (urlInput && preview) {
                urlInput.addEventListener('input', () => {
                    const url = urlInput.value.trim();
                    if (url) {
                        preview.style.display = 'block';
                        preview.innerHTML = `<img src="${url}" alt="Preview" style="max-height:80px; border-radius:8px; border:1px solid #e2e8f0;">`;
                    }
                });
            }
        },
        onSave: async () => {
            const name = Utils.$('#pf-name').value.trim();
            const priceRegular = parseFloat(Utils.$('#pf-price-regular').value) || 0;
            const priceLarge = parseFloat(Utils.$('#pf-price-large').value) || 0;
            const categoryId = Utils.$('#pf-category').value;
            const description = Utils.$('#pf-description').value.trim();
            let imageUrl = Utils.$('#pf-image').value.trim();
            const status = Utils.$('#pf-status') ? Utils.$('#pf-status').value : 'active';
            const fileInput = Utils.$('#pf-image-file');

            if (!name) { Toast.error('Product name is required.'); return false; }

            if (fileInput && fileInput.files[0]) {
                try {
                    Loader.show();
                    const fd = new FormData();
                    fd.append('image', fileInput.files[0]);
                    const uploadRes = await API.upload('/admin/upload-image.php', fd);
                    imageUrl = uploadRes.path || uploadRes.url || imageUrl;
                } catch (e) {
                    Toast.error(e.message || 'Image upload failed.');
                    Loader.hide();
                    return false;
                } finally {
                    Loader.hide();
                }
            }

            const updated = {
                ...(product || {}),
                name,
                price: priceRegular,
                price_regular: priceRegular,
                price_large: priceLarge,
                category_id: categoryId,
                description,
                image_url: imageUrl,
                status,
            };

            if (onSave) onSave(updated);
            Toast.success(product ? 'Product updated!' : 'Product added!');
            Modal.hide();
        }
    });
}