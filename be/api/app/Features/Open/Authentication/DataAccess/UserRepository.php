<?php

namespace App\Features\Open\Authentication\DataAccess;

use App\Core\Database;
use App\Shared\Exceptions\NotFoundException;
use Exception;

class UserRepository
{
    private $db;
    
    public function __construct()
    {
        $this->db = Database::getInstance();
    }
    
    /**
     * Check if a user exists with the given phone number
     * 
     * @param string $phoneNumber
     * @return bool
     */
    public function userExists(string $phoneNumber): bool
    {
        try {
            $query = "SELECT id FROM users WHERE phone_number = :phone_number";
            $result = $this->db->fetch($query, [':phone_number' => $phoneNumber]);
            
            return !empty($result);
        } catch (Exception $e) {
            error_log("Error in userExists: " . $e->getMessage());
            return false;
        }
    }
    
    /**
     * Get user by phone number
     * 
     * @param string $phoneNumber
     * @return array|null
     */
    public function getUserByPhoneNumber(string $phoneNumber): ?array
    {
        try {
            $query = "SELECT id, phone_number, status, created_at, last_login_at FROM users WHERE phone_number = :phone_number";
            $result = $this->db->fetch($query, [':phone_number' => $phoneNumber]);
            
            if (empty($result)) {
                return null;
            }
            
            return $result;
        } catch (Exception $e) {
            error_log("Error in getUserByPhoneNumber: " . $e->getMessage());
            return null;
        }
    }
    
    /**
     * Get user by ID with detailed information
     * 
     * @param int $userId
     * @return array|null
     */
    public function getUserById(int $userId): ?array
    {
        try {
            // Simplified query to match the actual table structure
            $query = "SELECT id, phone_number, status, created_at, last_login_at FROM users WHERE id = :id";
            error_log("getUserById query: " . $query . " with id: " . $userId);
            
            $result = $this->db->fetch($query, [':id' => $userId]);
            
            // Log the result for debugging
            error_log("getUserById result: " . json_encode($result));
            
            if (empty($result)) {
                // Direct database query as a fallback
                error_log("Trying direct database query as fallback");
                $directResult = $this->db->fetchAll("SELECT * FROM users WHERE id = {$userId}");
                error_log("Direct query result: " . json_encode($directResult));
                
                if (!empty($directResult) && isset($directResult[0])) {
                    return $directResult[0];
                }
                
                return null;
            }
            
            return $result;
        } catch (Exception $e) {
            error_log("Error in getUserById: " . $e->getMessage() . "\nTrace: " . $e->getTraceAsString());
            
            // Try a direct query as a last resort
            try {
                $directResult = $this->db->fetchAll("SELECT * FROM users WHERE id = {$userId}");
                if (!empty($directResult) && isset($directResult[0])) {
                    return $directResult[0];
                }
            } catch (Exception $innerEx) {
                error_log("Error in direct query fallback: " . $innerEx->getMessage());
            }
            
            return null;
        }
    }
    
    /**
     * Create a new user
     * 
     * @param string $phoneNumber
     * @return int|null User ID if successful, null otherwise
     */
    public function createUser(string $phoneNumber): ?int
    {
        try {
            // Check if user already exists to avoid duplicates
            if ($this->userExists($phoneNumber)) {
                $user = $this->getUserByPhoneNumber($phoneNumber);
                error_log("User already exists with phone number {$phoneNumber}, returning existing ID: {$user['id']}");
                return $user['id'];
            }
            
            $query = "INSERT INTO users (phone_number, status) VALUES (:phone_number, 'active')";
            $this->db->query($query, [':phone_number' => $phoneNumber]);
            
            // Get the last inserted ID
            $lastIdQuery = "SELECT LAST_INSERT_ID() as id";
            $result = $this->db->fetch($lastIdQuery);
            
            $userId = $result['id'] ?? null;
            
            if ($userId) {
                error_log("Created new user with ID: {$userId} for phone number: {$phoneNumber}");
            } else {
                error_log("Failed to get ID for newly created user with phone number: {$phoneNumber}");
            }
            
            return $userId;
        } catch (Exception $e) {
            error_log("Error in createUser: " . $e->getMessage());
            error_log("Stack trace: " . $e->getTraceAsString());
            return null;
        }
    }
    
    /**
     * Update user's last login timestamp
     * 
     * @param int $userId
     * @return bool
     */
    public function updateLastLogin(int $userId): bool
    {
        try {
            $query = "UPDATE users SET last_login_at = NOW() WHERE id = :id";
            $this->db->query($query, [':id' => $userId]);
            
            return true;
        } catch (Exception $e) {
            error_log("Error in updateLastLogin: " . $e->getMessage());
            return false;
        }
    }
    
    /**
     * Update user's status
     * 
     * @param int $userId
     * @param string $status
     * @return bool
     */
    public function updateUserStatus(int $userId, string $status): bool
    {
        try {
            // Validate status
            $validStatuses = ['active', 'inactive', 'suspended', 'deleted'];
            if (!in_array($status, $validStatuses)) {
                error_log("Invalid status '{$status}' provided for user ID: {$userId}");
                return false;
            }
            
            $query = "UPDATE users SET status = :status, updated_at = NOW() WHERE id = :id";
            $params = [
                ':id' => $userId,
                ':status' => $status
            ];
            
            $this->db->query($query, $params);
            
            error_log("Updated status to '{$status}' for user ID: {$userId}");
            return true;
        } catch (Exception $e) {
            error_log("Error in updateUserStatus: " . $e->getMessage());
            error_log("Stack trace: " . $e->getTraceAsString());
            return false;
        }
    }
    
    /**
     * Get all users (for debugging)
     * 
     * @return array
     */
    public function getAllUsers(): array
    {
        try {
            $query = "SELECT id, phone_number, status, created_at, last_login_at FROM users LIMIT 10";
            $result = $this->db->fetchAll($query);
            
            return $result ?: [];
        } catch (Exception $e) {
            error_log("Error in getAllUsers: " . $e->getMessage());
            return [];
        }
    }
}
