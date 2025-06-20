<?php

namespace App\Features\AdminManagement\Actions;

use App\Core\Request;
use App\Core\Response;
use App\Features\AdminManagement\Services\AdminService;
use App\Shared\Exceptions\NotFoundException;
use App\Shared\Exceptions\ValidationException;
use App\Shared\Helpers\ResponseFormatter;
use App\Shared\Traits\ValidatesInput;
use Exception;

class UpdateAdmin
{
    use ValidatesInput;
    
    private $adminService;

    public function __construct()
    {
        $this->adminService = new AdminService();
    }

    public function execute(Request $request, Response $response)
    {
        try {
            // Get admin ID from route parameter
            $adminId = $request->getParam('id');
            
            if (empty($adminId)) {
                throw new NotFoundException('Admin ID is required');
            }
            
            // Get authenticated user
            $auth = \App\Core\Security\Authentication::getInstance();
            $currentUser = $auth->user();
            
            // Get authorization instance
            $authorization = \App\Core\Security\Authorization::getInstance();
            
            // Check permissions:
            // 1. Super admins can edit any admin and all fields
            // 2. Regular admins can only edit their own profile and cannot change roles
            if (!$authorization->isSuperAdmin()) {
                // Regular admin can only edit their own profile
                if ($currentUser['id'] != $adminId) {
                    throw new \App\Shared\Exceptions\AuthorizationException('You do not have permission to update this admin');
                }
                
                // Regular admins cannot change roles
                $data = $request->getBody();
                if (isset($data['role'])) {
                    throw new \App\Shared\Exceptions\AuthorizationException('Only super admins can change roles');
                }
            }
            
            // Get request data
            $data = [];
            
            // Extract form fields manually to ensure clean data
            $formData = $request->getBody();
            
            // Only include fields that are present and not empty
            if (isset($formData['username']) && !empty($formData['username'])) {
                $data['username'] = $formData['username'];
            }
            
            if (isset($formData['email']) && !empty($formData['email'])) {
                $data['email'] = $formData['email'];
            }
            
            if (isset($formData['password']) && !empty($formData['password'])) {
                $data['password'] = $formData['password'];
            }
            
            if (isset($formData['first_name']) && !empty($formData['first_name'])) {
                $data['first_name'] = $formData['first_name'];
            }
            
            if (isset($formData['last_name']) && !empty($formData['last_name'])) {
                $data['last_name'] = $formData['last_name'];
            }
            
            if (isset($formData['phone'])) {
                $data['phone'] = $formData['phone'];
            }
            
            if (isset($formData['role']) && !empty($formData['role']) && $formData['role'] !== 'No Change') {
                $data['role'] = $formData['role'];
            }
            
            if (isset($formData['status']) && !empty($formData['status'])) {
                $data['status'] = $formData['status'];
            }
            
            // Get profile image file if uploaded
            $file = $request->getFile('profile_image');
            
            // Debug log
            error_log('UpdateAdmin - Processed data: ' . json_encode($data));
            if ($file) {
                error_log('UpdateAdmin - File uploaded: ' . ($file['name'] ?? 'No name'));
            }
            
            // Update admin
            $admin = $this->adminService->updateAdmin($adminId, $data, $file);
            
            // Return response
            return ResponseFormatter::success(
                $admin,
                'Admin updated successfully'
            );
        } catch (NotFoundException $e) {
            throw $e;
        } catch (ValidationException $e) {
            throw $e;
        } catch (Exception $e) {
            throw new Exception('Failed to update admin: ' . $e->getMessage());
        }
    }
}
