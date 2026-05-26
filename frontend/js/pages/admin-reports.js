async function AdminReportsPage() {
    const app = Utils.$('#app');

    let dateFrom = '';
    let dateTo = '';
    let salesInterval = 'day';

    async function loadReports() {
        const params = new URLSearchParams();
        if (dateFrom) params.append('date_from', dateFrom);
        if (dateTo) params.append('date_to', dateTo);
        params.append('interval', salesInterval);
        const res = await API.get('/admin/reports.php?' + params.toString());
        return res?.data ?? res;
    }

    function renderShareBars(items, emptyMsg) {
        if (!items || items.length === 0) {
            return `<p class="text-muted small mb-0">${emptyMsg}</p>`;
        }
        return items.map(item => `
            <div class="report-share-row">
                <div class="report-share-row-head">
                    <span class="report-share-name">${item.name}</span>
                    <span class="report-share-meta">${item.percent}% · ${item.qty} sold · ${Utils.formatCurrency(item.sales)}</span>
                </div>
                <div class="report-share-track">
                    <div class="report-share-fill" style="width:${Math.max(item.percent, 2)}%;background:${item.color};"></div>
                </div>
            </div>
        `).join('');
    }

    function renderLeaderboard(entries, emptyMsg) {
        if (!entries || entries.length === 0) {
            return `<p class="text-muted small mb-0">${emptyMsg}</p>`;
        }
        return entries.map(entry => `
            <div class="report-leader-row">
                <span class="report-leader-rank">${entry.rank}</span>
                <div class="report-leader-body">
                    <div class="report-leader-name">${entry.name}</div>
                    <div class="report-leader-meta">${entry.qty} units · ${Utils.formatCurrency(entry.sales)}</div>
                </div>
            </div>
        `).join('');
    }

    /**
     * Renders a smooth SVG line + area chart — far more readable than
     * narrow bars, especially when there are many data points.
     */
    function renderLineChart(sales, labels, maxSale) {
        if (!sales || sales.length === 0) {
            return `<div class="report-chart-wrap" style="display:flex;align-items:center;justify-content:center;height:200px;"><p class="text-muted small">No sales data for this period.</p></div>`;
        }

        const W = 560, H = 180, PAD_L = 54, PAD_R = 16, PAD_T = 24, PAD_B = 36;
        const chartW = W - PAD_L - PAD_R;
        const chartH = H - PAD_T - PAD_B;
        const dataMax = Math.max(maxSale, 1);

        const n = sales.length;
        const xStep = n > 1 ? chartW / (n - 1) : 0;

        // Build points
        const pts = sales.map((v, i) => ({
            x: PAD_L + (n > 1 ? i * xStep : chartW / 2),
            y: PAD_T + chartH - (v / dataMax) * chartH,
            v
        }));

        // Smooth cubic bezier path
        function makePath(points) {
            if (points.length === 1) return `M${points[0].x},${points[0].y}`;
            let d = `M${points[0].x},${points[0].y}`;
            for (let i = 0; i < points.length - 1; i++) {
                const cp1x = points[i].x + xStep * 0.4;
                const cp1y = points[i].y;
                const cp2x = points[i + 1].x - xStep * 0.4;
                const cp2y = points[i + 1].y;
                d += ` C${cp1x},${cp1y} ${cp2x},${cp2y} ${points[i+1].x},${points[i+1].y}`;
            }
            return d;
        }

        const linePath = makePath(pts);
        // Area fill: close at bottom
        const areaPath = linePath +
            ` L${pts[pts.length-1].x},${PAD_T + chartH}` +
            ` L${pts[0].x},${PAD_T + chartH} Z`;

        // Y-axis ticks (4 ticks)
        const yTicks = [0, 0.25, 0.5, 0.75, 1].map(pct => ({
            y: PAD_T + chartH - pct * chartH,
            label: pct === 0 ? '₱0' : Utils.formatCurrency(dataMax * pct)
        }));

        // X-axis labels — show at most 8 evenly spaced
        const maxLabels = 8;
        const labelStep = n <= maxLabels ? 1 : Math.ceil(n / maxLabels);
        const xLabels = pts.filter((_, i) => i % labelStep === 0 || i === n - 1);

        // Tooltip data encoded as JSON for inline hover
        const tooltipData = JSON.stringify(pts.map((p, i) => ({ x: Math.round(p.x), v: sales[i], lbl: labels[i] || '' })));

        return `
            <div class="report-chart-wrap" style="position:relative;overflow:hidden;">
                <svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid meet"
                     style="width:100%;height:auto;display:block;"
                     id="sales-line-chart"
                     onmousemove="reportChartHover(event, this)"
                     onmouseleave="reportChartLeave()">
                    <defs>
                        <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stop-color="#a01a1a" stop-opacity="0.18"/>
                            <stop offset="100%" stop-color="#a01a1a" stop-opacity="0.01"/>
                        </linearGradient>
                    </defs>

                    <!-- Grid lines -->
                    ${yTicks.map(t => `
                        <line x1="${PAD_L}" y1="${t.y}" x2="${W - PAD_R}" y2="${t.y}"
                              stroke="#f1f5f9" stroke-width="1"/>
                        <text x="${PAD_L - 6}" y="${t.y + 4}" text-anchor="end"
                              font-size="9" fill="#94a3b8">${t.label}</text>
                    `).join('')}

                    <!-- Area fill -->
                    <path d="${areaPath}" fill="url(#areaGrad)"/>

                    <!-- Line -->
                    <path d="${linePath}" fill="none" stroke="#a01a1a" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>

                    <!-- Data points -->
                    ${pts.map((p, i) => `
                        <circle cx="${p.x}" cy="${p.y}" r="${n <= 14 ? 3.5 : 0}" fill="#a01a1a" stroke="white" stroke-width="1.5"/>
                    `).join('')}

                    <!-- X-axis labels -->
                    ${xLabels.map(p => `
                        <text x="${p.x}" y="${PAD_T + chartH + 14}" text-anchor="middle"
                              font-size="9" fill="#94a3b8">${labels[pts.indexOf(p)] || ''}</text>
                    `).join('')}

                    <!-- Crosshair and tooltip -->
                    <line id="chart-crosshair" x1="0" y1="${PAD_T}" x2="0" y2="${PAD_T + chartH}"
                          stroke="#a01a1a" stroke-width="1" stroke-dasharray="4 3" opacity="0" pointer-events="none"/>
                    <circle id="chart-dot" cx="0" cy="0" r="5" fill="white" stroke="#a01a1a" stroke-width="2" opacity="0" pointer-events="none"/>
                </svg>

                <!-- Floating tooltip -->
                <div id="chart-tooltip" style="position:absolute;top:0;left:0;background:white;border:1px solid #e2e8f0;border-radius:8px;padding:6px 10px;font-size:0.78rem;pointer-events:none;opacity:0;transition:opacity 0.15s;box-shadow:0 4px 12px rgba(0,0,0,0.1);white-space:nowrap;">
                    <strong id="chart-tt-label"></strong><br>
                    <span style="color:#a01a1a;font-weight:700;" id="chart-tt-value"></span>
                </div>

                <script>
                (function(){
                    var _pts = ${tooltipData};
                    window.reportChartHover = function(e, svg) {
                        var rect = svg.getBoundingClientRect();
                        var scaleX = svg.viewBox.baseVal.width / rect.width;
                        var mx = (e.clientX - rect.left) * scaleX;

                        // Find nearest point
                        var best = _pts.reduce(function(a, b) {
                            return Math.abs(b.x - mx) < Math.abs(a.x - mx) ? b : a;
                        });

                        var crosshair = document.getElementById('chart-crosshair');
                        var dot = document.getElementById('chart-dot');
                        var tt = document.getElementById('chart-tooltip');
                        var ttLabel = document.getElementById('chart-tt-label');
                        var ttValue = document.getElementById('chart-tt-value');

                        if (!crosshair || !dot || !tt) return;

                        var scaleY = svg.viewBox.baseVal.height / rect.height;
                        var ptY = _pts.find(function(p){ return p.x === best.x; })?.v;

                        crosshair.setAttribute('x1', best.x); crosshair.setAttribute('x2', best.x);
                        crosshair.setAttribute('opacity', '1');

                        dot.setAttribute('cx', best.x);
                        dot.setAttribute('cy', (${PAD_T + chartH}) - (best.v / ${dataMax}) * ${chartH});
                        dot.setAttribute('opacity', '1');

                        ttLabel.textContent = best.lbl;
                        ttValue.textContent = '₱' + best.v.toLocaleString('en-PH', {minimumFractionDigits:2,maximumFractionDigits:2});

                        var ttLeft = (best.x / scaleX) + 10;
                        if (ttLeft + 120 > rect.width) ttLeft = (best.x / scaleX) - 130;
                        tt.style.left = ttLeft + 'px';
                        tt.style.top = '8px';
                        tt.style.opacity = '1';
                    };
                    window.reportChartLeave = function() {
                        var crosshair = document.getElementById('chart-crosshair');
                        var dot = document.getElementById('chart-dot');
                        var tt = document.getElementById('chart-tooltip');
                        if (crosshair) crosshair.setAttribute('opacity','0');
                        if (dot) dot.setAttribute('opacity','0');
                        if (tt) tt.style.opacity = '0';
                    };
                })();
                </script>
            </div>
        `;
    }

    function renderPage(data) {
        if (!data) return;

        const sales = data.daily_sales || [];
        const maxSale = Math.max(...sales, 0.01);
        const labels = data.daily_labels || [];
        const chartTitle = data.chart_title || 'Sales';
        const chartSubtitle = data.chart_subtitle || '';
        const totalItemsSold = (data.leaderboard || []).reduce((sum, item) => sum + parseInt(item.qty || 0, 10), 0);
        const bestSeller = data.best_seller || data.top_products?.[0] || data.leaderboard?.[0];

        app.innerHTML = `
            <style>
                .admin-reports-page h1 { font-size: 1.5rem; font-weight: 600; color: #1e293b; }
                .admin-reports-page h3 { font-size: 1rem; font-weight: 600; color: #1e293b; }
                .report-panel {
                    border: 1px solid var(--color-border);
                    border-radius: var(--radius-md);
                    padding: 20px;
                    background: #fff;
                    margin-bottom: 20px;
                }
                .report-stat-label { font-size: 0.72rem; text-transform: uppercase; letter-spacing: 0.04em; color: #64748b; font-weight: 500; }
                .report-stat-value { font-size: 1.5rem; font-weight: 600; color: #1e293b; margin: 6px 0 0; }
                .report-filter-row { display: flex; flex-wrap: wrap; gap: 16px; align-items: flex-end; }
                .report-filter-row .form-group { flex: 1; min-width: 140px; margin: 0; }
                .report-filter-actions { display: flex; gap: 8px; flex: 0 0 auto; min-width: 200px; }
                .report-filter-actions .btn { height: 42px; padding: 0 18px; border-radius: 10px; font-size: 0.85rem; font-weight: 500; flex: 1; margin: 0; }
                .report-interval-btns .btn { font-size: 0.8rem; font-weight: 500; border-radius: 8px; }
                .report-chart-wrap { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 14px 10px 8px; }
                .report-leader-row { display: flex; align-items: center; gap: 12px; padding: 10px 0; border-bottom: 1px solid #f1f5f9; }
                .report-leader-row:last-child { border-bottom: none; }
                .report-leader-rank { width: 28px; height: 28px; border-radius: 6px; background: #f1f5f9; color: #475569; font-size: 0.8rem; font-weight: 600; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
                .report-leader-row:nth-child(1) .report-leader-rank { background: var(--color-primary); color: #fff; }
                .report-leader-name { font-size: 0.9rem; font-weight: 500; color: #1e293b; }
                .report-leader-meta { font-size: 0.78rem; color: #64748b; }
                .report-share-row { margin-bottom: 14px; }
                .report-share-row:last-child { margin-bottom: 0; }
                .report-share-row-head { display: flex; justify-content: space-between; gap: 8px; margin-bottom: 6px; font-size: 0.85rem; }
                .report-share-name { font-weight: 500; color: #1e293b; }
                .report-share-meta { color: #64748b; font-size: 0.78rem; white-space: nowrap; }
                .report-share-track { height: 8px; background: #f1f5f9; border-radius: 4px; overflow: hidden; }
                .report-share-fill { height: 100%; border-radius: 4px; min-width: 2px; }
            </style>
            <div class="admin-reports-page container mt-4 mb-5">
                <h1 class="mb-4">Sales Reports</h1>

                <div class="report-panel">
                    <div class="report-filter-row">
                        <div class="form-group">
                            <label class="report-stat-label">From</label>
                            <input type="date" id="report-date-from" class="form-control" value="${dateFrom}">
                        </div>
                        <div class="form-group">
                            <label class="report-stat-label">To</label>
                            <input type="date" id="report-date-to" class="form-control" value="${dateTo}">
                        </div>
                        <div class="report-filter-actions">
                            <button type="button" class="btn btn-primary" id="btn-apply-report-dates">Apply</button>
                            <button type="button" class="btn btn-outline-secondary" id="btn-clear-report-dates">Clear</button>
                        </div>
                    </div>
                </div>

            <div class="mb-4" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 1rem;">
    <div class="report-panel mb-0 h-100">
        <div class="report-stat-label">Total Sales</div>
        <div class="report-stat-value">${Utils.formatCurrency(data.total_sales)}</div>
        <small class="text-muted">${data.total_orders} completed orders</small>
    </div>

    <div class="report-panel mb-0 h-100">
        <div class="report-stat-label">Avg. Order Value</div>
        <div class="report-stat-value">${Utils.formatCurrency(data.aov)}</div>
    </div>

    <div class="report-panel mb-0 h-100">
        <div class="report-stat-label">Items Sold</div>
        <div class="report-stat-value">${totalItemsSold}</div>
    </div>

    <div class="report-panel mb-0 h-100">
        <div class="report-stat-label">Best Seller</div>
        <div class="report-stat-value" style="font-size: 1.1rem; font-weight: 600; line-height: 1.3;">${bestSeller ? bestSeller.name : '—'}</div>
        <small class="text-muted">${bestSeller ? bestSeller.qty + ' units' : 'No sales'}</small>
    </div>
</div>

                <div class="row">
                    <div class="col-lg-7 mb-4">
                        <div class="report-panel h-100 mb-0">
                            <div class="d-flex justify-content-between align-items-start flex-wrap mb-3" style="gap:12px;">
                                <div>
                                    <h3 class="mb-0">${chartTitle}</h3>
                                    ${chartSubtitle ? `<p class="text-muted small mb-0 mt-1">${chartSubtitle}</p>` : ''}
                                </div>
                                <div class="report-interval-btns btn-group">
                                    ${['day', 'week', 'month'].map(iv => `
                                        <button type="button" class="btn btn-sm report-interval-btn ${salesInterval === iv ? 'btn-primary' : 'btn-outline-secondary'}" data-interval="${iv}">
                                            ${iv === 'day' ? 'By Day' : iv === 'week' ? 'By Week' : 'By Month'}
                                        </button>
                                    `).join('')}
                                </div>
                            </div>
                            ${renderLineChart(sales, labels, maxSale)}
                        </div>
                    </div>
                    <div class="col-lg-5 mb-4">
                        <div class="report-panel h-100 mb-0">
                            <h3 class="mb-3">Category Leaderboard</h3>
                            ${renderLeaderboard(data.leaderboard, 'No category sales in this period.')}
                        </div>
                    </div>
                </div>

                <div class="row">
                    <div class="col-lg-6 mb-4">
                        <div class="report-panel mb-0">
                            <h3 class="mb-3">Sales Share by Category</h3>
                            ${renderShareBars(data.top_categories, 'No category data for this period.')}
                        </div>
                    </div>
                    <div class="col-lg-6 mb-4">
                        <div class="report-panel mb-0">
                            <h3 class="mb-3">Sales Share by Product</h3>
                            ${renderShareBars(data.top_products, 'No product data for this period.')}
                        </div>
                    </div>
                </div>
            </div>
        `;

        bindReportEvents();
    }

    function bindReportEvents() {
        Utils.$('#btn-apply-report-dates')?.addEventListener('click', async () => {
            dateFrom = Utils.$('#report-date-from')?.value || '';
            dateTo = Utils.$('#report-date-to')?.value || '';
            if (dateFrom && dateTo && dateFrom > dateTo) {
                Toast.error('From date must be before To date.');
                return;
            }
            Loader.show();
            try {
                renderPage(await loadReports());
                Toast.success('Report updated');
            } catch (e) {
                Toast.error(e.message || 'Failed to load report');
            } finally {
                Loader.hide();
            }
        });

        Utils.$('#btn-clear-report-dates')?.addEventListener('click', async () => {
            dateFrom = '';
            dateTo = '';
            Loader.show();
            try {
                renderPage(await loadReports());
            } catch (e) {
                Toast.error(e.message || 'Failed to load report');
            } finally {
                Loader.hide();
            }
        });

        Utils.$$('.report-interval-btn').forEach(btn => {
            btn.addEventListener('click', async () => {
                salesInterval = btn.dataset.interval;
                Loader.show();
                try {
                    renderPage(await loadReports());
                } catch (e) {
                    Toast.error(e.message || 'Failed to load report');
                } finally {
                    Loader.hide();
                }
            });
        });
    }

    try {
        Loader.show();
        renderPage(await loadReports());
    } catch (error) {
        app.innerHTML = `<div class="container mt-5"><p class="text-danger">Failed to load reports.</p></div>`;
        Utils.error('Failed to load reports:', error);
    } finally {
        Loader.hide();
    }
}