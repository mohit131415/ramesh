<?php

namespace App\Features\Open\Authentication\Actions;

use App\Core\Request;
use App\Core\Response;
use App\Features\Open\Authentication\Services\AuthenticationService;
use Exception;

class LogoutUser
{
    private $authService;
    
    public function __construct()
    {
        $this->authService = new AuthenticationService();
    }
    
    /**
     * Handle the logout request
     * 
     * @param Request $request
     * @param Response $response
     * @return mixed
     */
    public function __invoke(Request $request, Response $response)
    {
        try {
            // Get token from Authorization header
            $token = $this->extractToken($request);
            
            if (!$token) {
                return $response->json([
                    'status' => 'error',
                    'message' => 'We couldn\'t process your sign out request. Please try again.',
                    'data' => null
                ]);
            }
            
            // In a real implementation, you might want to invalidate the token
            // by adding it to a blacklist or updating its status in the database
            
            // For now, we'll just return success and let the client handle token removal
            return $response->json([
                'status' => 'success',
                'message' => 'You have successfully signed out of your account. Thank you for using our service!',
                'data' => null
            ]);
            
        } catch (Exception $e) {
            error_log("Error in logout: " . $e->getMessage());
            
            return $response->json([
                'status' => 'error',
                'message' => 'We encountered a problem while signing you out: ' . $e->getMessage(),
                'data' => null
            ]);
        }
    }
    
    /**
     * Extract token from request
     * 
     * @param Request $request
     * @return string|null
     */
    private function extractToken(Request $request): ?string
    {
        // Try to get token from Authorization header
        $token = $request->getBearerToken();
        
        // If not in header, try to get from request body
        if (!$token) {
            $body = $request->getBody();
            $token = $body['token'] ?? null;
        }
        
        return $token;
    }
}
