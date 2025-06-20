<?php

namespace App\Features\Open\UserAddress\Services;

use App\Features\Open\UserAddress\DataAccess\UserAddressRepository;
use App\Shared\Exceptions\ValidationException;
use App\Shared\Exceptions\NotFoundException;
use Exception;

class UserAddressService
{
    private $addressRepository;
    
    public function __construct()
    {
        $this->addressRepository = new UserAddressRepository();
    }
    
    /**
     * Validate address data for creation
     * 
     * @param array $data
     * @return array Validated data
     */
    private function validateAddressDataForCreate(array $data): array
    {
        $errors = [];
        $validatedData = [];
        
        // Set user_id
        $validatedData['user_id'] = $data['user_id'];
        
        // Validate address_type
        if (isset($data['address_type'])) {
            $validTypes = ['home', 'work', 'other'];
            if (!in_array($data['address_type'], $validTypes)) {
                $errors['address_type'] = 'Address type must be one of: ' . implode(', ', $validTypes);
            } else {
                $validatedData['address_type'] = $data['address_type'];
            }
        } else {
            $validatedData['address_type'] = 'other';
        }
        
        // Validate label (optional)
        if (isset($data['label']) && !empty($data['label'])) {
            if (strlen($data['label']) > 100) {
                $errors['label'] = 'Label cannot exceed 100 characters';
            } else {
                $validatedData['label'] = trim($data['label']);
            }
        } else {
            $validatedData['label'] = null;
        }
        
        // Validate contact_name (optional)
        if (isset($data['contact_name']) && !empty($data['contact_name'])) {
            if (strlen($data['contact_name']) > 150) {
                $errors['contact_name'] = 'Contact name cannot exceed 150 characters';
            } else {
                $validatedData['contact_name'] = trim($data['contact_name']);
            }
        } else {
            $validatedData['contact_name'] = null;
        }
        
        // Validate contact_phone (optional)
        if (isset($data['contact_phone']) && !empty($data['contact_phone'])) {
            if (strlen($data['contact_phone']) > 20) {
                $errors['contact_phone'] = 'Contact phone cannot exceed 20 characters';
            } else {
                $validatedData['contact_phone'] = trim($data['contact_phone']);
            }
        } else {
            $validatedData['contact_phone'] = null;
        }
        
        // Validate address_line1 (required)
        if (empty($data['address_line1'])) {
            $errors['address_line1'] = 'Address line 1 is required';
        } elseif (strlen($data['address_line1']) > 255) {
            $errors['address_line1'] = 'Address line 1 cannot exceed 255 characters';
        } else {
            $validatedData['address_line1'] = trim($data['address_line1']);
        }
        
        // Validate address_line2 (optional)
        if (isset($data['address_line2']) && !empty($data['address_line2'])) {
            if (strlen($data['address_line2']) > 255) {
                $errors['address_line2'] = 'Address line 2 cannot exceed 255 characters';
            } else {
                $validatedData['address_line2'] = trim($data['address_line2']);
            }
        } else {
            $validatedData['address_line2'] = null;
        }
        
        // Validate city (required)
        if (empty($data['city'])) {
            $errors['city'] = 'City is required';
        } elseif (strlen($data['city']) > 100) {
            $errors['city'] = 'City cannot exceed 100 characters';
        } else {
            $validatedData['city'] = trim($data['city']);
        }
        
        // Validate state (required)
        if (empty($data['state'])) {
            $errors['state'] = 'State is required';
        } elseif (strlen($data['state']) > 100) {
            $errors['state'] = 'State cannot exceed 100 characters';
        } else {
            $validatedData['state'] = trim($data['state']);
        }
        
        // Validate postal_code (required)
        if (empty($data['postal_code'])) {
            $errors['postal_code'] = 'Postal code is required';
        } elseif (strlen($data['postal_code']) > 20) {
            $errors['postal_code'] = 'Postal code cannot exceed 20 characters';
        } else {
            $validatedData['postal_code'] = trim($data['postal_code']);
        }
        
        // Validate country (optional, defaults to India)
        if (isset($data['country']) && !empty($data['country'])) {
            if (strlen($data['country']) > 100) {
                $errors['country'] = 'Country cannot exceed 100 characters';
            } else {
                $validatedData['country'] = trim($data['country']);
            }
        } else {
            $validatedData['country'] = 'India';
        }
        
        // Validate is_default (optional, defaults to false)
        if (isset($data['is_default'])) {
            $validatedData['is_default'] = (bool)$data['is_default'];
        } else {
            $validatedData['is_default'] = false;
        }
        
        // If there are validation errors, throw an exception
        if (!empty($errors)) {
            throw new ValidationException('Validation failed', $errors);
        }
        
        return $validatedData;
    }
    
