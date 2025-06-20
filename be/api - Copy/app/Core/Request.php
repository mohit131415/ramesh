<?php

namespace App\Core;

class Request
{
    private $params = [];
    private $query = [];
    private $body = [];
    private $files = [];
    private $method;
    private $path;
    private $headers = [];
    private $ip;
    private $userAgent;
    private $startTime;

    public function __construct()
    {
        $this->startTime = microtime(true);
        $this->params = [];
        
        // Parse query parameters from URL
        $this->parseQueryParams();
        
        $this->method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
        
        // Handle PUT, DELETE methods via POST with _method parameter
        if ($this->method === 'POST' && isset($_POST['_method'])) {
            $this->method = strtoupper($_POST['_method']);
        }
        
        // Parse request body based on Content-Type
        $this->parseBody();
        
        // Get request path
        $this->path = $this->parsePath();
        
        // Get request headers
        $this->headers = $this->parseHeaders();
        
        // Get client IP
        $this->ip = $this->getClientIp();
        
        // Get user agent
        $this->userAgent = $_SERVER['HTTP_USER_AGENT'] ?? '';
        
        // Get uploaded files
        $this->files = $_FILES ?? [];
        
        // Debug log
        error_log("Request path: " . $this->path);
        error_log("Request query params: " . json_encode($this->query));
    }

    private function parseQueryParams()
    {
        // Get query string from URL
        $queryString = $_SERVER['QUERY_STRING'] ?? '';
        
        // Parse query string into an array
        parse_str($queryString, $queryParams);
        
        // Store query parameters
        $this->query = $queryParams;
        
        // Also include $_GET for compatibility
        if (!empty($_GET)) {
            $this->query = array_merge($this->query, $_GET);
        }
    }

    private function parsePath()
    {
        $path = $_SERVER['REQUEST_URI'] ?? '/';
        $position = strpos($path, '?');
        
        if ($position !== false) {
            $path = substr($path, 0, $position);
        }
        
        // Remove script name from path if it exists
        $scriptName = $_SERVER['SCRIPT_NAME'] ?? '';
        $scriptPath = dirname($scriptName);
        
        if ($scriptPath !== '/' && $scriptPath !== '\\') {
            $path = str_replace($scriptPath, '', $path);
        }
        
        return $path ?: '/';
    }

    private function parseBody()
    {
        if ($this->method === 'GET') {
            $this->body = [];
            return;
        }
        
        $contentType = $_SERVER['CONTENT_TYPE'] ?? '';
        
        // Check if it's a multipart/form-data request (file upload)
        if (strpos($contentType, 'multipart/form-data') !== false) {
            // For POST requests, PHP automatically populates $_POST
            if ($this->method === 'POST') {
                $this->body = $_POST ?? [];
            } 
            // For PUT, DELETE, etc. we need to parse the input manually
            else {
                // For PUT requests with form data, we'll use $_POST if available
                // This works because we're using method override in the HTML form
                $this->body = $_POST ?? [];
                
                // If $_POST is empty, try to parse the raw input
                if (empty($this->body)) {
                    parse_str(file_get_contents('php://input'), $this->body);
                }
            }
        } 
        // Handle JSON content type
        else if (strpos($contentType, 'application/json') !== false) {
            $json = file_get_contents('php://input');
            $this->body = json_decode($json, true) ?? [];
            
            // Debug log
            error_log("Received JSON body: " . $json);
        } 
        // Handle URL encoded form data
        else if (strpos($contentType, 'application/x-www-form-urlencoded') !== false) {
            if ($this->method === 'POST') {
                $this->body = $_POST ?? [];
            } else {
                parse_str(file_get_contents('php://input'), $this->body);
            }
        } 
        // Default fallback
        else {
            // Try to parse the input anyway
            $input = file_get_contents('php://input');
            if (!empty($input)) {
                parse_str($input, $this->body);
                if (empty($this->body) && $input[0] === '{') {
                    // Try JSON as a fallback
                    $this->body = json_decode($input, true) ?? [];
                }
            } else {
                $this->body = [];
            }
        }
        
        // Debug log
        error_log("Parsed request body: " . json_encode($this->body));
    }

