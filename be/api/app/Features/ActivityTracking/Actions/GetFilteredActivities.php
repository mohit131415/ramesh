<?php

namespace App\Features\ActivityTracking\Actions;

use App\Core\Request;
use App\Core\Response;
use App\Features\ActivityTracking\Services\ActivityService;
use Exception;

class GetFilteredActivities
{
    private $activityService;

    public function __construct()
    {
        $this->activityService = new ActivityService();
    }

    public function execute(Request $request, Response $response)
    {
        try {
            // Get all filter parameters from the request
            $filters = [
                'modules' => $request->getQuery('modules'), // comma-separated list
                'actions' => $request->getQuery('actions'), // comma-separated list
                'users' => $request->getQuery('users'), // comma-separated list
                'roles' => $request->getQuery('roles'), // comma-separated list
                'search' => $request->getQuery('search'), // search term
                'start_date' => $request->getQuery('start_date'), // start date
                'end_date' => $request->getQuery('end_date'), // end date
                'exclude_activity_tracking' => $request->getQuery('exclude_activity_tracking') === 'true', // boolean
                'ip_address' => $request->getQuery('ip_address'), // specific IP address
                'status_code' => $request->getQuery('status_code'), // HTTP status code
            ];
            
            // Debug log
            error_log("GetFilteredActivities: Filters: " . json_encode($filters));
            
            $result = $this->activityService->getFilteredActivities($filters);
            
            return [
                'status' => 'success',
                'message' => 'Filtered activities retrieved successfully',
                'data' => $result
            ];
        } catch (Exception $e) {
            error_log("Error in GetFilteredActivities: " . $e->getMessage());
            throw new Exception('Failed to retrieve filtered activities: ' . $e->getMessage());
        }
    }
}
