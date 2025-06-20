<?php

namespace App\Features\AdminManagement\Actions;

use App\Core\Request;
use App\Core\Response;
use App\Features\AdminManagement\Services\AdminService;
use App\Shared\Exceptions\NotFoundException;
use App\Shared\Helpers\ResponseFormatter;
use Exception;

class ViewAdmin
{
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
            
            // Check permissions - admins can only view their own profile, super_admins can view any
            if ($currentUser['role'] !== 'super_admin' && $currentUser['id'] != $adminId) {
                throw new \App\Shared\Exceptions\AuthorizationException('You do not have permission to view this admin');
            }
            
            // Get admin
            $admin = $this->adminService->getAdminById($adminId);
            
            // Return response
            return ResponseFormatter::success(
                $admin,
                'Admin retrieved successfully'
            );
        } catch (NotFoundException $e) {
            throw $e;
        } catch (Exception $e) {
            throw new Exception('Failed to retrieve admin: ' . $e->getMessage());
        }
    }
}
