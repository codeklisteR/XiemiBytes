<?php
require_once dirname(__DIR__) . '/database.php';
header('Content-Type: application/json');

$method = $_SERVER['REQUEST_METHOD'];

try {
    // Ensure category table exists (graceful for older DBs)
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS `category` (
          `categ_id` bigint(20) NOT NULL AUTO_INCREMENT,
          `categ_name` varchar(30) NOT NULL,
          `categ_active` tinyint(1) NOT NULL DEFAULT 1,
          PRIMARY KEY (`categ_id`),
          UNIQUE KEY `categ_name` (`categ_name`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci
    ");

    if ($method === 'GET') {
        $stmt = $pdo->query("SELECT MIN(categ_id) as id, MAX(TRIM(categ_name)) as name FROM category WHERE categ_active = 1 GROUP BY LOWER(TRIM(categ_name)) ORDER BY name ASC");
        $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

        if (empty($rows)) {
            $stmt = $pdo->query("SELECT DISTINCT TRIM(prod_categ) as name FROM product WHERE prod_categ IS NOT NULL AND TRIM(prod_categ) != '' ORDER BY name");
            $distinct = $stmt->fetchAll(PDO::FETCH_ASSOC);
            $rows = array_map(function ($r) {
                return ['id' => $r['name'], 'name' => $r['name']];
            }, $distinct);
        }

        $seen = [];
        $unique = [];
        foreach ($rows as $row) {
            $key = strtolower(trim($row['name'] ?? ''));
            if ($key === '' || isset($seen[$key])) {
                continue;
            }
            $seen[$key] = true;
            $unique[] = ['id' => $row['id'], 'name' => trim($row['name'])];
        }

        echo json_encode(['status' => 'success', 'data' => $unique]);
    }
    elseif ($method === 'POST') {
        $data = json_decode(file_get_contents('php://input'), true);
        $name = trim($data['name'] ?? '');

        if (!$name) {
            http_response_code(400);
            echo json_encode(['status' => 'error', 'message' => 'Category name required']);
            exit;
        }

        $stmt = $pdo->prepare("INSERT INTO category (categ_name) VALUES (?)");
        $stmt->execute([$name]);

        echo json_encode(['status' => 'success', 'id' => $pdo->lastInsertId(), 'name' => $name]);
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
}
