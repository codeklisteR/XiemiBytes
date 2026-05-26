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
$voucher_id = $data['voucher_id'] ?? null;

if (!$voucher_id) {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => 'Missing voucher_id']);
    exit;
}

try {
    $pdo->beginTransaction();

    // Find voucher and lock details
    $stmt = $pdo->prepare("SELECT * FROM voucher WHERE voucher_id = ? FOR UPDATE");
    $stmt->execute([$voucher_id]);
    $voucher = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$voucher) {
        throw new Exception("Voucher not found");
    }

    if ($voucher['voucher_active'] != 1) {
        throw new Exception("This voucher is inactive");
    }

    if (strtotime($voucher['voucher_expiry']) < strtotime(date('Y-m-d'))) {
        throw new Exception("This voucher has expired");
    }

    if ($voucher['voucher_qty'] <= 0) {
        throw new Exception("No vouchers remaining to claim");
    }

    // Check if already claimed
    $claimStmt = $pdo->prepare("SELECT COUNT(*) FROM voucher_claim WHERE cust_id = ? AND voucher_id = ?");
    $claimStmt->execute([$cust_id, $voucher_id]);
    if ($claimStmt->fetchColumn() > 0) {
        throw new Exception("You have already claimed this voucher");
    }

    // Save claim record
    $insertStmt = $pdo->prepare("INSERT INTO voucher_claim (cust_id, voucher_id, claim_date) VALUES (?, ?, CURRENT_TIMESTAMP)");
    $insertStmt->execute([$cust_id, $voucher_id]);

    // Reduce quantity
    $updateStmt = $pdo->prepare("UPDATE voucher SET voucher_qty = voucher_qty - 1 WHERE voucher_id = ?");
    $updateStmt->execute([$voucher_id]);

    $pdo->commit();

    echo json_encode([
        'status' => 'success',
        'message' => 'Voucher claimed successfully!'
    ]);

} catch (Exception $e) {
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
}
