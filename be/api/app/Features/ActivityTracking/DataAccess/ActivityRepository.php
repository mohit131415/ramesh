<?php

namespace App\Features\ActivityTracking\DataAccess;

use App\Core\Database;
use App\Shared\Exceptions\NotFoundException;
use Exception;

class ActivityRepository
{
    private $database;

    public function __construct()
    {
        $this->database = Database::getInstance();
    }

    public function logActivity($data)
    {
        try {
            error_log("ActivityRepository: Starting logActivity with data: " . json_encode($data));
        
            // Ensure DB connection is available
            if (!$this->database->isConnected()) {
                error_log("ActivityRepository: Database not connected, logging to file");
                $this->logToFile($data);
                return true;
            }
        
            // Extract and validate each field explicitly
            $userId = isset($data['user_id']) ? (int)$data['user_id'] : 0;
            $isAdmin = isset($data['is_admin']) ? (bool)$data['is_admin'] : false;
            $module = isset($data['module']) && !empty($data['module']) ? (string)$data['module'] : 'Unknown';
            $action = isset($data['action']) && !empty($data['action']) ? (string)$data['action'] : 'Unknown';
            $route = isset($data['route']) && !empty($data['route']) ? (string)$data['route'] : 'Unknown';
            $ipAddress = isset($data['ip_address']) && !empty($data['ip_address']) ? (string)$data['ip_address'] : '0.0.0.0';
            $userAgent = isset($data['user_agent']) && !empty($data['user_agent']) ? (string)$data['user_agent'] : 'Unknown';
            $requestData = isset($data['request_data']) && !empty($data['request_data']) ? (string)$data['request_data'] : '{}';
            $responseCode = isset($data['response_code']) ? (int)$data['response_code'] : 200;
            $executionTime = isset($data['execution_time']) ? (float)$data['execution_time'] : 0.0;
            $resultData = isset($data['data']) && !empty($data['data']) ? (string)$data['data'] : '{}';
        
            // Debug log each field
            error_log("ActivityRepository: Extracted fields:");
            error_log("  user_id: " . $userId);
            error_log("  is_admin: " . ($isAdmin ? 'true' : 'false'));
            error_log("  module: " . $module);
            error_log("  action: " . $action);
            error_log("  route: " . $route);
            error_log("  ip_address: " . $ipAddress);
            error_log("  user_agent: " . $userAgent);
            error_log("  request_data: " . $requestData);
            error_log("  response_code: " . $responseCode);
            error_log("  execution_time: " . $executionTime);
            error_log("  data: " . $resultData);
        
            // Ensure JSON strings are valid
            if (!$this->isValidJson($requestData)) {
                $requestData = json_encode(['raw' => $requestData]);
                error_log("ActivityRepository: Fixed invalid request_data JSON");
            }
        
            if (!$this->isValidJson($resultData)) {
                $resultData = json_encode(['raw' => $resultData]);
                error_log("ActivityRepository: Fixed invalid result_data JSON");
            }
        
            // Build SQL with explicit column names including is_admin
            $sql = "INSERT INTO activity_logs 
                (user_id, is_admin, module, action, route, ip_address, user_agent, request_data, response_code, execution_time, data, created_at) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())";
        
            $params = [
                $userId,        // user_id
                $isAdmin ? 1 : 0, // is_admin (convert boolean to int)
                $module,        // module
                $action,        // action
                $route,         // route
                $ipAddress,     // ip_address
                $userAgent,     // user_agent
                $requestData,   // request_data
                $responseCode,  // response_code
                $executionTime, // execution_time
                $resultData     // data
            ];
        
            error_log("ActivityRepository: Executing SQL: " . $sql);
            error_log("ActivityRepository: With parameters: " . json_encode($params));
        
            $result = $this->database->query($sql, $params);
        
            if ($result) {
                error_log("ActivityRepository: Successfully inserted activity log");
                return true;
            } else {
                error_log("ActivityRepository: Query execution failed");
                $this->logToFile($data);
                return false;
            }
        
        } catch (Exception $e) {
            error_log("ActivityRepository: Exception in logActivity: " . $e->getMessage());
            error_log("ActivityRepository: Exception trace: " . $e->getTraceAsString());
            $this->logToFile($data);
            return false;
        }
    }
    
    private function isValidJson($string)
    {
        if (!is_string($string)) {
            return false;
        }
        
        json_decode($string);
        return json_last_error() === JSON_ERROR_NONE;
    }

    private function logToFile($data)
    {
        try {
            $logDir = APP_ROOT . '/storage/logs/activity/';
        
            if (!is_dir($logDir)) {
                mkdir($logDir, 0755, true);
            }
        
            $date = date('Y-m-d');
            $logFile = $logDir . $date . '.log';
        
            $logData = [
                'timestamp' => date('Y-m-d H:i:s'),
                'user_id' => $data['user_id'] ?? 0,
                'is_admin' => $data['is_admin'] ?? false,
                'module' => $data['module'] ?? 'Unknown',
                'action' => $data['action'] ?? 'Unknown',
                'route' => $data['route'] ?? 'Unknown',
                'ip_address' => $data['ip_address'] ?? '0.0.0.0',
                'user_agent' => $data['user_agent'] ?? 'Unknown',
                'request_data' => $data['request_data'] ?? '{}',
                'response_code' => $data['response_code'] ?? 200,
                'execution_time' => $data['execution_time'] ?? 0,
                'data' => $data['data'] ?? '{}'
            ];
        
            $logMessage = json_encode($logData) . PHP_EOL;
            file_put_contents($logFile, $logMessage, FILE_APPEND);
        
            error_log("ActivityRepository: Logged to file: " . $logFile);
            return true;
        } catch (Exception $e) {
            error_log("ActivityRepository: File logging error: " . $e->getMessage());
            return false;
        }
    }

    public function getAllActivities($page = 1, $limit = 50)
    {
        try {
            $offset = ($page - 1) * $limit;
        
            $sql = "SELECT a.*, 
                CASE 
                    WHEN a.is_admin = 1 AND ad.id IS NOT NULL THEN CONCAT(IFNULL(ad.first_name, ''), ' ', IFNULL(ad.last_name, '')) 
                    WHEN a.is_admin = 0 AND up.id IS NOT NULL THEN CONCAT(IFNULL(up.first_name, ''), ' ', IFNULL(up.last_name, ''))
                    ELSE 'Unknown User' 
                END as user_name,
                CASE 
                    WHEN a.is_admin = 1 THEN 'Admin'
                    ELSE 'User'
                END as user_type,
                CASE 
                    WHEN a.is_admin = 1 THEN ad.email
                    WHEN a.is_admin = 0 THEN up.email
                    ELSE NULL
                END as user_email
                FROM activity_logs a
                LEFT JOIN admins ad ON a.user_id = ad.id AND a.is_admin = 1
                LEFT JOIN users u ON a.user_id = u.id AND a.is_admin = 0
                LEFT JOIN user_profiles up ON u.id = up.user_id AND a.is_admin = 0
                ORDER BY a.id DESC LIMIT ? OFFSET ?";
        
            $params = [$limit, $offset];
        
            $activities = $this->database->fetchAll($sql, $params);
        
            // Count total records
            $countSql = "SELECT COUNT(*) as total FROM activity_logs";
            $countResult = $this->database->fetch($countSql);
            $total = $countResult['total'] ?? 0;
        
            return [
                'data' => $activities,
                'meta' => [
                    'current_page' => $page,
                    'per_page' => $limit,
                    'total' => $total,
                    'total_pages' => ceil($total / $limit)
                ]
            ];
        } catch (Exception $e) {
            error_log("Error in getAllActivities: " . $e->getMessage());
            throw new Exception('Error retrieving activities: ' . $e->getMessage());
        }
    }
    
    public function getActivityFilters()
    {
        try {
            // Get all modules
            $modulesSql = "SELECT DISTINCT module FROM activity_logs WHERE module IS NOT NULL AND module != '' AND module != 'Unknown' ORDER BY module";
            $modules = $this->database->fetchAll($modulesSql);
            $modulesList = array_column($modules, 'module');
            
            // Get all actions
            $actionsSql = "SELECT DISTINCT action FROM activity_logs WHERE action IS NOT NULL AND action != '' AND action != 'Unknown' ORDER BY action";
            $actions = $this->database->fetchAll($actionsSql);
            $actionsList = array_column($actions, 'action');
            
            // Get all admin users who have activity logs
            $adminUsersSql = "SELECT DISTINCT a.user_id, CONCAT(IFNULL(ad.first_name, ''), ' ', IFNULL(ad.last_name, '')) as name, 
                        ad.email, ad.role 
                        FROM activity_logs a 
                        LEFT JOIN admins ad ON a.user_id = ad.id 
                        WHERE a.user_id > 0 AND a.is_admin = 1
                        ORDER BY name";
            $adminUsers = $this->database->fetchAll($adminUsersSql);
            
            // Get all regular users who have activity logs
            $regularUsersSql = "SELECT DISTINCT a.user_id, CONCAT(IFNULL(up.first_name, ''), ' ', IFNULL(up.last_name, '')) as name, 
                        up.email, u.phone_number
                        FROM activity_logs a 
                        LEFT JOIN users u ON a.user_id = u.id 
                        LEFT JOIN user_profiles up ON u.id = up.user_id
                        WHERE a.user_id > 0 AND a.is_admin = 0
                        ORDER BY name";
            $regularUsers = $this->database->fetchAll($regularUsersSql);
            
            // Combine users
            $allUsers = array_merge($adminUsers, $regularUsers);
            
            // Get all roles - both admin roles and customer
            $roles = ['admin', 'super_admin', 'customer'];
            
            return [
                'modules' => $modulesList,
                'actions' => $actionsList,
                'users' => $allUsers,
                'roles' => $roles
            ];
        } catch (Exception $e) {
            error_log("Error in getActivityFilters: " . $e->getMessage());
            throw new Exception('Error retrieving activity filters: ' . $e->getMessage());
        }
    }
    
    public function checkActivityLogExists($logId)
    {
        try {
            $sql = "SELECT 1 FROM activity_logs WHERE id = ?";
            $result = $this->database->fetch($sql, [$logId]);
            
            return !empty($result);
        } catch (Exception $e) {
            error_log("Error in checkActivityLogExists: " . $e->getMessage());
            throw new Exception('Error checking if activity log exists: ' . $e->getMessage());
        }
    }
    
    public function deleteActivityLog($logId)
    {
        try {
            $sql = "DELETE FROM activity_logs WHERE id = ?";
            $result = $this->database->query($sql, [$logId]);
            
            if ($result->rowCount() === 0) {
                throw new NotFoundException('Activity log not found or already deleted');
            }
            
            return [
                'id' => $logId,
                'deleted' => true
            ];
        } catch (NotFoundException $e) {
            throw $e;
        } catch (Exception $e) {
            error_log("Error in deleteActivityLog: " . $e->getMessage());
            throw new Exception('Error deleting activity log: ' . $e->getMessage());
        }
    }
    
    public function deleteAllActivityLogs()
    {
        try {
            $countSql = "SELECT COUNT(*) as total FROM activity_logs";
            $countResult = $this->database->fetch($countSql);
            $total = $countResult['total'] ?? 0;
            
            if ($total === 0) {
                return [
                    'deleted' => true,
                    'count' => 0
                ];
            }
            
            $sql = "TRUNCATE TABLE activity_logs";
            $this->database->query($sql);
            
            return [
                'deleted' => true,
                'count' => $total
            ];
        } catch (Exception $e) {
            error_log("Error in deleteAllActivityLogs: " . $e->getMessage());
            throw new Exception('Error deleting all activity logs: ' . $e->getMessage());
        }
    }

    public function getFilteredActivities($filters)
    {
        try {
            $sql = "SELECT a.*, 
                CASE 
                    WHEN a.is_admin = 1 AND ad.id IS NOT NULL THEN CONCAT(IFNULL(ad.first_name, ''), ' ', IFNULL(ad.last_name, '')) 
                    WHEN a.is_admin = 0 AND up.id IS NOT NULL THEN CONCAT(IFNULL(up.first_name, ''), ' ', IFNULL(up.last_name, ''))
                    ELSE 'Unknown User' 
                END as user_name,
                CASE 
                    WHEN a.is_admin = 1 THEN 'Admin'
                    ELSE 'User'
                END as user_type,
                CASE 
                    WHEN a.is_admin = 1 THEN ad.email
                    WHEN a.is_admin = 0 THEN up.email
                    ELSE NULL
                END as user_email
                FROM activity_logs a
                LEFT JOIN admins ad ON a.user_id = ad.id AND a.is_admin = 1
                LEFT JOIN users u ON a.user_id = u.id AND a.is_admin = 0
                LEFT JOIN user_profiles up ON u.id = up.user_id AND a.is_admin = 0";
        
            $whereConditions = [];
            $params = [];
        
            // Filter by user type (admin/user)
            if (!empty($filters['user_type'])) {
                if ($filters['user_type'] === 'admin') {
                    $whereConditions[] = "a.is_admin = 1";
                } elseif ($filters['user_type'] === 'user') {
                    $whereConditions[] = "a.is_admin = 0";
                }
            }
        
            // Filter by modules
            if (!empty($filters['modules'])) {
                $placeholders = str_repeat('?,', count($filters['modules']) - 1) . '?';
                $whereConditions[] = "a.module IN ($placeholders)";
                $params = array_merge($params, $filters['modules']);
            }
        
            // Filter by actions
            if (!empty($filters['actions'])) {
                $placeholders = str_repeat('?,', count($filters['actions']) - 1) . '?';
                $whereConditions[] = "a.action IN ($placeholders)";
                $params = array_merge($params, $filters['actions']);
            }
        
            // Filter by users
            if (!empty($filters['users'])) {
                $placeholders = str_repeat('?,', count($filters['users']) - 1) . '?';
                $whereConditions[] = "a.user_id IN ($placeholders)";
                $params = array_merge($params, $filters['users']);
            }
        
            // Filter by roles (only for admin users)
            if (!empty($filters['roles'])) {
                $placeholders = str_repeat('?,', count($filters['roles']) - 1) . '?';
                $whereConditions[] = "a.is_admin = 1 AND ad.role IN ($placeholders)";
                $params = array_merge($params, $filters['roles']);
            }
        
            // Filter by search term
            if (!empty($filters['search'])) {
                $searchTerm = "%{$filters['search']}%";
                $whereConditions[] = "(a.module LIKE ? OR a.action LIKE ? OR a.route LIKE ? OR 
                              a.ip_address LIKE ? OR a.user_agent LIKE ? OR 
                              a.request_data LIKE ? OR a.data LIKE ? OR
                              CONCAT(IFNULL(ad.first_name, ''), ' ', IFNULL(ad.last_name, '')) LIKE ? OR
                              CONCAT(IFNULL(up.first_name, ''), ' ', IFNULL(up.last_name, '')) LIKE ?)";
                $params = array_merge($params, array_fill(0, 9, $searchTerm));
            }
        
            // Filter by date range
            if (!empty($filters['start_date'])) {
                $whereConditions[] = "a.created_at >= ?";
                $params[] = $filters['start_date'] . ' 00:00:00';
            }
        
            if (!empty($filters['end_date'])) {
                $whereConditions[] = "a.created_at <= ?";
                $params[] = $filters['end_date'] . ' 23:59:59';
            }
        
            // Exclude ActivityTracking module if requested
            if (!empty($filters['exclude_activity_tracking']) && $filters['exclude_activity_tracking']) {
                $whereConditions[] = "a.module != ?";
                $params[] = 'ActivityTracking';
            }
        
            // Filter by IP address
            if (!empty($filters['ip_address'])) {
                $whereConditions[] = "a.ip_address = ?";
                $params[] = $filters['ip_address'];
            }
        
            // Filter by status code
            if (!empty($filters['status_code'])) {
                $whereConditions[] = "a.response_code = ?";
                $params[] = $filters['status_code'];
            }
        
            // Add WHERE clause if there are any conditions
            if (!empty($whereConditions)) {
                $sql .= " WHERE " . implode(' AND ', $whereConditions);
            }
        
            // Order by created_at DESC
            $sql .= " ORDER BY a.created_at DESC";
        
            // Execute query
            $activities = $this->database->fetchAll($sql, $params);
        
            return $activities;
        } catch (Exception $e) {
            error_log("Error in getFilteredActivities: " . $e->getMessage());
            throw new Exception('Error retrieving filtered activities: ' . $e->getMessage());
        }
    }
}
