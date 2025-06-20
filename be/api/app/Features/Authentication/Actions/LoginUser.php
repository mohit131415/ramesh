<?php

namespace App\Features\Authentication\Actions;

use App\Core\Request;
use App\Core\Response;
use App\Features\Authentication\Services\AuthenticationService;
use App\Shared\Exceptions\ValidationException;
use App\Shared\Exceptions\AuthenticationException;
use Exception;

class LoginUser
{
    private $authService;

    public function __construct()
    {
        $this->authService = new AuthenticationService();
    }

    public function execute(Request $request, Response $response)
    {
        try {
            $credentials = [
                'email' => $request->getBody('email'),
                'password' => $request->getBody('password')
            ];
            
            $result = $this->authService->login($credentials);
            
            // REMOVED manual activity logging - let ActivityLogger middleware handle it
            // This ensures proper is_admin detection based on route
            
            return [
                'status' => 'success',
                'message' => 'Login successful',
                'data' => $result
            ];
        } catch (ValidationException $e) {
            throw $e;
        } catch (AuthenticationException $e) {
            throw $e;
        } catch (Exception $e) {
            throw new Exception('Login failed: ' . $e->getMessage());
        }
    }
}
