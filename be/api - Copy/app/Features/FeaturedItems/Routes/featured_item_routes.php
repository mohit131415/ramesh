<?php

use App\Core\Router;
use App\Shared\Middleware\AuthenticationCheck;
use App\Shared\Middleware\RoleVerification;
use App\Shared\Middleware\ActivityLogger;
use App\Features\FeaturedItems\Actions\ListFeaturedItems;
use App\Features\FeaturedItems\Actions\CreateFeaturedItem;
use App\Features\FeaturedItems\Actions\UpdateFeaturedItem;
use App\Features\FeaturedItems\Actions\DeleteFeaturedItem;
use App\Features\FeaturedItems\Actions\GetFeaturedItemLimits;
use App\Features\FeaturedItems\Actions\UpdateFeaturedItemLimits;
use App\Features\FeaturedItems\Actions\UpdateDisplayOrder;
use App\Features\FeaturedItems\Actions\GetAllProductsForSelection;
use App\Features\FeaturedItems\Actions\GetAllCategoriesForSelection;
use App\Features\FeaturedItems\Actions\ReplaceFeaturedItem;

$router = Router::getInstance();

// List all featured items or get a specific featured item - Admin or Super Admin
$router->get('/api/featured-items', function ($request, $response) {
    $controller = new ListFeaturedItems();
    $result = $controller->execute($request, $response);
    return $response->json($result);
}, [
    new AuthenticationCheck(),
    new RoleVerification('admin'), // Both admin and super_admin roles can access
    new ActivityLogger('FeaturedItems', 'ListFeaturedItems')
]);

// Get a specific featured item by ID - Admin or Super Admin
$router->get('/api/featured-items/:id', function ($request, $response) {
    $controller = new ListFeaturedItems();
    $result = $controller->execute($request, $response);
    return $response->json($result);
}, [
    new AuthenticationCheck(),
    new RoleVerification('admin'), // Both admin and super_admin roles can access
    new ActivityLogger('FeaturedItems', 'GetFeaturedItem')
]);

// Create a new featured item - Admin or Super Admin
$router->post('/api/featured-items', function ($request, $response) {
    $controller = new CreateFeaturedItem();
    $result = $controller->execute($request, $response);
    return $response->json($result);
}, [
    new AuthenticationCheck(),
    new RoleVerification('admin'), // Both admin and super_admin roles can access
    new ActivityLogger('FeaturedItems', 'CreateFeaturedItem')
]);

// Update an existing featured item - Admin or Super Admin
$router->put('/api/featured-items/:id', function ($request, $response) {
    $controller = new UpdateFeaturedItem();
    $result = $controller->execute($request, $response);
    return $response->json($result);
}, [
    new AuthenticationCheck(),
    new RoleVerification('admin'), // Both admin and super_admin roles can access
    new ActivityLogger('FeaturedItems', 'UpdateFeaturedItem')
]);

// Replace a featured item's entity - Admin or Super Admin
$router->put('/api/featured-items/:id/replace', function ($request, $response) {
    $controller = new ReplaceFeaturedItem();
    $result = $controller->execute($request, $response);
    return $response->json($result);
}, [
    new AuthenticationCheck(),
    new RoleVerification('admin'), // Both admin and super_admin roles can access
    new ActivityLogger('FeaturedItems', 'ReplaceFeaturedItem')
]);

// Delete a featured item by entity_id and display_type - Admin or Super Admin
$router->delete('/api/featured-items', function ($request, $response) {
    $controller = new DeleteFeaturedItem();
    $result = $controller->execute($request, $response);
    return $response->json($result);
}, [
    new AuthenticationCheck(),
    new RoleVerification('admin'), // Both admin and super_admin roles can access
    new ActivityLogger('FeaturedItems', 'DeleteFeaturedItem')
]);

// Get featured item limits - Admin or Super Admin
$router->get('/api/featured-items/settings/limits', function ($request, $response) {
    $controller = new GetFeaturedItemLimits();
    $result = $controller->execute($request, $response);
    return $response->json($result);
}, [
    new AuthenticationCheck(),
    new RoleVerification('admin'), // Both admin and super_admin roles can access
    new ActivityLogger('FeaturedItems', 'GetFeaturedItemLimits')
]);

// Update featured item limits - Super Admin only
$router->put('/api/featured-items/settings/limits', function ($request, $response) {
    $controller = new UpdateFeaturedItemLimits();
    $result = $controller->execute($request, $response);
    return $response->json($result);
}, [
    new AuthenticationCheck(),
    new RoleVerification('super_admin'), // Only super_admin can update limits
    new ActivityLogger('FeaturedItems', 'UpdateFeaturedItemLimits')
]);

// Update display order of featured items - Admin or Super Admin
$router->post('/api/featured-items/update-display-order', function ($request, $response) {
    $controller = new UpdateDisplayOrder();
    $result = $controller->execute($request, $response);
    return $response->json($result);
}, [
    new AuthenticationCheck(),
    new RoleVerification('admin'), // Both admin and super_admin roles can access
    new ActivityLogger('FeaturedItems', 'UpdateDisplayOrder')
]);

// Get all products for featured item selection - Admin or Super Admin
$router->get('/api/featured-items/selection/products', function ($request, $response) {
    $controller = new GetAllProductsForSelection();
    $result = $controller->execute($request, $response);
    return $response->json($result);
}, [
    new AuthenticationCheck(),
    new RoleVerification('admin'), // Both admin and super_admin roles can access
    new ActivityLogger('FeaturedItems', 'GetAllProductsForSelection')
]);

// Get all categories for featured item selection - Admin or Super Admin
$router->get('/api/featured-items/selection/categories', function ($request, $response) {
    $controller = new GetAllCategoriesForSelection();
    $result = $controller->execute($request, $response);
    return $response->json($result);
}, [
    new AuthenticationCheck(),
    new RoleVerification('admin'), // Both admin and super_admin roles can access
    new ActivityLogger('FeaturedItems', 'GetAllCategoriesForSelection')
]);
