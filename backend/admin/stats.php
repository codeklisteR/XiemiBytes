<?php
require_once dirname(__DIR__) . '/database.php';
header('Content-Type: application/json');

try {
    // Total sales = sum of order_price for completed (non-void) orders
    $stmt = $pdo->query("
        SELECT COALESCE(SUM(order_price), 0) as total_sales
        FROM orders
        WHERE order_status = 'done' AND order_status != 'void'
    ");
    $total_sales = (float)($stmt->fetchColumn() ?: 0);

    $stmt = $pdo->query("SELECT COUNT(*) FROM orders WHERE order_status != 'void'");
    $total_orders = (int)($stmt->fetchColumn() ?: 0);

    $stmt = $pdo->query("SELECT COUNT(*) FROM orders WHERE order_status IN ('pay', 'claim')");
    $pending_orders = (int)($stmt->fetchColumn() ?: 0);

    $stmt = $pdo->query("SELECT COUNT(*) FROM orders WHERE order_status IN ('pay', 'claim')");
    $live_queue = (int)($stmt->fetchColumn() ?: 0);

    $stmt = $pdo->query("SELECT COUNT(*) FROM customers WHERE cust_active = 1 AND username != 'walkin'");
    $total_customers = (int)($stmt->fetchColumn() ?: 0);

    // Recent orders as activity feed
    $stmt = $pdo->query("
        SELECT o.order_id, o.order_mode, o.order_status, o.order_price, o.order_date, c.username
        FROM orders o
        LEFT JOIN customers c ON o.cust_id = c.cust_id
        WHERE o.order_status != 'void'
        ORDER BY o.order_date DESC, o.order_id DESC
        LIMIT 8
    ");
    $recentRows = $stmt->fetchAll(PDO::FETCH_ASSOC);

    $statusLabels = [
        'pay' => 'Awaiting payment',
        'claim' => 'Ready for pickup',
        'done' => 'Completed',
    ];

    $recent_activity = [];
    foreach ($recentRows as $row) {
        $mode = $row['order_mode'] === 'pos' ? 'Walk-in' : 'Online';
        $customer = ($row['username'] && $row['username'] !== 'walkin') ? $row['username'] : 'Walk-in';
        $recent_activity[] = [
            'action' => ($statusLabels[$row['order_status']] ?? $row['order_status']) . " — {$mode}",
            'user' => $customer,
            'time' => $row['order_date'] ? date('M j, g:i A', strtotime($row['order_date'])) : 'Just now',
            'order_id' => 'ORD-' . str_pad($row['order_id'], 5, '0', STR_PAD_LEFT),
            'amount' => (float)$row['order_price'],
        ];
    }

    if (empty($recent_activity)) {
        $recent_activity[] = [
            'action' => 'No orders yet',
            'user' => 'System',
            'time' => date('M j, g:i A'),
            'order_id' => null,
            'amount' => 0,
        ];
    }

    echo json_encode([
        'total_sales' => $total_sales,
        'total_orders' => $total_orders,
        'total_customers' => $total_customers,
        'pending_orders' => $pending_orders,
        'live_queue' => $live_queue,
        'recent_activity' => $recent_activity,
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}
