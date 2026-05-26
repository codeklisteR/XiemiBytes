<?php
require_once dirname(__DIR__) . '/database.php';
header("Content-Type: application/json");

$pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
date_default_timezone_set('Asia/Manila');

try {
    $raw = file_get_contents("php://input");
    $data = json_decode($raw, true);

    if (!is_array($data)) {
        http_response_code(400);
        echo json_encode(["success" => false, "error" => "Invalid JSON payload"]);
        exit;
    }

    // Check login token
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
    $authenticated_role = $payload['role'] ?? 'customer';

    $cust_id = $data["cust_id"] ?? null;
    
    // Customers can only place orders for themselves
    if ($authenticated_role === 'customer') {
        $cust_id = $authenticated_id;
    }

    if (empty($cust_id)) {
        http_response_code(400);
        echo json_encode(["success" => false, "error" => "cust_id is required"]);
        exit;
    }

    $order_price = isset($data["total"])
        ? (float)$data["total"]
        : (isset($data["order_price"]) ? (float)$data["order_price"] : 0.00);

    $voucher_id = null;
    if (!empty($data["voucher_id"])) {
        $voucher_id = (int)$data["voucher_id"];
    } elseif (!empty($data["voucher_code"])) {
        $voucher_code = strtoupper(trim($data["voucher_code"]));
        $vStmt = $pdo->prepare("SELECT voucher_id, min_order FROM voucher WHERE voucher_code = ?");
        $vStmt->execute([$voucher_code]);
        $vRow = $vStmt->fetch(PDO::FETCH_ASSOC);
        if ($vRow) {
            $minOrder = (float)($vRow['min_order'] ?? 0);
            if ($minOrder > 0 && $order_price < $minOrder) {
                http_response_code(400);
                echo json_encode([
                    "success" => false,
                    "error" => "A minimum order total of ₱" . number_format($minOrder, 2) . " is required for this voucher.",
                ]);
                exit;
            }
            $voucher_id = $vRow['voucher_id'];
        }
    }

    if ($voucher_id && empty($data["voucher_code"])) {
        $vStmt = $pdo->prepare("SELECT min_order FROM voucher WHERE voucher_id = ?");
        $vStmt->execute([$voucher_id]);
        $minOrder = (float)($vStmt->fetchColumn() ?: 0);
        if ($minOrder > 0 && $order_price < $minOrder) {
            http_response_code(400);
            echo json_encode([
                "success" => false,
                "error" => "A minimum order total of ₱" . number_format($minOrder, 2) . " is required for this voucher.",
            ]);
            exit;
        }
    }

    // Online customer orders are always 'ol'
    $order_mode = "ol";

    $raw_status   = $data["order_status"] ?? "pay";
    $order_status = in_array($raw_status, ["pay", "claim", "done"]) ? $raw_status : "pay";

    $use_points = !empty($data["use_points"]);
    $pts_used = $use_points ? 100 : 0;
    
    // Validate if customer actually has 100 points
    if ($use_points) {
        $ptStmt = $pdo->prepare("SELECT pts FROM customers WHERE cust_id = ?");
        $ptStmt->execute([$cust_id]);
        $currentPts = (int)$ptStmt->fetchColumn();
        if ($currentPts < 100) {
            http_response_code(400);
            echo json_encode(["success" => false, "error" => "Not enough points to redeem."]);
            exit;
        }
    }

    $order_qr = null;

    $pdo->beginTransaction();

    $stmt = $pdo->prepare("
        INSERT INTO orders (cust_id, voucher_id, order_mode, order_status, order_price, pts_used, order_qr, order_date)
        VALUES (:cust_id, :voucher_id, :order_mode, :order_status, :order_price, :pts_used, :order_qr, :order_date)
    ");

    $stmt->execute([
        ":cust_id"      => $cust_id,
        ":voucher_id"   => $voucher_id,
        ":order_mode"   => $order_mode,
        ":order_status" => $order_status,
        ":order_price"  => $order_price,
        ":pts_used"     => $pts_used,
        ":order_qr"     => $order_qr,
        ":order_date"   => date('Y-m-d H:i:s')
    ]);

    $order_id = $pdo->lastInsertId();

    if (!$order_id) {
        throw new Exception("Order saved but order_id not returned.");
    }

    // Save order QR code
    $order_qr = "ORD-" . $order_id;
    $updateQrStmt = $pdo->prepare("UPDATE orders SET order_qr = :qr WHERE order_id = :id");
    $updateQrStmt->execute([":qr" => $order_qr, ":id" => $order_id]);

    // Insert order items
    $items = $data["items"] ?? [];

    if (!empty($items)) {
        $pvStmt = $pdo->prepare("
            SELECT prodvar_id FROM product_var
            WHERE product_id = :pid AND var_size = :size
            LIMIT 1
        ");

        $pvFallbackStmt = $pdo->prepare("
            SELECT prodvar_id FROM product_var 
            WHERE product_id = :pid 
            LIMIT 1
        ");

        $addonStmt = $pdo->prepare("
            SELECT addon_id FROM addon 
            WHERE addon_name = :name 
            LIMIT 1
        ");

        $itemStmt = $pdo->prepare("
            INSERT INTO order_items (order_id, prodvar_id, addon_id, item_price, item_qty, ice_lvl, sugar_lvl)
            VALUES (:order_id, :prodvar_id, :addon_id, :item_price, :item_qty, :ice_lvl, :sugar_lvl)
        ");

        foreach ($items as $item) {
            // Get item size and fallback if missing
            $pvStmt->execute([
                ":pid"  => $item["product_id"],
                ":size" => $item["size"] ?? "Regular",
            ]);
            $prodvar_id = $pvStmt->fetchColumn();

            if (!$prodvar_id) {
                $pvFallbackStmt->execute([":pid" => $item["product_id"]]);
                $prodvar_id = $pvFallbackStmt->fetchColumn();
            }

            if (!$prodvar_id) continue;

            // Handle toppings and extra add-ons
            $addon_ids = [];
            $addons   = $item["addons"] ?? [];
            if (!empty($addons)) {
                $addonNameMap = [
                    "Nata de Coco" => "Nata",
                    "Cheesecake"   => "Cheese Foam",
                    "Red Bean"     => "Pearls",
                    "Oreo"         => "Whipped Cream"
                ];

                foreach ($addons as $addon_name) {
                    $addon_name = trim($addon_name);
                    if (isset($addonNameMap[$addon_name])) {
                        $addon_name = $addonNameMap[$addon_name];
                    }

                    $addonStmt->execute([":name" => $addon_name]);
                    $resId = $addonStmt->fetchColumn();
                    if ($resId) {
                        $addon_ids[] = $resId;
                    }
                }
            }

            $addon_id_val = !empty($addon_ids) ? $addon_ids[0] : null;

            $itemStmt->execute([
                ":order_id"   => $order_id,
                ":prodvar_id" => $prodvar_id,
                ":addon_id"   => $addon_id_val,
                ":item_price" => (float)($item["unit_price"] ?? 0),
                ":item_qty"   => (int)($item["quantity"] ?? 1),
                ":ice_lvl"    => $item["ice_level"] ?? "Normal",
                ":sugar_lvl"  => $item["sugar_level"] ?? "100%",
            ]);
        }
    }

    // Update customer points (-100 if used, +10 for new order)
    $pts_adjustment = 10;
    if ($use_points) {
        $pts_adjustment -= 100;
    }
    
    $updPtsStmt = $pdo->prepare("UPDATE customers SET pts = pts + :adj WHERE cust_id = :cid");
    $updPtsStmt->execute([":adj" => $pts_adjustment, ":cid" => $cust_id]);

    $pdo->commit();

    echo json_encode([
        "success"  => true,
        "order_id" => (int)$order_id,
        "order_qr" => $order_qr,
        "message"  => "Order placed successfully"
    ]);

} catch (Throwable $e) {
    if ($pdo->inTransaction()) $pdo->rollBack();
    http_response_code(500);
    echo json_encode(["success" => false, "error" => "Database error or Request failed", "details" => $e->getMessage()]);
}