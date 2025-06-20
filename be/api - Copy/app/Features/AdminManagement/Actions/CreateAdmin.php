<?php

namespace App\Features\AdminManagement\Actions;

use App\Core\Request;
use App\Core\Response;
use App\Features\AdminManagement\Services\AdminService;
use App\Shared\Exceptions\ValidationException;
use App\Shared\Helpers\ResponseFormatter;
use App\Shared\Traits\ValidatesInput;
use Exception;

class CreateAdmin
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
            // Get authenticated user for created_by field
            $auth = \App\Core\Security\Authentication::getInstance();
            $currentUser = $auth->user();
            
            // Get request data
            $data = $request->getBody();
            
            // Add created_by field
            if ($currentUser && isset($currentUser['id'])) {
                $data['created_by'] = $currentUser['id'];
            }
            
            // Get profile image file if uploaded
            $file = $request->getFile('profile_image');
            
            // Create admin
            $admin = $this->adminService->createAdmin($data, $file);
            
            // Return response
            return ResponseFormatter::success(
                $admin,
                'Admin created successfully'
            );
        } catch (ValidationException $e) {
            throw $e;
        } catch (Exception $e) {
            throw new Exception('Failed to create admin: ' . $e->getMessage());
        }
    }
}
