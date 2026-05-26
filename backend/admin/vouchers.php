<?php
require_once dirname(__DIR__) . '/database.php';
header('Content-Type: application/json');

$method = $_SERVER['REQUEST_METHOD'];

try {
    try {
        $pdo->exec("ALTER TABLE voucher ADD COLUMN min_order DECIMAL(10,2) NOT NULL DEFAULT 0.00 AFTER discount");
    } catch (Exception $e) {
        // Column already exists
    }

    if ($method === 'GET') {
        $stmt = $pdo->query("SELECT * FROM voucher");
        $vouchersRaw = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        $vouchers = [];
        foreach ($vouchersRaw as $row) {
            $vouchers[] = [
                'id' => $row['voucher_id'],
                'code' => $row['voucher_code'] ?: 'VOUCHER' . $row['voucher_id'],
                'discount' => floatval($row['discount']) * 100, // 0.15 -> 15%
                'min_order' => (float)($row['min_order'] ?? 0),
                'type' => 'percentage',
                'expiry' => $row['voucher_expiry'],
                'status' => $row['voucher_active'] ? 'active' : 'cancelled'
            ];
        }
        
        echo json_encode(['status' => 'success', 'data' => $vouchers]);
    }
    else if ($method === 'POST') {
        $data = json_decode(file_get_contents('php://input'), true);
        
        $code = strtoupper($data['code'] ?? '');
        $discount = floatval($data['discount']) / 100; // 15% -> 0.15
        $expiry = $data['expiry'] ?? null;
        
        if ($expiry && strtotime($expiry) <= strtotime(date('Y-m-d'))) {
            throw new Exception("Expiry date cannot be in the past.");
        }
        
        $minOrder = (float)($data['min_order'] ?? 0);
        $stmt = $pdo->prepare("INSERT INTO voucher (voucher_code, discount, min_order, voucher_qty, voucher_expiry, voucher_active) VALUES (?, ?, ?, 100, ?, 1)");
        $stmt->execute([$code, $discount, $minOrder, $expiry]);
        
        echo json_encode(['status' => 'success']);
    }
    else if ($method === 'PUT') {
        $data = json_decode(file_get_contents('php://input'), true);
        
        if (isset($data['action']) && $data['action'] === 'toggle') {
            $new_status = isset($data['status']) ? (int)$data['status'] : 0;
            $stmt = $pdo->prepare("UPDATE voucher SET voucher_active = ? WHERE voucher_code = ?");
            $stmt->execute([$new_status, $data['code']]);
        } else {
            $code = strtoupper($data['code']);
            $old_code = strtoupper($data['old_code']);
            $discount = floatval($data['discount']) / 100;
            $expiry = $data['expiry'];
            
            if ($expiry && strtotime($expiry) <= strtotime(date('Y-m-d'))) {
                throw new Exception("Expiry date cannot be in the past.");
            }
            
            $minOrder = (float)($data['min_order'] ?? 0);
            $stmt = $pdo->prepare("UPDATE voucher SET voucher_code = ?, discount = ?, min_order = ?, voucher_expiry = ? WHERE voucher_code = ?");
            $stmt->execute([$code, $discount, $minOrder, $expiry, $old_code]);
        }
        
        echo json_encode(['status' => 'success']);
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
}
?>
