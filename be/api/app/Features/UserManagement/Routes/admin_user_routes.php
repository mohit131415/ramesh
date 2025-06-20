<?php

use App\Core\Router;
use App\Features\UserManagement\Actions\ListUsers;
use App\Features\UserManagement\Actions\ViewUser;
use App\Features\UserManagement\Actions\UpdateUserStatus;
use App\Features\UserManagement\Actions\ExportUsers;
use App\Features\UserManagement\Actions\GetUserStatistics;
use App\Shared\Middleware\AuthenticationCheck;
use App\Shared\Middleware\RoleVerification;
use App\Shared\Middleware\ActivityLogger;

$router = Router::getInstance();

// List all users - Admin only
$router->get('/api/admin/users', function ($request, $response) {
    $controller = new ListUsers();
    return $controller->execute($request, $response);
}, [
    new AuthenticationCheck(),
    new RoleVerification('admin'),
    new ActivityLogger('UserManagement', 'ListUsers')
]);

// Get user statistics - Admin only
$router->get('/api/admin/users/statistics', function ($request, $response) {
    $controller = new GetUserStatistics();
    return $controller->execute($request, $response);
}, [
    new AuthenticationCheck(),
    new RoleVerification('admin'),
    new ActivityLogger('UserManagement', 'GetUserStatistics')
]);

// Export users data - Admin only
$router->get('/api/admin/users/export', function ($request, $response) {
    $controller = new ExportUsers();
    return $controller->execute($request, $response);
}, [
    new AuthenticationCheck(),
    new RoleVerification('admin'),
    new ActivityLogger('UserManagement', 'ExportUsers')
]);

// Get user details by ID - Admin only
$router->get('/api/admin/users/:id', function ($request, $response) {
    $controller = new ViewUser();
    return $controller->execute($request, $response);
}, [
    new AuthenticationCheck(),
    new RoleVerification('admin'),
    new ActivityLogger('UserManagement', 'ViewUser')
]);

// Update user status - Admin only
$router->put('/api/admin/users/:id/status', function ($request, $response) {
    $controller = new UpdateUserStatus();
    return $controller->execute($request, $response);
}, [
    new AuthenticationCheck(),
    new RoleVerification('admin'),
    new ActivityLogger('UserManagement', 'UpdateUserStatus')
]);
