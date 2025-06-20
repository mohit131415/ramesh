<?php

namespace App\Features\UserManagement\DataAccess;

use App\Core\Database;
use App\Shared\Exceptions\NotFoundException;
use App\Shared\Exceptions\ValidationException;
use Exception;

class AdminUserRepository
{
    private $database;

    public function __construct()
    {
        $this->database = Database::getInstance();
    }

    /**
     * Get all users with pagination and filters
     *
     * @param int $page Page number
     * @param int $limit Items per page
     * @param array $filters Optional filters
     * @return array Users and pagination metadata
     */
    public function getAllUsers($page = 1, $limit = 20, $filters = [])
    {
        try {
            $offset = ($page - 1) * $limit;
            $whereConditions = ['1=1']; // Base condition
            $params = [];

            // Apply filters if provided - only add conditions for non-empty values
            if (!empty($filters['search']) && trim($filters['search']) !== '') {
                $searchTerm = '%' . trim($filters['search']) . '%';
                $whereConditions[] = "(u.phone_number LIKE ? OR up.first_name LIKE ? OR up.last_name LIKE ? OR up.email LIKE ?)";
                $params[] = $searchTerm;
                $params[] = $searchTerm;
                $params[] = $searchTerm;
                $params[] = $searchTerm;
            }

            if (!empty($filters['status']) && trim($filters['status']) !== '') {
                $whereConditions[] = "u.status = ?";
                $params[] = trim($filters['status']);
            }

            if (!empty($filters['has_profile']) && trim($filters['has_profile']) !== '') {
                if (trim($filters['has_profile']) === 'yes') {
                    $whereConditions[] = "up.id IS NOT NULL";
                } else {
                    $whereConditions[] = "up.id IS NULL";
                }
            }

            if (!empty($filters['date_from']) && trim($filters['date_from']) !== '') {
                $whereConditions[] = "DATE(u.created_at) >= ?";
                $params[] = trim($filters['date_from']);
            }

            if (!empty($filters['date_to']) && trim($filters['date_to']) !== '') {
                $whereConditions[] = "DATE(u.created_at) <= ?";
                $params[] = trim($filters['date_to']);
            }

            // Build WHERE clause
            $whereClause = implode(' AND ', $whereConditions);

            // Get total count for pagination
            $countSql = "
            SELECT COUNT(DISTINCT u.id) as total 
            FROM users u
            LEFT JOIN user_profiles up ON u.id = up.user_id AND up.deleted_at IS NULL
            WHERE $whereClause
        ";
        
            $countResult = $this->database->fetch($countSql, $params);
            $total = $countResult['total'] ?? 0;

            // Get users with profiles and address count
            $sql = "
            SELECT 
                u.id,
                u.phone_number,
                u.status,
                u.last_login_at,
                u.created_at as user_created_at,
                up.id as profile_id,
                up.first_name,
                up.last_name,
                up.gender,
                up.email,
                up.date_of_birth,
                up.profile_picture,
                up.created_at as profile_created_at,
                up.updated_at as profile_updated_at,
                (SELECT COUNT(*) FROM user_addresses ua WHERE ua.user_id = u.id AND ua.deleted_at IS NULL) as address_count
            FROM users u
            LEFT JOIN user_profiles up ON u.id = up.user_id AND up.deleted_at IS NULL
            WHERE $whereClause
            ORDER BY u.created_at DESC
            LIMIT ? OFFSET ?
        ";

            // Add pagination parameters
            $params[] = (int)$limit;
            $params[] = (int)$offset;

            $users = $this->database->fetchAll($sql, $params);

            // Process users data
            $processedUsers = [];
            foreach ($users as $user) {
                $processedUsers[] = [
                    'id' => (int)$user['id'],
                    'phone_number' => $user['phone_number'],
                    'status' => $user['status'],
                    'last_login_at' => $user['last_login_at'],
                    'created_at' => $user['user_created_at'],
                    'profile' => $user['profile_id'] ? [
                        'id' => (int)$user['profile_id'],
                        'first_name' => $user['first_name'],
                        'last_name' => $user['last_name'],
                        'full_name' => trim(($user['first_name'] ?? '') . ' ' . ($user['last_name'] ?? '')),
                        'gender' => $user['gender'],
                        'email' => $user['email'],
                        'date_of_birth' => $user['date_of_birth'],
                        'profile_picture' => $user['profile_picture'],
                        'created_at' => $user['profile_created_at'],
                        'updated_at' => $user['profile_updated_at']
                    ] : null,
                    'address_count' => (int)$user['address_count'],
                    'has_complete_profile' => !empty($user['first_name']) && !empty($user['last_name']) && !empty($user['email'])
                ];
            }

            return [
                'data' => $processedUsers,
                'meta' => [
                    'current_page' => (int)$page,
                    'per_page' => (int)$limit,
                    'total' => (int)$total,
                    'total_pages' => ceil($total / $limit),
                    'filters_applied' => array_filter($filters, function($value) {
                        return !empty($value) && trim($value) !== '';
                    })
                ]
            ];
        } catch (Exception $e) {
            error_log("AdminUserRepository::getAllUsers Error: " . $e->getMessage());
            error_log("SQL Params: " . print_r($params, true));
            throw new Exception('Error retrieving users: ' . $e->getMessage());
        }
    }