    /**
     * Validate address data for update - more lenient, only validates provided fields
     * 
     * @param array $data
     * @return array Validated data
     */
    private function validateAddressDataForUpdate(array $data): array
    {
        $errors = [];
        $validatedData = [];
        
        error_log("Validating update data: " . json_encode($data));
        
        // Only validate and include fields that are actually provided
        foreach ($data as $key => $value) {
            error_log("Processing field: $key with value: " . ($value ?? 'null'));
            
            switch ($key) {
                case 'address_type':
                    $validTypes = ['home', 'work', 'other'];
                    if (!in_array($value, $validTypes)) {
                        $errors['address_type'] = 'Address type must be one of: ' . implode(', ', $validTypes);
                    } else {
                        $validatedData['address_type'] = $value;
                    }
                    break;
                    
                case 'label':
                    if ($value !== null && $value !== '') {
                        if (strlen($value) > 100) {
                            $errors['label'] = 'Label cannot exceed 100 characters';
                        } else {
                            $validatedData['label'] = trim($value);
                        }
                    } else {
                        $validatedData['label'] = null;
                    }
                    break;
                    
                case 'contact_name':
                    if ($value !== null && $value !== '') {
                        if (strlen($value) > 150) {
                            $errors['contact_name'] = 'Contact name cannot exceed 150 characters';
                        } else {
                            $validatedData['contact_name'] = trim($value);
                        }
                    } else {
                        $validatedData['contact_name'] = null;
                    }
                    break;
                    
                case 'contact_phone':
                    if ($value !== null && $value !== '') {
                        if (strlen($value) > 20) {
                            $errors['contact_phone'] = 'Contact phone cannot exceed 20 characters';
                        } else {
                            $validatedData['contact_phone'] = trim($value);
                        }
                    } else {
                        $validatedData['contact_phone'] = null;
                    }
                    break;
                    
                case 'address_line1':
                    if (empty($value)) {
                        $errors['address_line1'] = 'Address line 1 is required';
                    } elseif (strlen($value) > 255) {
                        $errors['address_line1'] = 'Address line 1 cannot exceed 255 characters';
                    } else {
                        $validatedData['address_line1'] = trim($value);
                    }
                    break;
                    
                case 'address_line2':
                    if ($value !== null && $value !== '') {
                        if (strlen($value) > 255) {
                            $errors['address_line2'] = 'Address line 2 cannot exceed 255 characters';
                        } else {
                            $validatedData['address_line2'] = trim($value);
                        }
                    } else {
                        $validatedData['address_line2'] = null;
                    }
                    break;
                    
                case 'city':
                    if (empty($value)) {
                        $errors['city'] = 'City is required';
                    } elseif (strlen($value) > 100) {
                        $errors['city'] = 'City cannot exceed 100 characters';
                    } else {
                        $validatedData['city'] = trim($value);
                    }
                    break;
                    
                case 'state':
                    if (empty($value)) {
                        $errors['state'] = 'State is required';
                    } elseif (strlen($value) > 100) {
                        $errors['state'] = 'State cannot exceed 100 characters';
                    } else {
                        $validatedData['state'] = trim($value);
                    }
                    break;
                    
                case 'postal_code':
                    if (empty($value)) {
                        $errors['postal_code'] = 'Postal code is required';
                    } elseif (strlen($value) > 20) {
                        $errors['postal_code'] = 'Postal code cannot exceed 20 characters';
                    } else {
                        $validatedData['postal_code'] = trim($value);
                    }
                    break;
                    
                case 'country':
                    if ($value !== null && $value !== '') {
                        if (strlen($value) > 100) {
                            $errors['country'] = 'Country cannot exceed 100 characters';
                        } else {
                            $validatedData['country'] = trim($value);
                        }
                    } else {
                        $validatedData['country'] = 'India';
                    }
                    break;
                    
                case 'is_default':
                    $validatedData['is_default'] = (bool)$value;
                    break;
            }
        }
        
        error_log("Validated update data: " . json_encode($validatedData));
        
        // If there are validation errors, throw an exception
        if (!empty($errors)) {
            throw new ValidationException('Validation failed', $errors);
        }
        
        return $validatedData;
    }
    
    /**
     * Create a new user address
     * 
     * @param array $data
     * @param int $userId
     * @return array
     */
    public function createAddress(array $data, int $userId): array
    {
        try {
            // Set user ID
            $data['user_id'] = $userId;
            
            // Check address limit
            $currentCount = $this->addressRepository->countUserAddresses($userId);
            $maxAddresses = $this->addressRepository->getMaxAddressesPerUser();
            
            if ($currentCount >= $maxAddresses) {
                throw new ValidationException("Maximum number of addresses ($maxAddresses) reached for this user");
            }
            
            // Validate data
            $validatedData = $this->validateAddressDataForCreate($data);
            
            // If this is the first address, make it default automatically
            if (!$this->addressRepository->userHasAddresses($userId)) {
                $validatedData['is_default'] = true;
            }
            
            // Create address
            $address = $this->addressRepository->createAddress($validatedData);
            
            if (!$address) {
                throw new Exception("Failed to create address");
            }
            
            return $address;
        } catch (ValidationException $e) {
            throw $e;
        } catch (Exception $e) {
            error_log("Error in createAddress service: " . $e->getMessage());
            throw new Exception("Failed to create address: " . $e->getMessage());
        }
    }
    
