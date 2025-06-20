<?php

use App\Core\Router;
use App\Features\Open\Search\Actions\UnifiedSearch;

$router = Router::getInstance();

// Single public search route
$router->get('/api/public/search', function ($request, $response) {
    $controller = new UnifiedSearch();
    return $controller->execute($request, $response);
});
