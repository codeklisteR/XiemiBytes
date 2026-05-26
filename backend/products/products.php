<?php
require_once dirname(__DIR__) . '/database.php';

header('Content-Type: application/json');

$search = $_GET['search'] ?? '';
$category = $_GET['category'] ?? '';

try {
    // Create a default size if product has none
    $missingVarsQuery = $pdo->query("
        SELECT p.product_id FROM product p
        LEFT JOIN product_var pv ON pv.product_id = p.product_id
        WHERE p.prod_active = 1 AND pv.prodvar_id IS NULL
    ");
    $missingIds = $missingVarsQuery->fetchAll(PDO::FETCH_COLUMN);
    
    if (!empty($missingIds)) {
        $insertVar = $pdo->prepare("
            INSERT INTO product_var (product_id, var_size, var_markup, var_img)
            VALUES (?, 'Regular', 0.00, CONCAT('images/', ?, '.png'))
        ");
        foreach ($missingIds as $pid) {
            $insertVar->execute([$pid, $pid]);
        }
    }

    // Handle category filters
    if (is_numeric($category) && $category !== '') {
        $categoryIndex = (int)$category - 1;
        $catStmt = $pdo->query("SELECT DISTINCT prod_categ FROM product");
        $allCats = $catStmt->fetchAll(PDO::FETCH_COLUMN);
        if (isset($allCats[$categoryIndex])) {
            $category = $allCats[$categoryIndex];
        }
    }

    // Get products and merge duplicates
    $sql = "
        SELECT 
          p.*,
          MIN(pv.var_img) AS var_img
        FROM product p
        LEFT JOIN product_var pv 
          ON pv.product_id = p.product_id
        WHERE p.prod_active = 1
    ";

    $params = [];

    if ($category !== '' && $category !== null) {
        $sql .= " AND p.prod_categ = :category";
        $params[':category'] = $category;
    }

    if ($search !== '') {
        $sql .= " AND p.prod_name LIKE :search";
        $params[':search'] = "%$search%";
    }

    $sql .= " GROUP BY p.product_id";

    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    $products = $stmt->fetchAll(PDO::FETCH_ASSOC);

    $varStmt = $pdo->prepare("
        SELECT var_size, var_markup, var_img
        FROM product_var
        WHERE product_id = ?
        ORDER BY var_markup ASC
    ");

    foreach ($products as &$p) {
        $p['var_img'] = $p['var_img'] ?? 'images/placeholder.png';
        $basePrice = (float)$p['unit_price'];

        $varStmt->execute([$p['product_id']]);
        $variants = $varStmt->fetchAll(PDO::FETCH_ASSOC);

        $formattedVariants = [];
        foreach ($variants as $v) {
            $formattedVariants[] = [
                'size' => $v['var_size'],
                'markup' => (float)$v['var_markup'],
                'price' => $basePrice + (float)$v['var_markup'],
                'image_url' => $v['var_img'] ?: $p['var_img'],
            ];
        }

        if (empty($formattedVariants)) {
            $formattedVariants[] = [
                'size' => 'Regular',
                'markup' => 0,
                'price' => $basePrice,
                'image_url' => $p['var_img'],
            ];
        }

        $p['variants'] = $formattedVariants;
        $p['price_regular'] = $formattedVariants[0]['price'];
        $p['price_large'] = count($formattedVariants) > 1
            ? $formattedVariants[count($formattedVariants) - 1]['price']
            : $basePrice + 15;
    }
    unset($p);

    echo json_encode([
        'status' => 'success',
        'data' => $products
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'status' => 'error',
        'message' => $e->getMessage()
    ]);
}