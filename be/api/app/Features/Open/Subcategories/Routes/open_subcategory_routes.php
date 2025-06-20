<?php

use App\Core\Router;
use App\Features\Open\Subcategories\Actions\ListSubcategoriesByCategory;

// Get router instance
$router = Router::getInstance();

// Define routes for public subcategory endpoints
$router->get('/api/public/subcategories', function($request, $response) {
    $action = new ListSubcategoriesByCategory();
    return $action($request);
});
