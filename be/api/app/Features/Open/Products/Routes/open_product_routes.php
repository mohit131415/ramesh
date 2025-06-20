<?php

use App\Core\Router;
use App\Features\Open\Products\Actions\ListPublicProducts;
use App\Features\Open\Products\Actions\GetPublicProduct;
use App\Features\Open\Products\Actions\SearchPublicProducts;
use App\Features\Open\Products\Actions\GetProductsByCategoryWithFilters;
use App\Features\Open\Products\Actions\GetProductBySlug;
use App\Features\Open\Products\Actions\GetProductsBySubcategory;
use App\Features\Open\Products\Actions\GetRelatedProducts;

$router = Router::getInstance();

// List all products - Public
$router->get('/api/public/products', function ($request, $response) {
   $controller = new ListPublicProducts();
   return $controller($request, $response);
});

// Search products - Public
// Important: This route must be defined BEFORE the product/:id route to avoid conflicts
$router->get('/api/public/products/search', function ($request, $response) {
   $controller = new SearchPublicProducts();
   return $controller($request, $response);
});

// Get product by slug - Public
$router->get('/api/public/products/slug/:slug', function ($request, $response, $args) {
   $controller = new GetProductBySlug();
   return $controller($request, $response, $args);
});

// Get products by subcategory - Public
$router->get('/api/public/products/subcategory/:id', function ($request, $response, $args) {
   $controller = new GetProductsBySubcategory();
   return $controller($request, $response, $args);
});

// Get a specific product - Public
$router->get('/api/public/products/:id', function ($request, $response, $args) {
   $controller = new GetPublicProduct();
   return $controller($request, $response, $args);
});

// Get products by category - Public
$router->get('/api/public/products/category/:id', function ($request, $response, $args) {
   $controller = new GetProductsByCategoryWithFilters();
   return $controller($request, $response, $args);
});

// Get related products - Public
$router->get('/api/public/products/:id/related', function ($request, $response, $args) {
   $controller = new GetRelatedProducts();
   return $controller($request, $response, $args);
});
