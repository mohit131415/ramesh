<?php

namespace App\Features\ActivityTracking\Services;

use App\Features\ActivityTracking\DataAccess\ActivityRepository;
use App\Shared\Exceptions\ValidationException;
use App\Shared\Exceptions\NotFoundException;
use Exception;

class ActivityService
{
    private $activityRepository;

    public function __construct()
    {
        $this->activityRepository = new ActivityRepository();
    }

    /**
     * Get all activities with pagination
     *
     * @param int $page Page number
     * @param int $limit Items per page
     * @return array Activities and pagination metadata
     */
    public function getAllActivities($page = 1, $limit = 50)
    {
        try {
            // Validate input
            $page = (int) $page;
            $limit = (int) $limit;
            
            if ($page < 1) {
                $page = 1;
            }
            
            if ($limit < 1 || $limit > 100) {
                $limit = 50;
            }
            
            return $this->activityRepository->getAllActivities($page, $limit);
        } catch (Exception $e) {
            throw new Exception('Failed to get activities: ' . $e->getMessage());
        }
    }
    
    /**
     * Get activity filters
     *
     * @return array Activity filters
     */
    public function getActivityFilters()
    {
        try {
            return $this->activityRepository->getActivityFilters();
        } catch (Exception $e) {
            throw new Exception('Failed to get activity filters: ' . $e->getMessage());
        }
    }
    
    /**
     * Delete activity log
     *
     * @param int $logId Log ID
     * @return array Deleted log information
     * @throws ValidationException
     * @throws NotFoundException
     */
    public function deleteActivityLog($logId)
    {
        try {
            // Validate input
            if (empty($logId)) {
                throw new ValidationException('Log ID is required');
            }
            
            $logId = (int) $logId;
            
            if ($logId <= 0) {
                throw new ValidationException('Invalid log ID');
            }
            
            // Check if log exists
            $exists = $this->activityRepository->checkActivityLogExists($logId);
            
            if (!$exists) {
                throw new NotFoundException('Activity log not found');
            }
            
            // Delete the log
            return $this->activityRepository->deleteActivityLog($logId);
        } catch (ValidationException $e) {
            throw $e;
        } catch (NotFoundException $e) {
            throw $e;
        } catch (Exception $e) {
            throw new Exception('Failed to delete activity log: ' . $e->getMessage());
        }
    }
    
    /**
     * Delete all activity logs
     *
     * @return array Deletion result
     */
    public function deleteAllActivityLogs()
    {
        try {
            return $this->activityRepository->deleteAllActivityLogs();
        } catch (Exception $e) {
            throw new Exception('Failed to delete all activity logs: ' . $e->getMessage());
        }
    }

    /**
     * Get filtered activities without pagination
     *
     * @param array $filters Filter parameters
     * @return array Filtered activities
     */
    public function getFilteredActivities($filters)
    {
        try {
            // Process filter parameters
            $processedFilters = $this->processFilterParameters($filters);
            
            // Get filtered activities
            return $this->activityRepository->getFilteredActivities($processedFilters);
        } catch (Exception $e) {
            throw new Exception('Failed to get filtered activities: ' . $e->getMessage());
        }
    }

    /**
     * Process filter parameters
     *
     * @param array $filters Raw filter parameters
     * @return array Processed filter parameters
     */
    private function processFilterParameters($filters)
    {
        $processed = [];
        
        // Process modules (convert comma-separated string to array)
        if (!empty($filters['modules'])) {
            $processed['modules'] = explode(',', $filters['modules']);
        }
        
        // Process actions (convert comma-separated string to array)
        if (!empty($filters['actions'])) {
            $processed['actions'] = explode(',', $filters['actions']);
        }
        
        // Process users (convert comma-separated string to array)
        if (!empty($filters['users'])) {
            $processed['users'] = explode(',', $filters['users']);
        }
        
        // Process roles (convert comma-separated string to array)
        if (!empty($filters['roles'])) {
            $processed['roles'] = explode(',', $filters['roles']);
        }
        
        // Process search term
        if (!empty($filters['search'])) {
            $processed['search'] = $filters['search'];
        }
        
        // Process date range
        if (!empty($filters['start_date'])) {
            $processed['start_date'] = $filters['start_date'];
        }
        
        if (!empty($filters['end_date'])) {
            $processed['end_date'] = $filters['end_date'];
        }
        
        // Process exclude_activity_tracking flag
        if (isset($filters['exclude_activity_tracking'])) {
            $processed['exclude_activity_tracking'] = $filters['exclude_activity_tracking'];
        }
        
        // Process IP address
        if (!empty($filters['ip_address'])) {
            $processed['ip_address'] = $filters['ip_address'];
        }
        
        // Process status code
        if (!empty($filters['status_code'])) {
            $processed['status_code'] = $filters['status_code'];
        }
        
        return $processed;
    }
}
