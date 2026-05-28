<?php
/**
 * One-time migration: normalize all order_qr values to ORD-{id} format (no zero-padding).
 * Run once via browser, then delete this file.
 */
require_once dirname(__DIR__) . '/database.php';
header('Content-Type: application/json');

try {
    // Fetch all orders so we can rewrite each one to ORD-{order_id}
    $stmt = $pdo->query("SELECT order_id, order_qr FROM orders");
    $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

    $updated = 0;
    $skipped = 0;
    $details = [];

    $upd = $pdo->prepare("UPDATE orders SET order_qr = :qr WHERE order_id = :id");

    foreach ($rows as $row) {
        $correct_qr = 'ORD-' . $row['order_id'];

        if ($row['order_qr'] === $correct_qr) {
            $skipped++;
            continue;
        }

        $upd->execute([':qr' => $correct_qr, ':id' => $row['order_id']]);
        $details[] = ['order_id' => $row['order_id'], 'old' => $row['order_qr'], 'new' => $correct_qr];
        $updated++;
    }

    echo json_encode([
        'status'  => 'success',
        'updated' => $updated,
        'skipped' => $skipped,
        'changes' => $details,
        'note'    => 'Migration complete. Please delete this file (fix-order-qr.php).',
    ], JSON_PRETTY_PRINT);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
}
