<?php

namespace App\Shared\Traits;

use App\Features\ActivityTracking\DataAccess\ActivityRepository;
use App\Core\Application;

trait LogsActivity
{
    /**
     * Log an activity
     *
     * @param string $module Module name
     * @param string $action Action performed
     * @param array $data Additional data
     * @return bool True if activity was logged
     */
    protected function logActivity($module, $action, $data = [])
    {
        try {
            // Get the request from the Application instance instead of using app() function
            $app = Application::getInstance();
            $request = $app->getRequest();
            $userId = $this->getCurrentUserId();
            
            $activityData = [
                'user_id' => $userId,
                'module' => $module,
                'action' => $action,
                'route' => $request->getPath(),
                'ip_address' => $request->getIp(),
                'user_agent' => $request->getUserAgent(),
                'request_data' => json_encode($request->getBody()),
                'response_code' => http_response_code(),
                'execution_time' => microtime(true) - $request->getStartTime(),
                'data' => !empty($data) ? json_encode($data) : null
            ];
            
            $activityRepository = new ActivityRepository();
            return $activityRepository->logActivity($activityData);
        } catch (\Exception $e) {
            // Log to error log but don't throw - activity logging should never break the application
            error_log("Activity logging error: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Get current authenticated user ID
     *
     * @return int|null User ID or null if not authenticated
     */
    protected function getCurrentUserId()
    {
        try {
            $auth = \App\Core\Security\Authentication::getInstance();
            $user = $auth->user();
            
            return $user ? $user['id'] : null;
        } catch (\Exception $e) {
            return null;
        }
    }
}
