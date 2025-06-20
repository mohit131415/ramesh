<?php

namespace App\Features\Open\UserProfile\DataAccess;

use App\Core\Database;
use App\Shared\Exceptions\ValidationException;
use App\Shared\Exceptions\NotFoundException;
use Exception;

class UserProfileRepository
{
    private $db;

    public function __construct()
    {
        $this->db = Database::getInstance();
    }

    /**
     * Get profile by user ID
     * 
     * @param int $userId
     * @return array|null
     */
    public function getProfileByUserId(int $userId): ?array
    {
        try {
            $query = "
                SELECT 
                    up.id,
                    up.user_id,
                    up.first_name,
                    up.last_name,
                    up.gender,
                    up.email,
                    up.date_of_birth,
                    up.profile_picture,
                    up.created_at,
                    up.updated_at,
                    u.phone_number,
                    u.status as user_status,
                    u.last_login_at
                FROM user_profiles up
                INNER JOIN users u ON up.user_id = u.id
                WHERE up.user_id = :user_id AND up.deleted_at IS NULL
            ";
            
            $result = $this->db->fetch($query, [':user_id' => $userId]);
            
            if (!$result) {
                error_log("No profile found for user ID: " . $userId);
                return null;
            }
            
            // Add full URL to profile picture if it exists
            
            
            // Format the response
            return [
                'id' => (int)$result['id'],
                'user_id' => (int)$result['user_id'],
                'first_name' => $result['first_name'],
                'last_name' => $result['last_name'],
                'gender' => $result['gender'],
                'email' => $result['email'],
                'date_of_birth' => $result['date_of_birth'],
                'profile_picture' => $result['profile_picture'],
                'phone_number' => $result['phone_number'],
                'user_status' => $result['user_status'],
                'last_login_at' => $result['last_login_at'],
                'created_at' => $result['created_at'],
                'updated_at' => $result['updated_at']
            ];
        } catch (Exception $e) {
            error_log("Error getting profile by user ID: " . $e->getMessage());
            throw new Exception("Failed to retrieve profile: " . $e->getMessage());
        }
    }

    /**
     * Create a new profile
     * 
     * @param array $data
     * @return array|null
     */
    public function createProfile(array $data): ?array
    {
        try {
            // Check if profile already exists
            if ($this->profileExists($data['user_id'])) {
                throw new ValidationException("Profile already exists for this user");
            }
            
            // Check if email is unique (if provided)
            if (!empty($data['email']) && $this->emailExists($data['email'])) {
                throw new ValidationException("Email is already in use");
            }
            
            // Prepare data for insertion
            $insertData = [
                'user_id' => $data['user_id'],
                'first_name' => $data['first_name'] ?? null,
                'last_name' => $data['last_name'] ?? null,
                'gender' => $data['gender'] ?? null,
                'email' => $data['email'] ?? null,
                'date_of_birth' => $data['date_of_birth'] ?? null,
                'profile_picture' => $data['profile_picture'] ?? null,
                'created_at' => date('Y-m-d H:i:s'),
                'updated_at' => date('Y-m-d H:i:s')
            ];
            
            // Insert profile
            $result = $this->db->insert('user_profiles', $insertData);
            
            if (!$result) {
                throw new Exception("Failed to insert profile");
            }
            
            // Get the last inserted ID using a separate query
            $lastIdQuery = "SELECT LAST_INSERT_ID() as id";
            $lastIdResult = $this->db->fetch($lastIdQuery);
            
            if (!$lastIdResult || !isset($lastIdResult['id'])) {
                throw new Exception("Failed to get ID of newly created profile");
            }
            
            $profileId = $lastIdResult['id'];
            
            // Return the created profile
            return $this->getProfileById($profileId);
        } catch (ValidationException $e) {
            throw $e;
        } catch (Exception $e) {
            error_log("Error in createProfile: " . $e->getMessage());
            throw new Exception("Failed to create profile: " . $e->getMessage());
        }
    }

    /**
     * Update profile
     * 
     * @param int $userId
     * @param array $data
     * @return array|null
     */
    public function updateProfile(int $userId, array $data): ?array
    {
        try {
            error_log("Repository updateProfile called with userId: $userId and data: " . json_encode($data));
            
            // Check if profile exists
            if (!$this->profileExists($userId)) {
                throw new ValidationException("Profile does not exist for this user");
            }
            
            // Check if email is unique (if provided and changed)
            if (!empty($data['email']) && $this->emailExists($data['email'], $userId)) {
                throw new ValidationException("Email is already in use");
            }
            
            // Prepare data for update - only include fields that are provided
            $updateData = [];
            $allowedFields = ['first_name', 'last_name', 'gender', 'email', 'date_of_birth', 'profile_picture'];
            
            foreach ($allowedFields as $field) {
                if (array_key_exists($field, $data)) {
                    $updateData[$field] = $data[$field];
                    error_log("Adding field $field with value: " . ($data[$field] ?? 'null'));
                }
            }
            
            // Always update the updated_at timestamp
            $updateData['updated_at'] = date('Y-m-d H:i:s');
            
            error_log("Final update data: " . json_encode($updateData));
            
            // Remove the check that prevents updates when only updated_at is present
            // This allows the update to proceed even if values are the same
            if (empty($updateData)) {
                throw new ValidationException("No valid fields provided for update");
            }
            
            // Build the SET clause dynamically
            $setParts = [];
            $params = [':user_id' => $userId];
            
            foreach ($updateData as $field => $value) {
                $setParts[] = "$field = :$field";
                $params[":$field"] = $value;
            }
            
            $setClause = implode(', ', $setParts);
            $query = "UPDATE user_profiles SET $setClause WHERE user_id = :user_id AND deleted_at IS NULL";
            
            error_log("Update query: $query");
            error_log("Update params: " . json_encode($params));
            
            // Execute update
            $result = $this->db->query($query, $params);
            
            if (!$result) {
                throw new Exception("Failed to execute update query");
            }
            
            // Return the updated profile
            $updatedProfile = $this->getProfileByUserId($userId);
            error_log("Updated profile: " . json_encode($updatedProfile));
            
            return $updatedProfile;
        } catch (ValidationException $e) {
            error_log("Validation error in updateProfile: " . $e->getMessage());
            throw $e;
        } catch (Exception $e) {
            error_log("Error in updateProfile: " . $e->getMessage());
            throw new Exception("Failed to update profile: " . $e->getMessage());
        }
    }

