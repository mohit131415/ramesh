<?php

namespace App\Core;

use App\Shared\Exceptions\NotFoundException;
use Throwable;

class Router
{
    private static $instance = null;
    private $routes = [];
    private $middlewares = [];
    private $notFoundHandler;

    private function __construct()
    {
        $this->notFoundHandler = function () {
            return [
                'status' => 'error',
                'message' => 'Route not found',
                'data' => null
            ];
        };
    }

    public static function getInstance()
    {
        if (self::$instance === null) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    public function get($path, $handler, $middlewares = [])
    {
        return $this->addRoute('GET', $path, $handler, $middlewares);
    }

    public function post($path, $handler, $middlewares = [])
    {
        return $this->addRoute('POST', $path, $handler, $middlewares);
    }

    public function put($path, $handler, $middlewares = [])
    {
        return $this->addRoute('PUT', $path, $handler, $middlewares);
    }

    public function delete($path, $handler, $middlewares = [])
    {
        return $this->addRoute('DELETE', $path, $handler, $middlewares);
    }

    public function addRoute($method, $path, $handler, $middlewares = [])
    {
        $this->routes[strtoupper($method)][$path] = [
            'handler' => $handler,
            'middlewares' => $middlewares
        ];
        
        return $this;
    }

    public function resolve($method, $path)
    {
        $method = strtoupper($method);
        
        // Check for method override in POST requests
        if ($method === 'POST' && isset($_POST['_method'])) {
            $method = strtoupper($_POST['_method']);
            error_log("Method override detected: " . $method);
        }
        
        // First, try exact match
        if (isset($this->routes[$method][$path])) {
            $route = $this->routes[$method][$path];
            return $this->wrapHandlerWithMiddleware($route['handler'], $route['middlewares']);
        }
        
        // If no exact match, try to match routes with parameters
        foreach ($this->routes[$method] as $routePath => $route) {
            // Skip if not a parameterized route
            if (strpos($routePath, ':') === false) {
                continue;
            }
            
            // Convert route parameters to regex pattern
            $pattern = preg_replace('/:([^\/]+)/', '(?P<$1>[^/]+)', $routePath);
            $pattern = '#^' . $pattern . '$#';
            
            if (preg_match($pattern, $path, $matches)) {
                // Extract parameters
                $params = [];
                foreach ($matches as $key => $value) {
                    if (is_string($key)) {
                        $params[$key] = $value;
                    }
                }
                
                // Create a new handler that injects the parameters
                $handler = function ($request, $response) use ($route, $params) {
                    // Add parameters to request
                    $request->setParams($params);
                    // Pass the parameters as the third argument to the original handler
                    return call_user_func($route['handler'], $request, $response, $params);
                };
                
                return $this->wrapHandlerWithMiddleware($handler, $route['middlewares']);
            }
        }
        
        // If no match found, return 404 handler
        return $this->notFoundHandler;
    }
    
    private function wrapHandlerWithMiddleware($handler, $middlewares)
    {
        // If no middlewares, return handler directly
        if (empty($middlewares)) {
            return $handler;
        }
        
        // Wrap handler with middlewares
        $next = $handler;
        foreach (array_reverse($middlewares) as $middleware) {
            $next = function ($request, $response) use ($middleware, $next) {
                try {
                    return $middleware->handle($request, $response, $next);
                } catch (Throwable $e) {
                    // If middleware fails, log and continue to the handler
                    error_log("Middleware error: " . $e->getMessage());
                    return [
                        'status' => 'error',
                        'message' => $e->getMessage(),
                        'data' => null
                    ];
                }
            };
        }
        
        return $next;
    }

    public function setNotFoundHandler($handler)
    {
        $this->notFoundHandler = $handler;
    }
}
