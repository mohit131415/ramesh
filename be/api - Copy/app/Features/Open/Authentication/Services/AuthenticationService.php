<?php

namespace App\Features\Open\Authentication\Services;

use App\Core\Security\TokenManager;
use App\Features\Open\Authentication\DataAccess\UserRepository;
use App\Shared\Helpers\OtpHelper;
use App\Shared\Exceptions\ValidationException;
use App\Shared\Exceptions\AuthenticationException;
use Exception;

class AuthenticationService
{
    private $userRepository;
    private $otpHelper;
    private $tokenManager;
    
    public function __construct()
    {
        $this->userRepository = new UserRepository();
        $this->otpHelper = new OtpHelper();
        $this->tokenManager = new TokenManager();
    }
    
    /**
     * Register a new user with OTP
     * 
     * @param string $phoneNumber
     * @return array
     */
    public function register(string $phoneNumber): array
    {
        try {
            // Check if user already exists
            if ($this->userRepository->userExists($phoneNumber)) {
                // If user exists, get the user ID
                $user = $this->userRepository->getUserByPhoneNumber($phoneNumber);
                $userId = $user['id'];
                
                // Generate and send OTP for existing user with type 'login' instead of 'register'
                return $this->sendOtp($phoneNumber, $userId, 'login', 'You already have an account. Sending login verification code instead.');
            }
            
            // Check OTP rate limit
            if ($this->otpHelper->hasExceededOtpLimit($phoneNumber)) {
                throw new ValidationException("Too many verification code requests. Please try again later.");
            }
            
            // Create a new user first
            $userId = $this->userRepository->createUser($phoneNumber);
            
            if (!$userId) {
                throw new Exception("Failed to create user account");
            }
            
            error_log("Created new user with ID: {$userId} for phone number: {$phoneNumber}");
            
            // Generate OTP
            $otp = $this->otpHelper->generateOtp();
            
            // Store OTP with the newly created user ID
            $success = $this->otpHelper->createOtp($phoneNumber, $otp, 'register', $userId);
            
            if (!$success) {
                // If OTP creation fails, log the error but don't delete the user
                error_log("Failed to create OTP record for new user ID: {$userId}");
                throw new Exception("Failed to create verification code record");
            }
            
            // Send OTP via SMS (dummy implementation)
            $this->otpHelper->sendOtpSms($phoneNumber, $otp);
            
            return [
                'message' => 'A verification code has been sent to your phone. Please enter it to complete your registration.',
                'phone_number' => $phoneNumber,
                'action' => 'register'
            ];
        } catch (Exception $e) {
            error_log("Error in register: " . $e->getMessage());
            throw $e;
        }
    }
    
    /**
     * Login existing user with OTP
     * 
     * @param string $phoneNumber
     * @return array
     */
    public function login(string $phoneNumber): array
    {
        try {
            // Check if user exists
            if (!$this->userRepository->userExists($phoneNumber)) {
                // Instead of throwing an error, automatically start the registration process
                error_log("User with phone number {$phoneNumber} not found. Starting registration process.");
                
                // Create a new user
                $userId = $this->userRepository->createUser($phoneNumber);
                
                if (!$userId) {
                    throw new Exception("Failed to create user account");
                }
                
                // Send registration OTP
                $otp = $this->otpHelper->generateOtp();
                $success = $this->otpHelper->createOtp($phoneNumber, $otp, 'register', $userId);
                
                if (!$success) {
                    error_log("Failed to create OTP record for new user ID: {$userId}");
                    throw new Exception("Failed to create verification code record");
                }
                
                // Send OTP via SMS
                $this->otpHelper->sendOtpSms($phoneNumber, $otp);
                
                return [
                    'message' => 'We couldn\'t find an account with this phone number. A verification code has been sent to create a new account.',
                    'phone_number' => $phoneNumber,
                    'action' => 'register'
                ];
            }
            
            // Get user details
            $user = $this->userRepository->getUserByPhoneNumber($phoneNumber);
            
            // Check if user is active
            if ($user['status'] !== 'active') {
                throw new ValidationException("Your account is inactive. Please contact support.");
            }
            
            // Get user ID
            $userId = $user['id'];
            
            // Send OTP for login
            return $this->sendOtp($phoneNumber, $userId, 'login');
        } catch (Exception $e) {
            error_log("Error in login: " . $e->getMessage());
            throw $e;
        }
    }
    
    /**
     * Helper method to send OTP
     * 
     * @param string $phoneNumber
     * @param int|null $userId
     * @param string $type
     * @param string|null $customMessage
     * @return array
     */
    private function sendOtp(string $phoneNumber, ?int $userId, string $type, ?string $customMessage = null): array
    {
        // Check OTP rate limit
        if ($this->otpHelper->hasExceededOtpLimit($phoneNumber)) {
            throw new ValidationException("Too many verification code requests. Please try again later.");
        }
        
        // Generate OTP
        $otp = $this->otpHelper->generateOtp();
        
        // Log the user ID for debugging
        error_log("Sending OTP for phone: $phoneNumber, type: $type, user_id: " . ($userId ?? 'null'));
        
        // Store OTP with user ID - this will automatically invalidate previous OTPs
        $success = $this->otpHelper->createOtp($phoneNumber, $otp, $type, $userId);
        
        if (!$success) {
            throw new Exception("Failed to create verification code record");
        }
        
        // Send OTP via SMS (dummy implementation)
        $this->otpHelper->sendOtpSms($phoneNumber, $otp);
        
        $message = $customMessage ?? "A verification code has been sent to your phone. Please enter it to " . 
                  ($type === 'login' ? 'sign in to your account' : 'complete your registration') . ".";
        
        return [
            'message' => $message,
            'phone_number' => $phoneNumber,
            'action' => $type
        ];
    }
    
