<?php

namespace App\Features\AdminManagement\Actions;

use App\Core\Request;
use App\Core\Response;
use App\Features\AdminManagement\Services\AdminService;
use App\Shared\Helpers\ResponseFormatter;
use Exception;

class ListAdmins
{
    private $adminService;

    public function __construct()
    {
        $this->adminService = new AdminService();
    }

    public function execute(Request $request, Response $response)
    {
        try {
            // Get pagination parameters
            $page = (int) $request->getQuery('page', 1);
            $limit = (int) $request->getQuery('limit', 10);
            
            // Get filters
            $filters = [
                'search' => $request->getQuery('search'),
                'role' => $request->getQuery('role'),
                'status' => $request->getQuery('status')
            ];
            
            // Get admins
            $result = $this->adminService->getAllAdmins($page, $limit, $filters);
            
            // Return response
            return ResponseFormatter::success(
                $result['data'],
                'Admins retrieved successfully',
                $result['meta']
            );
        } catch (Exception $e) {
            throw new Exception('Failed to retrieve admins: ' . $e->getMessage());
        }
    }
}
