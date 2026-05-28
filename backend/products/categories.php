<?php
require_once dirname(__DIR__) . '/database.php';

header('Content-Type: application/json');

try {
    // Get categories from the category table
    $stmt = $pdo->query("SELECT categ_id as id, categ_name as name FROM category WHERE categ_active = 1 ORDER BY categ_name ASC");
    $categories = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        'status' => 'success',
        'data' => $categories
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'status' => 'error',
        'message' => $e->getMessage()
    ]);
}