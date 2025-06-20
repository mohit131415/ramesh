<?php

namespace App\Features\Open\UserAddress\Actions;

use App\Core\Request;
use App\Core\Response;
use App\Features\Open\UserAddress\Services\UserAddressService;
use App\Shared\Helpers\ResponseFormatter;
use Exception;

class GetDefaultAddress
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
            
            // Get default address
            $address = $this->addressService->getDefaultAddress($userId);
            
            if (!$address) {
                return ResponseFormatter::success(
                    null,
                    'No default address found'
                );
            }
            
            // Return response
            return ResponseFormatter::success(
                $address,
                'Default address retrieved successfully'
            );
        } catch (Exception $e) {
            throw new Exception('Failed to retrieve default address: ' . $e->getMessage());
        }
    }
}
