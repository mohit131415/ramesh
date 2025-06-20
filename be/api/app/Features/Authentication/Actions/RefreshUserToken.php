<?php

namespace App\Features\Authentication\Actions;

use App\Core\Request;
use App\Core\Response;
use App\Features\Authentication\Services\AuthenticationService;
use App\Shared\Exceptions\ValidationException;
use App\Shared\Exceptions\AuthenticationException;
use Exception;

class RefreshUserToken
{
    private $authService;

    public function __construct()
    {
        $this->authService = new AuthenticationService();
    }

    public function execute(Request $request, Response $response)
    {
        try {
            // Log the received body for debugging
            error_log('Refresh token request body: ' . json_encode($request->getBody()));
            
            $refreshToken = $request->getBody('refresh_token');
            
            if (empty($refreshToken)) {
                throw new ValidationException('Refresh token is required', ['refresh_token' => 'Refresh token is required']);
            }
            
            $result = $this->authService->refreshToken($refreshToken);
            
            return [
                'status' => 'success',
                'message' => 'Token refreshed successfully',
                'data' => $result
            ];
        } catch (ValidationException $e) {
            error_log('Validation error in token refresh: ' . $e->getMessage());
            throw $e;
        } catch (AuthenticationException $e) {
            error_log('Authentication error in token refresh: ' . $e->getMessage());
            throw $e;
        } catch (Exception $e) {
            error_log('General error in token refresh: ' . $e->getMessage());
            throw new Exception('Token refresh failed: ' . $e->getMessage());
        }
    }
}
