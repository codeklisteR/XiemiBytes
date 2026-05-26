<?php
require_once dirname(__DIR__) . '/database.php';

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
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

$data = json_decode(file_get_contents('php://input'), true) ?? $_POST;
$code = strtoupper(trim($data['code'] ?? ''));

if (empty($code)) {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => 'Voucher code is required']);
    exit;
}

try {
    try {
        $pdo->exec("ALTER TABLE voucher ADD COLUMN min_order DECIMAL(10,2) NOT NULL DEFAULT 0.00 AFTER discount");
    } catch (Exception $e) {
        // Column already exists
    }

    $stmt = $pdo->prepare("SELECT * FROM voucher WHERE voucher_code = ?");
    $stmt->execute([$code]);
    $voucher = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$voucher) {
        throw new Exception("Invalid voucher code");
    }

    $voucher_id = $voucher['voucher_id'];

    if ($voucher['voucher_active'] != 1) {
        throw new Exception("This voucher is inactive");
    }

    if (strtotime($voucher['voucher_expiry']) <= strtotime(date('Y-m-d'))) {
        throw new Exception("This voucher has expired");
    }

    $total = (float)($data['total'] ?? 0);
    $minOrder = (float)($voucher['min_order'] ?? 0);
    if ($minOrder > 0 && $total < $minOrder) {
        throw new Exception('A minimum order total of ' . number_format($minOrder, 2) . ' is required to use this voucher.');
    }

    // Make sure user hasn't already used this voucher
    $useStmt = $pdo->prepare("
        SELECT COUNT(*) FROM orders 
        WHERE cust_id = ? AND voucher_id = ? AND order_status NOT IN ('cancelled')
    ");
    $useStmt->execute([$cust_id, $voucher_id]);
    if ($useStmt->fetchColumn() > 0) {
        throw new Exception("You have already used this voucher code");
    }

    $discount = (float)$voucher['discount'];
    $type = ($discount <= 1.0) ? 'percentage' : 'fixed';
    $discountValue = ($type === 'percentage') ? (int)($discount * 100) : $discount;

    echo json_encode([
        'status' => 'success',
        'valid' => true,
        'code' => $code,
        'type' => $type,
        'discount' => $discountValue,
        'message' => $type === 'percentage'
            ? "$discountValue% discount applied!"
            : "₱$discountValue off applied!"
    ]);

} catch (Exception $e) {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
}
