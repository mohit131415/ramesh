<?php

namespace App\Shared\Middleware;

use App\Core\Request;
use App\Core\Response;
use App\Core\Security\Authentication;
use App\Features\ActivityTracking\DataAccess\ActivityRepository;

class ActivityLogger
{
    private $authentication;
    private $activityRepository;
    private $module;
    private $action;

    // Actions that should NEVER be logged (noise reduction)
    private const EXCLUDED_ACTIONS = [
        'Validate', 'ValidateToken', 'TokenValidation', 'TokenRefresh', 'RefreshToken',
        'Get', 'List', 'View', 'Check', 'Verify', 'Search', 'Filter',
        'GetAll', 'GetBy', 'ListAll', 'ViewAll', 'CheckAll',
        'GetPublic', 'ListPublic', 'ViewPublic', 'SearchPublic',
        'GetCart', 'GetProfile', 'GetAddress', 'GetOrder', 'GetCoupon',
        'GetCategory', 'GetProduct', 'GetSubcategory', 'GetFeatured'
    ];

    // Routes that should NEVER be logged
    private const EXCLUDED_ROUTES = [
        '/api/auth/validate',
        '/api/auth/refresh',
        '/api/public/products',
        '/api/public/categories',
        '/api/public/subcategories',
        '/api/public/search',
        '/api/public/filters',
        '/api/public/featured-items',
        '/api/public/cart/get',
        '/api/public/user/profile/get',
        '/api/public/user/addresses/get'
    ];

    // HTTP methods that should generally be excluded (except for important actions)
    private const EXCLUDED_METHODS = ['GET', 'HEAD', 'OPTIONS'];

    // Critical actions that should ALWAYS be logged regardless of method
    private const CRITICAL_ACTIONS = [
        'Login', 'Logout', 'Register', 'PasswordChange', 'ChangePassword',
        'Create', 'Update', 'Delete', 'Restore', 'Cancel', 'Refund',
        'Add', 'Remove', 'Apply', 'Place', 'Complete', 'Process',
        'CreateOrder', 'CancelOrder', 'UpdateOrderStatus', 'RefundOrder',
        'AddToCart', 'RemoveFromCart', 'ApplyCoupon', 'RemoveCoupon',
        'CreateAdmin', 'UpdateAdmin', 'DeleteAdmin', 'UpdateAdminStatus',
        'CreateProduct', 'UpdateProduct', 'DeleteProduct',
        'CreateCategory', 'UpdateCategory', 'DeleteCategory',
        'CreateCoupon', 'UpdateCoupon', 'DeleteCoupon',
        'UpdateProfile', 'CreateProfile', 'UpdateAddress', 'CreateAddress', 'DeleteAddress'
    ];

    public function __construct($module, $action)
    {
        $this->module = $module;
        $this->action = $action;
        
        try {
            $this->authentication = Authentication::getInstance();
        } catch (\Exception $e) {
            $this->authentication = null;
        }
        
        try {
            $this->activityRepository = new ActivityRepository();
        } catch (\Exception $e) {
            $this->activityRepository = null;
        }
    }

    public function handle(Request $request, Response $response, $next)
    {
        $startTime = microtime(true);
        
        // Capture request data
        $requestMethod = $request->getMethod();
        $requestPath = $request->getPath();
        $requestBody = $request->getBody();
        $requestIp = $request->getIp();
        $requestUserAgent = $request->getUserAgent();
        
        // Execute the route handler FIRST
        $result = $next($request, $response);
        
        // Early exit if this action should not be logged
        if (!$this->shouldLogActivity($requestMethod, $requestPath, $this->action)) {
            return $result;
        }
        
        // Calculate execution time
        $endTime = microtime(true);
        $executionTime = $endTime - $startTime;
        $responseCode = http_response_code();
        
        // Only log if response was successful or if it's a critical action
        if (!$this->shouldLogBasedOnResponse($responseCode, $this->action)) {
            return $result;
        }
        
        // Determine admin status and user ID
        $isAdmin = $this->isAdminRoute($requestPath);
        $userId = $this->getUserId($request, $result, $requestPath);
        
        // Only log if we have a valid user ID or it's a system-level action
        if ($userId > 0 || $this->isSystemLevelAction($this->action)) {
            // Prepare activity data
            $activityData = [
                'user_id' => $userId,
                'is_admin' => $isAdmin ? 1 : 0,
                'module' => $this->module,
                'action' => $this->action,
                'route' => $requestPath,
                'ip_address' => $requestIp,
                'user_agent' => $requestUserAgent,
                'request_data' => $this->sanitizeRequestData($requestBody),
                'response_code' => $responseCode,
                'execution_time' => $executionTime,
                'result_data' => $this->sanitizeResultData($result)
            ];
            
            // Log the activity
            $this->logActivity($activityData);
        }
        
        return $result;
    }
    
