<?php

namespace App\Features\Open\UserAddress\Actions;

use App\Core\Request;
use App\Core\Response;
use App\Features\Open\UserAddress\Services\UserAddressService;
use App\Shared\Exceptions\NotFoundException;
use App\Shared\Helpers\ResponseFormatter;
use Exception;

class GetUserAddress
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
            
            // Get address ID from URL parameters
            $addressId = (int)$request->getParam('id');
            
            if (!$addressId) {
                throw new Exception("Address ID is required");
            }
            
            // Get address
            $address = $this->addressService->getAddress($addressId, $userId);
            
            // Return response
            return ResponseFormatter::success(
                $address,
                'Address retrieved successfully'
            );
        } catch (NotFoundException $e) {
            throw $e;
        } catch (Exception $e) {
            throw new Exception('Failed to retrieve address: ' . $e->getMessage());
        }
    }
}
