<?php
require_once dirname(__DIR__) . '/database.php';

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(['status' => 'error', 'message' => 'Method not allowed']);
    exit;
}

$secretKey = 'xiemibytes_secret_key_2025';
$headers = getallheaders();
$authHeader = $headers['Authorization'] ?? $headers['authorization'] ?? '';

if (!$authHeader) {
    http_response_code(401);
    echo json_encode(['status' => 'error', 'message' => 'No token provided']);
    exit;
}

$token = str_replace('Bearer ', '', $authHeader);
$parts = explode('.', $token);

if (count($parts) !== 3) {
    http_response_code(401);
    echo json_encode(['status' => 'error', 'message' => 'Invalid token format']);
    exit;
}

list($headerB64, $bodyB64, $signatureB64) = $parts;
$expectedSignature = base64_encode(hash_hmac('sha256', "$headerB64.$bodyB64", $secretKey, true));
if ($signatureB64 !== $expectedSignature) {
    http_response_code(401);
    echo json_encode(['status' => 'error', 'message' => 'Token signature verification failed']);
    exit;
}

$payload = json_decode(base64_decode($bodyB64), true);
if (!$payload || empty($payload['id'])) {
    http_response_code(401);
    echo json_encode(['status' => 'error', 'message' => 'Invalid token payload']);
    exit;
}

$cust_id = $payload['id'];

$stmt = $pdo->prepare("
    SELECT o.*, p.amt_paid, p.amt_due, p.amt_change
    FROM orders o
    LEFT JOIN payment p ON o.order_id = p.order_id
    WHERE o.cust_id = ? AND o.order_status != 'void'
    ORDER BY o.order_id DESC
");
$stmt->execute([$cust_id]);
$orders = $stmt->fetchAll(PDO::FETCH_ASSOC);

$itemStmt = $pdo->prepare("
    SELECT 
        oi.item_qty,
        oi.item_price,
        oi.ice_lvl,
        oi.sugar_lvl,
        p.prod_name,
        pv.var_size,
        pv.var_img
    FROM order_items oi
    JOIN product_var pv ON oi.prodvar_id = pv.prodvar_id
    JOIN product p ON pv.product_id = p.product_id
    WHERE oi.order_id = ?
");

$result = [];
foreach ($orders as $order) {
    $itemStmt->execute([$order['order_id']]);
    $items = $itemStmt->fetchAll(PDO::FETCH_ASSOC);

    $formattedItems = [];
    foreach ($items as $item) {
        $formattedItems[] = [
            'name' => $item['prod_name'],
            'quantity' => (int)$item['item_qty'],
            'price' => (float)$item['item_price'],
            'size' => $item['var_size'],
            'ice_level' => $item['ice_lvl'],
            'sugar_level' => $item['sugar_lvl'],
            'image_url' => $item['var_img'] ?: 'images/placeholder.png',
        ];
    }

    $paymentStatus = 'Unpaid';
    if ($order['amt_paid'] > 0 && $order['amt_paid'] >= $order['amt_due']) {
        $paymentStatus = 'Paid';
    }

    $displayId = $order['order_qr'] ?: ('ORD-' . str_pad($order['order_id'], 5, '0', STR_PAD_LEFT));
    $orderDate = $order['order_date'] ?: date('Y-m-d H:i:s');

    $result[] = [
        'id' => $displayId,
        'db_id' => (int)$order['order_id'],
        'order_qr' => $order['order_qr'],
        'date' => $orderDate,
        'total' => (float)$order['order_price'],
        'discount' => (float)($order['order_discount'] ?? 0),
        'status' => $order['order_status'],
        'payment_status' => $paymentStatus,
        'amount_paid' => (float)($order['amt_paid'] ?? 0),
        'payment_method' => 'Cash on Pickup',
        'items' => $formattedItems,
    ];
}

echo json_encode($result);