    private function parseHeaders()
    {
        $headers = [];
        
        // Try to get all headers using getallheaders() if available
        if (function_exists('getallheaders')) {
            $allHeaders = getallheaders();
            foreach ($allHeaders as $name => $value) {
                $headers[$name] = $value;
            }
        } else {
            // Fallback to $_SERVER
            foreach ($_SERVER as $key => $value) {
                if (strpos($key, 'HTTP_') === 0) {
                    $name = str_replace(' ', '-', ucwords(str_replace('_', ' ', strtolower(substr($key, 5)))));
                    $headers[$name] = $value;
                } else if (in_array($key, ['CONTENT_TYPE', 'CONTENT_LENGTH', 'CONTENT_MD5'])) {
                    $name = str_replace(' ', '-', ucwords(str_replace('_', ' ', strtolower($key))));
                    $headers[$name] = $value;
                }
            }
        }
        
        // Special handling for Authorization header which might be in different places
        if (!isset($headers['Authorization']) && isset($_SERVER['HTTP_AUTHORIZATION'])) {
            $headers['Authorization'] = $_SERVER['HTTP_AUTHORIZATION'];
        } else if (!isset($headers['Authorization']) && isset($_SERVER['REDIRECT_HTTP_AUTHORIZATION'])) {
            $headers['Authorization'] = $_SERVER['REDIRECT_HTTP_AUTHORIZATION'];
        } else if (!isset($headers['Authorization']) && function_exists('apache_request_headers')) {
            $apacheHeaders = apache_request_headers();
            if (isset($apacheHeaders['Authorization'])) {
                $headers['Authorization'] = $apacheHeaders['Authorization'];
            }
        }
        
        return $headers;
    }

    private function getClientIp()
    {
        if (!empty($_SERVER['HTTP_CLIENT_IP'])) {
            return $_SERVER['HTTP_CLIENT_IP'];
        } else if (!empty($_SERVER['HTTP_X_FORWARDED_FOR'])) {
            return $_SERVER['HTTP_X_FORWARDED_FOR'];
        } else {
            return $_SERVER['REMOTE_ADDR'] ?? '';
        }
    }

    public function getMethod()
    {
        return $this->method;
    }

    public function getPath()
    {
        return $this->path;
    }

    public function getQuery($key = null, $default = null)
    {
        if ($key === null) {
            return $this->query;
        }
        
        return $this->query[$key] ?? $default;
    }

    public function getParam($key = null, $default = null)
    {
        if ($key === null) {
            return $this->params;
        }
        
        return $this->params[$key] ?? $default;
    }

    public function setParams($params)
    {
        $this->params = array_merge($this->params, $params);
    }

    public function getBody($key = null, $default = null)
    {
        if ($key === null) {
            return $this->body;
        }
        
        return $this->body[$key] ?? $default;
    }

    public function getFile($key = null)
    {
        if ($key === null) {
            return $this->files;
        }
        
        return $this->files[$key] ?? null;
    }

    public function getHeader($key = null, $default = null)
    {
        if ($key === null) {
            return $this->headers;
        }
        
        // Case-insensitive header lookup
        foreach ($this->headers as $headerKey => $headerValue) {
            if (strtolower($headerKey) === strtolower($key)) {
                return $headerValue;
            }
        }
        
        return $default;
    }

    public function getBearerToken()
    {
        $authHeader = $this->getHeader('Authorization');
        
        if (!$authHeader) {
            error_log("No Authorization header found");
            return null;
        }
        
        if (preg_match('/Bearer\s+(.*)$/i', $authHeader, $matches)) {
            return $matches[1];
        }
        
        return null;
    }

    public function getIp()
    {
        return $this->ip;
    }

    public function getUserAgent()
    {
        return $this->userAgent;
    }

    public function getStartTime()
    {
        return $this->startTime;
    }
}
