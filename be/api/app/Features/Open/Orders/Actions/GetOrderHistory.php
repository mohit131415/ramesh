<?php

namespace App\Features\Open\Orders\Actions;

use App\Core\Request;
use App\Core\Response;
use App\Core\Security\Authentication;
use App\Features\Open\Orders\Services\OrderHistoryService;
use App\Shared\Helpers\ResponseFormatter;
use App\Shared\Exceptions\AuthenticationException;
use Exception;

class GetOrderHistory
{
    private $orderHistoryService;
    private $auth;

    public function __construct()
    {
        $this->orderHistoryService = new OrderHistoryService();
        $this->auth = Authentication::getInstance();
    }

    public function execute(Request $request, Response $response)
    {
        try {
            // Get user ID from token - authentication is compulsory
            $userId = $this->authenticateUser($request);
            
            // Get query parameters
            $page = max(1, (int)$request->getQuery('page', 1));
            $limit = min(50, max(1, (int)$request->getQuery('limit', 10)));
            $search = $request->getQuery('search');
            $status = $request->getQuery('status');
            $paymentStatus = $request->getQuery('payment_status');
            $dateFrom = $request->getQuery('date_from');
            $dateTo = $request->getQuery('date_to');
            $sortBy = $request->getQuery('sort_by', 'order_date');
            $sortOrder = $request->getQuery('sort_order', 'desc');
            
            // Validate date formats if provided
            if ($dateFrom && !$this->isValidDate($dateFrom)) {
                throw new Exception('Invalid date_from format. Use Y-m-d format (e.g., 2024-01-15)');
            }
            
            if ($dateTo && !$this->isValidDate($dateTo)) {
                throw new Exception('Invalid date_to format. Use Y-m-d format (e.g., 2024-01-15)');
            }
            
            // Validate sort parameters
            $validSortFields = ['order_date', 'order_number', 'final_total', 'status'];
            if (!in_array($sortBy, $validSortFields)) {
                $sortBy = 'order_date';
            }
            
            $validSortOrders = ['asc', 'desc'];
            if (!in_array(strtolower($sortOrder), $validSortOrders)) {
                $sortOrder = 'desc';
            }
            
            // Build filters array
            $filters = [
                'search' => $search,
                'status' => $status,
                'payment_status' => $paymentStatus,
                'date_from' => $dateFrom,
                'date_to' => $dateTo,
                'sort_by' => $sortBy,
                'sort_order' => strtolower($sortOrder)
            ];
            
            // Get order history
            $orderHistory = $this->orderHistoryService->getOrderHistory($userId, $page, $limit, $filters);
            
            return $response->json(ResponseFormatter::success(
                $orderHistory,
                'Order history retrieved successfully'
            ));
        } catch (AuthenticationException $e) {
            return $response->json(ResponseFormatter::error(
                $e->getMessage()
            ), 401);
        } catch (Exception $e) {
            return $response->json(ResponseFormatter::error(
                'Failed to retrieve order history: ' . $e->getMessage()
            ), 400);
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
            error_log("Order history authentication error: " . $e->getMessage());
            throw new AuthenticationException('Invalid or expired token: ' . $e->getMessage());
        }
    }

    /**
     * Validate date format
     * 
     * @param string $date
     * @return bool
     */
    private function isValidDate($date)
    {
        $d = \DateTime::createFromFormat('Y-m-d', $date);
        return $d && $d->format('Y-m-d') === $date;
    }
}
