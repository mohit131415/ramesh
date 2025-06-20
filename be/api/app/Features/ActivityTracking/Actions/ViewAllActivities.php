<?php

namespace App\Features\ActivityTracking\Actions;

use App\Core\Request;
use App\Core\Response;
use App\Features\ActivityTracking\Services\ActivityService;
use Exception;

class ViewAllActivities
{
    private $activityService;

    public function __construct()
    {
        $this->activityService = new ActivityService();
    }

    public function execute(Request $request, Response $response)
    {
        try {
            $page = (int) $request->getQuery('page', 1);
            $limit = (int) $request->getQuery('limit', 50);
            
            // Debug log
            error_log("ViewAllActivities: page=$page, limit=$limit");
            
            $result = $this->activityService->getAllActivities($page, $limit);
            
            return [
                'status' => 'success',
                'message' => 'Activities retrieved successfully',
                'data' => $result['data'],
                'meta' => $result['meta']
            ];
        } catch (Exception $e) {
            error_log("Error in ViewAllActivities: " . $e->getMessage());
            throw new Exception('Failed to retrieve activities: ' . $e->getMessage());
        }
    }
}
