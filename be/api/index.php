<?php

// Define application root directory
define('APP_ROOT', __DIR__);

// Prevent direct output before headers are sent
ob_start();

// Load Composer autoloader
require_once APP_ROOT . '/vendor/autoload.php';

// Load environment variables - continue even if .env file is missing
try {
    $dotenv = Dotenv\Dotenv::createImmutable(APP_ROOT);
    $dotenv->safeLoad();
} catch (Throwable $e) {
    // Log but continue - use default values
    error_log("Error loading .env file: " . $e->getMessage());
}

// Set error handling
error_reporting(E_ALL);
ini_set('display_errors', false); // Never display errors directly
ini_set('log_errors', true);
ini_set('error_log', APP_ROOT . '/storage/logs/php-errors.log');

// Create logs directory if it doesn't exist
if (!is_dir(APP_ROOT . '/storage/logs')) {
    mkdir(APP_ROOT . '/storage/logs', 0755, true);
}

// Register error and exception handlers
set_error_handler('App\Shared\Exceptions\ApiException::handleError');
set_exception_handler('App\Shared\Exceptions\ApiException::handleException');

// Ensure JSON response even for fatal errors
register_shutdown_function(function() {
    $error = error_get_last();
    if ($error !== null && in_array($error['type'], [E_ERROR, E_PARSE, E_CORE_ERROR, E_COMPILE_ERROR])) {
        ob_end_clean(); // Clear any output
        
        // Send JSON response for fatal errors
        header('Content-Type: application/json');
        http_response_code(500);
        echo json_encode([
            'status' => 'error',
            'message' => 'Fatal error occurred: ' . $error['message'],
            'data' => null
        ]);
    }
});

try {
    // Initialize application
    $app = App\Core\Application::getInstance();
    
    // Load routes - wrapped in try-catch to continue even if some routes fail
    try {
        require_once APP_ROOT . '/config/routes.php';
    } catch (Throwable $e) {
        error_log("Error loading routes: " . $e->getMessage());
        // Continue with default routes
    }
    
    // Run application
    $app->run();
} catch (Throwable $e) {
    // This is a fallback in case the exception handler doesn't catch it
    ob_end_clean(); // Clear any output
    
    // Send JSON response
    header('Content-Type: application/json');
    http_response_code(500);
    echo json_encode([
        'status' => 'error',
        'message' => 'Unhandled exception: ' . $e->getMessage(),
        'data' => null
    ]);
}

// Flush output buffer
ob_end_flush();
