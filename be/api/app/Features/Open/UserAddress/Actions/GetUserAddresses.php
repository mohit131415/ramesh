<?php

namespace App\Features\Open\UserAddress\Actions;

use App\Core\Request;
use App\Core\Response;
use App\Features\Open\UserAddress\Services\UserAddressService;
use App\Shared\Helpers\ResponseFormatter;
use Exception;

class GetUserAddresses
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
            
            // Get addresses
            $result = $this->addressService->getUserAddresses($userId);
            
            // Return response
            return ResponseFormatter::success(
                $result['addresses'],
                'Addresses retrieved successfully',
                $result['meta']
            );
        } catch (Exception $e) {
            throw new Exception('Failed to retrieve addresses: ' . $e->getMessage());
        }
    }
}
