<?php

namespace App\Features\AdminManagement\Services;

use App\Features\AdminManagement\DataAccess\AdminRepository;
use App\Features\AdminManagement\DataAccess\RoleRepository;
use App\Shared\Exceptions\ValidationException;
use App\Shared\Exceptions\NotFoundException;
use App\Shared\Helpers\FileUploader;
use Exception;

class AdminService
{
    private $adminRepository;
    private $roleRepository;

    public function __construct()
    {
        $this->adminRepository = new AdminRepository();
        $this->roleRepository = new RoleRepository();
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
            return $this->adminRepository->getAllAdmins($page, $limit, $filters);
        } catch (Exception $e) {
            throw new Exception('Failed to get admins: ' . $e->getMessage());
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
            return $this->adminRepository->getAdminById($id);
        } catch (NotFoundException $e) {
            throw $e;
        } catch (Exception $e) {
            throw new Exception('Failed to get admin: ' . $e->getMessage());
        }
    }

    /**
     * Create a new admin
     *
     * @param array $data Admin data
     * @param array $file Optional profile image file
     * @return array Created admin data
     * @throws ValidationException
     */
    public function createAdmin($data, $file = null)
    {
        try {
            // Validate required fields
            $this->validateAdminData($data);
            
            // Validate role
            $this->validateRole($data['role']);
            
            // Handle profile image upload if provided
            if ($file && !empty($file['tmp_name'])) {
                $uploadResult = $this->uploadProfileImage($file);
                $data['profile_image'] = $uploadResult['path'];
            }
            
            // Create admin
            return $this->adminRepository->createAdmin($data);
        } catch (ValidationException $e) {
            throw $e;
        } catch (Exception $e) {
            throw new Exception('Failed to create admin: ' . $e->getMessage());
        }
    }

    /**
     * Update an admin
     *
     * @param int $id Admin ID
     * @param array $data Admin data
     * @param array $file Optional profile image file
     * @return array Updated admin data
     * @throws NotFoundException
     * @throws ValidationException
     */
    public function updateAdmin($id, $data, $file = null)
    {
        try {
            // Validate admin exists
            $admin = $this->adminRepository->getAdminById($id);
            
            // Debug log to check what data is being received by the service
            error_log('AdminService updateAdmin data: ' . json_encode($data));
            
            // Validate role if provided
            if (isset($data['role']) && !empty($data['role'])) {
                $this->validateRole($data['role']);
            }
            
            // Handle profile image upload if provided
            if ($file && !empty($file['tmp_name'])) {
                $uploadResult = $this->uploadProfileImage($file);
                $data['profile_image'] = $uploadResult['path'];
                
                // Delete old profile image if exists
                if (!empty($admin['profile_image'])) {
                    $this->deleteProfileImage($admin['profile_image']);
                }
            }
            
            // Ensure status is properly handled
            if (isset($data['status']) && in_array($data['status'], ['active', 'inactive', 'suspended'])) {
                // Status is valid, keep it in the data array
                error_log('Valid status found: ' . $data['status']);
            } else if (isset($data['status']) && empty($data['status'])) {
                // If status is empty, remove it to avoid setting empty status
                error_log('Empty status found, removing from data');
                unset($data['status']);
            }
            
            // Update admin
            return $this->adminRepository->updateAdmin($id, $data);
        } catch (NotFoundException $e) {
            throw $e;
        } catch (ValidationException $e) {
            throw $e;
        } catch (Exception $e) {
            throw new Exception('Failed to update admin: ' . $e->getMessage());
        }
    }

    /**
     * Delete an admin
     *
     * @param int $id Admin ID
     * @return bool Success status
     * @throws NotFoundException
     */
    public function deleteAdmin($id)
    {
        try {
            return $this->adminRepository->deleteAdmin($id);
        } catch (NotFoundException $e) {
            throw $e;
        } catch (Exception $e) {
            throw new Exception('Failed to delete admin: ' . $e->getMessage());
        }
    }

    /**
     * Update admin profile image
     *
     * @param int $id Admin ID
     * @param array $file Profile image file
     * @return array Updated admin data
     * @throws NotFoundException
     * @throws ValidationException
     */
    public function updateProfileImage($id, $file)
    {
        try {
            // Validate admin exists
            $admin = $this->adminRepository->getAdminById($id);
            
            // Validate file
            if (empty($file) || empty($file['tmp_name'])) {
                throw new ValidationException('No file uploaded', ['profile_image' => 'No file uploaded']);
            }
            
            // Upload profile image
            $uploadResult = $this->uploadProfileImage($file);
            
            // Delete old profile image if exists
            if (!empty($admin['profile_image'])) {
                $this->deleteProfileImage($admin['profile_image']);
            }
            
            // Update admin profile image
            return $this->adminRepository->updateProfileImage($id, $uploadResult['path']);
        } catch (NotFoundException $e) {
            throw $e;
        } catch (ValidationException $e) {
            throw $e;
        } catch (Exception $e) {
            throw new Exception('Failed to update profile image: ' . $e->getMessage());
        }
    }

    /**
     * Get all available roles
     *
     * @return array List of roles
     */
    public function getAllRoles()
    {
        try {
            return $this->roleRepository->getAllRoles();
        } catch (Exception $e) {
            throw new Exception('Failed to get roles: ' . $e->getMessage());
        }
    }

    /**
     * Validate admin data
     *
     * @param array $data Admin data
     * @throws ValidationException
     */
    private function validateAdminData($data)
    {
        $errors = [];
        
        // Required fields
        $requiredFields = ['username', 'email', 'password', 'first_name', 'last_name', 'role'];
        
        foreach ($requiredFields as $field) {
            if (!isset($data[$field]) || empty($data[$field])) {
                $errors[$field] = ucfirst(str_replace('_', ' ', $field)) . ' is required';
            }
        }
        
        // Email validation
        if (isset($data['email']) && !filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
            $errors['email'] = 'Invalid email format';
        }
        
        // Password validation (minimum 8 characters)
        if (isset($data['password']) && strlen($data['password']) < 8) {
            $errors['password'] = 'Password must be at least 8 characters';
        }
        
        if (!empty($errors)) {
            throw new ValidationException('Validation failed', $errors);
        }
    }

    /**
     * Validate role
     *
     * @param string $role Role ID
     * @throws ValidationException
     */
    private function validateRole($role)
    {
        $validRole = $this->roleRepository->getRoleById($role);
        
        if (!$validRole) {
            throw new ValidationException('Validation failed', ['role' => 'Invalid role']);
        }
    }

    /**
     * Upload profile image
     *
     * @param array $file Profile image file
     * @return array Upload result with relative path
     * @throws ValidationException
     */
    private function uploadProfileImage($file)
    {
        try {
            $uploadDir = APP_ROOT . '/public/uploads/profile_images/';
            
            // Create directory if it doesn't exist
            if (!is_dir($uploadDir)) {
                mkdir($uploadDir, 0755, true);
            }
            
            // Define allowed file types and max size
            $options = [
                'allowed_types' => ['jpg', 'jpeg', 'png', 'gif'],
                'max_size' => 2 * 1024 * 1024, // 2MB
                'encrypt_name' => true
            ];
            
            // Upload file
            $fileUploader = new FileUploader();
            $result = $fileUploader->upload($file, $uploadDir, $options);
            
            // Convert absolute path to relative path
            $relativePath = 'uploads/profile_images/' . basename($result['path']);
            $result['path'] = $relativePath;
            
            return $result;
        } catch (ValidationException $e) {
            throw $e;
        } catch (Exception $e) {
            throw new Exception('Failed to upload profile image: ' . $e->getMessage());
        }
    }

    /**
     * Delete profile image
     *
     * @param string $imagePath Path to profile image
     * @return bool Success status
     */
    private function deleteProfileImage($imagePath)
    {
        try {
            // If image path is a URL, extract the path part
            if (filter_var($imagePath, FILTER_VALIDATE_URL)) {
                $baseUrl = config('app.url');
                $imagePath = str_replace($baseUrl, APP_ROOT . '/public', $imagePath);
            } else {
                $imagePath = APP_ROOT . '/public/' . ltrim($imagePath, '/');
            }
            
            // Delete file if it exists
            if (file_exists($imagePath)) {
                return unlink($imagePath);
            }
            
            return false;
        } catch (Exception $e) {
            // Log error but don't throw - this is a non-critical operation
            error_log('Failed to delete profile image: ' . $e->getMessage());
            return false;
        }
    }

    /**
     * Update admin status
     * 
     * @param int $adminId
     * @param string $status
     * @return array Updated admin data
     * @throws NotFoundException
     */
    public function updateAdminStatus($adminId, $status)
    {
        try {
            // Check if admin exists
            $admin = $this->adminRepository->getAdminById($adminId);
            
            // Update only the status field
            return $this->adminRepository->updateAdmin($adminId, ['status' => $status]);
        } catch (NotFoundException $e) {
            throw $e;
        } catch (Exception $e) {
            throw new Exception('Failed to update admin status: ' . $e->getMessage());
        }
    }
}
