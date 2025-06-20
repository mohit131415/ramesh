<?php

namespace App\Features\Open\Orders\Utils;

use Exception;

class PaymentUtil
{
    /**
     * Verify online payment with payment gateway
     * 
     * @param string $paymentId Payment ID
     * @param float $amount Amount to verify
     * @param string $gateway Payment gateway (default: razorpay)
     * @return array Verification result
     */
    public function verifyOnlinePayment($paymentId, $amount, $gateway = 'razorpay')
    {
        // This is a placeholder for actual payment verification logic
        // In a real implementation, you would make API calls to the payment gateway
        
        try {
            // For now, we'll just return a success response
            // In production, this would verify the payment with the gateway API
            
            return [
                'verified' => true,
                'payment_id' => $paymentId,
                'amount' => $amount,
                'gateway' => $gateway,
                'status' => 'success',
                'transaction_id' => $paymentId,
                'gateway_response' => json_encode([
                    'status' => 'captured',
                    'method' => 'card',
                    'amount' => $amount * 100, // Razorpay uses amount in paise
                    'currency' => 'INR'
                ])
            ];
        } catch (Exception $e) {
            error_log("Error verifying payment: " . $e->getMessage());
            
            return [
                'verified' => false,
                'payment_id' => $paymentId,
                'amount' => $amount,
                'gateway' => $gateway,
                'status' => 'failed',
                'error' => $e->getMessage()
            ];
        }
    }

    /**
     * Generate payment receipt for COD orders
     * 
     * @param string $orderNumber Order number
     * @param float $amount Amount
     * @return array Receipt data
     */
    public function generateCodReceipt($orderNumber, $amount)
    {
        return [
            'receipt_number' => 'COD-' . $orderNumber,
            'amount' => $amount,
            'payment_method' => 'cod',
            'status' => 'pending',
            'message' => 'Payment will be collected upon delivery'
        ];
    }

    /**
     * Format payment details for response
     * 
     * @param array $paymentData Payment data
     * @param string $paymentMethod Payment method
     * @return array Formatted payment details
     */
    public function formatPaymentDetails($paymentData, $paymentMethod)
    {
        if ($paymentMethod === 'cod') {
            return [
                'method' => 'Cash on Delivery',
                'status' => 'pending',
                'amount' => $paymentData['amount'],
                'message' => 'Payment will be collected upon delivery',
                'receipt_number' => $paymentData['receipt_number'] ?? null
            ];
        } else {
            return [
                'method' => 'Online Payment',
                'gateway' => $paymentData['gateway'] ?? 'razorpay',
                'status' => $paymentData['status'] ?? 'paid',
                'amount' => $paymentData['amount'],
                'transaction_id' => $paymentData['payment_id'],
                'payment_date' => date('Y-m-d H:i:s')
            ];
        }
    }
}
