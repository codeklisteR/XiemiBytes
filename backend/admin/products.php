<?php
require_once dirname(__DIR__) . '/database.php';

header('Content-Type: application/json');

$method = $_SERVER['REQUEST_METHOD'];

try {
    if ($method === 'GET') {
        $stmt = $pdo->query("
            SELECT 
              p.product_id as id,
              p.prod_name as name,
              p.prod_categ as category,
              p.prod_qty as stock,
              p.unit_price as price,
              p.prod_active as active,
              MIN(pv.var_img) as image_url,
              MAX(pv.var_markup) as markup
            FROM product p
            LEFT JOIN product_var pv ON p.product_id = pv.product_id
            GROUP BY p.product_id
        ");
        $products = $stmt->fetchAll();
        
        $result = array_map(function($p) {
            return [
                'id' => $p['id'],
                'name' => $p['name'],
                'category_id' => $p['category'], // We just use string as category id for simplicity or map it
                'price_regular' => (float)$p['price'],
                'price_large' => (float)$p['price'] + (float)$p['markup'],
                'stock' => (int)$p['stock'],
                'status' => $p['active'] ? 'active' : 'inactive',
                'image_url' => $p['image_url'] ?: 'images/placeholder.png',
                'description' => '' // Add desc if needed
            ];
        }, $products);
        
        echo json_encode(['status' => 'success', 'data' => $result]);
    }
    
    else if ($method === 'POST') {
        $data = json_decode(file_get_contents('php://input'), true);
        
        $pdo->beginTransaction();
        
        $stmt = $pdo->prepare("INSERT INTO product (prod_name, prod_categ, prod_qty, unit_price, prod_active) VALUES (?, ?, ?, ?, ?)");
        $stmt->execute([
            $data['name'],
            $data['category_id'],
            $data['stock'] ?? 0,
            $data['price_regular'],
            $data['status'] === 'active' ? 1 : 0
        ]);
        $id = $pdo->lastInsertId();
        
        $stmtVar = $pdo->prepare("INSERT INTO product_var (product_id, var_size, var_markup, var_img) VALUES (?, 'Regular', 0, ?)");
        $stmtVar->execute([$id, $data['image_url'] ?? '']);
        
        $markup = $data['price_large'] - $data['price_regular'];
        if ($markup > 0) {
            $stmtVar2 = $pdo->prepare("INSERT INTO product_var (product_id, var_size, var_markup, var_img) VALUES (?, 'Large', ?, ?)");
            $stmtVar2->execute([$id, $markup, $data['image_url'] ?? '']);
        }
        
        $pdo->commit();
        echo json_encode(['status' => 'success', 'id' => $id]);
    }
    
    else if ($method === 'PUT') {
        $data = json_decode(file_get_contents('php://input'), true);
        $id = $data['id'];
        
        $pdo->beginTransaction();
        
        $stmt = $pdo->prepare("UPDATE product SET prod_name=?, prod_categ=?, prod_qty=?, unit_price=?, prod_active=? WHERE product_id=?");
        $stmt->execute([
            $data['name'],
            $data['category_id'],
            $data['stock'],
            $data['price_regular'],
            $data['status'] === 'active' ? 1 : 0,
            $id
        ]);
        
        // Update image for all variations
        $stmtVar = $pdo->prepare("UPDATE product_var SET var_img=? WHERE product_id=?");
        $stmtVar->execute([$data['image_url'], $id]);
        
        $pdo->commit();
        echo json_encode(['status' => 'success']);
    }
    
    else if ($method === 'DELETE') {
        $data = json_decode(file_get_contents('php://input'), true);
        $id = $data['id'] ?? $_GET['id'] ?? null;
        if (!$id) {
            http_response_code(400);
            echo json_encode(['status' => 'error', 'message' => 'Product id required']);
            exit;
        }
        
        // Soft delete
        $stmt = $pdo->prepare("UPDATE product SET prod_active=0 WHERE product_id=?");
        $stmt->execute([$id]);
        
        echo json_encode(['status' => 'success']);
    }
} catch (Exception $e) {
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
}
?>
