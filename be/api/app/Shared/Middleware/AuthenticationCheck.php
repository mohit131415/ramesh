<?php

namespace App\Shared\Middleware;

use App\Core\Request;
use App\Core\Response;
use App\Core\Security\Authentication;
use App\Shared\Exceptions\AuthenticationException;

class AuthenticationCheck
{
    private $authentication;

    public function __construct()
    {
        $this->authentication = Authentication::getInstance();
    }

    public function handle(Request $request, Response $response, $next)
    {
        try {
            // Get token from Authorization header
            $authHeader = $request->getHeader('Authorization');
            error_log("Authorization header: " . ($authHeader ?: 'Not provided'));
        
            $token = $request->getBearerToken();
        
            if (!$token) {
                error_log("No bearer token found in request");
                throw new AuthenticationException('Authentication token is required');
            }
        
            error_log("Token found: " . substr($token, 0, 10) . '...');
        
            // Validate token and get payload
            try {
                $payload = $this->authentication->validateToken($token);
                error_log("Token validated successfully for user ID: " . ($payload->sub ?? 'unknown'));
            } catch (\Exception $e) {
                error_log("Token validation failed: " . $e->getMessage());
                throw new AuthenticationException('Invalid or expired token: ' . $e->getMessage());
            }
        
            // Store payload in request for future use
            $request->setParams(['auth_payload' => $payload]);
        
            // Continue to next middleware or handler
            return $next($request, $response);
        } catch (\Exception $e) {
            error_log("Authentication check failed: " . $e->getMessage());
            throw new AuthenticationException($e->getMessage());
        }
    }
}