    /**
     * Check if profile exists for user
     * 
     * @param int $userId
     * @return bool
     */
    public function profileExists(int $userId): bool
    {
        try {
            $query = "SELECT id FROM user_profiles WHERE user_id = :user_id AND deleted_at IS NULL";
            $result = $this->db->fetch($query, [':user_id' => $userId]);
            
            return !empty($result);
        } catch (Exception $e) {
            error_log("Error in profileExists: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Check if email already exists (for another user)
     * 
     * @param string $email
     * @param int|null $excludeUserId
     * @return bool
     */
    public function emailExists(string $email, ?int $excludeUserId = null): bool
    {
        try {
            $params = [':email' => $email];
            $query = "SELECT id FROM user_profiles WHERE email = :email AND deleted_at IS NULL";
            
            if ($excludeUserId) {
                $query .= " AND user_id != :exclude_user_id";
                $params[':exclude_user_id'] = $excludeUserId;
            }
            
            $result = $this->db->fetch($query, $params);
            
            return !empty($result);
        } catch (Exception $e) {
            error_log("Error in emailExists: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Get profile by ID
     * 
     * @param int $profileId
     * @return array|null
     */
    private function getProfileById(int $profileId): ?array
    {
        try {
            $query = "
                SELECT 
                    up.id,
                    up.user_id,
                    up.first_name,
                    up.last_name,
                    up.gender,
                    up.email,
                    up.date_of_birth,
                    up.profile_picture,
                    up.created_at,
                    up.updated_at,
                    u.phone_number,
                    u.status as user_status,
                    u.last_login_at
                FROM user_profiles up
                INNER JOIN users u ON up.user_id = u.id
                WHERE up.id = :id AND up.deleted_at IS NULL
            ";
            
            $result = $this->db->fetch($query, [':id' => $profileId]);
            
            if (!$result) {
                return null;
            }
            
            // Add full URL to profile picture if it exists
            
            
            // Format the response
            return [
                'id' => (int)$result['id'],
                'user_id' => (int)$result['user_id'],
                'first_name' => $result['first_name'],
                'last_name' => $result['last_name'],
                'gender' => $result['gender'],
                'email' => $result['email'],
                'date_of_birth' => $result['date_of_birth'],
                'profile_picture' => $result['profile_picture'],
                'phone_number' => $result['phone_number'],
                'user_status' => $result['user_status'],
                'last_login_at' => $result['last_login_at'],
                'created_at' => $result['created_at'],
                'updated_at' => $result['updated_at']
            ];
        } catch (Exception $e) {
            error_log("Error in getProfileById: " . $e->getMessage());
            return null;
        }
    }

    /**
     * Calculate profile completion percentage
     * 
     * @param int $userId
     * @return array
     */
    public function getProfileCompletionStatus(int $userId): array
    {
        try {
            // Get profile
            $profile = $this->getProfileByUserId($userId);
            
            if (!$profile) {
                return [
                    'completion_percentage' => 0,
                    'missing_fields' => [
                        'first_name', 'last_name', 'gender', 'email', 
                        'date_of_birth', 'profile_picture'
                    ],
                    'completed_fields' => []
                ];
            }
            
            // Define fields that contribute to completion
            $completionFields = [
                'first_name', 'last_name', 'gender', 'email', 
                'date_of_birth', 'profile_picture'
            ];
            
            $missingFields = [];
            $completedFields = [];
            
            // Check each field
            foreach ($completionFields as $field) {
                if (empty($profile[$field])) {
                    $missingFields[] = $field;
                } else {
                    $completedFields[] = $field;
                }
            }
            
            // Calculate percentage
            $totalFields = count($completionFields);
            $completedCount = count($completedFields);
            $completionPercentage = ($totalFields > 0) ? round(($completedCount / $totalFields) * 100) : 0;
            
            return [
                'completion_percentage' => $completionPercentage,
                'missing_fields' => $missingFields,
                'completed_fields' => $completedFields
            ];
        } catch (Exception $e) {
            error_log("Error in getProfileCompletionStatus: " . $e->getMessage());
            throw new Exception("Failed to calculate profile completion: " . $e->getMessage());
        }
    }

    /**
     * Soft delete profile
     * 
     * @param int $userId
     * @return bool
     */
    public function deleteProfile(int $userId): bool
    {
        try {
            $query = "UPDATE user_profiles SET deleted_at = NOW() WHERE user_id = :user_id";
            $this->db->query($query, [':user_id' => $userId]);
            
            return true;
        } catch (Exception $e) {
            error_log("Error deleting profile: " . $e->getMessage());
            return false;
        }
    }
}
