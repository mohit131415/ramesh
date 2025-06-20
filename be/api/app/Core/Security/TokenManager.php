<?php

namespace App\Core\Security;

use Firebase\JWT\JWT;
use Firebase\JWT\Key;
use Firebase\JWT\ExpiredException;
use Exception;
use DateTime;
use DateTimeZone;

class TokenManager
{
    private $secret;
    private $algorithm;
    private $expiry;
    private $refreshExpiry;
    private $adminExpiry;
    private $adminRefreshExpiry;
    private $userExpiry;
    private $userRefreshExpiry;

    public function __construct()
    {
        $this->secret = config('security.jwt.secret');
        $this->algorithm = config('security.jwt.algorithm');
        $this->expiry = config('security.jwt.expiry');
        $this->refreshExpiry = config('security.jwt.refresh_expiry');
        
        // Admin specific expiry times
        $this->adminExpiry = config('security.jwt.admin_expiry');
        $this->adminRefreshExpiry = config('security.jwt.admin_refresh_expiry');
        
        // User specific expiry times
        $this->userExpiry = config('security.jwt.user_expiry');
        $this->userRefreshExpiry = config('security.jwt.user_refresh_expiry');
    }

    public function generateAccessToken($user, $userType = 'user')
    {
        $issuedAt = time();
        
        // Determine expiry based on user type
        if ($userType === 'admin') {
            $expiresAt = $issuedAt + $this->adminExpiry;
        } else {
            $expiresAt = $issuedAt + $this->userExpiry;
        }
        
        $payload = [
            'iss' => config('app.url'),     // Issuer
            'aud' => config('app.url'),     // Audience
            'iat' => $issuedAt,             // Issued At
            'exp' => $expiresAt,            // Expires At
            'sub' => $user['id'],           // Subject (user ID)
            'type' => 'access',             // Token type
            'user_type' => $userType        // User type (admin or user)
        ];
        
        // Add role for admin users
        if ($userType === 'admin' && isset($user['role'])) {
            $payload['role'] = $user['role'];
        }
        
        return JWT::encode($payload, $this->secret, $this->algorithm);
    }

    public function generateRefreshToken($user, $userType = 'user')
    {
        $issuedAt = time();
        
        // Determine refresh expiry based on user type
        if ($userType === 'admin') {
            $expiresAt = $issuedAt + $this->adminRefreshExpiry;
        } else {
            $expiresAt = $issuedAt + $this->userRefreshExpiry;
        }
        
        $payload = [
            'iss' => config('app.url'),     // Issuer
            'aud' => config('app.url'),     // Audience
            'iat' => $issuedAt,             // Issued At
            'exp' => $expiresAt,            // Expires At
            'sub' => $user['id'],           // Subject (user ID)
            'type' => 'refresh',            // Token type
            'user_type' => $userType        // User type (admin or user)
        ];
        
        return JWT::encode($payload, $this->secret, $this->algorithm);
    }

    public function validateToken($token, $isRefresh = false)
    {
        try {
            $payload = JWT::decode($token, new Key($this->secret, $this->algorithm));
            
            // Verify token type
            if ($isRefresh && $payload->type !== 'refresh') {
                throw new Exception('Invalid token type');
            }
            
            if (!$isRefresh && $payload->type !== 'access') {
                throw new Exception('Invalid token type');
            }
            
            // Calculate expiration date with proper timezone
            $expiresAt = null;
            if (isset($payload->exp)) {
                // Set timezone to match your application timezone
                $timezone = new DateTimeZone(config('app.timezone')); // Adjust to your timezone
                $expiresAt = (new DateTime('@' . $payload->exp))->setTimezone($timezone)->format('Y-m-d H:i:s');
            }
            
            return $payload;
        } catch (ExpiredException $e) {
            throw new Exception('Token has expired');
        } catch (Exception $e) {
            throw new Exception('Invalid token: ' . $e->getMessage());
        }
    }

    /**
     * Get expiry time for user type
     */
    public function getExpiryForUserType($userType = 'user', $isRefresh = false)
    {
        if ($userType === 'admin') {
            return $isRefresh ? $this->adminRefreshExpiry : $this->adminExpiry;
        } else {
            return $isRefresh ? $this->userRefreshExpiry : $this->userExpiry;
        }
    }
}
