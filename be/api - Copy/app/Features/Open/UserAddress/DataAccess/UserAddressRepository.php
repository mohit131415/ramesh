<?php

namespace App\Features\Open\UserAddress\DataAccess;

use App\Core\Database;
use App\Shared\Exceptions\ValidationException;
use App\Shared\Exceptions\NotFoundException;
use Exception;

class UserAddressRepository
{
    private $db;

    public function __construct()
    {
        $this->db = Database::getInstance();
    }

    /**
     * Get all addresses for a user
     * 
     * @param int $userId
     * @return array
     */
    public function getAddressesByUserId(int $userId): array
    {
        try {
            $query = "
                SELECT 
                    id,
                    user_id,
                    address_type,
                    label,
                    contact_name,
                    contact_phone,
                    address_line1,
                    address_line2,
                    city,
                    state,
                    postal_code,
                    country,
                    is_default,
                    created_at,
                    updated_at
                FROM user_addresses 
                WHERE user_id = :user_id AND deleted_at IS NULL
                ORDER BY is_default DESC, created_at ASC
            ";
            
            $results = $this->db->fetchAll($query, [':user_id' => $userId]);
            
            // Format the results
            $addresses = [];
            foreach ($results as $result) {
                $addresses[] = [
                    'id' => (int)$result['id'],
                    'user_id' => (int)$result['user_id'],
                    'address_type' => $result['address_type'],
                    'label' => $result['label'],
                    'contact_name' => $result['contact_name'],
                    'contact_phone' => $result['contact_phone'],
                    'address_line1' => $result['address_line1'],
                    'address_line2' => $result['address_line2'],
                    'city' => $result['city'],
                    'state' => $result['state'],
                    'postal_code' => $result['postal_code'],
                    'country' => $result['country'],
                    'is_default' => (bool)$result['is_default'],
                    'created_at' => $result['created_at'],
                    'updated_at' => $result['updated_at']
                ];
            }
            
            return $addresses;
        } catch (Exception $e) {
            error_log("Error getting addresses by user ID: " . $e->getMessage());
            throw new Exception("Failed to retrieve addresses: " . $e->getMessage());
        }
    }

    /**
     * Get single address by ID and user ID
     * 
     * @param int $addressId
     * @param int $userId
     * @return array|null
     */
    public function getAddressById(int $addressId, int $userId): ?array
    {
        try {
            $query = "
                SELECT 
                    id,
                    user_id,
                    address_type,
                    label,
                    contact_name,
                    contact_phone,
                    address_line1,
                    address_line2,
                    city,
                    state,
                    postal_code,
                    country,
                    is_default,
                    created_at,
                    updated_at
                FROM user_addresses 
                WHERE id = :id AND user_id = :user_id AND deleted_at IS NULL
            ";
            
            $result = $this->db->fetch($query, [':id' => $addressId, ':user_id' => $userId]);
            
            if (!$result) {
                return null;
            }
            
            return [
                'id' => (int)$result['id'],
                'user_id' => (int)$result['user_id'],
                'address_type' => $result['address_type'],
                'label' => $result['label'],
                'contact_name' => $result['contact_name'],
                'contact_phone' => $result['contact_phone'],
                'address_line1' => $result['address_line1'],
                'address_line2' => $result['address_line2'],
                'city' => $result['city'],
                'state' => $result['state'],
                'postal_code' => $result['postal_code'],
                'country' => $result['country'],
                'is_default' => (bool)$result['is_default'],
                'created_at' => $result['created_at'],
                'updated_at' => $result['updated_at']
            ];
        } catch (Exception $e) {
            error_log("Error getting address by ID: " . $e->getMessage());
            throw new Exception("Failed to retrieve address: " . $e->getMessage());
        }
    }

