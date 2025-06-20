<?php

namespace App\Shared\Middleware;

use App\Core\Request;
use App\Core\Response;
use App\Core\Security\Authorization;
use App\Shared\Exceptions\AuthorizationException;

class RoleVerification
{
    private $authorization;
    private $requiredRole;

    public function __construct($requiredRole = 'admin')
    {
        $this->authorization = Authorization::getInstance();
        $this->requiredRole = $requiredRole;
    }

    public function handle(Request $request, Response $response, $next)
    {
        try {
            // Check if user has required role
            $this->authorization->authorize($this->requiredRole);
            
            // Continue to next middleware or handler
            return $next($request, $response);
        } catch (\Exception $e) {
            throw new AuthorizationException($e->getMessage());
        }
    }
}
