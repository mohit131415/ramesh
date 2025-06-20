<?php

namespace App\Features\Open\Authentication\Actions;

use App\Core\Request;
use App\Core\Response;
use App\Core\Security\TokenManager;
use App\Features\Open\Authentication\DataAccess\UserRepository;
use App\Core\Database;
use Exception;

class ValidateToken
{
    private $tokenManager;
    private $userRepository;
    private $db;
    
    public function __construct()
    {
        $this->tokenManager = new TokenManager();
        $this->userRepository = new UserRepository();
        $this->db = Database::getInstance();
    }
    
    /**
     * Validate a token and return user information
     * 
     * @param Request $request
     * @param Response $response
     * @return mixed
     */
    public function __invoke(Request $request, Response $response)
    {
        try {
            // Get token from request body or Authorization header
            $token = $request->getBody('token');
            
            // If token is not in request body, try to get it from Authorization header
            if (!$token) {
                $token = $request->getBearerToken();
            }
            
            // Check if token is provided
            if (!$token) {
                return $response->json([
                    'status' => 'error',
                    'message' => 'Your session information is missing. Please sign in again.',
                    'data' => null
                ]);
            }
            
            // Log the token for debugging
            error_log("Token being validated: " . substr($token, 0, 20) . "...");
            
            // Validate token
            try {
                $payload = $this->tokenManager->validateToken($token, false);
                
                // Log the payload for debugging
                error_log("Token payload: " . json_encode($payload));
                
                // Get user ID from token - try different possible locations
                $userId = null;
                
                // Try standard JWT claim
                if (isset($payload->sub)) {
                    $userId = $payload->sub;
                }
                // Try custom property
                else if (isset($payload->user_id)) {
                    $userId = $payload->user_id;
                }
                // Try data object if present
                else if (isset($payload->data) && is_object($payload->data)) {
                    if (isset($payload->data->user_id)) {
                        $userId = $payload->data->user_id;
                    } else if (isset($payload->data->id)) {
                        $userId = $payload->data->id;
                    }
                }
                
                if (!$userId) {
                    return $response->json([
                        'status' => 'error',
                        'message' => 'Your session has expired or is invalid. Please sign in again.',
                        'data' => null
                    ]);
                }
                
                // Convert to integer to ensure proper type
                $userId = (int)$userId;
                
                // Log the user ID for debugging
                error_log("User ID from token: " . $userId);
                
                // Debug database connection
                $this->debugDatabaseConnection();
                
                // List all users for debugging
                $allUsers = $this->userRepository->getAllUsers();
                error_log("All users in database: " . json_encode($allUsers));
                
                // Get user data
                $user = $this->userRepository->getUserById($userId);
                
                // Log the user data for debugging
                error_log("User data from database: " . json_encode($user));
                
                if (!$user) {
                    // Try direct database query as a last resort
                    try {
                        $directResult = $this->db->fetchAll("SELECT * FROM users WHERE id = {$userId}");
                        error_log("Direct query result: " . json_encode($directResult));
                        
                        if (!empty($directResult) && isset($directResult[0])) {
                            $user = $directResult[0];
                        }
                    } catch (Exception $e) {
                        error_log("Error in direct query: " . $e->getMessage());
                    }
                    
                    if (!$user) {
                        return $response->json([
                            'status' => 'error',
                            'message' => "We couldn't find your account information. Please sign in again or contact customer support.",
                            'data' => null
                        ]);
                    }
                }
                
                // Return success response
                return $response->json([
                    'status' => 'success',
                    'message' => 'Your session is active and secure.',
                    'data' => [
                        'user' => [
                            'id' => $user['id'],
                            'phone_number' => $user['phone_number'],
                            'status' => $user['status'] ?? null,
                            'created_at' => $user['created_at'] ?? null,
                            'last_login_at' => $user['last_login_at'] ?? null
                        ],
                        'token_expires_at' => date('Y-m-d H:i:s', $payload->exp)
                    ]
                ]);
            } catch (Exception $e) {
                // Log the exception for debugging
                error_log("Token validation exception: " . $e->getMessage());
                
                // Token validation failed
                return $response->json([
                    'status' => 'error',
                    'message' => 'Your session has expired. Please sign in again.',
                    'data' => null
                ]);
            }
        } catch (Exception $e) {
            error_log("Error in ValidateToken action: " . $e->getMessage());
            return $response->json([
                'status' => 'error',
                'message' => 'We couldn\'t verify your session. Please sign in again.',
                'data' => null
            ]);
        }
    }
    
    /**
     * Debug database connection
     */
    private function debugDatabaseConnection()
    {
        try {
            // Test database connection
            $result = $this->db->fetch("SELECT 1 as test");
            error_log("Database connection test: " . json_encode($result));
            
            // Get database name
            $dbInfo = $this->db->fetch("SELECT DATABASE() as db_name");
            error_log("Current database: " . json_encode($dbInfo));
            
            // Check if users table exists
            $tables = $this->db->fetchAll("SHOW TABLES");
            $tableNames = [];
            foreach ($tables as $table) {
                $tableNames[] = reset($table); // Get the first value in each row
            }
            
            error_log("Database tables: " . json_encode($tableNames));
            
            // Check if users table exists
            if (in_array('users', $tableNames)) {
                // Check users table structure
                $columns = $this->db->fetchAll("DESCRIBE users");
                error_log("Users table structure: " . json_encode($columns));
                
                // Count users
                $count = $this->db->fetch("SELECT COUNT(*) as count FROM users");
                error_log("Number of users in database: " . ($count['count'] ?? 'unknown'));
                
                // Get first few users
                $users = $this->db->fetchAll("SELECT * FROM users LIMIT 5");
                error_log("Sample users: " . json_encode($users));
            } else {
                error_log("Users table does not exist!");
            }
        } catch (Exception $e) {
            error_log("Error debugging database connection: " . $e->getMessage());
        }
    }
}
