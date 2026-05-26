<?php
require_once dirname(__DIR__) . '/database.php';

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(['status' => 'error', 'message' => 'Method not allowed']);
    exit;
}

// Check login token
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

try {
    // Get active vouchers and see if user already claimed them
    $stmt = $pdo->prepare("
        SELECT 
            v.*,
            (SELECT COUNT(*) FROM voucher_claim vc WHERE vc.voucher_id = v.voucher_id AND vc.cust_id = ?) AS claimed
        FROM voucher v
        WHERE v.voucher_active = 1 AND v.voucher_expiry >= CURDATE()
    ");
    $stmt->execute([$cust_id]);
    $vouchers = $stmt->fetchAll(PDO::FETCH_ASSOC);

    $formatted = [];
    foreach ($vouchers as $v) {
        $id = (int)$v['voucher_id'];
        $code = $v['voucher_code'];
        $discount = (float)$v['discount'];
        
        $type = ($discount <= 1.0) ? 'percentage' : 'fixed';
        $discountValue = ($type === 'percentage') ? (int)($discount * 100) : $discount;

        $formatted[] = [
            'id' => $id,
            'code' => $code,
            'description' => $type === 'percentage' ? "$discountValue% discount on your order" : "₱$discountValue flat off on your order",
            'type' => $type,
            'discount' => $discountValue,
            'expiry' => $v['voucher_expiry'],
            'qty_remaining' => (int)$v['voucher_qty'],
            'claimed' => (int)$v['claimed'] > 0
        ];
    }

    echo json_encode([
        'status' => 'success',
        'data' => $formatted
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
}
