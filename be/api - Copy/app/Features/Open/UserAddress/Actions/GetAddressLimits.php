<?php

namespace App\Features\Open\UserAddress\Actions;

use App\Core\Request;
use App\Core\Response;
use App\Features\Open\UserAddress\Services\UserAddressService;
use App\Shared\Helpers\ResponseFormatter;
use Exception;

class GetAddressLimits
{
    private $addressService;

    public function __construct()
    {
        $this->addressService = new UserAddressService();
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
            
            // Get address limits
            $limits = $this->addressService->getAddressLimits($userId);
            
            // Return response
            return ResponseFormatter::success(
                $limits,
                'Address limits retrieved successfully'
            );
        } catch (Exception $e) {
            throw new Exception('Failed to retrieve address limits: ' . $e->getMessage());
        }
    }
}
