<?php

namespace App\Features\AdminOrderManagement\Services;

use Exception;
use App\Features\AdminOrderManagement\DataAccess\AdminOrderRepository;
use App\Shared\Helpers\ResponseFormatter;
use App\Core\Database;
use DateTime;

class AdminOrderService
{
    private AdminOrderRepository $orderRepository;
    private Database $db;

    public function __construct()
    {
        $this->orderRepository = new AdminOrderRepository();
        $this->db = Database::getInstance();
    }

    public function getOrdersList(int $page, int $limit, array $filters): array
    {
        $offset = ($page - 1) * $limit;
        
        $orders = $this->orderRepository->getOrdersList($offset, $limit, $filters);
        $totalOrders = $this->orderRepository->getOrdersCount($filters);
        
        $formattedOrders = array_map([$this, 'formatOrderForList'], $orders);
        $summary = $this->getOrdersSummary($filters);
        
        return [
            'data' => [
                'orders' => $formattedOrders,
                'summary' => $summary
            ],
            'meta' => [
                'pagination' => [
                    'page' => $page,
                    'limit' => $limit,
                    'total' => $totalOrders,
                    'pages' => ceil($totalOrders / $limit),
                    'has_next' => $page < ceil($totalOrders / $limit),
                    'has_prev' => $page > 1
                ]
            ]
        ];
    }

    public function getOrderDetails(int $orderId): ?array
    {
        $order = $this->orderRepository->getOrderById($orderId);
        
        if (!$order) {
            return null;
        }

        return $this->formatOrderDetails($order);
    }

    public function updateOrderStatus(int $orderId, string $status, ?string $notes, int $adminId): array
    {
        // Validate status transition
        $currentOrder = $this->orderRepository->getOrderById($orderId);
        
        if (!$currentOrder) {
            return ['success' => false, 'message' => 'Order not found'];
        }

        $validTransitions = $this->getValidStatusTransitions($currentOrder['status']);
        
        if (!in_array($status, $validTransitions)) {
            return ['success' => false, 'message' => 'Invalid status transition'];
        }

        // Update order status
        $success = $this->orderRepository->updateOrderStatus($orderId, $status, $adminId);
        
        if (!$success) {
            return ['success' => false, 'message' => 'Failed to update order status'];
        }

        // Add to status history
        $this->orderRepository->addStatusHistory($orderId, $status, $notes, $adminId, true);

        // Handle status-specific actions
        $this->handleStatusChange($orderId, $status, $currentOrder['status']);

        return [
            'success' => true,
            'message' => 'Order status updated successfully',
            'data' => $this->getOrderDetails($orderId)
        ];
    }

    public function cancelOrder(int $orderId, string $reason, ?string $notes, int $adminId): array
    {
        $order = $this->orderRepository->getOrderById($orderId);
        
        if (!$order) {
            return ['success' => false, 'message' => 'Order not found'];
        }

        // Changed: Only allow cancellation for 'placed' status, not 'preparing'
        if ($order['status'] !== 'placed') {
            return ['success' => false, 'message' => 'Order cannot be cancelled at this stage'];
        }

        // Get payment details to check payment method
        $payment = $this->orderRepository->getOrderPayment($orderId);
        $paymentMethod = $payment['payment_method'] ?? 'cod';

        if ($paymentMethod === 'online') {
            return ['success' => false, 'message' => 'Online payment orders should be refunded, not cancelled'];
        }

        // Cancel order
        $success = $this->orderRepository->cancelOrder($orderId, $reason, $adminId);
        
        if (!$success) {
            return ['success' => false, 'message' => 'Failed to cancel order'];
        }

        // Add to status history
        $this->orderRepository->addStatusHistory($orderId, 'cancelled', $notes, $adminId, true);

        // Handle inventory restoration if needed
        $this->restoreInventory($orderId);

        return [
            'success' => true,
            'message' => 'Order cancelled successfully',
            'data' => $this->getOrderDetails($orderId)
        ];
    }

