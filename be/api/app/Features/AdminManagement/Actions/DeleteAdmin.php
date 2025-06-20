<?php

namespace App\Features\AdminManagement\Actions;

use App\Core\Request;
use App\Core\Response;
use App\Features\AdminManagement\Services\AdminService;
use App\Shared\Exceptions\NotFoundException;
use App\Shared\Helpers\ResponseFormatter;
use Exception;

class DeleteAdmin
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
            
            // Delete admin
            $result = $this->adminService->deleteAdmin($adminId);
            
            // Return response
            return ResponseFormatter::success(
                ['id' => $adminId, 'deleted' => $result],
                'Admin deleted successfully'
            );
        } catch (NotFoundException $e) {
            throw $e;
        } catch (Exception $e) {
            throw new Exception('Failed to delete admin: ' . $e->getMessage());
        }
    }
}