    /**
     * Determine if an activity should be logged based on multiple criteria
     */
    private function shouldLogActivity($method, $path, $action)
    {
        // 1. Check if action is explicitly excluded
        foreach (self::EXCLUDED_ACTIONS as $excludedAction) {
            if (stripos($action, $excludedAction) !== false) {
                // But allow if it's a critical action
                if (!$this->isCriticalAction($action)) {
                    return false;
                }
            }
        }
        
        // 2. Check if route is explicitly excluded
        foreach (self::EXCLUDED_ROUTES as $excludedRoute) {
            if (strpos($path, $excludedRoute) === 0) {
                // But allow if it's a critical action
                if (!$this->isCriticalAction($action)) {
                    return false;
                }
            }
        }
        
        // 3. Check if method should be excluded
        if (in_array($method, self::EXCLUDED_METHODS)) {
            // But allow if it's a critical action
            if (!$this->isCriticalAction($action)) {
                return false;
            }
        }
        
        // 4. Skip health check and status endpoints
        if (strpos($path, '/health') !== false || 
            strpos($path, '/status') !== false || 
            strpos($path, '/ping') !== false ||
            $path === '/' || $path === '/api') {
            return false;
        }
        
        return true;
    }
    
    /**
     * Check if an action is critical and should always be logged
     */
    private function isCriticalAction($action)
    {
        foreach (self::CRITICAL_ACTIONS as $criticalAction) {
            if (stripos($action, $criticalAction) !== false) {
                return true;
            }
        }
        return false;
    }
    
    /**
     * Check if action is system-level (doesn't require user ID)
     */
    private function isSystemLevelAction($action)
    {
        $systemActions = ['Register', 'Login', 'CreateAdmin', 'SystemError', 'SecurityBreach'];
        
        foreach ($systemActions as $systemAction) {
            if (stripos($action, $systemAction) !== false) {
                return true;
            }
        }
        
        return false;
    }
    
    /**
     * Determine if we should log based on response code
     */
    private function shouldLogBasedOnResponse($responseCode, $action)
    {
        // Always log critical actions regardless of response
        if ($this->isCriticalAction($action)) {
            return true;
        }
        
        // Log successful operations (2xx)
        if ($responseCode >= 200 && $responseCode < 300) {
            return true;
        }
        
        // Log client errors (4xx) and server errors (5xx) for security monitoring
        if ($responseCode >= 400) {
            return true;
        }
        
        return false;
    }
    
    /**
     * Determine if route is admin route
     */
    private function isAdminRoute($path)
    {
        return strpos($path, '/api/public') !== 0;
    }
    
    /**
     * Get user ID from various sources
     */
    private function getUserId($request, $result = null, $requestPath = '')
    {
        try {
            // For login/register actions, get user ID from result
            if (in_array($this->action, ['Login', 'Register']) && $result && is_array($result)) {
                $userId = $this->extractUserIdFromResult($result);
                if ($userId) {
                    return $userId;
                }
            }
            
            // Try to get from authentication token
            $token = $request->getBearerToken();
            if ($token) {
                try {
                    $tokenManager = new \App\Core\Security\TokenManager();
                    $payload = $tokenManager->validateToken($token, false);
                    
                    $userId = $this->extractUserIdFromToken($payload);
                    if ($userId) {
                        return (int)$userId;
                    }
                } catch (\Exception $e) {
                    // Token validation failed, continue with other methods
                }
            }
            
            // Try to get from authentication instance
            if ($this->authentication) {
                $user = $this->authentication->user();
                if ($user && isset($user['id'])) {
                    return (int)$user['id'];
                }
            }
            
        } catch (\Exception $e) {
            error_log("ActivityLogger: Error getting user ID: " . $e->getMessage());
        }
        
        return 0;
    }
    