    /**
     * Verify OTP and complete registration or login
     * 
     * @param string $phoneNumber
     * @param string $otp
     * @param string $type
     * @return array
     */
    public function verifyOtp(string $phoneNumber, string $otp, string $type): array
    {
        try {
            // Verify OTP - this will only verify OTPs with 'valid' status
            if (!$this->otpHelper->verifyOtp($phoneNumber, $otp, $type)) {
                throw new ValidationException("Invalid or expired verification code. Please request a new one.");
            }
            
            // Get user ID - user should already exist at this point
            $user = $this->userRepository->getUserByPhoneNumber($phoneNumber);
            
            if (!$user) {
                throw new ValidationException("User account not found.");
            }
            
            $userId = $user['id'];
            
            // If this is a login, update last login timestamp
            if ($type === 'login') {
                $this->userRepository->updateLastLogin($userId);
            } else if ($type === 'register') {
                // If this is a registration, update user status to active if not already
                if ($user['status'] !== 'active') {
                    $this->userRepository->updateUserStatus($userId, 'active');
                }
            }
            
            // Generate JWT tokens for normal users with 1-day expiry
            $accessToken = $this->tokenManager->generateAccessToken([
                'id' => $userId,
                'phone_number' => $phoneNumber
            ], 'user');
            
            $refreshToken = $this->tokenManager->generateRefreshToken([
                'id' => $userId,
                'phone_number' => $phoneNumber
            ], 'user');
            
            // Get expiry time for user type
            $tokenExpiration = $this->tokenManager->getExpiryForUserType('user');
            $refreshExpiration = $this->tokenManager->getExpiryForUserType('user', true);
            
            return [
                'message' => $type === 'register' ? 'Registration successful! Welcome to our platform.' : 'Login successful! Welcome back.',
                'access_token' => $accessToken,
                'refresh_token' => $refreshToken,
                'token_type' => 'Bearer',
                'expires_in' => $tokenExpiration,
                'refresh_expires_in' => $refreshExpiration,
                'user_id' => $userId,
                'user_type' => 'user'
            ];
        } catch (Exception $e) {
            error_log("Error in verifyOtp: " . $e->getMessage());
            throw $e;
        }
    }
    
    /**
     * Validate a token and return user information
     * 
     * @param string $token
     * @return array
     */
    public function validateToken(string $token): array
    {
        try {
            // Validate token using the correct method from TokenManager
            $payload = $this->tokenManager->validateToken($token, false);
            
            if (!$payload) {
                return [
                    'valid' => false,
                    'reason' => 'Invalid token format or signature'
                ];
            }
            
            // Get user ID from token
            $userId = $payload->sub ?? null;
            
            if (!$userId) {
                return [
                    'valid' => false,
                    'reason' => 'Token does not contain user ID'
                ];
            }
            
            // Get user details
            $user = $this->userRepository->getUserById($userId);
            
            if (!$user) {
                return [
                    'valid' => false,
                    'reason' => 'User not found'
                ];
            }
            
            // Check if user is active
            if ($user['status'] !== 'active') {
                return [
                    'valid' => false,
                    'reason' => 'User account is inactive'
                ];
            }
            
            // Calculate expiration date
            $expiresAt = null;
            if (isset($payload->exp)) {
                $expiresAt = date('Y-m-d H:i:s', $payload->exp);
            }
            
            return [
                'valid' => true,
                'expires_at' => $expiresAt,
                'user_id' => $userId,
                'user_type' => $payload->user_type ?? 'user',
                'user' => $user
            ];
        } catch (Exception $e) {
            error_log("Error in validateToken: " . $e->getMessage());
            return [
                'valid' => false,
                'reason' => 'Error validating token: ' . $e->getMessage()
            ];
        }
    }
    
    /**
     * Refresh access token using refresh token
     * 
     * @param string $refreshToken
     * @return array
     */
    public function refreshToken(string $refreshToken): array
    {
        try {
            // Validate refresh token
            $payload = $this->tokenManager->validateToken($refreshToken, true);
            
            if (!$payload) {
                throw new AuthenticationException('Invalid refresh token');
            }
            
            // Get user ID from token
            $userId = $payload->sub ?? null;
            
            if (!$userId) {
                throw new AuthenticationException('Invalid refresh token payload');
            }
            
            // Get user details
            $user = $this->userRepository->getUserById($userId);
            
            if (!$user) {
                throw new AuthenticationException('User not found');
            }
            
            // Check if user is active
            if ($user['status'] !== 'active') {
                throw new AuthenticationException('User account is inactive');
            }
            
            // Generate new access token
            $newAccessToken = $this->tokenManager->generateAccessToken([
                'id' => $userId,
                'phone_number' => $user['phone_number']
            ], 'user');
            
            // Get expiry time for user type
            $tokenExpiration = $this->tokenManager->getExpiryForUserType('user');
            
            return [
                'access_token' => $newAccessToken,
                'token_type' => 'Bearer',
                'expires_in' => $tokenExpiration,
                'user_id' => $userId,
                'user_type' => 'user'
            ];
        } catch (Exception $e) {
            error_log("Error in refreshToken: " . $e->getMessage());
            throw new AuthenticationException('Failed to refresh token: ' . $e->getMessage());
        }
    }
}
