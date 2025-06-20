<?php

namespace App\Features\Open\Orders\DataAccess;

use App\Core\Database;
use Exception;

class OrderRepository
{
    private $db;

    public function __construct()
    {
        $this->db = Database::getInstance();
    }

    /**
     * Create a new order
     * 
     * @param array $orderData Order data
     * @return int Order ID
     * @throws Exception If order creation fails
     */
    public function createOrder($orderData)
    {
        try {
            $data = [
                'order_number' => $orderData['order_number'],
                'user_id' => $orderData['user_id'],
                'status' => $orderData['status'] ?? 'placed',
                'payment_status' => $orderData['payment_status'] ?? 'pending',
                'original_price' => $orderData['original_price'] ?? 0.00,
                'base_amount' => $orderData['base_amount'] ?? 0.00,
                'subtotal' => $orderData['subtotal'] ?? 0.00,
                'product_discount_amount' => $orderData['product_discount_amount'] ?? 0.00,
                'coupon_discount_amount' => $orderData['coupon_discount_amount'] ?? 0.00,
                'total_discount_amount' => $orderData['total_discount_amount'] ?? 0.00,
                'shipping_charges' => $orderData['shipping_charges'] ?? 0.00,
                'payment_charges' => $orderData['payment_charges'] ?? 0.00,
                'roundoff' => $orderData['roundoff'] ?? 0.00,
                'final_total' => $orderData['final_total'] ?? 0.00,
                'coupon_id' => $orderData['coupon_id'] ?? null,
                'tax_type' => $orderData['tax_type'] ?? 'igst',
                'igst_amount' => $orderData['igst_amount'] ?? 0.00,
                'cgst_amount' => $orderData['cgst_amount'] ?? 0.00,
                'sgst_amount' => $orderData['sgst_amount'] ?? 0.00,
                'item_count' => $orderData['item_count'] ?? 0,
                'total_quantity' => $orderData['total_quantity'] ?? 0,
                'order_date' => $orderData['order_date'] ?? date('Y-m-d H:i:s')
            ];
            
            $orderId = $this->db->insert('orders', $data);
            error_log("Created order with ID: {$orderId}");
            
            // Create initial status history entry
            $this->createStatusHistory($orderId, 'placed', 'Order placed by customer', $orderData['user_id'], false);
            
            return $orderId;
        } catch (Exception $e) {
            error_log("Error creating order: " . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Create a new order item
     * 
     * @param array $itemData Order item data
     * @return int Order item ID
     * @throws Exception If order item creation fails
     */
    public function createOrderItem($itemData)
    {
        try {
            $data = [
                'order_id' => $itemData['order_id'],
                'product_id' => $itemData['product_id'],
                'variant_id' => $itemData['variant_id'],
                'product_name' => $itemData['product_name'],
                'variant_name' => $itemData['variant_name'],
                'product_sku' => $itemData['product_sku'] ?? null,
                'quantity' => $itemData['quantity'],
                'original_price' => $itemData['original_price'],
                'selling_price' => $itemData['selling_price'],
                'discount_amount' => $itemData['discount_amount'] ?? 0.00,
                'tax_rate' => $itemData['tax_rate'],
                'base_price' => $itemData['base_price'],
                'tax_amount' => $itemData['tax_amount'],
                'line_base_amount' => $itemData['line_base_amount'],
                'line_tax_amount' => $itemData['line_tax_amount'],
                'line_discount_amount' => $itemData['line_discount_amount'] ?? 0.00,
                'line_total' => $itemData['line_total'],
                'product_image' => $itemData['product_image'] ?? null,
                'product_weight' => $itemData['product_weight'] ?? null,
                'product_hsn_code' => $itemData['product_hsn_code'] ?? null,
                'status' => $itemData['status'] ?? 'placed'
            ];
            
            $itemId = $this->db->insert('order_items', $data);
            error_log("Created order item with ID: {$itemId}");
            
            return $itemId;
        } catch (Exception $e) {
            error_log("Error creating order item: " . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Create a new order shipping record
     * 
     * @param array $shippingData Order shipping data
     * @return int Order shipping ID
     * @throws Exception If order shipping creation fails
     */
    public function createOrderShipping($shippingData)
    {
        try {
            $data = [
                'order_id' => $shippingData['order_id'],
                'contact_name' => $shippingData['contact_name'],
                'contact_phone' => $shippingData['contact_phone'],
                'address_line1' => $shippingData['address_line1'],
                'address_line2' => $shippingData['address_line2'] ?? null,
                'city' => $shippingData['city'],
                'state' => $shippingData['state'],
                'postal_code' => $shippingData['postal_code'],
                'country' => $shippingData['country'] ?? 'India',
                'address_type' => $shippingData['address_type'] ?? 'other',
                'shipping_method' => $shippingData['shipping_method'] ?? 'Standard',
                'shipping_charges' => $shippingData['shipping_charges'] ?? 0.00,
                'is_free_shipping' => $shippingData['is_free_shipping'] ?? false,
                'shipping_savings' => $shippingData['shipping_savings'] ?? 0.00,
                'estimated_delivery_date' => $shippingData['estimated_delivery_date'] ?? null,
                'status' => $shippingData['status'] ?? 'pending',
                'tracking_number' => $shippingData['tracking_number'] ?? null,
                'tracking_url' => $shippingData['tracking_url'] ?? null,
                'courier_partner' => $shippingData['courier_partner'] ?? null
            ];
            
            $shippingId = $this->db->insert('order_shipping', $data);
            error_log("Created order shipping with ID: {$shippingId}");
            
            return $shippingId;
        } catch (Exception $e) {
            error_log("Error creating order shipping: " . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Create a new payment record
     * 
     * @param array $paymentData Payment data
     * @return int Payment ID
     * @throws Exception If payment creation fails
     */
    public function createPayment($paymentData)
    {
        try {
            $data = [
                'order_id' => $paymentData['order_id'],
                'payment_id' => $paymentData['payment_id'] ?? null,
                'payment_method' => $paymentData['payment_method'],
                'payment_gateway' => $paymentData['payment_gateway'] ?? null,
                'amount' => $paymentData['amount'],
                'gateway_charges' => $paymentData['gateway_charges'] ?? 0.00,
                'status' => $paymentData['status'] ?? 'pending',
                'payment_received' => $paymentData['payment_received'] ?? false,
                'payment_received_at' => $paymentData['payment_received_at'] ?? null,
                'gateway_response' => $paymentData['gateway_response'] ?? null,
                'initiated_at' => $paymentData['initiated_at'] ?? date('Y-m-d H:i:s'),
                'completed_at' => $paymentData['completed_at'] ?? null
            ];
            
            $paymentRecordId = $this->db->insert('payments', $data);
            error_log("Created payment record with ID: {$paymentRecordId}");
            
            return $paymentRecordId;
        } catch (Exception $e) {
            error_log("Error creating payment: " . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Create status history entry
     * 
     * @param int $orderId Order ID
     * @param string $status New status
     * @param string $notes Optional notes
     * @param int $changedBy User/Admin ID who changed the status
     * @param bool $isAdmin Whether the change was made by admin
     * @return int Status history ID
     */
    public function createStatusHistory($orderId, $status, $notes = null, $changedBy = null, $isAdmin = false)
    {
        try {
            $data = [
                'order_id' => $orderId,
                'status' => $status,
                'notes' => $notes,
                'changed_by' => $changedBy,
                'is_admin' => $isAdmin ? 1 : 0,
                'created_at' => date('Y-m-d H:i:s')
            ];
            
            $historyId = $this->db->insert('order_status_history', $data);
            error_log("Created status history with ID: {$historyId}");
            
            return $historyId;
        } catch (Exception $e) {
            error_log("Error creating status history: " . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Get order by ID
     * 
     * @param int $orderId Order ID
     * @return array|null Order data
     */
    public function getOrderById($orderId)
    {
        try {
            $sql = "SELECT * FROM orders WHERE id = :order_id";
            return $this->db->fetch($sql, [':order_id' => $orderId]);
        } catch (Exception $e) {
            error_log("Error getting order by ID: " . $e->getMessage());
            return null;
        }
    }

    /**
     * Get order by order number
     * 
     * @param string $orderNumber Order number
     * @return array|null Order data
     */
    public function getOrderByNumber($orderNumber)
    {
        try {
            $sql = "SELECT * FROM orders WHERE order_number = :order_number";
            return $this->db->fetch($sql, [':order_number' => $orderNumber]);
        } catch (Exception $e) {
            error_log("Error getting order by number: " . $e->getMessage());
            return null;
        }
    }

    /**
     * Get order items by order ID
     * 
     * @param int $orderId Order ID
     * @return array Order items
     */
    public function getOrderItems($orderId)
    {
        try {
            $sql = "SELECT * FROM order_items WHERE order_id = :order_id ORDER BY id ASC";
            return $this->db->fetchAll($sql, [':order_id' => $orderId]);
        } catch (Exception $e) {
            error_log("Error getting order items: " . $e->getMessage());
            return [];
        }
    }

    /**
     * Get order shipping by order ID
     * 
     * @param int $orderId Order ID
     * @return array|null Order shipping data
     */
    public function getOrderShipping($orderId)
    {
        try {
            $sql = "SELECT * FROM order_shipping WHERE order_id = :order_id";
            return $this->db->fetch($sql, [':order_id' => $orderId]);
        } catch (Exception $e) {
            error_log("Error getting order shipping: " . $e->getMessage());
            return null;
        }
    }

    /**
     * Get payment by order ID
     * 
     * @param int $orderId Order ID
     * @return array|null Payment data
     */
    public function getPaymentByOrderId($orderId)
    {
        try {
            $sql = "SELECT * FROM payments WHERE order_id = :order_id ORDER BY created_at DESC LIMIT 1";
            return $this->db->fetch($sql, [':order_id' => $orderId]);
        } catch (Exception $e) {
            error_log("Error getting payment by order ID: " . $e->getMessage());
            return null;
        }
    }

    /**
     * Get order status history
     * 
     * @param int $orderId Order ID
     * @return array Status history
     */
    public function getOrderStatusHistory($orderId)
    {
        try {
            $sql = "SELECT * FROM order_status_history WHERE order_id = :order_id ORDER BY created_at ASC";
            return $this->db->fetchAll($sql, [':order_id' => $orderId]);
        } catch (Exception $e) {
            error_log("Error getting order status history: " . $e->getMessage());
            return [];
        }
    }

    /**
     * Clear user's cart after successful order
     * 
     * @param int $userId User ID
     * @return bool Success status
     */
    public function clearUserCart($userId)
    {
        try {
            // Update cart status to 'converted' instead of deleting
            $sql = "UPDATE carts SET status = 'converted', updated_at = NOW() WHERE user_id = :user_id AND status = 'active'";
            
            $this->db->query($sql, [':user_id' => $userId]);
            error_log("Cleared cart for user ID: {$userId}");
            
            return true;
        } catch (Exception $e) {
            error_log("Error clearing user cart: " . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Generate unique order number
     * 
     * @return string Unique order number
     */
    public function generateOrderNumber()
    {
        try {
            $prefix = 'RS';
            $timestamp = date('Ymd'); // Full year format: 20250531
            $random = strtoupper(substr(uniqid(), -4)); // 4 character random string
            
            $orderNumber = $prefix . $timestamp . $random;
            
            // Check if order number already exists (very unlikely but safe)
            $existing = $this->getOrderByNumber($orderNumber);
            if ($existing) {
                // If exists, add more randomness
                $orderNumber .= strtoupper(substr(uniqid(), -2));
            }
            
            return $orderNumber;
        } catch (Exception $e) {
            error_log("Error generating order number: " . $e->getMessage());
            return 'RS' . date('Ymd') . strtoupper(substr(uniqid(), -4));
        }
    }
}