    public function refundOrder(int $orderId, float $refundAmount, string $reason, string $refundMethod, ?string $notes, int $adminId): array
    {
        $order = $this->orderRepository->getOrderById($orderId);
        
        if (!$order) {
            return ['success' => false, 'message' => 'Order not found'];
        }

        // Get payment details to check payment method
        $payment = $this->orderRepository->getOrderPayment($orderId);
        $paymentMethod = $payment['payment_method'] ?? 'cod';

        if ($paymentMethod !== 'online') {
            return ['success' => false, 'message' => 'Only online payment orders can be refunded. COD orders should be cancelled.'];
        }

        if (!in_array($order['status'], ['placed', 'preparing', 'cancelled'])) {
            return ['success' => false, 'message' => 'Order cannot be refunded at this stage'];
        }

        if ($refundAmount > $order['final_total']) {
            return ['success' => false, 'message' => 'Refund amount cannot exceed order total'];
        }

        // Process refund
        $success = $this->orderRepository->processRefund($orderId, $refundAmount, $reason, $refundMethod, $adminId);
        
        if (!$success) {
            return ['success' => false, 'message' => 'Failed to process refund. Please check the logs for details.'];
        }

        // Update order status to refunded if full refund
        if ($refundAmount >= $order['final_total']) {
            $this->orderRepository->updateOrderStatus($orderId, 'refunded', $adminId);
            $this->orderRepository->addStatusHistory($orderId, 'refunded', $notes, $adminId, true);
        }

        return [
            'success' => true,
            'message' => 'Refund processed successfully',
            'data' => $this->getOrderDetails($orderId)
        ];
    }

    public function updateShippingDetails(int $orderId, string $trackingNumber, ?string $trackingUrl, ?string $courierPartner, ?string $estimatedDeliveryDate, ?string $notes, int $adminId): array
    {
        $order = $this->orderRepository->getOrderById($orderId);
        
        if (!$order) {
            return ['success' => false, 'message' => 'Order not found'];
        }

        if ($order['status'] !== 'prepared') {
            return ['success' => false, 'message' => 'Order must be prepared before shipping'];
        }

        // Update shipping details
        $success = $this->orderRepository->updateShippingDetails($orderId, $trackingNumber, $trackingUrl, $courierPartner, $estimatedDeliveryDate);
        
        if (!$success) {
            return ['success' => false, 'message' => 'Failed to update shipping details'];
        }

        // Update order status to shipped
        $this->orderRepository->updateOrderStatus($orderId, 'shipped', $adminId);
        $this->orderRepository->addStatusHistory($orderId, 'shipped', $notes, $adminId, true);

        return [
            'success' => true,
            'message' => 'Shipping details updated successfully',
            'data' => $this->getOrderDetails($orderId)
        ];
    }

    public function markPaymentReceived(int $orderId, float $amountReceived, ?string $notes, int $adminId): array
    {
        $order = $this->orderRepository->getOrderById($orderId);
        
        if (!$order) {
            return ['success' => false, 'message' => 'Order not found'];
        }

        if ($order['payment_method'] !== 'cod') {
            return ['success' => false, 'message' => 'Only COD orders can be marked as payment received'];
        }

        if ($order['status'] !== 'delivered') {
            return ['success' => false, 'message' => 'Order must be delivered before marking payment as received'];
        }

        // Mark payment as received
        $success = $this->orderRepository->markPaymentReceived($orderId, $amountReceived, $adminId);
        
        if (!$success) {
            return ['success' => false, 'message' => 'Failed to mark payment as received'];
        }

        // Add note to status history
        if ($notes) {
            $this->orderRepository->addStatusHistory($orderId, 'delivered', "Payment received: ₹{$amountReceived}. {$notes}", $adminId, true);
        }

        return [
            'success' => true,
            'message' => 'Payment marked as received successfully',
            'data' => $this->getOrderDetails($orderId)
        ];
    }

