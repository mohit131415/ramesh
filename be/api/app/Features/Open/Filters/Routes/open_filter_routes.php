<?php

use App\Core\Router;
use App\Features\Open\Filters\Actions\ComprehensiveFilter;

$router = Router::getInstance();

// Comprehensive filter - Public (Main endpoint)
// This endpoint now handles both filtering and search functionality
$router->get('/api/public/filters/comprehensive', function ($request, $response) {
   $controller = new ComprehensiveFilter();
   return $controller($request, $response);
});

// Remove the separate search endpoint as it's now consolidated
// into the comprehensive filter endpoint above
