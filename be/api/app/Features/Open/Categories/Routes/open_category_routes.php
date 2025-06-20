<?php

use App\Core\Router;
use App\Features\Open\Categories\Actions\ListPublicCategories;

$router = Router::getInstance();

// List all active categories with at least one product - Public endpoint
$router->get('/api/public/categories', function ($request, $response) {
    $controller = new ListPublicCategories();
    return $controller->execute($request, $response);
});
