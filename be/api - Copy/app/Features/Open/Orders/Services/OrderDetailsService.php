<?php

namespace App\Features\Open\Orders\Services;

use App\Core\Database;
use Exception;

class OrderDetailsService
{
    private $db;

    public function __construct()
    {
        $this->db = Database::getInstance();
    }

    /**
     * Get complete order details
     * 
     * @param int $userId User ID
     * @param string|int $orderIdentifier Order ID or Number
     * @param array $options Include options
     * @return array|null Order details
     */
    public function getOrderDetails($userId, $orderIdentifier, $options = [])
    {
        try {
            // Get basic order info
            $order = $this->getOrderInfo($userId, $orderIdentifier);
            if (!$order) return null;

            // Get all related data
            $items = $this->getOrderItems($order['id']);
            $payment = $this->getPaymentInfo($order['id']);
            $shipping = $this->getShippingInfo($order['id']);
            $statusHistory = $this->getOrderStatusHistory($order['id']);

            // Build clean response
            return [
                'basic' => $this->formatBasicInfo($order, $payment),
                'items' => $this->formatItems($items),
                'pricing' => $this->formatPricing($order),
                'shipping' => $this->formatShipping($shipping),
                'payment' => $this->formatPayment($payment),
                'timeline' => $this->formatTimeline($statusHistory, $order),
                'tracking' => $this->getTrackingInfo($shipping)
            ];
        } catch (Exception $e) {
            error_log("Order details error: " . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Get basic order information
     */
    private function getOrderInfo($userId, $identifier)
    {
        $sql = is_numeric($identifier) 
            ? "SELECT * FROM orders WHERE id = :id AND user_id = :user_id"
            : "SELECT * FROM orders WHERE order_number = :id AND user_id = :user_id";
            
        return $this->db->fetch($sql, [':id' => $identifier, ':user_id' => $userId]);
    }

    /**
     * Format basic order information
     */
    private function formatBasicInfo($order, $payment)
    {
        $status = $order['status'] ?: 'placed';
        
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
            'payment_status' => [
                'code' => $order['payment_status'],
                'label' => $this->getPaymentStatusLabel($order['payment_status']),
                'color' => $this->getPaymentStatusColor($order['payment_status'])
            ]
        ];
    }

    /**
     * Get and format order items
     */
    private function getOrderItems($orderId)
    {
        try {
            $sql = "SELECT * FROM order_items WHERE order_id = :order_id ORDER BY id";
            return $this->db->fetchAll($sql, [':order_id' => $orderId]);
        } catch (Exception $e) {
            error_log("Error getting order items: " . $e->getMessage());
            return [];
        }
    }

    /**
     * Format items for frontend
     */
    private function formatItems($items)
    {
        $formatted = [];
        $summary = ['total_items' => 0, 'total_qty' => 0, 'total_amount' => 0];
        
        foreach ($items as $item) {
            $formatted[] = [
                'id' => (int)$item['id'],
                'product' => [
                    'id' => (int)$item['product_id'],
                    'name' => $item['product_name'],
                    'sku' => $item['product_sku'] ?? '',
                    'image' => $item['product_image'] ?: null,
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
                'status' => [
                    'code' => $item['status'],
                    'label' => $this->getStatusLabel($item['status'])
                ]
            ];
            
            $summary['total_items']++;
            $summary['total_qty'] += (int)$item['quantity'];
            $summary['total_amount'] += (float)$item['line_total'];
        }
        
        return ['items' => $formatted, 'summary' => $summary];
    }

    /**
     * Format pricing breakdown
     */
    private function formatPricing($order)
    {
        return [
            'original_price' => (float)$order['original_price'],
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

/**
 * Get payment information
 */
private function getPaymentInfo($orderId)
{
    try {
        $sql = "SELECT * FROM payments WHERE order_id = :order_id ORDER BY created_at DESC LIMIT 1";
        return $this->db->fetch($sql, [':order_id' => $orderId]);
    } catch (Exception $e) {
        return null;
    }
}

/**
 * Format payment information
 */
private function formatPayment($payment)
{
    if (!$payment) {
        return [
            'method' => 'cod',
            'method_label' => 'Cash on Delivery',
            'status' => 'pending',
            'gateway' => null,
            'transaction_id' => null,
            'payment_received' => false
        ];
    }
    
    return [
        'method' => $payment['payment_method'],
        'method_label' => $this->getPaymentMethodLabel($payment['payment_method']),
        'status' => $payment['status'],
        'gateway' => $payment['payment_gateway'],
        'transaction_id' => $payment['payment_id'],
        'amount' => (float)$payment['amount'],
        'gateway_charges' => (float)$payment['gateway_charges'],
        'payment_received' => (bool)$payment['payment_received'],
        'payment_received_at' => $payment['payment_received_at'],
        'initiated_at' => $payment['initiated_at'],
        'completed_at' => $payment['completed_at']
    ];
}

/**
 * Get shipping information
 */
private function getShippingInfo($orderId)
{
    try {
        $sql = "SELECT * FROM order_shipping WHERE order_id = :order_id";
        return $this->db->fetch($sql, [':order_id' => $orderId]);
    } catch (Exception $e) {
        return null;
    }
}

/**
 * Format shipping information
 */
private function formatShipping($shipping)
{
    if (!$shipping) return null;
    
    return [
        'address' => [
            'name' => $shipping['contact_name'],
            'phone' => $shipping['contact_phone'],
            'line1' => $shipping['address_line1'],
            'line2' => $shipping['address_line2'] ?? '',
            'city' => $shipping['city'],
            'state' => $shipping['state'],
            'pincode' => $shipping['postal_code'],
            'country' => $shipping['country'],
            'type' => $shipping['address_type']
        ],
        'delivery' => [
            'method' => $shipping['shipping_method'],
            'estimated_date' => $shipping['estimated_delivery_date'],
            'actual_date' => $shipping['actual_delivery_date'],
            'instructions' => $shipping['delivery_instructions'],
            'delivered_to' => $shipping['delivered_to'],
            'delivery_notes' => $shipping['delivery_notes']
        ],
        'charges' => [
            'amount' => (float)$shipping['shipping_charges'],
            'is_free' => (bool)$shipping['is_free_shipping'],
            'savings' => (float)$shipping['shipping_savings']
        ],
        'status' => [
            'code' => $shipping['status'],
            'label' => $this->getShippingStatusLabel($shipping['status'])
        ]
    ];
}

/**
 * Get order status history
 */
private function getOrderStatusHistory($orderId)
{
    try {
        $sql = "SELECT * FROM order_status_history WHERE order_id = :order_id ORDER BY created_at ASC";
        return $this->db->fetchAll($sql, [':order_id' => $orderId]);
    } catch (Exception $e) {
        return [];
    }
}

/**
 * Format timeline for frontend
 */
private function formatTimeline($statusHistory, $order)
{
    $timeline = [];
    
    if (!empty($statusHistory)) {
        foreach ($statusHistory as $history) {
            $timeline[] = [
                'status' => $history['status'],
                'label' => $this->getStatusLabel($history['status']),
                'date' => date('d M Y', strtotime($history['created_at'])),
                'time' => date('h:i A', strtotime($history['created_at'])),
                'notes' => $history['notes'],
                'changed_by' => $history['changed_by'],
                'is_admin' => (bool)$history['is_admin']
            ];
        }
    } else {
        // Generate basic timeline from order data
        $timeline[] = [
            'status' => 'placed',
            'label' => 'Order Placed',
            'date' => date('d M Y', strtotime($order['order_date'])),
            'time' => date('h:i A', strtotime($order['order_date'])),
            'notes' => 'Your order has been placed successfully',
            'changed_by' => $order['user_id'],
            'is_admin' => false
        ];
    }
    
    return $timeline;
}

/**
 * Get tracking information
 */
private function getTrackingInfo($shipping)
{
    if (!$shipping || !$shipping['tracking_number']) {
        return null;
    }
    
    return [
        'number' => $shipping['tracking_number'],
        'url' => $shipping['tracking_url'],
        'carrier' => $shipping['courier_partner'] ?? 'Express Delivery'
    ];
}

// Helper methods for status and labels
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

private function getPaymentStatusLabel($status)
{
    $labels = [
        'pending' => 'Payment Pending',
        'paid' => 'Payment Successful',
        'failed' => 'Payment Failed',
        'refunded' => 'Refunded',
        'partially_refunded' => 'Partially Refunded'
    ];
    return $labels[$status] ?? 'Payment Pending';
}

private function getPaymentStatusColor($status)
{
    $colors = [
        'pending' => 'orange',
        'paid' => 'green',
        'failed' => 'red',
        'refunded' => 'blue',
        'partially_refunded' => 'blue'
    ];
    return $colors[$status] ?? 'orange';
}

private function getPaymentMethodLabel($method)
{
    $labels = [
        'cod' => 'Cash on Delivery',
        'online' => 'Online Payment',
        'wallet' => 'Wallet Payment',
        'upi' => 'UPI Payment'
    ];
    return $labels[$method] ?? 'Cash on Delivery';
}

private function getShippingStatusLabel($status)
{
    $labels = [
        'pending' => 'Pending',
        'packed' => 'Packed',
        'shipped' => 'Shipped',
        'out_for_delivery' => 'Out for Delivery',
        'delivered' => 'Delivered',
        'failed' => 'Delivery Failed',
        'returned' => 'Returned'
    ];
    return $labels[$status] ?? 'Pending';
}
}
