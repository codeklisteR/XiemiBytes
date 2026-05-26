<?php
require_once dirname(__DIR__) . '/database.php';

header('Content-Type: application/json');

try {
    $stmt = $pdo->query("SELECT DISTINCT prod_categ FROM product");
    $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

    $categories = [];
    foreach ($rows as $row) {
        if (!empty($row['prod_categ'])) {
            $categories[] = [
                'id' => $row['prod_categ'],
                'name' => $row['prod_categ']
            ];
        }
    }

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