<?php

namespace App\Features\UserManagement\Actions;

use App\Core\Request;
use App\Core\Response;
use App\Features\UserManagement\Services\AdminUserService;
use App\Shared\Helpers\ResponseFormatter;
use Exception;

class ListUsers
{
    private $userService;

    public function __construct()
    {
        $this->userService = new AdminUserService();
    }

    public function execute(Request $request, Response $response)
    {
        try {
            // Get pagination parameters
            $page = (int) $request->getQuery('page', 1);
            $limit = (int) $request->getQuery('limit', 20);
        
            // Ensure valid pagination values
            if ($page < 1) $page = 1;
            if ($limit < 1 || $limit > 100) $limit = 20;
        
            // Get filters and clean them properly
            $filters = [];
        
            $search = $request->getQuery('search');
            if (!empty($search) && trim($search) !== '') {
                $filters['search'] = trim($search);
            }
        
            $status = $request->getQuery('status');
            if (!empty($status) && trim($status) !== '') {
                $filters['status'] = trim($status);
            }
        
            $hasProfile = $request->getQuery('has_profile');
            if (!empty($hasProfile) && trim($hasProfile) !== '') {
                $filters['has_profile'] = trim($hasProfile);
            }
        
            $dateFrom = $request->getQuery('date_from');
            if (!empty($dateFrom) && trim($dateFrom) !== '') {
                $filters['date_from'] = trim($dateFrom);
            }
        
            $dateTo = $request->getQuery('date_to');
            if (!empty($dateTo) && trim($dateTo) !== '') {
                $filters['date_to'] = trim($dateTo);
            }
        
            // Get users
            $result = $this->userService->getAllUsers($page, $limit, $filters);
        
            // Return response
            return ResponseFormatter::success(
                $result['data'],
                'Users retrieved successfully',
                $result['meta']
            );
        } catch (Exception $e) {
            error_log("ListUsers Error: " . $e->getMessage());
            return ResponseFormatter::error(
                'Failed to retrieve users: ' . $e->getMessage()
            );
        }
    }
}
