<?php

namespace App\Features\Open\Orders\Actions;

use App\Core\Request;
use App\Core\Response;
use App\Features\Open\Orders\Services\InvoiceService;
use App\Shared\Helpers\ResponseFormatter;
use App\Core\Security\Authentication;
use App\Shared\Exceptions\AuthenticationException;
use App\Shared\Exceptions\NotFoundException;
use Exception;

class DownloadInvoice
{
    private $invoiceService;
    private $auth;

    public function __construct()
    {
        $this->invoiceService = new InvoiceService();
        $this->auth = Authentication::getInstance();
    }

    public function execute(Request $request, Response $response, $params = [])
    {
        try {
            // Get user ID from token - authentication is compulsory
            $userId = $this->authenticateUser($request);
            
            // Get order number from route params
            $orderNumber = $params['order_number'] ?? null;
            
            if (!$orderNumber) {
                return $response->json(ResponseFormatter::error(
                    'Order number is required'
                ), 400);
            }
            
            // Generate invoice PDF
            $invoicePdf = $this->invoiceService->generateInvoice($orderNumber, $userId);
            
            // Set headers for PDF download
            header('Content-Type: text/html; charset=utf-8');
            header('Content-Disposition: inline; filename="Invoice-' . $orderNumber . '.html"');
            header('Cache-Control: max-age=0');
            header('Content-Length: ' . strlen($invoicePdf));
            
            // Output PDF content and exit
            echo $invoicePdf;
            exit;
            
        } catch (AuthenticationException $e) {
            return $response->json(ResponseFormatter::error(
                $e->getMessage()
            ), 401);
        } catch (NotFoundException $e) {
            return $response->json(ResponseFormatter::error(
                $e->getMessage()
            ), 404);
        } catch (Exception $e) {
            error_log("Error generating invoice: " . $e->getMessage());
            return $response->json(ResponseFormatter::error(
                'Failed to generate invoice: ' . $e->getMessage()
            ), 500);
        }
    }

    /**
     * Authenticate user and return user ID
     * 
     * @param Request $request
     * @return int User ID
     * @throws AuthenticationException If authentication fails
     */
    private function authenticateUser(Request $request)
    {
        $token = $request->getBearerToken();
        
        if (!$token) {
            throw new AuthenticationException('Authentication required');
        }
        
        try {
            // Use the same token manager as the ValidateToken action
            $tokenManager = new \App\Core\Security\TokenManager();
            $payload = $tokenManager->validateToken($token, false);
            
            // Get user ID from token - try different possible locations
            $userId = null;
            
            // Try standard JWT claim
            if (isset($payload->sub)) {
                $userId = $payload->sub;
            }
            // Try custom property
            else if (isset($payload->user_id)) {
                $userId = $payload->user_id;
            }
            // Try data object if present
            else if (isset($payload->data) && is_object($payload->data)) {
                if (isset($payload->data->user_id)) {
                    $userId = $payload->data->user_id;
                } else if (isset($payload->data->id)) {
                    $userId = $payload->data->id;
                }
            }
            
            if (!$userId) {
                throw new AuthenticationException('Invalid token payload');
            }
            
            // Convert to integer to ensure proper type
            $userId = (int)$userId;
            
            // Verify user exists in database
            $userRepository = new \App\Features\Open\Authentication\DataAccess\UserRepository();
            $user = $userRepository->getUserById($userId);
            
            if (!$user) {
                throw new AuthenticationException('User not found');
            }
            
            return $userId;
        } catch (Exception $e) {
            error_log("Invoice authentication error: " . $e->getMessage());
            throw new AuthenticationException('Invalid or expired token: ' . $e->getMessage());
        }
    }
}
