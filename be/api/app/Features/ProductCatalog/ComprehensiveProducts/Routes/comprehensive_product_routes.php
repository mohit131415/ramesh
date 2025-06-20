<?php

use App\Core\Router;
use App\Features\ProductCatalog\ComprehensiveProducts\Actions\GetComprehensiveProducts;
use App\Features\ProductCatalog\ComprehensiveProducts\Actions\GetComprehensiveProductById;
use App\Features\ProductCatalog\ComprehensiveProducts\Actions\CreateComprehensiveProduct;
use App\Features\ProductCatalog\ComprehensiveProducts\Actions\UpdateComprehensiveProduct;
use App\Features\ProductCatalog\ComprehensiveProducts\Actions\DeleteComprehensiveProduct;
use App\Features\ProductCatalog\ComprehensiveProducts\Actions\GetTagSuggestions;
use App\Features\ProductCatalog\ComprehensiveProducts\Actions\SearchProductBySku;
use App\Shared\Middleware\AuthenticationCheck;
use App\Shared\Middleware\RoleVerification;
use App\Shared\Middleware\ActivityLogger;
use App\Features\ProductCatalog\ComprehensiveProducts\Actions\GetAllProductSkus;
use App\Features\ProductCatalog\ComprehensiveProducts\Actions\CheckProductNameExists;

$router = Router::getInstance();

// Get comprehensive products with all related data - Any authenticated user
$router->get('/api/comprehensive-products', function ($request, $response) {
    $controller = new GetComprehensiveProducts();
    return $controller->execute($request, $response);
}, [
    new AuthenticationCheck(),
    new ActivityLogger('ProductCatalog', 'GetComprehensiveProducts')
]);

// Get comprehensive product by ID - Any authenticated user
$router->get('/api/comprehensive-products/:id', function ($request, $response) {
    $controller = new GetComprehensiveProductById();
    return $controller->execute($request, $response);
}, [
    new AuthenticationCheck(),
    new ActivityLogger('ProductCatalog', 'GetComprehensiveProductById')
]);

// Search for a product by SKU - Any authenticated user
$router->get('/api/comprehensive-products/search/sku', function ($request, $response) {
    $controller = new SearchProductBySku();
    return $controller->execute($request, $response);
}, [
    new AuthenticationCheck(),
    new ActivityLogger('ProductCatalog', 'SearchProductBySku')
]);

// Create comprehensive product - Admin or Super Admin
$router->post('/api/comprehensive-products', function ($request, $response) {
    $controller = new CreateComprehensiveProduct();
    return $controller->execute($request, $response);
}, [
    new AuthenticationCheck(),
    new RoleVerification('admin'), // Both admin and super_admin roles can access
    new ActivityLogger('ProductCatalog', 'CreateComprehensiveProduct')
]);

// Update comprehensive product - Admin or Super Admin
$router->put('/api/comprehensive-products/:id', function ($request, $response) {
    $controller = new UpdateComprehensiveProduct();
    return $controller->execute($request, $response);
}, [
    new AuthenticationCheck(),
    new RoleVerification('admin'), // Both admin and super_admin roles can access
    new ActivityLogger('ProductCatalog', 'UpdateComprehensiveProduct')
]);

// Also support POST with _method=PUT for form submissions
$router->post('/api/comprehensive-products/:id', function ($request, $response) {
    // Check if _method is set to PUT
    $method = $request->getBody('_method');
    if ($method === 'PUT') {
        $controller = new UpdateComprehensiveProduct();
        return $controller->execute($request, $response);
    } else {
        return $response->json([
            'status' => 'error',
            'message' => 'Method not allowed',
            'data' => null
        ], 405);
    }
}, [
    new AuthenticationCheck(),
    new RoleVerification('admin'), // Both admin and super_admin roles can access
    new ActivityLogger('ProductCatalog', 'UpdateComprehensiveProduct')
]);

// Delete comprehensive product (soft delete) - Admin or Super Admin
$router->delete('/api/comprehensive-products/:id', function ($request, $response) {
    $controller = new DeleteComprehensiveProduct();
    return $controller->execute($request, $response);
}, [
    new AuthenticationCheck(),
    new RoleVerification('admin'), // Both admin and super_admin roles can access
    new ActivityLogger('ProductCatalog', 'DeleteComprehensiveProduct')
]);

// Permanently delete comprehensive product - Super Admin only
$router->delete('/api/comprehensive-products/:id/permanent', function ($request, $response) {
    $controller = new DeleteComprehensiveProduct();
    return $controller->permanentDelete($request, $response);
}, [
    new AuthenticationCheck(),
    new RoleVerification('super_admin'), // Only super_admin role can access
    new ActivityLogger('ProductCatalog', 'PermanentDeleteComprehensiveProduct')
]);

// Get tag suggestions - Any authenticated user
$router->get('/api/comprehensive-products/tags/suggestions', function ($request, $response) {
    $controller = new GetTagSuggestions();
    return $controller->execute($request, $response);
}, [
    new AuthenticationCheck(),
    new ActivityLogger('ProductCatalog', 'GetTagSuggestions')
]);

// Get all product SKUs for frontend validation - Any authenticated user
$router->get('/api/comprehensive-products/skus/all', function ($request, $response) {
    $controller = new GetAllProductSkus();
    return $controller->execute($request, $response);
}, [
    new AuthenticationCheck(),
    new ActivityLogger('ProductCatalog', 'GetAllProductSkus')
]);

// Check if product name exists - Any authenticated user
$router->get('/api/comprehensive-products/check-name', function ($request, $response) {
    $controller = new CheckProductNameExists();
    return $controller->execute($request, $response);
}, [
    new AuthenticationCheck(),
    new ActivityLogger('ProductCatalog', 'CheckProductNameExists')
]);
