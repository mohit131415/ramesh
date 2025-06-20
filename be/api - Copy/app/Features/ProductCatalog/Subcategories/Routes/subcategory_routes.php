<?php

use App\Core\Router;
use App\Features\ProductCatalog\Subcategories\Actions\ListSubcategories;
use App\Features\ProductCatalog\Subcategories\Actions\ViewSubcategory;
use App\Features\ProductCatalog\Subcategories\Actions\CreateSubcategory;
use App\Features\ProductCatalog\Subcategories\Actions\UpdateSubcategory;
use App\Features\ProductCatalog\Subcategories\Actions\DeleteSubcategory;
use App\Features\ProductCatalog\Subcategories\Actions\RestoreSubcategory;
use App\Features\ProductCatalog\Subcategories\Actions\ListSubcategoriesByCategory;
use App\Shared\Middleware\AuthenticationCheck;
use App\Shared\Middleware\RoleVerification;
use App\Shared\Middleware\ActivityLogger;

$router = Router::getInstance();

// List all subcategories - Any authenticated user
$router->get('/api/subcategories', function ($request, $response) {
    $controller = new ListSubcategories();
    return $controller->execute($request, $response);
}, [
    new AuthenticationCheck(),
    new ActivityLogger('ProductCatalog', 'ListSubcategories')
]);

// Get subcategory by ID - Any authenticated user
$router->get('/api/subcategories/:id', function ($request, $response) {
    $controller = new ViewSubcategory();
    return $controller->execute($request, $response);
}, [
    new AuthenticationCheck(),
    new ActivityLogger('ProductCatalog', 'ViewSubcategory')
]);

// Get subcategories by category ID - Any authenticated user
$router->get('/api/categories/:category_id/subcategories', function ($request, $response) {
    $controller = new ListSubcategoriesByCategory();
    return $controller->execute($request, $response);
}, [
    new AuthenticationCheck(),
    new ActivityLogger('ProductCatalog', 'ListSubcategoriesByCategory')
]);

// Create subcategory - Admin or Super Admin
$router->post('/api/subcategories', function ($request, $response) {
    $controller = new CreateSubcategory();
    return $controller->execute($request, $response);
}, [
    new AuthenticationCheck(),
    new RoleVerification('admin'), // Both admin and super_admin roles can access
    new ActivityLogger('ProductCatalog', 'CreateSubcategory')
]);

// Update subcategory - Admin or Super Admin
$router->put('/api/subcategories/:id', function ($request, $response) {
    $controller = new UpdateSubcategory();
    return $controller->execute($request, $response);
}, [
    new AuthenticationCheck(),
    new RoleVerification('admin'), // Both admin and super_admin roles can access
    new ActivityLogger('ProductCatalog', 'UpdateSubcategory')
]);

// Delete subcategory - Admin or Super Admin
$router->delete('/api/subcategories/:id', function ($request, $response) {
    $controller = new DeleteSubcategory();
    return $controller->execute($request, $response);
}, [
    new AuthenticationCheck(),
    new RoleVerification('admin'), // Both admin and super_admin roles can access
    new ActivityLogger('ProductCatalog', 'DeleteSubcategory')
]);

// Restore subcategory - Super Admin only
$router->post('/api/subcategories/:id/restore', function ($request, $response) {
    $controller = new RestoreSubcategory();
    return $controller->execute($request, $response);
}, [
    new AuthenticationCheck(),
    new RoleVerification('super_admin'), // Only super_admin can restore
    new ActivityLogger('ProductCatalog', 'RestoreSubcategory')
]);
