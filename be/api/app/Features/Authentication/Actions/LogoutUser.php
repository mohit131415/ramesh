<?php

namespace App\Features\Authentication\Actions;

use App\Core\Request;
use App\Core\Response;
use App\Features\Authentication\Services\AuthenticationService;
use Exception;

class LogoutUser
{
    private $authService;

    public function __construct()
    {
        $this->authService = new AuthenticationService();
    }

    public function execute(Request $request, Response $response)
    {
        try {
            $this->authService->logout();
            
            return [
                'status' => 'success',
                'message' => 'Logout successful'
            ];
        } catch (Exception $e) {
            throw new Exception('Logout failed: ' . $e->getMessage());
        }
    }
}
