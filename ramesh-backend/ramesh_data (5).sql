-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Jun 09, 2025 at 07:36 AM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `ramesh_data`
--

-- --------------------------------------------------------

--
-- Table structure for table `activity_logs`
--

CREATE TABLE `activity_logs` (
  `id` int(11) NOT NULL,
  `user_id` int(11) DEFAULT NULL,
  `is_admin` tinyint(1) NOT NULL DEFAULT 0,
  `module` varchar(50) NOT NULL,
  `action` varchar(50) NOT NULL,
  `route` varchar(255) DEFAULT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` varchar(255) DEFAULT NULL,
  `request_data` text DEFAULT NULL,
  `response_code` int(11) DEFAULT NULL,
  `execution_time` float DEFAULT NULL,
  `data` text DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `activity_logs`
--

INSERT INTO `activity_logs` (`id`, `user_id`, `is_admin`, `module`, `action`, `route`, `ip_address`, `user_agent`, `request_data`, `response_code`, `execution_time`, `data`, `created_at`) VALUES
(1, 1, 1, 'ActivityTracking', 'DeleteAllLogs', '/api/activities', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36', '{}', 200, 0.0367548, '{\"status\":\"success\",\"message\":\"All activity logs deleted successfully\"}', '2025-06-08 17:44:57'),
(2, 1, 1, 'OrderManagement', 'MarkPaymentReceived', '/api/admin/orders/6/payment-received', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36', '{\"amount_received\":232}', 200, 0.0205438, '{\"status\":\"success\",\"message\":\"Payment marked as received successfully\"}', '2025-06-08 17:59:51'),
(3, 1, 1, 'OrderManagement', 'UpdateShippingDetails', '/api/admin/orders/15/shipping', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36', '{\"tracking_number\":\"445465465\",\"courier_partner\":\"Blue Dart\",\"estimated_delivery_date\":\"2025-06-11\"}', 200, 0.0173011, '{\"status\":\"success\",\"message\":\"Shipping details updated successfully\"}', '2025-06-08 18:06:31'),
(4, 1, 1, 'OrderManagement', 'MarkPaymentReceived', '/api/admin/orders/15/payment-received', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36', '{\"amount_received\":2000}', 200, 0.00880599, '{\"status\":\"success\",\"message\":\"Payment marked as received successfully\"}', '2025-06-08 18:06:46'),
(5, 1, 1, 'ProductCatalog', 'CreateComprehensiveProduct', '/api/comprehensive-products', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36', '{\"name\":\"Test\",\"category_id\":\"2\",\"subcategory_id\":\"5\",\"description\":\"system\",\"hsn_code\":\"21069099\",\"tax_rate\":\"5\",\"status\":\"active\",\"shelf_life\":\"30 days\",\"is_vegetarian\":\"1\",\"ingredients\":\"[]\",\"nutritional_info\":\"{\\\"calories\\\":\\\"\\\",\\\"carbohydrates\\\":\\\"\\\",\\\"protein\\\":\\\"\\\",\\\"sugar\\\":\\\"\\\",\\\"sodium\\\":\\\"\\\"}\",\"variants\":\"[{\\\"variant_name\\\":\\\"500g\\\",\\\"sku\\\":\\\"GJ-S-41\\\",\\\"price\\\":100,\\\"sale_price\\\":90,\\\"weight\\\":90,\\\"weight_unit\\\":\\\"g\\\",\\\"length\\\":\\\"\\\",\\\"width\\\":\\\"\\\",\\\"height\\\":\\\"\\\",\\\"status\\\":\\\"active\\\",\\\"min_order_quantity\\\":1,\\\"max_order_quantity\\\":10,\\\"id\\\":\\\"1749391534229\\\"}]\",\"tags\":\"[\\\"mithai\\\"]\"}', 200, 0.039655, '{\"status\":\"success\",\"message\":\"Product created successfully\"}', '2025-06-08 19:35:51'),
(6, 1, 1, 'ProductCatalog', 'UpdateComprehensiveProduct', '/api/comprehensive-products/90', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36', '{\"_method\":\"PUT\",\"name\":\"Test\",\"category_id\":\"2\",\"subcategory_id\":\"5\",\"description\":\"system\",\"hsn_code\":\"21069099\",\"tax_rate\":\"5.00\",\"status\":\"active\",\"shelf_life\":\"30 days\",\"is_vegetarian\":\"1\",\"ingredients\":\"[]\",\"nutritional_info\":\"{\\\"calories\\\":\\\"\\\",\\\"fat\\\":\\\"\\\",\\\"carbohydrates\\\":\\\"\\\",\\\"protein\\\":\\\"\\\",\\\"sugar\\\":\\\"\\\",\\\"sodium\\\":\\\"\\\"}\",\"attributes\":\"{\\\"length\\\":\\\"\\\",\\\"width\\\":\\\"\\\",\\\"height\\\":\\\"\\\"}\",\"variants\":\"[{\\\"id\\\":\\\"237\\\",\\\"product_id\\\":90,\\\"variant_name\\\":\\\"500g\\\",\\\"sku\\\":\\\"GJ-S-41\\\",\\\"price\\\":100,\\\"sale_price\\\":90,\\\"discount_percentage\\\":\\\"10.00\\\",\\\"weight\\\":90,\\\"weight_unit\\\":\\\"g\\\",\\\"dimensions\\\":null,\\\"status\\\":\\\"active\\\",\\\"min_order_quantity\\\":1,\\\"max_order_quantity\\\":10,\\\"display_order\\\":0,\\\"created_by\\\":\\\"Admin User\\\",\\\"updated_by\\\":null,\\\"created_at\\\":\\\"2025-06-08 19:35:51\\\",\\\"updated_at\\\":null,\\\"creator_id\\\":1,\\\"created_by_name\\\":\\\"Admin User\\\",\\\"updater_id\\\":null,\\\"updated_by_name\\\":null,\\\"created_at_formatted\\\":\\\"2025-06-08 19:35:51\\\"}]\",\"tags\":\"[\\\"mithai\\\"]\",\"primary_image_id\":\"192\",\"image_order\":\"[\\\"192\\\",\\\"191\\\"]\"}', 200, 0.048533, '{\"status\":\"success\",\"message\":\"Product updated successfully\"}', '2025-06-08 19:36:23'),
(7, 1, 1, 'ProductCatalog', 'UpdateComprehensiveProduct', '/api/comprehensive-products/90', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36', '{\"_method\":\"PUT\",\"name\":\"Test\",\"category_id\":\"2\",\"subcategory_id\":\"5\",\"description\":\"system\",\"hsn_code\":\"21069099\",\"tax_rate\":\"5.00\",\"status\":\"active\",\"shelf_life\":\"30 days\",\"is_vegetarian\":\"1\",\"ingredients\":\"[]\",\"nutritional_info\":\"{\\\"calories\\\":\\\"\\\",\\\"fat\\\":\\\"\\\",\\\"carbohydrates\\\":\\\"\\\",\\\"protein\\\":\\\"\\\",\\\"sugar\\\":\\\"\\\",\\\"sodium\\\":\\\"\\\"}\",\"attributes\":\"{\\\"length\\\":\\\"\\\",\\\"width\\\":\\\"\\\",\\\"height\\\":\\\"\\\"}\",\"variants\":\"[{\\\"id\\\":\\\"237\\\",\\\"product_id\\\":90,\\\"variant_name\\\":\\\"500g\\\",\\\"sku\\\":\\\"GJ-S-41\\\",\\\"price\\\":100,\\\"sale_price\\\":90,\\\"discount_percentage\\\":\\\"10.00\\\",\\\"weight\\\":90,\\\"weight_unit\\\":\\\"g\\\",\\\"dimensions\\\":null,\\\"status\\\":\\\"active\\\",\\\"min_order_quantity\\\":1,\\\"max_order_quantity\\\":10,\\\"display_order\\\":0,\\\"created_by\\\":\\\"Admin User\\\",\\\"updated_by\\\":\\\"Admin User\\\",\\\"created_at\\\":\\\"2025-06-08 19:35:51\\\",\\\"updated_at\\\":\\\"2025-06-08 19:36:23\\\",\\\"creator_id\\\":1,\\\"created_by_name\\\":\\\"Admin User\\\",\\\"updater_id\\\":1,\\\"updated_by_name\\\":\\\"Admin User\\\",\\\"created_at_formatted\\\":\\\"2025-06-08 19:35:51\\\",\\\"updated_at_formatted\\\":\\\"2025-06-08 19:36:23\\\"}]\",\"tags\":\"[\\\"mithai\\\"]\",\"primary_image_id\":\"191\",\"image_order\":\"[\\\"191\\\",\\\"192\\\"]\"}', 200, 0.0287499, '{\"status\":\"success\",\"message\":\"Product updated successfully\"}', '2025-06-08 19:36:30'),
(8, 1, 1, 'ProductCatalog', 'UpdateComprehensiveProduct', '/api/comprehensive-products/90', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36', '{\"_method\":\"PUT\",\"name\":\"Test\",\"category_id\":\"2\",\"subcategory_id\":\"5\",\"description\":\"system\",\"hsn_code\":\"21069099\",\"tax_rate\":\"5.00\",\"status\":\"active\",\"shelf_life\":\"30 days\",\"is_vegetarian\":\"1\",\"ingredients\":\"[]\",\"nutritional_info\":\"{\\\"calories\\\":\\\"\\\",\\\"fat\\\":\\\"\\\",\\\"carbohydrates\\\":\\\"\\\",\\\"protein\\\":\\\"\\\",\\\"sugar\\\":\\\"\\\",\\\"sodium\\\":\\\"\\\"}\",\"attributes\":\"{\\\"length\\\":\\\"\\\",\\\"width\\\":\\\"\\\",\\\"height\\\":\\\"\\\"}\",\"variants\":\"[{\\\"id\\\":\\\"237\\\",\\\"product_id\\\":90,\\\"variant_name\\\":\\\"500g\\\",\\\"sku\\\":\\\"GJ-S-41\\\",\\\"price\\\":100,\\\"sale_price\\\":90,\\\"discount_percentage\\\":\\\"10.00\\\",\\\"weight\\\":90,\\\"weight_unit\\\":\\\"g\\\",\\\"dimensions\\\":null,\\\"status\\\":\\\"active\\\",\\\"min_order_quantity\\\":1,\\\"max_order_quantity\\\":10,\\\"display_order\\\":0,\\\"created_by\\\":\\\"Admin User\\\",\\\"updated_by\\\":\\\"Admin User\\\",\\\"created_at\\\":\\\"2025-06-08 19:35:51\\\",\\\"updated_at\\\":\\\"2025-06-08 19:36:30\\\",\\\"creator_id\\\":1,\\\"created_by_name\\\":\\\"Admin User\\\",\\\"updater_id\\\":1,\\\"updated_by_name\\\":\\\"Admin User\\\",\\\"created_at_formatted\\\":\\\"2025-06-08 19:35:51\\\",\\\"updated_at_formatted\\\":\\\"2025-06-08 19:36:30\\\"}]\",\"tags\":\"[\\\"mithai\\\"]\",\"primary_image_id\":\"191\",\"image_order\":\"[\\\"191\\\",\\\"192\\\"]\"}', 200, 0.041899, '{\"status\":\"success\",\"message\":\"Product updated successfully\"}', '2025-06-08 21:40:50'),
(9, 1, 1, 'ProductCatalog', 'UpdateComprehensiveProduct', '/api/comprehensive-products/90', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36', '{\"_method\":\"PUT\",\"name\":\"Test\",\"category_id\":\"2\",\"subcategory_id\":\"5\",\"description\":\"system\",\"hsn_code\":\"21069099\",\"tax_rate\":\"5.00\",\"status\":\"active\",\"shelf_life\":\"30 days\",\"is_vegetarian\":\"1\",\"ingredients\":\"[]\",\"nutritional_info\":\"{\\\"calories\\\":\\\"\\\",\\\"fat\\\":\\\"\\\",\\\"carbohydrates\\\":\\\"\\\",\\\"protein\\\":\\\"\\\",\\\"sugar\\\":\\\"\\\",\\\"sodium\\\":\\\"\\\"}\",\"attributes\":\"{\\\"length\\\":\\\"\\\",\\\"width\\\":\\\"\\\",\\\"height\\\":\\\"\\\"}\",\"variants\":\"[{\\\"id\\\":\\\"237\\\",\\\"product_id\\\":90,\\\"variant_name\\\":\\\"500g\\\",\\\"sku\\\":\\\"GJ-S-41\\\",\\\"price\\\":100,\\\"sale_price\\\":90,\\\"discount_percentage\\\":\\\"10.00\\\",\\\"weight\\\":90,\\\"weight_unit\\\":\\\"g\\\",\\\"dimensions\\\":null,\\\"status\\\":\\\"active\\\",\\\"min_order_quantity\\\":1,\\\"max_order_quantity\\\":10,\\\"display_order\\\":0,\\\"created_by\\\":\\\"Admin User\\\",\\\"updated_by\\\":\\\"Admin User\\\",\\\"created_at\\\":\\\"2025-06-08 19:35:51\\\",\\\"updated_at\\\":\\\"2025-06-08 21:40:50\\\",\\\"creator_id\\\":1,\\\"created_by_name\\\":\\\"Admin User\\\",\\\"updater_id\\\":1,\\\"updated_by_name\\\":\\\"Admin User\\\",\\\"created_at_formatted\\\":\\\"2025-06-08 19:35:51\\\",\\\"updated_at_formatted\\\":\\\"2025-06-08 21:40:50\\\"}]\",\"tags\":\"[\\\"mithai\\\"]\",\"primary_image_id\":\"191\",\"image_order\":\"[\\\"191\\\",\\\"192\\\"]\"}', 200, 0.03915, '{\"status\":\"success\",\"message\":\"Product updated successfully\"}', '2025-06-08 21:50:34'),
(10, 1, 1, 'ProductCatalog', 'UpdateComprehensiveProduct', '/api/comprehensive-products/90', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36', '{\"_method\":\"PUT\",\"name\":\"Test\",\"category_id\":\"2\",\"subcategory_id\":\"5\",\"description\":\"system\",\"hsn_code\":\"21069099\",\"tax_rate\":\"5.00\",\"status\":\"active\",\"shelf_life\":\"30 days\",\"is_vegetarian\":\"1\",\"ingredients\":\"[]\",\"nutritional_info\":\"{\\\"calories\\\":\\\"\\\",\\\"fat\\\":\\\"\\\",\\\"carbohydrates\\\":\\\"\\\",\\\"protein\\\":\\\"\\\",\\\"sugar\\\":\\\"\\\",\\\"sodium\\\":\\\"\\\"}\",\"attributes\":\"{\\\"length\\\":\\\"\\\",\\\"width\\\":\\\"\\\",\\\"height\\\":\\\"\\\"}\",\"variants\":\"[{\\\"id\\\":\\\"237\\\",\\\"product_id\\\":90,\\\"variant_name\\\":\\\"500g\\\",\\\"sku\\\":\\\"GJ-S-41\\\",\\\"price\\\":100,\\\"sale_price\\\":90,\\\"discount_percentage\\\":\\\"10.00\\\",\\\"weight\\\":90,\\\"weight_unit\\\":\\\"g\\\",\\\"dimensions\\\":null,\\\"status\\\":\\\"active\\\",\\\"min_order_quantity\\\":1,\\\"max_order_quantity\\\":10,\\\"display_order\\\":0,\\\"created_by\\\":\\\"Admin User\\\",\\\"updated_by\\\":\\\"Admin User\\\",\\\"created_at\\\":\\\"2025-06-08 19:35:51\\\",\\\"updated_at\\\":\\\"2025-06-08 21:50:34\\\",\\\"creator_id\\\":1,\\\"created_by_name\\\":\\\"Admin User\\\",\\\"updater_id\\\":1,\\\"updated_by_name\\\":\\\"Admin User\\\",\\\"created_at_formatted\\\":\\\"2025-06-08 19:35:51\\\",\\\"updated_at_formatted\\\":\\\"2025-06-08 21:50:34\\\"}]\",\"tags\":\"[\\\"mithai\\\"]\",\"primary_image_id\":\"193\",\"image_order\":\"[\\\"193\\\",\\\"194\\\",\\\"195\\\"]\"}', 200, 0.0706971, '{\"status\":\"success\",\"message\":\"Product updated successfully\"}', '2025-06-08 21:52:24'),
(11, 1, 1, 'ProductCatalog', 'UpdateComprehensiveProduct', '/api/comprehensive-products/90', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36', '{\"_method\":\"PUT\",\"name\":\"Test\",\"category_id\":\"2\",\"subcategory_id\":\"5\",\"description\":\"system\",\"hsn_code\":\"21069099\",\"tax_rate\":\"5.00\",\"status\":\"active\",\"shelf_life\":\"30 days\",\"is_vegetarian\":\"1\",\"ingredients\":\"[]\",\"nutritional_info\":\"{\\\"calories\\\":\\\"\\\",\\\"fat\\\":\\\"\\\",\\\"carbohydrates\\\":\\\"\\\",\\\"protein\\\":\\\"\\\",\\\"sugar\\\":\\\"\\\",\\\"sodium\\\":\\\"\\\"}\",\"attributes\":\"{\\\"length\\\":\\\"\\\",\\\"width\\\":\\\"\\\",\\\"height\\\":\\\"\\\"}\",\"variants\":\"[{\\\"id\\\":\\\"237\\\",\\\"product_id\\\":90,\\\"variant_name\\\":\\\"500g\\\",\\\"sku\\\":\\\"GJ-S-41\\\",\\\"price\\\":100,\\\"sale_price\\\":90,\\\"discount_percentage\\\":\\\"10.00\\\",\\\"weight\\\":90,\\\"weight_unit\\\":\\\"g\\\",\\\"dimensions\\\":null,\\\"status\\\":\\\"active\\\",\\\"min_order_quantity\\\":1,\\\"max_order_quantity\\\":10,\\\"display_order\\\":0,\\\"created_by\\\":\\\"Admin User\\\",\\\"updated_by\\\":\\\"Admin User\\\",\\\"created_at\\\":\\\"2025-06-08 19:35:51\\\",\\\"updated_at\\\":\\\"2025-06-08 21:52:24\\\",\\\"creator_id\\\":1,\\\"created_by_name\\\":\\\"Admin User\\\",\\\"updater_id\\\":1,\\\"updated_by_name\\\":\\\"Admin User\\\",\\\"created_at_formatted\\\":\\\"2025-06-08 19:35:51\\\",\\\"updated_at_formatted\\\":\\\"2025-06-08 21:52:24\\\"}]\",\"tags\":\"[\\\"mithai\\\"]\",\"primary_image_id\":\"196\",\"image_order\":\"[\\\"196\\\",\\\"197\\\"]\"}', 200, 0.0327079, '{\"status\":\"success\",\"message\":\"Product updated successfully\"}', '2025-06-08 21:53:34'),
(12, 1, 1, 'ProductCatalog', 'UpdateComprehensiveProduct', '/api/comprehensive-products/90', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36', '{\"_method\":\"PUT\",\"name\":\"Test\",\"category_id\":\"2\",\"subcategory_id\":\"5\",\"description\":\"system\",\"hsn_code\":\"21069099\",\"tax_rate\":\"5.00\",\"status\":\"active\",\"shelf_life\":\"30 days\",\"is_vegetarian\":\"1\",\"ingredients\":\"[]\",\"nutritional_info\":\"{\\\"calories\\\":\\\"\\\",\\\"fat\\\":\\\"\\\",\\\"carbohydrates\\\":\\\"\\\",\\\"protein\\\":\\\"\\\",\\\"sugar\\\":\\\"\\\",\\\"sodium\\\":\\\"\\\"}\",\"attributes\":\"{\\\"length\\\":\\\"\\\",\\\"width\\\":\\\"\\\",\\\"height\\\":\\\"\\\"}\",\"variants\":\"[{\\\"id\\\":\\\"237\\\",\\\"product_id\\\":90,\\\"variant_name\\\":\\\"500g\\\",\\\"sku\\\":\\\"GJ-S-41\\\",\\\"price\\\":100,\\\"sale_price\\\":90,\\\"discount_percentage\\\":\\\"10.00\\\",\\\"weight\\\":90,\\\"weight_unit\\\":\\\"g\\\",\\\"dimensions\\\":null,\\\"status\\\":\\\"active\\\",\\\"min_order_quantity\\\":1,\\\"max_order_quantity\\\":10,\\\"display_order\\\":0,\\\"created_by\\\":\\\"Admin User\\\",\\\"updated_by\\\":\\\"Admin User\\\",\\\"created_at\\\":\\\"2025-06-08 19:35:51\\\",\\\"updated_at\\\":\\\"2025-06-08 21:53:34\\\",\\\"creator_id\\\":1,\\\"created_by_name\\\":\\\"Admin User\\\",\\\"updater_id\\\":1,\\\"updated_by_name\\\":\\\"Admin User\\\",\\\"created_at_formatted\\\":\\\"2025-06-08 19:35:51\\\",\\\"updated_at_formatted\\\":\\\"2025-06-08 21:53:34\\\"}]\",\"tags\":\"[\\\"mithai\\\"]\",\"primary_image_id\":\"198\",\"image_order\":\"[\\\"198\\\"]\"}', 200, 0.0585811, '{\"status\":\"success\",\"message\":\"Product updated successfully\"}', '2025-06-08 21:54:41'),
(13, 1, 1, 'ProductCatalog', 'UpdateComprehensiveProduct', '/api/comprehensive-products/90', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36', '{\"_method\":\"PUT\",\"name\":\"Test\",\"category_id\":\"2\",\"subcategory_id\":\"5\",\"description\":\"system\",\"hsn_code\":\"21069099\",\"tax_rate\":\"5.00\",\"status\":\"active\",\"shelf_life\":\"30 days\",\"is_vegetarian\":\"1\",\"ingredients\":\"[]\",\"nutritional_info\":\"{\\\"calories\\\":\\\"\\\",\\\"fat\\\":\\\"\\\",\\\"carbohydrates\\\":\\\"\\\",\\\"protein\\\":\\\"\\\",\\\"sugar\\\":\\\"\\\",\\\"sodium\\\":\\\"\\\"}\",\"attributes\":\"{\\\"length\\\":\\\"\\\",\\\"width\\\":\\\"\\\",\\\"height\\\":\\\"\\\"}\",\"variants\":\"[{\\\"id\\\":\\\"237\\\",\\\"product_id\\\":90,\\\"variant_name\\\":\\\"500g\\\",\\\"sku\\\":\\\"GJ-S-41\\\",\\\"price\\\":100,\\\"sale_price\\\":90,\\\"discount_percentage\\\":\\\"10.00\\\",\\\"weight\\\":90,\\\"weight_unit\\\":\\\"g\\\",\\\"dimensions\\\":null,\\\"status\\\":\\\"active\\\",\\\"min_order_quantity\\\":1,\\\"max_order_quantity\\\":10,\\\"display_order\\\":0,\\\"created_by\\\":\\\"Admin User\\\",\\\"updated_by\\\":\\\"Admin User\\\",\\\"created_at\\\":\\\"2025-06-08 19:35:51\\\",\\\"updated_at\\\":\\\"2025-06-08 21:54:41\\\",\\\"creator_id\\\":1,\\\"created_by_name\\\":\\\"Admin User\\\",\\\"updater_id\\\":1,\\\"updated_by_name\\\":\\\"Admin User\\\",\\\"created_at_formatted\\\":\\\"2025-06-08 19:35:51\\\",\\\"updated_at_formatted\\\":\\\"2025-06-08 21:54:41\\\"}]\",\"tags\":\"[\\\"mithai\\\"]\",\"primary_image_id\":\"199\",\"image_order\":\"[\\\"199\\\"]\"}', 200, 0.0316591, '{\"status\":\"success\",\"message\":\"Product updated successfully\"}', '2025-06-08 22:06:42'),
(14, 1, 1, 'ProductCatalog', 'UpdateComprehensiveProduct', '/api/comprehensive-products/90', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36', '{\"_method\":\"PUT\",\"name\":\"Test\",\"category_id\":\"2\",\"subcategory_id\":\"5\",\"description\":\"system\",\"hsn_code\":\"21069099\",\"tax_rate\":\"5.00\",\"status\":\"active\",\"shelf_life\":\"30 days\",\"is_vegetarian\":\"1\",\"ingredients\":\"[]\",\"nutritional_info\":\"{\\\"calories\\\":\\\"\\\",\\\"fat\\\":\\\"\\\",\\\"carbohydrates\\\":\\\"\\\",\\\"protein\\\":\\\"\\\",\\\"sugar\\\":\\\"\\\",\\\"sodium\\\":\\\"\\\"}\",\"attributes\":\"{\\\"length\\\":\\\"\\\",\\\"width\\\":\\\"\\\",\\\"height\\\":\\\"\\\"}\",\"variants\":\"[{\\\"id\\\":\\\"237\\\",\\\"product_id\\\":90,\\\"variant_name\\\":\\\"500g\\\",\\\"sku\\\":\\\"GJ-S-41\\\",\\\"price\\\":100,\\\"sale_price\\\":90,\\\"discount_percentage\\\":\\\"10.00\\\",\\\"weight\\\":90,\\\"weight_unit\\\":\\\"g\\\",\\\"dimensions\\\":null,\\\"status\\\":\\\"active\\\",\\\"min_order_quantity\\\":1,\\\"max_order_quantity\\\":10,\\\"display_order\\\":0,\\\"created_by\\\":\\\"Admin User\\\",\\\"updated_by\\\":\\\"Admin User\\\",\\\"created_at\\\":\\\"2025-06-08 19:35:51\\\",\\\"updated_at\\\":\\\"2025-06-08 22:06:42\\\",\\\"creator_id\\\":1,\\\"created_by_name\\\":\\\"Admin User\\\",\\\"updater_id\\\":1,\\\"updated_by_name\\\":\\\"Admin User\\\",\\\"created_at_formatted\\\":\\\"2025-06-08 19:35:51\\\",\\\"updated_at_formatted\\\":\\\"2025-06-08 22:06:42\\\"}]\",\"tags\":\"[\\\"mithai\\\"]\",\"primary_image_id\":\"200\",\"image_order\":\"[\\\"200\\\"]\"}', 200, 0.0685508, '{\"status\":\"success\",\"message\":\"Product updated successfully\"}', '2025-06-09 10:15:49'),
(15, 1, 1, 'ProductCatalog', 'UpdateComprehensiveProduct', '/api/comprehensive-products/90', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36', '{\"_method\":\"PUT\",\"name\":\"Test\",\"category_id\":\"2\",\"subcategory_id\":\"5\",\"description\":\"system\",\"hsn_code\":\"21069099\",\"tax_rate\":\"5.00\",\"status\":\"active\",\"shelf_life\":\"30 days\",\"is_vegetarian\":\"1\",\"ingredients\":\"[]\",\"nutritional_info\":\"{\\\"calories\\\":\\\"\\\",\\\"fat\\\":\\\"\\\",\\\"carbohydrates\\\":\\\"\\\",\\\"protein\\\":\\\"\\\",\\\"sugar\\\":\\\"\\\",\\\"sodium\\\":\\\"\\\"}\",\"attributes\":\"{\\\"length\\\":\\\"\\\",\\\"width\\\":\\\"\\\",\\\"height\\\":\\\"\\\"}\",\"variants\":\"[{\\\"id\\\":\\\"237\\\",\\\"product_id\\\":90,\\\"variant_name\\\":\\\"500g\\\",\\\"sku\\\":\\\"GJ-S-41\\\",\\\"price\\\":100,\\\"sale_price\\\":90,\\\"discount_percentage\\\":\\\"10.00\\\",\\\"weight\\\":90,\\\"weight_unit\\\":\\\"g\\\",\\\"dimensions\\\":null,\\\"status\\\":\\\"active\\\",\\\"min_order_quantity\\\":1,\\\"max_order_quantity\\\":10,\\\"display_order\\\":0,\\\"created_by\\\":\\\"Admin User\\\",\\\"updated_by\\\":\\\"Admin User\\\",\\\"created_at\\\":\\\"2025-06-08 19:35:51\\\",\\\"updated_at\\\":\\\"2025-06-09 10:15:49\\\",\\\"creator_id\\\":1,\\\"created_by_name\\\":\\\"Admin User\\\",\\\"updater_id\\\":1,\\\"updated_by_name\\\":\\\"Admin User\\\",\\\"created_at_formatted\\\":\\\"2025-06-08 19:35:51\\\",\\\"updated_at_formatted\\\":\\\"2025-06-09 10:15:49\\\"}]\",\"tags\":\"[\\\"mithai\\\"]\",\"delete_image_ids\":\"\"}', 200, 0.02946, '{\"status\":\"success\",\"message\":\"Product updated successfully\"}', '2025-06-09 11:04:37');

-- --------------------------------------------------------

--
-- Table structure for table `admins`
--

CREATE TABLE `admins` (
  `id` int(10) UNSIGNED NOT NULL,
  `username` varchar(50) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `first_name` varchar(50) NOT NULL,
  `last_name` varchar(50) NOT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `profile_image` varchar(255) DEFAULT NULL,
  `role` enum('super_admin','admin') NOT NULL DEFAULT 'admin',
  `status` enum('active','inactive','suspended') NOT NULL DEFAULT 'active',
  `last_login_at` timestamp NULL DEFAULT NULL,
  `created_by` int(10) UNSIGNED DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `admins`
--

INSERT INTO `admins` (`id`, `username`, `email`, `password`, `first_name`, `last_name`, `phone`, `profile_image`, `role`, `status`, `last_login_at`, `created_by`, `created_at`, `updated_at`, `deleted_at`) VALUES
(1, 'admin', 'admin@rameshsweets.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Admin', 'User', NULL, NULL, 'super_admin', 'active', '2025-06-08 12:14:03', NULL, '2025-04-27 20:24:03', '2025-06-08 12:14:03', NULL),
(2, 'mohit', 'mohit@rameshsweets.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Mohit', 'lalwani', NULL, NULL, 'admin', 'active', '2025-06-01 16:36:59', NULL, '2025-04-27 20:24:03', '2025-06-01 16:36:59', NULL),
(3, 'karan20', 'karandhanwani20@gmail.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'karan', 'dhanwani', NULL, NULL, 'admin', 'active', '2025-05-16 14:12:54', NULL, '2025-04-27 20:24:03', '2025-05-16 14:12:54', NULL),
(4, 'dinesh', 'dineshdhawani@rameshsweets.in', '$2y$12$5eJo6CQzE0M7RTefL4T3ZeA1DdLJD5fxPLJ1Zyii473n8bcOBC1kW', 'dinesh', 'dhanwani', '7888261079', 'uploads/profile_images/d1bb4cbce2961b3b057d7bd04919219f.png', 'admin', 'active', '2025-05-25 12:16:06', 1, '2025-05-08 15:15:42', '2025-05-25 12:16:06', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `carts`
--

CREATE TABLE `carts` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `status` enum('active','merged','abandoned','converted') NOT NULL DEFAULT 'active',
  `coupon_id` bigint(20) UNSIGNED DEFAULT NULL,
  `coupon_code` varchar(50) DEFAULT NULL,
  `discount_type` enum('percentage','fixed_amount','free_shipping') DEFAULT NULL,
  `discount_value` decimal(10,2) DEFAULT NULL,
  `discount_amount` decimal(10,2) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `expires_at` timestamp NULL DEFAULT NULL,
  `base_amount` decimal(10,2) DEFAULT 0.00 COMMENT 'Total base amount before taxes',
  `gst_amount` decimal(10,2) DEFAULT 0.00 COMMENT 'Total GST/tax amount',
  `subtotal` decimal(10,2) DEFAULT 0.00 COMMENT 'Subtotal (base_amount + gst_amount)',
  `roundoff` decimal(10,2) DEFAULT 0.00 COMMENT 'Roundoff amount',
  `final_total` decimal(10,2) DEFAULT 0.00 COMMENT 'Final total after discount and roundoff'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `carts`
--

INSERT INTO `carts` (`id`, `user_id`, `status`, `coupon_id`, `coupon_code`, `discount_type`, `discount_value`, `discount_amount`, `created_at`, `updated_at`, `expires_at`, `base_amount`, `gst_amount`, `subtotal`, `roundoff`, `final_total`) VALUES
(2, 1, 'converted', 36, 'FIRSTORDER', 'percentage', 20.00, 30.00, '2025-05-27 00:22:59', '2025-05-29 01:37:43', '2025-06-26 00:22:59', 3948.62, 197.38, 4146.00, 0.00, 4116.00),
(3, 13, 'active', NULL, NULL, NULL, NULL, NULL, '2025-05-27 00:33:11', '2025-05-27 00:33:11', '2025-06-26 00:33:11', 0.00, 0.00, 0.00, 0.00, 0.00),
(4, 14, 'converted', 30, 'GRAD25', 'percentage', 15.00, 35.00, '2025-05-27 00:38:23', '2025-06-06 03:21:27', '2025-06-26 00:38:23', 313.33, 15.67, 329.00, 0.00, 294.00),
(5, 20, 'active', 28, 'BIRTHDAY25', 'percentage', 25.00, 50.00, '2025-05-27 17:51:15', '2025-05-28 03:48:59', '2025-06-26 17:51:15', 7301.00, 365.00, 7666.00, 0.00, 7616.00),
(6, 27, 'active', 36, 'FIRSTORDER', 'percentage', 20.00, 30.00, '2025-05-29 00:24:14', '2025-05-29 23:14:48', '2025-06-28 00:24:14', 474.28, 23.72, 498.00, 0.00, 468.00),
(7, 1, 'converted', NULL, NULL, NULL, NULL, NULL, '2025-05-29 01:39:15', '2025-05-29 09:31:21', '2025-06-28 01:39:15', 511.44, 25.56, 537.00, 0.00, 537.00),
(8, 1, 'converted', NULL, NULL, NULL, NULL, NULL, '2025-05-29 09:31:51', '2025-05-29 09:35:55', '2025-06-28 09:31:51', 681.92, 34.08, 716.00, 0.00, 716.00),
(9, 1, 'converted', NULL, NULL, NULL, NULL, NULL, '2025-05-29 09:42:25', '2025-05-29 12:47:06', '2025-06-28 09:42:25', 170.48, 8.52, 179.00, 0.00, 179.00),
(10, 1, 'converted', 36, 'FIRSTORDER', 'percentage', 20.00, 30.00, '2025-05-29 13:04:03', '2025-05-29 21:27:52', '2025-06-28 13:04:03', 1165.74, 58.26, 1224.00, 0.00, 1194.00),
(11, 28, 'converted', 36, 'FIRSTORDER', 'percentage', 20.00, 30.00, '2025-05-29 13:10:49', '2025-05-29 20:14:16', '2025-06-28 13:10:49', 340.96, 17.04, 358.00, 0.00, 328.00),
(12, 28, 'active', NULL, NULL, NULL, NULL, NULL, '2025-05-29 20:14:16', '2025-05-29 23:26:33', '2025-06-28 20:14:16', 170.48, 8.52, 179.00, 0.00, 179.00),
(13, 1, 'converted', 36, 'FIRSTORDER', 'percentage', 20.00, 30.00, '2025-05-29 21:27:52', '2025-05-29 21:33:39', '2025-06-28 21:27:52', 511.44, 25.56, 537.00, 0.00, 507.00),
(14, 1, 'converted', NULL, NULL, NULL, NULL, NULL, '2025-05-29 21:33:41', '2025-05-29 21:35:50', '2025-06-28 21:33:41', 511.44, 25.56, 537.00, 0.00, 537.00),
(15, 1, 'converted', 36, 'FIRSTORDER', 'percentage', 20.00, 30.00, '2025-05-29 21:35:52', '2025-05-29 22:20:12', '2025-06-28 21:35:52', 340.96, 17.04, 358.00, 0.00, 328.00),
(16, 1, 'converted', NULL, NULL, NULL, NULL, NULL, '2025-05-29 22:20:12', '2025-05-29 23:04:57', '2025-06-28 22:20:12', 170.48, 8.52, 179.00, 0.00, 179.00),
(17, 1, 'converted', NULL, NULL, NULL, NULL, NULL, '2025-05-29 23:04:57', '2025-05-29 23:12:31', '2025-06-28 23:04:57', 170.48, 8.52, 179.00, 0.00, 179.00),
(18, 1, 'converted', NULL, NULL, NULL, NULL, NULL, '2025-05-29 23:12:31', '2025-05-29 23:15:13', '2025-06-28 23:12:31', 170.48, 8.52, 179.00, 0.00, 179.00),
(19, 1, 'converted', NULL, NULL, NULL, NULL, NULL, '2025-05-29 23:15:13', '2025-05-29 23:25:48', '2025-06-28 23:15:13', 170.48, 8.52, 179.00, 0.00, 179.00),
(20, 1, 'converted', NULL, NULL, NULL, NULL, NULL, '2025-05-29 23:25:48', '2025-05-29 23:33:07', '2025-06-28 23:25:48', 170.48, 8.52, 179.00, 0.00, 179.00),
(21, 1, 'converted', NULL, NULL, NULL, NULL, NULL, '2025-05-29 23:33:07', '2025-05-29 23:35:54', '2025-06-28 23:33:07', 170.48, 8.52, 179.00, 0.00, 179.00),
(22, 1, 'converted', NULL, NULL, NULL, NULL, NULL, '2025-05-29 23:35:55', '2025-05-29 23:40:17', '2025-06-28 23:35:55', 170.48, 8.52, 179.00, 0.00, 179.00),
(23, 1, 'converted', NULL, NULL, NULL, NULL, NULL, '2025-05-29 23:40:17', '2025-05-30 17:08:03', '2025-06-28 23:40:17', 170.48, 8.52, 179.00, 0.00, 179.00),
(24, 1, 'converted', NULL, NULL, NULL, NULL, NULL, '2025-05-30 17:08:03', '2025-05-30 23:49:17', '2025-06-29 17:08:03', 340.96, 17.04, 358.00, 0.00, 358.00),
(25, 1, 'converted', 30, 'GRAD25', 'percentage', 15.00, 35.00, '2025-05-30 23:49:17', '2025-05-31 17:13:53', '2025-06-29 23:49:17', 663.80, 33.20, 697.00, 0.00, 662.00),
(26, 1, 'converted', NULL, NULL, NULL, NULL, NULL, '2025-05-31 17:13:53', '2025-06-05 13:13:28', '2025-06-30 17:13:53', 511.44, 25.56, 537.00, 0.00, 537.00),
(27, 29, 'active', NULL, NULL, NULL, NULL, NULL, '2025-06-05 10:58:16', '2025-06-05 11:23:01', '2025-07-05 10:58:16', 0.00, 0.00, 0.00, 0.00, 0.00),
(28, 1, 'converted', 36, 'FIRSTORDER', 'percentage', 20.00, 30.00, '2025-06-05 13:13:28', '2025-06-05 23:36:22', '2025-07-05 13:13:28', 170.48, 8.52, 179.00, 0.00, 149.00),
(29, 1, 'converted', 36, 'FIRSTORDER', 'percentage', 20.00, 30.00, '2025-06-05 23:36:22', '2025-06-05 23:51:44', '2025-07-05 23:36:22', 939.99, 47.01, 987.00, 0.00, 957.00),
(30, 1, 'converted', NULL, NULL, NULL, NULL, NULL, '2025-06-05 23:51:44', '2025-06-05 23:56:10', '2025-07-05 23:51:44', 570.48, 28.52, 599.00, 0.00, 599.00),
(31, 1, 'converted', 36, 'FIRSTORDER', 'percentage', 20.00, 30.00, '2025-06-05 23:56:10', '2025-06-05 23:59:18', '2025-07-05 23:56:10', 511.44, 25.56, 537.00, 0.00, 507.00),
(32, 1, 'converted', 36, 'FIRSTORDER', 'percentage', 20.00, 30.00, '2025-06-05 23:59:18', '2025-06-06 00:01:08', '2025-07-05 23:59:18', 511.44, 25.56, 537.00, 0.00, 507.00),
(33, 1, 'converted', 13, 'SUMMER25', 'percentage', 10.00, 17.90, '2025-06-06 00:01:08', '2025-06-06 00:29:43', '2025-07-06 00:01:08', 170.48, 8.52, 179.00, -0.10, 161.00),
(34, 1, 'converted', 34, 'LOYAL25', 'percentage', 10.00, 17.90, '2025-06-06 00:29:43', '2025-06-06 02:06:44', '2025-07-06 00:29:43', 170.48, 8.52, 179.00, -0.10, 161.00),
(35, 1, 'converted', 30, 'GRAD25', 'percentage', 15.00, 26.85, '2025-06-06 02:06:44', '2025-06-06 02:12:37', '2025-07-06 02:06:44', 170.48, 8.52, 179.00, -0.15, 152.00),
(36, 1, 'converted', NULL, NULL, NULL, NULL, NULL, '2025-06-06 02:12:37', '2025-06-06 02:16:19', '2025-07-06 02:12:37', 170.48, 8.52, 179.00, 0.00, 179.00),
(37, 1, 'converted', 30, 'GRAD25', 'percentage', 15.00, 26.85, '2025-06-06 02:16:19', '2025-06-06 02:17:16', '2025-07-06 02:16:19', 170.48, 8.52, 179.00, -0.15, 152.00),
(38, 1, 'converted', 37, 'WEEKEND25', 'percentage', 15.00, 26.85, '2025-06-06 02:17:17', '2025-06-06 02:35:37', '2025-07-06 02:17:17', 170.48, 8.52, 179.00, -0.15, 152.00),
(39, 1, 'converted', NULL, NULL, NULL, NULL, NULL, '2025-06-06 02:35:37', '2025-06-06 02:46:15', '2025-07-06 02:35:37', 170.48, 8.52, 179.00, 0.00, 179.00),
(40, 1, 'converted', 36, 'FIRSTORDER', 'percentage', 20.00, 30.00, '2025-06-06 02:46:15', '2025-06-06 11:38:09', '2025-07-06 02:46:15', 4445.76, 222.24, 4668.00, 0.00, 4638.00),
(41, 14, 'converted', 37, 'WEEKEND25', 'percentage', 15.00, 40.00, '2025-06-06 03:21:27', '2025-06-06 03:25:15', '2025-07-06 03:21:27', 170.48, 8.52, 179.00, 0.00, 139.00),
(42, 14, 'converted', NULL, NULL, NULL, NULL, NULL, '2025-06-06 03:25:15', '2025-06-06 03:28:20', '2025-07-06 03:25:15', 170.48, 8.52, 179.00, 0.00, 179.00),
(43, 14, 'converted', NULL, NULL, NULL, NULL, NULL, '2025-06-06 03:28:20', '2025-06-06 03:33:07', '2025-07-06 03:28:20', 170.48, 8.52, 179.00, 0.00, 179.00),
(44, 14, 'converted', 29, 'ANNIV25', 'fixed_amount', 15.00, 15.00, '2025-06-06 03:33:07', '2025-06-06 03:44:37', '2025-07-06 03:33:07', 170.48, 8.52, 179.00, 0.00, 164.00),
(45, 14, 'active', NULL, NULL, NULL, NULL, NULL, '2025-06-06 03:44:37', '2025-06-06 09:07:22', '2025-07-06 03:44:37', 0.00, 0.00, 0.00, 0.00, 0.00),
(46, 1, 'active', NULL, NULL, NULL, NULL, NULL, '2025-06-06 11:38:09', '2025-06-07 08:46:38', '2025-07-06 11:38:09', 0.00, 0.00, 0.00, 0.00, 0.00),
(47, 30, 'converted', 36, 'FIRSTORDER', 'percentage', 20.00, 30.00, '2025-06-07 08:36:44', '2025-06-07 08:38:52', '2025-07-07 08:36:44', 1900.96, 95.04, 1996.00, 0.00, 1966.00),
(48, 30, 'active', NULL, NULL, NULL, NULL, NULL, '2025-06-07 08:38:52', '2025-06-07 08:38:52', '2025-07-07 08:38:52', 0.00, 0.00, 0.00, 0.00, 0.00);

-- --------------------------------------------------------

--
-- Table structure for table `cart_items`
--

CREATE TABLE `cart_items` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `cart_id` bigint(20) UNSIGNED NOT NULL,
  `product_id` bigint(20) UNSIGNED NOT NULL,
  `variant_id` bigint(20) UNSIGNED NOT NULL,
  `quantity` int(10) UNSIGNED NOT NULL DEFAULT 1,
  `price_with_tax` decimal(10,2) NOT NULL,
  `tax_rate` decimal(5,2) NOT NULL,
  `base_price` decimal(10,2) GENERATED ALWAYS AS (round(`price_with_tax` / (1 + `tax_rate` / 100),2)) STORED,
  `igst_amount` decimal(10,2) GENERATED ALWAYS AS (round(`price_with_tax` - `price_with_tax` / (1 + `tax_rate` / 100),2)) STORED,
  `line_total` decimal(10,2) GENERATED ALWAYS AS (round(`price_with_tax` * `quantity`,0)) STORED,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `cart_items`
--

INSERT INTO `cart_items` (`id`, `cart_id`, `product_id`, `variant_id`, `quantity`, `price_with_tax`, `tax_rate`, `created_at`, `updated_at`) VALUES
(6, 4, 8, 23, 1, 329.00, 5.00, '2025-05-27 00:40:10', '2025-05-28 14:49:42'),
(18, 2, 3, 7, 19, 179.00, 5.00, '2025-05-27 02:23:25', '2025-05-27 22:33:52'),
(21, 2, 2, 4, 2, 179.00, 5.00, '2025-05-27 02:39:52', '2025-05-27 02:39:52'),
(22, 2, 1, 3, 2, 999.00, 5.00, '2025-05-27 03:46:03', '2025-05-27 03:46:03'),
(23, 5, 1, 2, 3, 499.00, 5.00, '2025-05-27 17:58:46', '2025-05-27 18:02:27'),
(25, 5, 3, 9, 23, 599.00, 5.00, '2025-05-27 18:08:14', '2025-05-27 18:21:04'),
(27, 5, 2, 4, 1, 179.00, 5.00, '2025-05-27 21:04:51', '2025-05-27 21:04:51'),
(28, 6, 1, 1, 2, 249.00, 5.00, '2025-05-29 00:24:14', '2025-05-29 00:24:14'),
(29, 7, 2, 4, 2, 179.00, 5.00, '2025-05-29 09:28:52', '2025-05-29 09:28:52'),
(30, 7, 3, 7, 1, 179.00, 5.00, '2025-05-29 09:30:53', '2025-05-29 09:30:53'),
(31, 8, 4, 10, 2, 179.00, 5.00, '2025-05-29 09:35:35', '2025-05-29 09:35:35'),
(32, 8, 6, 16, 2, 179.00, 5.00, '2025-05-29 09:35:43', '2025-05-29 09:35:43'),
(33, 9, 5, 13, 1, 179.00, 5.00, '2025-05-29 12:37:04', '2025-05-29 12:37:04'),
(35, 10, 69, 199, 3, 229.00, 5.00, '2025-05-29 13:05:30', '2025-05-29 13:05:30'),
(36, 10, 66, 190, 1, 179.00, 5.00, '2025-05-29 13:05:49', '2025-05-29 13:05:49'),
(37, 10, 7, 19, 2, 179.00, 5.00, '2025-05-29 13:07:11', '2025-05-29 13:07:42'),
(40, 11, 7, 19, 2, 179.00, 5.00, '2025-05-29 18:24:52', '2025-05-29 18:56:41'),
(41, 13, 8, 22, 3, 179.00, 5.00, '2025-05-29 21:33:16', '2025-05-29 21:33:16'),
(42, 14, 9, 25, 3, 179.00, 5.00, '2025-05-29 21:34:51', '2025-05-29 21:34:51'),
(43, 15, 10, 28, 2, 179.00, 5.00, '2025-05-29 22:00:04', '2025-05-29 22:13:37'),
(44, 16, 11, 31, 1, 179.00, 5.00, '2025-05-29 22:26:34', '2025-05-29 22:26:34'),
(45, 12, 11, 31, 1, 179.00, 5.00, '2025-05-29 22:38:29', '2025-05-29 22:38:29'),
(46, 17, 12, 34, 1, 179.00, 5.00, '2025-05-29 23:12:21', '2025-05-29 23:12:21'),
(47, 18, 66, 190, 1, 179.00, 5.00, '2025-05-29 23:15:01', '2025-05-29 23:15:01'),
(48, 19, 66, 190, 1, 179.00, 5.00, '2025-05-29 23:25:32', '2025-05-29 23:25:32'),
(49, 20, 66, 190, 1, 179.00, 5.00, '2025-05-29 23:32:57', '2025-05-29 23:32:57'),
(50, 21, 66, 190, 1, 179.00, 5.00, '2025-05-29 23:35:48', '2025-05-29 23:35:48'),
(51, 22, 66, 190, 1, 179.00, 5.00, '2025-05-29 23:40:10', '2025-05-29 23:40:10'),
(52, 23, 15, 43, 1, 179.00, 5.00, '2025-05-30 17:07:49', '2025-05-30 17:07:49'),
(53, 24, 13, 37, 2, 179.00, 5.00, '2025-05-30 23:39:58', '2025-05-30 23:39:58'),
(55, 25, 65, 187, 1, 199.00, 5.00, '2025-05-31 00:31:37', '2025-05-31 00:31:46'),
(56, 25, 1, 1, 2, 249.00, 5.00, '2025-05-31 17:12:06', '2025-05-31 17:12:06'),
(57, 26, 14, 40, 3, 179.00, 5.00, '2025-06-05 13:13:03', '2025-06-05 13:13:03'),
(58, 28, 14, 40, 1, 179.00, 5.00, '2025-06-05 13:14:57', '2025-06-05 13:14:57'),
(59, 29, 16, 47, 3, 329.00, 5.00, '2025-06-05 23:37:22', '2025-06-05 23:37:22'),
(60, 30, 16, 48, 1, 599.00, 5.00, '2025-06-05 23:55:26', '2025-06-05 23:55:39'),
(61, 31, 20, 58, 3, 179.00, 5.00, '2025-06-05 23:58:48', '2025-06-05 23:58:48'),
(62, 32, 17, 49, 3, 179.00, 5.00, '2025-06-06 00:00:38', '2025-06-06 00:00:38'),
(65, 33, 20, 58, 1, 179.00, 5.00, '2025-06-06 00:02:03', '2025-06-06 00:02:03'),
(66, 34, 17, 49, 1, 179.00, 5.00, '2025-06-06 00:33:31', '2025-06-06 00:33:31'),
(67, 35, 14, 40, 1, 179.00, 5.00, '2025-06-06 02:12:02', '2025-06-06 02:12:02'),
(68, 36, 17, 49, 1, 179.00, 5.00, '2025-06-06 02:14:42', '2025-06-06 02:14:42'),
(69, 37, 14, 40, 1, 179.00, 5.00, '2025-06-06 02:16:57', '2025-06-06 02:16:57'),
(70, 38, 17, 49, 1, 179.00, 5.00, '2025-06-06 02:34:04', '2025-06-06 02:34:04'),
(71, 39, 19, 55, 1, 179.00, 5.00, '2025-06-06 02:42:22', '2025-06-06 02:42:22'),
(72, 41, 14, 40, 1, 179.00, 5.00, '2025-06-06 03:21:43', '2025-06-06 03:21:55'),
(73, 42, 14, 40, 1, 179.00, 5.00, '2025-06-06 03:28:15', '2025-06-06 03:28:15'),
(74, 43, 14, 40, 1, 179.00, 5.00, '2025-06-06 03:33:02', '2025-06-06 03:33:02'),
(75, 44, 20, 58, 1, 179.00, 5.00, '2025-06-06 03:41:29', '2025-06-06 03:41:29'),
(76, 40, 14, 40, 3, 179.00, 5.00, '2025-06-06 11:37:13', '2025-06-06 11:37:13'),
(77, 40, 14, 42, 3, 599.00, 5.00, '2025-06-06 11:37:17', '2025-06-06 11:37:17'),
(78, 40, 17, 49, 3, 179.00, 5.00, '2025-06-06 11:37:21', '2025-06-06 11:37:21'),
(79, 40, 17, 51, 3, 599.00, 5.00, '2025-06-06 11:37:26', '2025-06-06 11:37:26'),
(80, 47, 1, 2, 4, 499.00, 5.00, '2025-06-07 08:36:44', '2025-06-07 08:36:44');

-- --------------------------------------------------------

--
-- Table structure for table `categories`
--

CREATE TABLE `categories` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `slug` varchar(255) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `image` varchar(255) DEFAULT NULL,
  `meta_title` varchar(255) DEFAULT NULL,
  `meta_description` text DEFAULT NULL,
  `meta_keywords` text DEFAULT NULL,
  `status` enum('active','inactive') DEFAULT 'active',
  `display_order` int(11) DEFAULT 0,
  `created_by` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT NULL ON UPDATE current_timestamp(),
  `updated_by` int(11) DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `deleted_by` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `categories`
--

INSERT INTO `categories` (`id`, `name`, `slug`, `description`, `image`, `meta_title`, `meta_description`, `meta_keywords`, `status`, `display_order`, `created_by`, `created_at`, `updated_at`, `updated_by`, `deleted_at`, `deleted_by`) VALUES
(1, ' Sweets', 'sweets', 'Traditional and modern Indian confections made using ingredients like milk, ghee, nuts, and sugar. These sweets are perfect for festivals, celebrations, and daily indulgence.', 'uploads/categories/5fffeb9b19db1b63a63773757bd21792.jpg', '', '', '', 'active', 30, 2, '2025-05-09 11:50:30', '2025-06-07 08:38:52', 1, NULL, NULL),
(2, 'Cakes', 'cakes', 'Freshly baked cakes in a variety of flavors and styles, ideal for birthdays, anniversaries, and special occasions. Includes eggless and designer options.', 'uploads/categories/30d3db3ed24e30542753e1bef74f1da7.jpg', '', '', '', 'active', 0, 2, '2025-05-09 11:51:48', NULL, NULL, NULL, NULL),
(3, 'Dry Fruits', 'dry-fruits', 'High-quality, nutrient-rich dry fruits like almonds, cashews, pistachios, and raisins — available raw, roasted, and flavored for healthy snacking or gifting.', 'uploads/categories/0ddb8ef89e18b79651737f45f004b2d0.jpg', '', '', '', 'active', 0, 2, '2025-05-09 11:52:29', NULL, NULL, NULL, NULL),
(4, 'Snacks', 'snacks', 'Crispy and savory traditional Indian snacks made from flour, lentils, and spices — perfect for tea-time, travel, or munching anytime.', 'uploads/categories/3dc98c8b7cc200fdebd7001b80fcb0c9.jpg', '', '', '', 'inactive', 0, 2, '2025-05-09 11:53:33', '2025-05-17 08:28:25', 4, NULL, NULL),
(5, 'Hampers', 'hampers', 'Beautifully packed assortments of sweets, dry fruits, and snacks — ideal for gifting during festivals, weddings, and corporate events.', 'uploads/categories/119f044200025527cb9ad1746bf9c5f7.jpg', '', '', '', 'active', 0, 2, '2025-05-09 11:54:22', NULL, NULL, NULL, NULL),
(6, 'test', 'test', 'category', 'uploads/categories/6b60dba5eb067150da0ea4b876f821bf.png', '', '', '', 'active', 0, 3, '2025-05-16 14:16:53', '2025-05-19 11:33:11', 1, NULL, NULL),
(7, 'test2', 'test2', '', 'uploads/categories/0b9ba20a85e5c281ee3b95c9fd39eb70.png', '', '', '', 'active', 0, 1, '2025-05-19 11:35:00', NULL, NULL, NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `coupons`
--

CREATE TABLE `coupons` (
  `id` int(11) NOT NULL,
  `code` varchar(50) NOT NULL COMMENT 'Unique coupon code',
  `name` varchar(100) NOT NULL COMMENT 'Descriptive name for the coupon',
  `description` text DEFAULT NULL COMMENT 'Detailed description of the coupon',
  `discount_type` enum('percentage','fixed_amount') NOT NULL COMMENT 'Type of discount',
  `discount_value` decimal(10,2) NOT NULL COMMENT 'Value of the discount (percentage or fixed amount)',
  `minimum_order_value` decimal(10,2) DEFAULT 0.00 COMMENT 'Minimum order value required to use the coupon',
  `maximum_discount_amount` decimal(10,2) DEFAULT NULL COMMENT 'Maximum discount amount for percentage discounts',
  `start_date` datetime NOT NULL COMMENT 'When the coupon becomes valid',
  `end_date` datetime DEFAULT NULL COMMENT 'When the coupon expires (NULL for never)',
  `usage_limit` int(11) DEFAULT NULL COMMENT 'Maximum number of times this coupon can be used in total',
  `is_active` tinyint(1) DEFAULT 1 COMMENT 'Whether the coupon is currently active',
  `created_by` int(11) DEFAULT NULL COMMENT 'Admin who created the coupon',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `deleted_at` timestamp NULL DEFAULT NULL COMMENT 'Soft delete timestamp',
  `per_user_limit` int(11) DEFAULT 1 COMMENT 'Maximum number of times a single user can use this coupon'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `coupons`
--

INSERT INTO `coupons` (`id`, `code`, `name`, `description`, `discount_type`, `discount_value`, `minimum_order_value`, `maximum_discount_amount`, `start_date`, `end_date`, `usage_limit`, `is_active`, `created_by`, `created_at`, `updated_at`, `deleted_at`, `per_user_limit`) VALUES
(10, 'LYDIY2AF', 'hello', 'hello', 'fixed_amount', 50.00, 0.00, 0.00, '2025-05-11 00:00:00', '2025-05-24 23:59:59', 999, 1, NULL, '2025-05-09 20:07:56', '2025-05-09 20:16:25', '2025-05-09 20:16:25', 0),
(11, 'VDAY25', 'Valentine\'s Day Special', 'Special discount for Valentine\'s Day treats', 'percentage', 15.00, 25.00, 50.00, '2025-02-01 00:00:00', '2025-02-14 23:59:59', 500, 1, NULL, '2025-05-11 19:14:33', '2025-05-11 19:14:33', NULL, 1),
(12, 'EASTER25', 'Easter Egg Hunt', 'Sweet deals on Easter chocolates and candies', 'percentage', 20.00, 30.00, 40.00, '2025-03-20 00:00:00', '2025-04-10 23:59:59', 300, 1, NULL, '2025-05-11 19:14:33', '2025-05-11 19:14:33', NULL, 1),
(13, 'SUMMER25', 'Summer Cooldown', 'Discounts on ice cream and cold treats', 'percentage', 10.00, 15.00, 30.00, '2025-06-01 00:00:00', '2025-08-31 23:59:59', 1000, 1, NULL, '2025-05-11 19:14:33', '2025-05-11 19:14:33', NULL, 1),
(14, 'FALL25', 'Fall Flavors', 'Special discount on pumpkin and cinnamon treats', 'percentage', 12.00, 20.00, 35.00, '2025-09-15 00:00:00', '2025-11-15 23:59:59', 500, 1, NULL, '2025-05-11 19:14:33', '2025-05-11 19:14:33', NULL, 1),
(15, 'XMAS25', 'Christmas Joy', 'Holiday season special discounts', 'percentage', 25.00, 40.00, 100.00, '2025-12-01 00:00:00', '2025-12-25 23:59:59', 1000, 1, NULL, '2025-05-11 19:14:33', '2025-05-11 19:14:33', NULL, 1),
(16, 'JAN25', 'January Blues Buster', 'Start the year with sweet savings', 'fixed_amount', 5.00, 20.00, NULL, '2025-01-01 00:00:00', '2025-01-31 23:59:59', 200, 0, NULL, '2025-05-11 19:14:33', '2025-05-11 19:14:33', NULL, 1),
(17, 'FEB25', 'February Fudge Fest', 'Special discounts on all fudge products', 'percentage', 15.00, 25.00, 30.00, '2025-02-01 00:00:00', '2025-02-28 23:59:59', 250, 0, NULL, '2025-05-11 19:14:33', '2025-05-11 19:14:33', NULL, 1),
(18, 'MAR25', 'March Munchies', 'Spring into savings with our March special', 'fixed_amount', 7.50, 25.00, NULL, '2025-03-01 00:00:00', '2025-03-31 23:59:59', 300, 0, NULL, '2025-05-11 19:14:33', '2025-05-11 19:14:33', NULL, 1),
(19, 'APR25', 'April Showers', 'Sweet deals to brighten rainy days', 'percentage', 12.00, 20.00, 25.00, '2025-04-01 00:00:00', '2025-04-30 23:59:59', 300, 0, NULL, '2025-05-11 19:14:33', '2025-05-11 19:14:33', NULL, 1),
(20, 'MAY25', 'May Day Treats', 'Celebrate May with special discounts', 'fixed_amount', 6.00, 22.00, NULL, '2025-05-01 00:00:00', '2025-05-31 23:59:59', 350, 0, NULL, '2025-05-11 19:14:33', '2025-05-29 13:23:46', NULL, 1),
(21, 'JUN25', 'June Jubilee', 'Summer kickoff savings', 'percentage', 10.00, 15.00, 20.00, '2025-06-01 00:00:00', '2025-06-30 23:59:59', 400, 0, NULL, '2025-05-11 19:14:33', '2025-05-11 19:14:33', NULL, 1),
(22, 'JUL25', 'July Jamboree', 'Mid-summer sweet savings', 'fixed_amount', 8.00, 30.00, NULL, '2025-07-01 00:00:00', '2025-07-31 23:59:59', 450, 0, NULL, '2025-05-11 19:14:33', '2025-05-11 19:14:33', NULL, 1),
(23, 'AUG25', 'August Adventure', 'End of summer special deals', 'percentage', 18.00, 25.00, 40.00, '2025-08-01 00:00:00', '2025-08-31 23:59:59', 400, 0, NULL, '2025-05-11 19:14:33', '2025-05-11 19:14:33', NULL, 1),
(24, 'SEP25', 'September Sweets', 'Back to school special offers', 'fixed_amount', 5.50, 20.00, NULL, '2025-09-01 00:00:00', '2025-09-30 23:59:59', 350, 0, NULL, '2025-05-11 19:14:33', '2025-05-11 19:14:33', NULL, 1),
(25, 'OCT25', 'October Treats', 'Fall into savings this October', 'percentage', 13.00, 22.00, 30.00, '2025-10-01 00:00:00', '2025-10-31 23:59:59', 500, 0, NULL, '2025-05-11 19:14:33', '2025-05-11 19:14:33', NULL, 1),
(26, 'NOV25', 'November Nibbles', 'Pre-holiday season discounts', 'fixed_amount', 10.00, 35.00, 0.00, '2025-10-31 00:00:00', '2025-11-30 23:59:59', 600, 0, NULL, '2025-05-11 19:14:33', '2025-05-12 09:50:13', NULL, 1),
(27, 'DEC25', 'December Delights', 'Year-end special offers', 'percentage', 20.00, 30.00, 50.00, '2025-12-01 00:00:00', '2025-12-31 23:59:59', 700, 0, NULL, '2025-05-11 19:14:33', '2025-05-11 19:14:33', NULL, 1),
(28, 'BIRTHDAY25', 'Birthday Bash', 'Special discount for birthday celebrations', 'percentage', 25.00, 30.00, 50.00, '2025-01-01 00:00:00', '2025-12-31 23:59:59', NULL, 0, NULL, '2025-05-11 19:14:33', '2025-05-28 14:09:43', NULL, 1),
(29, 'ANNIV25', 'Anniversary Sweets', 'Celebrate your special day with our treats', 'fixed_amount', 15.00, 40.00, 0.00, '2024-12-30 00:00:00', '2025-12-31 23:59:59', 0, 1, NULL, '2025-05-11 19:14:33', '2025-05-12 11:25:31', NULL, 1),
(30, 'GRAD25', 'Graduation Goodies', 'Congratulate graduates with sweet discounts', 'percentage', 15.00, 25.00, 35.00, '2025-05-01 00:00:00', '2025-07-31 23:59:59', 500, 1, NULL, '2025-05-11 19:14:33', '2025-05-11 19:14:33', NULL, 1),
(31, 'NEWCHOC25', 'New Chocolate Collection', 'Try our new artisan chocolate collection', 'percentage', 30.00, 50.00, 75.00, '2025-02-10 00:00:00', '2025-03-10 23:59:59', 200, 0, NULL, '2025-05-11 19:14:33', '2025-05-11 19:14:33', NULL, 1),
(32, 'NEWCAKE25', 'Cake Innovation', 'Be the first to try our innovative cake flavors', 'fixed_amount', 12.00, 35.00, NULL, '2025-04-15 00:00:00', '2025-05-15 23:59:59', 150, 1, NULL, '2025-05-11 19:14:33', '2025-05-11 19:14:33', NULL, 1),
(33, 'NEWCANDY25', 'Candy Revolution', 'Experience our revolutionary candy collection', 'percentage', 25.00, 20.00, 30.00, '2025-08-01 00:00:00', '2025-09-01 23:59:59', 250, 0, NULL, '2025-05-11 19:14:33', '2025-05-11 19:14:33', NULL, 1),
(34, 'LOYAL25', 'Loyalty Rewards', 'Special discount for our loyal customers', 'percentage', 10.00, 0.00, 100.00, '2025-01-01 00:00:00', '2025-12-31 23:59:59', NULL, 1, NULL, '2025-05-11 19:14:33', '2025-05-11 19:14:33', NULL, 1),
(35, 'REFER25', 'Refer a Friend', 'Discount for referring new customers', 'fixed_amount', 10.00, 25.00, NULL, '2025-01-01 00:00:00', '2025-12-31 23:59:59', NULL, 1, NULL, '2025-05-11 19:14:33', '2025-05-11 19:14:33', NULL, 1),
(36, 'FIRSTORDER', 'First Order Special', 'Special discount for first-time customers', 'percentage', 20.00, 15.00, 30.00, '2025-01-01 00:00:00', '2025-12-31 23:59:59', NULL, 1, NULL, '2025-05-11 19:14:33', '2025-05-11 19:14:33', NULL, 1),
(37, 'WEEKEND25', 'Weekend Special', 'Special discounts every weekend', 'percentage', 15.00, 25.00, 40.00, '2025-01-01 00:00:00', '2025-12-31 23:59:59', NULL, 1, NULL, '2025-05-11 19:14:33', '2025-05-11 19:14:33', NULL, 1),
(38, 'SUNDAYFUN', 'Sunday Funday', 'Make your Sunday sweeter with special discounts', 'fixed_amount', 8.00, 20.00, NULL, '2025-01-01 00:00:00', '2025-12-31 23:59:59', NULL, 1, NULL, '2025-05-11 19:14:33', '2025-05-11 19:14:33', NULL, 1),
(39, 'FLASH0515', 'May Flash Sale', '24-hour flash sale with deep discounts', 'percentage', 40.00, 30.00, 100.00, '2025-05-15 00:00:00', '2025-05-15 23:59:59', 100, 1, NULL, '2025-05-11 19:14:33', '2025-05-11 19:14:33', NULL, 1),
(40, 'FLASH0704', 'Independence Day Flash', 'July 4th special flash sale', 'percentage', 35.00, 25.00, 75.00, '2025-07-04 00:00:00', '2025-07-04 23:59:59', 150, 0, NULL, '2025-05-11 19:14:33', '2025-05-11 19:14:33', NULL, 1),
(41, 'FLASH1111', 'Singles Day Flash', 'Special flash sale for Singles Day', 'percentage', 30.00, 20.00, 60.00, '2025-11-11 00:00:00', '2025-11-11 23:59:59', 200, 0, NULL, '2025-05-11 19:14:33', '2025-05-11 19:14:33', NULL, 1);

-- --------------------------------------------------------

--
-- Table structure for table `coupon_usage`
--

CREATE TABLE `coupon_usage` (
  `id` int(11) NOT NULL,
  `coupon_id` int(11) NOT NULL,
  `order_id` varchar(50) NOT NULL COMMENT 'Order where the coupon was applied',
  `user_id` int(11) DEFAULT NULL COMMENT 'User who used the coupon (if logged in)',
  `discount_amount` decimal(10,2) NOT NULL COMMENT 'Actual discount amount applied',
  `used_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `coupon_usage`
--

INSERT INTO `coupon_usage` (`id`, `coupon_id`, `order_id`, `user_id`, `discount_amount`, `used_at`) VALUES
(1, 30, 'RS202506063BD6', 1, 26.85, '2025-06-06 02:17:16'),
(2, 37, 'RS2025060660A0', 1, 26.85, '2025-06-06 02:35:37'),
(3, 30, 'RS20250606F390', 14, 35.00, '2025-06-06 03:21:27'),
(4, 37, 'RS202506064F0A', 14, 26.85, '2025-06-06 03:25:15'),
(5, 29, 'RS202506068BCD', 14, 15.00, '2025-06-06 03:44:37'),
(6, 36, 'RS202506067966', 1, 30.00, '2025-06-06 11:38:09'),
(7, 36, 'RS202506075DC9', 30, 30.00, '2025-06-07 08:38:52');

-- --------------------------------------------------------

--
-- Table structure for table `featured_items`
--

CREATE TABLE `featured_items` (
  `id` int(11) NOT NULL,
  `entity_id` int(11) NOT NULL COMMENT 'ID of the product or category',
  `display_type` enum('featured_product','featured_category','quick_pick') NOT NULL COMMENT 'Type of featured display',
  `display_order` int(11) NOT NULL DEFAULT 0 COMMENT 'Order in which to display the item',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `created_by` int(11) DEFAULT NULL,
  `updated_by` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `featured_items`
--

INSERT INTO `featured_items` (`id`, `entity_id`, `display_type`, `display_order`, `created_at`, `updated_at`, `created_by`, `updated_by`) VALUES
(15, 65, 'featured_product', 1, '2025-05-14 12:59:32', '2025-05-19 11:50:10', 1, NULL),
(16, 66, 'featured_product', 1, '2025-05-14 12:59:32', '2025-06-01 16:04:12', 1, NULL),
(17, 2, 'featured_category', 1, '2025-05-14 12:59:44', '2025-06-01 16:13:24', 1, NULL),
(18, 3, 'featured_category', 1, '2025-05-14 12:59:44', '2025-06-01 16:13:24', 1, NULL),
(19, 5, 'featured_category', 2, '2025-05-14 12:59:44', '2025-06-01 16:13:24', 1, NULL),
(21, 64, 'quick_pick', 1, '2025-05-14 13:00:05', '2025-06-01 17:15:47', 1, NULL),
(22, 65, 'quick_pick', 1, '2025-05-14 13:00:05', '2025-06-01 18:26:07', 1, NULL),
(23, 66, 'quick_pick', 1, '2025-05-14 13:00:05', '2025-06-01 18:26:07', 1, NULL),
(24, 67, 'quick_pick', 2, '2025-05-14 13:00:06', '2025-06-01 18:26:07', 1, NULL),
(25, 69, 'quick_pick', 3, '2025-05-14 13:00:06', '2025-06-01 18:26:07', 1, NULL),
(26, 70, 'quick_pick', 4, '2025-05-14 13:00:07', '2025-06-01 18:26:07', 1, NULL),
(27, 71, 'quick_pick', 5, '2025-05-14 13:00:07', '2025-06-01 18:26:07', 1, NULL),
(28, 73, 'quick_pick', 6, '2025-05-14 13:00:07', '2025-06-01 18:26:07', 1, NULL),
(29, 32, 'quick_pick', 7, '2025-05-14 13:08:37', '2025-06-01 18:26:07', 1, NULL),
(30, 29, 'quick_pick', 8, '2025-05-14 13:08:37', '2025-06-01 18:26:07', 1, NULL),
(31, 38, 'quick_pick', 9, '2025-05-14 13:08:37', '2025-06-01 18:26:07', 1, NULL),
(32, 39, 'quick_pick', 10, '2025-05-14 13:08:38', '2025-06-01 18:26:07', 1, NULL),
(33, 71, 'featured_product', 1, '2025-05-14 13:08:49', '2025-06-01 16:04:12', 1, NULL),
(34, 42, 'quick_pick', 11, '2025-05-16 14:14:17', '2025-06-01 18:26:07', 3, NULL),
(36, 68, 'featured_product', 2, '2025-06-01 17:15:28', '2025-06-01 17:15:28', 2, NULL),
(37, 68, 'quick_pick', 12, '2025-06-01 17:15:59', '2025-06-01 18:26:07', 2, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `orders`
--

CREATE TABLE `orders` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `order_number` varchar(50) NOT NULL COMMENT 'Human-readable order number (e.g., ORD-ABC12345)',
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `status` enum('placed','preparing','prepared','shipped','delivered','cancelled','refunded','returned') NOT NULL DEFAULT 'placed',
  `payment_status` enum('pending','paid','failed','refunded','partially_refunded') NOT NULL DEFAULT 'pending',
  `original_price` decimal(10,2) NOT NULL DEFAULT 0.00,
  `base_amount` decimal(10,2) NOT NULL DEFAULT 0.00 COMMENT 'Total base amount before taxes',
  `subtotal` decimal(10,2) NOT NULL DEFAULT 0.00 COMMENT 'Subtotal (base_amount + gst_amount)',
  `product_discount_amount` decimal(10,2) NOT NULL DEFAULT 0.00 COMMENT 'Total product discounts',
  `coupon_discount_amount` decimal(10,2) NOT NULL DEFAULT 0.00 COMMENT 'Coupon discount amount',
  `total_discount_amount` decimal(10,2) NOT NULL DEFAULT 0.00 COMMENT 'Total of all discounts',
  `shipping_charges` decimal(10,2) NOT NULL DEFAULT 0.00 COMMENT 'Shipping charges',
  `payment_charges` decimal(10,2) NOT NULL DEFAULT 0.00 COMMENT 'Payment processing charges (COD, etc.)',
  `roundoff` decimal(10,2) NOT NULL DEFAULT 0.00 COMMENT 'Roundoff amount',
  `final_total` decimal(10,2) NOT NULL DEFAULT 0.00 COMMENT 'Final payable amount',
  `coupon_id` bigint(20) UNSIGNED DEFAULT NULL,
  `tax_type` enum('igst','cgst_sgst') NOT NULL DEFAULT 'igst',
  `igst_amount` decimal(10,2) NOT NULL DEFAULT 0.00,
  `cgst_amount` decimal(10,2) NOT NULL DEFAULT 0.00,
  `sgst_amount` decimal(10,2) NOT NULL DEFAULT 0.00,
  `item_count` int(10) UNSIGNED NOT NULL DEFAULT 0 COMMENT 'Total number of different items',
  `total_quantity` int(10) UNSIGNED NOT NULL DEFAULT 0 COMMENT 'Total quantity of all items',
  `order_date` timestamp NOT NULL DEFAULT current_timestamp(),
  `confirmed_at` timestamp NULL DEFAULT NULL,
  `shipped_at` timestamp NULL DEFAULT NULL,
  `delivered_at` timestamp NULL DEFAULT NULL,
  `cancelled_at` timestamp NULL DEFAULT NULL,
  `created_by` bigint(20) UNSIGNED DEFAULT NULL COMMENT 'Admin who created/confirmed the order',
  `updated_by` bigint(20) UNSIGNED DEFAULT NULL COMMENT 'Admin who last updated the order',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `orders`
--

INSERT INTO `orders` (`id`, `order_number`, `user_id`, `status`, `payment_status`, `original_price`, `base_amount`, `subtotal`, `product_discount_amount`, `coupon_discount_amount`, `total_discount_amount`, `shipping_charges`, `payment_charges`, `roundoff`, `final_total`, `coupon_id`, `tax_type`, `igst_amount`, `cgst_amount`, `sgst_amount`, `item_count`, `total_quantity`, `order_date`, `confirmed_at`, `shipped_at`, `delivered_at`, `cancelled_at`, `created_by`, `updated_by`, `created_at`, `updated_at`) VALUES
(5, 'RS202506063A85', 1, 'preparing', 'pending', 199.00, 170.48, 179.00, 20.00, 0.00, 20.00, 50.00, 30.00, 0.00, 259.00, NULL, 'cgst_sgst', 0.00, 4.26, 4.26, 1, 1, '2025-06-06 02:16:19', NULL, NULL, NULL, NULL, NULL, 1, '2025-06-06 02:16:19', '2025-06-06 09:05:43'),
(6, 'RS202506063BD6', 1, 'delivered', 'paid', 199.00, 170.48, 179.00, 20.00, 26.85, 47.00, 50.00, 30.00, -0.15, 232.00, 30, 'cgst_sgst', 0.00, 4.26, 4.26, 1, 1, '2025-06-06 02:17:16', '2025-06-06 11:23:09', NULL, NULL, NULL, NULL, 1, '2025-06-06 02:17:16', '2025-06-08 12:29:51'),
(7, 'RS2025060660A0', 1, 'delivered', 'paid', 199.00, 170.48, 179.00, 20.00, 26.85, 47.00, 50.00, 0.00, -0.15, 202.00, 37, 'cgst_sgst', 0.00, 4.26, 4.26, 1, 1, '2025-06-06 02:35:37', '2025-06-06 09:34:33', NULL, NULL, NULL, NULL, 1, '2025-06-06 02:35:37', '2025-06-06 10:25:12'),
(8, 'RS20250606F8D3', 1, 'placed', 'partially_refunded', 199.00, 170.48, 179.00, 20.00, 0.00, 20.00, 50.00, 0.00, 0.00, 229.00, NULL, 'cgst_sgst', 0.00, 4.26, 4.26, 1, 1, '2025-06-06 02:46:15', NULL, NULL, NULL, NULL, NULL, 1, '2025-06-06 02:46:15', '2025-06-06 11:19:02'),
(9, 'RS20250606F390', 14, 'placed', 'refunded', 349.00, 313.33, 329.00, 20.00, 35.00, 55.00, 50.00, 0.00, 0.00, 344.00, 30, 'igst', 15.67, 0.00, 0.00, 1, 1, '2025-06-06 03:21:27', NULL, NULL, NULL, NULL, NULL, 1, '2025-06-06 03:21:27', '2025-06-06 11:07:38'),
(10, 'RS202506064F0A', 14, 'cancelled', 'pending', 199.00, 170.48, 179.00, 20.00, 26.85, 47.00, 50.00, 35.00, -0.15, 237.00, 37, 'igst', 8.52, 0.00, 0.00, 1, 1, '2025-06-06 03:25:15', NULL, NULL, NULL, '2025-06-06 11:22:36', NULL, 1, '2025-06-06 03:25:15', '2025-06-06 11:22:36'),
(11, 'RS20250606ED57', 14, 'placed', 'pending', 199.00, 170.48, 179.00, 20.00, 0.00, 20.00, 50.00, 35.00, 0.00, 264.00, NULL, 'igst', 8.52, 0.00, 0.00, 1, 1, '2025-06-06 03:28:20', NULL, NULL, NULL, NULL, NULL, NULL, '2025-06-06 03:28:20', '2025-06-06 03:28:20'),
(12, 'RS20250606F420', 14, 'placed', 'pending', 199.00, 170.48, 179.00, 20.00, 0.00, 20.00, 50.00, 35.00, 0.00, 264.00, NULL, 'igst', 8.52, 0.00, 0.00, 1, 1, '2025-06-06 03:33:07', NULL, NULL, NULL, NULL, NULL, NULL, '2025-06-06 03:33:07', '2025-06-06 03:33:07'),
(13, 'RS202506068BCD', 14, 'placed', 'pending', 199.00, 170.48, 179.00, 20.00, 15.00, 35.00, 50.00, 35.00, 0.00, 249.00, 29, 'igst', 8.52, 0.00, 0.00, 1, 1, '2025-06-06 03:44:37', NULL, NULL, NULL, NULL, NULL, NULL, '2025-06-06 03:44:37', '2025-06-06 03:44:37'),
(14, 'RS202506067966', 1, 'placed', 'pending', 5088.00, 4445.76, 4668.00, 420.00, 30.00, 450.00, 0.00, 35.00, 0.00, 4673.00, 36, 'cgst_sgst', 0.00, 111.12, 111.12, 4, 12, '2025-06-06 11:38:09', NULL, NULL, NULL, NULL, NULL, NULL, '2025-06-06 11:38:09', '2025-06-06 11:38:09'),
(15, 'RS202506075DC9', 30, 'delivered', 'paid', 2196.00, 1900.96, 1996.00, 200.00, 30.00, 230.00, 0.00, 35.00, 0.00, 2001.00, 36, 'cgst_sgst', 0.00, 47.52, 47.52, 1, 4, '2025-06-07 08:38:52', '2025-06-08 12:36:16', NULL, NULL, NULL, NULL, 1, '2025-06-07 08:38:52', '2025-06-08 12:36:46');

-- --------------------------------------------------------

--
-- Table structure for table `order_items`
--

CREATE TABLE `order_items` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `order_id` bigint(20) UNSIGNED NOT NULL,
  `product_id` bigint(20) UNSIGNED NOT NULL,
  `variant_id` bigint(20) UNSIGNED NOT NULL,
  `product_name` varchar(255) NOT NULL COMMENT 'Product name at time of order',
  `variant_name` varchar(255) NOT NULL COMMENT 'Variant name at time of order',
  `product_sku` varchar(100) DEFAULT NULL COMMENT 'SKU at time of order',
  `quantity` int(10) UNSIGNED NOT NULL,
  `original_price` decimal(10,2) NOT NULL COMMENT 'MRP at time of order',
  `selling_price` decimal(10,2) NOT NULL COMMENT 'Actual selling price (after product discount)',
  `discount_amount` decimal(10,2) NOT NULL DEFAULT 0.00 COMMENT 'Per unit discount amount',
  `tax_rate` decimal(5,2) NOT NULL COMMENT 'Tax rate applied',
  `base_price` decimal(10,2) NOT NULL COMMENT 'Price before tax per unit',
  `tax_amount` decimal(10,2) NOT NULL COMMENT 'Tax amount per unit',
  `line_base_amount` decimal(10,2) NOT NULL COMMENT 'Total base amount for this line',
  `line_tax_amount` decimal(10,2) NOT NULL COMMENT 'Total tax amount for this line',
  `line_discount_amount` decimal(10,2) NOT NULL DEFAULT 0.00 COMMENT 'Total discount for this line',
  `line_total` decimal(10,2) NOT NULL COMMENT 'Final line total',
  `product_image` varchar(500) DEFAULT NULL COMMENT 'Primary product image path',
  `product_weight` decimal(10,3) DEFAULT NULL COMMENT 'Product weight',
  `product_hsn_code` varchar(20) DEFAULT NULL COMMENT 'HSN code for tax compliance',
  `status` enum('placed','preparing','prepared','shipped','delivered','cancelled','refunded','returned') NOT NULL DEFAULT 'placed',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `order_items`
--

INSERT INTO `order_items` (`id`, `order_id`, `product_id`, `variant_id`, `product_name`, `variant_name`, `product_sku`, `quantity`, `original_price`, `selling_price`, `discount_amount`, `tax_rate`, `base_price`, `tax_amount`, `line_base_amount`, `line_tax_amount`, `line_discount_amount`, `line_total`, `product_image`, `product_weight`, `product_hsn_code`, `status`, `created_at`, `updated_at`) VALUES
(1, 5, 17, 49, 'Ghee Ladoo', 'Small 250g', 'GL-S', 1, 199.00, 179.00, 20.00, 5.00, 170.48, 8.52, 170.48, 8.52, 20.00, 179.00, 'uploads/product_images/1746994374_f0d6937f81169652.jpg', 250.000, '21069099', 'placed', '2025-06-06 02:16:19', '2025-06-06 02:40:59'),
(2, 6, 14, 40, 'Coconut Barfi', 'Small 250g', 'CB-S', 1, 199.00, 179.00, 20.00, 5.00, 170.48, 8.52, 170.48, 8.52, 20.00, 179.00, 'uploads/product_images/1746994284_cdb98aa5c58a366d.jpg', 250.000, '21069099', 'delivered', '2025-06-06 02:17:16', '2025-06-08 12:23:47'),
(3, 7, 17, 49, 'Ghee Ladoo', 'Small 250g', 'GL-S', 1, 199.00, 179.00, 20.00, 5.00, 170.48, 8.52, 170.48, 8.52, 20.00, 179.00, 'uploads/product_images/1746994374_f0d6937f81169652.jpg', 250.000, '21069099', 'delivered', '2025-06-06 02:35:37', '2025-06-06 10:25:12'),
(4, 8, 19, 55, 'Moong Dal Halwa', 'Small 250g', 'MDH-S', 1, 199.00, 179.00, 20.00, 5.00, 170.48, 8.52, 170.48, 8.52, 20.00, 179.00, 'uploads/product_images/1746994538_4d6d15c4743a8ca8.jpg', 250.000, '21069099', 'placed', '2025-06-06 02:46:15', '2025-06-06 02:46:15'),
(5, 9, 8, 23, 'Rabri', 'Medium 500g', 'RB-M', 1, 349.00, 329.00, 20.00, 5.00, 313.33, 15.67, 313.33, 15.67, 20.00, 329.00, 'uploads/product_images/f65a2dc2c44609a3c969195e58962288.jpg', 500.000, '457896', 'placed', '2025-06-06 03:21:27', '2025-06-06 03:21:27'),
(6, 10, 14, 40, 'Coconut Barfi', 'Small 250g', 'CB-S', 1, 199.00, 179.00, 20.00, 5.00, 170.48, 8.52, 170.48, 8.52, 20.00, 179.00, 'uploads/product_images/1746994284_cdb98aa5c58a366d.jpg', 250.000, '21069099', 'cancelled', '2025-06-06 03:25:15', '2025-06-06 11:22:36'),
(7, 11, 14, 40, 'Coconut Barfi', 'Small 250g', 'CB-S', 1, 199.00, 179.00, 20.00, 5.00, 170.48, 8.52, 170.48, 8.52, 20.00, 179.00, 'uploads/product_images/1746994284_cdb98aa5c58a366d.jpg', 250.000, '21069099', 'placed', '2025-06-06 03:28:20', '2025-06-06 03:28:20'),
(8, 12, 14, 40, 'Coconut Barfi', 'Small 250g', 'CB-S', 1, 199.00, 179.00, 20.00, 5.00, 170.48, 8.52, 170.48, 8.52, 20.00, 179.00, 'uploads/product_images/1746994284_cdb98aa5c58a366d.jpg', 250.000, '21069099', 'placed', '2025-06-06 03:33:07', '2025-06-06 03:33:07'),
(9, 13, 20, 58, 'Besan Ladoo', 'Small 250g', 'BL-S', 1, 199.00, 179.00, 20.00, 5.00, 170.48, 8.52, 170.48, 8.52, 20.00, 179.00, 'uploads/product_images/1746994586_14e722870edb56d2.jpg', 250.000, '21069099', 'placed', '2025-06-06 03:44:37', '2025-06-06 03:44:37'),
(10, 14, 14, 40, 'Coconut Barfi', 'Small 250g', 'CB-S', 3, 199.00, 179.00, 20.00, 5.00, 170.48, 8.52, 511.44, 25.56, 60.00, 537.00, 'uploads/product_images/1746994284_cdb98aa5c58a366d.jpg', 250.000, '21069099', 'placed', '2025-06-06 11:38:09', '2025-06-06 11:38:09'),
(11, 14, 14, 42, 'Coconut Barfi', 'Large 1kg', 'CB-L', 3, 649.00, 599.00, 50.00, 5.00, 570.48, 28.52, 1711.44, 85.56, 150.00, 1797.00, 'uploads/product_images/1746994284_cdb98aa5c58a366d.jpg', 1000.000, '21069099', 'placed', '2025-06-06 11:38:09', '2025-06-06 11:38:09'),
(12, 14, 17, 49, 'Ghee Ladoo', 'Small 250g', 'GL-S', 3, 199.00, 179.00, 20.00, 5.00, 170.48, 8.52, 511.44, 25.56, 60.00, 537.00, 'uploads/product_images/1746994374_f0d6937f81169652.jpg', 250.000, '21069099', 'placed', '2025-06-06 11:38:09', '2025-06-06 11:38:09'),
(13, 14, 17, 51, 'Ghee Ladoo', 'Large 1kg', 'GL-L', 3, 649.00, 599.00, 50.00, 5.00, 570.48, 28.52, 1711.44, 85.56, 150.00, 1797.00, 'uploads/product_images/1746994374_f0d6937f81169652.jpg', 1000.000, '21069099', 'placed', '2025-06-06 11:38:09', '2025-06-06 11:38:09'),
(14, 15, 1, 2, 'Kaju Katli', 'Medium 500g', 'KK-M', 4, 549.00, 499.00, 50.00, 5.00, 475.24, 23.76, 1900.96, 95.04, 200.00, 1996.00, 'uploads/product_images/acd7aa29a609eb8a79c4bdf11a066230.jpg', 500.000, '21069099', 'delivered', '2025-06-07 08:38:52', '2025-06-08 12:36:33');

-- --------------------------------------------------------

--
-- Table structure for table `order_shipping`
--

CREATE TABLE `order_shipping` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `order_id` bigint(20) UNSIGNED NOT NULL,
  `contact_name` varchar(150) NOT NULL,
  `contact_phone` varchar(20) NOT NULL,
  `address_line1` varchar(255) NOT NULL,
  `address_line2` varchar(255) DEFAULT NULL,
  `city` varchar(100) NOT NULL,
  `state` varchar(100) NOT NULL,
  `postal_code` varchar(20) NOT NULL,
  `country` varchar(100) NOT NULL DEFAULT 'India',
  `address_type` enum('home','work','other') DEFAULT 'other',
  `shipping_method` varchar(100) DEFAULT NULL COMMENT 'Standard, Express, etc.',
  `shipping_charges` decimal(10,2) NOT NULL DEFAULT 0.00,
  `is_free_shipping` tinyint(1) NOT NULL DEFAULT 0,
  `shipping_savings` decimal(10,2) NOT NULL DEFAULT 0.00 COMMENT 'Amount saved on shipping',
  `tracking_number` varchar(100) DEFAULT NULL,
  `tracking_url` varchar(255) DEFAULT NULL,
  `courier_partner` varchar(100) DEFAULT NULL COMMENT 'Delivery partner name',
  `estimated_delivery_date` date DEFAULT NULL,
  `actual_delivery_date` date DEFAULT NULL,
  `delivery_instructions` text DEFAULT NULL,
  `status` enum('pending','packed','shipped','out_for_delivery','delivered','failed','returned') NOT NULL DEFAULT 'pending',
  `packed_at` timestamp NULL DEFAULT NULL,
  `shipped_at` timestamp NULL DEFAULT NULL,
  `out_for_delivery_at` timestamp NULL DEFAULT NULL,
  `delivered_at` timestamp NULL DEFAULT NULL,
  `failed_at` timestamp NULL DEFAULT NULL,
  `returned_at` timestamp NULL DEFAULT NULL,
  `delivered_to` varchar(150) DEFAULT NULL COMMENT 'Name of person who received the order',
  `delivery_notes` text DEFAULT NULL COMMENT 'Special delivery notes or instructions',
  `delivery_image` varchar(500) DEFAULT NULL COMMENT 'Proof of delivery image',
  `return_reason` varchar(500) DEFAULT NULL,
  `return_status` enum('not_applicable','requested','approved','picked_up','completed','rejected') DEFAULT 'not_applicable',
  `return_tracking_number` varchar(100) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `order_shipping`
--

INSERT INTO `order_shipping` (`id`, `order_id`, `contact_name`, `contact_phone`, `address_line1`, `address_line2`, `city`, `state`, `postal_code`, `country`, `address_type`, `shipping_method`, `shipping_charges`, `is_free_shipping`, `shipping_savings`, `tracking_number`, `tracking_url`, `courier_partner`, `estimated_delivery_date`, `actual_delivery_date`, `delivery_instructions`, `status`, `packed_at`, `shipped_at`, `out_for_delivery_at`, `delivered_at`, `failed_at`, `returned_at`, `delivered_to`, `delivery_notes`, `delivery_image`, `return_reason`, `return_status`, `return_tracking_number`, `created_at`, `updated_at`) VALUES
(1, 5, 'Mohit lalwani', '7888261079', '302 bhola bhawani apartrment ,near arjun devji gurudwara ulhasnagar-2 Bhola Bhawani Apt', NULL, 'Ulhasnagar', 'Maharashtra', '421002', 'India', 'home', 'standard', 50.00, 0, 0.00, NULL, NULL, NULL, '2025-06-09', NULL, NULL, 'pending', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'not_applicable', NULL, '2025-06-06 02:16:19', '2025-06-06 02:16:19'),
(2, 6, 'Mohit lalwani', '7888261079', '302 bhola bhawani apartrment ,near arjun devji gurudwara ulhasnagar-2 Bhola Bhawani Apt', NULL, 'Ulhasnagar', 'Maharashtra', '421002', 'India', 'home', 'standard', 50.00, 0, 0.00, '5415132132', 'https://www.trackingmore.com/bluedart-tracking.html', 'Blue Dart', '2025-06-10', NULL, NULL, 'shipped', NULL, '2025-06-06 11:23:27', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'not_applicable', NULL, '2025-06-06 02:17:16', '2025-06-06 11:23:27'),
(3, 7, 'Mohit lalwani', '7888261079', '302 bhola bhawani apartrment ,near arjun devji gurudwara ulhasnagar-2 Bhola Bhawani Apt', NULL, 'Ulhasnagar', 'Maharashtra', '421002', 'India', 'home', 'standard', 50.00, 0, 0.00, '5645469876865', 'https://www.trackingmore.com/bluedart-tracking.html', 'Blue Dart', '2025-06-08', NULL, NULL, 'shipped', NULL, '2025-06-06 10:23:07', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'not_applicable', NULL, '2025-06-06 02:35:37', '2025-06-06 10:23:07'),
(4, 8, 'Mohit lalwani', '7888261079', '302 bhola bhawani apartrment ,near arjun devji gurudwara ulhasnagar-2 Bhola Bhawani Apt', NULL, 'Ulhasnagar', 'Maharashtra', '421002', 'India', 'home', 'standard', 50.00, 0, 0.00, NULL, NULL, NULL, '2025-06-09', NULL, NULL, 'pending', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'not_applicable', NULL, '2025-06-06 02:46:15', '2025-06-06 02:46:15'),
(5, 9, 'Mohit dilip lalwani', '7888261079', 'crazy systumm', NULL, 'pata nahi', 'Karnataka', '400001', 'India', 'home', 'standard', 50.00, 0, 0.00, NULL, NULL, NULL, '2025-06-09', NULL, NULL, 'pending', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'not_applicable', NULL, '2025-06-06 03:21:27', '2025-06-06 03:21:27'),
(6, 10, 'Mohit dilip lalwani', '7888261079', 'crazy systumm', NULL, 'pata nahi', 'Karnataka', '400001', 'India', 'home', 'standard', 50.00, 0, 0.00, NULL, NULL, NULL, '2025-06-09', NULL, NULL, 'pending', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'not_applicable', NULL, '2025-06-06 03:25:15', '2025-06-06 03:25:15'),
(7, 11, 'Mohit dilip lalwani', '7888261079', 'crazy systumm', NULL, 'pata nahi', 'Karnataka', '400001', 'India', 'home', 'standard', 50.00, 0, 0.00, NULL, NULL, NULL, '2025-06-09', NULL, NULL, 'pending', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'not_applicable', NULL, '2025-06-06 03:28:20', '2025-06-06 03:28:20'),
(8, 12, 'Mohit dilip lalwani', '7888261079', 'crazy systumm', NULL, 'pata nahi', 'Karnataka', '400001', 'India', 'home', 'standard', 50.00, 0, 0.00, NULL, NULL, NULL, '2025-06-09', NULL, NULL, 'pending', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'not_applicable', NULL, '2025-06-06 03:33:07', '2025-06-06 03:33:07'),
(9, 13, 'Mohit dilip lalwani', '7888261079', 'crazy systumm', NULL, 'pata nahi', 'Karnataka', '400001', 'India', 'home', 'standard', 50.00, 0, 0.00, NULL, NULL, NULL, '2025-06-09', NULL, NULL, 'pending', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'not_applicable', NULL, '2025-06-06 03:44:37', '2025-06-06 03:44:37'),
(10, 14, 'Mohit lalwani', '7888261079', '302 bhola bhawani apartrment ,near arjun devji gurudwara ulhasnagar-2 Bhola Bhawani Apt', NULL, 'Ulhasnagar', 'Maharashtra', '421002', 'India', 'home', 'standard', 0.00, 1, 50.00, NULL, NULL, NULL, '2025-06-09', NULL, NULL, 'pending', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'not_applicable', NULL, '2025-06-06 11:38:09', '2025-06-06 11:38:09'),
(11, 15, 'Mohit dilip lalwani', '7888261079', '302 bhola bhawani apartrment ,near arjun devji gurudwara ulhasnagar-2 Bhola Bhawani Apt', NULL, 'Ulhasnagar (M Corp.)', 'Maharashtra', '421002', 'India', 'home', 'standard', 0.00, 1, 50.00, '445465465', NULL, 'Blue Dart', '2025-06-11', NULL, NULL, 'shipped', NULL, '2025-06-08 12:36:31', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'not_applicable', NULL, '2025-06-07 08:38:52', '2025-06-08 12:36:31');

-- --------------------------------------------------------

--
-- Table structure for table `order_status_history`
--

CREATE TABLE `order_status_history` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `order_id` bigint(20) UNSIGNED NOT NULL,
  `status` varchar(50) NOT NULL,
  `notes` text DEFAULT NULL,
  `changed_by` bigint(20) UNSIGNED DEFAULT NULL,
  `is_admin` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `order_status_history`
--

INSERT INTO `order_status_history` (`id`, `order_id`, `status`, `notes`, `changed_by`, `is_admin`, `created_at`) VALUES
(5, 5, 'placed', 'Order placed by customer', 1, 0, '2025-06-06 02:16:19'),
(6, 6, 'placed', 'Order placed by customer', 1, 0, '2025-06-06 02:17:16'),
(7, 7, 'placed', 'Order placed by customer', 1, 0, '2025-06-06 02:35:37'),
(8, 8, 'placed', 'Order placed by customer', 1, 0, '2025-06-06 02:46:15'),
(9, 9, 'placed', 'Order placed by customer', 14, 0, '2025-06-06 03:21:27'),
(10, 10, 'placed', 'Order placed by customer', 14, 0, '2025-06-06 03:25:15'),
(11, 11, 'placed', 'Order placed by customer', 14, 0, '2025-06-06 03:28:20'),
(12, 12, 'placed', 'Order placed by customer', 14, 0, '2025-06-06 03:33:07'),
(13, 13, 'placed', 'Order placed by customer', 14, 0, '2025-06-06 03:44:37'),
(14, 5, 'preparing', 'haa meri jaan', 1, 1, '2025-06-06 09:05:43'),
(15, 7, 'preparing', 'systumm', 1, 1, '2025-06-06 09:34:33'),
(16, 7, 'prepared', 'readt to ship', 1, 1, '2025-06-06 09:35:18'),
(17, 7, 'shipped', 'systumm hai', 1, 1, '2025-06-06 10:23:07'),
(18, 7, 'delivered', 'delivered successfully', 1, 1, '2025-06-06 10:25:12'),
(19, 8, 'placed', 'Partial refund processed: ₹200. Total refunded: ₹200. sdbvjsdvsd', 1, 1, '2025-06-06 11:19:02'),
(20, 10, 'cancelled', 'cjsdvhi', 1, 1, '2025-06-06 11:22:36'),
(21, 6, 'preparing', NULL, 1, 1, '2025-06-06 11:23:09'),
(22, 6, 'prepared', NULL, 1, 1, '2025-06-06 11:23:11'),
(23, 6, 'shipped', NULL, 1, 1, '2025-06-06 11:23:27'),
(24, 14, 'placed', 'Order placed by customer', 1, 0, '2025-06-06 11:38:09'),
(25, 15, 'placed', 'Order placed by customer', 30, 0, '2025-06-07 08:38:52'),
(26, 6, 'delivered', NULL, 1, 1, '2025-06-08 12:23:47'),
(27, 15, 'preparing', NULL, 1, 1, '2025-06-08 12:36:16'),
(28, 15, 'prepared', NULL, 1, 1, '2025-06-08 12:36:18'),
(29, 15, 'shipped', NULL, 1, 1, '2025-06-08 12:36:31'),
(30, 15, 'delivered', NULL, 1, 1, '2025-06-08 12:36:33');

-- --------------------------------------------------------

--
-- Table structure for table `otps`
--

CREATE TABLE `otps` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED DEFAULT NULL,
  `phone_number` varchar(20) NOT NULL,
  `otp` varchar(6) NOT NULL,
  `type` enum('login','register') NOT NULL,
  `is_used` tinyint(1) NOT NULL DEFAULT 0,
  `status` enum('valid','invalid','used') NOT NULL DEFAULT 'valid',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `expires_at` timestamp NULL DEFAULT NULL,
  `used_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `otps`
--

INSERT INTO `otps` (`id`, `user_id`, `phone_number`, `otp`, `type`, `is_used`, `status`, `created_at`, `expires_at`, `used_at`) VALUES
(7, 1, '7888261079', '554242', 'login', 1, 'used', '2025-05-15 13:32:22', '2025-05-15 13:47:22', '2025-05-15 13:33:23'),
(8, 1, '7888261079', '012960', 'login', 0, 'invalid', '2025-05-15 14:33:35', '2025-05-15 14:48:35', NULL),
(9, NULL, '8805826364', '690780', 'register', 1, 'used', '2025-05-15 16:25:23', '2025-05-15 16:40:23', '2025-05-15 16:25:51'),
(10, NULL, '9563469462', '761134', 'register', 1, 'used', '2025-05-15 17:08:56', '2025-05-15 17:23:56', '2025-05-15 17:09:19'),
(11, 1, '7888261079', '918955', 'login', 1, 'used', '2025-05-15 20:25:55', '2025-05-15 20:40:55', '2025-05-15 20:26:59'),
(12, 3, '9563469462', '939179', 'login', 0, 'valid', '2025-05-15 20:49:49', '2025-05-15 21:04:49', NULL),
(13, NULL, '9335464646', '059078', 'register', 0, 'valid', '2025-05-15 20:50:56', '2025-05-15 21:05:56', NULL),
(14, 4, '9335445164', '086135', 'register', 0, 'valid', '2025-05-15 20:54:30', '2025-05-15 21:09:30', NULL),
(15, 5, '6516515165', '989754', 'register', 0, 'valid', '2025-05-15 21:02:20', '2025-05-15 21:04:20', NULL),
(16, 5, '6516515165', '364040', 'login', 1, 'used', '2025-05-15 21:03:36', '2025-05-15 21:05:36', '2025-05-15 21:04:04'),
(17, 6, '6514113213', '651296', 'register', 0, 'valid', '2025-05-15 21:04:23', '2025-05-15 21:06:23', NULL),
(18, 7, '6514153131', '255339', 'register', 0, 'valid', '2025-05-15 21:05:32', '2025-05-15 21:07:32', NULL),
(19, 8, '6556464654', '784818', 'register', 0, 'valid', '2025-05-15 21:05:55', '2025-05-15 21:07:55', NULL),
(20, 8, '6556464654', '374606', 'login', 0, 'valid', '2025-05-15 21:13:08', '2025-05-15 21:15:08', NULL),
(21, 1, '7888261079', '566802', 'login', 0, 'invalid', '2025-05-15 21:40:54', '2025-05-15 21:42:54', NULL),
(22, 1, '7888261079', '901196', 'login', 0, 'invalid', '2025-05-15 21:57:34', '2025-05-15 21:59:34', NULL),
(23, 1, '7888261079', '740072', 'login', 0, 'invalid', '2025-05-15 21:58:39', '2025-05-15 22:00:39', NULL),
(24, 9, '7888261056', '877520', 'register', 0, 'valid', '2025-05-15 22:02:41', '2025-05-15 22:04:41', NULL),
(25, 10, '7888261055', '684910', 'register', 0, 'valid', '2025-05-15 22:03:33', '2025-05-15 22:05:33', NULL),
(26, 10, '7888261055', '360270', 'login', 0, 'invalid', '2025-05-15 22:04:04', '2025-05-15 22:06:04', NULL),
(27, 10, '7888261055', '584454', 'login', 0, 'invalid', '2025-05-15 22:04:14', '2025-05-15 22:06:14', NULL),
(28, 1, '7888261079', '743868', 'login', 1, 'used', '2025-05-15 22:09:15', '2025-05-15 22:11:15', '2025-05-15 22:09:49'),
(29, 11, '7888261151', '932017', 'register', 1, 'used', '2025-05-15 22:11:42', '2025-05-15 22:13:42', '2025-05-15 22:12:14'),
(30, 1, '7888261079', '168619', 'login', 0, 'invalid', '2025-05-15 22:17:34', '2025-05-15 22:19:34', NULL),
(31, 1, '7888261079', '056011', 'login', 0, 'invalid', '2025-05-15 22:17:57', '2025-05-15 22:19:57', NULL),
(32, 1, '7888261079', '053781', 'login', 0, 'invalid', '2025-05-15 22:18:57', '2025-05-15 22:20:57', NULL),
(33, 1, '7888261079', '200980', 'login', 0, 'invalid', '2025-05-15 22:19:12', '2025-05-15 22:21:12', NULL),
(34, 1, '7888261079', '845277', 'login', 0, 'invalid', '2025-05-15 22:20:00', '2025-05-15 22:22:00', NULL),
(35, 1, '7888261079', '928628', 'login', 0, 'invalid', '2025-05-15 22:26:19', '2025-05-15 22:28:19', NULL),
(36, 1, '7888261079', '689712', 'login', 0, 'invalid', '2025-05-15 22:28:11', '2025-05-15 22:30:11', NULL),
(37, 1, '7888261079', '775930', 'login', 0, 'invalid', '2025-05-15 22:35:05', '2025-05-15 22:37:05', NULL),
(38, 1, '7888261079', '444721', 'login', 0, 'invalid', '2025-05-15 22:35:20', '2025-05-15 22:37:20', NULL),
(39, 1, '7888261079', '120946', 'login', 1, 'used', '2025-05-15 22:35:51', '2025-05-15 22:37:51', '2025-05-15 22:36:28'),
(40, 1, '7888261079', '825165', 'login', 0, 'invalid', '2025-05-15 22:37:04', '2025-05-15 22:39:04', NULL),
(41, 1, '7888261079', '454507', 'login', 0, 'invalid', '2025-05-15 22:39:26', '2025-05-15 22:41:26', NULL),
(42, 1, '7888261079', '307657', 'login', 0, 'invalid', '2025-05-15 22:39:45', '2025-05-15 22:41:45', NULL),
(43, 1, '7888261079', '439533', 'login', 0, 'invalid', '2025-05-15 22:43:27', '2025-05-15 22:45:27', NULL),
(44, 1, '7888261079', '373531', 'login', 0, 'invalid', '2025-05-15 22:48:30', '2025-05-15 22:50:30', NULL),
(45, 1, '7888261079', '079949', 'login', 0, 'invalid', '2025-05-15 22:50:37', '2025-05-15 22:52:37', NULL),
(46, 1, '7888261079', '627450', 'login', 0, 'invalid', '2025-05-15 22:50:44', '2025-05-15 22:52:44', NULL),
(47, 1, '7888261079', '338340', 'login', 0, 'invalid', '2025-05-15 22:50:57', '2025-05-15 22:52:57', NULL),
(48, 1, '7888261079', '079760', 'login', 1, 'used', '2025-05-15 22:50:59', '2025-05-15 22:52:59', '2025-05-15 22:51:32'),
(49, 1, '7888261079', '632983', 'login', 1, 'used', '2025-05-22 12:05:11', '2025-05-22 12:07:11', '2025-05-22 12:05:31'),
(50, 1, '7888261079', '924330', 'login', 1, 'used', '2025-05-22 12:34:45', '2025-05-22 12:36:45', '2025-05-22 12:35:00'),
(51, 1, '7888261079', '116753', 'login', 1, 'used', '2025-05-22 13:24:28', '2025-05-22 13:26:28', '2025-05-22 13:24:45'),
(52, 1, '7888261079', '842813', 'login', 1, 'used', '2025-05-22 13:30:41', '2025-05-22 13:32:41', '2025-05-22 13:30:53'),
(53, 1, '7888261079', '223325', 'login', 1, 'used', '2025-05-22 13:38:29', '2025-05-22 13:40:29', '2025-05-22 13:38:45'),
(54, 1, '7888261079', '230279', 'login', 1, 'used', '2025-05-22 14:02:23', '2025-05-22 14:04:23', '2025-05-22 14:02:44'),
(55, 12, '9022225525', '293654', 'register', 1, 'used', '2025-05-25 12:25:38', '2025-05-25 12:27:38', '2025-05-25 12:26:13'),
(56, 1, '7888261079', '946128', 'login', 1, 'used', '2025-05-27 00:22:48', '2025-05-27 00:24:48', '2025-05-27 00:22:58'),
(57, 1, '7888261079', '861763', 'login', 1, 'used', '2025-05-27 00:25:25', '2025-05-27 00:27:25', '2025-05-27 00:25:36'),
(58, 10, '7888261055', '052457', 'login', 1, 'used', '2025-05-27 00:28:19', '2025-05-27 00:30:19', '2025-05-27 00:28:37'),
(59, 13, '6515456465', '022102', 'register', 1, 'used', '2025-05-27 00:29:17', '2025-05-27 00:31:17', '2025-05-27 00:29:28'),
(60, 1, '7888261079', '814353', 'login', 1, 'used', '2025-05-27 00:33:52', '2025-05-27 00:35:52', '2025-05-27 00:34:09'),
(61, 14, '7888261908', '255116', 'register', 1, 'used', '2025-05-27 00:38:01', '2025-05-27 00:40:01', '2025-05-27 00:38:23'),
(62, 1, '7888261079', '760181', 'login', 1, 'used', '2025-05-27 00:40:53', '2025-05-27 00:42:53', '2025-05-27 00:41:06'),
(63, 1, '7888261079', '170326', 'login', 1, 'used', '2025-05-27 01:46:34', '2025-05-27 01:48:34', '2025-05-27 01:46:45'),
(64, 1, '7888261079', '610310', 'login', 1, 'used', '2025-05-27 02:41:50', '2025-05-27 02:43:50', '2025-05-27 02:42:24'),
(65, 1, '7888261079', '754854', 'login', 1, 'used', '2025-05-27 03:07:48', '2025-05-27 03:09:48', '2025-05-27 03:08:05'),
(66, 1, '7888261079', '117790', 'login', 1, 'used', '2025-05-27 03:16:06', '2025-05-27 03:18:06', '2025-05-27 03:16:13'),
(67, 1, '7888261079', '666837', 'login', 1, 'used', '2025-05-27 03:16:34', '2025-05-27 03:18:34', '2025-05-27 03:16:43'),
(68, 1, '7888261079', '094698', 'login', 1, 'used', '2025-05-27 04:57:32', '2025-05-27 04:59:32', '2025-05-27 04:57:46'),
(69, 15, '6546546565', '681581', 'register', 1, 'used', '2025-05-27 17:28:37', '2025-05-27 17:30:37', '2025-05-27 17:29:06'),
(70, 16, '6641653214', '911555', 'register', 1, 'used', '2025-05-27 17:30:50', '2025-05-27 17:32:50', '2025-05-27 17:31:02'),
(71, 17, '9132154654', '476450', 'register', 1, 'used', '2025-05-27 17:32:06', '2025-05-27 17:34:06', '2025-05-27 17:32:18'),
(72, 18, '6541231321', '453456', 'register', 1, 'used', '2025-05-27 17:36:35', '2025-05-27 17:38:35', '2025-05-27 17:36:53'),
(73, 19, '6564646871', '433853', 'register', 1, 'used', '2025-05-27 17:41:32', '2025-05-27 17:43:32', '2025-05-27 17:41:45'),
(74, 20, '6654541537', '487673', 'register', 1, 'used', '2025-05-27 17:44:56', '2025-05-27 17:46:56', '2025-05-27 17:45:07'),
(75, 20, '6654541537', '518061', 'login', 0, 'invalid', '2025-05-27 17:45:56', '2025-05-27 17:47:56', NULL),
(76, 21, '6541521546', '018583', 'register', 1, 'used', '2025-05-27 17:49:05', '2025-05-27 17:51:05', '2025-05-27 17:49:17'),
(77, 20, '6654541537', '859814', 'login', 1, 'used', '2025-05-27 17:49:47', '2025-05-27 17:51:47', '2025-05-27 17:50:02'),
(78, 22, '6651435468', '702592', 'register', 0, 'valid', '2025-05-27 20:49:46', '2025-05-27 20:51:46', NULL),
(79, 23, '6416546554', '689449', 'register', 0, 'valid', '2025-05-27 20:50:08', '2025-05-27 20:52:08', NULL),
(80, 24, '6544564165', '453891', 'register', 0, 'valid', '2025-05-27 20:54:38', '2025-05-27 20:56:38', NULL),
(81, 25, '6541574546', '184331', 'register', 0, 'valid', '2025-05-27 20:57:26', '2025-05-27 20:59:26', NULL),
(82, 26, '6415646546', '996811', 'register', 0, 'valid', '2025-05-27 21:00:16', '2025-05-27 21:02:16', NULL),
(83, 26, '6415646546', '891474', 'login', 0, 'invalid', '2025-05-27 21:01:30', '2025-05-27 21:03:30', NULL),
(84, 26, '6415646546', '487493', 'login', 0, 'valid', '2025-05-27 21:02:05', '2025-05-27 21:04:05', NULL),
(85, 20, '6654541537', '068259', 'login', 1, 'used', '2025-05-27 21:04:25', '2025-05-27 21:06:25', '2025-05-27 21:04:39'),
(86, 14, '7888261908', '635204', 'login', 1, 'used', '2025-05-27 21:18:43', '2025-05-27 21:20:43', '2025-05-27 21:18:56'),
(87, 1, '7888261079', '566099', 'login', 0, 'invalid', '2025-05-27 23:03:09', '2025-05-27 23:05:09', NULL),
(88, 20, '6654541537', '558788', 'login', 1, 'used', '2025-05-27 23:52:09', '2025-05-27 23:54:09', '2025-05-27 23:52:23'),
(89, 1, '7888261079', '300212', 'login', 1, 'used', '2025-05-28 12:58:47', '2025-05-28 13:00:47', '2025-05-28 12:59:22'),
(90, 14, '7888261908', '326953', 'login', 1, 'used', '2025-05-28 14:49:06', '2025-05-28 14:51:06', '2025-05-28 14:49:17'),
(91, 27, '6541652145', '759171', 'register', 1, 'used', '2025-05-29 00:23:42', '2025-05-29 00:25:42', '2025-05-29 00:24:02'),
(92, 1, '7888261079', '382953', 'login', 1, 'used', '2025-05-29 13:02:59', '2025-05-29 13:04:59', '2025-05-29 13:03:23'),
(93, 1, '7888261079', '568955', 'login', 1, 'used', '2025-05-29 13:08:25', '2025-05-29 13:10:25', '2025-05-29 13:08:38'),
(94, 28, '9527434103', '106747', 'register', 1, 'used', '2025-05-29 13:10:30', '2025-05-29 13:12:30', '2025-05-29 13:10:49'),
(95, 28, '9527434103', '729459', 'login', 1, 'used', '2025-05-29 13:14:52', '2025-05-29 13:16:52', '2025-05-29 13:15:10'),
(96, 28, '9527434103', '604799', 'login', 1, 'used', '2025-05-29 13:15:36', '2025-05-29 13:17:36', '2025-05-29 13:15:49'),
(97, 28, '9527434103', '344689', 'login', 1, 'used', '2025-05-29 13:16:53', '2025-05-29 13:18:53', '2025-05-29 13:17:06'),
(98, 28, '9527434103', '661397', 'login', 1, 'used', '2025-05-29 13:22:34', '2025-05-29 13:24:34', '2025-05-29 13:22:52'),
(99, 1, '7888261079', '998727', 'login', 1, 'used', '2025-05-30 15:40:17', '2025-05-30 15:42:17', '2025-05-30 15:40:33'),
(100, 1, '7888261079', '341870', 'login', 1, 'used', '2025-05-31 01:21:57', '2025-05-31 01:23:57', '2025-05-31 01:22:18'),
(101, 1, '7888261079', '474363', 'login', 0, 'invalid', '2025-05-31 01:24:52', '2025-05-31 01:26:52', NULL),
(102, 1, '7888261079', '025426', 'login', 1, 'used', '2025-05-31 03:06:14', '2025-05-31 03:08:14', '2025-05-31 03:06:42'),
(103, 1, '7888261079', '719826', 'login', 1, 'used', '2025-05-31 03:53:17', '2025-05-31 03:55:17', '2025-05-31 03:53:26'),
(104, 1, '7888261079', '903756', 'login', 1, 'used', '2025-06-05 10:56:43', '2025-06-05 10:58:43', '2025-06-05 10:56:57'),
(105, 29, '6213413213', '840261', 'register', 1, 'used', '2025-06-05 10:58:02', '2025-06-05 11:00:02', '2025-06-05 10:58:16'),
(106, 1, '7888261079', '001482', 'login', 1, 'used', '2025-06-05 11:12:32', '2025-06-05 11:14:32', '2025-06-05 11:12:41'),
(107, 1, '7888261079', '792620', 'login', 1, 'used', '2025-06-05 11:23:26', '2025-06-05 11:25:26', '2025-06-05 11:23:38'),
(108, 1, '7888261079', '092502', 'login', 1, 'used', '2025-06-05 21:48:45', '2025-06-05 21:50:45', '2025-06-05 21:49:03'),
(109, 1, '7888261079', '025489', 'login', 1, 'used', '2025-06-05 23:35:06', '2025-06-05 23:37:06', '2025-06-05 23:35:16'),
(110, 14, '7888261908', '237534', 'login', 1, 'used', '2025-06-06 02:49:23', '2025-06-06 02:51:23', '2025-06-06 02:49:31'),
(111, 1, '7888261079', '016849', 'login', 1, 'used', '2025-06-06 09:07:29', '2025-06-06 09:09:29', '2025-06-06 09:07:39'),
(112, 1, '7888261079', '136041', 'login', 1, 'used', '2025-06-06 10:03:46', '2025-06-06 10:05:46', '2025-06-06 10:03:58'),
(113, 30, '6546546546', '241112', 'register', 1, 'used', '2025-06-07 08:36:04', '2025-06-07 08:38:04', '2025-06-07 08:36:44'),
(114, 1, '7888261079', '771844', 'login', 1, 'used', '2025-06-07 08:46:27', '2025-06-07 08:48:27', '2025-06-07 08:46:35');

-- --------------------------------------------------------

--
-- Table structure for table `payments`
--

CREATE TABLE `payments` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `order_id` bigint(20) UNSIGNED NOT NULL,
  `payment_id` varchar(100) DEFAULT NULL COMMENT 'External payment gateway transaction ID',
  `payment_method` enum('cod','online') NOT NULL,
  `payment_gateway` varchar(50) DEFAULT NULL COMMENT 'Payment gateway used (razorpay, payu, etc.)',
  `amount` decimal(10,2) NOT NULL COMMENT 'Payment amount',
  `gateway_charges` decimal(10,2) NOT NULL DEFAULT 0.00 COMMENT 'Gateway processing charges',
  `status` enum('pending','processing','success','failed','cancelled','refunded') NOT NULL DEFAULT 'pending',
  `payment_received` tinyint(1) NOT NULL DEFAULT 0,
  `payment_received_at` timestamp NULL DEFAULT NULL,
  `gateway_response` text DEFAULT NULL COMMENT 'JSON response from payment gateway',
  `failure_reason` varchar(500) DEFAULT NULL COMMENT 'Reason for payment failure',
  `initiated_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `completed_at` timestamp NULL DEFAULT NULL,
  `failed_at` timestamp NULL DEFAULT NULL,
  `refund_amount` decimal(10,2) NOT NULL DEFAULT 0.00,
  `refund_reason` varchar(500) DEFAULT NULL,
  `refunded_at` timestamp NULL DEFAULT NULL,
  `refund_reference` varchar(100) DEFAULT NULL,
  `payment_details` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL COMMENT 'Additional payment gateway specific details' CHECK (json_valid(`payment_details`)),
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `payments`
--

INSERT INTO `payments` (`id`, `order_id`, `payment_id`, `payment_method`, `payment_gateway`, `amount`, `gateway_charges`, `status`, `payment_received`, `payment_received_at`, `gateway_response`, `failure_reason`, `initiated_at`, `completed_at`, `failed_at`, `refund_amount`, `refund_reason`, `refunded_at`, `refund_reference`, `payment_details`, `created_at`, `updated_at`) VALUES
(1, 5, NULL, 'cod', NULL, 259.00, 30.00, 'pending', 0, NULL, '{\"delivery_notes\":\"Please handle with care\",\"special_instructions\":\"\"}', NULL, '2025-06-06 02:16:19', NULL, NULL, 0.00, NULL, NULL, NULL, NULL, '2025-06-06 02:16:19', '2025-06-06 02:16:19'),
(2, 6, NULL, 'cod', NULL, 232.00, 30.00, 'success', 1, '2025-06-08 12:29:51', '{\"delivery_notes\":\"Please handle with care\",\"special_instructions\":\"\"}', NULL, '2025-06-06 02:17:16', NULL, NULL, 0.00, NULL, NULL, NULL, NULL, '2025-06-06 02:17:16', '2025-06-08 12:29:51'),
(3, 7, 'pay_1749177328148_un0nlvlr', 'online', 'razorpay', 202.00, 0.00, 'success', 1, '2025-06-06 02:35:37', '{\"delivery_notes\":\"Please handle with care\",\"payment_gateway\":\"dummy\",\"transaction_id\":\"txn_1749177337651_mcf0nllqt\"}', NULL, '2025-06-06 02:35:37', '2025-06-06 02:35:37', NULL, 0.00, NULL, NULL, NULL, NULL, '2025-06-06 02:35:37', '2025-06-06 02:35:37'),
(4, 8, 'pay_1749177969284_d551eyu9', 'online', 'razorpay', 229.00, 0.00, '', 1, '2025-06-06 02:46:15', '{\"delivery_notes\":\"Please handle with care\",\"payment_gateway\":\"dummy\",\"transaction_id\":\"txn_1749177975241_ixvmf21t4\"}', NULL, '2025-06-06 02:46:15', '2025-06-06 02:46:15', NULL, 200.00, 'Customer requested refund', '2025-06-06 11:19:02', NULL, NULL, '2025-06-06 02:46:15', '2025-06-06 11:19:02'),
(5, 9, 'pay_1749180078971_09m7g0a9', 'online', 'razorpay', 344.00, 0.00, 'refunded', 1, '2025-06-06 03:21:27', '{\"delivery_notes\":\"Please handle with care\",\"payment_gateway\":\"dummy\",\"transaction_id\":\"txn_1749180087698_cejwtpw1n\"}', NULL, '2025-06-06 03:21:27', '2025-06-06 03:21:27', NULL, 344.00, 'Customer requested refund', '2025-06-06 11:07:38', NULL, NULL, '2025-06-06 03:21:27', '2025-06-06 11:07:38'),
(6, 10, NULL, 'cod', NULL, 237.00, 35.00, 'pending', 0, NULL, '{\"delivery_notes\":\"Please handle with care\"}', NULL, '2025-06-06 03:25:15', NULL, NULL, 0.00, NULL, NULL, NULL, NULL, '2025-06-06 03:25:15', '2025-06-06 03:25:15'),
(7, 11, NULL, 'cod', NULL, 264.00, 35.00, 'pending', 0, NULL, '{\"delivery_notes\":\"Please handle with care\"}', NULL, '2025-06-06 03:28:20', NULL, NULL, 0.00, NULL, NULL, NULL, NULL, '2025-06-06 03:28:20', '2025-06-06 03:28:20'),
(8, 12, NULL, 'cod', NULL, 264.00, 35.00, 'pending', 0, NULL, '{\"delivery_notes\":\"Please handle with care\"}', NULL, '2025-06-06 03:33:07', NULL, NULL, 0.00, NULL, NULL, NULL, NULL, '2025-06-06 03:33:07', '2025-06-06 03:33:07'),
(9, 13, NULL, 'cod', NULL, 249.00, 35.00, 'pending', 0, NULL, '{\"delivery_notes\":\"Please handle with care\"}', NULL, '2025-06-06 03:44:37', NULL, NULL, 0.00, NULL, NULL, NULL, NULL, '2025-06-06 03:44:37', '2025-06-06 03:44:37'),
(10, 14, NULL, 'cod', NULL, 4673.00, 35.00, 'pending', 0, NULL, '{\"delivery_notes\":\"Please handle with care\"}', NULL, '2025-06-06 11:38:09', NULL, NULL, 0.00, NULL, NULL, NULL, NULL, '2025-06-06 11:38:09', '2025-06-06 11:38:09'),
(11, 15, NULL, 'cod', NULL, 2001.00, 35.00, 'success', 1, '2025-06-08 12:36:46', '{\"delivery_notes\":\"Please handle with care\"}', NULL, '2025-06-07 08:38:52', NULL, NULL, 0.00, NULL, NULL, NULL, NULL, '2025-06-07 08:38:52', '2025-06-08 12:36:46');

-- --------------------------------------------------------

--
-- Table structure for table `products`
--

CREATE TABLE `products` (
  `id` int(11) NOT NULL,
  `category_id` int(11) NOT NULL,
  `subcategory_id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `slug` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `short_description` varchar(500) DEFAULT NULL,
  `hsn_code` varchar(20) DEFAULT NULL COMMENT 'Harmonized System Nomenclature code for tax classification',
  `tax_rate` decimal(5,2) DEFAULT 0.00 COMMENT 'Tax rate percentage',
  `cgst_rate` decimal(5,2) DEFAULT 0.00 COMMENT 'Central GST rate',
  `sgst_rate` decimal(5,2) DEFAULT 0.00 COMMENT 'State GST rate',
  `igst_rate` decimal(5,2) DEFAULT 0.00 COMMENT 'Integrated GST rate',
  `status` enum('active','inactive','archived') NOT NULL DEFAULT 'inactive' COMMENT 'Product availability status',
  `display_order` int(11) NOT NULL DEFAULT 0 COMMENT 'Order for display in listings',
  `shelf_life` varchar(100) DEFAULT NULL COMMENT 'Product shelf life information',
  `ingredients` text DEFAULT NULL COMMENT 'JSON array of ingredients',
  `nutritional_info` text DEFAULT NULL COMMENT 'JSON object with nutritional values',
  `storage_instructions` text DEFAULT NULL COMMENT 'How to store the product',
  `is_vegetarian` tinyint(1) DEFAULT NULL COMMENT '1 for vegetarian, 0 for non-vegetarian, NULL if not applicable',
  `attributes` text DEFAULT NULL COMMENT 'JSON object with additional attributes',
  `meta_title` varchar(255) DEFAULT NULL COMMENT 'SEO meta title',
  `meta_description` text DEFAULT NULL COMMENT 'SEO meta description',
  `meta_keywords` text DEFAULT NULL COMMENT 'SEO meta keywords',
  `created_by` int(11) DEFAULT NULL COMMENT 'Admin who created the product',
  `updated_by` int(11) DEFAULT NULL COMMENT 'Admin who last updated the product',
  `deleted_by` int(11) DEFAULT NULL COMMENT 'Admin who deleted the product',
  `published_at` datetime DEFAULT NULL COMMENT 'When product was published',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT NULL ON UPDATE current_timestamp(),
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `products`
--

INSERT INTO `products` (`id`, `category_id`, `subcategory_id`, `name`, `slug`, `description`, `short_description`, `hsn_code`, `tax_rate`, `cgst_rate`, `sgst_rate`, `igst_rate`, `status`, `display_order`, `shelf_life`, `ingredients`, `nutritional_info`, `storage_instructions`, `is_vegetarian`, `attributes`, `meta_title`, `meta_description`, `meta_keywords`, `created_by`, `updated_by`, `deleted_by`, `published_at`, `created_at`, `updated_at`, `deleted_at`) VALUES
(1, 1, 2, 'Kaju Katli', 'kaju-katli', 'A classic Indian sweet made with premium cashews and sugar, flavored with cardamom.', 'A classic Indian sweet made with premium cashews and sugar, flavored with cardamom.', '21069099', 5.00, 2.50, 2.50, 5.00, 'active', 6, '30', '[\"Cashew nuts\",\"Sugar\",\"Cardamom\",\"Ghee\"]', '{\"calories\":\"545\",\"fat\":\"30\",\"carbohydrates\":\"58\",\"protein\":\"12\",\"sugar\":\"45\",\"sodium\":\"10\"}', 'Store in a cool, dry place.', 1, '{\"length\":\"\",\"width\":\"\",\"height\":\"\"}', '', '', '', 2, 1, NULL, NULL, '2025-05-09 12:33:27', '2025-06-07 08:38:52', NULL),
(2, 1, 1, 'Rasgulla', 'rasgulla', 'Soft cheese balls soaked in light sugar syrup with a hint of cardamom.', 'Soft cheese balls soaked in light sugar syrup with a hint of cardamom.', '21069099', 5.00, 2.50, 2.50, 5.00, 'active', 2, '30 days', '[\"Chhena (paneer)\",\"Sugar syrup\",\"Cardamom\"]', '{\"calories\":\"186\",\"fat\":\"4\",\"carbohydrates\":\"38\",\"protein\":\"4\",\"sugar\":\"35\",\"sodium\":\"25\"}', 'Store in a cool, dry place.', 1, NULL, '', '', '', 2, NULL, NULL, NULL, '2025-05-09 12:41:51', '2025-05-29 09:31:21', NULL),
(3, 1, 1, 'Soan Papdi', 'soan-papdi', 'Flaky, melt-in-the-mouth sweet made from gram flour, sugar and ghee.', 'Flaky, melt-in-the-mouth sweet made from gram flour, sugar and ghee.', '21069099', 5.00, 2.50, 2.50, 5.00, 'active', 2, '30 days', '[\"Gram flour\",\"Sugar\",\"Ghee\",\"Cardamom\"]', '{\"calories\":\"520\",\"fat\":\"25\",\"carbohydrates\":\"65\",\"protein\":\"10\",\"sugar\":\"55\",\"sodium\":\"15\"}', 'Store in a cool, dry place.', 1, NULL, '', '', '', 2, NULL, NULL, NULL, '2025-05-09 13:32:41', '2025-05-29 09:31:21', NULL),
(4, 1, 1, 'Kalakand', 'kalakand', 'Soft, moist Indian cake made from milk solids and sugar.', 'Soft, moist Indian cake made from milk solids and sugar.', '21069099', 5.00, 2.50, 2.50, 5.00, 'active', 1, '30 days', '[\"Milk\",\"Sugar\",\"Cardamom\"]', '{\"calories\":\"375\",\"fat\":\"15\",\"carbohydrates\":\"55\",\"protein\":\"10\",\"sugar\":\"50\",\"sodium\":\"30\"}', 'Store in cool and dry place', 1, NULL, '', '', '', 2, NULL, NULL, NULL, '2025-05-09 13:37:58', '2025-05-29 09:35:55', NULL),
(5, 1, 1, 'Motichoor Ladoo', 'motichoor-ladoo', 'Tiny gram-flour pearls cooked in ghee, shaped into laddoos with saffron.', 'Tiny gram-flour pearls cooked in ghee, shaped into laddoos with saffron.', '21069099', 5.00, 2.50, 2.50, 5.00, 'active', 1, '30 days', '[\"Gram flour\",\"Sugar\",\"Ghee\",\"Saffron\"]', '{\"calories\":\"410\",\"fat\":\"20\",\"carbohydrates\":\"58\",\"protein\":\"7\",\"sugar\":\"45\",\"sodium\":\"20\"}', 'Store in a cool, dry place.', 1, NULL, '', '', '', 2, NULL, NULL, NULL, '2025-05-09 13:53:25', '2025-05-29 12:47:06', NULL),
(6, 1, 2, 'Rasmalai', 'rasmalai', 'Soft paneer balls soaked in sweetened, thickened milk flavored with saffron.', 'Soft paneer balls soaked in sweetened, thickened milk flavored with saffron.', '21069099', 5.00, 2.50, 2.50, 5.00, 'active', 1, '30 days', '[\"Paneer balls\",\"Milk\",\"Sugar\",\"Cardamom\"]', '{\"calories\":\"280\",\"fat\":\"15\",\"carbohydrates\":\"30\",\"protein\":\"8\",\"sugar\":\"28\",\"sodium\":\"35\"}', 'Store in a cool, dry place.', 1, NULL, '', '', '', 2, NULL, NULL, NULL, '2025-05-09 14:01:19', '2025-05-29 09:35:55', NULL),
(7, 1, 2, 'Milk Cake', 'milk-cake', 'Dense, caramelized milk sweet with a hint of lemon sharpness.', 'Dense, caramelized milk sweet with a hint of lemon sharpness.', '456259', 5.00, 2.50, 2.50, 5.00, 'active', 2, '30 days', '[]', '{\"calories\":\"395\",\"fat\":\"18\",\"carbohydrates\":\"52\",\"protein\":\"9\",\"sugar\":\"48\",\"sodium\":\"40\"}', 'store in cool place', 1, '{\"length\":\"\",\"width\":\"\",\"height\":\"\"}', '', '', '', 2, 1, NULL, NULL, '2025-05-09 14:46:39', '2025-05-29 21:27:52', NULL),
(8, 1, 2, 'Rabri', 'rabri-1', 'Thickened sweetened milk layered with strands of malai and pistachios.', 'Thickened sweetened milk layered with strands of malai and pistachios.', '457896', 5.00, 2.50, 2.50, 5.00, 'active', 1, '30 days', '[]', '{\"calories\":\"310\",\"fat\":\"16\",\"carbohydrates\":\"35\",\"protein\":\"8\",\"sugar\":\"32\",\"sodium\":\"30\"}', '', 1, '{\"length\":\"\",\"width\":\"\",\"height\":\"\"}', '', '', '', 2, 2, NULL, NULL, '2025-05-09 14:49:54', '2025-05-29 21:33:39', NULL),
(9, 1, 2, 'Basundi', 'basundi', 'Creamy sweetened milk delicacy flavored with cardamom and nuts.', 'Creamy sweetened milk delicacy flavored with cardamom and nuts.', '1512656', 5.00, 2.50, 2.50, 5.00, 'active', 1, '30 days', '[]', '{\"calories\":\"290\",\"fat\":\"14\",\"carbohydrates\":\"36\",\"protein\":\"7\",\"sugar\":\"34\",\"sodium\":\"25\"}', '', 1, NULL, '', '', '', 2, NULL, NULL, NULL, '2025-05-09 14:53:18', '2025-05-29 21:35:50', NULL),
(10, 1, 2, 'Cham Cham', 'cham-cham', 'Soft chhena rolls soaked in light sugar syrup.', 'Soft chhena rolls soaked in light sugar syrup.', '154526', 5.00, 2.50, 2.50, 5.00, 'active', 1, '30 days', '[]', '{\"calories\":\"220\",\"fat\":\"5\",\"carbohydrates\":\"40\",\"protein\":\"5\",\"sugar\":\"38\",\"sodium\":\"20\"}', '', 1, NULL, '', '', '', 2, NULL, NULL, NULL, '2025-05-09 14:55:58', '2025-05-29 22:20:12', NULL),
(11, 1, 3, 'Kaju Roll', 'kaju-roll', 'Rolled cashew sweet dusted with silver leaf.', 'Rolled cashew sweet dusted with silver leaf.', '457896', 5.00, 2.50, 2.50, 5.00, 'active', 1, '30 days', '[]', '{\"calories\":\"550\",\"fat\":\"32\",\"carbohydrates\":\"55\",\"protein\":\"13\",\"sugar\":\"45\",\"sodium\":\"10\"}', '', 1, '{\"length\":\"\",\"width\":\"\",\"height\":\"\"}', '', '', '', 2, 2, NULL, NULL, '2025-05-09 14:59:08', '2025-05-29 23:04:57', NULL),
(12, 1, 3, 'Pista Burfi', 'pista-burfi', 'Soft, square pistachio fudge infused with cardamom.', 'Soft, square pistachio fudge infused with cardamom.', '458585', 5.00, 2.50, 2.50, 5.00, 'active', 1, '30 days', '[]', '{\"calories\":\"520\",\"fat\":\"28\",\"carbohydrates\":\"58\",\"protein\":\"14\",\"sugar\":\"45\",\"sodium\":\"15\"}', '', 1, NULL, '', '', '', 2, NULL, NULL, NULL, '2025-05-09 15:03:34', '2025-05-29 23:12:31', NULL),
(13, 1, 3, 'Badam Katli', 'badam-katli', 'Almond fudge slices garnished with silver leaf.', 'Almond fudge slices garnished with silver leaf.', '825564', 5.00, 2.50, 2.50, 5.00, 'active', 1, '30 days', '[]', '{\"calories\":\"530\",\"fat\":\"30\",\"carbohydrates\":\"55\",\"protein\":\"15\",\"sugar\":\"42\",\"sodium\":\"10\"}', '', 1, NULL, '', '', '', 2, NULL, NULL, NULL, '2025-05-09 15:07:18', '2025-05-30 23:49:17', NULL),
(14, 1, 3, 'Coconut Barfi', 'coconut-barfi', 'Sweet coconut squares made with fresh coconut and milk.', 'Sweet coconut squares made with fresh coconut and milk.', '21069099', 5.00, 2.50, 2.50, 5.00, 'active', 0, '30 days', '[\"Coconut\",\"Sugar\",\"Milk\"]', '{\"calories\":\"450\",\"fat\":\"25\",\"carbohydrates\":\"50\",\"protein\":\"5\",\"sugar\":\"45\",\"sodium\":\"15\"}', 'Store in a cool, dry place.', 1, '{\"length\":\"\",\"width\":\"\",\"height\":\"\"}', NULL, NULL, NULL, 2, 1, NULL, NULL, '2025-05-09 19:59:53', '2025-05-11 20:11:24', NULL),
(15, 1, 3, 'Cashew Dry Fruit Mix', 'cashew-dry-fruit-mix', 'A crunchy mix of cashews, almonds, pistachios and raisins.', 'A crunchy mix of cashews, almonds, pistachios and raisins.', '21069099', 5.00, 2.50, 2.50, 5.00, 'active', 1, '30 days', '[\"Cashews\",\"Raisins\",\"Almonds\",\"Pistachios\"]', '{\"calories\":\"580\",\"fat\":\"40\",\"carbohydrates\":\"40\",\"protein\":\"18\",\"sugar\":\"30\",\"sodium\":\"5\"}', 'Store in a cool, dry place.', 1, '{\"length\":\"\",\"width\":\"\",\"height\":\"\"}', NULL, NULL, NULL, 2, 1, NULL, NULL, '2025-05-09 19:59:53', '2025-05-30 17:08:03', NULL),
(16, 1, 4, 'Mysore Pak', 'mysore-pak', 'Melt-in-the-mouth squares made from gram flour and ghee.', 'Melt-in-the-mouth squares made from gram flour and ghee.', '21069099', 5.00, 2.50, 2.50, 5.00, 'active', 0, '30 days', '[\"Gram flour\",\"Sugar\",\"Ghee\"]', '{\"calories\":\"560\",\"fat\":\"35\",\"carbohydrates\":\"55\",\"protein\":\"8\",\"sugar\":\"45\",\"sodium\":\"20\"}', 'Store in a cool, dry place.', 1, '{\"length\":\"\",\"width\":\"\",\"height\":\"\"}', NULL, NULL, NULL, 2, 1, NULL, NULL, '2025-05-09 19:59:53', '2025-05-11 20:12:23', NULL),
(17, 1, 4, 'Ghee Ladoo', 'ghee-ladoo', 'Rich gram-flour laddoos cooked in pure ghee.', 'Rich gram-flour laddoos cooked in pure ghee.', '21069099', 5.00, 2.50, 2.50, 5.00, 'active', 0, '30 days', '[\"Gram flour\",\"Sugar\",\"Ghee\"]', '{\"calories\":\"520\",\"fat\":\"30\",\"carbohydrates\":\"55\",\"protein\":\"8\",\"sugar\":\"40\",\"sodium\":\"15\"}', 'Store in a cool, dry place.', 1, '{\"length\":\"\",\"width\":\"\",\"height\":\"\"}', NULL, NULL, NULL, 2, 1, NULL, NULL, '2025-05-09 19:59:53', '2025-05-11 20:12:54', NULL),
(18, 1, 4, 'Chana Dal Halwa', 'chana-dal-halwa', 'Sweet halwa made from split chickpeas, ghee and milk.', 'Sweet halwa made from split chickpeas, ghee and milk.', '21069099', 5.00, 2.50, 2.50, 5.00, 'active', 0, '30 days', '[\"Chana dal\",\"Sugar\",\"Ghee\",\"Milk\"]', '{\"calories\":\"480\",\"fat\":\"25\",\"carbohydrates\":\"55\",\"protein\":\"12\",\"sugar\":\"40\",\"sodium\":\"20\"}', 'Store in a cool, dry place.', 1, '{\"length\":\"\",\"width\":\"\",\"height\":\"\"}', NULL, NULL, NULL, 2, 1, NULL, NULL, '2025-05-09 19:59:53', '2025-05-11 20:14:43', NULL),
(19, 1, 4, 'Moong Dal Halwa', 'moong-dal-halwa', 'Rich lentil halwa made with moong dal, ghee and milk.', 'Rich lentil halwa made with moong dal, ghee and milk.', '21069099', 5.00, 2.50, 2.50, 5.00, 'active', 0, '30 days', '[\"Moong dal\",\"Sugar\",\"Ghee\",\"Milk\"]', '{\"calories\":\"490\",\"fat\":\"25\",\"carbohydrates\":\"58\",\"protein\":\"12\",\"sugar\":\"42\",\"sodium\":\"20\"}', 'Store in a cool, dry place.', 1, '{\"length\":\"\",\"width\":\"\",\"height\":\"\"}', NULL, NULL, NULL, 2, 1, NULL, NULL, '2025-05-09 19:59:53', '2025-05-11 20:15:38', NULL),
(20, 1, 4, 'Besan Ladoo', 'besan-ladoo', 'Laddoos made from roasted gram flour and pure ghee.', 'Laddoos made from roasted gram flour and pure ghee.', '21069099', 5.00, 2.50, 2.50, 5.00, 'active', 0, '30 days', '[\"Gram flour\",\"Sugar\",\"Ghee\"]', '{\"calories\":\"510\",\"fat\":\"28\",\"carbohydrates\":\"55\",\"protein\":\"10\",\"sugar\":\"42\",\"sodium\":\"15\"}', 'Store in a cool, dry place.', 1, '{\"length\":\"\",\"width\":\"\",\"height\":\"\"}', NULL, NULL, NULL, 2, 1, NULL, NULL, '2025-05-09 19:59:53', '2025-05-11 20:16:26', NULL),
(21, 1, 3, 'Sugar-Free Kaju Katli', 'sugar-free-kaju-katli', 'Diabetic-friendly cashew sweet made with sugar substitute.', 'Diabetic-friendly cashew sweet made with sugar substitute.', '21069099', 5.00, 2.50, 2.50, 5.00, 'active', 0, '30 days', '[\"Cashew nuts\",\"Sugar substitute\",\"Cardamom\"]', '{\"calories\":\"450\",\"fat\":\"30\",\"carbohydrates\":\"35\",\"protein\":\"12\",\"sugar\":\"2\",\"sodium\":\"10\"}', 'Store in a cool, dry place.', 1, '{\"length\":\"\",\"width\":\"\",\"height\":\"\"}', NULL, NULL, NULL, 2, 1, NULL, NULL, '2025-05-09 19:59:53', '2025-05-11 20:17:10', NULL),
(22, 1, 3, 'Sugar-Free Peda', 'sugar-free-peda', 'Soft milk-solid sweet made with sugar substitute.', 'Soft milk-solid sweet made with sugar substitute.', '21069099', 5.00, 2.50, 2.50, 5.00, 'active', 0, '30 days', '[\"Milk solids\",\"Sugar substitute\",\"Cardamom\"]', '{\"calories\":\"320\",\"fat\":\"15\",\"carbohydrates\":\"30\",\"protein\":\"10\",\"sugar\":\"3\",\"sodium\":\"25\"}', 'Store in a cool, dry place.', 1, '{\"length\":\"\",\"width\":\"\",\"height\":\"\"}', NULL, NULL, NULL, 2, 1, NULL, NULL, '2025-05-09 19:59:53', '2025-05-11 20:17:48', NULL),
(23, 1, 2, 'Sandesh', 'sandesh', 'Delicate chhena sweet flavored lightly with cardamom.', 'Delicate chhena sweet flavored lightly with cardamom.', '21069099', 5.00, 2.50, 2.50, 5.00, 'active', 0, '30 days', '[\"Chhena\",\"Sugar\",\"Cardamom\"]', '{\"calories\":\"280\",\"fat\":\"10\",\"carbohydrates\":\"40\",\"protein\":\"10\",\"sugar\":\"35\",\"sodium\":\"30\"}', 'Store in a cool, dry place.', 1, '{\"length\":\"\",\"width\":\"\",\"height\":\"\"}', NULL, NULL, NULL, 2, 1, NULL, NULL, '2025-05-09 19:59:53', '2025-05-11 20:18:22', NULL),
(24, 1, 2, 'Malai Cham Cham', 'malai-cham-cham', 'Soft glow-colored chhena rolls in malai.', 'Soft glow-colored chhena rolls in malai.', '21069099', 5.00, 2.50, 2.50, 5.00, 'active', 0, '30 days', '[\"Chhena\",\"Sugar\",\"Malai\"]', '{\"calories\":\"250\",\"fat\":\"8\",\"carbohydrates\":\"40\",\"protein\":\"6\",\"sugar\":\"38\",\"sodium\":\"25\"}', 'Store in a cool, dry place.', 1, '{\"length\":\"\",\"width\":\"\",\"height\":\"\"}', NULL, NULL, NULL, 2, 1, NULL, NULL, '2025-05-09 19:59:53', '2025-05-11 20:19:22', NULL),
(25, 1, 1, 'Gujiya', 'gujiya', 'Deep-fried crescent dumplings filled with sweet khoya and nuts.', 'Deep-fried crescent dumplings filled with sweet khoya and nuts.', '21069099', 5.00, 2.50, 2.50, 5.00, 'active', 0, '30 days', '[\"Maida flour\",\"Khoya\",\"Sugar\",\"Dry fruits\"]', '{\"calories\":\"450\",\"fat\":\"25\",\"carbohydrates\":\"55\",\"protein\":\"8\",\"sugar\":\"40\",\"sodium\":\"20\"}', 'Store in a cool, dry place.', 1, '{\"length\":\"\",\"width\":\"\",\"height\":\"\"}', NULL, NULL, NULL, 2, 1, NULL, NULL, '2025-05-09 19:59:53', '2025-05-11 20:20:15', NULL),
(26, 2, 5, 'Chocolate Truffle Cake', 'chocolate-truffle-cake', 'Rich chocolate cake layered with ganache and cream.', 'Rich chocolate cake layered with ganache and cream.', '19059090', 18.00, 9.00, 9.00, 18.00, 'active', 0, '3 days', '[\"Flour\",\"Cocoa powder\",\"Sugar\",\"Eggs\",\"Butter\",\"Cream\"]', '{\"calories\":\"380\",\"fat\":\"22\",\"carbohydrates\":\"42\",\"protein\":\"5\",\"sugar\":\"35\",\"sodium\":\"150\"}', 'Keep refrigerated.', 1, '{\"length\":\"\",\"width\":\"\",\"height\":\"\"}', NULL, NULL, NULL, 2, 1, NULL, NULL, '2025-05-09 19:59:53', '2025-05-11 20:10:33', NULL),
(27, 2, 5, 'Butterscotch Cake', 'butterscotch-cake', 'Moist butter cake with butterscotch chips and cream.', 'Moist butter cake with butterscotch chips and cream.', '19059090', 18.00, 9.00, 9.00, 18.00, 'active', 0, '3 days', '[\"Flour\",\"Sugar\",\"Eggs\",\"Butter\",\"Butterscotch chips\"]', '{\"calories\":\"370\",\"fat\":\"20\",\"carbohydrates\":\"45\",\"protein\":\"5\",\"sugar\":\"38\",\"sodium\":\"160\"}', 'Keep refrigerated.', 1, '{\"length\":\"\",\"width\":\"\",\"height\":\"\"}', NULL, NULL, NULL, 2, 1, NULL, NULL, '2025-05-09 19:59:53', '2025-05-11 20:09:52', NULL),
(28, 2, 6, 'Red Velvet Cake', 'red-velvet-cake', 'Soft cocoa cake tinted red, layered with cream cheese frosting.', 'Soft cocoa cake tinted red, layered with cream cheese frosting.', '19059090', 18.00, 9.00, 9.00, 18.00, 'active', 0, '3 days', '[\"Flour\",\"Cocoa powder\",\"Beetroot extract\",\"Sugar\",\"Eggs\",\"Cream cheese\"]', '{\"calories\":\"385\",\"fat\":\"21\",\"carbohydrates\":\"46\",\"protein\":\"5\",\"sugar\":\"38\",\"sodium\":\"170\"}', 'Keep refrigerated.', 1, '{\"length\":\"\",\"width\":\"\",\"height\":\"\"}', NULL, NULL, NULL, 2, 1, NULL, NULL, '2025-05-09 19:59:53', '2025-05-11 20:09:21', NULL),
(29, 2, 6, 'Mango Mousse Cake', 'mango-mousse-cake', 'Light sponge cake layered with mango mousse.', 'Light sponge cake layered with mango mousse.', '19059090', 18.00, 9.00, 9.00, 18.00, 'active', 0, '3 days', '[\"Flour\",\"Mango puree\",\"Sugar\",\"Eggs\",\"Cream\"]', '{\"calories\":\"320\",\"fat\":\"18\",\"carbohydrates\":\"40\",\"protein\":\"4\",\"sugar\":\"35\",\"sodium\":\"120\"}', 'Keep refrigerated.', 1, '{\"length\":\"\",\"width\":\"\",\"height\":\"\"}', NULL, NULL, NULL, 2, 1, NULL, NULL, '2025-05-09 19:59:53', '2025-05-11 20:08:48', NULL),
(32, 3, 10, 'Dry Fruit Gift Box', 'dry-fruit-gift-box', 'Assorted premium dry fruits in a gift box.', 'Assorted premium dry fruits in a gift box.', '08029000', 5.00, 2.50, 2.50, 5.00, 'active', 0, '6 months', '[\"Assorted dry fruits\"]', '{\"calories\":\"550\",\"fat\":\"35\",\"carbohydrates\":\"45\",\"protein\":\"15\",\"sugar\":\"40\",\"sodium\":\"5\"}', 'Store in a cool, dry place.', 1, '{\"length\":\"\",\"width\":\"\",\"height\":\"\"}', NULL, NULL, NULL, 2, 1, NULL, NULL, '2025-05-09 19:59:53', '2025-05-11 20:08:17', NULL),
(38, 5, 14, 'Diwali Deluxe Hamper', 'diwali-deluxe-hamper', 'Luxurious hamper of sweets, dry fruits and snacks for Diwali.', 'Luxurious hamper of sweets, dry fruits and snacks for Diwali.', '21069099', 18.00, 9.00, 9.00, 18.00, 'active', 0, '45 days', '[\"Assorted sweets\",\"dry fruits\",\"snacks\"]', '{\"calories\":\"480\",\"fat\":\"25\",\"carbohydrates\":\"55\",\"protein\":\"12\",\"sugar\":\"35\",\"sodium\":\"150\"}', 'Keep in original packaging in a dry place.', 1, '{\"length\":\"\",\"width\":\"\",\"height\":\"\"}', NULL, NULL, NULL, 2, 1, NULL, NULL, '2025-05-09 19:59:53', '2025-05-11 20:07:47', NULL),
(39, 5, 14, 'Holi Celebration Hamper', 'holi-celebration-hamper', 'Colorful hamper of sweets, dry fruits and snacks for Holi.', 'Colorful hamper of sweets, dry fruits and snacks for Holi.', '21069099', 18.00, 9.00, 9.00, 18.00, 'active', 0, '45 days', '[\"Assorted sweets\",\"dry fruits\",\"snacks\"]', '{\"calories\":\"470\",\"fat\":\"24\",\"carbohydrates\":\"56\",\"protein\":\"11\",\"sugar\":\"38\",\"sodium\":\"140\"}', 'Keep in original packaging in a dry place.', 1, '{\"length\":\"\",\"width\":\"\",\"height\":\"\"}', NULL, NULL, NULL, 2, 1, NULL, NULL, '2025-05-09 19:59:53', '2025-05-11 20:07:07', NULL),
(40, 5, 15, 'Premium Office Gift Box', 'premium-office-gift-box', 'Elegant assortment of sweets, dry fruits and snacks for corporate gifting.', 'Elegant assortment of sweets, dry fruits and snacks for corporate gifting.', '21069099', 18.00, 9.00, 9.00, 18.00, 'active', 0, '45 days', '[\"Assorted sweets\",\"dry fruits\",\"snacks\"]', '{\"calories\":\"490\",\"fat\":\"28\",\"carbohydrates\":\"52\",\"protein\":\"14\",\"sugar\":\"30\",\"sodium\":\"120\"}', 'Keep in original packaging in a dry place.', 1, '{\"length\":\"\",\"width\":\"\",\"height\":\"\"}', NULL, NULL, NULL, 2, 1, NULL, NULL, '2025-05-09 19:59:53', '2025-05-11 20:06:27', NULL),
(42, 1, 1, 'Jalebi', 'jalebi', 'Crispy, pretzel-shaped sweets made from fermented batter, deep-fried and soaked in sugar syrup.', 'Crispy, pretzel-shaped sweets made from fermented batter, deep-fried and soaked in sugar syrup.', '21069099', 5.00, 2.50, 2.50, 5.00, 'active', 0, '3 days', '[\"All-purpose flour\",\"Yogurt\",\"Sugar\",\"Saffron\"]', '{\"calories\":\"350\",\"fat\":\"15\",\"carbohydrates\":\"60\",\"protein\":\"3\",\"sugar\":\"55\",\"sodium\":\"15\"}', 'Best consumed fresh. Store in airtight container.', 1, '{\"length\":\"\",\"width\":\"\",\"height\":\"\"}', NULL, NULL, NULL, 2, 1, NULL, NULL, '2025-05-09 20:11:47', '2025-05-09 22:19:35', NULL),
(43, 1, 2, 'Kesar Peda', 'kesar-peda', 'Soft milk fudge flavored with saffron and cardamom.', 'Soft milk fudge flavored with saffron and cardamom.', '21069099', 5.00, 2.50, 2.50, 5.00, 'active', 0, '15 days', '[\"Milk solids\",\"Sugar\",\"Saffron\",\"Cardamom\"]', '{\"calories\":\"390\",\"fat\":\"18\",\"carbohydrates\":\"50\",\"protein\":\"8\",\"sugar\":\"45\",\"sodium\":\"25\"}', 'Store in a cool, dry place.', 1, '{\"length\":\"\",\"width\":\"\",\"height\":\"\"}', NULL, NULL, NULL, 2, 1, NULL, NULL, '2025-05-09 20:11:47', '2025-05-09 21:54:06', NULL),
(44, 1, 3, 'Anjeer Barfi', 'anjeer-barfi', 'Rich fig fudge made with dried figs, milk, and nuts.', 'Rich fig fudge made with dried figs, milk, and nuts.', '21069099', 5.00, 2.50, 2.50, 5.00, 'active', 0, '15 days', '[\"Dried figs\",\"Milk\",\"Sugar\",\"Nuts\"]', '{\"calories\":\"420\",\"fat\":\"15\",\"carbohydrates\":\"65\",\"protein\":\"8\",\"sugar\":\"60\",\"sodium\":\"10\"}', 'Store in a cool, dry place.', 1, '{\"length\":\"\",\"width\":\"\",\"height\":\"\"}', NULL, NULL, NULL, 2, 1, NULL, NULL, '2025-05-09 20:11:47', '2025-05-09 21:53:38', NULL),
(45, 1, 3, 'Mango Burfi', 'mango-burfi', 'Sweet fudge made with fresh mango pulp and milk solids.', 'Sweet fudge made with fresh mango pulp and milk solids.', '21069099', 5.00, 2.50, 2.50, 5.00, 'active', 0, '15 days', '[\"Mango pulp\",\"Milk solids\",\"Sugar\",\"Cardamom\"]', '{\"calories\":\"380\",\"fat\":\"15\",\"carbohydrates\":\"60\",\"protein\":\"7\",\"sugar\":\"55\",\"sodium\":\"15\"}', 'Store in a cool, dry place.', 1, '{\"length\":\"\",\"width\":\"\",\"height\":\"\"}', NULL, NULL, NULL, 2, 1, NULL, NULL, '2025-05-09 20:11:47', '2025-05-09 21:53:07', NULL),
(46, 1, 4, 'Gajar Halwa', 'gajar-halwa', 'Traditional carrot pudding made with grated carrots, milk, ghee, and nuts.', 'Traditional carrot pudding made with grated carrots, milk, ghee, and nuts.', '21069099', 5.00, 2.50, 2.50, 5.00, 'active', 0, '7 days', '[\"Carrots\",\"Milk\",\"Sugar\",\"Ghee\",\"Nuts\"]', '{\"calories\":\"350\",\"fat\":\"15\",\"carbohydrates\":\"50\",\"protein\":\"5\",\"sugar\":\"45\",\"sodium\":\"30\"}', 'Refrigerate and consume within 7 days.', 1, '{\"length\":\"\",\"width\":\"\",\"height\":\"\"}', NULL, NULL, NULL, 2, 1, NULL, NULL, '2025-05-09 20:11:47', '2025-05-09 21:52:35', NULL),
(47, 2, 5, 'Pineapple Cake', 'pineapple-cake', 'Soft vanilla sponge cake with pineapple chunks and cream frosting.', 'Soft vanilla sponge cake with pineapple chunks and cream frosting.', '19059090', 18.00, 9.00, 9.00, 18.00, 'active', 0, '3 days', '[\"Flour\",\"Sugar\",\"Eggs\",\"Pineapple\",\"Cream\"]', '{\"calories\":\"350\",\"fat\":\"15\",\"carbohydrates\":\"50\",\"protein\":\"5\",\"sugar\":\"40\",\"sodium\":\"150\"}', 'Keep refrigerated.', 1, '{\"length\":\"\",\"width\":\"\",\"height\":\"\"}', NULL, NULL, NULL, 2, 1, NULL, NULL, '2025-05-09 20:11:47', '2025-05-09 21:51:54', NULL),
(48, 2, 5, 'Black Forest Cake', 'black-forest-cake', 'Chocolate sponge cake with cherry filling and whipped cream frosting.', 'Chocolate sponge cake with cherry filling and whipped cream frosting.', '19059090', 18.00, 9.00, 9.00, 18.00, 'active', 0, '3 days', '[\"Flour\",\"Cocoa powder\",\"Sugar\",\"Eggs\",\"Cherries\",\"Cream\"]', '{\"calories\":\"370\",\"fat\":\"18\",\"carbohydrates\":\"48\",\"protein\":\"5\",\"sugar\":\"40\",\"sodium\":\"160\"}', 'Keep refrigerated.', 1, '{\"length\":\"\",\"width\":\"\",\"height\":\"\"}', NULL, NULL, NULL, 2, 1, NULL, NULL, '2025-05-09 20:11:47', '2025-05-09 21:50:44', NULL),
(49, 2, 7, 'Fruit Cake', 'fruit-cake', 'Dense cake filled with dried fruits and nuts, perfect for gifting.', 'Dense cake filled with dried fruits and nuts, perfect for gifting.', '19059090', 18.00, 9.00, 9.00, 18.00, 'active', 0, '15 days', '[\"Flour\",\"Sugar\",\"Butter\",\"Eggs\",\"Mixed dried fruits\",\"Nuts\"]', '{\"calories\":\"380\",\"fat\":\"15\",\"carbohydrates\":\"60\",\"protein\":\"6\",\"sugar\":\"45\",\"sodium\":\"140\"}', 'Store in a cool, dry place.', 0, '{\"length\":\"\",\"width\":\"\",\"height\":\"\"}', NULL, NULL, NULL, 2, 1, NULL, NULL, '2025-05-09 20:11:47', '2025-05-14 02:32:43', NULL),
(50, 2, 6, 'Number Cake', 'number-cake', 'Customized cake shaped as numbers for birthdays and anniversaries.', 'Customized cake shaped as numbers for birthdays and anniversaries.', '19059090', 18.00, 9.00, 9.00, 18.00, 'active', 0, '3 days', '[\"Flour\",\"Sugar\",\"Butter\",\"Eggs\",\"Cream\",\"Fondant\"]', '{\"calories\":\"360\",\"fat\":\"16\",\"carbohydrates\":\"52\",\"protein\":\"5\",\"sugar\":\"42\",\"sodium\":\"150\"}', 'Keep refrigerated.', 1, '{\"length\":\"\",\"width\":\"\",\"height\":\"\"}', NULL, NULL, NULL, 2, 1, NULL, NULL, '2025-05-09 20:11:47', '2025-05-14 02:33:51', NULL),
(51, 3, 9, 'Cashew Butter', 'cashew-butter', 'Creamy cashew spread made from roasted cashews.', 'Creamy cashew spread made from roasted cashews.', '20081990', 5.00, 2.50, 2.50, 5.00, 'active', 0, '6 months', '[\"Roasted cashews\"]', '{\"calories\":\"600\",\"fat\":\"50\",\"carbohydrates\":\"25\",\"protein\":\"20\",\"sugar\":\"5\",\"sodium\":\"5\"}', 'Store in a cool, dry place.', 1, '{\"length\":\"\",\"width\":\"\",\"height\":\"\"}', NULL, NULL, NULL, 2, 1, NULL, NULL, '2025-05-09 20:11:47', '2025-05-11 20:05:39', NULL),
(58, 1, 1, 'Mawa Kachori', 'mawa-kachori', 'Sweet deep-fried pastry filled with mawa (milk solids) and dry fruits.', 'Sweet deep-fried pastry filled with mawa (milk solids) and dry fruits.', '21069099', 5.00, 2.50, 2.50, 5.00, 'active', 0, '15 days', '[\"Flour\",\"Mawa\",\"Sugar\",\"Dry fruits\",\"Ghee\"]', '{\"calories\":\"450\",\"fat\":\"25\",\"carbohydrates\":\"50\",\"protein\":\"8\",\"sugar\":\"35\",\"sodium\":\"20\"}', 'Store in a cool, dry place.', 1, '{\"length\":\"\",\"width\":\"\",\"height\":\"\"}', NULL, NULL, NULL, 2, 1, NULL, NULL, '2025-05-09 20:21:31', '2025-05-09 21:50:17', NULL),
(59, 1, 3, 'Dry Fruit Ladoo', 'dry-fruit-ladoo', 'Healthy ladoos made with mixed dry fruits, nuts, and honey.', 'Healthy ladoos made with mixed dry fruits, nuts, and honey.', '21069099', 5.00, 2.50, 2.50, 5.00, 'active', 0, '30 days', '[\"Dates\",\"Almonds\",\"Cashews\",\"Pistachios\",\"Honey\"]', '{\"calories\":\"480\",\"fat\":\"25\",\"carbohydrates\":\"60\",\"protein\":\"10\",\"sugar\":\"55\",\"sodium\":\"5\"}', 'Store in a cool, dry place.', 1, '{\"length\":\"\",\"width\":\"\",\"height\":\"\"}', NULL, NULL, NULL, 2, 1, NULL, NULL, '2025-05-09 20:21:31', '2025-05-09 21:49:44', NULL),
(61, 1, 1, 'Imarti', 'imarti', 'Intricate, flower-shaped sweet made from urad dal flour, deep-fried and soaked in sugar syrup.', 'Intricate, flower-shaped sweet made from urad dal flour, deep-fried and soaked in sugar syrup.', '21069099', 5.00, 2.50, 2.50, 5.00, 'active', 0, '5 days', '[\"Urad dal flour\",\"Sugar\",\"Saffron\",\"Cardamom\"]', '{\"calories\":\"380\",\"fat\":\"15\",\"carbohydrates\":\"65\",\"protein\":\"5\",\"sugar\":\"60\",\"sodium\":\"10\"}', 'Store in a cool, dry place.', 1, '{\"length\":\"\",\"width\":\"\",\"height\":\"\"}', NULL, NULL, NULL, 2, 1, NULL, NULL, '2025-05-09 20:21:31', '2025-05-09 21:48:40', NULL),
(62, 1, 2, 'Kheer', 'kheer', 'Creamy rice pudding flavored with cardamom, saffron, and garnished with nuts.', 'Creamy rice pudding flavored with cardamom, saffron, and garnished with nuts.', '21069099', 5.00, 2.50, 2.50, 5.00, 'active', 0, '3 days', '[\"Rice\",\"Milk\",\"Sugar\",\"Cardamom\",\"Saffron\",\"Nuts\"]', '{\"calories\":\"180\",\"fat\":\"6\",\"carbohydrates\":\"30\",\"protein\":\"4\",\"sugar\":\"25\",\"sodium\":\"30\"}', 'Keep refrigerated.', 1, '{\"length\":\"\",\"width\":\"\",\"height\":\"\"}', NULL, NULL, NULL, 2, 1, NULL, NULL, '2025-05-09 20:21:31', '2025-05-09 22:14:22', NULL),
(63, 1, 2, 'Kesar Rasmalai', 'kesar-rasmalai', 'Soft paneer balls soaked in saffron-flavored thickened milk.', 'Soft paneer balls soaked in saffron-flavored thickened milk.', '21069099', 5.00, 2.50, 2.50, 5.00, 'active', 0, '5 days', '[\"Milk\",\"Sugar\",\"Saffron\",\"Cardamom\",\"Pistachios\"]', '{\"calories\":\"290\",\"fat\":\"15\",\"carbohydrates\":\"32\",\"protein\":\"8\",\"sugar\":\"30\",\"sodium\":\"35\"}', 'Keep refrigerated.', 1, '{\"length\":\"\",\"width\":\"\",\"height\":\"\"}', NULL, NULL, NULL, 2, 1, NULL, NULL, '2025-05-09 20:26:53', '2025-05-09 21:47:40', NULL),
(64, 1, 3, 'Kaju Katli Diamond', 'kaju-katli-diamond', 'Diamond-shaped cashew fudge garnished with silver leaf, a premium version of the classic kaju katli.', 'Diamond-shaped cashew fudge garnished with silver leaf, a premium version of the classic kaju katli.', '21069099', 5.00, 2.50, 2.50, 5.00, 'active', 0, '30 days', '[\"Cashews\",\"Sugar\",\"Cardamom\",\"Silver leaf\"]', '{\"calories\":\"550\",\"fat\":\"32\",\"carbohydrates\":\"55\",\"protein\":\"13\",\"sugar\":\"45\",\"sodium\":\"10\"}', 'Store in a cool, dry place.', 1, '{\"length\":\"\",\"width\":\"\",\"height\":\"\"}', NULL, NULL, NULL, 2, 1, NULL, NULL, '2025-05-09 20:26:53', '2025-05-09 21:46:47', NULL),
(65, 1, 2, 'Malai Sandwich', 'malai-sandwich', 'Layered milk sweet with a creamy filling, garnished with pistachios.', 'Layered milk sweet with a creamy filling, garnished with pistachios.', '21069099', 5.00, 2.50, 2.50, 5.00, 'active', 1, '7 days', '[\"Milk\",\"Sugar\",\"Pistachios\",\"Cardamom\"]', '{\"calories\":\"320\",\"fat\":\"18\",\"carbohydrates\":\"35\",\"protein\":\"7\",\"sugar\":\"30\",\"sodium\":\"30\"}', 'Keep refrigerated.', 1, '{\"length\":\"\",\"width\":\"\",\"height\":\"\"}', NULL, NULL, NULL, 2, 1, NULL, NULL, '2025-05-09 20:26:53', '2025-05-31 17:13:53', NULL),
(66, 1, 1, 'Kesar Angoori Petha', 'kesar-angoori-petha-special', 'Soft, translucent candy made from ash gourd, flavored with saffron and shaped like grapes.', 'Soft, translucent candy made from ash gourd, flavored with saffron and shaped like grapes.', '21069099', 5.00, 2.50, 2.50, 5.00, 'active', 6, '30 days', '[\"Ash gourd\",\"Sugar\",\"Saffron\",\"Lime\"]', '{\"calories\":\"280\",\"fat\":\"0.5\",\"carbohydrates\":\"70\",\"protein\":\"0.5\",\"sugar\":\"68\",\"sodium\":\"5\"}', 'Store in a cool, dry place.', 1, '{\"length\":\"\",\"width\":\"\",\"height\":\"\"}', NULL, NULL, NULL, 2, 1, NULL, NULL, '2025-05-09 20:26:53', '2025-05-29 23:40:17', NULL),
(67, 1, 2, 'Kala Jamun', 'kala-jamun-special', 'Dark, deep-fried milk solids balls soaked in thick sugar syrup, similar to gulab jamun but darker.', 'Dark, deep-fried milk solids balls soaked in thick sugar syrup, similar to gulab jamun but darker.', '21069099', 5.00, 2.50, 2.50, 5.00, 'active', 0, '7 days', '[\"Milk solids\",\"Paneer\",\"Sugar\",\"Cardamom\"]', '{\"calories\":\"330\",\"fat\":\"12\",\"carbohydrates\":\"55\",\"protein\":\"5\",\"sugar\":\"50\",\"sodium\":\"20\"}', 'Store in a cool, dry place.', 1, '{\"length\":\"\",\"width\":\"\",\"height\":\"\"}', NULL, NULL, NULL, 2, 1, NULL, NULL, '2025-05-09 20:26:53', '2025-05-09 21:44:38', NULL),
(68, 1, 2, 'Rajbhog', 'rajbhog-special', 'Large, stuffed rasgulla filled with dry fruits, saffron, and cardamom.', 'Large, stuffed rasgulla filled with dry fruits, saffron, and cardamom.', '21069099', 5.00, 2.50, 2.50, 5.00, 'active', 0, '7 days', '[\"Chhena (paneer)\",\"Sugar syrup\",\"Dry fruits\",\"Saffron\",\"Cardamom\"]', '{\"calories\":\"220\",\"fat\":\"8\",\"carbohydrates\":\"35\",\"protein\":\"5\",\"sugar\":\"32\",\"sodium\":\"25\"}', 'Store in a cool, dry place.', 1, '{\"length\":\"\",\"width\":\"\",\"height\":\"\"}', NULL, NULL, NULL, 2, 1, NULL, NULL, '2025-05-09 20:26:53', '2025-05-09 21:04:43', NULL),
(69, 1, 1, 'Ghevar', 'ghevar-special', 'Disc-shaped sweet cake with honeycomb pattern, soaked in sugar syrup and topped with rabri or malai.', 'Disc-shaped sweet cake with honeycomb pattern, soaked in sugar syrup and topped with rabri or malai.', '21069099', 5.00, 2.50, 2.50, 5.00, 'active', 1, '5 days', '[\"All-purpose flour\",\"Ghee\",\"Sugar\",\"Milk\",\"Pistachios\"]', '{\"calories\":\"400\",\"fat\":\"20\",\"carbohydrates\":\"55\",\"protein\":\"5\",\"sugar\":\"45\",\"sodium\":\"15\"}', 'Store in a cool, dry place.', 1, '{\"length\":\"\",\"width\":\"\",\"height\":\"\"}', NULL, NULL, NULL, 2, 1, NULL, NULL, '2025-05-09 20:26:53', '2025-05-29 21:27:52', NULL),
(70, 1, 2, 'Chum Chum Special', 'chum-chum-special', 'Cylindrical Bengali sweet made from flattened paneer, soaked in sugar syrup and garnished with coconut.', 'Cylindrical Bengali sweet made from flattened paneer, soaked in sugar syrup and garnished with coconut.', '21069099', 5.00, 2.50, 2.50, 5.00, 'active', 0, '7 days', '[\"Paneer\",\"Sugar\",\"Coconut\",\"Cardamom\"]', '{\"calories\":\"230\",\"fat\":\"6\",\"carbohydrates\":\"40\",\"protein\":\"5\",\"sugar\":\"38\",\"sodium\":\"20\"}', 'Store in a cool, dry place.', 1, '{\"length\":\"\",\"width\":\"\",\"height\":\"\"}', NULL, NULL, NULL, 2, 1, NULL, NULL, '2025-05-09 20:26:53', '2025-05-09 21:39:41', NULL),
(71, 1, 1, 'Mawa Gujiya', 'mawa-gujiya-special', 'Crescent-shaped pastry filled with khoya, nuts, and cardamom, deep-fried and dipped in sugar syrup.', 'Crescent-shaped pastry filled with khoya, nuts, and cardamom, deep-fried and dipped in sugar syrup.', '21069099', 5.00, 2.50, 2.50, 5.00, 'active', 0, '15 days', '[\"All-purpose flour\",\"Khoya\",\"Nuts\",\"Sugar\",\"Cardamom\"]', '{\"calories\":\"460\",\"fat\":\"25\",\"carbohydrates\":\"55\",\"protein\":\"8\",\"sugar\":\"40\",\"sodium\":\"20\"}', 'Store in a cool, dry place.', 1, '{\"length\":\"\",\"width\":\"\",\"height\":\"\"}', NULL, NULL, NULL, 2, 1, NULL, NULL, '2025-05-09 20:26:53', '2025-05-09 21:36:16', NULL),
(73, 1, 1, 'Balushai Premium', 'balushai-premium', 'Flaky, crisp pastry sweet soaked in sugar syrup, similar to a glazed donut.', 'Flaky, crisp pastry sweet soaked in sugar syrup, similar to a glazed donut.', '21069099', 5.00, 2.50, 2.50, 5.00, 'active', 0, '15 days', '[\"All-purpose flour\",\"Ghee\",\"Sugar\",\"Cardamom\"]', '{\"calories\":\"450\",\"fat\":\"25\",\"carbohydrates\":\"55\",\"protein\":\"5\",\"sugar\":\"40\",\"sodium\":\"20\"}', 'Store in a cool, dry place.', 1, '{\"length\":\"\",\"width\":\"\",\"height\":\"\"}', NULL, NULL, NULL, 2, 1, NULL, NULL, '2025-05-09 20:26:53', '2025-05-09 21:33:43', NULL),
(74, 1, 2, 'Kesar Malai Peda', 'kesar-malai-peda-special', 'Soft milk fudge flavored with saffron and cream, garnished with pistachios.', 'Soft milk fudge flavored with saffron and cream, garnished with pistachios.', '21069099', 5.00, 2.50, 2.50, 5.00, 'active', 0, '15 days', '[\"Milk solids\",\"Cream\",\"Sugar\",\"Saffron\",\"Pistachios\"]', '{\"calories\":\"400\",\"fat\":\"20\",\"carbohydrates\":\"50\",\"protein\":\"8\",\"sugar\":\"45\",\"sodium\":\"25\"}', 'Store in a cool, dry place.', 1, '{\"length\":\"\",\"width\":\"\",\"height\":\"\"}', NULL, NULL, NULL, 2, 1, NULL, NULL, '2025-05-09 20:26:53', '2025-05-09 21:32:04', NULL),
(75, 1, 3, 'Kaju Anjeer Roll', 'kaju-anjeer-roll-special', 'Rolled cashew sweet with a fig filling, garnished with silver leaf.', 'Rolled cashew sweet with a fig filling, garnished with silver leaf.', '21069099', 5.00, 2.50, 2.50, 5.00, 'active', 0, '30 days', '[\"Cashews\",\"Dried figs\",\"Sugar\",\"Cardamom\",\"Silver leaf\"]', '{\"calories\":\"520\",\"fat\":\"28\",\"carbohydrates\":\"60\",\"protein\":\"12\",\"sugar\":\"55\",\"sodium\":\"10\"}', 'Store in a cool, dry place.', 1, '{\"length\":\"\",\"width\":\"\",\"height\":\"\"}', NULL, NULL, NULL, 2, 1, NULL, NULL, '2025-05-09 20:26:53', '2025-05-09 21:28:04', NULL),
(84, 3, 19, 'Salted Kaju', 'salted-kaju', 'dryfruit', 'dryfruit', '560394', 5.00, 2.50, 2.50, 5.00, 'inactive', 0, '15 days', '[\"kaju\"]', '{\"calories\":\"\",\"fat\":\"\",\"carbohydrates\":\"\",\"protein\":\"\",\"sugar\":\"\",\"sodium\":\"\"}', NULL, 1, '{\"length\":\"\",\"width\":\"\",\"height\":\"\"}', NULL, NULL, NULL, 4, 4, NULL, '2025-05-17 14:39:05', '2025-05-17 09:09:05', '2025-05-29 13:25:42', NULL),
(90, 2, 5, 'Test', 'test', 'system', 'system', '21069099', 5.00, 2.50, 2.50, 5.00, 'active', 0, '30 days', '[]', '{\"calories\":\"\",\"fat\":\"\",\"carbohydrates\":\"\",\"protein\":\"\",\"sugar\":\"\",\"sodium\":\"\"}', NULL, 1, '{\"length\":\"\",\"width\":\"\",\"height\":\"\"}', NULL, NULL, NULL, 1, 1, NULL, '2025-06-08 19:35:51', '2025-06-08 14:05:51', '2025-06-09 05:34:37', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `product_images`
--

CREATE TABLE `product_images` (
  `id` int(11) NOT NULL,
  `product_id` int(11) NOT NULL,
  `image_path` varchar(255) NOT NULL COMMENT 'Path to the image file',
  `is_primary` tinyint(1) NOT NULL DEFAULT 0 COMMENT 'Whether this is the main product image',
  `display_order` int(11) NOT NULL DEFAULT 0 COMMENT 'Order for display in product gallery',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT NULL ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `product_images`
--

INSERT INTO `product_images` (`id`, `product_id`, `image_path`, `is_primary`, `display_order`, `created_at`, `updated_at`) VALUES
(1, 1, 'uploads/product_images/acd7aa29a609eb8a79c4bdf11a066230.jpg', 1, 0, '2025-05-09 12:33:30', '2025-05-10 07:36:58'),
(2, 1, 'uploads/product_images/95d7acbaff3a8e07b86f7a9bef439f69.jpg', 0, 1, '2025-05-09 12:33:31', NULL),
(3, 2, 'uploads/product_images/62bdad2870dbd47397cdc699fa519841.jpg', 1, 1, '2025-05-09 12:41:56', '2025-05-09 13:21:36'),
(4, 2, 'uploads/product_images/1bf208625e3185e9065113d434c94d18.jpg', 0, 2, '2025-05-09 12:41:56', NULL),
(12, 3, 'uploads/product_images/03932fb24d90fb94fbc47cf500c3e432.jpg', 1, 0, '2025-05-09 13:32:43', NULL),
(13, 3, 'uploads/product_images/b140f0f90302c9e1f28d43c329a138e8.jpg', 0, 1, '2025-05-09 13:32:44', NULL),
(14, 3, 'uploads/product_images/89636134111728440078135621d2fce9.jpg', 0, 2, '2025-05-09 13:32:44', NULL),
(15, 4, 'uploads/product_images/b8b5b75d7db419039da58773941fc2e8.jpg', 1, 0, '2025-05-09 13:38:00', NULL),
(16, 4, 'uploads/product_images/7b94409058d9d63aa898b35811ea0e80.jpg', 0, 1, '2025-05-09 13:38:00', NULL),
(17, 5, 'uploads/product_images/c1707214564e05848529dd9ad659ceb4.jpg', 1, 0, '2025-05-09 13:53:26', NULL),
(18, 5, 'uploads/product_images/b325fd5cdba5050d8a268951195e72c7.jpg', 0, 1, '2025-05-09 13:53:27', NULL),
(19, 6, 'uploads/product_images/6fe519b1e5f243ad74d56f127a54dd2e.jpg', 1, 0, '2025-05-09 14:01:23', NULL),
(20, 6, 'uploads/product_images/2a2187e80c92e101c7c875157aaa945c.jpg', 0, 1, '2025-05-09 14:01:23', NULL),
(21, 7, 'uploads/product_images/8d67cb96c0e582a4318867af63966a15.jpg', 1, 0, '2025-05-09 14:46:40', NULL),
(22, 8, 'uploads/product_images/f65a2dc2c44609a3c969195e58962288.jpg', 1, 0, '2025-05-09 14:49:55', NULL),
(23, 8, 'uploads/product_images/1dd28344e90fcaa3d99c295eb92f2d5f.jpg', 0, 1, '2025-05-09 14:49:55', NULL),
(24, 9, 'uploads/product_images/0a807f7a6786d5cd863e14631b50bb32.jpg', 1, 0, '2025-05-09 14:53:19', NULL),
(25, 10, 'uploads/product_images/7a2543782e4a2d4e7c8707857778ab87.jpg', 1, 0, '2025-05-09 14:55:59', NULL),
(26, 11, 'uploads/product_images/32e941acef83edf329144febf9fde007.jpg', 1, 0, '2025-05-09 14:59:10', NULL),
(27, 12, 'uploads/product_images/d14375c3b997474ddee15a3ec93be4fc.jpg', 1, 0, '2025-05-09 15:03:36', NULL),
(28, 13, 'uploads/product_images/d56d786bdf9a8d295a0613a475b18642.jpg', 1, 0, '2025-05-09 15:07:20', NULL),
(29, 13, 'uploads/product_images/53fcbdb9bb0ebaf14cfd4312697d9f92.jpg', 0, 1, '2025-05-09 15:07:20', NULL),
(30, 77, 'uploads/product_images/bc7bb5ccc69ff0d705cdc3776fc58b79.jpg', 1, 0, '2025-05-09 20:38:11', '2025-05-10 21:12:24'),
(31, 77, 'uploads/product_images/e9324977562b342fb1aa4ec06fbc92dd.jpg', 0, 1, '2025-05-09 20:38:11', '2025-05-09 20:38:36'),
(32, 76, 'uploads/product_images/fb8824d7f2e9f197a809b034318acb07.jpg', 1, 0, '2025-05-09 20:39:57', NULL),
(33, 76, 'uploads/product_images/8506930cd6a996c0ddc95a8b2be03b26.jpg', 1, 1, '2025-05-09 20:39:57', NULL),
(34, 68, 'uploads/product_images/2f77c82135e1d0d8f6d274a55b02b368.jpg', 1, 0, '2025-05-09 21:04:44', NULL),
(35, 68, 'uploads/product_images/f8fab6d37d5070da55f6d4f168e036c5.jpg', 1, 1, '2025-05-09 21:04:44', NULL),
(47, 75, 'uploads/product_images/5dd654082e98aef8ce03149d121f8573.jpg', 1, 0, '2025-05-09 21:28:05', NULL),
(48, 75, 'uploads/product_images/14a99b2fd1f16f4c9a3d379fd3b28890.jpg', 0, 1, '2025-05-09 21:28:05', NULL),
(49, 75, 'uploads/product_images/a1bd1072e87017cbbe0e06d459ddd2fd.jpg', 0, 2, '2025-05-09 21:28:05', NULL),
(50, 74, 'uploads/product_images/b642dd991c2dedc6a3155d8403353cb6.jpg', 1, 0, '2025-05-09 21:32:04', NULL),
(51, 74, 'uploads/product_images/7e73a3aef6a5025ef455f5457a9bf248.jpg', 0, 1, '2025-05-09 21:32:05', NULL),
(52, 73, 'uploads/product_images/1ef3e563da51782379d6884b6c9be920.jpg', 1, 0, '2025-05-09 21:33:44', NULL),
(53, 71, 'uploads/product_images/9c78744e571c4649d20a7f1ff18a76e5.jpg', 1, 0, '2025-05-09 21:36:17', NULL),
(54, 70, 'uploads/product_images/0c9754ee0c7a88d052a77fbcb5a32076.jpg', 1, 0, '2025-05-09 21:39:42', NULL),
(55, 69, 'uploads/product_images/71483e4d03a23d4388e46e8f3219a9b0.jpg', 1, 0, '2025-05-09 21:41:05', NULL),
(56, 67, 'uploads/product_images/4e6d625d689d8ef4a7180b08b0e0e771.jpg', 1, 0, '2025-05-09 21:44:39', NULL),
(57, 66, 'uploads/product_images/eee0b3b70ea78c6c8e297df77d2aad6f.jpg', 1, 0, '2025-05-09 21:45:23', NULL),
(58, 65, 'uploads/product_images/b19f2453c0ac86db0c80e5ddfed57108.jpg', 1, 0, '2025-05-09 21:45:49', NULL),
(59, 64, 'uploads/product_images/802e44448ee58e7b786c82f5567bf4ca.jpg', 1, 0, '2025-05-09 21:46:48', NULL),
(60, 64, 'uploads/product_images/8449253537e57511e2f3bc091bdf3cd0.jpg', 0, 1, '2025-05-09 21:46:48', NULL),
(61, 63, 'uploads/product_images/09068e484e86e78936c6b22272293e38.jpg', 1, 0, '2025-05-09 21:47:42', NULL),
(62, 63, 'uploads/product_images/661abe354b3a5587de70a6948514fce3.jpg', 0, 1, '2025-05-09 21:47:42', NULL),
(63, 62, 'uploads/product_images/ca4f5085d8608d008779164180e0d051.jpg', 1, 0, '2025-05-09 21:48:17', NULL),
(64, 61, 'uploads/product_images/f6206f0afd988418aaf8fdfbfbd7aafa.jpg', 1, 0, '2025-05-09 21:48:42', NULL),
(65, 59, 'uploads/product_images/99fb1c9e817f94f742d1c32b83afd053.png', 1, 0, '2025-05-09 21:49:45', NULL),
(66, 58, 'uploads/product_images/0d982c5ed1acbd772d03f655474da4c4.jpg', 1, 0, '2025-05-09 21:50:18', NULL),
(67, 48, 'uploads/product_images/13d7cfa8175941dca3d0f8a8ee239deb.jpg', 1, 0, '2025-05-09 21:50:45', NULL),
(68, 47, 'uploads/product_images/1d15f25292c0631bbdec900e0969c9ba.jpg', 1, 0, '2025-05-09 21:51:54', NULL),
(69, 46, 'uploads/product_images/b5b5f4d17d17c15242f1075a37fb0d37.jpg', 1, 0, '2025-05-09 21:52:37', NULL),
(70, 45, 'uploads/product_images/08bd17946da1f43f539d118b6e640c31.jpg', 1, 0, '2025-05-09 21:53:08', NULL),
(71, 44, 'uploads/product_images/dcf4bfe59b544e0d1284b3496d8567b5.jpg', 1, 0, '2025-05-09 21:53:39', NULL),
(72, 43, 'uploads/product_images/a14c2ce32ae0c79bbd286c6f0b28a24c.jpg', 1, 0, '2025-05-09 21:54:07', NULL),
(73, 42, 'uploads/product_images/15610b2f1c57995101c97f1afee66fa1.jpg', 1, 0, '2025-05-09 21:54:40', NULL),
(74, 41, 'uploads/product_images/23903cc9acff876cfdeba18969ff7e6f.jpg', 1, 0, '2025-05-09 21:59:05', NULL),
(75, 78, 'uploads/product_images/39a866503759da82ea66774d5c13d5ec.png', 1, 0, '2025-05-09 22:11:47', NULL),
(76, 78, 'uploads/product_images/491a384994afc1d8900fe13766500016.png', 0, 1, '2025-05-09 22:11:47', NULL),
(77, 78, 'uploads/product_images/76e61561b1eb3a93e6930a67e7062f39.png', 0, 2, '2025-05-09 22:11:48', NULL),
(78, 78, 'uploads/product_images/74d20892631ac4679a0f95a4719753ed.png', 0, 3, '2025-05-09 22:11:48', NULL),
(79, 78, 'uploads/product_images/4e45b9f5d0dd3ac68761341eeb4e0e52.png', 0, 4, '2025-05-09 22:11:49', NULL),
(80, 78, 'uploads/product_images/1e38c3ff5dc302a223a4c159a1927350.png', 0, 5, '2025-05-09 22:11:49', NULL),
(81, 79, 'uploads/product_images/dbe212fba71fec590390ce01d026d461.png', 1, 0, '2025-05-09 22:36:41', NULL),
(133, 51, 'uploads/product_images/1746993939_dbcb7f4cb2a1ba8b.jpg', 1, 0, '2025-05-11 20:05:39', NULL),
(134, 40, 'uploads/product_images/1746993987_d3a0c7eb80757be9.jpg', 1, 0, '2025-05-11 20:06:28', NULL),
(135, 39, 'uploads/product_images/1746994027_dd245f9b5fff564e.jpg', 1, 0, '2025-05-11 20:07:07', NULL),
(136, 38, 'uploads/product_images/1746994067_c1d7947ff19bd3db.jpg', 1, 0, '2025-05-11 20:07:47', NULL),
(137, 32, 'uploads/product_images/1746994098_c1457e4d9e6dfaa2.jpg', 1, 0, '2025-05-11 20:08:18', NULL),
(138, 29, 'uploads/product_images/1746994128_43d2655de21f8db2.jpg', 1, 0, '2025-05-11 20:08:48', NULL),
(139, 28, 'uploads/product_images/1746994161_b3f053c369034fc4.jpg', 1, 0, '2025-05-11 20:09:21', NULL),
(140, 27, 'uploads/product_images/1746994192_c270c5dae9aee3b7.jpg', 1, 0, '2025-05-11 20:09:52', NULL),
(141, 26, 'uploads/product_images/1746994233_d1c6111b16083f02.jpg', 1, 0, '2025-05-11 20:10:33', NULL),
(142, 14, 'uploads/product_images/1746994284_cdb98aa5c58a366d.jpg', 1, 0, '2025-05-11 20:11:24', NULL),
(143, 15, 'uploads/product_images/1746994319_8cf2a6a0490cbce5.jpg', 1, 0, '2025-05-11 20:11:59', NULL),
(144, 16, 'uploads/product_images/1746994343_29754b45f8ac7dd0.jpg', 1, 0, '2025-05-11 20:12:23', NULL),
(145, 17, 'uploads/product_images/1746994374_f0d6937f81169652.jpg', 1, 0, '2025-05-11 20:12:54', NULL),
(146, 18, 'uploads/product_images/1746994483_2dba6d39c3598450.jpg', 1, 0, '2025-05-11 20:14:43', NULL),
(147, 19, 'uploads/product_images/1746994538_4d6d15c4743a8ca8.jpg', 1, 0, '2025-05-11 20:15:38', NULL),
(148, 20, 'uploads/product_images/1746994586_14e722870edb56d2.jpg', 1, 0, '2025-05-11 20:16:26', NULL),
(149, 21, 'uploads/product_images/1746994630_09f85d8725cf457b.jpg', 1, 0, '2025-05-11 20:17:10', NULL),
(150, 22, 'uploads/product_images/1746994668_a9784fcbb1a7eeef.jpg', 1, 0, '2025-05-11 20:17:48', NULL),
(151, 23, 'uploads/product_images/1746994702_a85bb4e9aca0afbf.jpg', 1, 0, '2025-05-11 20:18:22', NULL),
(152, 24, 'uploads/product_images/1746994762_ffa1f8a5e213e83f.jpg', 1, 0, '2025-05-11 20:19:22', NULL),
(153, 25, 'uploads/product_images/1746994815_dcdeadf8334712cd.jpg', 1, 0, '2025-05-11 20:20:15', NULL),
(156, 49, 'uploads/product_images/1747189963_ac86d264e5197334.jpg', 1, 0, '2025-05-14 02:32:43', NULL),
(157, 50, 'uploads/product_images/1747190032_b8673d91a174b402.jpg', 1, 0, '2025-05-14 02:33:52', NULL),
(158, 50, 'uploads/product_images/1747190032_28072b5aa7b453b0.jpg', 0, 1, '2025-05-14 02:33:52', NULL),
(170, 84, 'uploads/product_images/1747472945_89e2a94f1f5f1cdb.png', 1, 0, '2025-05-17 09:09:05', '2025-05-21 17:00:53'),
(171, 84, 'uploads/product_images/1747472945_cd02c29b8b6b933e.png', 0, 1, '2025-05-17 09:09:05', NULL),
(172, 84, 'uploads/product_images/1747472946_c7f9ebd22adedb84.png', 0, 2, '2025-05-17 09:09:06', NULL),
(173, 84, 'uploads/product_images/1747472946_b2aa3e902a62bfdd.png', 0, 3, '2025-05-17 09:09:06', NULL),
(174, 84, 'uploads/product_images/1747472946_e46c29a5523dc6bd.png', 0, 4, '2025-05-17 09:09:06', NULL),
(175, 84, 'uploads/product_images/1747472946_7bfa805278b304fc.png', 0, 5, '2025-05-17 09:09:06', NULL),
(176, 84, 'uploads/product_images/1747472946_f73b64ee8c77a011.png', 0, 6, '2025-05-17 09:09:06', NULL),
(177, 84, 'uploads/product_images/1747472946_db9f8315dcf27fc8.png', 0, 7, '2025-05-17 09:09:06', NULL),
(178, 84, 'uploads/product_images/1747472946_daee6588a4f193d3.png', 0, 8, '2025-05-17 09:09:06', NULL),
(179, 84, 'uploads/product_images/1747472946_cdfc3618f51bc920.png', 0, 9, '2025-05-17 09:09:06', NULL),
(180, 84, 'uploads/product_images/1747472946_36f1856906aa2979.png', 0, 10, '2025-05-17 09:09:06', NULL),
(202, 90, 'uploads/product_images/1749447277_2ee47d12af64befa.webp', 1, 0, '2025-06-09 05:34:37', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `product_tags`
--

CREATE TABLE `product_tags` (
  `product_id` int(11) NOT NULL,
  `tag_id` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `product_tags`
--

INSERT INTO `product_tags` (`product_id`, `tag_id`, `created_at`) VALUES
(0, 12, '2025-05-09 20:00:50'),
(0, 41, '2025-05-09 20:00:50'),
(0, 42, '2025-05-09 20:00:50'),
(0, 43, '2025-05-09 20:00:50'),
(0, 52, '2025-05-09 20:00:50'),
(0, 57, '2025-05-09 20:00:50'),
(0, 58, '2025-05-09 20:00:50'),
(0, 59, '2025-05-09 20:00:50'),
(0, 63, '2025-05-09 20:00:50'),
(0, 69, '2025-05-09 20:00:50'),
(0, 70, '2025-05-09 20:00:50'),
(0, 99, '2025-05-09 20:00:50'),
(0, 100, '2025-05-09 20:00:50'),
(1, 2, '2025-05-10 07:36:58'),
(1, 3, '2025-05-10 07:36:58'),
(2, 1, '2025-05-09 12:41:53'),
(2, 4, '2025-05-09 12:41:52'),
(2, 5, '2025-05-09 12:41:54'),
(2, 6, '2025-05-09 12:41:55'),
(3, 1, '2025-05-09 13:32:42'),
(3, 7, '2025-05-09 13:32:42'),
(4, 1, '2025-05-09 13:37:59'),
(4, 8, '2025-05-09 13:37:59'),
(4, 9, '2025-05-09 13:37:59'),
(5, 1, '2025-05-09 13:53:26'),
(5, 3, '2025-05-09 13:53:26'),
(5, 10, '2025-05-09 13:53:26'),
(6, 1, '2025-05-09 14:01:23'),
(6, 8, '2025-05-09 14:01:21'),
(6, 11, '2025-05-09 14:01:22'),
(7, 8, '2025-05-09 19:37:41'),
(7, 12, '2025-05-09 19:37:41'),
(7, 13, '2025-05-09 19:37:42'),
(7, 14, '2025-05-09 19:37:42'),
(8, 8, '2025-05-09 20:03:36'),
(8, 14, '2025-05-09 20:03:36'),
(8, 69, '2025-05-09 20:03:36'),
(8, 99, '2025-05-09 20:03:36'),
(8, 100, '2025-05-09 20:03:36'),
(9, 8, '2025-05-09 20:03:36'),
(9, 14, '2025-05-09 20:03:36'),
(9, 69, '2025-05-09 20:03:36'),
(9, 99, '2025-05-09 20:03:36'),
(9, 100, '2025-05-09 20:03:36'),
(10, 8, '2025-05-09 20:03:36'),
(10, 14, '2025-05-09 20:03:36'),
(10, 34, '2025-05-09 20:03:36'),
(10, 37, '2025-05-09 20:03:36'),
(10, 99, '2025-05-09 20:03:36'),
(11, 2, '2025-05-09 20:03:36'),
(11, 14, '2025-05-09 20:03:36'),
(11, 17, '2025-05-09 20:03:36'),
(11, 99, '2025-05-09 20:03:36'),
(11, 100, '2025-05-09 20:03:36'),
(12, 14, '2025-05-09 20:03:36'),
(12, 16, '2025-05-09 20:03:36'),
(12, 53, '2025-05-09 20:03:36'),
(12, 99, '2025-05-09 20:03:36'),
(12, 100, '2025-05-09 20:03:36'),
(13, 14, '2025-05-09 20:03:36'),
(13, 17, '2025-05-09 20:03:36'),
(13, 50, '2025-05-09 20:03:36'),
(13, 99, '2025-05-09 20:03:36'),
(13, 100, '2025-05-09 20:03:36'),
(14, 14, '2025-05-11 20:11:24'),
(14, 15, '2025-05-11 20:11:24'),
(14, 16, '2025-05-11 20:11:24'),
(14, 17, '2025-05-11 20:11:24'),
(15, 2, '2025-05-11 20:11:59'),
(15, 14, '2025-05-11 20:11:59'),
(15, 19, '2025-05-11 20:11:59'),
(15, 20, '2025-05-11 20:11:59'),
(16, 14, '2025-05-11 20:12:23'),
(16, 22, '2025-05-11 20:12:23'),
(16, 23, '2025-05-11 20:12:23'),
(16, 24, '2025-05-11 20:12:23'),
(17, 10, '2025-05-11 20:12:54'),
(17, 14, '2025-05-11 20:12:54'),
(17, 24, '2025-05-11 20:12:54'),
(17, 25, '2025-05-11 20:12:54'),
(18, 14, '2025-05-11 20:14:43'),
(18, 24, '2025-05-11 20:14:43'),
(18, 26, '2025-05-11 20:14:43'),
(18, 27, '2025-05-11 20:14:43'),
(19, 14, '2025-05-11 20:15:38'),
(19, 24, '2025-05-11 20:15:38'),
(19, 27, '2025-05-11 20:15:38'),
(19, 28, '2025-05-11 20:15:38'),
(20, 10, '2025-05-11 20:16:26'),
(20, 14, '2025-05-11 20:16:26'),
(20, 24, '2025-05-11 20:16:26'),
(20, 29, '2025-05-11 20:16:26'),
(21, 2, '2025-05-11 20:17:10'),
(21, 14, '2025-05-11 20:17:10'),
(21, 30, '2025-05-11 20:17:10'),
(21, 31, '2025-05-11 20:17:10'),
(22, 14, '2025-05-11 20:17:48'),
(22, 30, '2025-05-11 20:17:48'),
(22, 31, '2025-05-11 20:17:48'),
(22, 32, '2025-05-11 20:17:48'),
(23, 14, '2025-05-11 20:18:22'),
(23, 33, '2025-05-11 20:18:22'),
(23, 34, '2025-05-11 20:18:22'),
(23, 35, '2025-05-11 20:18:22'),
(24, 14, '2025-05-11 20:19:22'),
(24, 34, '2025-05-11 20:19:22'),
(24, 36, '2025-05-11 20:19:22'),
(24, 37, '2025-05-11 20:19:22'),
(25, 14, '2025-05-11 20:20:15'),
(25, 38, '2025-05-11 20:20:15'),
(25, 39, '2025-05-11 20:20:15'),
(25, 40, '2025-05-11 20:20:15'),
(26, 12, '2025-05-11 20:10:33'),
(26, 41, '2025-05-11 20:10:33'),
(26, 42, '2025-05-11 20:10:33'),
(26, 43, '2025-05-11 20:10:33'),
(27, 12, '2025-05-11 20:09:52'),
(27, 43, '2025-05-11 20:09:52'),
(27, 44, '2025-05-11 20:09:52'),
(28, 12, '2025-05-11 20:09:21'),
(28, 45, '2025-05-11 20:09:21'),
(28, 46, '2025-05-11 20:09:21'),
(29, 12, '2025-05-11 20:08:48'),
(29, 47, '2025-05-11 20:08:48'),
(29, 48, '2025-05-11 20:08:48'),
(31, 49, '2025-05-09 19:59:53'),
(31, 52, '2025-05-09 19:59:53'),
(31, 53, '2025-05-09 19:59:53'),
(32, 49, '2025-05-11 20:08:18'),
(32, 54, '2025-05-11 20:08:18'),
(32, 55, '2025-05-11 20:08:18'),
(33, 54, '2025-05-09 19:59:53'),
(33, 55, '2025-05-09 19:59:53'),
(33, 56, '2025-05-09 19:59:53'),
(35, 52, '2025-05-09 19:59:53'),
(35, 59, '2025-05-09 19:59:53'),
(35, 60, '2025-05-09 19:59:53'),
(36, 51, '2025-05-09 19:59:53'),
(36, 61, '2025-05-09 19:59:53'),
(36, 62, '2025-05-09 19:59:53'),
(37, 26, '2025-05-09 19:59:53'),
(37, 62, '2025-05-09 19:59:53'),
(37, 63, '2025-05-09 19:59:53'),
(38, 54, '2025-05-11 20:07:47'),
(38, 64, '2025-05-11 20:07:47'),
(38, 65, '2025-05-11 20:07:47'),
(39, 54, '2025-05-11 20:07:07'),
(39, 65, '2025-05-11 20:07:07'),
(39, 66, '2025-05-11 20:07:07'),
(40, 54, '2025-05-11 20:06:27'),
(40, 67, '2025-05-11 20:06:27'),
(40, 68, '2025-05-11 20:06:27'),
(41, 8, '2025-05-09 20:11:47'),
(41, 14, '2025-05-09 20:11:47'),
(41, 99, '2025-05-09 20:11:47'),
(41, 121, '2025-05-09 20:11:47'),
(41, 122, '2025-05-09 20:11:47'),
(42, 14, '2025-05-09 20:11:47'),
(42, 99, '2025-05-09 20:11:47'),
(42, 100, '2025-05-09 20:11:47'),
(42, 123, '2025-05-09 20:11:47'),
(42, 124, '2025-05-09 20:11:47'),
(43, 8, '2025-05-09 20:11:47'),
(43, 11, '2025-05-09 20:11:47'),
(43, 14, '2025-05-09 20:11:47'),
(43, 32, '2025-05-09 20:11:47'),
(43, 99, '2025-05-09 20:11:47'),
(43, 125, '2025-05-09 20:11:47'),
(44, 14, '2025-05-09 20:11:47'),
(44, 16, '2025-05-09 20:11:47'),
(44, 17, '2025-05-09 20:11:47'),
(44, 99, '2025-05-09 20:11:47'),
(44, 126, '2025-05-09 20:11:47'),
(44, 127, '2025-05-09 20:11:47'),
(45, 14, '2025-05-09 20:11:47'),
(45, 16, '2025-05-09 20:11:47'),
(45, 47, '2025-05-09 20:11:47'),
(45, 76, '2025-05-09 20:11:47'),
(45, 99, '2025-05-09 20:11:47'),
(46, 14, '2025-05-09 20:11:47'),
(46, 24, '2025-05-09 20:11:47'),
(46, 27, '2025-05-09 20:11:47'),
(46, 76, '2025-05-09 20:11:47'),
(46, 99, '2025-05-09 20:11:47'),
(46, 128, '2025-05-09 20:11:47'),
(46, 129, '2025-05-09 20:11:47'),
(46, 130, '2025-05-09 20:11:47'),
(47, 12, '2025-05-09 20:11:47'),
(47, 43, '2025-05-09 20:11:47'),
(47, 69, '2025-05-09 20:11:47'),
(47, 131, '2025-05-09 20:11:47'),
(47, 132, '2025-05-09 20:11:47'),
(48, 12, '2025-05-09 20:11:47'),
(48, 41, '2025-05-09 20:11:47'),
(48, 69, '2025-05-09 20:11:47'),
(48, 70, '2025-05-09 20:11:47'),
(48, 133, '2025-05-09 20:11:47'),
(48, 134, '2025-05-09 20:11:47'),
(49, 12, '2025-05-14 02:32:43'),
(49, 54, '2025-05-14 02:32:43'),
(49, 135, '2025-05-14 02:32:43'),
(49, 136, '2025-05-14 02:32:43'),
(50, 12, '2025-05-14 02:33:52'),
(50, 42, '2025-05-14 02:33:52'),
(50, 43, '2025-05-14 02:33:52'),
(50, 70, '2025-05-14 02:33:52'),
(50, 137, '2025-05-14 02:33:52'),
(50, 138, '2025-05-14 02:33:52'),
(58, 14, '2025-05-09 20:21:31'),
(58, 99, '2025-05-09 20:21:31'),
(58, 100, '2025-05-09 20:21:31'),
(58, 149, '2025-05-09 20:21:31'),
(58, 150, '2025-05-09 20:21:31'),
(59, 10, '2025-05-09 20:21:31'),
(59, 14, '2025-05-09 20:21:31'),
(59, 49, '2025-05-09 20:21:31'),
(59, 51, '2025-05-09 20:21:31'),
(59, 70, '2025-05-09 20:21:31'),
(59, 99, '2025-05-09 20:21:31'),
(60, 8, '2025-05-09 20:21:31'),
(60, 14, '2025-05-09 20:21:31'),
(60, 69, '2025-05-09 20:21:31'),
(60, 99, '2025-05-09 20:21:31'),
(60, 100, '2025-05-09 20:21:31'),
(60, 151, '2025-05-09 20:21:31'),
(60, 152, '2025-05-09 20:21:31'),
(61, 14, '2025-05-09 20:21:31'),
(61, 40, '2025-05-09 20:21:31'),
(61, 99, '2025-05-09 20:21:31'),
(61, 100, '2025-05-09 20:21:31'),
(61, 154, '2025-05-09 20:21:31'),
(63, 8, '2025-05-09 20:26:53'),
(63, 14, '2025-05-09 20:26:53'),
(63, 36, '2025-05-09 20:26:53'),
(63, 69, '2025-05-09 20:26:53'),
(63, 99, '2025-05-09 20:26:53'),
(63, 100, '2025-05-09 20:26:53'),
(63, 125, '2025-05-09 20:26:53'),
(64, 2, '2025-05-09 20:26:53'),
(64, 3, '2025-05-09 20:26:53'),
(64, 14, '2025-05-09 20:26:53'),
(64, 17, '2025-05-09 20:26:53'),
(64, 70, '2025-05-09 20:26:53'),
(64, 99, '2025-05-09 20:26:53'),
(65, 8, '2025-05-09 20:26:53'),
(65, 14, '2025-05-09 20:26:53'),
(65, 36, '2025-05-09 20:26:53'),
(65, 53, '2025-05-09 20:26:53'),
(65, 69, '2025-05-09 20:26:53'),
(65, 99, '2025-05-09 20:26:53'),
(66, 14, '2025-05-09 20:26:53'),
(66, 76, '2025-05-09 20:26:53'),
(66, 99, '2025-05-09 20:26:53'),
(66, 100, '2025-05-09 20:26:53'),
(66, 125, '2025-05-09 20:26:53'),
(67, 8, '2025-05-09 20:26:53'),
(67, 14, '2025-05-09 20:26:53'),
(67, 69, '2025-05-09 20:26:53'),
(67, 99, '2025-05-09 20:26:53'),
(67, 100, '2025-05-09 20:26:53'),
(68, 8, '2025-05-09 20:26:53'),
(68, 14, '2025-05-09 20:26:53'),
(68, 34, '2025-05-09 20:26:53'),
(68, 70, '2025-05-09 20:26:53'),
(68, 99, '2025-05-09 20:26:53'),
(68, 100, '2025-05-09 20:26:53'),
(69, 3, '2025-05-09 20:26:53'),
(69, 14, '2025-05-09 20:26:53'),
(69, 76, '2025-05-09 20:26:53'),
(69, 99, '2025-05-09 20:26:53'),
(69, 100, '2025-05-09 20:26:53'),
(70, 8, '2025-05-09 20:26:53'),
(70, 14, '2025-05-09 20:26:53'),
(70, 34, '2025-05-09 20:26:53'),
(70, 37, '2025-05-09 20:26:53'),
(70, 99, '2025-05-09 20:26:53'),
(70, 100, '2025-05-09 20:26:53'),
(71, 14, '2025-05-09 20:26:53'),
(71, 38, '2025-05-09 20:26:53'),
(71, 39, '2025-05-09 20:26:53'),
(71, 66, '2025-05-09 20:26:53'),
(71, 76, '2025-05-09 20:26:53'),
(71, 99, '2025-05-09 20:26:53'),
(71, 100, '2025-05-09 20:26:53'),
(71, 149, '2025-05-09 20:26:53'),
(72, 8, '2025-05-09 20:26:53'),
(72, 14, '2025-05-09 20:26:53'),
(72, 53, '2025-05-09 20:26:53'),
(72, 69, '2025-05-09 20:26:53'),
(72, 70, '2025-05-09 20:26:53'),
(72, 99, '2025-05-09 20:26:53'),
(72, 125, '2025-05-09 20:26:53'),
(72, 151, '2025-05-09 20:26:53'),
(72, 152, '2025-05-09 20:26:53'),
(73, 14, '2025-05-09 20:26:53'),
(73, 99, '2025-05-09 20:26:53'),
(73, 100, '2025-05-09 20:26:53'),
(73, 124, '2025-05-09 20:26:53'),
(74, 8, '2025-05-09 20:26:53'),
(74, 14, '2025-05-09 20:26:53'),
(74, 32, '2025-05-09 20:26:53'),
(74, 36, '2025-05-09 20:26:53'),
(74, 70, '2025-05-09 20:26:53'),
(74, 99, '2025-05-09 20:26:53'),
(74, 125, '2025-05-09 20:26:53'),
(75, 2, '2025-05-09 20:26:53'),
(75, 14, '2025-05-09 20:26:53'),
(75, 17, '2025-05-09 20:26:53'),
(75, 70, '2025-05-09 20:26:53'),
(75, 99, '2025-05-09 20:26:53'),
(75, 126, '2025-05-09 20:26:53'),
(75, 127, '2025-05-09 20:26:53'),
(76, 8, '2025-05-09 20:26:53'),
(76, 14, '2025-05-09 20:26:53'),
(76, 47, '2025-05-09 20:26:53'),
(76, 69, '2025-05-09 20:26:53'),
(76, 76, '2025-05-09 20:26:53'),
(76, 99, '2025-05-09 20:26:53'),
(76, 151, '2025-05-09 20:26:53'),
(76, 152, '2025-05-09 20:26:53'),
(77, 8, '2025-05-10 21:12:24'),
(77, 14, '2025-05-10 21:12:24'),
(77, 50, '2025-05-10 21:12:24'),
(77, 76, '2025-05-10 21:12:24'),
(77, 99, '2025-05-10 21:12:24'),
(77, 125, '2025-05-10 21:12:24'),
(84, 14, '2025-05-21 17:00:53'),
(84, 99, '2025-05-21 17:00:53'),
(90, 14, '2025-06-09 05:34:37'),
(149, 14, '2025-05-09 20:21:31'),
(149, 99, '2025-05-09 20:21:31'),
(149, 100, '2025-05-09 20:21:31'),
(149, 123, '2025-05-09 20:21:31'),
(149, 124, '2025-05-09 20:21:31'),
(152, 8, '2025-05-09 20:21:31'),
(152, 11, '2025-05-09 20:21:31'),
(152, 14, '2025-05-09 20:21:31'),
(152, 32, '2025-05-09 20:21:31'),
(152, 99, '2025-05-09 20:21:31'),
(152, 125, '2025-05-09 20:21:31'),
(155, 14, '2025-05-09 20:21:31'),
(155, 16, '2025-05-09 20:21:31'),
(155, 17, '2025-05-09 20:21:31'),
(155, 99, '2025-05-09 20:21:31'),
(155, 126, '2025-05-09 20:21:31'),
(155, 127, '2025-05-09 20:21:31'),
(158, 14, '2025-05-09 20:21:31'),
(158, 16, '2025-05-09 20:21:31'),
(158, 47, '2025-05-09 20:21:31'),
(158, 76, '2025-05-09 20:21:31'),
(158, 99, '2025-05-09 20:21:31'),
(161, 14, '2025-05-09 20:21:31'),
(161, 24, '2025-05-09 20:21:31'),
(161, 27, '2025-05-09 20:21:31'),
(161, 76, '2025-05-09 20:21:31'),
(161, 99, '2025-05-09 20:21:31'),
(161, 128, '2025-05-09 20:21:31'),
(161, 129, '2025-05-09 20:21:31'),
(161, 130, '2025-05-09 20:21:31');

-- --------------------------------------------------------

--
-- Table structure for table `product_variants`
--

CREATE TABLE `product_variants` (
  `id` int(11) NOT NULL,
  `product_id` int(11) NOT NULL,
  `variant_name` varchar(255) NOT NULL COMMENT 'Variant name (e.g., "500g", "1kg", "Small", "Red")',
  `sku` varchar(100) DEFAULT NULL COMMENT 'Stock Keeping Unit - unique variant identifier',
  `price` decimal(10,2) NOT NULL COMMENT 'Regular price of this variant',
  `sale_price` decimal(10,2) DEFAULT NULL COMMENT 'Discounted price if on sale',
  `discount_percentage` decimal(5,2) DEFAULT NULL COMMENT 'Percentage discount applied',
  `weight` decimal(10,3) DEFAULT NULL COMMENT 'Weight in kg',
  `weight_unit` enum('g','kg','mg','lb','oz') DEFAULT 'g' COMMENT 'Unit of weight measurement',
  `dimensions` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL COMMENT 'JSON object with length, width, height in cm' CHECK (json_valid(`dimensions`)),
  `status` enum('active','inactive','archived') NOT NULL DEFAULT 'inactive' COMMENT 'Variant availability status',
  `min_order_quantity` int(11) DEFAULT 1 COMMENT 'Minimum quantity that can be ordered',
  `max_order_quantity` int(11) DEFAULT NULL COMMENT 'Maximum quantity that can be ordered',
  `display_order` int(11) NOT NULL DEFAULT 0 COMMENT 'Order for display in listings',
  `created_by` int(11) DEFAULT NULL COMMENT 'Admin who created the product variant',
  `updated_by` int(11) DEFAULT NULL COMMENT 'Admin who last updated the product variant',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT NULL ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `product_variants`
--

INSERT INTO `product_variants` (`id`, `product_id`, `variant_name`, `sku`, `price`, `sale_price`, `discount_percentage`, `weight`, `weight_unit`, `dimensions`, `status`, `min_order_quantity`, `max_order_quantity`, `display_order`, `created_by`, `updated_by`, `created_at`, `updated_at`) VALUES
(1, 1, 'Small 250g', 'KK-S', 299.00, 249.00, 16.72, 250.000, 'g', NULL, 'active', 1, 10, 1, 2, 2, '2025-05-09 12:33:27', '2025-05-31 17:13:53'),
(2, 1, 'Medium 500g', 'KK-M', 549.00, 499.00, 9.11, 500.000, 'g', NULL, 'active', 1, 10, 4, 2, 2, '2025-05-09 12:33:28', '2025-06-07 08:38:52'),
(3, 1, 'Large 1kg', 'KK-L', 1049.00, 999.00, 4.77, 1000.000, 'g', NULL, 'active', 1, 10, 1, 2, 2, '2025-05-09 12:33:28', '2025-05-29 01:37:43'),
(4, 2, 'Small 250g', 'RG-S', 199.00, 179.00, 10.05, 250.000, 'g', NULL, 'active', 1, 10, 2, 2, NULL, '2025-05-09 12:41:52', '2025-05-29 09:31:21'),
(5, 2, 'Medium 500g', 'RG-M', 349.00, 329.00, 5.73, 500.000, 'g', NULL, 'active', 1, 10, 0, 2, NULL, '2025-05-09 12:41:52', NULL),
(6, 2, 'Large 1kg', 'RG-L', 649.00, 599.00, 7.70, 1000.000, 'g', NULL, 'active', 1, 10, 0, 2, NULL, '2025-05-09 12:41:52', NULL),
(7, 3, 'Small 250g', 'SP-S', 199.00, 179.00, 10.05, 250.000, 'g', NULL, 'active', 1, 10, 2, 2, NULL, '2025-05-09 13:32:41', '2025-05-29 09:31:21'),
(8, 3, 'Medium 500g', 'SP-M', 349.00, 329.00, 5.73, 500.000, 'g', NULL, 'active', 1, 10, 0, 2, NULL, '2025-05-09 13:32:42', NULL),
(9, 3, 'Large 1kg', 'SP-L', 649.00, 599.00, 7.70, 1000.000, 'g', NULL, 'active', 1, 10, 0, 2, NULL, '2025-05-09 13:32:42', NULL),
(10, 4, 'Small 250g', 'KKD-S', 199.00, 179.00, 10.05, 250.000, 'g', NULL, 'active', 1, 10, 1, 2, NULL, '2025-05-09 13:37:58', '2025-05-29 09:35:55'),
(11, 4, 'Medium 500g', 'KKD-M', 349.00, 329.00, 5.73, 500.000, 'g', NULL, 'active', 1, 10, 0, 2, NULL, '2025-05-09 13:37:58', NULL),
(12, 4, 'Large 1kg', 'KKD-L', 649.00, 599.00, 7.70, 1000.000, 'g', NULL, 'active', 1, 10, 0, 2, NULL, '2025-05-09 13:37:58', NULL),
(13, 5, 'Small 250g', 'ML-S', 199.00, 179.00, 10.05, 250.000, 'g', NULL, 'active', 1, 10, 1, 2, NULL, '2025-05-09 13:53:25', '2025-05-29 12:47:06'),
(14, 5, 'Medium 500g', 'ML-M', 349.00, 329.00, 5.73, 500.000, 'g', NULL, 'active', 1, 10, 0, 2, NULL, '2025-05-09 13:53:25', NULL),
(15, 5, 'Large 1kg', 'ML-L', 649.00, 599.00, 7.70, 1000.000, 'g', NULL, 'active', 1, 10, 0, 2, NULL, '2025-05-09 13:53:25', NULL),
(16, 6, 'Small 250g', 'RM-S', 199.00, 179.00, 10.05, 250.000, 'g', NULL, 'active', 1, 10, 1, 2, NULL, '2025-05-09 14:01:20', '2025-05-29 09:35:55'),
(17, 6, 'Medium 500g', 'RM-M', 349.00, 329.00, 5.73, 500.000, 'g', NULL, 'active', 1, 10, 0, 2, NULL, '2025-05-09 14:01:20', NULL),
(18, 6, 'Large 1kg', 'RM-L', 649.00, 599.00, 7.70, 1000.000, 'g', NULL, 'active', 1, 10, 0, 2, NULL, '2025-05-09 14:01:21', NULL),
(19, 7, 'Small 250g', 'MC-S', 199.00, 179.00, 10.05, 250.000, 'g', NULL, 'active', 1, 10, 2, 2, 1, '2025-05-09 14:46:39', '2025-05-29 21:27:52'),
(20, 7, 'Medium 500g', 'MC-M', 349.00, 329.00, 5.73, 500.000, 'g', NULL, 'active', 1, 10, 0, 2, 1, '2025-05-09 14:46:40', '2025-05-09 19:37:41'),
(21, 7, 'Large 1kg', 'MC-L', 649.00, 599.00, 7.70, 1000.000, 'g', NULL, 'active', 1, 10, 0, 2, 1, '2025-05-09 14:46:40', '2025-05-09 19:37:41'),
(22, 8, 'Small 250g', 'RB-S', 199.00, 179.00, 10.05, 250.000, 'g', NULL, 'active', 1, 10, 1, 2, 2, '2025-05-09 14:49:54', '2025-05-29 21:33:39'),
(23, 8, 'Medium 500g', 'RB-M', 349.00, 329.00, 5.73, 500.000, 'g', NULL, 'active', 1, 10, 0, 2, 2, '2025-05-09 14:49:54', '2025-05-09 14:50:09'),
(24, 8, 'Large 1kg', 'RB-L', 649.00, 599.00, 7.70, 1000.000, 'g', NULL, 'active', 1, 10, 0, 2, 2, '2025-05-09 14:49:54', '2025-05-09 14:50:10'),
(25, 9, 'Small 250g', 'BS-S', 199.00, 179.00, 10.05, 250.000, 'g', NULL, 'active', 1, 10, 1, 2, NULL, '2025-05-09 14:53:18', '2025-05-29 21:35:50'),
(26, 9, 'Medium 500g', 'BS-M', 349.00, 329.00, 5.73, 500.000, 'g', NULL, 'active', 1, 10, 0, 2, NULL, '2025-05-09 14:53:19', NULL),
(27, 9, 'Large 1kg', 'BS-L', 649.00, 599.00, 7.70, 1000.000, 'g', NULL, 'active', 1, 10, 0, 2, NULL, '2025-05-09 14:53:19', NULL),
(28, 10, 'Small 250g', 'CC-S', 199.00, 179.00, 10.05, 250.000, 'g', NULL, 'active', 1, 10, 1, 2, NULL, '2025-05-09 14:55:58', '2025-05-29 22:20:12'),
(29, 10, 'Medium 500g', 'CC-M', 349.00, 329.00, 5.73, 500.000, 'g', NULL, 'active', 1, 10, 0, 2, NULL, '2025-05-09 14:55:59', NULL),
(30, 10, 'Large 1kg', 'CC-L', 649.00, 599.00, 7.70, 1000.000, 'g', NULL, 'active', 1, 10, 0, 2, NULL, '2025-05-09 14:55:59', NULL),
(31, 11, 'Small 250g', 'KR-S', 199.00, 179.00, 10.05, 250.000, 'g', NULL, 'active', 1, 10, 1, 2, 2, '2025-05-09 14:59:09', '2025-05-29 23:04:57'),
(32, 11, 'Medium 500g', 'KR-M', 349.00, 329.00, 5.73, 500.000, 'g', NULL, 'active', 1, 10, 0, 2, 2, '2025-05-09 14:59:09', '2025-05-09 15:03:48'),
(33, 11, 'Large 1kg', 'KR-L', 649.00, 599.00, 7.70, 1000.000, 'g', NULL, 'active', 1, 10, 0, 2, 2, '2025-05-09 14:59:09', '2025-05-09 15:03:48'),
(34, 12, 'Small 250g', 'PB-S', 199.00, 179.00, 10.05, 250.000, 'g', NULL, 'active', 1, 10, 1, 2, NULL, '2025-05-09 15:03:36', '2025-05-29 23:12:31'),
(35, 12, 'Medium 500g', 'PB-M', 349.00, 329.00, 5.73, 500.000, 'g', NULL, 'active', 1, 10, 0, 2, NULL, '2025-05-09 15:03:36', NULL),
(36, 12, 'Large 1kg', 'PB-L', 649.00, 599.00, 7.70, 1000.000, 'g', NULL, 'active', 1, 10, 0, 2, NULL, '2025-05-09 15:03:36', NULL),
(37, 13, 'Small 250g', 'BK-S', 199.00, 179.00, 10.05, 250.000, 'g', NULL, 'active', 1, 10, 1, 2, NULL, '2025-05-09 15:07:19', '2025-05-30 23:49:17'),
(38, 13, 'Medium 500g', 'BK-M', 349.00, 329.00, 5.73, 500.000, 'g', NULL, 'active', 1, 10, 0, 2, NULL, '2025-05-09 15:07:19', NULL),
(39, 13, 'Large 1kg', 'BK-L', 649.00, 599.00, 7.70, 1000.000, 'g', NULL, 'active', 1, 10, 0, 2, NULL, '2025-05-09 15:07:19', NULL),
(40, 14, 'Small 250g', 'CB-S', 199.00, 179.00, 10.05, 250.000, 'g', NULL, 'active', 1, 10, 0, 2, 1, '2025-05-09 19:59:53', '2025-05-11 20:11:24'),
(41, 14, 'Medium 500g', 'CB-M', 349.00, 329.00, 5.73, 500.000, 'g', NULL, 'active', 1, 10, 0, 2, 1, '2025-05-09 19:59:53', '2025-05-11 20:11:24'),
(42, 14, 'Large 1kg', 'CB-L', 649.00, 599.00, 7.70, 1000.000, 'g', NULL, 'active', 1, 10, 0, 2, 1, '2025-05-09 19:59:53', '2025-05-11 20:11:24'),
(43, 15, 'Small 250g', 'CDFM-S', 199.00, 179.00, 10.05, 250.000, 'g', NULL, 'active', 1, 10, 1, 2, 1, '2025-05-09 19:59:53', '2025-05-30 17:08:03'),
(44, 15, 'Medium 500g', 'CDFM-M', 349.00, 329.00, 5.73, 500.000, 'g', NULL, 'active', 1, 10, 0, 2, 1, '2025-05-09 19:59:53', '2025-05-11 20:11:59'),
(45, 15, 'Large 1kg', 'CDFM-L', 649.00, 599.00, 7.70, 1000.000, 'g', NULL, 'active', 1, 10, 0, 2, 1, '2025-05-09 19:59:53', '2025-05-11 20:11:59'),
(46, 16, 'Small 250g', 'MP-S', 199.00, 179.00, 10.05, 250.000, 'g', NULL, 'active', 1, 10, 0, 2, 1, '2025-05-09 19:59:53', '2025-05-11 20:12:23'),
(47, 16, 'Medium 500g', 'MP-M', 349.00, 329.00, 5.73, 500.000, 'g', NULL, 'active', 1, 10, 0, 2, 1, '2025-05-09 19:59:53', '2025-05-11 20:12:23'),
(48, 16, 'Large 1kg', 'MP-L', 649.00, 599.00, 7.70, 1000.000, 'g', NULL, 'active', 1, 10, 0, 2, 1, '2025-05-09 19:59:53', '2025-05-11 20:12:23'),
(49, 17, 'Small 250g', 'GL-S', 199.00, 179.00, 10.05, 250.000, 'g', NULL, 'active', 1, 10, 0, 2, 1, '2025-05-09 19:59:53', '2025-05-11 20:12:54'),
(50, 17, 'Medium 500g', 'GL-M', 349.00, 329.00, 5.73, 500.000, 'g', NULL, 'active', 1, 10, 0, 2, 1, '2025-05-09 19:59:53', '2025-05-11 20:12:54'),
(51, 17, 'Large 1kg', 'GL-L', 649.00, 599.00, 7.70, 1000.000, 'g', NULL, 'active', 1, 10, 0, 2, 1, '2025-05-09 19:59:53', '2025-05-11 20:12:54'),
(52, 18, 'Small 250g', 'CDH-S', 199.00, 179.00, 10.05, 250.000, 'g', NULL, 'active', 1, 10, 0, 2, 1, '2025-05-09 19:59:53', '2025-05-11 20:14:43'),
(53, 18, 'Medium 500g', 'CDH-M', 349.00, 329.00, 5.73, 500.000, 'g', NULL, 'active', 1, 10, 0, 2, 1, '2025-05-09 19:59:53', '2025-05-11 20:14:43'),
(54, 18, 'Large 1kg', 'CDH-L', 649.00, 599.00, 7.70, 1000.000, 'g', NULL, 'active', 1, 10, 0, 2, 1, '2025-05-09 19:59:53', '2025-05-11 20:14:43'),
(55, 19, 'Small 250g', 'MDH-S', 199.00, 179.00, 10.05, 250.000, 'g', NULL, 'active', 1, 10, 0, 2, 1, '2025-05-09 19:59:53', '2025-05-11 20:15:38'),
(56, 19, 'Medium 500g', 'MDH-M', 349.00, 329.00, 5.73, 500.000, 'g', NULL, 'active', 1, 10, 0, 2, 1, '2025-05-09 19:59:53', '2025-05-11 20:15:38'),
(57, 19, 'Large 1kg', 'MDH-L', 649.00, 599.00, 7.70, 1000.000, 'g', NULL, 'active', 1, 10, 0, 2, 1, '2025-05-09 19:59:53', '2025-05-11 20:15:38'),
(58, 20, 'Small 250g', 'BL-S', 199.00, 179.00, 10.05, 250.000, 'g', NULL, 'active', 1, 10, 0, 2, 1, '2025-05-09 19:59:53', '2025-05-11 20:16:26'),
(59, 20, 'Medium 500g', 'BL-M', 349.00, 329.00, 5.73, 500.000, 'g', NULL, 'active', 1, 10, 0, 2, 1, '2025-05-09 19:59:53', '2025-05-11 20:16:26'),
(60, 20, 'Large 1kg', 'BL-L', 649.00, 599.00, 7.70, 1000.000, 'g', NULL, 'active', 1, 10, 0, 2, 1, '2025-05-09 19:59:53', '2025-05-11 20:16:26'),
(61, 21, 'Small 250g', 'SFKK-S', 249.00, 229.00, 8.03, 250.000, 'g', NULL, 'active', 1, 10, 0, 2, 1, '2025-05-09 19:59:53', '2025-05-11 20:17:10'),
(62, 21, 'Medium 500g', 'SFKK-M', 449.00, 419.00, 6.68, 500.000, 'g', NULL, 'active', 1, 10, 0, 2, 1, '2025-05-09 19:59:53', '2025-05-11 20:17:10'),
(63, 21, 'Large 1kg', 'SFKK-L', 849.00, 799.00, 5.89, 1000.000, 'g', NULL, 'active', 1, 10, 0, 2, 1, '2025-05-09 19:59:53', '2025-05-11 20:17:10'),
(64, 22, 'Small 250g', 'SFP-S', 249.00, 229.00, 8.03, 250.000, 'g', NULL, 'active', 1, 10, 0, 2, 1, '2025-05-09 19:59:53', '2025-05-11 20:17:48'),
(65, 22, 'Medium 500g', 'SFP-M', 449.00, 419.00, 6.68, 500.000, 'g', NULL, 'active', 1, 10, 0, 2, 1, '2025-05-09 19:59:53', '2025-05-11 20:17:48'),
(66, 22, 'Large 1kg', 'SFP-L', 849.00, 799.00, 5.89, 1000.000, 'g', NULL, 'active', 1, 10, 0, 2, 1, '2025-05-09 19:59:53', '2025-05-11 20:17:48'),
(67, 23, 'Small 250g', 'SD-S', 199.00, 179.00, 10.05, 250.000, 'g', NULL, 'active', 1, 10, 0, 2, 1, '2025-05-09 19:59:53', '2025-05-11 20:18:22'),
(68, 23, 'Medium 500g', 'SD-M', 349.00, 329.00, 5.73, 500.000, 'g', NULL, 'active', 1, 10, 0, 2, 1, '2025-05-09 19:59:53', '2025-05-11 20:18:22'),
(69, 23, 'Large 1kg', 'SD-L', 649.00, 599.00, 7.70, 1000.000, 'g', NULL, 'active', 1, 10, 0, 2, 1, '2025-05-09 19:59:53', '2025-05-11 20:18:22'),
(70, 24, 'Small 250g', 'MCC-S', 199.00, 179.00, 10.05, 250.000, 'g', NULL, 'active', 1, 10, 0, 2, 1, '2025-05-09 19:59:53', '2025-05-11 20:19:22'),
(71, 24, 'Medium 500g', 'MCC-M', 349.00, 329.00, 5.73, 500.000, 'g', NULL, 'active', 1, 10, 0, 2, 1, '2025-05-09 19:59:53', '2025-05-11 20:19:22'),
(72, 24, 'Large 1kg', 'MCC-L', 649.00, 599.00, 7.70, 1000.000, 'g', NULL, 'active', 1, 10, 0, 2, 1, '2025-05-09 19:59:53', '2025-05-11 20:19:22'),
(73, 25, 'Small 250g', 'GJ-S', 199.00, 179.00, 10.05, 250.000, 'g', NULL, 'active', 1, 10, 0, 2, 1, '2025-05-09 19:59:53', '2025-05-11 20:20:15'),
(74, 25, 'Medium 500g', 'GJ-M', 349.00, 329.00, 5.73, 500.000, 'g', NULL, 'active', 1, 10, 0, 2, 1, '2025-05-09 19:59:53', '2025-05-11 20:20:15'),
(75, 25, 'Large 1kg', 'GJ-L', 649.00, 599.00, 7.70, 1000.000, 'g', NULL, 'active', 1, 10, 0, 2, 1, '2025-05-09 19:59:53', '2025-05-11 20:20:15'),
(76, 26, '500g', 'CTC-500', 599.00, 549.00, 8.35, 500.000, 'g', NULL, 'active', 1, 10, 0, 2, 1, '2025-05-09 19:59:53', '2025-05-11 20:10:33'),
(77, 26, '1kg', 'CTC-1K', 1099.00, 999.00, 9.10, 1000.000, 'g', NULL, 'active', 1, 10, 0, 2, 1, '2025-05-09 19:59:53', '2025-05-11 20:10:33'),
(78, 26, '2kg', 'CTC-2K', 2099.00, 1999.00, 4.76, 2000.000, 'g', NULL, 'active', 1, 10, 0, 2, 1, '2025-05-09 19:59:53', '2025-05-11 20:10:33'),
(79, 27, '500g', 'BC-500', 599.00, 549.00, 8.35, 500.000, 'g', NULL, 'active', 1, 10, 0, 2, 1, '2025-05-09 19:59:53', '2025-05-11 20:09:52'),
(80, 27, '1kg', 'BC-1K', 1099.00, 999.00, 9.10, 1000.000, 'g', NULL, 'active', 1, 10, 0, 2, 1, '2025-05-09 19:59:53', '2025-05-11 20:09:52'),
(81, 27, '2kg', 'BC-2K', 2099.00, 1999.00, 4.76, 2000.000, 'g', NULL, 'active', 1, 10, 0, 2, 1, '2025-05-09 19:59:53', '2025-05-11 20:09:52'),
(82, 28, '500g', 'RV-500', 599.00, 549.00, 8.35, 500.000, 'g', NULL, 'active', 1, 10, 0, 2, 1, '2025-05-09 19:59:53', '2025-05-11 20:09:21'),
(83, 28, '1kg', 'RV-1K', 1099.00, 999.00, 9.10, 1000.000, 'g', NULL, 'active', 1, 10, 0, 2, 1, '2025-05-09 19:59:53', '2025-05-11 20:09:21'),
(84, 28, '2kg', 'RV-2K', 2099.00, 1999.00, 4.76, 2000.000, 'g', NULL, 'active', 1, 10, 0, 2, 1, '2025-05-09 19:59:53', '2025-05-11 20:09:21'),
(85, 29, '500g', 'MM-500', 599.00, 549.00, 8.35, 500.000, 'g', NULL, 'active', 1, 10, 0, 2, 1, '2025-05-09 19:59:53', '2025-05-11 20:08:48'),
(86, 29, '1kg', 'MM-1K', 1099.00, 999.00, 9.10, 1000.000, 'g', NULL, 'active', 1, 10, 0, 2, 1, '2025-05-09 19:59:53', '2025-05-11 20:08:48'),
(87, 29, '2kg', 'MM-2K', 2099.00, 1999.00, 4.76, 2000.000, 'g', NULL, 'active', 1, 10, 0, 2, 1, '2025-05-09 19:59:53', '2025-05-11 20:08:48'),
(91, 31, '250g', 'PIS-250', 299.00, 279.00, 6.69, 250.000, 'g', NULL, 'active', 1, 10, 0, 2, NULL, '2025-05-09 19:59:53', NULL),
(92, 31, '500g', 'PIS-500', 579.00, 549.00, 5.18, 500.000, 'g', NULL, 'active', 1, 10, 0, 2, NULL, '2025-05-09 19:59:53', NULL),
(93, 31, '1kg', 'PIS-1K', 1149.00, 1099.00, 4.35, 1000.000, 'g', NULL, 'active', 1, 10, 0, 2, NULL, '2025-05-09 19:59:53', NULL),
(94, 32, '250g', 'DFG-250', 299.00, 279.00, 6.69, 250.000, 'g', NULL, 'active', 1, 10, 0, 2, 1, '2025-05-09 19:59:53', '2025-05-11 20:08:18'),
(95, 32, '500g', 'DFG-500', 579.00, 549.00, 5.18, 500.000, 'g', NULL, 'active', 1, 10, 0, 2, 1, '2025-05-09 19:59:53', '2025-05-11 20:08:18'),
(96, 32, '1kg', 'DFG-1K', 1149.00, 1099.00, 4.35, 1000.000, 'g', NULL, 'active', 1, 10, 0, 2, 1, '2025-05-09 19:59:53', '2025-05-11 20:08:18'),
(97, 33, '250g', 'ANJ-250', 299.00, 279.00, 6.69, 250.000, 'g', NULL, 'active', 1, 10, 0, 2, NULL, '2025-05-09 19:59:53', NULL),
(98, 33, '500g', 'ANJ-500', 579.00, 549.00, 5.18, 500.000, 'g', NULL, 'active', 1, 10, 0, 2, NULL, '2025-05-09 19:59:53', NULL),
(99, 33, '1kg', 'ANJ-1K', 1149.00, 1099.00, 4.35, 1000.000, 'g', NULL, 'active', 1, 10, 0, 2, NULL, '2025-05-09 19:59:53', NULL),
(104, 35, '400g', 'MC-400', 189.00, 169.00, 10.58, 400.000, 'g', NULL, 'active', 1, 10, 0, 2, NULL, '2025-05-09 19:59:53', NULL),
(105, 35, '1kg', 'MC-1K', 449.00, 399.00, 11.14, 1000.000, 'g', NULL, 'active', 1, 10, 0, 2, NULL, '2025-05-09 19:59:53', NULL),
(107, 36, '200g', 'RM-200', 189.00, 169.00, 10.58, 200.000, 'g', NULL, 'archived', 1, 10, 0, 2, NULL, '2025-05-09 19:59:53', '2025-05-11 15:54:34'),
(108, 36, '500g', 'RM-500', 399.00, 359.00, 10.03, 500.000, 'g', NULL, 'archived', 1, 10, 0, 2, NULL, '2025-05-09 19:59:53', '2025-05-11 15:54:34'),
(112, 38, 'Small (1.2 kg)', 'DDH-S', 999.00, 899.00, 10.01, 1200.000, 'g', NULL, 'active', 1, 10, 0, 2, 1, '2025-05-09 19:59:53', '2025-05-11 20:07:47'),
(113, 38, 'Medium (2 kg)', 'DDH-M', 1599.00, 1499.00, 6.25, 2000.000, 'g', NULL, 'active', 1, 10, 0, 2, 1, '2025-05-09 19:59:53', '2025-05-11 20:07:47'),
(114, 38, 'Large (3 kg)', 'DDH-L', 2299.00, 2099.00, 8.70, 3000.000, 'g', NULL, 'active', 1, 10, 0, 2, 1, '2025-05-09 19:59:53', '2025-05-11 20:07:47'),
(115, 39, 'Small (1.2 kg)', 'HCH-S', 999.00, 899.00, 10.01, 1200.000, 'g', NULL, 'active', 1, 10, 0, 2, 1, '2025-05-09 19:59:53', '2025-05-11 20:07:07'),
(116, 39, 'Medium (2 kg)', 'HCH-M', 1599.00, 1499.00, 6.25, 2000.000, 'g', NULL, 'active', 1, 10, 0, 2, 1, '2025-05-09 19:59:53', '2025-05-11 20:07:07'),
(117, 39, 'Large (3 kg)', 'HCH-L', 2299.00, 2099.00, 8.70, 3000.000, 'g', NULL, 'active', 1, 10, 0, 2, 1, '2025-05-09 19:59:53', '2025-05-11 20:07:07'),
(118, 40, 'Small (1.5 kg)', 'POGB-S', 1199.00, 1099.00, 8.34, 1500.000, 'g', NULL, 'active', 1, 10, 0, 2, 1, '2025-05-09 19:59:53', '2025-05-11 20:06:27'),
(119, 40, 'Medium (2.5 kg)', 'POGB-M', 1899.00, 1799.00, 5.27, 2500.000, 'g', NULL, 'active', 1, 10, 0, 2, 1, '2025-05-09 19:59:53', '2025-05-11 20:06:27'),
(120, 40, 'Large (3.5 kg)', 'POGB-L', 2599.00, 2399.00, 7.70, 3500.000, 'g', NULL, 'active', 1, 10, 0, 2, 1, '2025-05-09 19:59:53', '2025-05-11 20:06:27'),
(124, 42, 'Small 250g', 'JLB-S', 179.00, 159.00, 11.17, 250.000, 'g', NULL, 'active', 1, 10, 0, 2, 1, '2025-05-09 20:11:47', '2025-05-09 22:19:35'),
(125, 42, 'Medium 500g', 'JLB-M', 329.00, 299.00, 9.12, 500.000, 'g', NULL, 'active', 1, 10, 0, 2, 1, '2025-05-09 20:11:47', '2025-05-09 22:19:35'),
(126, 42, 'Large 1kg', 'JLB-L', 599.00, 549.00, 8.35, 1000.000, 'g', NULL, 'active', 1, 10, 0, 2, 1, '2025-05-09 20:11:47', '2025-05-09 22:19:35'),
(127, 43, 'Small 250g', 'KP-S', 219.00, 199.00, 9.13, 250.000, 'g', NULL, 'active', 1, 10, 0, 2, 1, '2025-05-09 20:11:47', '2025-05-09 21:54:06'),
(128, 43, 'Medium 500g', 'KP-M', 399.00, 369.00, 7.52, 500.000, 'g', NULL, 'active', 1, 10, 0, 2, 1, '2025-05-09 20:11:47', '2025-05-09 21:54:06'),
(129, 43, 'Large 1kg', 'KP-L', 749.00, 699.00, 6.68, 1000.000, 'g', NULL, 'active', 1, 10, 0, 2, 1, '2025-05-09 20:11:47', '2025-05-09 21:54:06'),
(130, 44, 'Small 250g', 'AB-S', 249.00, 229.00, 8.03, 250.000, 'g', NULL, 'active', 1, 10, 0, 2, 1, '2025-05-09 20:11:47', '2025-05-09 21:53:38'),
(131, 44, 'Medium 500g', 'AB-M', 449.00, 419.00, 6.68, 500.000, 'g', NULL, 'active', 1, 10, 0, 2, 1, '2025-05-09 20:11:47', '2025-05-09 21:53:38'),
(132, 44, 'Large 1kg', 'AB-L', 849.00, 799.00, 5.89, 1000.000, 'g', NULL, 'active', 1, 10, 0, 2, 1, '2025-05-09 20:11:47', '2025-05-09 21:53:39'),
(133, 45, 'Small 250g', 'MB-S', 229.00, 209.00, 8.73, 250.000, 'g', NULL, 'active', 1, 10, 0, 2, 1, '2025-05-09 20:11:47', '2025-05-09 21:53:08'),
(134, 45, 'Medium 500g', 'MB-M', 429.00, 399.00, 6.99, 500.000, 'g', NULL, 'active', 1, 10, 0, 2, 1, '2025-05-09 20:11:47', '2025-05-09 21:53:08'),
(135, 45, 'Large 1kg', 'MB-L', 829.00, 779.00, 6.03, 1000.000, 'g', NULL, 'active', 1, 10, 0, 2, 1, '2025-05-09 20:11:47', '2025-05-09 21:53:08'),
(136, 46, 'Small 250g', 'GH-S', 219.00, 199.00, 9.13, 250.000, 'g', NULL, 'active', 1, 10, 0, 2, 1, '2025-05-09 20:11:47', '2025-05-09 21:52:36'),
(137, 46, 'Medium 500g', 'GH-M', 399.00, 369.00, 7.52, 500.000, 'g', NULL, 'active', 1, 10, 0, 2, 1, '2025-05-09 20:11:47', '2025-05-09 21:52:36'),
(138, 46, 'Large 1kg', 'GH-L', 749.00, 699.00, 6.68, 1000.000, 'g', NULL, 'active', 1, 10, 0, 2, 1, '2025-05-09 20:11:47', '2025-05-09 21:52:37'),
(139, 47, '500g', 'PC-500', 599.00, 549.00, 8.35, 500.000, 'g', NULL, 'active', 1, 10, 0, 2, 1, '2025-05-09 20:11:47', '2025-05-09 21:51:54'),
(140, 47, '1kg', 'PC-1K', 1099.00, 999.00, 9.10, 1000.000, 'g', NULL, 'active', 1, 10, 0, 2, 1, '2025-05-09 20:11:47', '2025-05-09 21:51:54'),
(141, 47, '2kg', 'PC-2K', 2099.00, 1999.00, 4.76, 2000.000, 'g', NULL, 'active', 1, 10, 0, 2, 1, '2025-05-09 20:11:47', '2025-05-09 21:51:54'),
(142, 48, '500g', 'BFC-500', 649.00, 599.00, 7.70, 500.000, 'g', NULL, 'active', 1, 10, 0, 2, 1, '2025-05-09 20:11:47', '2025-05-09 21:50:45'),
(143, 48, '1kg', 'BFC-1K', 1199.00, 1099.00, 8.34, 1000.000, 'g', NULL, 'active', 1, 10, 0, 2, 1, '2025-05-09 20:11:47', '2025-05-09 21:50:45'),
(144, 48, '2kg', 'BFC-2K', 2299.00, 2199.00, 4.35, 2000.000, 'g', NULL, 'active', 1, 10, 0, 2, 1, '2025-05-09 20:11:47', '2025-05-09 21:50:45'),
(145, 49, '500g', 'FC-500', 549.00, 499.00, 9.11, 500.000, 'g', NULL, 'active', 1, 10, 0, 2, 1, '2025-05-09 20:11:47', '2025-05-14 02:32:43'),
(146, 49, '1kg', 'FC-1K', 999.00, 929.00, 7.01, 1000.000, 'g', NULL, 'active', 1, 10, 0, 2, 1, '2025-05-09 20:11:47', '2025-05-14 02:32:43'),
(147, 50, 'Single Digit', 'NC-SD', 1299.00, 1199.00, 7.70, 1000.000, 'g', NULL, 'active', 1, 10, 0, 2, 1, '2025-05-09 20:11:47', '2025-05-14 02:33:51'),
(148, 50, 'Double Digit', 'NC-DD', 2499.00, 2299.00, 8.00, 2000.000, 'g', NULL, 'active', 1, 10, 0, 2, 1, '2025-05-09 20:11:47', '2025-05-14 02:33:51'),
(152, 149, 'Small 250g', 'JLB-S-42', 179.00, 159.00, 11.17, 250.000, 'g', NULL, 'active', 1, 10, 0, 2, NULL, '2025-05-09 20:21:31', NULL),
(153, 149, 'Medium 500g', 'JLB-M-42', 329.00, 299.00, 9.12, 500.000, 'g', NULL, 'active', 1, 10, 0, 2, NULL, '2025-05-09 20:21:31', NULL),
(154, 149, 'Large 1kg', 'JLB-L-42', 599.00, 549.00, 8.35, 1000.000, 'g', NULL, 'active', 1, 10, 0, 2, NULL, '2025-05-09 20:21:31', NULL),
(155, 152, 'Small 250g', 'KP-S-43', 219.00, 199.00, 9.13, 250.000, 'g', NULL, 'active', 1, 10, 0, 2, NULL, '2025-05-09 20:21:31', NULL),
(156, 152, 'Medium 500g', 'KP-M-43', 399.00, 369.00, 7.52, 500.000, 'g', NULL, 'active', 1, 10, 0, 2, NULL, '2025-05-09 20:21:31', NULL),
(157, 152, 'Large 1kg', 'KP-L-43', 749.00, 699.00, 6.68, 1000.000, 'g', NULL, 'active', 1, 10, 0, 2, NULL, '2025-05-09 20:21:31', NULL),
(158, 155, 'Small 250g', 'AB-S-44', 249.00, 229.00, 8.03, 250.000, 'g', NULL, 'active', 1, 10, 0, 2, NULL, '2025-05-09 20:21:31', NULL),
(159, 155, 'Medium 500g', 'AB-M-44', 449.00, 419.00, 6.68, 500.000, 'g', NULL, 'active', 1, 10, 0, 2, NULL, '2025-05-09 20:21:31', NULL),
(160, 155, 'Large 1kg', 'AB-L-44', 849.00, 799.00, 5.89, 1000.000, 'g', NULL, 'active', 1, 10, 0, 2, NULL, '2025-05-09 20:21:31', NULL),
(161, 158, 'Small 250g', 'MB-S-45', 229.00, 209.00, 8.73, 250.000, 'g', NULL, 'active', 1, 10, 0, 2, NULL, '2025-05-09 20:21:31', NULL),
(162, 158, 'Medium 500g', 'MB-M-45', 429.00, 399.00, 6.99, 500.000, 'g', NULL, 'active', 1, 10, 0, 2, NULL, '2025-05-09 20:21:31', NULL),
(163, 158, 'Large 1kg', 'MB-L-45', 829.00, 779.00, 6.03, 1000.000, 'g', NULL, 'active', 1, 10, 0, 2, NULL, '2025-05-09 20:21:31', NULL),
(164, 161, 'Small 250g', 'GH-S-46', 219.00, 199.00, 9.13, 250.000, 'g', NULL, 'active', 1, 10, 0, 2, NULL, '2025-05-09 20:21:31', NULL),
(165, 161, 'Medium 500g', 'GH-M-46', 399.00, 369.00, 7.52, 500.000, 'g', NULL, 'active', 1, 10, 0, 2, NULL, '2025-05-09 20:21:31', NULL),
(166, 161, 'Large 1kg', 'GH-L-46', 749.00, 699.00, 6.68, 1000.000, 'g', NULL, 'active', 1, 10, 0, 2, NULL, '2025-05-09 20:21:31', NULL),
(167, 58, 'Small 250g', 'MK-S-47', 249.00, 229.00, 8.03, 250.000, 'g', NULL, 'active', 1, 10, 0, 2, 1, '2025-05-09 20:21:31', '2025-05-09 21:50:17'),
(168, 58, 'Medium 500g', 'MK-M-47', 449.00, 419.00, 6.68, 500.000, 'g', NULL, 'active', 1, 10, 0, 2, 1, '2025-05-09 20:21:31', '2025-05-09 21:50:18'),
(169, 58, 'Large 1kg', 'MK-L-47', 849.00, 799.00, 5.89, 1000.000, 'g', NULL, 'active', 1, 10, 0, 2, 1, '2025-05-09 20:21:31', '2025-05-09 21:50:18'),
(170, 59, 'Small 250g', 'DFL-S-48', 299.00, 279.00, 6.69, 250.000, 'g', NULL, 'active', 1, 10, 0, 2, 1, '2025-05-09 20:21:31', '2025-05-09 21:49:44'),
(171, 59, 'Medium 500g', 'DFL-M-48', 549.00, 519.00, 5.46, 500.000, 'g', NULL, 'active', 1, 10, 0, 2, 1, '2025-05-09 20:21:31', '2025-05-09 21:49:44'),
(172, 59, 'Large 1kg', 'DFL-L-48', 1049.00, 999.00, 4.77, 1000.000, 'g', NULL, 'active', 1, 10, 0, 2, 1, '2025-05-09 20:21:31', '2025-05-09 21:49:44'),
(173, 60, 'Pack of 4', 'MK-4-49', 199.00, 179.00, 10.05, 400.000, 'g', NULL, 'active', 1, 10, 0, 2, NULL, '2025-05-09 20:21:31', NULL),
(174, 60, 'Pack of 8', 'MK-8-49', 379.00, 349.00, 7.92, 800.000, 'g', NULL, 'active', 1, 10, 0, 2, NULL, '2025-05-09 20:21:31', NULL),
(175, 61, 'Small 250g', 'IM-S-50', 199.00, 179.00, 10.05, 250.000, 'g', NULL, 'active', 1, 10, 0, 2, 1, '2025-05-09 20:21:31', '2025-05-09 21:48:41'),
(176, 61, 'Medium 500g', 'IM-M-50', 349.00, 329.00, 5.73, 500.000, 'g', NULL, 'active', 1, 10, 0, 2, 1, '2025-05-09 20:21:31', '2025-05-09 21:48:42'),
(177, 61, 'Large 1kg', 'IM-L-50', 649.00, 599.00, 7.70, 1000.000, 'g', NULL, 'active', 1, 10, 0, 2, 1, '2025-05-09 20:21:31', '2025-05-09 21:48:42'),
(178, 62, 'Small 250g', 'KH-S-51', 149.00, 129.00, 13.42, 250.000, 'g', NULL, 'active', 1, 10, 0, 2, 1, '2025-05-09 20:21:31', '2025-05-09 22:14:22'),
(179, 62, 'Medium 500g', 'KH-M-51', 279.00, 249.00, 10.75, 500.000, 'g', NULL, 'active', 1, 10, 0, 2, 1, '2025-05-09 20:21:31', '2025-05-09 22:14:22'),
(181, 63, 'Small 250g', 'KRM-S-81', 229.00, 209.00, 8.73, 250.000, 'g', NULL, 'active', 1, 10, 0, 2, 1, '2025-05-09 20:26:53', '2025-05-09 21:47:40'),
(182, 63, 'Medium 500g', 'KRM-M-81', 419.00, 389.00, 7.16, 500.000, 'g', NULL, 'active', 1, 10, 0, 2, 1, '2025-05-09 20:26:53', '2025-05-09 21:47:41'),
(183, 63, 'Large 1kg', 'KRM-L-81', 799.00, 749.00, 6.26, 1000.000, 'g', NULL, 'active', 1, 10, 0, 2, 1, '2025-05-09 20:26:53', '2025-05-09 21:47:41'),
(184, 64, 'Small 250g', 'KKD-S-82', 349.00, 329.00, 5.73, 250.000, 'g', NULL, 'active', 1, 10, 0, 2, 1, '2025-05-09 20:26:53', '2025-05-09 21:46:47'),
(185, 64, 'Medium 500g', 'KKD-M-82', 649.00, 599.00, 7.70, 500.000, 'g', NULL, 'active', 1, 10, 0, 2, 1, '2025-05-09 20:26:53', '2025-05-09 21:46:47'),
(186, 64, 'Large 1kg', 'KKD-L-82', 1249.00, 1199.00, 4.00, 1000.000, 'g', NULL, 'active', 1, 10, 0, 2, 1, '2025-05-09 20:26:53', '2025-05-09 21:46:47'),
(187, 65, 'Small 250g', 'MS-S-83', 219.00, 199.00, 9.13, 250.000, 'g', NULL, 'active', 1, 10, 1, 2, 1, '2025-05-09 20:26:53', '2025-05-31 17:13:53'),
(188, 65, 'Medium 500g', 'MS-M-83', 399.00, 369.00, 7.52, 500.000, 'g', NULL, 'active', 1, 10, 0, 2, 1, '2025-05-09 20:26:53', '2025-05-09 21:45:48'),
(189, 65, 'Large 1kg', 'MS-L-83', 749.00, 699.00, 6.68, 1000.000, 'g', NULL, 'active', 1, 10, 0, 2, 1, '2025-05-09 20:26:53', '2025-05-09 21:45:48'),
(190, 66, 'Small 250g', 'KAP-S-84', 199.00, 179.00, 10.05, 250.000, 'g', NULL, 'active', 1, 10, 6, 2, 1, '2025-05-09 20:26:53', '2025-05-29 23:40:17'),
(191, 66, 'Medium 500g', 'KAP-M-84', 349.00, 329.00, 5.73, 500.000, 'g', NULL, 'active', 1, 10, 0, 2, 1, '2025-05-09 20:26:53', '2025-05-09 21:45:22'),
(192, 66, 'Large 1kg', 'KAP-L-84', 649.00, 599.00, 7.70, 1000.000, 'g', NULL, 'active', 1, 10, 0, 2, 1, '2025-05-09 20:26:53', '2025-05-09 21:45:23'),
(193, 67, 'Small 250g', 'KJ-S-85', 199.00, 179.00, 10.05, 250.000, 'g', NULL, 'active', 1, 10, 0, 2, 1, '2025-05-09 20:26:53', '2025-05-09 21:44:39'),
(194, 67, 'Medium 500g', 'KJ-M-85', 349.00, 329.00, 5.73, 500.000, 'g', NULL, 'active', 1, 10, 0, 2, 1, '2025-05-09 20:26:53', '2025-05-09 21:44:39'),
(195, 67, 'Large 1kg', 'KJ-L-85', 649.00, 599.00, 7.70, 1000.000, 'g', NULL, 'active', 1, 10, 0, 2, 1, '2025-05-09 20:26:53', '2025-05-09 21:44:39'),
(196, 68, 'Small 250g', 'RB-S-86', 219.00, 199.00, 9.13, 250.000, 'g', NULL, 'active', 1, 10, 0, 2, 1, '2025-05-09 20:26:53', '2025-05-09 21:04:43'),
(197, 68, 'Medium 500g', 'RB-M-86', 399.00, 369.00, 7.52, 500.000, 'g', NULL, 'active', 1, 10, 0, 2, 1, '2025-05-09 20:26:53', '2025-05-09 21:04:43'),
(198, 68, 'Large 1kg', 'RB-L-86', 749.00, 699.00, 6.68, 1000.000, 'g', NULL, 'active', 1, 10, 0, 2, 1, '2025-05-09 20:26:53', '2025-05-09 21:04:44'),
(199, 69, 'Small', 'GV-S-87', 249.00, 229.00, 8.03, 250.000, 'g', NULL, 'active', 1, 10, 1, 2, 1, '2025-05-09 20:26:53', '2025-05-29 21:27:52'),
(200, 69, 'Medium', 'GV-M-87', 449.00, 419.00, 6.68, 500.000, 'g', NULL, 'active', 1, 10, 0, 2, 1, '2025-05-09 20:26:53', '2025-05-09 21:41:04'),
(201, 69, 'Large', 'GV-L-87', 849.00, 799.00, 5.89, 1000.000, 'g', NULL, 'active', 1, 10, 0, 2, 1, '2025-05-09 20:26:53', '2025-05-09 21:41:05'),
(202, 70, 'Small 250g', 'CC-S-88', 199.00, 179.00, 10.05, 250.000, 'g', NULL, 'active', 1, 10, 0, 2, 1, '2025-05-09 20:26:53', '2025-05-09 21:39:41'),
(203, 70, 'Medium 500g', 'CC-M-88', 349.00, 329.00, 5.73, 500.000, 'g', NULL, 'active', 1, 10, 0, 2, 1, '2025-05-09 20:26:53', '2025-05-09 21:39:42'),
(204, 70, 'Large 1kg', 'CC-L-88', 649.00, 599.00, 7.70, 1000.000, 'g', NULL, 'active', 1, 10, 0, 2, 1, '2025-05-09 20:26:53', '2025-05-09 21:39:42'),
(205, 71, 'Small 250g', 'MG-S-89', 219.00, 199.00, 9.13, 250.000, 'g', NULL, 'active', 1, 10, 0, 2, 1, '2025-05-09 20:26:53', '2025-05-09 21:36:16'),
(206, 71, 'Medium 500g', 'MG-M-89', 399.00, 369.00, 7.52, 500.000, 'g', NULL, 'active', 1, 10, 0, 2, 1, '2025-05-09 20:26:53', '2025-05-09 21:36:16'),
(207, 71, 'Large 1kg', 'MG-L-89', 749.00, 699.00, 6.68, 1000.000, 'g', NULL, 'active', 1, 10, 0, 2, 1, '2025-05-09 20:26:53', '2025-05-09 21:36:16'),
(208, 72, 'Pack of 4', 'KPK-4-90', 219.00, 199.00, 9.13, 400.000, 'g', NULL, 'active', 1, 10, 0, 2, NULL, '2025-05-09 20:26:53', NULL),
(209, 72, 'Pack of 8', 'KPK-8-90', 399.00, 369.00, 7.52, 800.000, 'g', NULL, 'active', 1, 10, 0, 2, NULL, '2025-05-09 20:26:53', NULL),
(210, 73, 'Small 250g', 'BS-S-91', 189.00, 169.00, 10.58, 250.000, 'g', NULL, 'active', 1, 10, 0, 2, 1, '2025-05-09 20:26:53', '2025-05-09 21:33:43'),
(211, 73, 'Medium 500g', 'BS-M-91', 339.00, 319.00, 5.90, 500.000, 'g', NULL, 'active', 1, 10, 0, 2, 1, '2025-05-09 20:26:53', '2025-05-09 21:33:43'),
(212, 73, 'Large 1kg', 'BS-L-91', 629.00, 579.00, 7.95, 1000.000, 'g', NULL, 'active', 1, 10, 0, 2, 1, '2025-05-09 20:26:53', '2025-05-09 21:33:44'),
(213, 74, 'Small 250g', 'KMP-S-92', 229.00, 209.00, 8.73, 250.000, 'g', NULL, 'active', 1, 10, 0, 2, 1, '2025-05-09 20:26:53', '2025-05-09 21:32:04'),
(214, 74, 'Medium 500g', 'KMP-M-92', 419.00, 389.00, 7.16, 500.000, 'g', NULL, 'active', 1, 10, 0, 2, 1, '2025-05-09 20:26:53', '2025-05-09 21:32:04'),
(215, 74, 'Large 1kg', 'KMP-L-92', 799.00, 749.00, 6.26, 1000.000, 'g', NULL, 'active', 1, 10, 0, 2, 1, '2025-05-09 20:26:53', '2025-05-09 21:32:04'),
(216, 75, 'Small 250g', 'KAR-S-93', 349.00, 329.00, 5.73, 250.000, 'g', NULL, 'active', 1, 10, 0, 2, 1, '2025-05-09 20:26:53', '2025-05-09 21:28:04'),
(217, 75, 'Medium 500g', 'KAR-M-93', 649.00, 599.00, 7.70, 500.000, 'g', NULL, 'active', 1, 10, 0, 2, 1, '2025-05-09 20:26:53', '2025-05-09 21:28:04'),
(218, 75, 'Large 1kg', 'KAR-L-93', 1249.00, 1199.00, 4.00, 1000.000, 'g', NULL, 'active', 1, 10, 0, 2, 1, '2025-05-09 20:26:53', '2025-05-09 21:28:05'),
(219, 76, 'Pack of 4', 'MK-4-94', 219.00, 199.00, 9.13, 400.000, 'g', NULL, 'active', 1, 10, 0, 2, 1, '2025-05-09 20:26:53', '2025-05-09 20:39:56'),
(220, 76, 'Pack of 8', 'MK-8-94', 399.00, 369.00, 7.52, 800.000, 'g', NULL, 'active', 1, 10, 0, 2, 1, '2025-05-09 20:26:53', '2025-05-09 20:39:56'),
(226, 50, '3 digit', 'systumm', 1000.00, NULL, NULL, 500.000, 'g', NULL, 'active', 1, 10, 0, 1, 1, '2025-05-10 21:18:29', '2025-05-14 02:33:51'),
(227, 51, '500g', 'cb-500g', 250.00, 220.00, 12.00, 500.000, 'g', NULL, 'active', 1, 10, 0, 1, 1, '2025-05-10 22:25:32', '2025-05-11 20:05:39'),
(231, 84, '500g', 'salt-kaju-500', 2500.00, 2400.00, 4.00, 250.000, 'g', NULL, 'active', 1, 10, 0, 4, 4, '2025-05-17 09:09:05', '2025-05-21 17:00:53'),
(237, 90, '500g', 'GJ-S-41', 100.00, 90.00, 10.00, 90.000, 'g', NULL, 'active', 1, 10, 0, 1, 1, '2025-06-08 14:05:51', '2025-06-09 05:34:37');

-- --------------------------------------------------------

--
-- Table structure for table `settings`
--

CREATE TABLE `settings` (
  `id` int(11) NOT NULL,
  `key` varchar(255) NOT NULL COMMENT 'Setting key/name',
  `value` text DEFAULT NULL COMMENT 'Setting value'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `settings`
--

INSERT INTO `settings` (`id`, `key`, `value`) VALUES
(1, 'featured_limit_featured_product', '4'),
(2, 'featured_limit_featured_category', '4'),
(3, 'featured_limit_quick_pick', '15'),
(4, 'max_addresses_per_user', '5'),
(5, 'free_shipping_threshold', '500'),
(6, 'shipping_charges', '50'),
(7, 'store_name', 'Ramesh Sweets'),
(8, 'store_address_line1', 'Shop Number 25, Main Bazar Bharat Chowk'),
(9, 'store_address_line2', 'Ulhasnagar 1, Sidhi Vinayak Nagar'),
(10, 'store_city', 'Ulhasnagar'),
(11, 'store_state', 'Maharashtra'),
(12, 'store_postal_code', '421001'),
(13, 'store_country', 'India'),
(14, 'store_phone', '+91 98765 43210'),
(15, 'store_email', 'info@rameshsweets.co.in'),
(16, 'delivery_time_express', '1-2 business days'),
(17, 'cod_charges', '35'),
(18, 'cod_enabled', '1'),
(19, 'online_payment_enabled', '1'),
(20, 'order_return_window_hours', '2'),
(21, 'order_return_enabled', '1');

-- --------------------------------------------------------

--
-- Table structure for table `subcategories`
--

CREATE TABLE `subcategories` (
  `id` int(11) NOT NULL,
  `category_id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `slug` varchar(255) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `image` varchar(255) DEFAULT NULL,
  `meta_title` varchar(255) DEFAULT NULL,
  `meta_description` text DEFAULT NULL,
  `meta_keywords` text DEFAULT NULL,
  `status` enum('active','inactive') DEFAULT 'active',
  `display_order` int(11) DEFAULT 0,
  `created_by` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT NULL ON UPDATE current_timestamp(),
  `deleted_at` timestamp NULL DEFAULT NULL,
  `updated_by` int(11) DEFAULT NULL,
  `deleted_by` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `subcategories`
--

INSERT INTO `subcategories` (`id`, `category_id`, `name`, `slug`, `description`, `image`, `meta_title`, `meta_description`, `meta_keywords`, `status`, `display_order`, `created_by`, `created_at`, `updated_at`, `deleted_at`, `updated_by`, `deleted_by`) VALUES
(1, 1, 'Traditional Indian Sweets', 'traditional-indian-sweets', 'Classic sweets deeply rooted in Indian culture like Kaju Katli, Soan Papdi, and Motichoor Ladoo, often made with nuts, sugar, and traditional techniques.', 'uploads/subcategories/75dc1e72ccba14a63e0252dc37124025.jpg', '', '', '', 'active', 13, 2, '2025-05-09 11:56:09', '2025-05-29 23:40:17', NULL, 1, NULL),
(2, 1, 'Milk Based Sweets', 'milk-based-sweets', 'Sweets primarily made from milk or milk solids such as Rasgulla, Rasmalai, Kalakand, and Cham Cham — known for their soft texture and creamy taste.', 'uploads/subcategories/4ee42fdd7b9f42e44770035bed09c513.jpg', '', '', '', 'active', 13, 2, '2025-05-09 11:57:28', '2025-06-07 08:38:52', NULL, 1, NULL),
(3, 1, 'Dry Sweets', 'dry-sweets', 'Shelf-stable sweets with low moisture content like Kaju Roll and Badam Katli, usually made from dry fruits, sugar, and ghee.', 'uploads/subcategories/7bc7ab8c99e6e3db8c2e94a2fffb6c38.jpg', '', '', '', 'active', 4, 2, '2025-05-09 11:58:33', '2025-05-30 23:49:17', NULL, 1, NULL),
(4, 1, 'Ghee Sweets', 'ghee-sweets', 'Rich and aromatic sweets like Mysore Pak and Moong Dal Halwa made using generous amounts of pure ghee for an indulgent flavor.', 'uploads/subcategories/1120091ee0985724c627ed0e1b37c015.jpg', '', '', '', 'active', 0, 2, '2025-05-09 11:59:28', '2025-05-14 03:20:21', NULL, 1, NULL),
(5, 2, 'Cream Cakes', 'cream-cakes', 'Soft sponge cakes with whipped cream toppings and fillings, available in classic and exotic flavors.', 'uploads/subcategories/a8817567f7678792b8a6ef7ad07a4034.jpg', '', '', '', 'active', 0, 2, '2025-05-09 12:02:04', NULL, NULL, NULL, NULL),
(6, 2, 'Designer Cakes', 'designer-cakes', 'Customized themed cakes with artistic decorations for weddings, birthdays, and special events.', 'uploads/subcategories/2e14a7d44bd04fe7e9bce79688634454.jpg', '', '', '', 'active', 0, 2, '2025-05-09 12:03:38', NULL, NULL, NULL, NULL),
(7, 2, 'Dry Cakes', 'dry-cakes', 'Eggless, loaf-style cakes without cream that have a longer shelf life — ideal for travel or gifting.', 'uploads/subcategories/52b2eaa11598b1c2fc71ff3cfaa3c0fb.jpg', '', '', '', 'active', 0, 2, '2025-05-09 12:05:29', NULL, NULL, NULL, NULL),
(8, 3, 'Premium Dry Fruits', 'premium-dry-fruits', 'Whole, raw, or lightly roasted high-grade dry fruits like cashews, almonds, and figs.', 'uploads/subcategories/0d9cc8e8c736468a297263343226b949.webp', '', '', '', 'active', 0, 2, '2025-05-09 12:08:19', NULL, NULL, NULL, NULL),
(9, 3, 'Flavored Dry Fruits', 'flavored-dry-fruits', 'Dry fruits coated with spices, masala, or chocolate for a tasty and innovative twist.', 'uploads/subcategories/d000d73e5f29f4bce9fbe7ca6726b2f1.webp', '', '', '', 'active', 0, 2, '2025-05-09 12:09:29', NULL, NULL, NULL, NULL),
(10, 3, 'Dry Fruit Mix', 'dry-fruit-mix', 'Healthy assortments combining various dry fruits in one pack for gifting or everyday nutrition.', 'uploads/subcategories/57aa231c4663fdd6d1c21a86ab09ffdc.jpg', '', '', '', 'active', 0, 2, '2025-05-09 12:11:14', NULL, NULL, NULL, NULL),
(11, 4, 'Namkeen', 'namkeen', 'Traditional Indian savory mixes made with besan, lentils, and spices — crispy and spicy.', 'uploads/subcategories/077ec50d5cd4335fb7c3898810ffbc75.jpg', '', '', '', 'inactive', 0, 2, '2025-05-09 12:12:19', '2025-05-17 08:28:26', NULL, 4, NULL),
(12, 4, 'Farsan', 'farsan', 'Gujarati-style snacks like chakli, sev, and gathiya made using traditional recipes.', 'uploads/subcategories/06e0b625e8b3109542725cc3d8a12f20.jpg', '', '', '', 'inactive', 0, 2, '2025-05-09 12:15:22', '2025-05-17 08:28:26', NULL, 4, NULL),
(13, 4, 'Bhujia & Mixture', 'bhujia-mixture', 'Crunchy snacks with a mix of fried ingredients, masalas, and nuts — ideal for tea-time munching.', 'uploads/subcategories/15b92555e3f570b61f885513d3099cd8.webp', '', '', '', 'inactive', 0, 2, '2025-05-09 12:18:31', '2025-05-17 08:28:25', NULL, 4, NULL),
(14, 5, 'Festive Hampers', 'festive-hampers', 'Themed boxes and trays with sweets, dry fruits, and snacks designed for Diwali, Eid, and other festivals.', 'uploads/subcategories/d3883119deb822592f36f121958a1267.webp', '', '', '', 'active', 0, 2, '2025-05-09 12:19:44', NULL, NULL, NULL, NULL),
(15, 5, 'Corporate Hampers', 'corporate-hampers', 'Elegant packaging with assorted goodies suitable for gifting to clients and employees.', 'uploads/subcategories/540a4ce690903c1bdac018356cd05a3b.jpg', '', '', '', 'active', 0, 2, '2025-05-09 12:21:03', NULL, NULL, NULL, NULL),
(16, 5, 'Custom Hampers', 'custom-hampers', 'Make-your-own gift baskets tailored to the buyer’s preferences, perfect for birthdays or personalized gifts.', 'uploads/subcategories/16096324eeeda6c351985408b311d396.jpg', '', '', '', 'active', 0, 2, '2025-05-09 12:21:49', NULL, NULL, NULL, NULL),
(17, 6, 'testsub', 'testsub', 'subcategory', 'uploads/subcategories/1601eeadc712c0393a09f126cafe2abc.png', '', '', '', 'active', 0, 3, '2025-05-16 14:17:35', '2025-05-19 11:33:11', NULL, 1, NULL),
(18, 1, 'Bengali Sweets', 'bengali-sweets', '', 'uploads/subcategories/a6e1d065b040566d5c28a5f6fa8be08f.png', '', '', '', 'active', 0, 4, '2025-05-17 08:31:27', '2025-05-17 08:33:00', NULL, 4, NULL),
(19, 3, 'kaju', 'kaju', '', NULL, '', '', '', 'active', 0, 4, '2025-05-17 08:34:19', NULL, NULL, NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `tags`
--

CREATE TABLE `tags` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT NULL ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `tags`
--

INSERT INTO `tags` (`id`, `name`, `created_at`, `updated_at`) VALUES
(1, 'sweets', '2025-05-09 12:33:28', '2025-05-09 12:33:28'),
(2, 'cashew', '2025-05-09 12:33:29', '2025-05-09 12:33:29'),
(3, 'festive', '2025-05-09 12:33:29', '2025-05-09 12:33:29'),
(4, 'rasgulla', '2025-05-09 12:41:52', '2025-05-09 12:41:52'),
(5, 'syrup', '2025-05-09 12:41:54', '2025-05-09 12:41:54'),
(6, 'cheese', '2025-05-09 12:41:54', '2025-05-09 12:41:54'),
(7, 'soan papdi', '2025-05-09 13:32:42', '2025-05-09 13:32:42'),
(8, 'milk', '2025-05-09 13:37:59', '2025-05-09 13:37:59'),
(9, 'kalakand', '2025-05-09 13:37:59', '2025-05-09 13:37:59'),
(10, 'ladoo', '2025-05-09 13:53:26', '2025-05-09 13:53:26'),
(11, 'saffron', '2025-05-09 14:01:22', '2025-05-09 14:01:22'),
(12, 'cake', '2025-05-09 19:37:41', '2025-05-09 19:37:41'),
(13, 'caramel', '2025-05-09 19:37:42', '2025-05-09 19:37:42'),
(14, 'mithai', '2025-05-09 19:37:42', '2025-05-09 19:37:42'),
(15, 'coconut', '2025-05-09 19:59:53', NULL),
(16, 'barfi', '2025-05-09 19:59:53', NULL),
(17, 'dry', '2025-05-09 19:59:53', NULL),
(19, 'mix', '2025-05-09 19:59:53', NULL),
(20, 'dryfruit', '2025-05-09 19:59:53', NULL),
(22, 'mysore', '2025-05-09 19:59:53', NULL),
(23, 'pak', '2025-05-09 19:59:53', NULL),
(24, 'ghee', '2025-05-09 19:59:53', NULL),
(25, 'gramflour', '2025-05-09 19:59:53', NULL),
(26, 'chana', '2025-05-09 19:59:53', NULL),
(27, 'halwa', '2025-05-09 19:59:53', NULL),
(28, 'moong', '2025-05-09 19:59:53', NULL),
(29, 'besan', '2025-05-09 19:59:53', NULL),
(30, 'sugarfree', '2025-05-09 19:59:53', NULL),
(31, 'diabetic', '2025-05-09 19:59:53', NULL),
(32, 'peda', '2025-05-09 19:59:53', NULL),
(33, 'sandesh', '2025-05-09 19:59:53', NULL),
(34, 'bengali', '2025-05-09 19:59:53', NULL),
(35, 'chhena', '2025-05-09 19:59:53', NULL),
(36, 'malai', '2025-05-09 19:59:53', NULL),
(37, 'chamcham', '2025-05-09 19:59:53', NULL),
(38, 'gujiya', '2025-05-09 19:59:53', NULL),
(39, 'festival', '2025-05-09 19:59:53', NULL),
(40, 'fried', '2025-05-09 19:59:53', NULL),
(41, 'chocolate', '2025-05-09 19:59:53', NULL),
(42, 'birthday', '2025-05-09 19:59:53', NULL),
(43, 'celebration', '2025-05-09 19:59:53', NULL),
(44, 'butterscotch', '2025-05-09 19:59:53', NULL),
(45, 'redvelvet', '2025-05-09 19:59:53', NULL),
(46, 'flavored', '2025-05-09 19:59:53', NULL),
(47, 'mango', '2025-05-09 19:59:53', NULL),
(48, 'mousse', '2025-05-09 19:59:53', NULL),
(49, 'dryfruits', '2025-05-09 19:59:53', NULL),
(50, 'almonds', '2025-05-09 19:59:53', NULL),
(51, 'healthy', '2025-05-09 19:59:53', NULL),
(52, 'snack', '2025-05-09 19:59:53', NULL),
(53, 'pistachios', '2025-05-09 19:59:53', NULL),
(54, 'gift', '2025-05-09 19:59:53', NULL),
(55, 'assorted', '2025-05-09 19:59:53', NULL),
(56, 'nuts', '2025-05-09 19:59:53', NULL),
(57, 'bhujia', '2025-05-09 19:59:53', NULL),
(58, 'sev', '2025-05-09 19:59:53', NULL),
(59, 'namkeen', '2025-05-09 19:59:53', NULL),
(60, 'chakli', '2025-05-09 19:59:53', NULL),
(61, 'makhana', '2025-05-09 19:59:53', NULL),
(62, 'roasted', '2025-05-09 19:59:53', NULL),
(63, 'spicy', '2025-05-09 19:59:53', NULL),
(64, 'diwali', '2025-05-09 19:59:53', NULL),
(65, 'hamper', '2025-05-09 19:59:53', NULL),
(66, 'holi', '2025-05-09 19:59:53', NULL),
(67, 'corporate', '2025-05-09 19:59:53', NULL),
(68, 'office', '2025-05-09 19:59:53', NULL),
(69, 'dessert', '2025-05-09 20:00:50', NULL),
(70, 'premium', '2025-05-09 20:00:50', NULL),
(76, 'seasonal', '2025-05-09 20:00:50', NULL),
(99, 'sweet', '2025-05-09 20:00:50', NULL),
(100, 'traditional', '2025-05-09 20:00:50', NULL),
(103, 'south-indian', '2025-05-09 20:00:50', NULL),
(121, 'gulab jamun', '2025-05-09 20:11:47', NULL),
(122, 'rose', '2025-05-09 20:11:47', NULL),
(123, 'jalebi', '2025-05-09 20:11:47', NULL),
(124, 'fried sweet', '2025-05-09 20:11:47', NULL),
(125, 'kesar', '2025-05-09 20:11:47', NULL),
(126, 'anjeer', '2025-05-09 20:11:47', NULL),
(127, 'fig', '2025-05-09 20:11:47', NULL),
(128, 'gajar', '2025-05-09 20:11:47', NULL),
(129, 'carrot', '2025-05-09 20:11:47', NULL),
(130, 'winter', '2025-05-09 20:11:47', NULL),
(131, 'pineapple', '2025-05-09 20:11:47', NULL),
(132, 'fruit cake', '2025-05-09 20:11:47', NULL),
(133, 'black forest', '2025-05-09 20:11:47', NULL),
(134, 'cherry', '2025-05-09 20:11:47', NULL),
(135, 'fruit', '2025-05-09 20:11:47', NULL),
(136, 'dry cake', '2025-05-09 20:11:47', NULL),
(137, 'number cake', '2025-05-09 20:11:47', NULL),
(138, 'custom cake', '2025-05-09 20:11:47', NULL),
(149, 'mawa', '2025-05-09 20:21:31', NULL),
(150, 'kachori', '2025-05-09 20:21:31', NULL),
(151, 'kulfi', '2025-05-09 20:21:31', NULL),
(152, 'frozen', '2025-05-09 20:21:31', NULL),
(154, 'imarti', '2025-05-09 20:21:31', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `phone_number` varchar(20) NOT NULL,
  `status` enum('active','inactive') NOT NULL DEFAULT 'active',
  `last_login_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `phone_number`, `status`, `last_login_at`, `created_at`) VALUES
(1, '7888261079', 'active', '2025-06-07 08:46:35', '2025-05-15 12:18:16'),
(2, '8805826364', 'active', NULL, '2025-05-15 16:25:51'),
(3, '9563469462', 'active', NULL, '2025-05-15 17:09:19'),
(4, '9335445164', 'active', NULL, '2025-05-15 20:54:30'),
(5, '6516515165', 'active', '2025-05-15 21:04:04', '2025-05-15 21:02:19'),
(6, '6514113213', 'active', NULL, '2025-05-15 21:04:23'),
(7, '6514153131', 'active', NULL, '2025-05-15 21:05:32'),
(8, '6556464654', 'active', NULL, '2025-05-15 21:05:55'),
(9, '7888261056', 'active', NULL, '2025-05-15 22:02:41'),
(10, '7888261055', 'active', '2025-05-27 00:28:37', '2025-05-15 22:03:33'),
(11, '7888261151', 'active', NULL, '2025-05-15 22:11:42'),
(12, '9022225525', 'active', NULL, '2025-05-25 12:25:38'),
(13, '6515456465', 'active', NULL, '2025-05-27 00:29:17'),
(14, '7888261908', 'active', '2025-06-06 02:49:31', '2025-05-27 00:38:01'),
(15, '6546546565', 'active', NULL, '2025-05-27 17:28:37'),
(16, '6641653214', 'active', NULL, '2025-05-27 17:30:50'),
(17, '9132154654', 'active', NULL, '2025-05-27 17:32:06'),
(18, '6541231321', 'active', NULL, '2025-05-27 17:36:35'),
(19, '6564646871', 'active', NULL, '2025-05-27 17:41:32'),
(20, '6654541537', 'active', '2025-05-27 23:52:23', '2025-05-27 17:44:56'),
(21, '6541521546', 'active', NULL, '2025-05-27 17:49:05'),
(22, '6651435468', 'active', NULL, '2025-05-27 20:49:46'),
(23, '6416546554', 'active', NULL, '2025-05-27 20:50:08'),
(24, '6544564165', 'active', NULL, '2025-05-27 20:54:38'),
(25, '6541574546', 'active', NULL, '2025-05-27 20:57:26'),
(26, '6415646546', 'active', NULL, '2025-05-27 21:00:16'),
(27, '6541652145', 'active', NULL, '2025-05-29 00:23:42'),
(28, '9527434103', 'active', '2025-05-29 13:22:52', '2025-05-29 13:10:30'),
(29, '6213413213', 'active', NULL, '2025-06-05 10:58:02'),
(30, '6546546546', 'active', NULL, '2025-06-07 08:36:04');

-- --------------------------------------------------------

--
-- Table structure for table `user_addresses`
--

CREATE TABLE `user_addresses` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `address_type` enum('home','work','other') DEFAULT 'other',
  `label` varchar(100) DEFAULT NULL,
  `contact_name` varchar(150) DEFAULT NULL,
  `contact_phone` varchar(20) DEFAULT NULL,
  `address_line1` varchar(255) NOT NULL,
  `address_line2` varchar(255) DEFAULT NULL,
  `city` varchar(100) NOT NULL,
  `state` varchar(100) NOT NULL,
  `postal_code` varchar(20) NOT NULL,
  `country` varchar(100) DEFAULT 'India',
  `is_default` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `user_addresses`
--

INSERT INTO `user_addresses` (`id`, `user_id`, `address_type`, `label`, `contact_name`, `contact_phone`, `address_line1`, `address_line2`, `city`, `state`, `postal_code`, `country`, `is_default`, `created_at`, `updated_at`, `deleted_at`) VALUES
(2, 1, 'work', 'Office', 'John Doe', '9876543210', '456 Business Park', 'Tower A, 5th Floor', 'Mumbai', 'Maharashtra', '400070', 'India', 0, '2025-05-28 00:41:22', '2025-06-05 12:40:43', NULL),
(6, 1, 'home', NULL, 'Mohit lalwani', '7888261079', '302 bhola bhawani apartrment ,near arjun devji gurudwara ulhasnagar-2', 'Bhola Bhawani Apt', 'Ulhasnagar', 'Maharashtra', '421002', 'India', 1, '2025-05-28 01:35:35', '2025-06-05 12:40:43', NULL),
(7, 1, 'other', NULL, 'Mohit dilip lalwani', '7888261079', '302 bhola bhawani apartrment ,near arjun devji gurudwara ulhasnagar-2', 'Bhola Bhawani Apt', 'Ulhasnagar (M Corp.)', 'Maharashtra', '421002', 'India', 0, '2025-05-28 03:03:45', '2025-05-28 03:03:45', NULL),
(8, 1, 'work', NULL, 'Mohit dilip lalwani', '7888261079', '302 bhola bhawani apartrment ,near arjun devji gurudwara ulhasnagar-2', 'Bhola Bhawani Apt', 'Ulhasnagar (M Corp.)', 'Maharashtra', '421002', 'India', 0, '2025-05-28 03:04:04', '2025-05-28 22:20:47', NULL),
(9, 14, 'home', NULL, 'Mohit dilip lalwani', '7888261079', 'crazy', 'systumm', 'pata nahi', 'Karnataka', '400001', 'India', 1, '2025-05-28 14:50:34', '2025-06-06 02:50:32', NULL),
(10, 1, 'work', NULL, 'Mohit dilip lalwani', '7888261079', '302 bhola bhawani apartrment ,near arjun devji gurudwara ulhasnagar-2', 'Bhola Bhawani Apt', 'Ulhasnagar (M Corp.)', 'Maharashtra', '421002', 'India', 0, '2025-05-28 21:46:56', '2025-05-31 00:06:47', NULL),
(11, 27, 'home', NULL, 'hello', '7888261079', 'systyumm', NULL, 'kalwa', 'Madhya Pradesh', '451321', 'India', 1, '2025-05-29 01:06:02', '2025-05-29 01:06:02', NULL),
(12, 28, 'home', NULL, 'ab bhaiya', '7854453213', 'adc', NULL, 'mumbra', 'Karnataka', '400001', 'India', 1, '2025-05-29 18:23:32', '2025-05-29 18:23:32', NULL),
(13, 29, 'home', NULL, 'Mohit dilip lalwani', '7888261079', '302', 'Bhola Bhawani Apt', 'Ulhasnagar', 'Karnataka', '421002', 'India', 1, '2025-06-05 11:00:22', '2025-06-05 11:11:50', NULL),
(14, 29, 'home', NULL, 'Mohit dilip lalwani', '7888261079', '302 bhola bhawani apartrment ,near arjun devji gurudwara ulhasnagar-2', 'Bhola Bhawani Apt', 'Ulhasnagar (M Corp.)', 'Maharashtra', '421002', 'India', 0, '2025-06-05 11:11:26', '2025-06-05 11:11:50', NULL),
(15, 30, 'home', NULL, 'Mohit dilip lalwani', '7888261079', '302 bhola bhawani apartrment ,near arjun devji gurudwara ulhasnagar-2', 'Bhola Bhawani Apt', 'Ulhasnagar (M Corp.)', 'Maharashtra', '421002', 'India', 1, '2025-06-07 08:38:15', '2025-06-07 08:38:15', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `user_profiles`
--

CREATE TABLE `user_profiles` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `first_name` varchar(100) DEFAULT NULL,
  `last_name` varchar(100) DEFAULT NULL,
  `gender` enum('male','female','other','prefer_not_to_say') DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `date_of_birth` date DEFAULT NULL,
  `profile_picture` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `user_profiles`
--

INSERT INTO `user_profiles` (`id`, `user_id`, `first_name`, `last_name`, `gender`, `email`, `date_of_birth`, `profile_picture`, `created_at`, `updated_at`, `deleted_at`) VALUES
(1, 1, 'Mohit', 'lalwani', 'male', 'lalwanimohit858@gmail.com', '2007-01-10', 'public/uploads/profile_pictures/profile_68418ad26abea.webp', '2025-06-05 12:17:22', '2025-06-05 12:17:40', NULL),
(2, 20, 'hello', 'systumm', NULL, 'lal@gmail.com', NULL, NULL, '2025-05-27 21:18:24', '2025-05-27 21:18:24', NULL),
(3, 14, 'hello', 'world', 'male', 'by@gmail.com', '2005-01-12', 'public/uploads/profile_pictures/profile_6842574a7cee7.webp', '2025-05-27 21:20:01', '2025-06-06 02:49:46', NULL),
(4, 27, 'hello', NULL, NULL, NULL, NULL, NULL, '2025-05-29 01:06:02', '2025-05-29 01:06:02', NULL),
(5, 28, 'ab', 'bhaiya', NULL, NULL, NULL, NULL, '2025-05-29 18:23:32', '2025-05-29 18:23:32', NULL),
(6, 29, NULL, NULL, NULL, NULL, NULL, NULL, '2025-06-05 10:58:50', '2025-06-05 10:58:50', NULL),
(8, 30, 'Mohit', 'dilip lalwani', NULL, NULL, NULL, NULL, '2025-06-07 08:38:15', '2025-06-07 08:38:15', NULL);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `activity_logs`
--
ALTER TABLE `activity_logs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `module` (`module`),
  ADD KEY `action` (`action`),
  ADD KEY `created_at` (`created_at`),
  ADD KEY `is_admin` (`is_admin`),
  ADD KEY `idx_user_admin` (`user_id`,`is_admin`);

--
-- Indexes for table `admins`
--
ALTER TABLE `admins`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `admins_email_unique` (`email`),
  ADD UNIQUE KEY `admins_username_unique` (`username`),
  ADD KEY `admins_role_index` (`role`),
  ADD KEY `admins_status_index` (`status`),
  ADD KEY `created_by` (`created_by`);

--
-- Indexes for table `carts`
--
ALTER TABLE `carts`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_user_id` (`user_id`),
  ADD KEY `idx_status` (`status`);

--
-- Indexes for table `cart_items`
--
ALTER TABLE `cart_items`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_product_in_cart` (`cart_id`,`product_id`,`variant_id`),
  ADD KEY `idx_product_id` (`product_id`),
  ADD KEY `idx_variant_id` (`variant_id`);

--
-- Indexes for table `categories`
--
ALTER TABLE `categories`
  ADD PRIMARY KEY (`id`),
  ADD KEY `created_by` (`created_by`);

--
-- Indexes for table `coupons`
--
ALTER TABLE `coupons`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `code` (`code`),
  ADD KEY `idx_coupons_code` (`code`),
  ADD KEY `idx_coupons_dates` (`start_date`,`end_date`),
  ADD KEY `idx_coupons_active` (`is_active`);

--
-- Indexes for table `coupon_usage`
--
ALTER TABLE `coupon_usage`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `order_id` (`order_id`) COMMENT 'Only one coupon per order',
  ADD KEY `coupon_id` (`coupon_id`),
  ADD KEY `idx_coupon_usage_dates` (`used_at`);

--
-- Indexes for table `featured_items`
--
ALTER TABLE `featured_items`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_entity_display_type` (`entity_id`,`display_type`),
  ADD KEY `idx_display_type` (`display_type`,`display_order`);

--
-- Indexes for table `orders`
--
ALTER TABLE `orders`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `order_number` (`order_number`),
  ADD KEY `idx_order_number` (`order_number`),
  ADD KEY `idx_user_id` (`user_id`),
  ADD KEY `idx_status` (`status`),
  ADD KEY `idx_payment_status` (`payment_status`),
  ADD KEY `idx_order_date` (`order_date`);

--
-- Indexes for table `order_items`
--
ALTER TABLE `order_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_order_id` (`order_id`),
  ADD KEY `idx_product_id` (`product_id`),
  ADD KEY `idx_variant_id` (`variant_id`),
  ADD KEY `idx_status` (`status`);

--
-- Indexes for table `order_shipping`
--
ALTER TABLE `order_shipping`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_order_id` (`order_id`),
  ADD KEY `idx_tracking_number` (`tracking_number`),
  ADD KEY `idx_status` (`status`),
  ADD KEY `idx_postal_code` (`postal_code`),
  ADD KEY `idx_estimated_delivery_date` (`estimated_delivery_date`),
  ADD KEY `idx_delivered_at` (`delivered_at`);

--
-- Indexes for table `order_status_history`
--
ALTER TABLE `order_status_history`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_order_id` (`order_id`),
  ADD KEY `idx_status` (`status`),
  ADD KEY `idx_changed_by` (`changed_by`),
  ADD KEY `idx_created_at` (`created_at`);

--
-- Indexes for table `otps`
--
ALTER TABLE `otps`
  ADD PRIMARY KEY (`id`),
  ADD KEY `otps_user_id_foreign` (`user_id`),
  ADD KEY `otps_phone_number_index` (`phone_number`),
  ADD KEY `otps_created_at_index` (`created_at`),
  ADD KEY `otps_expires_at_index` (`expires_at`);

--
-- Indexes for table `payments`
--
ALTER TABLE `payments`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_order_id` (`order_id`),
  ADD KEY `idx_payment_id` (`payment_id`),
  ADD KEY `idx_payment_method` (`payment_method`),
  ADD KEY `idx_status` (`status`),
  ADD KEY `idx_initiated_at` (`initiated_at`);

--
-- Indexes for table `products`
--
ALTER TABLE `products`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `products_slug_unique` (`slug`),
  ADD KEY `products_category_id_index` (`category_id`),
  ADD KEY `products_subcategory_id_index` (`subcategory_id`),
  ADD KEY `products_created_by_index` (`created_by`),
  ADD KEY `products_updated_by_index` (`updated_by`),
  ADD KEY `products_deleted_by_index` (`deleted_by`),
  ADD KEY `products_status_index` (`status`);

--
-- Indexes for table `product_images`
--
ALTER TABLE `product_images`
  ADD PRIMARY KEY (`id`),
  ADD KEY `product_images_product_id_index` (`product_id`),
  ADD KEY `product_images_is_primary_index` (`is_primary`),
  ADD KEY `product_images_display_order_index` (`display_order`);

--
-- Indexes for table `product_tags`
--
ALTER TABLE `product_tags`
  ADD PRIMARY KEY (`product_id`,`tag_id`),
  ADD KEY `product_tags_product_id_index` (`product_id`),
  ADD KEY `product_tags_tag_id_index` (`tag_id`);

--
-- Indexes for table `product_variants`
--
ALTER TABLE `product_variants`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `product_variants_product_id_variant_name_unique` (`product_id`,`variant_name`),
  ADD UNIQUE KEY `product_variants_sku_unique` (`sku`),
  ADD KEY `product_variants_product_id_index` (`product_id`),
  ADD KEY `product_variants_status_index` (`status`),
  ADD KEY `product_variants_display_order_index` (`display_order`);

--
-- Indexes for table `settings`
--
ALTER TABLE `settings`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `subcategories`
--
ALTER TABLE `subcategories`
  ADD PRIMARY KEY (`id`),
  ADD KEY `category_id` (`category_id`),
  ADD KEY `created_by` (`created_by`);

--
-- Indexes for table `tags`
--
ALTER TABLE `tags`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `tags_name_unique` (`name`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `users_phone_number_unique` (`phone_number`),
  ADD KEY `users_status_index` (`status`),
  ADD KEY `users_created_at_index` (`created_at`);

--
-- Indexes for table `user_addresses`
--
ALTER TABLE `user_addresses`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_user_id` (`user_id`),
  ADD KEY `idx_is_default` (`is_default`),
  ADD KEY `idx_deleted_at` (`deleted_at`);

--
-- Indexes for table `user_profiles`
--
ALTER TABLE `user_profiles`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `user_profiles_user_id_unique` (`user_id`),
  ADD UNIQUE KEY `user_profiles_email_unique` (`email`),
  ADD KEY `user_profiles_created_at_index` (`created_at`),
  ADD KEY `user_profiles_deleted_at_index` (`deleted_at`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `activity_logs`
--
ALTER TABLE `activity_logs`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;

--
-- AUTO_INCREMENT for table `admins`
--
ALTER TABLE `admins`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `carts`
--
ALTER TABLE `carts`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=49;

--
-- AUTO_INCREMENT for table `cart_items`
--
ALTER TABLE `cart_items`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=81;

--
-- AUTO_INCREMENT for table `categories`
--
ALTER TABLE `categories`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `coupons`
--
ALTER TABLE `coupons`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=42;

--
-- AUTO_INCREMENT for table `coupon_usage`
--
ALTER TABLE `coupon_usage`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `featured_items`
--
ALTER TABLE `featured_items`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=38;

--
-- AUTO_INCREMENT for table `orders`
--
ALTER TABLE `orders`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;

--
-- AUTO_INCREMENT for table `order_items`
--
ALTER TABLE `order_items`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=15;

--
-- AUTO_INCREMENT for table `order_shipping`
--
ALTER TABLE `order_shipping`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT for table `order_status_history`
--
ALTER TABLE `order_status_history`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=31;

--
-- AUTO_INCREMENT for table `otps`
--
ALTER TABLE `otps`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=115;

--
-- AUTO_INCREMENT for table `payments`
--
ALTER TABLE `payments`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT for table `products`
--
ALTER TABLE `products`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=91;

--
-- AUTO_INCREMENT for table `product_images`
--
ALTER TABLE `product_images`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=203;

--
-- AUTO_INCREMENT for table `product_variants`
--
ALTER TABLE `product_variants`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=238;

--
-- AUTO_INCREMENT for table `settings`
--
ALTER TABLE `settings`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=22;

--
-- AUTO_INCREMENT for table `subcategories`
--
ALTER TABLE `subcategories`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=20;

--
-- AUTO_INCREMENT for table `tags`
--
ALTER TABLE `tags`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=156;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=31;

--
-- AUTO_INCREMENT for table `user_addresses`
--
ALTER TABLE `user_addresses`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;

--
-- AUTO_INCREMENT for table `user_profiles`
--
ALTER TABLE `user_profiles`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `admins`
--
ALTER TABLE `admins`
  ADD CONSTRAINT `admins_ibfk_1` FOREIGN KEY (`created_by`) REFERENCES `admins` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `carts`
--
ALTER TABLE `carts`
  ADD CONSTRAINT `fk_carts_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `cart_items`
--
ALTER TABLE `cart_items`
  ADD CONSTRAINT `fk_cart_items_cart` FOREIGN KEY (`cart_id`) REFERENCES `carts` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `coupon_usage`
--
ALTER TABLE `coupon_usage`
  ADD CONSTRAINT `coupon_usage_ibfk_1` FOREIGN KEY (`coupon_id`) REFERENCES `coupons` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `otps`
--
ALTER TABLE `otps`
  ADD CONSTRAINT `otps_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `user_profiles`
--
ALTER TABLE `user_profiles`
  ADD CONSTRAINT `user_profiles_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
