<?php

namespace App\Features\Open\Orders\Services;

use App\Core\Database;
use App\Features\Open\Orders\DataAccess\OrderRepository;
use App\Features\Open\Orders\Utils\PdfGenerator;
use App\Shared\Exceptions\NotFoundException;
use App\Shared\Exceptions\AuthorizationException;
use Exception;

class InvoiceService
{
    private $db;
    private $orderRepository;
    private $pdfGenerator;
    
    public function __construct()
    {
        $this->db = Database::getInstance();
        $this->orderRepository = new OrderRepository();
        $this->pdfGenerator = new PdfGenerator();
    }
    
    /**
     * Generate invoice PDF for an order
     * 
     * @param string $orderNumber Order number
     * @param int $userId User ID
     * @return string PDF content
     * @throws NotFoundException If order not found
     * @throws AuthorizationException If user not authorized
     * @throws Exception If invoice generation fails
     */
    public function generateInvoice($orderNumber, $userId)
    {
        try {
            // Get order details
            $order = $this->orderRepository->getOrderByNumber($orderNumber);
            
            if (!$order) {
                throw new NotFoundException("Order not found");
            }
            
            // Verify user owns this order
            if ($order['user_id'] != $userId) {
                throw new AuthorizationException("You are not authorized to access this order");
            }
            
            // Get order items
            $orderItems = $this->orderRepository->getOrderItems($order['id']);
            
            // Get shipping details
            $shipping = $this->orderRepository->getOrderShipping($order['id']);
            
            // Get payment details
            $payment = $this->orderRepository->getPaymentByOrderId($order['id']);
            
            // Get store information
            $storeInfo = $this->getStoreInformation();
            
            // Get user information
            $userInfo = $this->getUserInformation($userId);
            
            // Format order data for invoice
            $invoiceData = $this->formatInvoiceData($order, $orderItems, $shipping, $payment, $storeInfo, $userInfo);
            
            // Generate PDF
            $pdf = $this->pdfGenerator->generateInvoicePdf($invoiceData);
            
            return $pdf;
        } catch (NotFoundException $e) {
            throw $e;
        } catch (AuthorizationException $e) {
            throw $e;
        } catch (Exception $e) {
            error_log("Error generating invoice: " . $e->getMessage());
            throw new Exception("Failed to generate invoice");
        }
    }
    
    /**
     * Generate invoice PDF for admin (bypasses user ownership check)
     * 
     * @param int $orderId Order ID
     * @return string PDF content
     * @throws NotFoundException If order not found
     * @throws Exception If invoice generation fails
     */
    public function generateAdminInvoice($orderId)
    {
        try {
            // Get order details by ID (no user ownership check)
            $order = $this->orderRepository->getOrderById($orderId);
            
            if (!$order) {
                throw new NotFoundException("Order not found");
            }
            
            // Get order items
            $orderItems = $this->orderRepository->getOrderItems($order['id']);
            
            // Get shipping details
            $shipping = $this->orderRepository->getOrderShipping($order['id']);
            
            // Get payment details
            $payment = $this->orderRepository->getPaymentByOrderId($order['id']);
            
            // Get store information
            $storeInfo = $this->getStoreInformation();
            
            // Get user information
            $userInfo = $this->getUserInformation($order['user_id']);
            
            // Format order data for invoice
            $invoiceData = $this->formatInvoiceData($order, $orderItems, $shipping, $payment, $storeInfo, $userInfo);
            
            // Generate PDF
            $pdf = $this->pdfGenerator->generateInvoicePdf($invoiceData);
            
            return $pdf;
        } catch (NotFoundException $e) {
            throw $e;
        } catch (Exception $e) {
            error_log("Error generating admin invoice: " . $e->getMessage());
            throw new Exception("Failed to generate invoice");
        }
    }
    
