<?php

namespace App\Shared\Exceptions;

use Exception;
use App\Core\Response;

class ApiException extends Exception
{
    protected $statusCode;
    protected $errorCode;
    protected $errors = [];

    public function __construct($message = '', $statusCode = 500, $errorCode = null, $errors = [])
    {
        parent::__construct($message);
        $this->statusCode = $statusCode;
        $this->errorCode = $errorCode;
        $this->errors = $errors;
    }

    public function getStatusCode()
    {
        return $this->statusCode;
    }

    public function getErrorCode()
    {
        return $this->errorCode;
    }

    public function getErrors()
    {
        return $this->errors;
    }

    public static function handleException($exception)
    {
        // Log the exception
        error_log($exception->getMessage() . ' in ' . $exception->getFile() . ' on line ' . $exception->getLine());
        
        $response = new Response();
        
        // Handle different exception types
        if ($exception instanceof ValidationException) {
            return $response->json([
                'status' => 'error',
                'message' => $exception->getMessage(),
                'data' => null,
                'errors' => $exception->getErrors()
            ], 422);
        } else if ($exception instanceof AuthenticationException) {
            return $response->json([
                'status' => 'error',
                'message' => $exception->getMessage(),
                'data' => null
            ], 401);
        } else if ($exception instanceof AuthorizationException) {
            return $response->json([
                'status' => 'error',
                'message' => $exception->getMessage(),
                'data' => null
            ], 403);
        } else if ($exception instanceof NotFoundException) {
            return $response->json([
                'status' => 'error',
                'message' => $exception->getMessage(),
                'data' => null
            ], 404);
        } else if ($exception instanceof ApiException) {
            return $response->json([
                'status' => 'error',
                'message' => $exception->getMessage(),
                'data' => null,
                'code' => $exception->getErrorCode(),
                'errors' => $exception->getErrors()
            ], $exception->getStatusCode());
        } else {
            // For all other exceptions
            $debug = config('app.debug', false);
            
            $responseData = [
                'status' => 'error',
                'message' => $debug ? $exception->getMessage() : 'Internal Server Error',
                'data' => null
            ];
            
            if ($debug) {
                $responseData['debug'] = [
                    'file' => $exception->getFile(),
                    'line' => $exception->getLine(),
                    'trace' => explode("\n", $exception->getTraceAsString())
                ];
            }
            
            return $response->json($responseData, 500);
        }
    }

    public static function handleError($level, $message, $file, $line)
    {
        // Convert errors to exceptions
        throw new self("Error: $message in $file on line $line", 500);
    }
}
