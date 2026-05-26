<?php
require_once dirname(__DIR__) . '/database.php';
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['status' => 'error', 'message' => 'Method not allowed']);
    exit;
}

$data = json_decode(file_get_contents('php://input'), true);

$username = trim($data['username'] ?? '');
$email    = trim($data['email'] ?? '');
$phone    = preg_replace('/\D/', '', trim($data['phone'] ?? ''));
$password = trim($data['password'] ?? '');

if (!$username || !$email || !$phone || !$password) {
    http_response_code(422);
    echo json_encode(['status' => 'error', 'message' => 'All fields are required']);
    exit;
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(422);
    echo json_encode(['status' => 'error', 'message' => 'Invalid email']);
    exit;
}

if (strlen($phone) < 10 || strlen($phone) > 11) {
    http_response_code(422);
    echo json_encode(['status' => 'error', 'message' => 'Please enter a valid 10–11 digit phone number']);
    exit;
}

if (strlen($password) < 6) {
    http_response_code(422);
    echo json_encode(['status' => 'error', 'message' => 'Password must be at least 6 characters']);
    exit;
}

$check = $pdo->prepare("SELECT cust_id FROM customers WHERE cust_email = ?");
$check->execute([$email]);
if ($check->fetch()) {
    http_response_code(409);
    echo json_encode(['status' => 'error', 'message' => 'Email already exists']);
    exit;
}

$phoneCheck = $pdo->prepare("SELECT cust_id FROM customers WHERE cust_phone = ? AND cust_phone != ''");
$phoneCheck->execute([$phone]);
if ($phoneCheck->fetch()) {
    http_response_code(409);
    echo json_encode(['status' => 'error', 'message' => 'Phone number already registered']);
    exit;
}

$hashedPassword = substr(md5($password), 0, 30);

$stmt = $pdo->prepare("
    INSERT INTO customers (username, cust_phone, cust_email, cust_password, pts, cust_active)
    VALUES (?, ?, ?, ?, 0, 1)
");
$stmt->execute([$username, $phone, $email, $hashedPassword]);
$userId = $pdo->lastInsertId();

echo json_encode([
    'status' => 'success',
    'message' => 'Registration successful',
    'user' => [
        'id' => $userId,
        'username' => $username,
        'email' => $email,
        'phone' => $phone,
        'role' => 'customer',
    ],
]);