    /**
     * Get user details with profile, addresses, and comprehensive order information
     *
     * @param int $userId User ID
     * @return array User details
     * @throws NotFoundException
     */
    public function getUserDetails($userId)
    {
        try {
            // Get user with profile
            $sql = "
                SELECT 
                    u.id,
                    u.phone_number,
                    u.status,
                    u.last_login_at,
                    u.created_at as user_created_at,
                    up.id as profile_id,
                    up.first_name,
                    up.last_name,
                    up.gender,
                    up.email,
                    up.date_of_birth,
                    up.profile_picture,
                    up.created_at as profile_created_at,
                    up.updated_at as profile_updated_at
                FROM users u
                LEFT JOIN user_profiles up ON u.id = up.user_id AND up.deleted_at IS NULL
                WHERE u.id = ?
            ";
            
            $user = $this->database->fetch($sql, [$userId]);
            
            if (!$user) {
                throw new NotFoundException('User not found');
            }

            // Get user addresses
            $addressSql = "
                SELECT 
                    id,
                    address_type,
                    label,
                    contact_name,
                    contact_phone,
                    address_line1,
                    address_line2,
                    city,
                    state,
                    postal_code,
                    country,
                    is_default,
                    created_at,
                    updated_at
                FROM user_addresses 
                WHERE user_id = ? AND deleted_at IS NULL
                ORDER BY is_default DESC, created_at ASC
            ";
            
            $addresses = $this->database->fetchAll($addressSql, [$userId]);

            // Get comprehensive order information
            $orderStats = $this->getUserOrderStatistics($userId);
            $recentOrders = $this->getUserRecentOrders($userId);
            $orderHistory = $this->getUserOrderHistory($userId);
            $paymentStats = $this->getUserPaymentStatistics($userId);

            // Format addresses
            $formattedAddresses = [];
            foreach ($addresses as $address) {
                $formattedAddresses[] = [
                    'id' => (int)$address['id'],
                    'address_type' => $address['address_type'],
                    'label' => $address['label'],
                    'contact_name' => $address['contact_name'],
                    'contact_phone' => $address['contact_phone'],
                    'address_line1' => $address['address_line1'],
                    'address_line2' => $address['address_line2'],
                    'city' => $address['city'],
                    'state' => $address['state'],
                    'postal_code' => $address['postal_code'],
                    'country' => $address['country'],
                    'is_default' => (bool)$address['is_default'],
                    'full_address' => $this->formatFullAddress($address),
                    'created_at' => $address['created_at'],
                    'updated_at' => $address['updated_at']
                ];
            }

            // Format user data with comprehensive order information
            return [
                'id' => (int)$user['id'],
                'phone_number' => $user['phone_number'],
                'status' => $user['status'],
                'last_login_at' => $user['last_login_at'],
                'created_at' => $user['user_created_at'],
                'profile' => $user['profile_id'] ? [
                    'id' => (int)$user['profile_id'],
                    'first_name' => $user['first_name'],
                    'last_name' => $user['last_name'],
                    'full_name' => trim(($user['first_name'] ?? '') . ' ' . ($user['last_name'] ?? '')),
                    'gender' => $user['gender'],
                    'email' => $user['email'],
                    'date_of_birth' => $user['date_of_birth'],
                    'profile_picture' => $user['profile_picture'],
                    'created_at' => $user['profile_created_at'],
                    'updated_at' => $user['profile_updated_at']
                ] : null,
                'addresses' => $formattedAddresses,
                'address_count' => count($formattedAddresses),
                'has_complete_profile' => !empty($user['first_name']) && !empty($user['last_name']) && !empty($user['email']),
                'order_statistics' => $orderStats,
                'recent_orders' => $recentOrders,
                'order_history_summary' => $orderHistory,
                'payment_statistics' => $paymentStats
            ];
        } catch (NotFoundException $e) {
            throw $e;
        } catch (Exception $e) {
            throw new Exception('Error retrieving user details: ' . $e->getMessage());
        }
    }