    /**
     * Extract user ID from login/register result
     */
    private function extractUserIdFromResult($result)
    {
        $possiblePaths = [
            'data.user.id',
            'user.id',
            'data.id',
            'id'
        ];
        
        foreach ($possiblePaths as $path) {
            $userId = $this->getNestedValue($result, $path);
            if ($userId) {
                return (int)$userId;
            }
        }
        
        return null;
    }
    
    /**
     * Extract user ID from token payload
     */
    private function extractUserIdFromToken($payload)
    {
        if (isset($payload->sub)) {
            return $payload->sub;
        }
        
        if (isset($payload->user_id)) {
            return $payload->user_id;
        }
        
        if (isset($payload->data) && is_object($payload->data)) {
            if (isset($payload->data->user_id)) {
                return $payload->data->user_id;
            }
            if (isset($payload->data->id)) {
                return $payload->data->id;
            }
        }
        
        return null;
    }
    
    /**
     * Get nested value from array using dot notation
     */
    private function getNestedValue($array, $path)
    {
        $keys = explode('.', $path);
        $current = $array;
        
        foreach ($keys as $key) {
            if (is_array($current) && isset($current[$key])) {
                $current = $current[$key];
            } else {
                return null;
            }
        }
        
        return $current;
    }
    
    /**
     * Sanitize request data for logging
     */
    private function sanitizeRequestData($data)
    {
        if (empty($data)) {
            return '{}';
        }
        
        if (is_array($data)) {
            // Remove sensitive fields
            $sensitiveFields = ['password', 'confirm_password', 'token', 'secret', 'key', 'otp'];
            foreach ($sensitiveFields as $field) {
                if (isset($data[$field])) {
                    $data[$field] = '[REDACTED]';
                }
            }
        }
        
        return $this->formatJsonData($data);
    }
    
    /**
     * Sanitize result data for logging
     */
    private function sanitizeResultData($data)
    {
        if (empty($data)) {
            return '{}';
        }
        
        // For successful operations, only log essential info
        if (is_array($data) && isset($data['status']) && $data['status'] === 'success') {
            return json_encode([
                'status' => $data['status'],
                'message' => $data['message'] ?? 'Operation completed successfully'
            ]);
        }
        
        // For errors, log more details for debugging
        if (is_array($data) && isset($data['status']) && $data['status'] === 'error') {
            return $this->formatJsonData($data);
        }
        
        return '{"status": "logged"}';
    }
    
    /**
     * Log the activity to database
     */
    private function logActivity($data)
    {
        try {
            if (!$this->activityRepository) {
                return;
            }
            
            $preparedData = [
                'user_id' => (int)($data['user_id'] ?: 0),
                'is_admin' => (int)$data['is_admin'],
                'module' => (string)($data['module'] ?: 'System'),
                'action' => (string)($data['action'] ?: 'Unknown'),
                'route' => (string)($data['route'] ?: 'Unknown'),
                'ip_address' => (string)($data['ip_address'] ?: '0.0.0.0'),
                'user_agent' => (string)($data['user_agent'] ?: 'Unknown'),
                'request_data' => $data['request_data'],
                'response_code' => (int)($data['response_code'] ?: 200),
                'execution_time' => (float)($data['execution_time'] ?: 0.0),
                'data' => $data['result_data']
            ];
            
            $this->activityRepository->logActivity($preparedData);
            
        } catch (\Exception $e) {
            error_log("ActivityLogger: Failed to log activity: " . $e->getMessage());
        }
    }
    
    /**
     * Format data as JSON
     */
    private function formatJsonData($data)
    {
        if (empty($data)) {
            return '{}';
        }
        
        if (is_string($data)) {
            $decoded = json_decode($data, true);
            if (json_last_error() === JSON_ERROR_NONE) {
                return $data;
            }
            return json_encode(['raw_data' => $data]);
        }
        
        if (is_array($data) || is_object($data)) {
            $encoded = json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
            if ($encoded === false) {
                return json_encode(['error' => 'Failed to encode data']);
            }
            return $encoded;
        }
        
        return json_encode(['value' => (string)$data, 'type' => gettype($data)]);
    }
}
