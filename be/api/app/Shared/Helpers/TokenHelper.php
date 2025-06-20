<?php

namespace App\Shared\Helpers;

use Firebase\JWT\JWT;
use Firebase\JWT\Key;
use Firebase\JWT\ExpiredException;
use Exception;

class TokenHelper
{
    /**
     * Generate a JWT token
     *
     * @param array $payload Token payload
     * @param int $expiry Token expiry in seconds
     * @return string Generated token
     */
    public static function generateToken($payload, $expiry = null)
    {
        try {
            $secret = config('security.jwt.secret');
            $algorithm = config('security.jwt.algorithm');
            $expiry = $expiry ?? config('security.jwt.expiry');
            
            $issuedAt = time();
            $expiresAt = $issuedAt + $expiry;
            
            $tokenPayload = array_merge([
                'iss' => config('app.url'),     // Issuer
                'aud' => config('app.url'),     // Audience
                'iat' => $issuedAt,             // Issued At
                'exp' => $expiresAt,            // Expires At
            ], $payload);
            
            return JWT::encode($tokenPayload, $secret, $algorithm);
        } catch (Exception $e) {
            throw new Exception('Token generation failed: ' . $e->getMessage());
        }
    }

    /**
     * Validate a JWT token
     *
     * @param string $token Token to validate
     * @return object Decoded token payload
     */
    public static function validateToken($token)
    {
        try {
            $secret = config('security.jwt.secret');
            $algorithm = config('security.jwt.algorithm');
            
            return JWT::decode($token, new Key($secret, $algorithm));
        } catch (ExpiredException $e) {
            throw new Exception('Token has expired');
        } catch (Exception $e) {
            throw new Exception('Invalid token: ' . $e->getMessage());
        }
    }

    /**
     * Get token from Authorization header
     *
     * @param string $authHeader Authorization header
     * @return string|null Token or null if not found
     */
    public static function extractTokenFromHeader($authHeader)
    {
        if (!$authHeader) {
            return null;
        }
        
        if (preg_match('/Bearer\s+(.*)$/i', $authHeader, $matches)) {
            return $matches[1];
        }
        
        return null;
    }
}
