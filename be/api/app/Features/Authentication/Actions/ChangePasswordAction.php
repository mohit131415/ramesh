<?php

namespace App\Features\Authentication\Actions;

use App\Core\Request;
use App\Core\Response;
use App\Features\Authentication\Services\AuthenticationService;
use App\Features\Authentication\DataAccess\UserRepository;
use App\Shared\Exceptions\ValidationException;
use App\Shared\Exceptions\AuthenticationException;
use App\Shared\Traits\LogsActivity;
use App\Shared\Traits\ValidatesInput;
use Exception;

class ChangePasswordAction
{
    use LogsActivity, ValidatesInput;
    
    private $userRepository;

    public function __construct()
    {
        $this->userRepository = new UserRepository();
    }

    public function execute(Request $request, Response $response)
    {
        try {
            // Log request details for debugging
            error_log("Change password request received");
            error_log("Request body: " . json_encode($request->getBody()));
            error_log("Auth payload: " . json_encode($request->getParam('auth_payload')));
            
            // Get authenticated user
            $auth = \App\Core\Security\Authentication::getInstance();
            $user = $auth->user();
            
            if (!$user) {
                error_log("No authenticated user found");
                
                // Try to get user from auth_payload
                $payload = $request->getParam('auth_payload');
                if ($payload && isset($payload->sub)) {
                    error_log("Trying to get user from payload sub: " . $payload->sub);
                    try {
                        $user = $this->userRepository->findById($payload->sub);
                        error_log("User found from payload: " . json_encode($user));
                    } catch (Exception $e) {
                        error_log("Error finding user from payload: " . $e->getMessage());
                    }
                }
                
                if (!$user) {
                    throw new AuthenticationException('User not authenticated');
                }
            }
            
            // Validate input
            $data = $this->validate($request->getBody(), [
                'current_password' => 'required',
                'new_password' => 'required|min:8',
                'new_password_confirmation' => 'required'
            ]);
            
            // Check if new password and confirmation match
            if ($data['new_password'] !== $data['new_password_confirmation']) {
                throw new ValidationException('Password confirmation does not match', [
                    'new_password_confirmation' => 'Password confirmation does not match'
                ]);
            }
            
            // Get user from database to verify current password
            $userData = $this->userRepository->findById($user['id']);
            
            // Verify current password
            if (!password_verify($data['current_password'], $userData['password'])) {
                throw new ValidationException('Current password is incorrect', [
                    'current_password' => 'Current password is incorrect'
                ]);
            }
            
            // Hash new password
            $hashedPassword = password_hash($data['new_password'], PASSWORD_BCRYPT, ['cost' => 12]);
            
            // Update password in database
            $this->userRepository->updatePassword($user['id'], $hashedPassword);
            
            // Try to log activity, but don't let it break the response if it fails
            try {
                $this->logActivity('Authentication', 'PasswordChange', [
                    'user_id' => $user['id']
                ]);
            } catch (Exception $e) {
                error_log("Failed to log activity: " . $e->getMessage());
                // Continue execution - don't let activity logging break the response
            }
            
            // Return success response
            return [
                'status' => 'success',
                'message' => 'Password changed successfully',
                'data' => null
            ];
        } catch (ValidationException $e) {
            throw $e;
        } catch (AuthenticationException $e) {
            throw $e;
        } catch (Exception $e) {
            error_log("Password change error: " . $e->getMessage());
            throw new Exception('Password change failed: ' . $e->getMessage());
        }
    }
}