    public function markOrderReturned(int $orderId, string $reason, ?string $notes, int $adminId): array
    {
        $order = $this->orderRepository->getOrderById($orderId);
        
        if (!$order) {
            return ['success' => false, 'message' => 'Order not found'];
        }

        if ($order['status'] !== 'delivered') {
            return ['success' => false, 'message' => 'Only delivered orders can be returned'];
        }

        // For admin users, always allow returns for delivered orders
        // Update order status to returned
        $success = $this->orderRepository->updateOrderStatus($orderId, 'returned', $adminId);
        
        if (!$success) {
            return ['success' => false, 'message' => 'Failed to mark order as returned'];
        }

        // Add to status history
        $this->orderRepository->addStatusHistory($orderId, 'returned', "Return reason: {$reason}. {$notes}", $adminId, true);

        return [
            'success' => true,
            'message' => 'Order marked as returned successfully',
            'data' => $this->getOrderDetails($orderId)
        ];
    }

    public function getOrderStatistics(string $period, ?string $dateFrom, ?string $dateTo): array
    {
        return [
            'data' => $this->orderRepository->getOrderStatistics($period, $dateFrom, $dateTo)
        ];
    }

    public function exportOrders(string $format, array $filters): array
    {
        $orders = $this->orderRepository->getOrdersForExport($filters);
        
        if ($format === 'csv') {
            return $this->generateCSVExport($orders);
        } else {
            return ['success' => false, 'message' => 'Unsupported export format'];
        }
    }

    private function getSetting(string $key, $default = null)
    {
        try {
            $stmt = $this->db->getConnection()->prepare("SELECT value FROM settings WHERE `key` = :key");
            $stmt->bindValue(':key', $key);
            $stmt->execute();
            $result = $stmt->fetch(\PDO::FETCH_ASSOC);
            return $result ? $result['value'] : $default;
        } catch (Exception $e) {
            error_log("Error fetching setting {$key}: " . $e->getMessage());
            return $default;
        }
    }

    private function formatOrderForList(array $order): array
    {
        return [
            'id' => (int)$order['id'],
            'number' => $order['order_number'],
            'date' => date('d M Y', strtotime($order['order_date'])),
            'time' => date('h:i A', strtotime($order['order_date'])),
            'customer' => [
                'id' => (int)$order['user_id'],
                'name' => trim($order['customer_name']) ?: 'N/A',
                'phone' => $order['customer_phone'] ?? 'N/A',
                'email' => $order['customer_email'] ?? 'N/A'
            ],
            'status' => $this->formatOrderStatus($order['status']),
            'payment' => [
                'method' => $order['payment_method'] ?? 'N/A',
                'status' => $order['payment_status'],
                'received' => (bool)($order['payment_received'] ?? false)
            ],
            'summary' => [
                'items' => (int)$order['item_count'],
                'quantity' => (int)$order['total_quantity'],
                'amount' => (float)$order['final_total'],
                'currency' => 'INR'
            ],
            'shipping' => [
                'city' => $order['shipping_city'] ?? 'N/A',
                'state' => $order['shipping_state'] ?? 'N/A',
                'pincode' => $order['shipping_pincode'] ?? 'N/A'
            ],
            'tracking' => [
                'number' => $order['tracking_number'],
                'url' => $order['tracking_url']
            ]
        ];
    }

    private function formatOrderDetails(array $order): array
    {
        $items = $this->orderRepository->getOrderItems($order['id']);
        $shipping = $this->orderRepository->getOrderShipping($order['id']);
        $payment = $this->orderRepository->getOrderPayment($order['id']);
        $statusHistory = $this->orderRepository->getOrderStatusHistory($order['id']);
        
        // Get payment received information from status history (only for COD orders)
        $paymentReceivedInfo = null;
        if (($payment['payment_method'] ?? '') === 'cod') {
            $paymentReceivedInfo = $this->getPaymentReceivedInfo($statusHistory, $payment);
        }

        return [
            'basic' => [
                'id' => (int)$order['id'],
                'number' => $order['order_number'],
                'date' => date('d M Y', strtotime($order['order_date'])),
                'time' => date('h:i A', strtotime($order['order_date'])),
                'status' => $this->formatOrderStatus($order['status']),
                'payment_status' => $this->formatPaymentStatus($order['payment_status'])
            ],
            'customer' => [
                'id' => (int)$order['user_id'],
                'name' => trim($order['customer_name']) ?: 'N/A',
                'phone' => $order['customer_phone'] ?? 'N/A',
                'email' => $order['customer_email'] ?? 'N/A'
            ],
            'items' => [
                'items' => array_map([$this, 'formatOrderItem'], $items),
                'summary' => [
                    'total_items' => (int)$order['item_count'],
                    'total_qty' => (int)$order['total_quantity'],
                    'total_amount' => (float)$order['final_total']
                ]
            ],
            'pricing' => $this->formatOrderPricing($order),
            'shipping' => $this->formatOrderShipping($shipping),
            'payment' => $this->formatOrderPayment($payment, $paymentReceivedInfo),
            'timeline' => array_map([$this, 'formatStatusHistory'], $statusHistory),
            'available_actions' => $this->getAvailableActions($order, $payment, $shipping)
        ];
    }

