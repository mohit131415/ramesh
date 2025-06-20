<?php

namespace App\Features\AdminOrderManagement\DataAccess;

use App\Core\Database;
use PDO;

class AdminOrderRepository
{
    private PDO $db;

    public function __construct()
    {
        $this->db = Database::getInstance()->getConnection();
    }

    public function getOrdersList(int $offset, int $limit, array $filters): array
    {
        $sql = "
            SELECT 
                o.*,
            u.phone_number as customer_phone,
            CONCAT(COALESCE(up.first_name, ''), ' ', COALESCE(up.last_name, '')) as customer_name,
            up.email as customer_email,
            os.city as shipping_city,
            os.state as shipping_state,
            os.postal_code as shipping_pincode,
            os.tracking_number,
            os.tracking_url,
            p.payment_received,
            p.payment_method
        FROM orders o
        LEFT JOIN users u ON o.user_id = u.id
        LEFT JOIN user_profiles up ON u.id = up.user_id
        LEFT JOIN order_shipping os ON o.id = os.order_id
        LEFT JOIN payments p ON o.id = p.order_id
        WHERE 1=1
    ";

        $params = [];

        // Apply filters
        if (!empty($filters['status'])) {
            $sql .= " AND o.status = ?";
            $params[] = $filters['status'];
        }

        if (!empty($filters['payment_status'])) {
            $sql .= " AND o.payment_status = ?";
            $params[] = $filters['payment_status'];
        }

        if (!empty($filters['payment_method'])) {
            $sql .= " AND p.payment_method = ?";
            $params[] = $filters['payment_method'];
        }

        if (!empty($filters['search'])) {
            $sql .= " AND (o.order_number LIKE ? OR CONCAT(COALESCE(up.first_name, ''), ' ', COALESCE(up.last_name, '')) LIKE ? OR u.phone_number LIKE ?)";
            $searchTerm = '%' . $filters['search'] . '%';
            $params[] = $searchTerm;
            $params[] = $searchTerm;
            $params[] = $searchTerm;
        }

        if (!empty($filters['date_from'])) {
            $sql .= " AND DATE(o.order_date) >= ?";
            $params[] = $filters['date_from'];
        }

        if (!empty($filters['date_to'])) {
            $sql .= " AND DATE(o.order_date) <= ?";
            $params[] = $filters['date_to'];
        }

        // Add sorting - validate and sanitize sort parameters
        $allowedSortFields = ['created_at', 'order_date', 'final_total', 'status', 'order_number'];
        $sortBy = in_array($filters['sort_by'] ?? 'created_at', $allowedSortFields) ? $filters['sort_by'] : 'created_at';
        $sortOrder = strtoupper($filters['sort_order'] ?? 'desc') === 'ASC' ? 'ASC' : 'DESC';
        $sql .= " ORDER BY o.{$sortBy} {$sortOrder}";

        // Add pagination
        $sql .= " LIMIT ? OFFSET ?";
        $params[] = $limit;
        $params[] = $offset;

        $stmt = $this->db->prepare($sql);
        $stmt->execute($params);
        
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function getOrdersCount(array $filters): int
    {
        $sql = "
        SELECT COUNT(DISTINCT o.id)
        FROM orders o
        LEFT JOIN users u ON o.user_id = u.id
        LEFT JOIN user_profiles up ON u.id = up.user_id
        LEFT JOIN payments p ON o.id = p.order_id
        WHERE 1=1
    ";

        $params = [];

        // Apply same filters as getOrdersList
        if (!empty($filters['status'])) {
            $sql .= " AND o.status = ?";
            $params[] = $filters['status'];
        }

        if (!empty($filters['payment_status'])) {
            $sql .= " AND o.payment_status = ?";
            $params[] = $filters['payment_status'];
        }

        if (!empty($filters['payment_method'])) {
            $sql .= " AND p.payment_method = ?";
            $params[] = $filters['payment_method'];
        }

        if (!empty($filters['search'])) {
            $sql .= " AND (o.order_number LIKE ? OR CONCAT(COALESCE(up.first_name, ''), ' ', COALESCE(up.last_name, '')) LIKE ? OR u.phone_number LIKE ?)";
            $searchTerm = '%' . $filters['search'] . '%';
            $params[] = $searchTerm;
            $params[] = $searchTerm;
            $params[] = $searchTerm;
        }

        if (!empty($filters['date_from'])) {
            $sql .= " AND DATE(o.order_date) >= ?";
            $params[] = $filters['date_from'];
        }

        if (!empty($filters['date_to'])) {
            $sql .= " AND DATE(o.order_date) <= ?";
            $params[] = $filters['date_to'];
        }

        $stmt = $this->db->prepare($sql);
        $stmt->execute($params);
        
        return (int)$stmt->fetchColumn();
    }

    public function getOrderById(int $orderId): ?array
    {
        $sql = "
            SELECT 
                o.*,
                u.phone_number as customer_phone,
                CONCAT(COALESCE(up.first_name, ''), ' ', COALESCE(up.last_name, '')) as customer_name,
                up.email as customer_email,
                p.payment_received,
                p.payment_method
            FROM orders o
            LEFT JOIN users u ON o.user_id = u.id
            LEFT JOIN user_profiles up ON u.id = up.user_id
            LEFT JOIN payments p ON o.id = p.order_id
            WHERE o.id = :order_id
        ";

        $stmt = $this->db->prepare($sql);
        $stmt->bindValue(':order_id', $orderId, PDO::PARAM_INT);
        $stmt->execute();

        $result = $stmt->fetch(PDO::FETCH_ASSOC);
        return $result ?: null;
    }

    public function getOrderItems(int $orderId): array
    {
        $sql = "
            SELECT *
            FROM order_items
            WHERE order_id = :order_id
            ORDER BY id
        ";

        $stmt = $this->db->prepare($sql);
        $stmt->bindValue(':order_id', $orderId, PDO::PARAM_INT);
        $stmt->execute();

        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function getOrderShipping(int $orderId): array
    {
        $sql = "
            SELECT *
            FROM order_shipping
            WHERE order_id = :order_id
        ";

        $stmt = $this->db->prepare($sql);
        $stmt->bindValue(':order_id', $orderId, PDO::PARAM_INT);
        $stmt->execute();

        return $stmt->fetch(PDO::FETCH_ASSOC) ?: [];
    }

    public function getOrderPayment(int $orderId): array
    {
        $sql = "
            SELECT *
            FROM payments
            WHERE order_id = :order_id
            ORDER BY created_at DESC
            LIMIT 1
        ";

        $stmt = $this->db->prepare($sql);
        $stmt->bindValue(':order_id', $orderId, PDO::PARAM_INT);
        $stmt->execute();

        return $stmt->fetch(PDO::FETCH_ASSOC) ?: [];
    }

    public function getOrderStatusHistory(int $orderId): array
    {
        $sql = "
            SELECT *
            FROM order_status_history
            WHERE order_id = :order_id
            ORDER BY created_at ASC
        ";

        $stmt = $this->db->prepare($sql);
        $stmt->bindValue(':order_id', $orderId, PDO::PARAM_INT);
        $stmt->execute();

        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function updateOrderStatus(int $orderId, string $status, int $adminId): bool
    {
        try {
            $this->db->beginTransaction();
            
            // Build the SQL query with conditional confirmed_at update
            $sql = "
                UPDATE orders 
                SET status = :status, 
                    updated_by = :admin_id, 
                    updated_at = CURRENT_TIMESTAMP";
            
            // Add confirmed_at timestamp if status is 'preparing'
            if ($status === 'preparing') {
                $sql .= ", confirmed_at = CURRENT_TIMESTAMP";
            }
            
            $sql .= " WHERE id = :order_id";

            $stmt = $this->db->prepare($sql);
            $stmt->bindValue(':status', $status);
            $stmt->bindValue(':admin_id', $adminId, PDO::PARAM_INT);
            $stmt->bindValue(':order_id', $orderId, PDO::PARAM_INT);
            $stmt->execute();
            
            // Update order_items status to match the order status
            $sqlItems = "
                UPDATE order_items 
                SET status = :status,
                    updated_at = CURRENT_TIMESTAMP
                WHERE order_id = :order_id
            ";
            
            $stmtItems = $this->db->prepare($sqlItems);
            $stmtItems->bindValue(':status', $status);
            $stmtItems->bindValue(':order_id', $orderId, PDO::PARAM_INT);
            $stmtItems->execute();
            
            $this->db->commit();
            return true;
            
        } catch (\Exception $e) {
            $this->db->rollBack();
            error_log("Error updating order status: " . $e->getMessage());
            return false;
        }
    }

    public function addStatusHistory(int $orderId, string $status, ?string $notes, int $changedBy, bool $isAdmin): bool
    {
        $sql = "
            INSERT INTO order_status_history (order_id, status, notes, changed_by, is_admin, created_at)
            VALUES (:order_id, :status, :notes, :changed_by, :is_admin, CURRENT_TIMESTAMP)
        ";

        $stmt = $this->db->prepare($sql);
        $stmt->bindValue(':order_id', $orderId, PDO::PARAM_INT);
        $stmt->bindValue(':status', $status);
        $stmt->bindValue(':notes', $notes);
        $stmt->bindValue(':changed_by', $changedBy, PDO::PARAM_INT);
        $stmt->bindValue(':is_admin', $isAdmin, PDO::PARAM_BOOL);

        return $stmt->execute();
    }

    public function cancelOrder(int $orderId, string $reason, int $adminId): bool
    {
        try {
            $this->db->beginTransaction();

            // Update order status
            $sql = "
                UPDATE orders 
                SET status = 'cancelled', cancelled_at = CURRENT_TIMESTAMP, updated_by = :admin_id
                WHERE id = :order_id
            ";

            $stmt = $this->db->prepare($sql);
            $stmt->bindValue(':admin_id', $adminId, PDO::PARAM_INT);
            $stmt->bindValue(':order_id', $orderId, PDO::PARAM_INT);
            $stmt->execute();

            // Update order items status
            $sql = "
                UPDATE order_items 
                SET status = 'cancelled'
                WHERE order_id = :order_id
            ";

            $stmt = $this->db->prepare($sql);
            $stmt->bindValue(':order_id', $orderId, PDO::PARAM_INT);
            $stmt->execute();

            $this->db->commit();
            return true;

        } catch (\Exception $e) {
            $this->db->rollBack();
            return false;
        }
    }

    public function processRefund(int $orderId, float $refundAmount, string $reason, string $refundMethod, int $adminId): bool
    {
        try {
            $this->db->beginTransaction();

            // Debug log to see what's happening
            error_log("Starting refund process for order ID: {$orderId}, amount: {$refundAmount}");

            // First check if payment record exists
            $checkSql = "SELECT id, amount, refund_amount FROM payments WHERE order_id = :order_id";
            $checkStmt = $this->db->prepare($checkSql);
            $checkStmt->bindValue(':order_id', $orderId, PDO::PARAM_INT);
            $checkStmt->execute();
            $payment = $checkStmt->fetch(PDO::FETCH_ASSOC);

            if (!$payment) {
                error_log("No payment record found for order ID: {$orderId}");
                
                // Create a payment record if it doesn't exist
                $createSql = "INSERT INTO payments (order_id, amount, payment_method, status, created_at) 
                              SELECT id, final_total, 'online', 'success', NOW() 
                              FROM orders WHERE id = :order_id";
                $createStmt = $this->db->prepare($createSql);
                $createStmt->bindValue(':order_id', $orderId, PDO::PARAM_INT);
                $createResult = $createStmt->execute();
                
                if (!$createResult) {
                    error_log("Failed to create payment record for order ID: {$orderId}");
                    $this->db->rollBack();
                    return false;
                }
                
                // Get the newly created payment
                $checkStmt->execute();
                $payment = $checkStmt->fetch(PDO::FETCH_ASSOC);
                
                if (!$payment) {
                    error_log("Still no payment record after creation attempt for order ID: {$orderId}");
                    $this->db->rollBack();
                    return false;
                }
            }

            error_log("Payment record found: " . json_encode($payment));
            
            $currentRefundAmount = (float)($payment['refund_amount'] ?? 0);
            $newRefundAmount = $currentRefundAmount + $refundAmount;
            $totalAmount = (float)($payment['amount'] ?? 0);
            
            error_log("Current refund: {$currentRefundAmount}, New total refund: {$newRefundAmount}, Total amount: {$totalAmount}");

            // Update payment record
            $sql = "
                UPDATE payments 
                SET refund_amount = :refund_amount,
                    refund_reason = :reason,
                    refunded_at = CURRENT_TIMESTAMP,
                    status = CASE 
                        WHEN :new_refund_amount >= amount THEN 'refunded'
                        ELSE 'partially_refunded'
                    END
                WHERE order_id = :order_id
            ";

            $stmt = $this->db->prepare($sql);
            $stmt->bindValue(':refund_amount', $newRefundAmount);
            $stmt->bindValue(':new_refund_amount', $newRefundAmount); // Separate binding for the CASE statement
            $stmt->bindValue(':reason', $reason);
            $stmt->bindValue(':order_id', $orderId, PDO::PARAM_INT);
            $result = $stmt->execute();

            if (!$result) {
                error_log("Failed to update payment record for order ID: {$orderId}. Error: " . json_encode($stmt->errorInfo()));
                $this->db->rollBack();
                return false;
            }

            // Get order total for comparison
            $orderSql = "SELECT final_total FROM orders WHERE id = :order_id";
            $orderStmt = $this->db->prepare($orderSql);
            $orderStmt->bindValue(':order_id', $orderId, PDO::PARAM_INT);
            $orderStmt->execute();
            $order = $orderStmt->fetch(PDO::FETCH_ASSOC);
            
            if (!$order) {
                error_log("Order not found for ID: {$orderId}");
                $this->db->rollBack();
                return false;
            }
            
            $orderTotal = (float)$order['final_total'];
            error_log("Order total: {$orderTotal}, Comparing with refund amount: {$newRefundAmount}");

            // Update order payment status
            $updateOrderSql = "
                UPDATE orders 
                SET payment_status = CASE 
                    WHEN :refund_amount >= final_total THEN 'refunded'
                    ELSE 'partially_refunded'
                END,
                updated_by = :admin_id,
                updated_at = CURRENT_TIMESTAMP
                WHERE id = :order_id
            ";

            $updateOrderStmt = $this->db->prepare($updateOrderSql);
            $updateOrderStmt->bindValue(':refund_amount', $newRefundAmount);
            $updateOrderStmt->bindValue(':order_id', $orderId, PDO::PARAM_INT);
            $updateOrderStmt->bindValue(':admin_id', $adminId, PDO::PARAM_INT);
            $orderResult = $updateOrderStmt->execute();

            if (!$orderResult) {
                error_log("Failed to update order payment status for order ID: {$orderId}. Error: " . json_encode($updateOrderStmt->errorInfo()));
                $this->db->rollBack();
                return false;
            }

            error_log("Refund processed successfully for order ID: {$orderId}");
            $this->db->commit();
            return true;

        } catch (\Exception $e) {
            $this->db->rollBack();
            error_log("Exception processing refund for order ID {$orderId}: " . $e->getMessage());
            error_log("Stack trace: " . $e->getTraceAsString());
            return false;
        }
    }

    public function updateShippingDetails(int $orderId, string $trackingNumber, ?string $trackingUrl, ?string $courierPartner, ?string $estimatedDeliveryDate): bool
    {
        $sql = "
            UPDATE order_shipping 
            SET tracking_number = :tracking_number,
                tracking_url = :tracking_url,
                courier_partner = :courier_partner,
                estimated_delivery_date = :estimated_delivery_date,
                status = 'shipped',
                shipped_at = CURRENT_TIMESTAMP
            WHERE order_id = :order_id
        ";

        $stmt = $this->db->prepare($sql);
        $stmt->bindValue(':tracking_number', $trackingNumber);
        $stmt->bindValue(':tracking_url', $trackingUrl);
        $stmt->bindValue(':courier_partner', $courierPartner);
        $stmt->bindValue(':estimated_delivery_date', $estimatedDeliveryDate);
        $stmt->bindValue(':order_id', $orderId, PDO::PARAM_INT);

        return $stmt->execute();
    }

    public function markPaymentReceived(int $orderId, float $amountReceived, int $adminId): bool
    {
        try {
            $this->db->beginTransaction();

            // Update payment record - set both payment_received_at and completed_at
            $sql = "
                UPDATE payments 
                SET payment_received = TRUE,
                    payment_received_at = CURRENT_TIMESTAMP,
                    completed_at = CURRENT_TIMESTAMP,
                    status = 'success'
            WHERE order_id = :order_id
        ";

        $stmt = $this->db->prepare($sql);
        $stmt->bindValue(':order_id', $orderId, PDO::PARAM_INT);
        $stmt->execute();

        // Update order payment status
        $sql = "
            UPDATE orders 
            SET payment_status = 'paid',
                updated_by = :admin_id
            WHERE id = :order_id
        ";

        $stmt = $this->db->prepare($sql);
        $stmt->bindValue(':order_id', $orderId, PDO::PARAM_INT);
        $stmt->bindValue(':admin_id', $adminId, PDO::PARAM_INT);
        $stmt->execute();

        $this->db->commit();
        return true;

    } catch (\Exception $e) {
        $this->db->rollBack();
        return false;
    }
}

    public function getOrderStatistics(string $period, ?string $dateFrom, ?string $dateTo): array
    {
        // Build date filter based on period
        $dateFilter = '';
        $params = [];

        if ($dateFrom && $dateTo) {
            $dateFilter = "AND DATE(order_date) BETWEEN :date_from AND :date_to";
            $params['date_from'] = $dateFrom;
            $params['date_to'] = $dateTo;
        } else {
            switch ($period) {
                case 'today':
                    $dateFilter = "AND DATE(order_date) = CURDATE()";
                    break;
                case 'week':
                    $dateFilter = "AND order_date >= DATE_SUB(NOW(), INTERVAL 7 DAY)";
                    break;
                case 'month':
                    $dateFilter = "AND order_date >= DATE_SUB(NOW(), INTERVAL 30 DAY)";
                    break;
                case 'year':
                    $dateFilter = "AND order_date >= DATE_SUB(NOW(), INTERVAL 365 DAY)";
                    break;
            }
        }

        // Get overall statistics
        $sql = "
            SELECT 
                COUNT(*) as total_orders,
                SUM(final_total) as total_revenue,
                AVG(final_total) as average_order_value,
                SUM(item_count) as total_items_sold,
                SUM(total_quantity) as total_quantity_sold
            FROM orders 
            WHERE 1=1 {$dateFilter}
        ";

        $stmt = $this->db->prepare($sql);
        foreach ($params as $key => $value) {
            $stmt->bindValue(':' . $key, $value);
        }
        $stmt->execute();
        $overall = $stmt->fetch(PDO::FETCH_ASSOC);

        // Get status breakdown
        $sql = "
            SELECT 
                status,
                COUNT(*) as count,
                SUM(final_total) as revenue
            FROM orders 
            WHERE 1=1 {$dateFilter}
            GROUP BY status
            ORDER BY count DESC
        ";

        $stmt = $this->db->prepare($sql);
        foreach ($params as $key => $value) {
            $stmt->bindValue(':' . $key, $value);
        }
        $stmt->execute();
        $statusBreakdown = $stmt->fetchAll(PDO::FETCH_ASSOC);

        // Get payment method breakdown
        $sql = "
            SELECT 
                p.payment_method,
                COUNT(*) as count,
                SUM(o.final_total) as revenue
            FROM orders o
            LEFT JOIN payments p ON o.id = p.order_id
            WHERE 1=1 {$dateFilter}
            GROUP BY p.payment_method
            ORDER BY count DESC
        ";

        $stmt = $this->db->prepare($sql);
        foreach ($params as $key => $value) {
            $stmt->bindValue(':' . $key, $value);
        }
        $stmt->execute();
        $paymentBreakdown = $stmt->fetchAll(PDO::FETCH_ASSOC);

        return [
            'overall' => $overall,
            'by_status' => $statusBreakdown,
            'by_payment_method' => $paymentBreakdown,
            'period' => $period,
            'date_range' => [
                'from' => $dateFrom,
                'to' => $dateTo
            ]
        ];
    }

    public function getOrdersForExport(array $filters): array
    {
        $sql = "
            SELECT 
                o.*,
                u.phone_number as customer_phone,
                CONCAT(COALESCE(up.first_name, ''), ' ', COALESCE(up.last_name, '')) as customer_name,
                up.email as customer_email,
                os.city as shipping_city,
                os.state as shipping_state,
                os.postal_code as shipping_pincode
            FROM orders o
            LEFT JOIN users u ON o.user_id = u.id
            LEFT JOIN user_profiles up ON u.id = up.user_id
            LEFT JOIN order_shipping os ON o.id = os.order_id
            WHERE 1=1
        ";

        $params = [];

        // Apply filters (same as getOrdersList but without pagination)
        if (!empty($filters['status'])) {
            $sql .= " AND o.status = :status";
            $params['status'] = $filters['status'];
        }

        if (!empty($filters['date_from'])) {
            $sql .= " AND DATE(o.order_date) >= :date_from";
            $params['date_from'] = $filters['date_from'];
        }

        if (!empty($filters['date_to'])) {
            $sql .= " AND DATE(o.order_date) <= :date_to";
            $params['date_to'] = $filters['date_to'];
        }

        $sql .= " ORDER BY o.created_at DESC";

        $stmt = $this->db->prepare($sql);
        
        foreach ($params as $key => $value) {
            $stmt->bindValue(':' . $key, $value);
        }
        
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function getOrdersSummary(array $filters): array
    {
        $sql = "
            SELECT 
                COUNT(*) as total_orders,
                SUM(final_total) as total_revenue,
                COUNT(CASE WHEN status = 'placed' THEN 1 END) as placed_orders,
                COUNT(CASE WHEN status = 'preparing' THEN 1 END) as preparing_orders,
                COUNT(CASE WHEN status = 'prepared' THEN 1 END) as prepared_orders,
                COUNT(CASE WHEN status = 'shipped' THEN 1 END) as shipped_orders,
                COUNT(CASE WHEN status = 'delivered' THEN 1 END) as delivered_orders,
                COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as cancelled_orders
            FROM orders o
            WHERE 1=1
        ";

        $params = [];

        if (!empty($filters['status'])) {
            $sql .= " AND o.status = :status";
            $params['status'] = $filters['status'];
        }

        if (!empty($filters['date_from'])) {
            $sql .= " AND DATE(o.order_date) >= :date_from";
            $params['date_from'] = $filters['date_from'];
        }

        if (!empty($filters['date_to'])) {
            $sql .= " AND DATE(o.order_date) <= :date_to";
            $params['date_to'] = $filters['date_to'];
        }

        $stmt = $this->db->prepare($sql);
        
        foreach ($params as $key => $value) {
            $stmt->bindValue(':' . $key, $value);
        }
        
        $stmt->execute();
        return $stmt->fetch(PDO::FETCH_ASSOC) ?: [];
    }
}
