<?php
/*
BUCS IT3C A.Y. 2025-2026
Application Development and Emerging Technologies
XiemiBytes :: Backend Development

AUTHOR: John Marvin G. Marfil
EMAIL:  johnmarvinmarfil@outlook.com
-------------------------------------------------
-------------------------------------------------
This establishes a MySQL connection using PDO
by setting up necessary parameters, including the
server, database name, username, and password.

The connection throws exceptions on errors and
returns results as associative arrays. If it failed,
it returns a JSON response indicating the error.
*/



      $dbServer   = 'localhost';    // always localhost for XAMPP
      $dbName     = 'xiemibytes';   // your database name in phpMyAdmin
      $dbUsername = 'root';         // XAMPP default username
      $dbPassword = '';             // XAMPP default has no password

      $connStr = "mysql:host=$dbServer;dbname=$dbName;charset=utf8mb4";

      $connOptions = [
            PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,  // show errors
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,        // return data as array
            PDO::ATTR_EMULATE_PREPARES   => false,                   // more secure queries
      ];

      try {
            $pdo = new PDO($connStr, $dbUsername, $dbPassword, $connOptions);
      } catch (PDOException $e) {
            http_response_code(500);   // tell frontend something went wrong
            echo json_encode([
                  'status'  => 'error',
                  'message' => 'Database connection failed.'
            ]);
            exit;
      }
?>