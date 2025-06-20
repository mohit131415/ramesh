<?php

namespace App\Features\AdminManagement\DataAccess;

use App\Core\Database;
use App\Shared\Exceptions\NotFoundException;
use App\Shared\Exceptions\ValidationException;
use Exception;

class AdminRepository
{
    private $database;

    public function __construct()
    {
        $this->database = Database::getInstance();
    }

    /**
     * Get all admins with pagination
     *
     * @param int $page Page number
     * @param int $limit Items per page
     * @param array $filters Optional filters
     * @return array Admins and pagination metadata
     */
    public function getAllAdmins($page = 1, $limit = 10, $filters = [])
    {
        try {
            $offset = ($page - 1) * $limit;
            $whereConditions = ['a.deleted_at IS NULL'];
            $params = [];

            // Apply filters if provided
            if (!empty($filters['search'])) {
                $whereConditions[] = "(a.username LIKE :search OR a.email LIKE :search OR a.first_name LIKE :search OR a.last_name LIKE :search)";
                $params[':search'] = '%' . $filters['search'] . '%';
            }

            if (!empty($filters['role'])) {
                $whereConditions[] = "a.role = :role";
                $params[':role'] = $filters['role'];
            }

            if (!empty($filters['status'])) {
                $whereConditions[] = "a.status = :status";
                $params[':status'] = $filters['status'];
            }

            // Build WHERE clause
            $whereClause = implode(' AND ', $whereConditions);

            // Get total count for pagination
            $countSql = "SELECT COUNT(*) as total FROM admins a WHERE $whereClause";
            $countResult = $this->database->fetch($countSql, $params);
            $total = $countResult['total'] ?? 0;

            // Get admins with pagination
            $sql = "SELECT 
                        a.id, a.username, a.email, a.first_name, a.last_name, 
                        a.phone, a.profile_image, a.role, a.status, a.last_login_at,
                        a.created_at, a.updated_at,
                        CONCAT(c.first_name, ' ', c.last_name) as created_by_name
                    FROM admins a
                    LEFT JOIN admins c ON a.created_by = c.id
                    WHERE $whereClause
                    ORDER BY a.id DESC
                    LIMIT :limit OFFSET :offset";

            $params[':limit'] = $limit;
            $params[':offset'] = $offset;

            $admins = $this->database->fetchAll($sql, $params);

            // Process admins data
            foreach ($admins as &$admin) {
                // Add profile image URL if exists
                if (!empty($admin['profile_image'])) {
                    $admin['profile_image_url'] = $this->getProfileImageUrl($admin['profile_image']);
                }
                
                // Remove sensitive data
                unset($admin['password']);
            }

            return [
                'data' => $admins,
                'meta' => [
                    'current_page' => $page,
                    'per_page' => $limit,
                    'total' => $total,
                    'total_pages' => ceil($total / $limit)
                ]
            ];
        } catch (Exception $e) {
            throw new Exception('Error retrieving admins: ' . $e->getMessage());
        }
    }

    /**
     * Get admin by ID
     *
     * @param int $id Admin ID
     * @return array Admin data
     * @throws NotFoundException
     */
    public function getAdminById($id)
    {
        try {
            $sql = "SELECT 
                        a.id, a.username, a.email, a.first_name, a.last_name, 
                        a.phone, a.profile_image, a.role, a.status, a.last_login_at,
                        a.created_at, a.updated_at,
                        CONCAT(c.first_name, ' ', c.last_name) as created_by_name
                    FROM admins a
                    LEFT JOIN admins c ON a.created_by = c.id
                    WHERE a.id = :id AND a.deleted_at IS NULL";
            
            $admin = $this->database->fetch($sql, [':id' => $id]);
            
            if (!$admin) {
                throw new NotFoundException('Admin not found');
            }
            
            // Add profile image URL if exists
            if (!empty($admin['profile_image'])) {
                $admin['profile_image_url'] = $this->getProfileImageUrl($admin['profile_image']);
            }
            
            // Remove sensitive data
            unset($admin['password']);
            
            return $admin;
        } catch (NotFoundException $e) {
            throw $e;
        } catch (Exception $e) {
            throw new Exception('Error retrieving admin: ' . $e->getMessage());
        }
    }

    /**
     * Create a new admin
     *
     * @param array $data Admin data
     * @return array Created admin data
     * @throws ValidationException
     */
    public function createAdmin($data)
    {
        try {
            // Check if username or email already exists
            $this->checkDuplicateUsernameOrEmail($data['username'], $data['email']);
            
            // Hash password
            $data['password'] = password_hash($data['password'], PASSWORD_BCRYPT, ['cost' => 12]);
            
            // Set created_at and updated_at
            $data['created_at'] = date('Y-m-d H:i:s');
            $data['updated_at'] = date('Y-m-d H:i:s');
            
            // Insert admin
            $adminId = $this->database->insert('admins', $data);
            
            if (!$adminId) {
                throw new Exception('Failed to create admin');
            }
            
            // Return created admin
            return $this->getAdminById($adminId);
        } catch (ValidationException $e) {
            throw $e;
        } catch (Exception $e) {
            throw new Exception('Error creating admin: ' . $e->getMessage());
        }
    }

