<?php

namespace App\Features\Open\Orders\Services;

use App\Core\Database;
use Exception;

class OrderHistoryService
{
    private $db;

    public function __construct()
    {
        $this->db = Database::getInstance();
    }

    /**
     * Get order history for a user
     * 
     * @param int $userId User ID
     * @param int $page Page number
     * @param int $limit Items per page
     * @param array $filters Filters to apply
     * @return array Order history data
     */
    public function getOrderHistory($userId, $page = 1, $limit = 10, $filters = [])
    {
        try {
            // Build WHERE clause
            $whereConditions = ['o.user_id = :user_id'];
            $params = [':user_id' => $userId];
            
            // Add filters
            if (!empty($filters['search'])) {
                $whereConditions[] = 'o.order_number LIKE :search';
                $params[':search'] = '%' . $filters['search'] . '%';
            }
            
            if (!empty($filters['status'])) {
                $whereConditions[] = 'o.status = :status';
                $params[':status'] = $filters['status'];
            }
            
            if (!empty($filters['payment_status'])) {
                $whereConditions[] = 'o.payment_status = :payment_status';
                $params[':payment_status'] = $filters['payment_status'];
            }
            
            if (!empty($filters['date_from'])) {
                $whereConditions[] = 'DATE(o.order_date) >= :date_from';
                $params[':date_from'] = $filters['date_from'];
            }
            
            if (!empty($filters['date_to'])) {
                $whereConditions[] = 'DATE(o.order_date) <= :date_to';
                $params[':date_to'] = $filters['date_to'];
            }
            
            $whereClause = 'WHERE ' . implode(' AND ', $whereConditions);
            
            // Calculate pagination
            $offset = ($page - 1) * $limit;
            
            // Get total count
            $countSql = "SELECT COUNT(*) as total FROM orders o {$whereClause}";
            $countResult = $this->db->fetch($countSql, $params);
            $totalItems = (int)($countResult['total'] ?? 0);
            $totalPages = ceil($totalItems / $limit);
            
            // Get orders
            $ordersSql = "
                SELECT 
                    o.id, o.order_number, o.order_date, o.status, o.payment_status,
                    o.item_count, o.total_quantity, o.subtotal, o.total_discount_amount,
                    o.coupon_discount_amount, o.shipping_charges, o.igst_amount,
                    o.cgst_amount, o.sgst_amount, o.final_total,
                    p.payment_method, os.estimated_delivery_date, os.tracking_number, os.tracking_url
                FROM orders o
                LEFT JOIN payments p ON o.id = p.order_id
                LEFT JOIN order_shipping os ON o.id = os.order_id
                {$whereClause}
                ORDER BY o.order_date DESC
                LIMIT :limit OFFSET :offset
            ";
            
            $params[':limit'] = $limit;
            $params[':offset'] = $offset;
            
            $orders = $this->db->fetchAll($ordersSql, $params);
            
            // Format response
            return [
                'orders' => array_map([$this, 'formatOrder'], $orders),
                'pagination' => [
                    'page' => $page,
                    'limit' => $limit,
                    'total' => $totalItems,
                    'pages' => $totalPages,
                    'has_next' => $page < $totalPages,
                    'has_prev' => $page > 1
                ],
                'summary' => $this->getOrderSummary($userId),
                'filters' => $this->getFilterOptions()
            ];
        } catch (Exception $e) {
            error_log("Order history error: " . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Format single order for list view
     */
    private function formatOrder($order)
    {
        $status = $order['status'] ?: 'placed';
        $items = $this->getOrderItems($order['id']);
        
        return [
            'id' => (int)$order['id'],
            'number' => $order['order_number'],
            'date' => date('d M Y', strtotime($order['order_date'])),
            'time' => date('h:i A', strtotime($order['order_date'])),
            'status' => [
                'code' => $status,
                'label' => $this->getStatusLabel($status),
                'color' => $this->getStatusColor($status),
                'step' => $this->getStatusStep($status),
                'progress' => $this->getStatusProgress($status)
            ],
            'payment' => [
                'status' => $order['payment_status'],
                'method' => $order['payment_method'] ?? 'cod',
                'label' => $this->getPaymentLabel($order['payment_method'] ?? 'cod')
            ],
            'summary' => [
                'items' => (int)$order['item_count'],
                'quantity' => (int)$order['total_quantity'],
                'amount' => (float)$order['final_total'],
                'currency' => 'INR'
            ],
            'items' => array_slice($items, 0, 3), // First 3 items for preview
            'delivery_date' => $order['estimated_delivery_date'],
            'tracking' => [
                'number' => $order['tracking_number'],
                'url' => $order['tracking_url']
            ]
        ];
    }

    /**
     * Get order items for preview
     */
    private function getOrderItems($orderId)
    {
        try {
            $sql = "
                SELECT product_name, quantity, product_image, selling_price
                FROM order_items 
                WHERE order_id = :order_id 
                ORDER BY id LIMIT 5
            ";
            
            $items = $this->db->fetchAll($sql, [':order_id' => $orderId]);
            
            return array_map(function($item) {
                return [
                    'name' => $item['product_name'],
                    'qty' => (int)$item['quantity'],
                    'price' => (float)$item['selling_price'],
                    'image' => $item['product_image'] ?: null
                ];
            }, $items);
        } catch (Exception $e) {
            return [];
        }
    }

    /**
     * Get user-friendly status labels
     */
    private function getStatusLabel($status)
    {
        $labels = [
            'placed' => 'Order Placed',
            'confirmed' => 'Order Confirmed',
            'processing' => 'Processing',
            'shipped' => 'Shipped',
            'delivered' => 'Delivered',
            'cancelled' => 'Cancelled',
            'refunded' => 'Refunded',
            'returned' => 'Returned'
        ];
        return $labels[$status] ?? 'Order Placed';
    }

    /**
     * Get status colors for UI
     */
    private function getStatusColor($status)
    {
        $colors = [
            'placed' => 'blue',
            'confirmed' => 'orange',
            'processing' => 'orange',
            'shipped' => 'purple',
            'delivered' => 'green',
            'cancelled' => 'red',
            'refunded' => 'gray',
            'returned' => 'gray'
        ];
        return $colors[$status] ?? 'blue';
    }

    /**
     * Get status step for progress indicator
     */
    private function getStatusStep($status)
    {
        $steps = [
            'placed' => 1,
            'confirmed' => 2,
            'processing' => 2,
            'shipped' => 3,
            'delivered' => 4,
            'cancelled' => 0,
            'refunded' => 0,
            'returned' => 0
        ];
        return $steps[$status] ?? 1;
    }

    /**
     * Get status progress percentage
     */
    private function getStatusProgress($status)
    {
        $progress = [
            'placed' => 25,
            'confirmed' => 50,
            'processing' => 50,
            'shipped' => 75,
            'delivered' => 100,
            'cancelled' => 0,
            'refunded' => 0,
            'returned' => 0
        ];
        return $progress[$status] ?? 25;
    }

    /**
     * Get payment method labels
     */
    private function getPaymentLabel($method)
    {
        $labels = [
            'cod' => 'Cash on Delivery',
            'online' => 'Online Payment',
            'wallet' => 'Wallet',
            'upi' => 'UPI'
        ];
        return $labels[$method] ?? 'Cash on Delivery';
    }

    /**
     * Get order summary statistics
     */
    private function getOrderSummary($userId)
    {
        try {
            $sql = "
                SELECT 
                    COUNT(*) as total_orders,
                    SUM(final_total) as total_spent,
                    status,
                    COUNT(*) as status_count
                FROM orders 
                WHERE user_id = :user_id 
                GROUP BY status
            ";
            
            $results = $this->db->fetchAll($sql, [':user_id' => $userId]);
            
            $summary = [
                'total_orders' => 0,
                'total_spent' => 0,
                'by_status' => []
            ];
            
            foreach ($results as $row) {
                $status = $row['status'] ?: 'placed';
                $summary['total_orders'] += (int)$row['status_count'];
                $summary['total_spent'] += (float)$row['total_spent'];
                
                $summary['by_status'][] = [
                    'status' => $status,
                    'label' => $this->getStatusLabel($status),
                    'count' => (int)$row['status_count'],
                    'color' => $this->getStatusColor($status)
                ];
            }
            
            return $summary;
        } catch (Exception $e) {
            return ['total_orders' => 0, 'total_spent' => 0, 'by_status' => []];
        }
    }

    /**
     * Get filter options for frontend
     */
    private function getFilterOptions()
    {
        return [
            'status' => [
                ['value' => '', 'label' => 'All Orders'],
                ['value' => 'placed', 'label' => 'Order Placed'],
                ['value' => 'confirmed', 'label' => 'Order Confirmed'],
                ['value' => 'processing', 'label' => 'Processing'],
                ['value' => 'shipped', 'label' => 'Shipped'],
                ['value' => 'delivered', 'label' => 'Delivered'],
                ['value' => 'cancelled', 'label' => 'Cancelled']
            ],
            'payment' => [
                ['value' => '', 'label' => 'All Payments'],
                ['value' => 'pending', 'label' => 'Pending'],
                ['value' => 'paid', 'label' => 'Paid'],
                ['value' => 'failed', 'label' => 'Failed']
            ]
        ];
    }
}
