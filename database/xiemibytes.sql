-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: May 23, 2026 at 07:18 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.0.30

SET FOREIGN_KEY_CHECKS = 0;

CREATE DATABASE IF NOT EXISTS xiemibytes
CHARACTER SET utf8mb4
COLLATE utf8mb4_general_ci;
USE xiemibytes;

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `xiemibytes`
--

-- --------------------------------------------------------

--
-- Table structure for table `addon`
--

CREATE TABLE `addon` (
  `addon_id` bigint(20) NOT NULL,
  `addon_name` varchar(60) NOT NULL,
  `addon_markup` decimal(10,2) NOT NULL DEFAULT 0.00,
  `addon_active` tinyint(1) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `addon`
--

INSERT INTO `addon` (`addon_id`, `addon_name`, `addon_markup`, `addon_active`) VALUES
(1, 'None', 0.00, 1),
(2, 'Pearls', 10.00, 1),
(3, 'Nata', 10.00, 1),
(4, 'Jelly', 10.00, 1),
(5, 'Cheese Foam', 20.00, 1),
(6, 'Extra Shot', 20.00, 1),
(7, 'Soy Milk', 15.00, 1),
(8, 'Almond Milk', 25.00, 1),
(9, 'Oat Milk', 25.00, 1),
(10, 'Whipped Cream', 15.00, 1),
(11, 'Less Ice', 0.00, 1),
(12, 'No Ice', 0.00, 1),
(13, 'Extra Ice', 0.00, 1),
(14, 'Less Sugar', 0.00, 1),
(15, 'No Sugar', 0.00, 1),
(16, 'Extra Sugar', 0.00, 1),
(17, 'Caramel Syrup', 10.00, 1),
(18, 'Chocolate Syrup', 10.00, 1),
(19, 'Vanilla Syrup', 10.00, 1),
(20, 'Double Shot', 30.00, 1);

-- --------------------------------------------------------

--
-- Table structure for table `category`
--

CREATE TABLE `category` (
  `categ_id` bigint(20) NOT NULL,
  `categ_name` varchar(30) NOT NULL,
  `categ_active` tinyint(1) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `category`
--

INSERT INTO `category` (`categ_id`, `categ_name`, `categ_active`) VALUES
(1, 'Regular', 1),
(2, 'Premium', 1),
(3, 'Salty Cheese', 1),
(4, 'Fruit Series', 1),
(5, 'Milk Tea', 1),
(6, 'Fruit Tea', 1),
(15, 'Pearl Shake', 1);

-- --------------------------------------------------------

--
-- Table structure for table `customers`
--

CREATE TABLE `customers` (
  `cust_id` bigint(20) NOT NULL,
  `username` varchar(20) NOT NULL,
  `cust_phone` char(11) NOT NULL,
  `cust_email` varchar(60) NOT NULL,
  `cust_password` varchar(30) NOT NULL,
  `pts` int(11) NOT NULL DEFAULT 0,
  `cust_active` tinyint(1) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `customers`
--

INSERT INTO `customers` (`cust_id`, `username`, `cust_phone`, `cust_email`, `cust_password`, `pts`, `cust_active`) VALUES
(1, 'Alice Smith', '09171032193', 'alice.smith@mail.com', 'password123', 90, 1),
(2, 'Bob Johnson', '09175677304', 'bob.johnson@mail.com', 'password123', 20, 1),
(3, 'Charlie Brown', '09177260780', 'charlie.brown@mail.com', 'password123', 90, 1),
(4, 'Diana Prince', '09171514187', 'diana.prince@mail.com', 'password123', 110, 1),
(5, 'Ethan Hunt', '09174953977', 'ethan.hunt@mail.com', 'password123', 100, 1),
(6, 'Fiona Gallagher', '09178431275', 'fiona.gallagher@mail.com', 'password123', 40, 1),
(7, 'George Miller', '09172434663', 'george.miller@mail.com', 'password123', 70, 1),
(8, 'Hannah Abbott', '09174595008', 'hannah.abbott@mail.com', 'password123', 140, 1),
(9, 'Ian Malcolm', '09179967864', 'ian.malcolm@mail.com', 'password123', 120, 1),
(10, 'Julia Roberts', '09178663049', 'julia.roberts@mail.com', 'password123', 170, 1),
(11, 'Kevin Hart', '09174252643', 'kevin.hart@mail.com', 'password123', 130, 1),
(12, 'Laura Dern', '09179814377', 'laura.dern@mail.com', 'password123', 130, 1),
(13, 'Michael Scott', '09176078008', 'michael.scott@mail.com', 'password123', 70, 1),
(14, 'Nina Simone', '09179691422', 'nina.simone@mail.com', 'password123', 120, 1),
(15, 'Oscar Isaac', '09177529458', 'oscar.isaac@mail.com', 'password123', 120, 1),
(16, 'Penny Lane', '09171516776', 'penny.lane@mail.com', 'password123', 160, 1),
(17, 'Quinn Fabray', '09175241728', 'quinn.fabray@mail.com', 'password123', 80, 1),
(18, 'Rachel Green', '09177316143', 'rachel.green@mail.com', 'password123', 180, 1),
(19, 'Steve Rogers', '09175121263', 'steve.rogers@mail.com', 'password123', 170, 1),
(20, 'Tony Stark', '09179510946', 'tony.stark@mail.com', 'password123', 30, 1),
(21, 'Uma Thurman', '09173817282', 'uma.thurman@mail.com', 'password123', 80, 1),
(22, 'Victor Stone', '09173962910', 'victor.stone@mail.com', 'password123', 10, 1),
(23, 'Wanda Maximoff', '09174456554', 'wanda.maximoff@mail.com', 'password123', 30, 1),
(24, 'Xander Harris', '09178188245', 'xander.harris@mail.com', 'password123', 70, 1),
(25, 'Yelena Belova', '09177667393', 'yelena.belova@mail.com', 'password123', 120, 1),
(26, 'Zack Taylor', '09172636234', 'zack.taylor@mail.com', 'password123', 70, 1),
(27, 'Amelia Pond', '09171360943', 'amelia.pond@mail.com', 'password123', 30, 1),
(28, 'Bruce Wayne', '09177444582', 'bruce.wayne@mail.com', 'password123', 10, 1),
(29, 'Clark Kent', '09171899783', 'clark.kent@mail.com', 'password123', 40, 1),
(30, 'Daisy Johnson', '09173117211', 'daisy.johnson@mail.com', 'password123', 150, 1),
(31, 'Elena Gilbert', '09171489366', 'elena.gilbert@mail.com', 'password123', 70, 1),
(32, 'Frank Castle', '09173911786', 'frank.castle@mail.com', 'password123', 30, 1),
(33, 'Gwen Stacy', '09177006127', 'gwen.stacy@mail.com', 'password123', 50, 1),
(34, 'Harry Potter', '09176447812', 'harry.potter@mail.com', 'password123', 150, 1),
(35, 'Iris West', '09177795708', 'iris.west@mail.com', 'password123', 50, 1),
(36, 'Jack Sparrow', '09171401629', 'jack.sparrow@mail.com', 'password123', 40, 1),
(37, 'Kara Danvers', '09177373610', 'kara.danvers@mail.com', 'password123', 20, 1),
(38, 'Luke Skywalker', '09171978375', 'luke.skywalker@mail.com', 'password123', 110, 1),
(39, 'Matt Murdock', '09171739852', 'matt.murdock@mail.com', 'password123', 30, 1),
(40, 'Natasha Romanoff', '09177840994', 'natasha.romanoff@mail.com', 'password123', 160, 1),
(41, 'Oliver Queen', '09177817723', 'oliver.queen@mail.com', 'password123', 90, 1),
(42, 'Peter Parker', '09179739738', 'peter.parker@mail.com', 'password123', 80, 1),
(43, 'Quentin Quentin', '09176438666', 'quentin.quentin@mail.com', 'password123', 150, 1),
(44, 'Reed Richards', '09177374684', 'reed.richards@mail.com', 'password123', 110, 1),
(45, 'Sarah Connor', '09175017483', 'sarah.connor@mail.com', 'password123', 180, 1),
(46, 'Challa', '09178248766', 'challa@mail.com', 'password123', 20, 1),
(47, 'Ursula', '09178085920', 'ursula@mail.com', 'password123', 120, 1),
(48, 'Voldemort', '09173189220', 'voldemort@mail.com', 'password123', 180, 1),
(49, 'Wade Wilson', '09176456465', 'wade.wilson@mail.com', 'password123', 70, 1),
(50, 'Xena', '09171724029', 'xena@mail.com', 'password123', 180, 1);

-- --------------------------------------------------------

--
-- Table structure for table `employee`
--

CREATE TABLE `employee` (
  `emp_id` bigint(20) NOT NULL,
  `emp_role` enum('Staff','Manager','Superadmin') NOT NULL DEFAULT 'Superadmin',
  `emp_phone` char(11) NOT NULL,
  `emp_password` varchar(30) NOT NULL,
  `surname` varchar(30) NOT NULL,
  `givname` varchar(30) NOT NULL,
  `address` varchar(100) NOT NULL,
  `email` varchar(60) NOT NULL,
  `emp_active` tinyint(1) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `employee`
--

INSERT INTO `employee` (`emp_id`, `emp_role`, `emp_phone`, `emp_password`, `surname`, `givname`, `address`, `email`, `emp_active`) VALUES
(1, 'Superadmin', '09187273525', 'password123', 'Doe', 'John', 'Manila', 'john1@mail.com', 1),
(2, 'Manager', '09182449709', 'password123', 'Smith', 'Anna', 'Quezon City', 'anna2@mail.com', 1),
(3, 'Staff', '09188945017', 'password123', 'Lee', 'Mark', 'Caloocan', 'mark3@mail.com', 1),
(4, 'Staff', '09188454196', 'password123', 'Garcia', 'Luis', 'Pasig', 'luis4@mail.com', 1),
(5, 'Manager', '09188708991', 'password123', 'Reyes', 'Mia', 'Makati', 'mia5@mail.com', 1),
(6, 'Staff', '09186032538', 'password123', 'Evans', 'Chris', 'Taguig', 'chris6@mail.com', 1),
(7, 'Staff', '09187410261', 'password123', 'Hiddleston', 'Tom', 'Mandaluyong', 'tom7@mail.com', 1),
(8, 'Staff', '09189024776', 'password123', 'Ruffalo', 'Mark', 'Marikina', 'mark8@mail.com', 1),
(9, 'Staff', '09189683478', 'password123', 'Hemsworth', 'Chris', 'San Juan', 'chris9@mail.com', 1),
(10, 'Manager', '09188262527', 'password123', 'Johansson', 'Scarlett', 'Pasay', 'scarlett10@mail.com', 1),
(11, 'Staff', '09187205544', 'password123', 'Renner', 'Jeremy', 'Las Pinas', 'jeremy11@mail.com', 1),
(12, 'Staff', '09187135529', 'password123', 'Rudd', 'Paul', 'Muntinlupa', 'paul12@mail.com', 1),
(13, 'Staff', '09186467936', 'password123', 'Larson', 'Brie', 'Paranaque', 'brie13@mail.com', 1),
(14, 'Staff', '09189347963', 'password123', 'Cheadle', 'Don', 'Valenzuela', 'don14@mail.com', 1),
(15, 'Staff', '09187190810', 'password123', 'Boseman', 'Chadwick', 'Malabon', 'chadwick15@mail.com', 1),
(16, 'Staff', '09188008489', 'password123', 'Holland', 'Tom', 'Navotas', 'tom16@mail.com', 1),
(17, 'Staff', '09182263147', 'password123', 'Bettany', 'Paul', 'Pateros', 'paul17@mail.com', 1),
(18, 'Staff', '09189739205', 'password123', 'Olsen', 'Elizabeth', 'Antipolo', 'elizabeth18@mail.com', 1),
(19, 'Manager', '09181592934', 'password123', 'Mackie', 'Anthony', 'Rizal', 'anthony19@mail.com', 1),
(20, 'Staff', '09188866568', 'password123', 'Stan', 'Sebastian', 'Cavite', 'sebastian20@mail.com', 1);

-- --------------------------------------------------------

--
-- Table structure for table `orders`
--

CREATE TABLE `orders` (
  `order_id` bigint(20) NOT NULL,
  `cust_id` bigint(20) NOT NULL,
  `walkin_name` varchar(100) DEFAULT NULL,
  `voucher_id` bigint(20) DEFAULT NULL,
  `order_mode` varchar(30) NOT NULL,
  `order_status` varchar(30) NOT NULL,
  `order_price` decimal(10,2) NOT NULL DEFAULT 0.00,
  `order_discount` decimal(10,2) NOT NULL DEFAULT 0.00,
  `pts_used` int(11) NOT NULL DEFAULT 0,
  `order_qr` varchar(255) DEFAULT NULL,
  `order_date` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `orders`
--

INSERT INTO `orders` (`order_id`, `cust_id`, `voucher_id`, `order_mode`, `order_status`, `order_price`, `order_discount`, `pts_used`, `order_qr`, `order_date`) VALUES
(1, 1, 1, 'ol', 'pay', 90.00, 0.00, 0, NULL, '2026-05-01 09:14:22'),
(2, 2, 2, 'ol', 'done', 100.00, 0.00, 0, NULL, '2026-05-02 14:35:10'),
(3, 3, 3, 'ol', 'claim', 95.00, 0.00, 0, NULL, '2026-05-03 11:02:55'),
(4, 4, 4, 'ol', 'done', 120.00, 0.00, 0, NULL, '2026-05-04 18:22:41'),
(5, 5, 5, 'ol', 'pay', 110.00, 0.00, 0, NULL, '2026-05-05 10:45:19'),
(6, 6, 1, 'ol', 'done', 130.00, 0.00, 0, NULL, '2026-05-06 15:09:33'),
(7, 7, 2, 'ol', 'pay', 140.00, 0.00, 0, NULL, '2026-05-08 12:30:02'),
(8, 8, 3, 'ol', 'done', 150.00, 0.00, 0, NULL, '2026-05-09 16:55:48'),
(9, 9, 4, 'ol', 'claim', 160.00, 0.00, 0, NULL, '2026-05-10 08:19:12'),
(10, 10, 5, 'ol', 'done', 170.00, 0.00, 0, NULL, '2026-05-11 20:11:37'),
(11, 11, 1, 'ol', 'pay', 180.00, 0.00, 0, NULL, '2026-05-12 11:40:26'),
(12, 12, 2, 'ol', 'done', 190.00, 0.00, 0, NULL, '2026-05-13 14:04:15'),
(13, 13, 3, 'ol', 'claim', 200.00, 0.00, 0, NULL, '2026-05-13 19:28:50'),
(14, 14, 4, 'ol', 'done', 210.00, 0.00, 0, NULL, '2026-05-14 10:51:03'),
(15, 15, 5, 'ol', 'claim', 220.00, 0.00, 0, NULL, '2026-05-15 13:14:59'),
(16, 16, 1, 'ol', 'done', 230.00, 0.00, 0, NULL, '2026-05-15 17:42:11'),
(17, 17, 2, 'ol', 'done', 240.00, 0.00, 0, NULL, '2026-05-16 09:05:24'),
(18, 18, 3, 'ol', 'done', 250.00, 0.00, 0, NULL, '2026-05-16 15:23:08'),
(19, 19, 4, 'ol', 'done', 260.00, 0.00, 0, NULL, '2026-05-17 11:58:44'),
(20, 20, 5, 'ol', 'done', 270.00, 0.00, 0, NULL, '2026-05-17 21:02:19'),
(22, 23, NULL, 'ol', 'done', 90.00, 0.00, 0, 'ORD-22', '2026-05-18 00:48:38'),
(23, 23, NULL, 'ol', 'done', 90.00, 0.00, 0, 'ORD-23', '2026-05-18 01:32:58'),
(24, 23, NULL, 'ol', 'void', 0.00, 0.00, 100, 'ORD-24', '2026-05-18 01:34:11'),
(25, 99, NULL, 'pos', 'done', 85.50, 9.50, 0, 'ORD-00025', '2026-05-23 09:32:55'),
(26, 1, NULL, 'ol', 'void', 100.00, 0.00, 0, 'ORD-26', '2026-05-23 09:35:32'),
(27, 1, NULL, 'ol', 'done', 100.00, 0.00, 0, 'ORD-27', '2026-05-23 10:30:40'),
(28, 100, 1, 'ol', 'done', 92.00, 0.00, 0, 'ORD-28', '2026-05-23 18:34:23'),
(29, 100, NULL, 'ol', 'done', 100.00, 0.00, 0, 'ORD-29', '2026-05-23 18:45:13');

-- --------------------------------------------------------

--
-- Table structure for table `order_items`
--

CREATE TABLE `order_items` (
  `order_id` bigint(20) NOT NULL,
  `prodvar_id` bigint(20) NOT NULL,
  `addon_id` bigint(20) DEFAULT NULL,
  `item_price` decimal(10,2) NOT NULL DEFAULT 0.00,
  `item_qty` int(11) NOT NULL DEFAULT 0,
  `ice_lvl` varchar(30) NOT NULL,
  `sugar_lvl` varchar(30) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `order_items`
--

INSERT INTO `order_items` (`order_id`, `prodvar_id`, `addon_id`, `item_price`, `item_qty`, `ice_lvl`, `sugar_lvl`) VALUES
(1, 1, 1, 90.00, 1, 'normal', 'normal'),
(2, 2, 2, 100.00, 1, 'less', 'normal'),
(3, 3, 3, 95.00, 1, 'normal', 'less'),
(4, 4, 4, 95.00, 1, 'no', 'normal'),
(5, 5, 5, 110.00, 1, 'normal', 'normal'),
(6, 6, 6, 120.00, 2, 'less', 'less'),
(7, 7, 7, 120.00, 1, 'normal', 'normal'),
(8, 1, 8, 90.00, 2, 'no', 'no'),
(9, 2, 9, 100.00, 2, 'normal', 'normal'),
(10, 3, 10, 95.00, 1, 'less', 'normal'),
(11, 4, 11, 95.00, 2, 'normal', 'less'),
(12, 5, 12, 110.00, 1, 'no', 'normal'),
(13, 6, 13, 120.00, 1, 'normal', 'normal'),
(14, 7, 14, 120.00, 2, 'less', 'less'),
(15, 1, 15, 90.00, 2, 'normal', 'normal'),
(16, 2, 16, 100.00, 1, 'no', 'normal'),
(17, 3, 17, 95.00, 2, 'normal', 'less'),
(18, 4, 18, 95.00, 1, 'less', 'normal'),
(19, 5, 19, 110.00, 2, 'normal', 'normal'),
(20, 6, 20, 120.00, 1, 'no', 'no'),
(22, 1, NULL, 90.00, 1, 'Normal', '100%'),
(23, 1, NULL, 90.00, 1, 'Normal', '100%'),
(24, 1, NULL, 90.00, 1, 'Normal', '100%'),
(25, 4, NULL, 95.00, 1, 'Normal', '100%'),
(26, 2, NULL, 100.00, 1, 'Normal', '100%'),
(27, 3, NULL, 100.00, 1, 'Normal', '100%'),
(28, 13, NULL, 115.00, 1, 'Normal', '75%'),
(29, 3, NULL, 100.00, 1, 'Normal', '100%');

-- --------------------------------------------------------

--
-- Table structure for table `payment`
--

CREATE TABLE `payment` (
  `payment_ref` bigint(20) NOT NULL,
  `order_id` bigint(20) NOT NULL,
  `emp_id` bigint(20) NOT NULL,
  `amt_due` decimal(10,2) NOT NULL DEFAULT 0.00,
  `amt_paid` decimal(10,2) NOT NULL DEFAULT 0.00,
  `amt_change` decimal(10,2) NOT NULL DEFAULT 0.00,
  `payment_date` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `payment`
--

INSERT INTO `payment` (`payment_ref`, `order_id`, `emp_id`, `amt_due`, `amt_paid`, `amt_change`, `payment_date`) VALUES
(1, 1, 1, 90.00, 100.00, 10.00, '2026-05-23 01:23:46'),
(2, 2, 2, 100.00, 100.00, 0.00, '2026-05-23 01:23:46'),
(3, 3, 3, 95.00, 100.00, 5.00, '2026-05-23 01:23:46'),
(4, 4, 4, 120.00, 150.00, 30.00, '2026-05-23 01:23:46'),
(5, 5, 5, 110.00, 110.00, 0.00, '2026-05-23 01:23:46'),
(6, 6, 1, 130.00, 150.00, 20.00, '2026-05-23 01:23:46'),
(7, 7, 2, 140.00, 200.00, 60.00, '2026-05-23 01:23:46'),
(8, 8, 3, 150.00, 150.00, 0.00, '2026-05-23 01:23:46'),
(9, 9, 4, 160.00, 200.00, 40.00, '2026-05-23 01:23:46'),
(10, 10, 5, 170.00, 200.00, 30.00, '2026-05-23 01:23:46'),
(11, 11, 1, 180.00, 200.00, 20.00, '2026-05-23 01:23:46'),
(12, 12, 2, 190.00, 200.00, 10.00, '2026-05-23 01:23:46'),
(13, 13, 3, 200.00, 200.00, 0.00, '2026-05-23 01:23:46'),
(14, 14, 4, 210.00, 250.00, 40.00, '2026-05-23 01:23:46'),
(15, 15, 5, 220.00, 300.00, 80.00, '2026-05-23 01:23:46'),
(16, 16, 1, 230.00, 250.00, 20.00, '2026-05-23 01:23:46'),
(17, 17, 2, 240.00, 300.00, 60.00, '2026-05-23 01:23:46'),
(18, 18, 3, 250.00, 250.00, 0.00, '2026-05-23 01:23:46'),
(19, 19, 4, 260.00, 300.00, 40.00, '2026-05-23 01:23:46'),
(20, 20, 5, 270.00, 300.00, 30.00, '2026-05-23 01:23:46'),
(22, 22, 1, 90.00, 90.00, 0.00, '2026-05-23 01:23:46'),
(23, 23, 1, 90.00, 90.00, 0.00, '2026-05-23 01:23:46'),
(24, 25, 1, 85.50, 90.00, 4.50, '2026-05-23 09:32:55'),
(25, 26, 1, 100.00, 100.00, 0.00, '2026-05-23 09:36:48'),
(26, 24, 1, 0.00, 0.00, 0.00, '2026-05-23 09:39:43'),
(27, 27, 1, 100.00, 100.00, 0.00, '2026-05-23 16:22:53'),
(28, 28, 1, 92.00, 92.00, 0.00, '2026-05-23 18:36:30'),
(29, 29, 1, 100.00, 100.00, 0.00, '2026-05-23 18:48:51');

-- --------------------------------------------------------

--
-- Table structure for table `product`
--

CREATE TABLE `product` (
  `product_id` bigint(20) NOT NULL,
  `prod_name` varchar(60) NOT NULL,
  `prod_categ` varchar(30) NOT NULL,
  `prod_qty` int(11) NOT NULL DEFAULT 0,
  `unit_price` decimal(10,2) DEFAULT 0.00,
  `prod_active` tinyint(1) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `product`
--

INSERT INTO `product` (`product_id`, `prod_name`, `prod_categ`, `prod_qty`, `unit_price`, `prod_active`) VALUES
(1, 'Classic Milk Tea', 'Regular', 50, 90.00, 1),
(2, 'Okinawa Milk Tea', 'Regular', 50, 100.00, 1),
(3, 'Taro Milk Tea', 'Regular', 50, 95.00, 1),
(4, 'Wintermelon Milk Tea', 'Salty Cheese', 49, 95.00, 1),
(5, 'Matcha Milk Tea', 'Premium', 50, 110.00, 1),
(6, 'Strawberry Fruit Tea', 'Fruit Series', 50, 120.00, 1),
(7, 'Mango Fruit Tea', 'Fruit Series', 50, 120.00, 1),
(8, 'Red Velvet Fruit Tea', 'Fruit Series', 50, 110.00, 1),
(9, 'Green Apple Fruit Tea', 'Fruit Series', 50, 95.00, 1),
(10, 'Wintermelon Fruit Tea', 'Fruit Series', 50, 100.00, 1),
(11, 'Black Forest Pearl Shake', 'Pearl Shake', 50, 80.00, 1);

-- --------------------------------------------------------

--
-- Table structure for table `product_var`
--

CREATE TABLE `product_var` (
  `prodvar_id` bigint(20) NOT NULL,
  `product_id` bigint(20) NOT NULL,
  `var_size` varchar(30) NOT NULL,
  `var_markup` decimal(10,2) NOT NULL DEFAULT 0.00,
  `var_img` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `product_var`
--

INSERT INTO `product_var` (`prodvar_id`, `product_id`, `var_size`, `var_markup`, `var_img`) VALUES
(1, 1, 'Regular', 0.00, 'images/1.png'),
(2, 2, 'Regular', 5.00, 'images/2.png'),
(3, 3, 'Regular', 5.00, 'images/3.png'),
(4, 4, 'Regular', 5.00, 'images/4.png'),
(5, 5, 'Regular', 10.00, 'images/5.png'),
(6, 6, 'Regular', 10.00, 'images/6.png'),
(7, 7, 'Regular', 10.00, 'images/7.png'),
(8, 8, 'Regular', 0.00, 'images/8.png'),
(9, 9, 'Regular', 0.00, 'images/9.png'),
(10, 10, 'Regular', 0.00, 'images/10.png'),
(11, 1, 'Large', 15.00, 'images/1.png'),
(12, 2, 'Large', 15.00, 'images/2.png'),
(13, 3, 'Large', 15.00, 'images/3.png'),
(14, 4, 'Large', 15.00, 'images/4.png'),
(15, 5, 'Large', 15.00, 'images/5.png'),
(16, 6, 'Large', 15.00, 'images/6.png'),
(17, 7, 'Large', 15.00, 'images/7.png'),
(18, 8, 'Large', 15.00, 'images/8.png'),
(19, 9, 'Large', 15.00, 'images/9.png'),
(20, 10, 'Large', 15.00, 'images/10.png'),
(36, 11, 'Regular', 0.00, 'images/products/prod_1779523747_90a48f17.png');

-- --------------------------------------------------------

--
-- Table structure for table `voucher`
--

CREATE TABLE `voucher` (
  `voucher_id` bigint(20) NOT NULL,
  `voucher_code` varchar(30) DEFAULT NULL,
  `discount` decimal(3,2) NOT NULL DEFAULT 0.10,
  `min_order` decimal(10,2) NOT NULL DEFAULT 0.00,
  `voucher_qty` int(11) NOT NULL DEFAULT 0,
  `voucher_expiry` date NOT NULL,
  `voucher_active` tinyint(1) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `voucher`
--

INSERT INTO `voucher` (`voucher_id`, `voucher_code`, `discount`, `min_order`, `voucher_qty`, `voucher_expiry`, `voucher_active`) VALUES
(1, 'WELCOME20', 0.20, 100.00, 10, '2026-12-31', 1),
(2, 'MILKTEALOVE', 0.50, 0.00, 10, '2026-12-31', 0),
(3, 'SUMMER2024', 0.15, 0.00, 10, '2024-08-31', 0),
(4, 'VOUCHER4', 0.10, 0.00, 10, '2026-12-31', 0),
(5, 'VOUCHER5', 0.10, 0.00, 10, '2026-12-31', 0),
(6, 'VOUCHER6', 0.10, 0.00, 10, '2026-12-31', 0),
(7, 'VOUCHER7', 0.10, 0.00, 10, '2026-12-31', 0),
(8, 'VOUCHER8', 0.10, 0.00, 10, '2026-12-31', 0),
(9, 'VOUCHER9', 0.10, 0.00, 10, '2026-12-31', 0),
(10, 'VOUCHER10', 0.10, 0.00, 10, '2026-12-31', 0),
(11, 'VOUCHER11', 0.10, 0.00, 10, '2026-12-31', 0),
(12, 'VOUCHER12', 0.10, 0.00, 10, '2026-12-31', 0),
(13, 'VOUCHER13', 0.10, 0.00, 10, '2026-12-31', 0),
(14, 'VOUCHER14', 0.10, 0.00, 10, '2026-12-31', 0),
(15, 'VOUCHER15', 0.10, 0.00, 10, '2026-12-31', 0),
(16, 'VOUCHER16', 0.10, 0.00, 10, '2026-12-31', 0),
(17, 'VOUCHER17', 0.10, 0.00, 10, '2026-12-31', 0),
(18, 'VOUCHER18', 0.10, 0.00, 10, '2026-12-31', 0),
(19, 'VOUCHER19', 0.10, 0.00, 10, '2026-12-31', 0),
(20, 'VOUCHER20', 0.10, 0.00, 10, '2026-12-31', 0);

-- --------------------------------------------------------

--
-- Table structure for table `voucher_claim`
--

CREATE TABLE `voucher_claim` (
  `cust_id` bigint(20) NOT NULL,
  `voucher_id` bigint(20) NOT NULL,
  `claim_date` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `voucher_claim`
--

INSERT INTO `voucher_claim` (`cust_id`, `voucher_id`, `claim_date`) VALUES
(1, 1, '2026-05-17 19:42:52'),
(2, 2, '2026-05-17 19:42:52'),
(3, 3, '2026-05-17 19:42:52'),
(4, 4, '2026-05-17 19:42:52'),
(5, 5, '2026-05-17 19:42:52'),
(6, 1, '2026-05-17 19:42:52'),
(7, 2, '2026-05-17 19:42:52'),
(8, 3, '2026-05-17 19:42:52'),
(9, 4, '2026-05-17 19:42:52'),
(10, 5, '2026-05-17 19:42:52'),
(11, 1, '2026-05-17 19:42:52'),
(12, 2, '2026-05-17 19:42:52'),
(13, 3, '2026-05-17 19:42:52'),
(14, 4, '2026-05-17 19:42:52'),
(15, 5, '2026-05-17 19:42:52'),
(16, 1, '2026-05-17 19:42:52'),
(17, 2, '2026-05-17 19:42:52'),
(18, 3, '2026-05-17 19:42:52'),
(19, 4, '2026-05-17 19:42:52'),
(20, 5, '2026-05-17 19:42:52');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `addon`
--
ALTER TABLE `addon`
  ADD PRIMARY KEY (`addon_id`);

--
-- Indexes for table `category`
--
ALTER TABLE `category`
  ADD PRIMARY KEY (`categ_id`),
  ADD UNIQUE KEY `categ_name` (`categ_name`);

--
-- Indexes for table `customers`
--
ALTER TABLE `customers`
  ADD PRIMARY KEY (`cust_id`);

--
-- Indexes for table `employee`
--
ALTER TABLE `employee`
  ADD PRIMARY KEY (`emp_id`);

--
-- Indexes for table `orders`
--
ALTER TABLE `orders`
  ADD PRIMARY KEY (`order_id`),
  ADD KEY `cust_id` (`cust_id`),
  ADD KEY `voucher_id` (`voucher_id`);

--
-- Indexes for table `order_items`
--
ALTER TABLE `order_items`
  ADD KEY `order_id` (`order_id`),
  ADD KEY `prodvar_id` (`prodvar_id`),
  ADD KEY `addon_id` (`addon_id`);

--
-- Indexes for table `payment`
--
ALTER TABLE `payment`
  ADD PRIMARY KEY (`payment_ref`),
  ADD KEY `order_id` (`order_id`),
  ADD KEY `emp_id` (`emp_id`);

--
-- Indexes for table `product`
--
ALTER TABLE `product`
  ADD PRIMARY KEY (`product_id`);

--
-- Indexes for table `product_var`
--
ALTER TABLE `product_var`
  ADD PRIMARY KEY (`prodvar_id`),
  ADD KEY `product_id` (`product_id`);

--
-- Indexes for table `voucher`
--
ALTER TABLE `voucher`
  ADD PRIMARY KEY (`voucher_id`);

--
-- Indexes for table `voucher_claim`
--
ALTER TABLE `voucher_claim`
  ADD PRIMARY KEY (`cust_id`,`voucher_id`,`claim_date`),
  ADD KEY `voucher_id` (`voucher_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `addon`
--
ALTER TABLE `addon`
  MODIFY `addon_id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=21;

--
-- AUTO_INCREMENT for table `category`
--
ALTER TABLE `category`
  MODIFY `categ_id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;

--
-- AUTO_INCREMENT for table `customers`
--
ALTER TABLE `customers`
  MODIFY `cust_id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=101;

--
-- AUTO_INCREMENT for table `employee`
--
ALTER TABLE `employee`
  MODIFY `emp_id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `orders`
--
ALTER TABLE `orders`
  MODIFY `order_id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=30;

--
-- AUTO_INCREMENT for table `payment`
--
ALTER TABLE `payment`
  MODIFY `payment_ref` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=30;

--
-- AUTO_INCREMENT for table `product`
--
ALTER TABLE `product`
  MODIFY `product_id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT for table `product_var`
--
ALTER TABLE `product_var`
  MODIFY `prodvar_id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=37;

--
-- AUTO_INCREMENT for table `voucher`
--
ALTER TABLE `voucher`
  MODIFY `voucher_id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=21;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `orders`
--
ALTER TABLE `orders`
  ADD CONSTRAINT `orders_ibfk_1` FOREIGN KEY (`cust_id`) REFERENCES `customers` (`cust_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `orders_ibfk_2` FOREIGN KEY (`voucher_id`) REFERENCES `voucher` (`voucher_id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `order_items`
--
ALTER TABLE `order_items`
  ADD CONSTRAINT `order_items_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `orders` (`order_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `order_items_ibfk_2` FOREIGN KEY (`prodvar_id`) REFERENCES `product_var` (`prodvar_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `order_items_ibfk_3` FOREIGN KEY (`addon_id`) REFERENCES `addon` (`addon_id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `payment`
--
ALTER TABLE `payment`
  ADD CONSTRAINT `payment_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `orders` (`order_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `payment_ibfk_2` FOREIGN KEY (`emp_id`) REFERENCES `employee` (`emp_id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `product_var`
--
ALTER TABLE `product_var`
  ADD CONSTRAINT `product_var_ibfk_1` FOREIGN KEY (`product_id`) REFERENCES `product` (`product_id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `voucher_claim`
--
ALTER TABLE `voucher_claim`
  ADD CONSTRAINT `voucher_claim_ibfk_1` FOREIGN KEY (`cust_id`) REFERENCES `customers` (`cust_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `voucher_claim_ibfk_2` FOREIGN KEY (`voucher_id`) REFERENCES `voucher` (`voucher_id`) ON DELETE CASCADE ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;

SET FOREIGN_KEY_CHECKS = 1;