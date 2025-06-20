<?php

namespace App\Shared\Middleware;

use App\Core\Request;
use App\Core\Response;

class CorsHandler
{
    public function handle(Request $request, Response $response, $next)
    {
        // Get CORS config
        $allowedOrigins = config('cors.allowed_origins', ['*']);
        $allowedMethods = config('cors.allowed_methods', ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']);
        $allowedHeaders = config('cors.allowed_headers', ['Content-Type', 'Authorization']);
        $maxAge = config('cors.max_age', 86400);
        
        // Set the allowed origin - either * or the matching origin
        $origin = $request->getHeader('Origin');
        $allowedOrigin = '*';
        
        if (is_array($allowedOrigins) && $origin) {
            if (in_array('*', $allowedOrigins) || in_array($origin, $allowedOrigins)) {
                $allowedOrigin = $origin;
            }
        }
        
        // Set CORS headers
        $response->setHeader('Access-Control-Allow-Origin', $allowedOrigin);
        
        if ($allowedOrigin !== '*' && config('cors.supports_credentials', false)) {
            $response->setHeader('Access-Control-Allow-Credentials', 'true');
        }
        
        // Handle preflight requests
        if ($request->getMethod() === 'OPTIONS') {
            $response->setHeader('Access-Control-Allow-Methods', implode(', ', $allowedMethods));
            $response->setHeader('Access-Control-Allow-Headers', implode(', ', $allowedHeaders));
            $response->setHeader('Access-Control-Max-Age', $maxAge);
            
            // End request with 204 No Content
            $response->json([
                'status' => 'success',
                'message' => 'Preflight request successful',
                'data' => null
            ], 200);
            exit;
        }
        
        // Continue to next middleware or handler
        return $next($request, $response);
    }
}
