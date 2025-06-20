<?php

namespace App\Features\Open\UserProfile\Actions;

use App\Core\Request;
use App\Core\Response;
use App\Features\Open\UserProfile\Services\UserProfileService;
use App\Shared\Exceptions\NotFoundException;
use App\Shared\Helpers\ResponseFormatter;
use Exception;

class GetUserProfile
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
            
            // Get profile
            $profile = $this->profileService->getProfile($userId);
            
            // Return response
            return ResponseFormatter::success(
                $profile,
                'Profile retrieved successfully'
            );
        } catch (NotFoundException $e) {
            throw $e;
        } catch (Exception $e) {
            throw new Exception('Failed to retrieve profile: ' . $e->getMessage());
        }
    }
}
