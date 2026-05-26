<?php
require_once dirname(__DIR__) . '/database.php';
header('Content-Type: application/json');
$method = $_SERVER['REQUEST_METHOD'];

// Authentication check can be added here...
// Assuming Superadmin access is verified via frontend, but ideally we check token role here.

try {
    if ($method === 'GET') {
        $users = [];

        // 1. Get Employees
        $stmt = $pdo->query("SELECT emp_id, emp_role, email, givname, surname, emp_active FROM employee");
        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            $roleMap = [
                'Superadmin' => 'superadmin',
                'Manager' => 'manager',
                'Staff' => 'staff'
            ];
            $role = $roleMap[$row['emp_role']] ?? 'staff';
            
            $users[] = [
                'id' => 'emp_' . $row['emp_id'],
                'db_id' => $row['emp_id'],
                'type' => 'employee',
                'name' => trim($row['givname'] . ' ' . $row['surname']),
                'email' => $row['email'],
                'role' => $role,
                'status' => $row['emp_active'] ? 'active' : 'restricted',
                'last_login' => 'N/A' // Mocked for now
            ];
        }

        // 2. Get Customers
        $stmt2 = $pdo->query("SELECT cust_id, username, cust_email, cust_active FROM customers");
        while ($row = $stmt2->fetch(PDO::FETCH_ASSOC)) {
            $users[] = [
                'id' => 'cust_' . $row['cust_id'],
                'db_id' => $row['cust_id'],
                'type' => 'customer',
                'name' => $row['username'],
                'email' => $row['cust_email'],
                'role' => 'customer',
                'status' => $row['cust_active'] ? 'active' : 'banned',
                'last_login' => 'N/A'
            ];
        }

        echo json_encode(['status' => 'success', 'data' => $users]);
    }
    else if ($method === 'POST') {
        $data = json_decode(file_get_contents('php://input'), true);
        
        $roleMap = [
            'superadmin' => 'Superadmin',
            'manager' => 'Manager',
            'staff' => 'Staff'
        ];
        
        $nameParts = explode(' ', $data['name'] ?? '', 2);
        $givname = $nameParts[0] ?? '';
        $surname = $nameParts[1] ?? '';
        $email = $data['email'] ?? '';
        $role = $roleMap[$data['role']] ?? 'Staff';
        $password = substr(md5($data['password']), 0, 30); // Use the truncated md5 hash we fixed earlier
        
        $stmt = $pdo->prepare("INSERT INTO employee (emp_role, emp_phone, emp_password, surname, givname, address, email, emp_active) VALUES (?, '00000000000', ?, ?, ?, 'N/A', ?, 1)");
        $stmt->execute([$role, $password, $surname, $givname, $email]);
        
        echo json_encode(['status' => 'success', 'message' => 'Employee created']);
    }
    else if ($method === 'PUT') {
        $data = json_decode(file_get_contents('php://input'), true);
        $idParts = explode('_', $data['id']);
        $type = $idParts[0];
        $db_id = $idParts[1];
        
        if (isset($data['action']) && $data['action'] === 'toggle_status') {
            if ($type === 'emp') {
                $status = ($data['status'] === 'active') ? 1 : 0;
                $stmt = $pdo->prepare("UPDATE employee SET emp_active = ? WHERE emp_id = ?");
                $stmt->execute([$status, $db_id]);
            } else {
                $status = ($data['status'] === 'active') ? 1 : 0;
                $stmt = $pdo->prepare("UPDATE customers SET cust_active = ? WHERE cust_id = ?");
                $stmt->execute([$status, $db_id]);
            }
        } else {
            // Edit employee details
            if ($type === 'emp') {
                $nameParts = explode(' ', $data['name'] ?? '', 2);
                $givname = $nameParts[0] ?? '';
                $surname = $nameParts[1] ?? '';
                $email = $data['email'];
                $roleMap = ['superadmin' => 'Superadmin', 'manager' => 'Manager', 'staff' => 'Staff'];
                $role = $roleMap[$data['role']] ?? 'Staff';
                
                if (!empty($data['password'])) {
                    $password = substr(md5($data['password']), 0, 30);
                    $stmt = $pdo->prepare("UPDATE employee SET givname=?, surname=?, email=?, emp_role=?, emp_password=? WHERE emp_id=?");
                    $stmt->execute([$givname, $surname, $email, $role, $password, $db_id]);
                } else {
                    $stmt = $pdo->prepare("UPDATE employee SET givname=?, surname=?, email=?, emp_role=? WHERE emp_id=?");
                    $stmt->execute([$givname, $surname, $email, $role, $db_id]);
                }
            }
        }
        
        echo json_encode(['status' => 'success']);
    }
    else if ($method === 'DELETE') {
        $id = $_GET['id'] ?? '';
        $idParts = explode('_', $id);
        $type = $idParts[0];
        $db_id = $idParts[1];
        
        if ($type === 'emp') {
            $stmt = $pdo->prepare("DELETE FROM employee WHERE emp_id = ?");
            $stmt->execute([$db_id]);
        } else {
            $stmt = $pdo->prepare("DELETE FROM customers WHERE cust_id = ?");
            $stmt->execute([$db_id]);
        }
        
        echo json_encode(['status' => 'success']);
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
}
?>
