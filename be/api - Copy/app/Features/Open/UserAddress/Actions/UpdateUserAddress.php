<?php

namespace App\Features\Open\UserAddress\Actions;

use App\Core\Request;
use App\Core\Response;
use App\Features\Open\UserAddress\Services\UserAddressService;
use App\Shared\Exceptions\ValidationException;
use App\Shared\Exceptions\NotFoundException;
use App\Shared\Helpers\ResponseFormatter;
use Exception;

class UpdateUserAddress
{
    private $addressService;

    public function __construct()
    {
        $this->addressService = new UserAddressService();
    }

    public function execute(Request $request, Response $response)
    {
        try {
            // Get authenticated user from token
            $authPayload = $request->getParam('auth_payload');
        
            if (!$authPayload || !isset($authPayload->sub)) {
                throw new ValidationException('Invalid authentication token');
            }
        
            $userId = (int)$authPayload->sub;
            
            // Get address ID from URL parameters
            $addressId = (int)$request->getParam('id');
            
            if (!$addressId) {
                throw new Exception("Address ID is required");
            }
            
            error_log("=== BACKEND DEBUG: Starting address update for address ID: " . $addressId . ", user ID: " . $userId . " ===");
        
            // Get request data
            $data = $request->getBody();
            
            error_log("=== BACKEND DEBUG: Request data ===");
            error_log("Request data: " . json_encode($data));
        
            // Check if we have any data to update
            if (empty($data)) {
                error_log("BACKEND ERROR: No data provided for update");
                throw new ValidationException("No data provided for update");
            }
        
            error_log("=== BACKEND DEBUG: Calling service layer ===");
        
            // Update address
            $address = $this->addressService->updateAddress($addressId, $data, $userId);
        
            error_log("=== BACKEND DEBUG: Update successful ===");
        
            // Return response
            return ResponseFormatter::success(
                $address,
                'Address updated successfully'
            );
        } catch (ValidationException $e) {
            error_log("BACKEND ERROR: Validation error in UpdateUserAddress: " . $e->getMessage());
            throw $e;
        } catch (NotFoundException $e) {
            error_log("BACKEND ERROR: Address not found in UpdateUserAddress: " . $e->getMessage());
            throw $e;
        } catch (Exception $e) {
            error_log("BACKEND ERROR: General error in UpdateUserAddress: " . $e->getMessage());
            throw new Exception('Failed to update address: ' . $e->getMessage());
        }
    }
}
