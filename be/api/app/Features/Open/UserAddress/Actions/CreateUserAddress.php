<?php

namespace App\Features\Open\UserAddress\Actions;

use App\Core\Request;
use App\Core\Response;
use App\Features\Open\UserAddress\Services\UserAddressService;
use App\Shared\Exceptions\ValidationException;
use App\Shared\Helpers\ResponseFormatter;
use Exception;

class CreateUserAddress
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
            
            // Get request data
            $data = $request->getBody();
            
            // Create address
            $address = $this->addressService->createAddress($data, $userId);
            
            // Return response
            return ResponseFormatter::success(
                $address,
                'Address created successfully'
            );
        } catch (ValidationException $e) {
            throw $e;
        } catch (Exception $e) {
            throw new Exception('Failed to create address: ' . $e->getMessage());
        }
    }
}
