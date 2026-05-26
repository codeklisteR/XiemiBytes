<?php
require_once dirname(__DIR__) . '/database.php';

header('Content-Type: application/json');

$id = $_GET['id'] ?? null;

if (!$id) {
    echo json_encode(['status' => 'error', 'message' => 'Missing ID']);
    exit;
}

$stmt = $pdo->prepare("
    SELECT 
      p.*,
      MIN(pv.var_img) AS var_img
    FROM product p
    LEFT JOIN product_var pv ON pv.product_id = p.product_id
    WHERE p.product_id = ?
    GROUP BY p.product_id
");
$stmt->execute([$id]);
$product = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$product) {
    echo json_encode(['status' => 'error', 'message' => 'Product not found']);
    exit;
}

$product['var_img'] = $product['var_img'] ?? 'images/placeholder.png';

echo json_encode([
    'status' => 'success',
    'data' => $product
]);