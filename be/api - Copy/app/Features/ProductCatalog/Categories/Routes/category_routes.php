<?php

use App\Core\Router;
use App\Features\ProductCatalog\Categories\Actions\ListCategories;
use App\Features\ProductCatalog\Categories\Actions\ViewCategory;
use App\Features\ProductCatalog\Categories\Actions\CreateCategory;
use App\Features\ProductCatalog\Categories\Actions\UpdateCategory;
use App\Features\ProductCatalog\Categories\Actions\DeleteCategory;
use App\Features\ProductCatalog\Categories\Actions\RestoreCategory;
use App\Shared\Middleware\AuthenticationCheck;
use App\Shared\Middleware\RoleVerification;
use App\Shared\Middleware\ActivityLogger;
use App\Features\ProductCatalog\Categories\Actions\GetCategoryTree;

$router = Router::getInstance();

// List all categories - Any authenticated user
$router->get('/api/categories', function ($request, $response) {
    $controller = new ListCategories();
    return $controller->execute($request, $response);
}, [
    new AuthenticationCheck(),
    new ActivityLogger('ProductCatalog', 'ListCategories')
]);

// Get category by ID - Any authenticated user
$router->get('/api/categories/:id', function ($request, $response) {
    $controller = new ViewCategory();
    return $controller->execute($request, $response);
}, [
    new AuthenticationCheck(),
    new ActivityLogger('ProductCatalog', 'ViewCategory')
]);

// Create category - Admin or Super Admin
$router->post('/api/categories', function ($request, $response) {
    $controller = new CreateCategory();
    return $controller->execute($request, $response);
}, [
    new AuthenticationCheck(),
    new RoleVerification('admin'), // Both admin and super_admin roles can access
    new ActivityLogger('ProductCatalog', 'CreateCategory')
]);

// Update category - Admin or Super Admin
$router->put('/api/categories/:id', function ($request, $response) {
    $controller = new UpdateCategory();
    return $controller->execute($request, $response);
}, [
    new AuthenticationCheck(),
    new RoleVerification('admin'), // Both admin and super_admin roles can access
    new ActivityLogger('ProductCatalog', 'UpdateCategory')
]);

// Delete category - Admin or Super Admin
$router->delete('/api/categories/:id', function ($request, $response) {
    $controller = new DeleteCategory();
    return $controller->execute($request, $response);
}, [
    new AuthenticationCheck(),
    new RoleVerification('admin'), // Both admin and super_admin roles can access
    new ActivityLogger('ProductCatalog', 'DeleteCategory')
]);

// Restore category - Super Admin only
$router->post('/api/categories/:id/restore', function ($request, $response) {
    $controller = new RestoreCategory();
    return $controller->execute($request, $response);
}, [
    new AuthenticationCheck(),
    new RoleVerification('super_admin'), // Only super_admin can restore
    new ActivityLogger('ProductCatalog', 'RestoreCategory')
]);

// Get category tree - Any authenticated user
$router->get('/api/categories/tree', function ($request, $response) {
   $controller = new GetCategoryTree();
   return $controller->execute($request, $response);
}, [
   new AuthenticationCheck(),
   new ActivityLogger('ProductCatalog', 'GetCategoryTree')
]);
