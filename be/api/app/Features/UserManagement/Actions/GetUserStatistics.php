<?php

namespace App\Features\UserManagement\Actions;

use App\Core\Request;
use App\Core\Response;
use App\Features\UserManagement\Services\AdminUserService;
use App\Shared\Helpers\ResponseFormatter;
use Exception;

class GetUserStatistics
{
    private $userService;

    public function __construct()
    {
        $this->userService = new AdminUserService();
    }

    public function execute(Request $request, Response $response)
    {
        try {
            // Get comprehensive user statistics
            $statistics = $this->userService->getDetailedUserStatistics();
            
            // Return response
            return ResponseFormatter::success(
                $statistics,
                'Detailed user statistics retrieved successfully'
            );
        } catch (Exception $e) {
            return ResponseFormatter::error(
                'Failed to retrieve user statistics: ' . $e->getMessage()
            );
        }
    }
}
