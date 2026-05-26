<?php
require_once dirname(__DIR__) . '/database.php';

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
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

if (!$payload || empty($payload['id'])) {
    http_response_code(401);
    echo json_encode(['status' => 'error', 'message' => 'Invalid token payload']);
    exit;
}

$userId = $payload['id'];
$role = $payload['role'] ?? 'customer';

try {
    if ($role !== 'customer') {
        // Query employee table
        $stmt = $pdo->prepare("
            SELECT emp_id, givname, email, emp_role, emp_active
            FROM employee
            WHERE emp_id = :id AND emp_active = 1
            LIMIT 1
        ");
        $stmt->execute([':id' => $userId]);
        $employee = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$employee) {
            http_response_code(401);
            echo json_encode(['status' => 'error', 'message' => 'Employee user not found']);
            exit;
        }

        $userData = [
            'id'         => (int)$employee['emp_id'],
            'cust_id'    => (int)$employee['emp_id'], // compatibility key
            'first_name' => $employee['givname'],
            'username'   => $employee['givname'],
            'email'      => $employee['email'],
            'pts'        => 0,
            'role'       => $employee['emp_role'],
        ];
    } else {
        // Query customers table
        $stmt = $pdo->prepare("
            SELECT cust_id, username, cust_phone, cust_email, pts, cust_active
            FROM customers
            WHERE cust_id = :id AND cust_active = 1
            LIMIT 1
        ");
        $stmt->execute([':id' => $userId]);
        $customer = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$customer) {
            http_response_code(401);
            echo json_encode(['status' => 'error', 'message' => 'Customer user not found']);
            exit;
        }

        $userData = [
            'id'         => (int)$customer['cust_id'],
            'cust_id'    => (int)$customer['cust_id'],
            'first_name' => $customer['username'],
            'username'   => $customer['username'],
            'email'      => $customer['cust_email'],
            'phone'      => $customer['cust_phone'] ?? '',
            'pts'        => (int)$customer['pts'],
            'role'       => 'customer',
        ];
    }

    echo json_encode([
        'status' => 'success',
        'user'   => $userData
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
}