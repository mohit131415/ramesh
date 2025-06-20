<?php

namespace App\Features\ActivityTracking\Actions;

use App\Core\Request;
use App\Core\Response;
use App\Features\ActivityTracking\Services\ActivityService;
use Exception;

class GetActivityFilters
{
    private $activityService;

    public function __construct()
    {
        $this->activityService = new ActivityService();
    }

    public function execute(Request $request, Response $response)
    {
        try {
            $filters = $this->activityService->getActivityFilters();
            
            return [
                'status' => 'success',
                'message' => 'Activity filters retrieved successfully',
                'data' => $filters
            ];
        } catch (Exception $e) {
            error_log("Error in GetActivityFilters: " . $e->getMessage());
            throw new Exception('Failed to retrieve activity filters: ' . $e->getMessage());
        }
    }
}
