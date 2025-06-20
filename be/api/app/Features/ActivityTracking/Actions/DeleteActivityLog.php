<?php

namespace App\Features\ActivityTracking\Actions;

use App\Core\Request;
use App\Core\Response;
use App\Features\ActivityTracking\Services\ActivityService;
use App\Shared\Exceptions\ValidationException;
use Exception;

class DeleteActivityLog
{
    private $activityService;

    public function __construct()
    {
        $this->activityService = new ActivityService();
    }

    public function execute(Request $request, Response $response)
    {
        try {
            // Get log ID from route parameter
            $logId = $request->getParam('id');
            
            // Debug log
            error_log("DeleteActivityLog: Log ID from params: " . ($logId ?? 'null'));
            
            if (empty($logId)) {
                throw new ValidationException('Log ID is required');
            }
            
            $result = $this->activityService->deleteActivityLog($logId);
            
            return [
                'status' => 'success',
                'message' => 'Activity log deleted successfully',
                'data' => $result
            ];
        } catch (ValidationException $e) {
            error_log("Validation error in DeleteActivityLog: " . $e->getMessage());
            throw $e;
        } catch (Exception $e) {
            error_log("Error in DeleteActivityLog: " . $e->getMessage());
            throw new Exception('Failed to delete activity log: ' . $e->getMessage());
        }
    }
}
