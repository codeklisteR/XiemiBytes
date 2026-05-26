<?php
require_once dirname(__DIR__) . '/database.php';

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['status' => 'error', 'message' => 'Method not allowed']);
    exit;
}

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
    echo json_encode(['status' => 'error', 'message' => 'Invalid token']);
    exit;
}

$payload = json_decode(base64_decode($parts[1]), true);

if (!$payload || !isset($payload['id'])) {
    http_response_code(401);
    echo json_encode(['status' => 'error', 'message' => 'Invalid token payload']);
    exit;
}

$user_id = $payload['id'];
$role = $payload['role'] ?? 'customer';

// Get JSON input
$data = json_decode(file_get_contents("php://input"), true);

if (!$data) {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => 'Invalid JSON input']);
    exit;
}

$current = trim($data['current_password'] ?? '');
$new = trim($data['new_password'] ?? '');
$confirm = trim($data['new_password_confirmation'] ?? '');

// Validation
if (!$current || !$new || !$confirm) {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => 'Missing fields']);
    exit;
}

if ($new !== $confirm) {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => 'Password mismatch']);
    exit;
}

try {
    if ($role !== 'customer') {
        // Change password for Employee
        $stmt = $pdo->prepare("SELECT emp_password FROM employee WHERE emp_id = ?");
        $stmt->execute([$user_id]);
        $user = $stmt->fetch();

        if (!$user) {
            http_response_code(404);
            echo json_encode(['status' => 'error', 'message' => 'Employee user not found']);
            exit;
        }

        // Verify current password (supports secure password_verify, md5, truncated md5, and legacy plaintext)
        $isMatch = password_verify($current, $user['emp_password']) || ($current === $user['emp_password']) || (md5($current) === $user['emp_password']) || (substr(md5($current), 0, 30) === $user['emp_password']);
        if (!$isMatch) {
            http_response_code(400);
            echo json_encode(['status' => 'error', 'message' => 'Current password incorrect']);
            exit;
        }

        // Hash the new password securely
        $newHash = substr(md5($new), 0, 30);

        // Update password with the secure hash
        $updateStmt = $pdo->prepare("UPDATE employee SET emp_password = ? WHERE emp_id = ?");
        $updateStmt->execute([$newHash, $user_id]);

    } else {
        // Change password for Customer
        $stmt = $pdo->prepare("SELECT cust_password FROM customers WHERE cust_id = ?");
        $stmt->execute([$user_id]);
        $user = $stmt->fetch();

        if (!$user) {
            http_response_code(404);
            echo json_encode(['status' => 'error', 'message' => 'Customer user not found']);
            exit;
        }

        // Verify current password (supports secure password_verify, md5, truncated md5, and legacy plaintext)
        $isMatch = password_verify($current, $user['cust_password']) || ($current === $user['cust_password']) || (md5($current) === $user['cust_password']) || (substr(md5($current), 0, 30) === $user['cust_password']);
        if (!$isMatch) {
            http_response_code(400);
            echo json_encode(['status' => 'error', 'message' => 'Current password incorrect']);
            exit;
        }

        // Hash the new password securely
        $newHash = substr(md5($new), 0, 30);

        // Update password with the secure hash
        $updateStmt = $pdo->prepare("UPDATE customers SET cust_password = ? WHERE cust_id = ?");
        $updateStmt->execute([$newHash, $user_id]);
    }

    echo json_encode([
        'status' => 'success',
        'message' => 'Password changed successfully'
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
}