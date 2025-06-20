<?php

namespace App\Features\ActivityTracking\Actions;

use App\Core\Request;
use App\Core\Response;
use App\Features\ActivityTracking\Services\ActivityService;
use Exception;

class DeleteAllActivityLogs
{
    private $activityService;

    public function __construct()
    {
        $this->activityService = new ActivityService();
    }

    public function execute(Request $request, Response $response)
    {
        try {
            // Debug log
            error_log("DeleteAllActivityLogs: Attempting to delete all logs");
            
            $result = $this->activityService->deleteAllActivityLogs();
            
            return [
                'status' => 'success',
                'message' => 'All activity logs deleted successfully',
                'data' => $result
            ];
        } catch (Exception $e) {
            error_log("Error in DeleteAllActivityLogs: " . $e->getMessage());
            throw new Exception('Failed to delete all activity logs: ' . $e->getMessage());
        }
    }
}