    /**
     * Update an admin
     *
     * @param int $id Admin ID
     * @param array $data Admin data
     * @return array Updated admin data
     * @throws NotFoundException
     * @throws ValidationException
     */
    public function updateAdmin($id, $data)
    {
        try {
            // Check if admin exists
            $admin = $this->getAdminById($id);
            
            // Debug log to check what data is being received by the repository
            error_log('AdminRepository updateAdmin data: ' . json_encode($data));
            
            // Check if username or email already exists (if being updated)
            if (isset($data['username']) && $data['username'] !== $admin['username']) {
                $this->checkDuplicateUsername($data['username']);
            }
            
            if (isset($data['email']) && $data['email'] !== $admin['email']) {
                $this->checkDuplicateEmail($data['email']);
            }
            
            // Hash password if provided
            if (isset($data['password']) && !empty($data['password'])) {
                $data['password'] = password_hash($data['password'], PASSWORD_BCRYPT, ['cost' => 12]);
            } else {
                // Don't update password if not provided
                unset($data['password']);
            }
            
            // Ensure status is included if provided
            if (isset($data['status'])) {
                error_log('Status to be updated: ' . $data['status']);
            }
            
            // Set updated_at
            $data['updated_at'] = date('Y-m-d H:i:s');
            
            // Update admin
            $result = $this->database->update('admins', $data, 'id = :id', [':id' => $id]);
            
            if (!$result) {
                throw new Exception('Failed to update admin');
            }
            
            // Return updated admin
            return $this->getAdminById($id);
        } catch (NotFoundException $e) {
            throw $e;
        } catch (ValidationException $e) {
            throw $e;
        } catch (Exception $e) {
            throw new Exception('Error updating admin: ' . $e->getMessage());
        }
    }

    /**
     * Delete an admin (soft delete)
     *
     * @param int $id Admin ID
     * @return bool Success status
     * @throws NotFoundException
     */
    public function deleteAdmin($id)
    {
        try {
            // Check if admin exists
            $this->getAdminById($id);
            
            // Soft delete admin
            $data = [
                'deleted_at' => date('Y-m-d H:i:s')
            ];
            
            $result = $this->database->update('admins', $data, 'id = :id', [':id' => $id]);
            
            if (!$result) {
                throw new Exception('Failed to delete admin');
            }
            
            return true;
        } catch (NotFoundException $e) {
            throw $e;
        } catch (Exception $e) {
            throw new Exception('Error deleting admin: ' . $e->getMessage());
        }
    }

    /**
     * Update admin profile image
     *
     * @param int $id Admin ID
     * @param string $imagePath Path to profile image
     * @return array Updated admin data
     * @throws NotFoundException
     */
    public function updateProfileImage($id, $imagePath)
    {
        try {
            // Check if admin exists
            $this->getAdminById($id);
            
            // Update profile image
            $data = [
                'profile_image' => $imagePath,
                'updated_at' => date('Y-m-d H:i:s')
            ];
            
            $result = $this->database->update('admins', $data, 'id = :id', [':id' => $id]);
            
            if (!$result) {
                throw new Exception('Failed to update profile image');
            }
            
            // Return updated admin
            return $this->getAdminById($id);
        } catch (NotFoundException $e) {
            throw $e;
        } catch (Exception $e) {
            throw new Exception('Error updating profile image: ' . $e->getMessage());
        }
    }

    /**
     * Check if username or email already exists
     *
     * @param string $username Username
     * @param string $email Email
     * @throws ValidationException
     */
    private function checkDuplicateUsernameOrEmail($username, $email)
    {
        $sql = "SELECT id, username, email FROM admins WHERE (username = :username OR email = :email) AND deleted_at IS NULL";
        $result = $this->database->fetch($sql, [
            ':username' => $username,
            ':email' => $email
        ]);
        
        if ($result) {
            $errors = [];
            
            if ($result['username'] === $username) {
                $errors['username'] = 'Username already exists';
            }
            
            if ($result['email'] === $email) {
                $errors['email'] = 'Email already exists';
            }
            
            throw new ValidationException('Validation failed', $errors);
        }
    }

    /**
     * Check if username already exists
     *
     * @param string $username Username
     * @throws ValidationException
     */
    private function checkDuplicateUsername($username)
    {
        $sql = "SELECT id FROM admins WHERE username = :username AND deleted_at IS NULL";
        $result = $this->database->fetch($sql, [':username' => $username]);
        
        if ($result) {
            throw new ValidationException('Validation failed', ['username' => 'Username already exists']);
        }
    }

    /**
     * Check if email already exists
     *
     * @param string $email Email
     * @throws ValidationException
     */
    private function checkDuplicateEmail($email)
    {
        $sql = "SELECT id FROM admins WHERE email = :email AND deleted_at IS NULL";
        $result = $this->database->fetch($sql, [':email' => $email]);
        
        if ($result) {
            throw new ValidationException('Validation failed', ['email' => 'Email already exists']);
        }
    }

    /**
     * Get profile image URL
     *
     * @param string $imagePath Image path
     * @return string Image URL
     */
    private function getProfileImageUrl($imagePath)
    {
        // Base URL from config
        $baseUrl = config('app.url');
        
        // If image path is already a URL, return as is
        if (filter_var($imagePath, FILTER_VALIDATE_URL)) {
            return $imagePath;
        }
        
        // Otherwise, construct URL from base URL and image path
        // Make sure the path doesn't have duplicate slashes
        return rtrim($baseUrl, '/') . '/' . ltrim($imagePath, '/');
    }
}