    /**
     * Get comprehensive order statistics for a user
     *
     * @param int $userId User ID
     * @return array Order statistics
     */
    private function getUserOrderStatistics($userId)
    {
        try {
            $sql = "
                SELECT 
                    COUNT(*) as total_orders,
                    SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending_orders,
                    SUM(CASE WHEN status = 'confirmed' THEN 1 ELSE 0 END) as confirmed_orders,
                    SUM(CASE WHEN status = 'processing' THEN 1 ELSE 0 END) as processing_orders,
                    SUM(CASE WHEN status = 'shipped' THEN 1 ELSE 0 END) as shipped_orders,
                    SUM(CASE WHEN status = 'delivered' THEN 1 ELSE 0 END) as delivered_orders,
                    SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) as cancelled_orders,
                    SUM(CASE WHEN status = 'returned' THEN 1 ELSE 0 END) as returned_orders,
                    SUM(CASE WHEN status = 'refunded' THEN 1 ELSE 0 END) as refunded_orders,
                    SUM(CASE WHEN status IN ('delivered', 'shipped') THEN final_total ELSE 0 END) as total_spent,
                    AVG(CASE WHEN status IN ('delivered', 'shipped') THEN final_total ELSE NULL END) as avg_order_value,
                    MAX(final_total) as highest_order_value,
                    MIN(final_total) as lowest_order_value,
                    MAX(order_date) as last_order_date,
                    MIN(order_date) as first_order_date
                FROM orders 
                WHERE user_id = ?
            ";
            
            $stats = $this->database->fetch($sql, [$userId]);
            
            if (!$stats) {
                return [
                    'total_orders' => 0,
                    'pending_orders' => 0,
                    'confirmed_orders' => 0,
                    'processing_orders' => 0,
                    'shipped_orders' => 0,
                    'delivered_orders' => 0,
                    'cancelled_orders' => 0,
                    'returned_orders' => 0,
                    'refunded_orders' => 0,
                    'total_spent' => 0.00,
                    'avg_order_value' => 0.00,
                    'highest_order_value' => 0.00,
                    'lowest_order_value' => 0.00,
                    'last_order_date' => null,
                    'first_order_date' => null,
                    'success_rate' => 0.00,
                    'cancellation_rate' => 0.00
                ];
            }

            $totalOrders = (int)$stats['total_orders'];
            $deliveredOrders = (int)$stats['delivered_orders'];
            $cancelledOrders = (int)$stats['cancelled_orders'];

            return [
                'total_orders' => $totalOrders,
                'pending_orders' => (int)$stats['pending_orders'],
                'confirmed_orders' => (int)$stats['confirmed_orders'],
                'processing_orders' => (int)$stats['processing_orders'],
                'shipped_orders' => (int)$stats['shipped_orders'],
                'delivered_orders' => $deliveredOrders,
                'cancelled_orders' => $cancelledOrders,
                'returned_orders' => (int)$stats['returned_orders'],
                'refunded_orders' => (int)$stats['refunded_orders'],
                'total_spent' => (float)($stats['total_spent'] ?? 0),
                'avg_order_value' => (float)($stats['avg_order_value'] ?? 0),
                'highest_order_value' => (float)($stats['highest_order_value'] ?? 0),
                'lowest_order_value' => (float)($stats['lowest_order_value'] ?? 0),
                'last_order_date' => $stats['last_order_date'],
                'first_order_date' => $stats['first_order_date'],
                'success_rate' => $totalOrders > 0 ? round(($deliveredOrders / $totalOrders) * 100, 2) : 0.00,
                'cancellation_rate' => $totalOrders > 0 ? round(($cancelledOrders / $totalOrders) * 100, 2) : 0.00
            ];
        } catch (Exception $e) {
            error_log("Error getting user order statistics: " . $e->getMessage());
            return [];
        }
    }

    /**
     * Get recent orders for a user
     *
     * @param int $userId User ID
     * @param int $limit Number of recent orders to fetch
     * @return array Recent orders
     */
    private function getUserRecentOrders($userId, $limit = 10)
    {
        try {
            $sql = "
                SELECT 
                    o.id,
                    o.order_number,
                    o.status,
                    o.order_date,
                    o.subtotal,
                    o.tax_amount,
                    o.shipping_amount,
                    o.discount_amount,
                    o.final_total,
                    o.delivery_address,
                    o.created_at,
                    o.updated_at,
                    p.payment_method,
                    p.status as payment_status,
                    p.transaction_id,
                    COUNT(oi.id) as total_items,
                    SUM(oi.quantity) as total_quantity
                FROM orders o
                LEFT JOIN payments p ON o.id = p.order_id
                LEFT JOIN order_items oi ON o.id = oi.order_id
                WHERE o.user_id = ?
                GROUP BY o.id, p.id
                ORDER BY o.created_at DESC
                LIMIT ?
            ";
            
            $orders = $this->database->fetchAll($sql, [$userId, $limit]);
            
            $formattedOrders = [];
            foreach ($orders as $order) {
                $formattedOrders[] = [
                    'id' => (int)$order['id'],
                    'order_number' => $order['order_number'],
                    'status' => $order['status'],
                    'order_date' => $order['order_date'],
                    'subtotal' => (float)$order['subtotal'],
                    'tax_amount' => (float)$order['tax_amount'],
                    'shipping_amount' => (float)$order['shipping_amount'],
                    'discount_amount' => (float)$order['discount_amount'],
                    'final_total' => (float)$order['final_total'],
                    'delivery_address' => $order['delivery_address'],
                    'payment_method' => $order['payment_method'],
                    'payment_status' => $order['payment_status'],
                    'transaction_id' => $order['transaction_id'],
                    'total_items' => (int)$order['total_items'],
                    'total_quantity' => (int)$order['total_quantity'],
                    'created_at' => $order['created_at'],
                    'updated_at' => $order['updated_at']
                ];
            }
            
            return $formattedOrders;
        } catch (Exception $e) {
            error_log("Error getting user recent orders: " . $e->getMessage());
            return [];
        }
    }

    /**
     * Get order history summary for a user
     *
     * @param int $userId User ID
     * @return array Order history summary
     */
    private function getUserOrderHistory($userId)
    {
        try {
            // Monthly order summary for last 12 months
            $monthlySql = "
                SELECT 
                    DATE_FORMAT(order_date, '%Y-%m') as month,
                    COUNT(*) as order_count,
                    SUM(final_total) as total_amount,
                    AVG(final_total) as avg_amount
                FROM orders 
                WHERE user_id = ? AND order_date >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
                GROUP BY DATE_FORMAT(order_date, '%Y-%m')
                ORDER BY month DESC
            ";
            
            $monthlyData = $this->database->fetchAll($monthlySql, [$userId]);
            
            // Status-wise order count
            $statusSql = "
                SELECT 
                    status,
                    COUNT(*) as count,
                    SUM(final_total) as total_amount
                FROM orders 
                WHERE user_id = ?
                GROUP BY status
            ";
            
            $statusData = $this->database->fetchAll($statusSql, [$userId]);
            
            return [
                'monthly_summary' => $monthlyData,
                'status_summary' => $statusData
            ];
        } catch (Exception $e) {
            error_log("Error getting user order history: " . $e->getMessage());
            return [];
        }
    }

    /**
     * Get payment statistics for a user
     *
     * @param int $userId User ID
     * @return array Payment statistics
     */
    private function getUserPaymentStatistics($userId)
    {
        try {
            $sql = "
                SELECT 
                    p.payment_method,
                    COUNT(*) as payment_count,
                    SUM(p.amount) as total_amount,
                    SUM(CASE WHEN p.status = 'success' THEN 1 ELSE 0 END) as successful_payments,
                    SUM(CASE WHEN p.status = 'failed' THEN 1 ELSE 0 END) as failed_payments,
                    SUM(CASE WHEN p.status = 'pending' THEN 1 ELSE 0 END) as pending_payments,
                    SUM(CASE WHEN p.status = 'refunded' THEN p.refund_amount ELSE 0 END) as total_refunds
                FROM payments p
                INNER JOIN orders o ON p.order_id = o.id
                WHERE o.user_id = ?
                GROUP BY p.payment_method
            ";
            
            $paymentData = $this->database->fetchAll($sql, [$userId]);
            
            $formattedData = [];
            foreach ($paymentData as $payment) {
                $totalPayments = (int)$payment['payment_count'];
                $successfulPayments = (int)$payment['successful_payments'];
                
                $formattedData[] = [
                    'payment_method' => $payment['payment_method'],
                    'payment_count' => $totalPayments,
                    'total_amount' => (float)$payment['total_amount'],
                    'successful_payments' => $successfulPayments,
                    'failed_payments' => (int)$payment['failed_payments'],
                    'pending_payments' => (int)$payment['pending_payments'],
                    'total_refunds' => (float)$payment['total_refunds'],
                    'success_rate' => $totalPayments > 0 ? round(($successfulPayments / $totalPayments) * 100, 2) : 0.00
                ];
            }
            
            return $formattedData;
        } catch (Exception $e) {
            error_log("Error getting user payment statistics: " . $e->getMessage());
            return [];
        }
    }

    /**
     * Update user status
     *
     * @param int $userId User ID
     * @param string $status New status
     * @return bool Success status
     * @throws NotFoundException
     * @throws ValidationException
     */
    public function updateUserStatus($userId, $status)
    {
        try {
            // Validate status
            $validStatuses = ['active', 'inactive'];
            if (!in_array($status, $validStatuses)) {
                throw new ValidationException('Invalid status', ['status' => 'Status must be active or inactive']);
            }

            // Check if user exists
            $userExists = $this->database->fetch("SELECT id FROM users WHERE id = :id", [':id' => $userId]);
            if (!$userExists) {
                throw new NotFoundException('User not found');
            }

            // Update status
            $result = $this->database->update(
                'users', 
                ['status' => $status], 
                'id = :id', 
                [':id' => $userId]
            );

            if (!$result) {
                throw new Exception('Failed to update user status');
            }

            return true;
        } catch (NotFoundException $e) {
            throw $e;
        } catch (ValidationException $e) {
            throw $e;
        } catch (Exception $e) {
            throw new Exception('Error updating user status: ' . $e->getMessage());
        }
    }

    /**
     * Get users for export with comprehensive data
     *
     * @param array $filters Optional filters
     * @return array Users data for export
     */
    public function getUsersForExport($filters = [])
    {
        try {
            $whereConditions = ['1=1'];
            $params = [];

            // Apply filters if provided - only add conditions for non-empty values
            if (!empty($filters['search']) && trim($filters['search']) !== '') {
                $searchTerm = '%' . trim($filters['search']) . '%';
                $whereConditions[] = "(u.phone_number LIKE ? OR up.first_name LIKE ? OR up.last_name LIKE ? OR up.email LIKE ?)";
                $params[] = $searchTerm;
                $params[] = $searchTerm;
                $params[] = $searchTerm;
                $params[] = $searchTerm;
            }

            if (!empty($filters['status']) && trim($filters['status']) !== '') {
                $whereConditions[] = "u.status = ?";
                $params[] = trim($filters['status']);
            }

            if (!empty($filters['has_profile']) && trim($filters['has_profile']) !== '') {
                if (trim($filters['has_profile']) === 'yes') {
                    $whereConditions[] = "up.id IS NOT NULL";
                } else {
                    $whereConditions[] = "up.id IS NULL";
                }
            }

            // Registration date filters
            if (!empty($filters['registration_date_from']) && trim($filters['registration_date_from']) !== '') {
                $whereConditions[] = "DATE(u.created_at) >= ?";
                $params[] = trim($filters['registration_date_from']);
            }

            if (!empty($filters['registration_date_to']) && trim($filters['registration_date_to']) !== '') {
                $whereConditions[] = "DATE(u.created_at) <= ?";
                $params[] = trim($filters['registration_date_to']);
            }

            // Last login date filters
            if (!empty($filters['last_login_from']) && trim($filters['last_login_from']) !== '') {
                $whereConditions[] = "DATE(u.last_login_at) >= ?";
                $params[] = trim($filters['last_login_from']);
            }

            if (!empty($filters['last_login_to']) && trim($filters['last_login_to']) !== '') {
                $whereConditions[] = "DATE(u.last_login_at) <= ?";
                $params[] = trim($filters['last_login_to']);
            }

            // Order-based filters
            if (!empty($filters['has_orders']) && trim($filters['has_orders']) !== '') {
                if (trim($filters['has_orders']) === 'yes') {
                    $whereConditions[] = "order_stats.total_orders > 0";
                } else {
                    $whereConditions[] = "(order_stats.total_orders IS NULL OR order_stats.total_orders = 0)";
                }
            }

            if (!empty($filters['order_count_min']) && is_numeric($filters['order_count_min'])) {
                $whereConditions[] = "COALESCE(order_stats.total_orders, 0) >= ?";
                $params[] = (int)$filters['order_count_min'];
            }

            if (!empty($filters['order_count_max']) && is_numeric($filters['order_count_max'])) {
                $whereConditions[] = "COALESCE(order_stats.total_orders, 0) <= ?";
                $params[] = (int)$filters['order_count_max'];
            }

            if (!empty($filters['total_spent_min']) && is_numeric($filters['total_spent_min'])) {
                $whereConditions[] = "COALESCE(order_stats.total_spent, 0) >= ?";
                $params[] = (float)$filters['total_spent_min'];
            }

            if (!empty($filters['total_spent_max']) && is_numeric($filters['total_spent_max'])) {
                $whereConditions[] = "COALESCE(order_stats.total_spent, 0) <= ?";
                $params[] = (float)$filters['total_spent_max'];
            }

            $whereClause = implode(' AND ', $whereConditions);

            $sql = "
        SELECT 
            u.id,
            u.phone_number,
            u.status,
            u.last_login_at,
            u.created_at,
            up.first_name,
            up.last_name,
            up.email,
            up.gender,
            up.date_of_birth,
            up.created_at as profile_created_at,
            (SELECT COUNT(*) FROM user_addresses ua WHERE ua.user_id = u.id AND ua.deleted_at IS NULL) as address_count,
            COALESCE(order_stats.total_orders, 0) as total_orders,
            COALESCE(order_stats.total_spent, 0.00) as total_spent,
            COALESCE(order_stats.avg_order_value, 0.00) as avg_order_value,
            order_stats.last_order_date,
            order_stats.first_order_date,
            COALESCE(order_stats.completed_orders, 0) as completed_orders,
            COALESCE(order_stats.cancelled_orders, 0) as cancelled_orders,
            COALESCE(payment_stats.cod_orders, 0) as cod_orders,
            COALESCE(payment_stats.online_orders, 0) as online_orders,
            COALESCE(payment_stats.total_refunds, 0.00) as total_refunds
        FROM users u
        LEFT JOIN user_profiles up ON u.id = up.user_id AND up.deleted_at IS NULL
        LEFT JOIN (
            SELECT 
                user_id,
                COUNT(*) as total_orders,
                SUM(final_total) as total_spent,
                AVG(final_total) as avg_order_value,
                MAX(order_date) as last_order_date,
                MIN(order_date) as first_order_date,
                SUM(CASE WHEN status = 'delivered' THEN 1 ELSE 0 END) as completed_orders,
                SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) as cancelled_orders
            FROM orders 
            GROUP BY user_id
        ) order_stats ON u.id = order_stats.user_id
        LEFT JOIN (
            SELECT 
                o.user_id,
                SUM(CASE WHEN p.payment_method = 'cod' THEN 1 ELSE 0 END) as cod_orders,
                SUM(CASE WHEN p.payment_method = 'online' THEN 1 ELSE 0 END) as online_orders,
                SUM(CASE WHEN p.status = 'refunded' THEN p.refund_amount ELSE 0 END) as total_refunds
            FROM orders o
            LEFT JOIN payments p ON o.id = p.order_id
            GROUP BY o.user_id
        ) payment_stats ON u.id = payment_stats.user_id
        WHERE $whereClause
        ORDER BY u.created_at DESC
    ";

            $users = $this->database->fetchAll($sql, $params);

            // Format for export
            $exportData = [];
            foreach ($users as $user) {
                $fullName = trim(($user['first_name'] ?? '') . ' ' . ($user['last_name'] ?? ''));
                $exportData[] = [
                    'id' => $user['id'],
                    'phone_number' => $user['phone_number'],
                    'first_name' => $user['first_name'] ?? '',
                    'last_name' => $user['last_name'] ?? '',
                    'full_name' => $fullName ?: 'N/A',
                    'email' => $user['email'] ?? '',
                    'gender' => $user['gender'] ?? '',
                    'date_of_birth' => $user['date_of_birth'] ?? '',
                    'status' => $user['status'],
                    'address_count' => (int)$user['address_count'],
                    'last_login_at' => $user['last_login_at'] ?? '',
                    'registration_date' => $user['created_at'],
                    'profile_created_at' => $user['profile_created_at'] ?? '',
                    'total_orders' => (int)$user['total_orders'],
                    'total_spent' => number_format((float)$user['total_spent'], 2),
                    'avg_order_value' => number_format((float)$user['avg_order_value'], 2),
                    'completed_orders' => (int)$user['completed_orders'],
                    'cancelled_orders' => (int)$user['cancelled_orders'],
                    'cod_orders' => (int)$user['cod_orders'],
                    'online_orders' => (int)$user['online_orders'],
                    'total_refunds' => number_format((float)$user['total_refunds'], 2),
                    'first_order_date' => $user['first_order_date'] ?? '',
                    'last_order_date' => $user['last_order_date'] ?? '',
                    'days_since_registration' => $user['created_at'] ? 
                        (int)((time() - strtotime($user['created_at'])) / (60 * 60 * 24)) : 0,
                    'days_since_last_login' => $user['last_login_at'] ? 
                        (int)((time() - strtotime($user['last_login_at'])) / (60 * 60 * 24)) : null
                ];
            }

            return $exportData;
        } catch (Exception $e) {
            error_log("AdminUserRepository::getUsersForExport Error: " . $e->getMessage());
            error_log("SQL Params: " . print_r($params, true));
            throw new Exception('Error retrieving users for export: ' . $e->getMessage());
        }
    }

    /**
     * Get detailed user statistics
     *
     * @return array Comprehensive user statistics
     */
    public function getDetailedUserStatistics()
    {
        try {
            $stats = [];

            // Basic user counts
            $basicStats = $this->getBasicUserStats();
            $stats = array_merge($stats, $basicStats);

            // Profile and address statistics
            $profileStats = $this->getProfileStatistics();
            $stats = array_merge($stats, $profileStats);

            // Order statistics
            $orderStats = $this->getOrderStatistics();
            $stats = array_merge($stats, $orderStats);

            // Registration trends
            $registrationTrends = $this->getRegistrationTrends();
            $stats['registration_trends'] = $registrationTrends;

            // Activity patterns
            $activityPatterns = $this->getActivityPatterns();
            $stats['activity_patterns'] = $activityPatterns;

            // Geographic distribution
            $geographicStats = $this->getGeographicDistribution();
            $stats['geographic_distribution'] = $geographicStats;

            // Payment preferences
            $paymentStats = $this->getPaymentStatistics();
            $stats['payment_statistics'] = $paymentStats;

            // Top customers
            $topCustomers = $this->getTopCustomers();
            $stats['top_customers'] = $topCustomers;

            return $stats;
        } catch (Exception $e) {
            throw new Exception('Error retrieving detailed user statistics: ' . $e->getMessage());
        }
    }

    private function getBasicUserStats()
    {
        $stats = [];

        // Total users
        $totalResult = $this->database->fetch("SELECT COUNT(*) as count FROM users");
        $stats['total_users'] = (int)($totalResult['count'] ?? 0);

        // Active users
        $activeResult = $this->database->fetch("SELECT COUNT(*) as count FROM users WHERE status = 'active'");
        $stats['active_users'] = (int)($activeResult['count'] ?? 0);

        // Inactive users
        $inactiveResult = $this->database->fetch("SELECT COUNT(*) as count FROM users WHERE status = 'inactive'");
        $stats['inactive_users'] = (int)($inactiveResult['count'] ?? 0);

        return $stats;
    }

    private function getProfileStatistics()
    {
        $stats = [];

        // Users with profiles
        $profileResult = $this->database->fetch("
            SELECT COUNT(DISTINCT u.id) as count 
            FROM users u 
            INNER JOIN user_profiles up ON u.id = up.user_id AND up.deleted_at IS NULL
        ");
        $stats['users_with_profiles'] = (int)($profileResult['count'] ?? 0);

        // Users with complete profiles
        $completeProfileResult = $this->database->fetch("
            SELECT COUNT(DISTINCT u.id) as count 
            FROM users u 
            INNER JOIN user_profiles up ON u.id = up.user_id AND up.deleted_at IS NULL
            WHERE up.first_name IS NOT NULL AND up.last_name IS NOT NULL AND up.email IS NOT NULL
        ");
        $stats['users_with_complete_profiles'] = (int)($completeProfileResult['count'] ?? 0);

        // Users with addresses
        $addressResult = $this->database->fetch("
            SELECT COUNT(DISTINCT u.id) as count 
            FROM users u 
            INNER JOIN user_addresses ua ON u.id = ua.user_id AND ua.deleted_at IS NULL
        ");
        $stats['users_with_addresses'] = (int)($addressResult['count'] ?? 0);

        // Gender distribution
        $genderResult = $this->database->fetchAll("
            SELECT 
                COALESCE(up.gender, 'not_specified') as gender,
                COUNT(*) as count
            FROM users u
            LEFT JOIN user_profiles up ON u.id = up.user_id AND up.deleted_at IS NULL
            GROUP BY COALESCE(up.gender, 'not_specified')
        ");
        
        $stats['gender_distribution'] = [];
        foreach ($genderResult as $row) {
            $stats['gender_distribution'][$row['gender']] = (int)$row['count'];
        }

        return $stats;
    }

    private function getOrderStatistics()
    {
        $stats = [];

        // Users with orders
        $usersWithOrdersResult = $this->database->fetch("
            SELECT COUNT(DISTINCT user_id) as count FROM orders
        ");
        $stats['users_with_orders'] = (int)($usersWithOrdersResult['count'] ?? 0);

        // Total orders
        $totalOrdersResult = $this->database->fetch("
            SELECT COUNT(*) as count FROM orders
        ");
        $stats['total_orders'] = (int)($totalOrdersResult['count'] ?? 0);

        // Order status distribution
        $orderStatusResult = $this->database->fetchAll("
            SELECT status, COUNT(*) as count FROM orders GROUP BY status
        ");
        
        $stats['order_status_distribution'] = [];
        foreach ($orderStatusResult as $row) {
            $stats['order_status_distribution'][$row['status']] = (int)$row['count'];
        }

        // Revenue statistics
        $revenueResult = $this->database->fetch("
            SELECT 
                SUM(final_total) as total_revenue,
                AVG(final_total) as avg_order_value,
                MAX(final_total) as highest_order_value,
                MIN(final_total) as lowest_order_value
            FROM orders 
            WHERE status != 'cancelled'
        ");
        
        $stats['total_revenue'] = (float)($revenueResult['total_revenue'] ?? 0);
        $stats['average_order_value'] = (float)($revenueResult['avg_order_value'] ?? 0);
        $stats['highest_order_value'] = (float)($revenueResult['highest_order_value'] ?? 0);
        $stats['lowest_order_value'] = (float)($revenueResult['lowest_order_value'] ?? 0);

        return $stats;
    }

    private function getRegistrationTrends()
    {
        // Last 30 days registration trend
        $dailyRegistrations = $this->database->fetchAll("
            SELECT 
                DATE(created_at) as date,
                COUNT(*) as registrations
            FROM users 
            WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
            GROUP BY DATE(created_at)
            ORDER BY date DESC
        ");

        // Monthly registration trend (last 12 months)
        $monthlyRegistrations = $this->database->fetchAll("
            SELECT 
                DATE_FORMAT(created_at, '%Y-%m') as month,
                COUNT(*) as registrations
            FROM users 
            WHERE created_at >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
            GROUP BY DATE_FORMAT(created_at, '%Y-%m')
            ORDER BY month DESC
        ");

        return [
            'daily_last_30_days' => $dailyRegistrations,
            'monthly_last_12_months' => $monthlyRegistrations
        ];
    }

    private function getActivityPatterns()
    {
        // Recent active users (last 7, 30, 90 days)
        $activityPeriods = [7, 30, 90];
        $activityStats = [];

        foreach ($activityPeriods as $days) {
            $result = $this->database->fetch("
                SELECT COUNT(*) as count 
                FROM users 
                WHERE last_login_at >= DATE_SUB(NOW(), INTERVAL {$days} DAY)
            ");
            $activityStats["active_last_{$days}_days"] = (int)($result['count'] ?? 0);
        }

        // Users who never logged in
        $neverLoggedInResult = $this->database->fetch("
            SELECT COUNT(*) as count FROM users WHERE last_login_at IS NULL
        ");
        $activityStats['never_logged_in'] = (int)($neverLoggedInResult['count'] ?? 0);

        return $activityStats;
    }

    private function getGeographicDistribution()
    {
        // State-wise distribution
        $stateDistribution = $this->database->fetchAll("
            SELECT 
                state,
                COUNT(DISTINCT user_id) as user_count
            FROM user_addresses 
            WHERE deleted_at IS NULL
            GROUP BY state
            ORDER BY user_count DESC
            LIMIT 10
        ");

        // City-wise distribution (top 20)
        $cityDistribution = $this->database->fetchAll("
            SELECT 
                city,
                state,
                COUNT(DISTINCT user_id) as user_count
            FROM user_addresses 
            WHERE deleted_at IS NULL
            GROUP BY city, state
            ORDER BY user_count DESC
            LIMIT 20
        ");

        return [
            'top_states' => $stateDistribution,
            'top_cities' => $cityDistribution
        ];
    }

    private function getPaymentStatistics()
    {
        // Payment method distribution
        $paymentMethodResult = $this->database->fetchAll("
            SELECT 
                payment_method,
                COUNT(*) as order_count,
                SUM(amount) as total_amount
            FROM payments p
            INNER JOIN orders o ON p.order_id = o.id
            WHERE p.status = 'success'
            GROUP BY payment_method
        ");

        return [
            'payment_method_distribution' => $paymentMethodResult
        ];
    }

    private function getTopCustomers()
    {
        // Top customers by order count
        $topByOrders = $this->database->fetchAll("
            SELECT 
                u.id,
                u.phone_number,
                COALESCE(up.first_name, '') as first_name,
                COALESCE(up.last_name, '') as last_name,
                COUNT(o.id) as total_orders,
                SUM(o.final_total) as total_spent
            FROM users u
            LEFT JOIN user_profiles up ON u.id = up.user_id AND up.deleted_at IS NULL
            INNER JOIN orders o ON u.id = o.user_id
            WHERE o.status != 'cancelled'
            GROUP BY u.id, u.phone_number, up.first_name, up.last_name
            ORDER BY total_orders DESC
            LIMIT 10
        ");

        // Top customers by spending
        $topBySpending = $this->database->fetchAll("
            SELECT 
                u.id,
                u.phone_number,
                COALESCE(up.first_name, '') as first_name,
                COALESCE(up.last_name, '') as last_name,
                COUNT(o.id) as total_orders,
                SUM(o.final_total) as total_spent
            FROM users u
            LEFT JOIN user_profiles up ON u.id = up.user_id AND up.deleted_at IS NULL
            INNER JOIN orders o ON u.id = o.user_id
            WHERE o.status != 'cancelled'
            GROUP BY u.id, u.phone_number, up.first_name, up.last_name
            ORDER BY total_spent DESC
            LIMIT 10
        ");

        return [
            'top_by_order_count' => $topByOrders,
            'top_by_spending' => $topBySpending
        ];
    }

    /**
     * Format full address string
     *
     * @param array $address Address data
     * @return string Formatted address
     */
    private function formatFullAddress($address)
    {
        $parts = [];
        
        if (!empty($address['address_line1'])) {
            $parts[] = $address['address_line1'];
        }
        
        if (!empty($address['address_line2'])) {
            $parts[] = $address['address_line2'];
        }
        
        if (!empty($address['city'])) {
            $parts[] = $address['city'];
        }
        
        if (!empty($address['state'])) {
            $parts[] = $address['state'];
        }
        
        if (!empty($address['postal_code'])) {
            $parts[] = $address['postal_code'];
        }
        
        if (!empty($address['country']) && $address['country'] !== 'India') {
            $parts[] = $address['country'];
        }
        
        return implode(', ', $parts);
    }
}
