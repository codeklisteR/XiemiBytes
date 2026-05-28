<?php
require_once dirname(__DIR__) . '/database.php';
header("Content-Type: application/json");

$pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

try {
    try {
        $pdo->exec("ALTER TABLE orders ADD COLUMN walkin_name VARCHAR(100) NULL DEFAULT NULL AFTER cust_id");
    } catch (Throwable $e) {
        // Column already exists
    }
    $raw = file_get_contents("php://input");
    $data = json_decode($raw, true);

    if (!is_array($data)) {
        http_response_code(400);
        echo json_encode(["success" => false, "error" => "Invalid JSON payload"]);
        exit;
    }

    $secretKey = 'xiemibytes_secret_key_2025';
    $headers = getallheaders();
    $authHeader = $headers['Authorization'] ?? $headers['authorization'] ?? '';

    if (!$authHeader) {
        http_response_code(401);
        echo json_encode(['success' => false, 'error' => 'No token provided']);
        exit;
    }

    $token = str_replace('Bearer ', '', $authHeader);
    $parts = explode('.', $token);

    if (count($parts) !== 3) {
        http_response_code(401);
        echo json_encode(['success' => false, 'error' => 'Invalid token format']);
        exit;
    }

    list($headerB64, $bodyB64, $signatureB64) = $parts;
    $expectedSignature = base64_encode(hash_hmac('sha256', "$headerB64.$bodyB64", $secretKey, true));
    if ($signatureB64 !== $expectedSignature) {
        http_response_code(401);
        echo json_encode(['success' => false, 'error' => 'Token signature verification failed']);
        exit;
    }

    $payload = json_decode(base64_decode($bodyB64), true);
    if (!$payload || empty($payload['id'])) {
        http_response_code(401);
        echo json_encode(['success' => false, 'error' => 'Invalid token payload']);
        exit;
    }

    $authenticated_id = $payload['id'];

    $custName = !empty($data['customer_name']) ? trim($data['customer_name']) : 'Walk-in';
    $displayName = ($custName === '' || strcasecmp($custName, 'walkin') === 0) ? 'Walk-in' : $custName;

    // Guest checkout: always attach to the shared walk-in account (never create customer rows)
    $walkInStmt = $pdo->prepare("SELECT cust_id FROM customers WHERE username = 'walkin' LIMIT 1");
    $walkInStmt->execute();
    $cust_id = $walkInStmt->fetchColumn();
    if (!$cust_id) {
        $insertWalkin = $pdo->prepare("INSERT INTO customers (username, cust_phone, cust_email, cust_password, pts, cust_active) VALUES ('walkin', '00000000000', 'walkin@pos.local', 'n/a', 0, 1)");
        $insertWalkin->execute();
        $cust_id = $pdo->lastInsertId();
    }

    $order_price = isset($data["total"]) ? (float)$data["total"] : 0.00;
    $order_discount = isset($data["discount"]) ? (float)$data["discount"] : 0.00;
    $order_mode = "pos";
    $order_status = "pay";

    $pdo->beginTransaction();

    $stmt = $pdo->prepare("
        INSERT INTO orders (cust_id, walkin_name, order_mode, order_status, order_price, order_discount, pts_used, order_date)
        VALUES (:cust_id, :walkin_name, :order_mode, :order_status, :order_price, :order_discount, 0, NOW())
    ");

    $stmt->execute([
        ":cust_id"         => $cust_id,
        ":walkin_name"     => $displayName,
        ":order_mode"      => $order_mode,
        ":order_status"    => $order_status,
        ":order_price"     => $order_price,
        ":order_discount"  => $order_discount,
    ]);

    $order_id = $pdo->lastInsertId();

    $order_qr = "ORD-" . $order_id;
    $updateQrStmt = $pdo->prepare("UPDATE orders SET order_qr = :qr WHERE order_id = :id");
    $updateQrStmt->execute([":qr" => $order_qr, ":id" => $order_id]);

    $amount_paid = isset($data['amount_paid']) ? (float)$data['amount_paid'] : $order_price;
    $amt_change = max(0, $amount_paid - $order_price);

    $paymentStmt = $pdo->prepare("
        INSERT INTO payment (order_id, emp_id, amt_due, amt_paid, amt_change, payment_date)
        VALUES (?, ?, ?, ?, ?, NOW())
    ");
    $paymentStmt->execute([$order_id, $authenticated_id, $order_price, $amount_paid, $amt_change]);

    $items = $data["items"] ?? [];

    if (!empty($items)) {
        $pvStmt = $pdo->prepare("
            SELECT prodvar_id FROM product_var
            WHERE product_id = :pid AND var_size = :size
            LIMIT 1
        ");

        $pvRegularStmt = $pdo->prepare("
            SELECT prodvar_id FROM product_var
            WHERE product_id = :pid AND var_size = 'Regular'
            LIMIT 1
        ");

        $itemStmt = $pdo->prepare("
            INSERT INTO order_items (order_id, prodvar_id, item_price, item_qty, ice_lvl, sugar_lvl)
            VALUES (:order_id, :prodvar_id, :item_price, :item_qty, :ice_lvl, :sugar_lvl)
        ");

        foreach ($items as $item) {
            $size = $item["size"] ?? "Regular";
            $pvStmt->execute([
                ":pid"  => $item["product_id"],
                ":size" => $size,
            ]);
            $prodvar_id = $pvStmt->fetchColumn();

            if (!$prodvar_id) {
                $pvRegularStmt->execute([":pid" => $item["product_id"]]);
                $prodvar_id = $pvRegularStmt->fetchColumn();
            }

            if (!$prodvar_id) continue;

            $itemStmt->execute([
                ":order_id"   => $order_id,
                ":prodvar_id" => $prodvar_id,
                ":item_price" => (float)($item["unit_price"] ?? 0),
                ":item_qty"   => (int)($item["quantity"] ?? 1),
                ":ice_lvl"    => $item["ice_level"] ?? "Normal",
                ":sugar_lvl"  => $item["sugar_level"] ?? "100%",
            ]);

            $stockStmt = $pdo->prepare("UPDATE product SET prod_qty = prod_qty - :qty WHERE product_id = :pid");
            $stockStmt->execute([':qty' => (int)($item["quantity"] ?? 1), ':pid' => $item["product_id"]]);
        }
    }

    $pdo->commit();

    echo json_encode([
        "success"       => true,
        "order_id"      => (int)$order_id,
        "order_qr"      => $order_qr,
        "order_status"  => "pay",
        "payment_status"=> "Paid",
        "customer_name" => $displayName,
        "message"       => "POS order placed — Preparing"
    ]);

} catch (Throwable $e) {
    if ($pdo->inTransaction()) $pdo->rollBack();
    http_response_code(400);
    echo json_encode(["success" => false, "message" => $e->getMessage(), "error" => $e->getMessage(), "details" => $e->getMessage()]);
}
