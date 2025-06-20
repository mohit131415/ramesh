<?php

namespace App\Features\Open\UserProfile\Actions;

use App\Core\Request;
use App\Core\Response;
use App\Features\Open\UserProfile\Services\UserProfileService;
use App\Shared\Exceptions\ValidationException;
use App\Shared\Helpers\ResponseFormatter;
use Exception;

class CreateUserProfile
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
            
            // Get request data
            $data = $request->getBody();
            
            // Get profile picture file if uploaded
            $file = $request->getFile('profile_picture');
            
            // Create profile
            $profile = $this->profileService->createProfile($data, $file, $userId);
            
            // Return response
            return ResponseFormatter::success(
                $profile,
                'Profile created successfully'
            );
        } catch (ValidationException $e) {
            throw $e;
        } catch (Exception $e) {
            throw new Exception('Failed to create profile: ' . $e->getMessage());
        }
    }
}