    /**
     * Get all user addresses
     * 
     * @param int $userId
     * @return array
     */
    public function getUserAddresses(int $userId): array
    {
        try {
            $addresses = $this->addressRepository->getAddressesByUserId($userId);
            
            // Get address limits info
            $currentCount = count($addresses);
            $maxAddresses = $this->addressRepository->getMaxAddressesPerUser();
            
            return [
                'addresses' => $addresses,
                'meta' => [
                    'total_addresses' => $currentCount,
                    'max_addresses' => $maxAddresses,
                    'can_add_more' => $currentCount < $maxAddresses
                ]
            ];
        } catch (Exception $e) {
            error_log("Error in getUserAddresses service: " . $e->getMessage());
            throw new Exception("Failed to retrieve addresses: " . $e->getMessage());
        }
    }
    
    /**
     * Get single user address
     * 
     * @param int $addressId
     * @param int $userId
     * @return array
     */
    public function getAddress(int $addressId, int $userId): array
    {
        try {
            $address = $this->addressRepository->getAddressById($addressId, $userId);
            
            if (!$address) {
                throw new NotFoundException("Address not found");
            }
            
            return $address;
        } catch (NotFoundException $e) {
            throw $e;
        } catch (Exception $e) {
            error_log("Error in getAddress service: " . $e->getMessage());
            throw new Exception("Failed to retrieve address: " . $e->getMessage());
        }
    }
    
    /**
     * Update user address
     * 
     * @param int $addressId
     * @param array $data
     * @param int $userId
     * @return array
     */
    public function updateAddress(int $addressId, array $data, int $userId): array
    {
        try {
            error_log("UpdateAddress service called with addressId: $addressId, data: " . json_encode($data));
            
            // Validate data - only validate fields that are provided
            $validatedData = $this->validateAddressDataForUpdate($data);
            
            error_log("Service validated data: " . json_encode($validatedData));
            
            // Check if we have any data to update
            if (empty($validatedData)) {
                error_log("No validated data found for update");
                throw new ValidationException("No valid data provided for update");
            }
            
            // Update address
            $address = $this->addressRepository->updateAddress($addressId, $userId, $validatedData);
            
            if (!$address) {
                throw new Exception("Failed to update address");
            }
            
            error_log("Address updated successfully");
            return $address;
        } catch (ValidationException $e) {
            error_log("Validation error in updateAddress: " . $e->getMessage());
            throw $e;
        } catch (NotFoundException $e) {
            error_log("Address not found in updateAddress: " . $e->getMessage());
            throw $e;
        } catch (Exception $e) {
            error_log("Error in updateAddress service: " . $e->getMessage());
            throw new Exception("Failed to update address: " . $e->getMessage());
        }
    }
    
    /**
     * Delete user address
     * 
     * @param int $addressId
     * @param int $userId
     * @return bool
     */
    public function deleteAddress(int $addressId, int $userId): bool
    {
        try {
            // Check if address exists
            $address = $this->addressRepository->getAddressById($addressId, $userId);
            if (!$address) {
                throw new NotFoundException("Address not found");
            }
            
            // If this is the default address and there are other addresses, 
            // we should set another address as default
            if ($address['is_default']) {
                $allAddresses = $this->addressRepository->getAddressesByUserId($userId);
                if (count($allAddresses) > 1) {
                    // Find the next address to make default (oldest non-default address)
                    foreach ($allAddresses as $addr) {
                        if ($addr['id'] !== $addressId) {
                            $this->addressRepository->updateAddress($addr['id'], $userId, ['is_default' => true]);
                            break;
                        }
                    }
                }
            }
            
            return $this->addressRepository->deleteAddress($addressId, $userId);
        } catch (NotFoundException $e) {
            throw $e;
        } catch (Exception $e) {
            error_log("Error in deleteAddress service: " . $e->getMessage());
            throw new Exception("Failed to delete address: " . $e->getMessage());
        }
    }
    
    /**
     * Get default address for user
     * 
     * @param int $userId
     * @return array|null
     */
    public function getDefaultAddress(int $userId): ?array
    {
        try {
            return $this->addressRepository->getDefaultAddress($userId);
        } catch (Exception $e) {
            error_log("Error in getDefaultAddress service: " . $e->getMessage());
            throw new Exception("Failed to get default address: " . $e->getMessage());
        }
    }
    
    /**
     * Get address limits and current count
     * 
     * @param int $userId
     * @return array
     */
    public function getAddressLimits(int $userId): array
    {
        try {
            $currentCount = $this->addressRepository->countUserAddresses($userId);
            $maxAddresses = $this->addressRepository->getMaxAddressesPerUser();
            
            return [
                'current_count' => $currentCount,
                'max_addresses' => $maxAddresses,
                'can_add_more' => $currentCount < $maxAddresses,
                'remaining_slots' => max(0, $maxAddresses - $currentCount)
            ];
        } catch (Exception $e) {
            error_log("Error in getAddressLimits service: " . $e->getMessage());
            throw new Exception("Failed to get address limits: " . $e->getMessage());
        }
    }
}