    /**
     * Create a new address
     * 
     * @param array $data
     * @return array|null
     */
    public function createAddress(array $data): ?array
    {
        try {
            // Prepare data for insertion
            $insertData = [
                'user_id' => $data['user_id'],
                'address_type' => $data['address_type'] ?? 'other',
                'label' => $data['label'] ?? null,
                'contact_name' => $data['contact_name'] ?? null,
                'contact_phone' => $data['contact_phone'] ?? null,
                'address_line1' => $data['address_line1'],
                'address_line2' => $data['address_line2'] ?? null,
                'city' => $data['city'],
                'state' => $data['state'],
                'postal_code' => $data['postal_code'],
                'country' => $data['country'] ?? 'India',
                'is_default' => $data['is_default'] ?? false,
                'created_at' => date('Y-m-d H:i:s'),
                'updated_at' => date('Y-m-d H:i:s')
            ];
            
            // If this is set as default, unset other defaults first
            if ($insertData['is_default']) {
                $this->unsetDefaultAddresses($data['user_id']);
            }
            
            // Insert address
            $result = $this->db->insert('user_addresses', $insertData);
            
            if (!$result) {
                throw new Exception("Failed to insert address");
            }
            
            // Get the last inserted ID
            $lastIdQuery = "SELECT LAST_INSERT_ID() as id";
            $lastIdResult = $this->db->fetch($lastIdQuery);
            
            if (!$lastIdResult || !isset($lastIdResult['id'])) {
                throw new Exception("Failed to get ID of newly created address");
            }
            
            $addressId = $lastIdResult['id'];
            
            // Return the created address
            return $this->getAddressById($addressId, $data['user_id']);
        } catch (Exception $e) {
            error_log("Error in createAddress: " . $e->getMessage());
            throw new Exception("Failed to create address: " . $e->getMessage());
        }
    }

    /**
     * Update address
     * 
     * @param int $addressId
     * @param int $userId
     * @param array $data
     * @return array|null
     */
    public function updateAddress(int $addressId, int $userId, array $data): ?array
    {
        try {
            error_log("Repository updateAddress called with addressId: $addressId, userId: $userId and data: " . json_encode($data));
            
            // Check if address exists and belongs to user
            if (!$this->addressExists($addressId, $userId)) {
                throw new NotFoundException("Address not found or does not belong to user");
            }
            
            // Prepare data for update - only include fields that are provided
            $updateData = [];
            $allowedFields = ['address_type', 'label', 'contact_name', 'contact_phone', 'address_line1', 'address_line2', 'city', 'state', 'postal_code', 'country', 'is_default'];
            
            foreach ($allowedFields as $field) {
                if (array_key_exists($field, $data)) {
                    $updateData[$field] = $data[$field];
                    error_log("Adding field $field with value: " . ($data[$field] ?? 'null'));
                }
            }
            
            // Always update the updated_at timestamp
            $updateData['updated_at'] = date('Y-m-d H:i:s');
            
            error_log("Final update data: " . json_encode($updateData));
            
            if (empty($updateData) || (count($updateData) === 1 && isset($updateData['updated_at']))) {
                throw new ValidationException("No valid fields provided for update");
            }
            
            // If setting as default, unset other defaults first
            if (isset($updateData['is_default']) && $updateData['is_default']) {
                $this->unsetDefaultAddresses($userId);
            }
            
            // Build the SET clause dynamically
            $setParts = [];
            $params = [':id' => $addressId, ':user_id' => $userId];
            
            foreach ($updateData as $field => $value) {
                $setParts[] = "$field = :$field";
                $params[":$field"] = $value;
            }
            
            $setClause = implode(', ', $setParts);
            $query = "UPDATE user_addresses SET $setClause WHERE id = :id AND user_id = :user_id AND deleted_at IS NULL";
            
            error_log("Update query: $query");
            error_log("Update params: " . json_encode($params));
            
            // Execute update
            $result = $this->db->query($query, $params);
            
            if (!$result) {
                throw new Exception("Failed to execute update query");
            }
            
            // Return the updated address
            $updatedAddress = $this->getAddressById($addressId, $userId);
            error_log("Updated address: " . json_encode($updatedAddress));
            
            return $updatedAddress;
        } catch (ValidationException $e) {
            error_log("Validation error in updateAddress: " . $e->getMessage());
            throw $e;
        } catch (NotFoundException $e) {
            error_log("Address not found in updateAddress: " . $e->getMessage());
            throw $e;
        } catch (Exception $e) {
            error_log("Error in updateAddress: " . $e->getMessage());
            throw new Exception("Failed to update address: " . $e->getMessage());
        }
    }

