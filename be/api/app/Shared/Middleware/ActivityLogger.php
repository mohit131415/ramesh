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
        $requestPath = $this->cleanRoutePath($request->getPath());
        $requestBody = $request->getBody();
        $requestIp = $request->getIp();
        $requestUserAgent = $request->getUserAgent();
        
        // Debug log for tracking
        error_log("ActivityLogger: Processing request - Method: {$requestMethod}, Path: {$requestPath}, Action: {$this->action}");
        
        // Execute the route handler FIRST
        $result = $next($request, $response);

        // CRITICAL DEBUG: Log what we got back from the route
        error_log("ActivityLogger: Route executed - Result type: " . gettype($result) . ", Response code: " . http_response_code());
        if (is_array($result)) {
            error_log("ActivityLogger: Result status: " . ($result['status'] ?? 'unknown'));
        }

        // RULE 1: NEVER log GET requests
        if (strtoupper($requestMethod) === 'GET') {
            error_log("ActivityLogger: Skipping GET request: {$requestPath}");
            return $result;
        }

        // RULE 2: NEVER log validation/verification calls (MOST IMPORTANT)
        if ($this->isValidationCall($requestPath, $this->action)) {
            return $result;
        }

        // RULE 3: Skip health check and system endpoints
        if ($this->isSystemEndpoint($requestPath)) {
            error_log("ActivityLogger: Skipping system endpoint: {$requestPath}");
            return $result;
        }

        // RULE 4: Only log if response was successful (2xx) or it's a critical error (4xx/5xx)
        $responseCode = http_response_code();
        error_log("ActivityLogger: Response code check - Code: {$responseCode}");
        if (!$this->shouldLogBasedOnResponse($responseCode, $result)) {
            error_log("ActivityLogger: Skipping due to response code: {$responseCode}");
            return $result;
        }

        // Calculate execution time
        $endTime = microtime(true);
        $executionTime = $endTime - $startTime;

        // Determine if this is admin or user route - FIXED LOGIC
        $isAdmin = $this->isAdminRoute($requestPath);
        error_log("ActivityLogger: Route classification - Path: {$requestPath}, IsAdmin: " . ($isAdmin ? 'true' : 'false'));

        // Get user ID
        $userId = $this->getUserId($request, $result, $requestPath);
        error_log("ActivityLogger: User ID retrieved: {$userId}");

        // Only log if we have a valid user ID or it's a system-level action
        $isSystemLevel = $this->isSystemLevelAction($this->action);
        error_log("ActivityLogger: System level action: " . ($isSystemLevel ? 'true' : 'false'));

        if ($userId > 0 || $isSystemLevel) {
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
            
            // Debug log to see what's happening
            error_log("ActivityLogger: Attempting to log activity - Action: {$this->action}, Route: {$requestPath}, Method: {$requestMethod}, IsAdmin: " . ($isAdmin ? '1' : '0'));
            
            // Log the activity
            $this->logActivity($activityData);
        } else {
            error_log("ActivityLogger: Skipping log - No valid user ID. UserID: {$userId}, Action: {$this->action}, IsSystemLevel: " . ($isSystemLevel ? 'true' : 'false'));
        }
        
        return $result;
    }
    
    /**
     * Clean and normalize route path - FIXED
     */
    private function cleanRoutePath($path)
    {
        // Remove any leading domain/subdirectory paths first
        $path = preg_replace('#^.*?(/api/.*)$#', '$1', $path);
        
        // Remove any duplicate /api/ segments
        $path = preg_replace('#/api/api/#', '/api/', $path);
        
        // Remove any trailing slashes except for root
        $path = rtrim($path, '/');
        if (empty($path)) {
            $path = '/';
        }
        
        // Ensure it starts with /api if it contains api
        if (!str_starts_with($path, '/api') && str_contains($path, 'api')) {
            $path = '/api' . ltrim($path, '/');
        }
        
        error_log("ActivityLogger: Cleaned path: {$path}");
        return $path;
    }

    /**
     * Check if this is a validation/verification call that should NEVER be logged
     */
    private function isValidationCall($path, $action)
    {
        // STEP 1: Check for exact validation action names (case-insensitive)
        $exactValidationActions = [
            'tokenvalidation', 'validatetoken', 'refreshtoken', 'tokenrefresh',
            'verifyotp', 'checkotp', 'validateotp', 'checktoken', 'verifytoken',
            'checksession', 'validatesession', 'refreshsession',
            'checkauth', 'validateauth', 'authcheck'
        ];
        
        $actionLower = strtolower($action);
        if (in_array($actionLower, $exactValidationActions)) {
            error_log("ActivityLogger: Excluding validation action: {$action}");
            return true;
        }
        
        // STEP 2: Check route paths (exact matches only)
        $excludedRoutes = [
            '/api/auth/validate',
            '/api/auth/verify',
            '/api/auth/refresh',
            '/api/auth/check',
            '/api/public/auth/validate',
            '/api/public/auth/verify',
            '/api/public/auth/refresh',
            '/api/public/auth/check'
        ];
        
        if (in_array($path, $excludedRoutes)) {
            error_log("ActivityLogger: Excluding validation route: {$path}");
            return true;
        }
        
        // STEP 3: Only exclude if action contains "validate" or "verify" AND it's an auth-related route
        if ((strpos($actionLower, 'validate') !== false || strpos($actionLower, 'verify') !== false) 
            && (strpos($path, '/auth/') !== false)) {
            error_log("ActivityLogger: Excluding auth validation: {$action} on {$path}");
            return true;
        }
        
        return false;
    }
    
    /**
     * Check if endpoint is system-level (health checks, etc.)
     */
    private function isSystemEndpoint($path)
    {
        $systemEndpoints = [
            '/',
            '/health',
            '/status',
            '/ping',
            '/api',
            '/api/',
            '/heartbeat',
            '/metrics'
        ];
        
        foreach ($systemEndpoints as $endpoint) {
            if ($path === $endpoint) {
                return true;
            }
        }
        
        return false;
    }
    
    /**
     * Determine if route is admin route - FIXED LOGIC
     * RULE: /api/public/* = user routes (is_admin = 0)
     * RULE: Everything else = admin routes (is_admin = 1)
     */
    private function isAdminRoute($path)
    {
        // Clean the path for comparison
        $cleanPath = strtolower(trim($path, '/'));
        
        // If route contains /public/ anywhere in the path, it's a user route
        if (strpos($cleanPath, '/public/') !== false || strpos($cleanPath, 'api/public') !== false) {
            error_log("ActivityLogger: Detected user route (contains /public/): {$path}");
            return false; // User route
        }
        
        // Everything else is admin route
        error_log("ActivityLogger: Detected admin route: {$path}");
        return true; // Admin route
    }
    
    /**
     * Should log based on response - IMPROVED
     */
    private function shouldLogBasedOnResponse($responseCode, $result = null)
    {
        // If we have a result array with status, use that
        if (is_array($result) && isset($result['status'])) {
            if ($result['status'] === 'success') {
                return true;
            }
            if ($result['status'] === 'error') {
                return true; // Log errors for debugging
            }
        }
        
        // If no response code is set, assume success
        if ($responseCode === false || $responseCode === null || $responseCode === 0) {
            error_log("ActivityLogger: No response code set, assuming success (200)");
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
        
        error_log("ActivityLogger: Response code {$responseCode} not in loggable range");
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
                error_log("ActivityLogger: ActivityRepository not available");
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
            
            error_log("ActivityLogger: Logging activity - Module: {$preparedData['module']}, Action: {$preparedData['action']}, Route: {$preparedData['route']}, IsAdmin: {$preparedData['is_admin']}");
            
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
