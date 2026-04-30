async function AdminVouchersPage() {
    const app = Utils.$('#app');

    // Use External Mock Data
    const vouchers = MOCK_VOUCHERS;

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
                                <td class="p-4"><code style="font-size: 1.1rem; color: #4f46e5; font-weight: 700;">${v.code}</code></td>
                                <td class="p-4">
                                    <span class="font-weight-bold" style="color: #166534;">
                                        ${v.type === 'percentage' ? v.discount + '%' : Utils.formatCurrency(v.discount)}
                                    </span>
                                    <small class="text-muted d-block">${v.type === 'percentage' ? 'Percentage' : 'Flat Amount'}</small>
                                </td>
                                <td class="p-4">${Utils.formatDate(v.expiry)}</td>
                                <td class="p-4">
                                    <span class="badge badge-${v.status === 'active' ? 'ready' : 'cancelled'}">
                                        ${Utils.capitalize(v.status)}
                                    </span>
                                </td>
                                <td class="p-4 text-right">
                                    <button class="btn btn-sm btn-outline-secondary edit-voucher" data-code="${v.code}">Edit</button>
                                    <button class="btn btn-sm btn-outline-danger delete-voucher ml-2" data-code="${v.code}">Delete</button>
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

    Utils.$$('.delete-voucher').forEach(btn => {
        btn.addEventListener('click', () => {
            if (confirm('Are you sure you want to delete this voucher?')) {
                Toast.success('Voucher deactivated');
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
                            <select class="form-control" id="voucher-type">
                                <option value="percentage" ${voucher?.type === 'percentage' ? 'selected' : ''}>Percentage (%)</option>
                                <option value="fixed" ${voucher?.type === 'fixed' ? 'selected' : ''}>Fixed Amount (₱)</option>
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
                    <label>Minimum Spend (Optional)</label>
                    <input type="number" class="form-control" placeholder="0.00">
                </div>
            </div>
        `,
        buttons: [
            { text: 'Cancel', action: 'close', class: 'secondary' },
            { text: voucher ? 'Update Voucher' : 'Generate Voucher', action: 'save', class: 'primary' }
        ],
        onSave: () => {
            Toast.success(voucher ? 'Voucher updated!' : 'New voucher created successfully!');
            Modal.hide();
            AdminVouchersPage();
        }
    });
}