    /**
     * Hard delete address
     * 
     * @param int $addressId
     * @param int $userId
     * @return bool
     */
    public function deleteAddress(int $addressId, int $userId): bool
    {
        try {
            // Check if address exists and belongs to user
            if (!$this->addressExists($addressId, $userId)) {
                throw new NotFoundException("Address not found or does not belong to user");
            }
            
            $query = "DELETE FROM user_addresses WHERE id = :id AND user_id = :user_id";
            $this->db->query($query, [':id' => $addressId, ':user_id' => $userId]);
            
            return true;
        } catch (Exception $e) {
            error_log("Error deleting address: " . $e->getMessage());
            throw new Exception("Failed to delete address: " . $e->getMessage());
        }
    }

    /**
     * Check if address exists and belongs to user
     * 
     * @param int $addressId
     * @param int $userId
     * @return bool
     */
    public function addressExists(int $addressId, int $userId): bool
    {
        try {
            $query = "SELECT id FROM user_addresses WHERE id = :id AND user_id = :user_id AND deleted_at IS NULL";
            $result = $this->db->fetch($query, [':id' => $addressId, ':user_id' => $userId]);
            
            return !empty($result);
        } catch (Exception $e) {
            error_log("Error in addressExists: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Count addresses for a user
     * 
     * @param int $userId
     * @return int
     */
    public function countUserAddresses(int $userId): int
    {
        try {
            $query = "SELECT COUNT(*) as count FROM user_addresses WHERE user_id = :user_id AND deleted_at IS NULL";
            $result = $this->db->fetch($query, [':user_id' => $userId]);
            
            return (int)($result['count'] ?? 0);
        } catch (Exception $e) {
            error_log("Error counting user addresses: " . $e->getMessage());
            return 0;
        }
    }

    /**
     * Get maximum addresses allowed per user from settings
     * 
     * @return int
     */
    public function getMaxAddressesPerUser(): int
    {
        try {
            $query = "SELECT value FROM settings WHERE `key` = 'max_addresses_per_user'";
            $result = $this->db->fetch($query);
            
            return (int)($result['value'] ?? 5); // Default to 5 if not found
        } catch (Exception $e) {
            error_log("Error getting max addresses setting: " . $e->getMessage());
            return 5; // Default fallback
        }
    }

    /**
     * Unset all default addresses for a user
     * 
     * @param int $userId
     * @return bool
     */
    private function unsetDefaultAddresses(int $userId): bool
    {
        try {
            $query = "UPDATE user_addresses SET is_default = 0 WHERE user_id = :user_id AND deleted_at IS NULL";
            $this->db->query($query, [':user_id' => $userId]);
            
            return true;
        } catch (Exception $e) {
            error_log("Error unsetting default addresses: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Check if user has any addresses
     * 
     * @param int $userId
     * @return bool
     */
    public function userHasAddresses(int $userId): bool
    {
        return $this->countUserAddresses($userId) > 0;
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
            $query = "
                SELECT 
                    id,
                    user_id,
                    address_type,
                    label,
                    contact_name,
                    contact_phone,
                    address_line1,
                    address_line2,
                    city,
                    state,
                    postal_code,
                    country,
                    is_default,
                    created_at,
                    updated_at
                FROM user_addresses 
                WHERE user_id = :user_id AND is_default = 1 AND deleted_at IS NULL
                LIMIT 1
            ";
            
            $result = $this->db->fetch($query, [':user_id' => $userId]);
            
            if (!$result) {
                return null;
            }
            
            return [
                'id' => (int)$result['id'],
                'user_id' => (int)$result['user_id'],
                'address_type' => $result['address_type'],
                'label' => $result['label'],
                'contact_name' => $result['contact_name'],
                'contact_phone' => $result['contact_phone'],
                'address_line1' => $result['address_line1'],
                'address_line2' => $result['address_line2'],
                'city' => $result['city'],
                'state' => $result['state'],
                'postal_code' => $result['postal_code'],
                'country' => $result['country'],
                'is_default' => (bool)$result['is_default'],
                'created_at' => $result['created_at'],
                'updated_at' => $result['updated_at']
            ];
        } catch (Exception $e) {
            error_log("Error getting default address: " . $e->getMessage());
            return null;
        }
    }
}
