<?php
/*
BUCS IT3C A.Y. 2025-2026
Application Development and Emerging Technologies
XiemiBytes :: Backend Development

AUTHOR: John Marvin G. Marfil
EMAIL:  johnmarvinmarfil@outlook.com
*/

require_once dirname(__DIR__) . '/frontend.php';
require_once dirname(__DIR__) . '/database.php';

header('Content-Type: application/json');


      // Only allow POST requests
      if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            http_response_code(405);
            echo json_encode(['status' => 'error', 'message' => 'Method not allowed']);
            exit;
      }

      // Read JSON data sent by the frontend
      $requestData = json_decode(file_get_contents('php://input'), true);
      $email    = trim($requestData['email']    ?? '');
      $password = trim($requestData['password'] ?? '');


      // Make sure fields are not empty
      if (empty($email) || empty($password)) {
            http_response_code(422);
            echo json_encode(['status' => 'error', 'message' => 'Email and password are required']);
            exit;
      }


      // Check employee table first
      $employeeQuery = $pdo->prepare('SELECT * FROM employee WHERE email = ? AND emp_active = 1');
      $employeeQuery->execute([$email]);
      $employee = $employeeQuery->fetch();

      if ($employee) {

            // Wrong password (supports secure password_verify, md5, truncated md5, and legacy plaintext)
            $isMatch = password_verify($password, $employee['emp_password']) || ($password === $employee['emp_password']) || (md5($password) === $employee['emp_password']) || (substr(md5($password), 0, 30) === $employee['emp_password']);
            if (!$isMatch) {
                  http_response_code(401);
                  echo json_encode(['status' => 'error', 'message' => 'Incorrect password']);
                  exit;
            }

            // Employee found - build user data
            $userData = [
                  'id'         => $employee['emp_id'],
                  'first_name' => $employee['givname'],
                  'last_name'  => $employee['surname'],
                  'email'      => $employee['email'],
                  'role'       => strtolower($employee['emp_role']),
            ];

      } else {

            // Check customer table
            $customerQuery = $pdo->prepare('SELECT * FROM customers WHERE cust_email = ? AND cust_active = 1');
            $customerQuery->execute([$email]);
            $customer = $customerQuery->fetch();

            // No account found
            if (!$customer) {
                  http_response_code(401);
                  echo json_encode(['status' => 'error', 'message' => 'Account not found']);
                  exit;
            }

            // Wrong password (supports secure password_verify, md5, truncated md5, and legacy plaintext)
            $isMatch = password_verify($password, $customer['cust_password']) || ($password === $customer['cust_password']) || (md5($password) === $customer['cust_password']) || (substr(md5($password), 0, 30) === $customer['cust_password']);
            if (!$isMatch) {
                  http_response_code(401);
                  echo json_encode(['status' => 'error', 'message' => 'Incorrect password']);
                  exit;
            }

            // Customer found - build user data
            $userData = [
                  'id'         => $customer['cust_id'],
                  'first_name' => $customer['username'],
                  'email'      => $customer['cust_email'],
                  'phone'      => $customer['cust_phone'] ?? '',
                  'role'       => 'customer',
                  'pts'        => (int)$customer['pts'],
            ];

      }


      // Build JWT token - expires in 24 hours
      $secretKey = 'xiemibytes_secret_key_2025';
      $issuedAt  = time();
      $expireAt  = $issuedAt + (60 * 60 * 24);

      $tokenPayload = [
            'id'   => $userData['id'],
            'role' => $userData['role'],
            'iat'  => $issuedAt,
            'exp'  => $expireAt,
      ];

      $tokenHeader    = base64_encode(json_encode(['alg' => 'HS256', 'typ' => 'JWT']));
      $tokenBody      = base64_encode(json_encode($tokenPayload));
      $tokenSignature = base64_encode(hash_hmac('sha256', "$tokenHeader.$tokenBody", $secretKey, true));
      $jwtToken       = "$tokenHeader.$tokenBody.$tokenSignature";


      // Return success response
      http_response_code(200);
      echo json_encode([
            'status'  => 'success',
            'message' => 'Login successful',
            'user'    => $userData,
            'token'   => $jwtToken
      ]);