    /**
     * Get store information from settings
     * 
     * @return array Store information
     */
    private function getStoreInformation()
    {
        try {
            $settings = [
                'store_name' => 'Ramesh Sweets',
                'store_address_line1' => '',
                'store_address_line2' => '',
                'store_city' => '',
                'store_state' => '',
                'store_postal_code' => '',
                'store_country' => 'India',
                'store_phone' => '',
                'store_email' => '',
                'store_gst' => ''
            ];
            
            // Get settings from database
            $sql = "SELECT `key`, value FROM settings WHERE `key` IN (
                'store_name', 'store_address_line1', 'store_address_line2', 
                'store_city', 'store_state', 'store_postal_code', 
                'store_country', 'store_phone', 'store_email', 'store_gst'
            )";
            
            $results = $this->db->fetchAll($sql);
            
            // Update settings with database values
            foreach ($results as $row) {
                $settings[$row['key']] = $row['value'];
            }
            
            return $settings;
        } catch (Exception $e) {
            error_log("Error getting store information: " . $e->getMessage());
            return [
                'store_name' => 'Ramesh Sweets',
                'store_address_line1' => 'Shop Number 25, Main Bazar Bharat Chowk',
                'store_address_line2' => 'Ulhasnagar 1, Sidhi Vinayak Nagar',
                'store_city' => 'Ulhasnagar',
                'store_state' => 'Maharashtra',
                'store_postal_code' => '421001',
                'store_country' => 'India',
                'store_phone' => '+91 98765 43210',
                'store_email' => 'info@rameshsweets.co.in',
                'store_gst' => '27AABCR1234A1Z5'
            ];
        }
    }
    
    /**
     * Get user information
     * 
     * @param int $userId User ID
     * @return array User information
     */
    private function getUserInformation($userId)
    {
        try {
            // Get user profile
            $sql = "SELECT u.phone_number, up.first_name, up.last_name, up.email 
                    FROM users u 
                    LEFT JOIN user_profiles up ON u.id = up.user_id 
                    WHERE u.id = :user_id";
            
            $user = $this->db->fetch($sql, [':user_id' => $userId]);
            
            if (!$user) {
                return [
                    'name' => 'Customer',
                    'phone' => '',
                    'email' => ''
                ];
            }
            
            return [
                'name' => trim(($user['first_name'] ?? '') . ' ' . ($user['last_name'] ?? '')),
                'phone' => $user['phone_number'] ?? '',
                'email' => $user['email'] ?? ''
            ];
        } catch (Exception $e) {
            error_log("Error getting user information: " . $e->getMessage());
            return [
                'name' => 'Customer',
                'phone' => '',
                'email' => ''
            ];
        }
    }
    
    /**
     * Format invoice data
     * 
     * @param array $order Order data
     * @param array $orderItems Order items
     * @param array $shipping Shipping data
     * @param array $payment Payment data
     * @param array $storeInfo Store information
     * @param array $userInfo User information
     * @return array Formatted invoice data
     */
    private function formatInvoiceData($order, $orderItems, $shipping, $payment, $storeInfo, $userInfo)
    {
        // Format order date
        $orderDate = date('d M Y', strtotime($order['order_date']));
        
        // Format payment method
        $paymentMethod = ucfirst($payment['payment_method'] ?? 'Unknown');
        if ($paymentMethod == 'Cod') {
            $paymentMethod = 'Cash on Delivery';
        } elseif ($paymentMethod == 'Online') {
            $paymentMethod = 'Online Payment';
        }
        
        // Format shipping address
        $shippingAddress = [
            'name' => $shipping['contact_name'] ?? '',
            'phone' => $shipping['contact_phone'] ?? '',
            'address' => $shipping['address_line1'] ?? '',
            'address2' => $shipping['address_line2'] ?? '',
            'city' => $shipping['city'] ?? '',
            'state' => $shipping['state'] ?? '',
            'postal_code' => $shipping['postal_code'] ?? '',
            'country' => $shipping['country'] ?? 'India'
        ];
        
        // Format items
        $items = [];
        $totalQuantity = 0;
        
        foreach ($orderItems as $item) {
            $items[] = [
                'name' => $item['product_name'] . ' - ' . $item['variant_name'],
                'sku' => $item['product_sku'] ?? '',
                'hsn' => $item['product_hsn_code'] ?? '',
                'quantity' => $item['quantity'],
                'price' => $item['selling_price'],
                'base_price' => $item['base_price'],
                'tax_rate' => $item['tax_rate'],
                'tax_amount' => $item['tax_amount'],
                'discount' => $item['discount_amount'],
                'total' => $item['line_total']
            ];
            
            $totalQuantity += $item['quantity'];
        }
        
        // Format bill breakdown - NOW INCLUDES ORIGINAL_PRICE FROM DATABASE
        $billBreakdown = [
            'base_amount' => $order['base_amount'],
            'product_discount' => $order['product_discount_amount'],
            'coupon_discount' => $order['coupon_discount_amount'],
            'total_discount' => $order['total_discount_amount'],
            'subtotal' => $order['subtotal'],
            'shipping_charges' => $order['shipping_charges'],
            'payment_charges' => $order['payment_charges'],
            'tax_amount' => $order['igst_amount'] + $order['cgst_amount'] + $order['sgst_amount'],
            'roundoff' => $order['roundoff'],
            'final_total' => $order['final_total'],
            'original_price' => $order['original_price'] ?? 0  // ADDED: Use original_price from database
        ];
        
        // Format tax details
        $taxDetails = [
            'type' => $order['tax_type'],
            'igst' => $order['igst_amount'],
            'cgst' => $order['cgst_amount'],
            'sgst' => $order['sgst_amount']
        ];
        
        return [
            'invoice_number' => 'INV-' . $order['order_number'],
            'order_number' => $order['order_number'],
            'order_date' => $orderDate,
            'payment_method' => $paymentMethod,
            'payment_status' => ucfirst($order['payment_status']),
            'store_info' => $storeInfo,
            'customer_info' => $userInfo,
            'shipping_address' => $shippingAddress,
            'items' => $items,
            'total_quantity' => $totalQuantity,
            'bill_breakdown' => $billBreakdown,
            'tax_details' => $taxDetails
        ];
    }
}