    private function getPaymentReceivedInfo(array $statusHistory, array $payment): ?array
    {
        // Only process for COD orders
        if (($payment['payment_method'] ?? '') !== 'cod') {
            return null;
        }

        // If payment is not received, return null
        if (empty($payment) || !isset($payment['payment_received']) || !$payment['payment_received']) {
            return null;
        }

        $adminId = null;
        $markedAt = null;
        $notes = null;

        // Look for payment received entry in status history
        foreach ($statusHistory as $history) {
            if (strpos($history['notes'] ?? '', 'Payment received:') !== false) {
                // Found payment received entry
                $adminId = (int)$history['changed_by'];
                $markedAt = $history['created_at'];
                $notes = $history['notes'];
                break;
            }
        }

        // If no specific entry found in status history, check the orders table updated_by
        if (!$adminId) {
            $order = $this->orderRepository->getOrderById((int)$payment['order_id']);
            if ($order && $order['updated_by']) {
                $adminId = (int)$order['updated_by'];
                $markedAt = $payment['payment_received_at'] ?? null;
            }
        }

        // Get admin name if we have an admin ID
        $adminName = 'Unknown Admin';
        if ($adminId) {
            try {
                $stmt = $this->db->getConnection()->prepare("
                    SELECT CONCAT(first_name, ' ', last_name) as full_name 
                    FROM admins 
                    WHERE id = :admin_id AND deleted_at IS NULL
                ");
                $stmt->bindValue(':admin_id', $adminId, \PDO::PARAM_INT);
                $stmt->execute();
                $admin = $stmt->fetch(\PDO::FETCH_ASSOC);
            
                if ($admin && !empty(trim($admin['full_name']))) {
                    $adminName = trim($admin['full_name']);
                } else {
                    $adminName = "Admin #{$adminId}";
                }
            } catch (Exception $e) {
                error_log("Error fetching admin name: " . $e->getMessage());
                $adminName = "Admin #{$adminId}";
            }
        }

        return [
            'marked_by_name' => $adminName,
            'marked_at' => $markedAt,
            'notes' => $notes
        ];
    }

    private function formatOrderStatus(string $status): array
    {
        $statusMap = [
            'placed' => ['label' => 'Order Placed', 'color' => 'blue', 'step' => 1, 'progress' => 20],
            'preparing' => ['label' => 'Preparing', 'color' => 'orange', 'step' => 2, 'progress' => 40],
            'prepared' => ['label' => 'Prepared', 'color' => 'purple', 'step' => 3, 'progress' => 60],
            'shipped' => ['label' => 'Shipped', 'color' => 'indigo', 'step' => 4, 'progress' => 80],
            'delivered' => ['label' => 'Delivered', 'color' => 'green', 'step' => 5, 'progress' => 100],
            'cancelled' => ['label' => 'Cancelled', 'color' => 'red', 'step' => 0, 'progress' => 0],
            'refunded' => ['label' => 'Refunded', 'color' => 'gray', 'step' => 0, 'progress' => 0],
            'returned' => ['label' => 'Returned', 'color' => 'gray', 'step' => 0, 'progress' => 0]
        ];

        return [
            'code' => $status,
            'label' => $statusMap[$status]['label'] ?? 'Unknown',
            'color' => $statusMap[$status]['color'] ?? 'gray',
            'step' => $statusMap[$status]['step'] ?? 0,
            'progress' => $statusMap[$status]['progress'] ?? 0
        ];
    }

    private function formatPaymentStatus(string $status): array
    {
        $statusMap = [
            'pending' => ['label' => 'Payment Pending', 'color' => 'orange'],
            'paid' => ['label' => 'Payment Completed', 'color' => 'green'],
            'failed' => ['label' => 'Payment Failed', 'color' => 'red'],
            'refunded' => ['label' => 'Payment Refunded', 'color' => 'gray'],
            'partially_refunded' => ['label' => 'Partially Refunded', 'color' => 'blue']
        ];

        return [
            'code' => $status,
            'label' => $statusMap[$status]['label'] ?? 'Unknown',
            'color' => $statusMap[$status]['color'] ?? 'gray'
        ];
    }

    private function formatOrderItem(array $item): array
    {
        return [
            'id' => (int)$item['id'],
            'product' => [
                'id' => (int)$item['product_id'],
                'name' => $item['product_name'],
                'sku' => $item['product_sku'],
                'image' => $item['product_image'],
                'hsn_code' => $item['product_hsn_code']
            ],
            'variant' => [
                'id' => (int)$item['variant_id'],
                'name' => $item['variant_name'],
                'weight' => $item['product_weight']
            ],
            'pricing' => [
                'original' => (float)$item['original_price'],
                'selling' => (float)$item['selling_price'],
                'discount' => (float)$item['discount_amount'],
                'base_price' => (float)$item['base_price'],
                'tax_rate' => (float)$item['tax_rate'],
                'tax_amount' => (float)$item['tax_amount'],
                'line_total' => (float)$item['line_total']
            ],
            'quantity' => (int)$item['quantity'],
            'status' => $this->formatOrderStatus($item['status'])
        ];
    }

    private function formatOrderPricing(array $order): array
    {
        return [
            'original_price' => (float)($order['original_price'] ?? 0),
            'base_amount' => (float)$order['base_amount'],
            'subtotal' => (float)$order['subtotal'],
            'discounts' => [
                'product' => (float)$order['product_discount_amount'],
                'coupon' => (float)$order['coupon_discount_amount'],
                'total' => (float)$order['total_discount_amount']
            ],
            'taxes' => [
                'type' => $order['tax_type'],
                'igst' => (float)$order['igst_amount'],
                'cgst' => (float)$order['cgst_amount'],
                'sgst' => (float)$order['sgst_amount'],
                'total' => (float)($order['igst_amount'] + $order['cgst_amount'] + $order['sgst_amount'])
            ],
            'charges' => [
                'shipping' => (float)$order['shipping_charges'],
                'payment' => (float)$order['payment_charges']
            ],
            'roundoff' => (float)$order['roundoff'],
            'final_total' => (float)$order['final_total'],
            'currency' => 'INR'
        ];
    }

    private function formatOrderShipping(array $shipping): array
    {
        if (empty($shipping)) {
            return [
                'address' => [],
                'delivery' => [],
                'tracking' => [],
                'charges' => [],
                'status' => ['code' => 'pending', 'label' => 'Pending', 'color' => 'orange']
            ];
        }

        return [
            'address' => [
                'name' => $shipping['contact_name'] ?? '',
                'phone' => $shipping['contact_phone'] ?? '',
                'line1' => $shipping['address_line1'] ?? '',
                'line2' => $shipping['address_line2'] ?? '',
                'city' => $shipping['city'] ?? '',
                'state' => $shipping['state'] ?? '',
                'pincode' => $shipping['postal_code'] ?? '',
                'country' => $shipping['country'] ?? 'India',
                'type' => $shipping['address_type'] ?? 'other'
            ],
            'delivery' => [
                'method' => $shipping['shipping_method'] ?? '',
                'estimated_date' => $shipping['estimated_delivery_date'] ?? null,
                'actual_date' => $shipping['actual_delivery_date'] ?? null,
                'instructions' => $shipping['delivery_instructions'] ?? '',
                'delivered_to' => $shipping['delivered_to'] ?? '',
                'delivery_notes' => $shipping['delivery_notes'] ?? ''
            ],
            'tracking' => [
                'number' => $shipping['tracking_number'] ?? null,
                'url' => $shipping['tracking_url'] ?? null,
                'courier' => $shipping['courier_partner'] ?? null
            ],
            'charges' => [
                'amount' => (float)($shipping['shipping_charges'] ?? 0),
                'is_free' => (bool)($shipping['is_free_shipping'] ?? false),
                'savings' => (float)($shipping['shipping_savings'] ?? 0)
            ],
            'status' => $this->formatShippingStatus($shipping['status'] ?? 'pending')
        ];
    }

    private function formatOrderPayment(array $payment, ?array $paymentReceivedInfo = null): array
    {
        if (empty($payment)) {
            return [
                'method' => 'N/A',
                'method_label' => 'N/A',
                'status' => 'pending',
                'gateway' => null,
                'transaction_id' => null,
                'amount' => 0,
                'gateway_charges' => 0,
                'payment_received' => false,
                'payment_received_at' => null,
                'initiated_at' => null,
                'completed_at' => null,
                'refund_amount' => 0,
                'refund_reason' => null
            ];
        }

        $result = [
            'method' => $payment['payment_method'] ?? 'N/A',
            'method_label' => ($payment['payment_method'] ?? 'N/A') === 'cod' ? 'Cash on Delivery' : 'Online Payment',
            'status' => $payment['status'] ?? 'pending',
            'gateway' => $payment['payment_gateway'] ?? null,
            'transaction_id' => $payment['payment_id'] ?? null,
            'amount' => (float)($payment['amount'] ?? 0),
            'gateway_charges' => (float)($payment['gateway_charges'] ?? 0),
            'payment_received' => (bool)($payment['payment_received'] ?? false),
            'payment_received_at' => $payment['payment_received_at'] ?? null,
            'initiated_at' => $payment['initiated_at'] ?? null,
            'completed_at' => $payment['completed_at'] ?? null,
            'refund_amount' => (float)($payment['refund_amount'] ?? 0),
            'refund_reason' => $payment['refund_reason'] ?? null
        ];

        // Add payment received information ONLY for COD orders where payment is received
        if ($paymentReceivedInfo && $result['payment_received'] && ($payment['payment_method'] ?? '') === 'cod') {
            $result['payment_received_by'] = $paymentReceivedInfo['marked_by_name'];
            $result['payment_received_notes'] = $paymentReceivedInfo['notes'];
        }

        return $result;
    }

    private function formatShippingStatus(string $status): array
    {
        $statusMap = [
            'pending' => ['label' => 'Pending', 'color' => 'orange'],
            'packed' => ['label' => 'Packed', 'color' => 'blue'],
            'shipped' => ['label' => 'Shipped', 'color' => 'indigo'],
            'out_for_delivery' => ['label' => 'Out for Delivery', 'color' => 'purple'],
            'delivered' => ['label' => 'Delivered', 'color' => 'green'],
            'failed' => ['label' => 'Delivery Failed', 'color' => 'red'],
            'returned' => ['label' => 'Returned', 'color' => 'gray']
        ];

        return [
            'code' => $status,
            'label' => $statusMap[$status]['label'] ?? 'Unknown',
            'color' => $statusMap[$status]['color'] ?? 'gray'
        ];
    }

    private function formatStatusHistory(array $history): array
    {
        return [
            'status' => $history['status'],
            'label' => $this->formatOrderStatus($history['status'])['label'],
            'date' => date('d M Y', strtotime($history['created_at'])),
            'time' => date('h:i A', strtotime($history['created_at'])),
            'notes' => $history['notes'],
            'changed_by' => (int)$history['changed_by'],
            'is_admin' => (bool)$history['is_admin']
        ];
    }

    private function getValidStatusTransitions(string $currentStatus): array
    {
        $transitions = [
            'placed' => ['preparing'], // Removed 'cancelled' from here - we'll use the dedicated cancel action
            'preparing' => ['prepared'], 
            'prepared' => [], // Shipping happens via shipping action
            'shipped' => ['delivered'],
            'delivered' => [], // Removed 'returned' - we'll use the dedicated return action with time check
            'cancelled' => [],
            'refunded' => [],
            'returned' => []
        ];

        return $transitions[$currentStatus] ?? [];
    }

    private function getAvailableActions(array $order, array $payment, array $shipping = []): array
    {
        $actions = [];
        $status = $order['status'];
        $paymentMethod = $payment['payment_method'] ?? 'cod';
        $paymentReceived = (bool)($payment['payment_received'] ?? false);
        $hasShippingDetails = !empty($shipping['tracking_number']);

        // Status update actions (excluding shipping-related transitions)
        $validTransitions = $this->getValidStatusTransitions($status);
        foreach ($validTransitions as $transition) {
            $actions[] = [
                'type' => 'status_update',
                'action' => $transition,
                'label' => $this->formatOrderStatus($transition)['label']
            ];
        }

        // Cancel/Refund actions based on payment method (only for placed status)
        if ($status === 'placed') {
            if ($paymentMethod === 'cod') {
                // COD orders can be cancelled
                $actions[] = [
                    'type' => 'cancel',
                    'action' => 'cancel',
                    'label' => 'Cancel Order'
                ];
            } elseif ($paymentMethod === 'online') {
                // Online payments should be refunded
                $actions[] = [
                    'type' => 'refund',
                    'action' => 'refund',
                    'label' => 'Process Refund'
                ];
            }
        }

        // Shipping action - only for prepared orders without shipping details
        if ($status === 'prepared' && !$hasShippingDetails) {
            $actions[] = [
                'type' => 'shipping',
                'action' => 'ship',
                'label' => 'Add Shipping Details'
            ];
        }

        // Payment received action (only for COD and delivered orders)
        if ($paymentMethod === 'cod' && $status === 'delivered' && !$paymentReceived) {
            $actions[] = [
                'type' => 'payment',
                'action' => 'mark_payment_received',
                'label' => 'Mark Payment Received'
            ];
        }

        // Return action (only for delivered orders)
        if ($status === 'delivered') {
            // For admin users, always allow returns for delivered orders
            $actions[] = [
                'type' => 'return',
                'action' => 'return',
                'label' => 'Mark as Returned'
            ];
        }

        return $actions;
    }

    private function handleStatusChange(int $orderId, string $newStatus, string $oldStatus): void
    {
        // Handle status-specific actions
        switch ($newStatus) {
            case 'confirmed':
                // Reserve inventory, send confirmation email, etc.
                break;
            case 'preparing':
                // Notify kitchen/preparation team
                break;
            case 'prepared':
                // Notify packaging team
                break;
            case 'shipped':
                // Send tracking details to customer
                break;
            case 'delivered':
                // Send delivery confirmation, request feedback
                break;
        }
    }

    private function restoreInventory(int $orderId): void
    {
        // Restore inventory for cancelled orders
        $items = $this->orderRepository->getOrderItems($orderId);
        
        foreach ($items as $item) {
            // Add inventory restoration logic here
            // This would typically update product variant stock
        }
    }

    private function getOrdersSummary(array $filters): array
    {
        return $this->orderRepository->getOrdersSummary($filters);
    }

    private function generateCSVExport(array $orders): array
    {
        $csv = "Order Number,Date,Customer Name,Customer Phone,Status,Payment Method,Payment Status,Items,Quantity,Amount\n";
        
        foreach ($orders as $order) {
            $csv .= sprintf(
                "%s,%s,%s,%s,%s,%s,%s,%d,%d,%.2f\n",
                $order['order_number'],
                date('Y-m-d', strtotime($order['order_date'])),
                $order['customer_name'] ?? 'N/A',
                $order['customer_phone'] ?? 'N/A',
                $order['status'],
                $order['payment_method'] ?? 'N/A',
                $order['payment_status'],
                $order['item_count'],
                $order['total_quantity'],
                $order['final_total']
            );
        }

        return [
            'success' => true,
            'content' => $csv,
            'content_type' => 'text/csv',
            'filename' => 'orders_export_' . date('Y-m-d_H-i-s') . '.csv'
        ];
    }
}
