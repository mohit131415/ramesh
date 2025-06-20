<?php

namespace App\Core;

use App\Core\Request;
use App\Core\Response;
use App\Core\Router;
use App\Core\Database;
use App\Shared\Middleware\CorsHandler;
use App\Shared\Exceptions\ApiException;
use App\Features\ActivityTracking\Utils\SchemaSetup;
use Exception;
use Throwable;

class Application
{
    private $request;
    private $response;
    private $router;
    private $database;
    private static $instance = null;

    public function __construct()
    {
        // Set default timezone
        date_default_timezone_set(config('app.timezone', 'UTC'));

        try {
            // Initialize components
            $this->request = new Request();
            $this->response = new Response();
            $this->router = Router::getInstance();
            
            // Database is optional - if it fails, the API can still serve static routes
            try {
                $this->database = Database::getInstance();
                
                // Ensure required tables exist
                $this->setupSchema();
            } catch (Throwable $e) {
                error_log("Database initialization error: " . $e->getMessage());
                // Continue without database
            }
            
            // Store instance for singleton access
            self::$instance = $this;
        } catch (Exception $e) {
            // Log the error but continue execution
            error_log("Application initialization error: " . $e->getMessage());
            
            // Even if some components fail, we'll still handle the request
            if (!isset($this->request)) $this->request = new Request();
            if (!isset($this->response)) $this->response = new Response();
            if (!isset($this->router)) $this->router = Router::getInstance();
        }
    }

    private function setupSchema()
    {
        try {
            // Ensure activity_logs table exists
            $schemaSetup = new SchemaSetup();
            $schemaSetup->ensureActivityLogsTableExists();
        } catch (Throwable $e) {
            error_log("Schema setup error: " . $e->getMessage());
            // Continue even if schema setup fails
        }
    }

    public static function getInstance()
    {
        if (self::$instance === null) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    public function run()
    {
        try {
            // Apply CORS middleware
            (new CorsHandler())->handle($this->request, $this->response, function() {});
            
            // Get route handler
            $handler = $this->router->resolve(
                $this->request->getMethod(),
                $this->request->getPath()
            );

            // Execute the route handler and get response
            $result = call_user_func($handler, $this->request, $this->response);
            
            // If the handler didn't send a response, do it now
            if ($result !== null) {
                // Format the response if it's not already formatted
                if (!isset($result['status'])) {
                    $result = [
                        'status' => 'success',
                        'message' => 'Success',
                        'data' => $result
                    ];
                }
                
                // Send the response
                $this->response->json($result);
            }
        } catch (Throwable $e) {
            // Handle any exceptions
            $this->handleException($e);
        }
    }

    private function handleException(Throwable $e)
    {
        // Log the exception
        error_log("Application exception: " . $e->getMessage() . " in " . $e->getFile() . " on line " . $e->getLine());
        
        // Create a new response if needed
        if (!isset($this->response)) {
            $this->response = new Response();
        }
        
        // Send error response
        $this->response->json([
            'status' => 'error',
            'message' => $e->getMessage(),
            'data' => null
        ], 500);
    }

    public function getRequest()
    {
        return $this->request;
    }

    public function getResponse()
    {
        return $this->response;
    }

    public function getRouter()
    {
        return $this->router;
    }

    public function getDatabase()
    {
        return $this->database;
    }
}
