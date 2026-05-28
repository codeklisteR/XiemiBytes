<?php
require_once dirname(__DIR__) . '/database.php';
header('Content-Type: application/json');

try {
    $dateFrom = !empty($_GET['date_from']) ? $_GET['date_from'] : null;
    $dateTo = !empty($_GET['date_to']) ? $_GET['date_to'] : null;
    $interval = strtolower($_GET['interval'] ?? 'day');
    if (!in_array($interval, ['day', 'week', 'month'], true)) {
        $interval = 'day';
    }

    $dateFilter = "";
    $params = [];

    if ($dateFrom) {
        $dateFilter .= " AND DATE(o.order_date) >= ?";
        $params[] = $dateFrom;
    }
    if ($dateTo) {
        $dateFilter .= " AND DATE(o.order_date) <= ?";
        $params[] = $dateTo;
    }

    $baseWhere = "o.order_status = 'done'";

    $salesSql = "SELECT COALESCE(SUM(o.order_price), 0) FROM orders o WHERE $baseWhere $dateFilter";
    $stmt = $pdo->prepare($salesSql);
    $stmt->execute($params);
    $total_sales = (float)($stmt->fetchColumn() ?: 0);

    $countSql = "SELECT COUNT(*) FROM orders o WHERE $baseWhere $dateFilter";
    $stmt = $pdo->prepare($countSql);
    $stmt->execute($params);
    $total_orders = (int)($stmt->fetchColumn() ?: 0);

    $aov = $total_orders > 0 ? ($total_sales / $total_orders) : 0;

    $stmt = $pdo->query("SELECT COUNT(*) FROM customers WHERE cust_active = 1 AND username != 'walkin'");
    $total_customers = (int)($stmt->fetchColumn() ?: 0);

    $daily_sales = [];
    $daily_labels = [];
    $chart_subtitle = '';

    if ($dateFrom && $dateTo) {
        $chart_subtitle = date('M j, Y', strtotime($dateFrom)) . ' – ' . date('M j, Y', strtotime($dateTo));
    } elseif ($dateFrom) {
        $chart_subtitle = 'From ' . date('M j, Y', strtotime($dateFrom));
    } elseif ($dateTo) {
        $chart_subtitle = 'Until ' . date('M j, Y', strtotime($dateTo));
    }

    $periodFilter = $baseWhere . $dateFilter;
    $periodParams = $params;

    if ($interval === 'day') {
        $useHourly = true;
        if ($dateFrom && $dateTo && $dateFrom !== $dateTo) {
            $useHourly = false;
        } elseif ($dateFrom && !$dateTo) {
            $useHourly = true;
        } elseif (!$dateFrom && !$dateTo) {
            $periodFilter .= " AND DATE(o.order_date) = CURDATE()";
            if (!$chart_subtitle) {
                $chart_subtitle = date('l, F j, Y');
            }
        } elseif ($dateFrom && $dateTo && $dateFrom === $dateTo) {
            $useHourly = true;
        }

        if ($useHourly) {
            $hourSql = "
                SELECT HOUR(o.order_date) as h, COALESCE(SUM(o.order_price), 0) as total
                FROM orders o
                WHERE $periodFilter
                GROUP BY HOUR(o.order_date)
            ";
            $stmt = $pdo->prepare($hourSql);
            $stmt->execute($periodParams);
            $hourRows = $stmt->fetchAll(PDO::FETCH_ASSOC);
            $byHour = array_fill(0, 24, 0.0);
            foreach ($hourRows as $row) {
                $byHour[(int)$row['h']] = (float)$row['total'];
            }
            for ($h = 0; $h < 24; $h++) {
                $daily_sales[] = $byHour[$h];
                $daily_labels[] = date('g A', strtotime(sprintf('%02d:00', $h)));
            }
        } else {
            $rangeSql = "
                SELECT DATE(o.order_date) as d, COALESCE(SUM(o.order_price), 0) as total
                FROM orders o
                WHERE $periodFilter
                GROUP BY DATE(o.order_date)
                ORDER BY d ASC
            ";
            $stmt = $pdo->prepare($rangeSql);
            $stmt->execute($periodParams);
            $rangeRows = $stmt->fetchAll(PDO::FETCH_ASSOC);
            $byDate = [];
            foreach ($rangeRows as $row) {
                $byDate[$row['d']] = (float)$row['total'];
            }
            $start = new DateTime($dateFrom);
            $end = new DateTime($dateTo);
            $end->modify('+1 day');
            $period = new DatePeriod($start, new DateInterval('P1D'), $end);
            foreach ($period as $dt) {
                $key = $dt->format('Y-m-d');
                $daily_sales[] = $byDate[$key] ?? 0.0;
                $daily_labels[] = $dt->format('M j');
            }
        }
    } elseif ($interval === 'week') {
        if (!$dateFrom && !$dateTo) {
            $periodFilter .= " AND YEARWEEK(o.order_date, 1) = YEARWEEK(CURDATE(), 1)";
            if (!$chart_subtitle) {
                $chart_subtitle = 'Week of ' . date('M j, Y', strtotime('monday this week'));
            }
        }

        $daySql = "
            SELECT DATE(o.order_date) as d, COALESCE(SUM(o.order_price), 0) as total
            FROM orders o
            WHERE $periodFilter
            GROUP BY DATE(o.order_date)
        ";
        $stmt = $pdo->prepare($daySql);
        $stmt->execute($periodParams);
        $dayRows = $stmt->fetchAll(PDO::FETCH_ASSOC);
        $byDate = [];
        foreach ($dayRows as $row) {
            $byDate[$row['d']] = (float)$row['total'];
        }

        if ($dateFrom && $dateTo) {
            $start = new DateTime($dateFrom);
            $end = new DateTime($dateTo);
            $end->modify('+1 day');
            $period = new DatePeriod($start, new DateInterval('P1D'), $end);
            foreach ($period as $dt) {
                $key = $dt->format('Y-m-d');
                $daily_sales[] = $byDate[$key] ?? 0.0;
                $daily_labels[] = $dt->format('D');
            }
        } else {
            $monday = new DateTime('monday this week');
            for ($i = 0; $i < 7; $i++) {
                $d = clone $monday;
                $d->modify("+{$i} days");
                $key = $d->format('Y-m-d');
                $daily_sales[] = $byDate[$key] ?? 0.0;
                $daily_labels[] = $d->format('D');
            }
        }
    } else {
        if (!$dateFrom && !$dateTo) {
            $periodFilter .= " AND DATE_FORMAT(o.order_date, '%Y-%m') = DATE_FORMAT(CURDATE(), '%Y-%m')";
            if (!$chart_subtitle) {
                $chart_subtitle = date('F Y');
            }
        }

        $dayDetailSql = "
            SELECT DAY(o.order_date) as dom, COALESCE(SUM(o.order_price), 0) as total
            FROM orders o
            WHERE $periodFilter
            GROUP BY DAY(o.order_date)
        ";
        $stmt = $pdo->prepare($dayDetailSql);
        $stmt->execute($periodParams);
        $domRows = $stmt->fetchAll(PDO::FETCH_ASSOC);
        $byDom = [];
        foreach ($domRows as $row) {
            $byDom[(int)$row['dom']] = (float)$row['total'];
        }
        $daysInMonth = ($dateFrom && $dateTo)
            ? (int)(new DateTime($dateFrom))->diff(new DateTime($dateTo))->days + 1
            : (int)date('t');
        $startDay = 1;
        $endDay = ($dateFrom && $dateTo)
            ? min($daysInMonth, (int)date('t'))
            : (int)date('t');
        if ($dateFrom && $dateTo) {
            $startDay = (int)(new DateTime($dateFrom))->format('j');
            $endDay = (int)(new DateTime($dateTo))->format('j');
        }
        for ($d = $startDay; $d <= $endDay; $d++) {
            $daily_sales[] = $byDom[$d] ?? 0.0;
            $daily_labels[] = (string)$d;
        }
    }

    if (empty($daily_sales)) {
        $daily_sales = [0];
        $daily_labels = ['—'];
    }

    $intervalTitles = [
        'day' => "Today's Sales by Hour",
        'week' => "This Week's Sales by Day",
        'month' => "This Month's Sales by Day",
    ];
    if ($dateFrom || $dateTo) {
        $intervalTitles['day'] = 'Sales by Hour';
        $intervalTitles['week'] = 'Sales by Day';
        $intervalTitles['month'] = 'Sales by Day of Month';
    }

    $catSql = "
        SELECT COALESCE(c.categ_name, p.prod_categ) as prod_categ, SUM(oi.item_qty) as total_qty, SUM(oi.item_price * oi.item_qty) as total_sales
        FROM order_items oi
        JOIN product_var pv ON oi.prodvar_id = pv.prodvar_id
        JOIN product p ON pv.product_id = p.product_id
        LEFT JOIN category c ON (p.prod_categ = CAST(c.categ_id AS CHAR) OR p.prod_categ = c.categ_name)
        JOIN orders o ON oi.order_id = o.order_id
        WHERE $baseWhere
        $dateFilter
        GROUP BY COALESCE(c.categ_name, p.prod_categ)
        ORDER BY total_qty DESC
        LIMIT 10
    ";
    $stmt = $pdo->prepare($catSql);
    $stmt->execute($params);
    $top_categories_raw = $stmt->fetchAll(PDO::FETCH_ASSOC);

    $prodSql = "
        SELECT pr.prod_name, SUM(oi.item_qty) as total_qty, SUM(oi.item_price * oi.item_qty) as total_sales
        FROM order_items oi
        JOIN product_var pv ON oi.prodvar_id = pv.prodvar_id
        JOIN product pr ON pv.product_id = pr.product_id
        JOIN orders o ON oi.order_id = o.order_id
        WHERE $baseWhere
        $dateFilter
        GROUP BY pr.product_id, pr.prod_name
        ORDER BY total_qty DESC
        LIMIT 10
    ";
    $stmt = $pdo->prepare($prodSql);
    $stmt->execute($params);
    $top_products_raw = $stmt->fetchAll(PDO::FETCH_ASSOC);

    $total_items_sold = 0;
    foreach ($top_categories_raw as $cat) {
        $total_items_sold += (int)$cat['total_qty'];
    }

    $total_product_qty = 0;
    foreach ($top_products_raw as $p) {
        $total_product_qty += (int)$p['total_qty'];
    }

    $colors = ['#a01a1a', '#c0392b', '#d97706', '#059669', '#0369a1', '#7c3aed', '#db2777', '#0d9488', '#64748b', '#475569'];
    $categories_data = [];
    $leaderboard = [];
    $top_products = [];

    foreach ($top_categories_raw as $i => $cat) {
        $qty = (int)$cat['total_qty'];
        $percent = $total_items_sold > 0 ? round(($qty / $total_items_sold) * 100) : 0;
        $categories_data[] = [
            'name' => $cat['prod_categ'],
            'percent' => $percent,
            'color' => $colors[$i % count($colors)],
            'qty' => $qty,
            'sales' => (float)$cat['total_sales'],
        ];
        $leaderboard[] = [
            'rank' => $i + 1,
            'name' => $cat['prod_categ'],
            'qty' => $qty,
            'sales' => (float)$cat['total_sales'],
        ];
    }

    foreach ($top_products_raw as $i => $prod) {
        $qty = (int)$prod['total_qty'];
        $percent = $total_product_qty > 0 ? round(($qty / $total_product_qty) * 100) : 0;
        $top_products[] = [
            'rank' => $i + 1,
            'name' => $prod['prod_name'],
            'percent' => $percent,
            'color' => $colors[$i % count($colors)],
            'qty' => $qty,
            'sales' => (float)$prod['total_sales'],
        ];
    }

    $bestSeller = $top_products[0] ?? ($leaderboard[0] ?? null);

    echo json_encode([
        'status' => 'success',
        'data' => [
            'total_sales' => $total_sales,
            'net_revenue' => $total_sales,
            'aov' => (float)$aov,
            'total_orders' => $total_orders,
            'total_customers' => $total_customers,
            'interval' => $interval,
            'chart_title' => $intervalTitles[$interval],
            'chart_subtitle' => $chart_subtitle,
            'date_from' => $dateFrom,
            'date_to' => $dateTo,
            'daily_sales' => $daily_sales,
            'daily_labels' => $daily_labels,
            'top_categories' => $categories_data,
            'leaderboard' => $leaderboard,
            'top_products' => $top_products,
            'best_seller' => $bestSeller,
        ]
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
}
