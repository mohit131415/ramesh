<?php

namespace App\Features\Open\Checkout\Actions;

use App\Core\Request;
use App\Core\Response;
use App\Features\Open\Checkout\Services\CheckoutService;
use App\Shared\Helpers\ResponseFormatter;
use App\Core\Security\Authentication;
use App\Shared\Exceptions\AuthenticationException;
use Exception;

class PrepareCheckout
{
    private $checkoutService;
    private $auth;

    public function __construct()
    {
        $this->checkoutService = new CheckoutService();
        $this->auth = Authentication::getInstance();
    }

    public function execute(Request $request, Response $response)
    {
        try {
            // Get user ID from token - authentication is compulsory
            $userId = $this->authenticateUser($request);
            
            // Get parameters from request
            $addressId = $request->getQuery('address_id');
            $paymentMethod = $request->getQuery('payment_method');
            
            // Prepare checkout data
            $checkoutData = $this->checkoutService->prepareCheckout(
                $userId,
                $addressId,
                $paymentMethod
            );
            
            return $response->json(ResponseFormatter::success(
                $checkoutData,
                'Checkout data prepared successfully'
            ));
        } catch (AuthenticationException $e) {
            return $response->json(ResponseFormatter::error(
                $e->getMessage()
            ), 401);
        } catch (Exception $e) {
            return $response->json(ResponseFormatter::error(
                $e->getMessage()
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
            error_log("Checkout authentication error: " . $e->getMessage());
            throw new AuthenticationException('Invalid or expired token: ' . $e->getMessage());
        }
    }
}
