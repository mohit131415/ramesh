<?php

namespace App\Features\Authentication\Services;

use App\Core\Security\Authentication;
use App\Features\Authentication\DataAccess\UserRepository;
use App\Shared\Exceptions\ValidationException;
use App\Shared\Exceptions\AuthenticationException;
use Exception;

class AuthenticationService
{
    private $authentication;
    private $userRepository;

    public function __construct()
    {
        $this->authentication = Authentication::getInstance();
        $this->userRepository = new UserRepository();
    }

    public function login($credentials)
    {
        try {
            // Validate input
            if (empty($credentials['email'])) {
                throw new ValidationException('Email or username is required', ['email' => 'Email or username is required']);
            }
            
            if (empty($credentials['password'])) {
                throw new ValidationException('Password is required', ['password' => 'Password is required']);
            }
            
            // Authenticate user
            $result = $this->authentication->authenticate($credentials);
            
            // Debug log to verify user ID is present
            if (isset($result['user']) && isset($result['user']['id'])) {
                error_log("Login successful for user ID: " . $result['user']['id']);
            } else {
                error_log("Login successful but user ID not found in result: " . json_encode($result));
            }
            
            return $result;
        } catch (ValidationException $e) {
            throw $e;
        } catch (AuthenticationException $e) {
            throw $e;
        } catch (Exception $e) {
            throw new Exception('Login failed: ' . $e->getMessage());
        }
    }

    public function logout()
    {
        try {
            return $this->authentication->logout();
        } catch (Exception $e) {
            throw new Exception('Logout failed: ' . $e->getMessage());
        }
    }

    public function refreshToken($refreshToken)
    {
        try {
            if (empty($refreshToken)) {
                throw new ValidationException('Refresh token is required', ['refresh_token' => 'Refresh token is required']);
            }
            
            return $this->authentication->refreshToken($refreshToken);
        } catch (ValidationException $e) {
            throw $e;
        } catch (AuthenticationException $e) {
            throw $e;
        } catch (Exception $e) {
            throw new Exception('Token refresh failed: ' . $e->getMessage());
        }
    }
}
