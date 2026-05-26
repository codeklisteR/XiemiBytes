async function AdminVouchersPage() {
    const app = Utils.$('#app');

    if (!AppState.isSuperAdmin()) {
        app.innerHTML = `
            <div style="display:flex; align-items:center; justify-content:center; height:60vh;">
                <div class="text-center">
                    <div style="font-size:3rem; margin-bottom:16px;">🚫</div>
                    <h3 style="font-weight:800; color:#1e293b;">Access Restricted</h3>
                    <p class="text-muted">Voucher Management is only accessible to Super Admins.</p>
                    <a href="#/admin" class="btn btn-primary mt-3" style="border-radius:10px;">Back to Dashboard</a>
                </div>
            </div>`;
        return;
    }

    let vouchers = [];
    try {
        Loader.show();
        const res = await API.get('/admin/vouchers.php');
        vouchers = res.data || [];
    } catch (e) {
        Toast.error('Failed to load vouchers');
    } finally {
        Loader.hide();
    }

    app.innerHTML = `
        <div class="admin-vouchers fade-in container mt-4">
            <div class="d-flex justify-content-between align-items-center mb-4">
                <h1>Voucher Management</h1>
                <button class="btn btn-primary" id="btn-add-voucher">+ Create New Voucher</button>
            </div>

            <div class="card overflow-hidden border-0 shadow-sm" style="border-radius: 16px;">
                <table class="admin-table" style="width: 100%;">
                    <thead>
                        <tr>
                            <th class="p-4">Voucher Code</th>
                            <th class="p-4">Discount Value</th>
                            <th class="p-4">Expiry Date</th>
                            <th class="p-4">Usage Status</th>
                            <th class="p-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${vouchers.map(v => `
                            <tr style="border-bottom: 1px solid #f1f5f9;">
                                <td class="p-4"><code style="font-size: 0.9rem; ">${v.code}</code></td>
                                <td class="p-4">
                                    <span class="font-weight-bold" style="color: #166534;">
                                        ${v.type === 'percentage' ? v.discount + '%' : Utils.formatCurrency(v.discount)}
                                    </span>
                                    <small class="text-muted d-block">${v.type === 'percentage' ? 'Percentage' : 'Flat Amount'}${v.min_order > 0 ? ' · Min ' + Utils.formatCurrency(v.min_order) : ''}</small>
                                </td>
                                <td class="p-4">${Utils.formatDate(v.expiry)}</td>
                                <td class="p-4">
                                    <span class="badge badge-${v.status === 'active' ? 'ready' : 'cancelled'}">
                                        ${Utils.capitalize(v.status)}
                                    </span>
                                </td>
                                <td class="p-4 text-right">
                                    <button class="btn btn-sm btn-outline-secondary edit-voucher" data-code="${v.code}">Edit</button>
                                    <button class="btn btn-sm ${v.status === 'active' ? 'btn-outline-danger' : 'btn-outline-success'} toggle-voucher ml-2" data-code="${v.code}" data-status="${v.status}">
                                        ${v.status === 'active' ? 'Deactivate' : 'Activate'}
                                    </button>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        </div>
    `;

    // Event Listeners
    Utils.$('#btn-add-voucher').addEventListener('click', () => showVoucherForm());

    Utils.$$('.edit-voucher').forEach(btn => {
        btn.addEventListener('click', () => {
            const code = btn.dataset.code;
            const voucher = vouchers.find(v => v.code === code);
            showVoucherForm(voucher);
        });
    });

    Utils.$$('.toggle-voucher').forEach(btn => {
        btn.addEventListener('click', async () => {
            const currentStatus = btn.dataset.status;
            const newStatusInt = currentStatus === 'active' ? 0 : 1;
            const actionText = currentStatus === 'active' ? 'deactivate' : 'activate';
            
            if (confirm(`Are you sure you want to ${actionText} this voucher?`)) {
                try {
                    Loader.show();
                    await API.put('/admin/vouchers.php', { action: 'toggle', code: btn.dataset.code, status: newStatusInt });
                    Toast.success(`Voucher ${actionText}d!`);
                    AdminVouchersPage();
                } catch(e) {
                    Toast.error(`Failed to ${actionText} voucher`);
                } finally {
                    Loader.hide();
                }
            }
        });
    });
}

function showVoucherForm(voucher = null) {
    Modal.show({
        title: voucher ? 'Edit Voucher' : 'Create New Voucher',
        html: `
            <div class="p-2">
                <div class="form-group">
                    <label>Voucher Code</label>
                    <input type="text" class="form-control" value="${voucher ? voucher.code : ''}" placeholder="e.g. SUMMER2024" style="text-transform: uppercase;">
                </div>
                <div class="row">
                    <div class="col-md-6">
                        <div class="form-group">
                            <label>Discount Type</label>
                            <select class="form-control" id="voucher-type" disabled>
                                <option value="percentage" selected>Percentage (%)</option>
                            </select>
                        </div>
                    </div>
                    <div class="col-md-6">
                        <div class="form-group">
                            <label>Value</label>
                            <input type="number" class="form-control" value="${voucher ? voucher.discount : ''}" placeholder="0">
                        </div>
                    </div>
                </div>
                <div class="form-group">
                    <label>Expiry Date</label>
                    <input type="date" class="form-control" value="${voucher ? voucher.expiry : ''}">
                </div>
                <div class="form-group">
                    <label>Minimum Order (₱)</label>
                    <input type="number" id="voucher-min-order" class="form-control" min="0" step="0.01" value="${voucher && voucher.min_order ? voucher.min_order : ''}" placeholder="0 = no minimum">
                </div>
            </div>
        `,
        buttons: [
            { text: 'Cancel', action: 'close', class: 'secondary' },
            { text: voucher ? 'Update Voucher' : 'Generate Voucher', action: 'save', class: 'primary' }
        ],
        onSave: async () => {
            const code = Utils.$('.form-control[placeholder="e.g. SUMMER2024"]').value;
            const discount = Utils.$('.form-control[placeholder="0"]').value;
            const expiry = Utils.$('input[type="date"]').value;
            const min_order = parseFloat(Utils.$('#voucher-min-order')?.value) || 0;

            if (!code || !discount || !expiry) {
                Toast.error('Please fill in all required fields');
                return;
            }

            try {
                Loader.show();
                if (voucher) {
                    await API.put('/admin/vouchers.php', { old_code: voucher.code, code, discount, expiry, min_order });
                } else {
                    await API.post('/admin/vouchers.php', { code, discount, expiry, min_order });
                }
                Toast.success(voucher ? 'Voucher updated!' : 'New voucher created successfully!');
                Modal.hide();
                AdminVouchersPage();
            } catch(e) {
                Toast.error('Failed to save voucher');
            } finally {
                Loader.hide();
            }
        }
    });
}
