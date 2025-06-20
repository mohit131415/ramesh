<?php

use App\Core\Router;
use App\Features\Open\FeaturedItems\Actions\GetFeaturedProducts;
use App\Features\Open\FeaturedItems\Actions\GetFeaturedCategories;
use App\Features\Open\FeaturedItems\Actions\GetQuickPicks;
use App\Features\Open\FeaturedItems\Actions\GetAllFeaturedItems;
    
$router = Router::getInstance();

// Get featured products
$router->get('/api/public/featured/products', function ($request, $response) {
    $controller = new GetFeaturedProducts();
    return $controller->execute($request, $response);
});

// Get featured categories
$router->get('/api/public/featured/categories', function ($request, $response) {
    $controller = new GetFeaturedCategories();
    return $controller->execute($request, $response);
});

// Get quick picks
$router->get('/api/public/featured/quick-picks', function ($request, $response) {
    $controller = new GetQuickPicks();
    return $controller->execute($request, $response);
});

// Get all featured items
$router->get('/api/public/featured/all', function ($request, $response) {
    $controller = new GetAllFeaturedItems();
    return $controller->execute($request, $response);
});
