<?php
require_once dirname(__DIR__) . '/database.php';

header('Content-Type: application/json');

$method = $_SERVER['REQUEST_METHOD'];

try {
    try {
        $pdo->exec("ALTER TABLE orders ADD COLUMN walkin_name VARCHAR(100) NULL DEFAULT NULL AFTER cust_id");
    } catch (Exception $e) {
        // Column already exists
    }
    try {
        $pdo->exec("ALTER TABLE payment ADD COLUMN payment_refunded TINYINT(1) NOT NULL DEFAULT 0");
    } catch (Exception $e) {
        // Column already exists
    }

    if ($method === 'GET') {
        $where = ["1=1"];
        $params = [];

        if (!empty($_GET['status']) && $_GET['status'] !== 'all') {
            $where[] = "o.order_status = ?";
            $params[] = $_GET['status'];
        } elseif (empty($_GET['include_cancelled'])) {
            $where[] = "o.order_status != 'cancelled'";
        }

        if (!empty($_GET['order_type'])) {
            if ($_GET['order_type'] === 'walkin') {
                $where[] = "o.order_mode = 'pos'";
            } elseif ($_GET['order_type'] === 'online') {
                $where[] = "o.order_mode = 'ol'";
            }
        }

        if (!empty($_GET['date_from'])) {
            $where[] = "DATE(o.order_date) >= ?";
            $params[] = $_GET['date_from'];
        }

        if (!empty($_GET['date_to'])) {
            $where[] = "DATE(o.order_date) <= ?";
            $params[] = $_GET['date_to'];
        }

        $whereClause = count($where) ? 'WHERE ' . implode(' AND ', $where) : '';

        $stmt = $pdo->prepare("
            SELECT 
                o.order_id,
                o.order_mode,
                o.order_status as status,
                o.order_price as total,
                o.order_discount,
                o.pts_used,
                o.order_qr,
                o.order_date,
                o.walkin_name,
                c.username,
                c.cust_email as email,
                c.cust_phone as phone,
                COALESCE(p.amt_paid, 0) as amt_paid,
                COALESCE(p.amt_due, o.order_price) as amt_due,
                COALESCE(p.amt_change, 0) as amt_change
            FROM orders o
            LEFT JOIN customers c ON o.cust_id = c.cust_id
            LEFT JOIN (
                SELECT order_id,
                    MAX(amt_paid) as amt_paid,
                    MAX(amt_due) as amt_due,
                    MAX(amt_change) as amt_change,
                    MAX(payment_refunded) as payment_refunded
                FROM payment
                GROUP BY order_id
            ) p ON o.order_id = p.order_id
            $whereClause
            ORDER BY o.order_id DESC
        ");
        $stmt->execute($params);
        $ordersRaw = $stmt->fetchAll();

        $orders = [];
        foreach ($ordersRaw as $row) {
            $itemStmt = $pdo->prepare("
                SELECT 
                    oi.item_qty as quantity,
                    oi.item_price as price,
                    oi.ice_lvl as ice_level,
                    oi.sugar_lvl as sugar_level,
                    pv.var_size as size,
                    pr.prod_name as name,
                    pr.prod_categ as category
                FROM order_items oi
                LEFT JOIN product_var pv ON oi.prodvar_id = pv.prodvar_id
                LEFT JOIN product pr ON pv.product_id = pr.product_id
                WHERE oi.order_id = ?
            ");
            $itemStmt->execute([$row['order_id']]);
            $items = $itemStmt->fetchAll(PDO::FETCH_ASSOC);

            $orderStatus = strtolower(trim($row['status'] ?? 'pay'));

            $payment_status = 'Unpaid';
            if ($orderStatus === 'cancelled' || !empty($row['payment_refunded'])) {
                $payment_status = 'Refunded';
            } elseif ($row['amt_paid'] > 0 && $row['amt_due'] > 0 && $row['amt_paid'] >= $row['amt_due']) {
                $payment_status = 'Paid';
            }

            $isWalkin = ($row['order_mode'] === 'pos');
            $orderType = $isWalkin ? 'walkin' : 'online';
            $orderTypeLabel = $isWalkin ? 'Walk-in' : 'Online';

            $guestName = trim($row['walkin_name'] ?? '');
            if ($isWalkin) {
                $customerDisplay = $guestName !== '' ? $guestName : 'Walk-in';
            } else {
                $customerDisplay = ($row['username'] && $row['username'] !== 'walkin')
                    ? $row['username']
                    : ($guestName ?: 'Customer');
            }

            if ($isWalkin && $orderStatus === 'claim') {
                $orderStatus = 'pay';
            }

            $orderTotal = (float)$row['total'];
            $originalTotal = $orderTotal;
            if ($orderStatus === 'cancelled' && $orderTotal <= 0 && count($items) > 0) {
                $originalTotal = array_reduce($items, function ($sum, $item) {
                    return $sum + ((float)($item['price'] ?? 0) * (int)($item['quantity'] ?? 1));
                }, 0.0);
                $originalTotal += (float)($row['order_discount'] ?? 0);
            }
            $displayTotal = $orderStatus === 'cancelled' ? 0.0 : $orderTotal;

            $statusLabels = [
                'pay' => 'Preparing',
                'claim' => 'To Claim',
                'done' => 'Done',
                'cancelled' => 'Cancelled',
            ];

            $orders[] = [
                'id' => $row['order_qr'] ?: ('ORD-' . str_pad($row['order_id'], 5, '0', STR_PAD_LEFT)),
                'order_qr' => $row['order_qr'],
                'db_id' => (int)$row['order_id'],
                'guest_customer_name' => $guestName,
                'customer' => $customerDisplay,
                'email' => $isWalkin ? null : $row['email'],
                'phone' => $isWalkin ? null : $row['phone'],
                'total' => $displayTotal,
                'total_original' => $orderStatus === 'cancelled' ? $originalTotal : $orderTotal,
                'discount' => (float)($row['order_discount'] ?? 0),
                'date' => $row['order_date'] ? $row['order_date'] : date('Y-m-d H:i:s'),
                'status' => $orderStatus,
                'status_label' => $statusLabels[$orderStatus] ?? $orderStatus,
                'payment_status' => $payment_status,
                'amount_paid' => (float)($row['amt_paid'] ?? 0),
                'amount_due' => (float)($row['amt_due'] ?? $row['total']),
                'change' => (float)($row['amt_change'] ?? 0),
                'items' => $items,
                'order_mode' => $row['order_mode'],
                'order_type' => $orderType,
                'order_type_label' => $orderTypeLabel,
            ];
        }

        echo json_encode(['status' => 'success', 'data' => $orders]);
    }
    else if ($method === 'PUT') {
        $data = json_decode(file_get_contents('php://input'), true);

        if (isset($data['action']) && $data['action'] === 'cancelled') {
            $id = $data['id'];

            $ord = $pdo->prepare("SELECT cust_id, pts_used, order_mode, order_price FROM orders WHERE order_id = ?");
            $ord->execute([$id]);
            $row = $ord->fetch(PDO::FETCH_ASSOC);

            if ($row && $row['cust_id'] && ($row['order_mode'] ?? '') === 'ol') {
                $ptsAwarded = 10;
                $ptsRedeemed = (int)($row['pts_used'] ?? 0);
                if ($ptsAwarded > 0) {
                    $pdo->prepare("UPDATE customers SET pts = GREATEST(pts - ?, 0) WHERE cust_id = ?")
                        ->execute([$ptsAwarded, $row['cust_id']]);
                }
                if ($ptsRedeemed > 0) {
                    $pdo->prepare("UPDATE customers SET pts = pts + ? WHERE cust_id = ?")
                        ->execute([$ptsRedeemed, $row['cust_id']]);
                }
            }

            $pdo->prepare("UPDATE orders SET order_status = 'cancelled', order_price = 0 WHERE order_id = ?")
                ->execute([$id]);

            $payCheck = $pdo->prepare("SELECT payment_ref FROM payment WHERE order_id = ? LIMIT 1");
            $payCheck->execute([$id]);
            if ($payCheck->fetchColumn()) {
                $pdo->prepare("
                    UPDATE payment
                    SET payment_refunded = 1, amt_paid = 0, amt_change = 0, amt_due = 0
                    WHERE order_id = ?
                ")->execute([$id]);
            }

            echo json_encode([
                'status' => 'success',
                'message' => 'Order cancelled. Total deducted and payment marked as refunded.',
            ]);
            exit;
        }

        if (isset($data['action']) && $data['action'] === 'confirm_claim') {
            $id = $data['id'];
            $total = (float)($data['total'] ?? 0);
            $amountPaid = isset($data['amount_paid']) ? (float)$data['amount_paid'] : $total;

            $modeStmt = $pdo->prepare("SELECT order_mode, order_status, order_price FROM orders WHERE order_id = ?");
            $modeStmt->execute([$id]);
            $modeRow = $modeStmt->fetch(PDO::FETCH_ASSOC);

            if (!$modeRow || $modeRow['order_mode'] !== 'ol' || $modeRow['order_status'] !== 'claim') {
                http_response_code(422);
                echo json_encode(['status' => 'error', 'message' => 'Only online To Claim orders can be completed from QR fulfillment.']);
                exit;
            }

            $ord = $modeRow;

            $orderTotal = $total > 0 ? $total : (float)$ord['order_price'];
            if ($amountPaid < $orderTotal) {
                http_response_code(422);
                echo json_encode(['status' => 'error', 'message' => 'Amount paid must be at least the order total.']);
                exit;
            }

            $amt_change = max(0, $amountPaid - $orderTotal);
            $payStmt = $pdo->prepare("SELECT payment_ref FROM payment WHERE order_id = ?");
            $payStmt->execute([$id]);
            if ($payStmt->fetchColumn()) {
                $upd = $pdo->prepare("UPDATE payment SET amt_paid = ?, amt_due = ?, amt_change = ? WHERE order_id = ?");
                $upd->execute([$amountPaid, $orderTotal, $amt_change, $id]);
            } else {
                $ins = $pdo->prepare("INSERT INTO payment (order_id, emp_id, amt_due, amt_paid, amt_change, payment_date) VALUES (?, 1, ?, ?, ?, NOW())");
                $ins->execute([$id, $orderTotal, $amountPaid, $amt_change]);
            }

            $pdo->prepare("UPDATE orders SET order_status = 'done' WHERE order_id = ?")->execute([$id]);
            echo json_encode(['status' => 'success', 'message' => 'Order claimed, marked Done and Paid']);
            exit;
        }

        if (isset($data['action']) && $data['action'] === 'payment') {
            $id = $data['id'];
            $total = (float)($data['total'] ?? 0);
            $amountPaid = isset($data['amount_paid']) ? (float)$data['amount_paid'] : $total;
            $paymentStatus = $data['payment_status'] ?? 'Paid';

            $statusStmt = $pdo->prepare("SELECT order_status FROM orders WHERE order_id = ?");
            $statusStmt->execute([$id]);
            $currentStatus = $statusStmt->fetchColumn();

            $modeStmt = $pdo->prepare("SELECT order_mode FROM orders WHERE order_id = ?");
            $modeStmt->execute([$id]);
            $orderMode = $modeStmt->fetchColumn();

            if ($paymentStatus === 'Paid' && in_array($currentStatus, ['pay', 'claim'], true) && $orderMode !== 'pos') {
                http_response_code(422);
                echo json_encode([
                    'status' => 'error',
                    'message' => 'Online orders cannot be marked Paid until fulfillment (Complete Order).',
                ]);
                exit;
            }

            $stmt = $pdo->prepare("SELECT * FROM payment WHERE order_id = ?");
            $stmt->execute([$id]);
            $payment = $stmt->fetch();

            if ($paymentStatus === 'Paid') {
                $amt_paid = $amountPaid > 0 ? $amountPaid : $total;
                $amt_change = max(0, $amt_paid - $total);
                if ($payment) {
                    $upd = $pdo->prepare("UPDATE payment SET amt_paid = ?, amt_due = ?, amt_change = ? WHERE order_id = ?");
                    $upd->execute([$amt_paid, $total, $amt_change, $id]);
                } else {
                    $ins = $pdo->prepare("INSERT INTO payment (order_id, emp_id, amt_due, amt_paid, amt_change, payment_date) VALUES (?, 1, ?, ?, ?, NOW())");
                    $ins->execute([$id, $total, $amt_paid, $amt_change]);
                }
            } else {
                if ($payment) {
                    $upd = $pdo->prepare("UPDATE payment SET amt_paid = 0, amt_change = 0 WHERE order_id = ?");
                    $upd->execute([$id]);
                }
            }
        } else {
            $id = $data['id'];
            $status = strtolower($data['status'] ?? '');

            $metaStmt = $pdo->prepare("SELECT order_mode, order_status FROM orders WHERE order_id = ?");
            $metaStmt->execute([$id]);
            $meta = $metaStmt->fetch(PDO::FETCH_ASSOC);

            if (!$meta) {
                http_response_code(404);
                echo json_encode(['status' => 'error', 'message' => 'Order not found.']);
                exit;
            }

            $isPos = ($meta['order_mode'] === 'pos');

            if ($status === 'done') {
                if ($isPos && $meta['order_status'] === 'pay') {
                    $stmt = $pdo->prepare("UPDATE orders SET order_status = 'done' WHERE order_id = ?");
                    $stmt->execute([$id]);
                    echo json_encode(['status' => 'success', 'message' => 'Walk-in order marked Done']);
                    exit;
                }
                http_response_code(422);
                echo json_encode([
                    'status' => 'error',
                    'message' => 'Use Complete Order (QR) for online orders, or Mark as Done for walk-in Preparing orders.',
                ]);
                exit;
            }

            if ($status === 'claim' && $isPos) {
                http_response_code(422);
                echo json_encode(['status' => 'error', 'message' => 'Walk-in orders do not use To Claim. Mark as Done when ready.']);
                exit;
            }

            if ($isPos) {
                http_response_code(422);
                echo json_encode(['status' => 'error', 'message' => 'Invalid status transition for walk-in order.']);
                exit;
            }

            if (!in_array($status, ['pay', 'claim'], true)) {
                http_response_code(422);
                echo json_encode(['status' => 'error', 'message' => 'Invalid order status.']);
                exit;
            }

            if ($status === 'claim' && $meta['order_status'] !== 'pay') {
                http_response_code(422);
                echo json_encode(['status' => 'error', 'message' => 'Only Preparing online orders can move to To Claim.']);
                exit;
            }

            $stmt = $pdo->prepare("UPDATE orders SET order_status = ? WHERE order_id = ?");
            $stmt->execute([$status, $id]);
        }

        echo json_encode(['status' => 'success']);
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
}
