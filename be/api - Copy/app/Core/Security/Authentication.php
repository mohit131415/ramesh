<?php

namespace App\Core\Security;

use App\Core\Database;
use App\Shared\Exceptions\AuthenticationException;
use Firebase\JWT\JWT;
use Firebase\JWT\Key;
use Exception;

class Authentication
{
    private static $instance = null;
    private $database;
    private $user = null;
    private $tokenManager;

    private function __construct()
    {
        $this->database = Database::getInstance();
        $this->tokenManager = new TokenManager();
    }

    public static function getInstance()
    {
        if (self::$instance === null) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    public function authenticate($credentials)
    {
        try {
            $email = $credentials['email'] ?? '';
            $password = $credentials['password'] ?? '';
            
            if (empty($email) || empty($password)) {
                throw new AuthenticationException('Email and password are required');
            }
            
            // Get user from database
            $sql = "SELECT * FROM admins WHERE (email = :email OR username = :username) AND deleted_at IS NULL";
            $user = $this->database->fetch($sql, [
                ':email' => $email,
                ':username' => $email
            ]);
            
            if (!$user) {
                throw new AuthenticationException('Invalid credentials');
            }
            
            // Check if user is active
            if ($user['status'] !== 'active') {
                throw new AuthenticationException('Your account is not active. Please contact administrator.');
            }
            
            // Verify password
            if (!password_verify($password, $user['password'])) {
                throw new AuthenticationException('Invalid credentials');
            }
            
            // Update last login time
            $this->database->update('admins', 
                ['last_login_at' => date('Y-m-d H:i:s')], 
                'id = :id', 
                [':id' => $user['id']]
            );
            
            // Remove password from user data
            unset($user['password']);
            
            // Set authenticated user
            $this->user = $user;
            
            // Generate tokens with admin user type
            $accessToken = $this->tokenManager->generateAccessToken($user, 'admin');
            $refreshToken = $this->tokenManager->generateRefreshToken($user, 'admin');
            
            return [
                'user' => $user,
                'access_token' => $accessToken,
                'refresh_token' => $refreshToken,
                'token_type' => 'Bearer',
                'expires_in' => $this->tokenManager->getExpiryForUserType('admin')
            ];
        } catch (Exception $e) {
            throw new AuthenticationException($e->getMessage());
        }
    }

    public function validateToken($token)
    {
        try {
            $payload = $this->tokenManager->validateToken($token);
            
            // If token is valid, try to load the user
            if (isset($payload->sub)) {
                $this->loadUserFromId($payload->sub);
            }
            
            return $payload;
        } catch (Exception $e) {
            throw new AuthenticationException('Invalid or expired token: ' . $e->getMessage());
        }
    }
    
    private function loadUserFromId($userId)
    {
        try {
            // Only load if user is not already loaded
            if ($this->user === null || $this->user['id'] != $userId) {
                $sql = "SELECT * FROM admins WHERE id = :id AND deleted_at IS NULL";
                $user = $this->database->fetch($sql, [':id' => $userId]);
                
                if ($user) {
                    // Remove password from user data
                    unset($user['password']);
                    $this->user = $user;
                    
                    // Debug log
                    error_log("User loaded from ID: " . $userId . ", User data: " . json_encode($this->user));
                } else {
                    error_log("User not found with ID: " . $userId);
                }
            }
        } catch (Exception $e) {
            error_log("Error loading user from ID: " . $e->getMessage());
            // Don't throw - just log the error
        }
    }

    public function refreshToken($refreshToken)
    {
        try {
            $payload = $this->tokenManager->validateToken($refreshToken, true);
            
            // Get user from database to ensure they still exist and are active
            $sql = "SELECT * FROM admins WHERE id = :id AND deleted_at IS NULL";
            $user = $this->database->fetch($sql, [':id' => $payload->sub]);
            
            if (!$user || $user['status'] !== 'active') {
                throw new AuthenticationException('User not found or inactive');
            }
            
            // Remove password from user data
            unset($user['password']);
            
            // Set authenticated user
            $this->user = $user;
            
            // Determine user type from token payload
            $userType = isset($payload->user_type) ? $payload->user_type : 'admin';
            
            // Generate new tokens with same user type
            $accessToken = $this->tokenManager->generateAccessToken($user, $userType);
            $newRefreshToken = $this->tokenManager->generateRefreshToken($user, $userType);
            
            return [
                'user' => $user,
                'access_token' => $accessToken,
                'refresh_token' => $newRefreshToken,
                'token_type' => 'Bearer',
                'expires_in' => $this->tokenManager->getExpiryForUserType($userType)
            ];
        } catch (Exception $e) {
            throw new AuthenticationException('Invalid or expired refresh token: ' . $e->getMessage());
        }
    }

    public function logout()
    {
        $this->user = null;
        return true;
    }

    public function check()
    {
        return $this->user !== null;
    }

    public function user()
    {
        // Debug log
        error_log("Current user: " . ($this->user ? json_encode($this->user) : 'null'));
        return $this->user;
    }
}
