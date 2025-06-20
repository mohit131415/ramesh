<?php

namespace App\Features\Open\UserProfile\Actions;

use App\Core\Request;
use App\Core\Response;
use App\Features\Open\UserProfile\Services\UserProfileService;
use App\Shared\Helpers\ResponseFormatter;
use Exception;

class GetProfileCompletionStatus
{
    private $profileService;

    public function __construct()
    {
        $this->profileService = new UserProfileService();
    }

    public function execute(Request $request, Response $response)
    {
        try {
            // Get authenticated user ID from the auth_payload set by AuthenticationCheck middleware
            $authPayload = $request->getParam('auth_payload');
            
            if (!$authPayload || !isset($authPayload->sub)) {
                throw new Exception("User not authenticated");
            }
            
            $userId = (int)$authPayload->sub;
            
            // Get profile completion status
            $status = $this->profileService->getProfileCompletionStatus($userId);
            
            // Return response
            return ResponseFormatter::success(
                $status,
                'Profile completion status retrieved successfully'
            );
        } catch (Exception $e) {
            throw new Exception('Failed to get profile completion status: ' . $e->getMessage());
        }
    }
}
