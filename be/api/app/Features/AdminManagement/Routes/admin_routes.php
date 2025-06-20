<?php

use App\Core\Router;
use App\Features\AdminManagement\Actions\ListAdmins;
use App\Features\AdminManagement\Actions\ViewAdmin;
use App\Features\AdminManagement\Actions\CreateAdmin;
use App\Features\AdminManagement\Actions\UpdateAdmin;
use App\Features\AdminManagement\Actions\DeleteAdmin;
use App\Shared\Middleware\AuthenticationCheck;
use App\Shared\Middleware\RoleVerification;
use App\Shared\Middleware\ActivityLogger;
use App\Features\AdminManagement\Actions\UpdateAdminStatus;

$router = Router::getInstance();

// List all admins - Super Admin only
$router->get('/api/admins', function ($request, $response) {
   $controller = new ListAdmins();
   return $controller->execute($request, $response);
}, [
   new AuthenticationCheck(),
   new RoleVerification('super_admin'), // Changed from 'admin' to 'super_admin'
   new ActivityLogger('AdminManagement', 'ListAdmins')
]);

// Get admin by ID - Any admin can view their own profile, Super Admin can view any
$router->get('/api/admins/:id', function ($request, $response) {
   $controller = new ViewAdmin();
   return $controller->execute($request, $response);
}, [
   new AuthenticationCheck(),
   // No RoleVerification here - we'll check in the controller
   new ActivityLogger('AdminManagement', 'ViewAdmin')
]);

// Create admin - Super Admin only
$router->post('/api/admins', function ($request, $response) {
   $controller = new CreateAdmin();
   return $controller->execute($request, $response);
}, [
   new AuthenticationCheck(),
   new RoleVerification('super_admin'), // Already correct
   new ActivityLogger('AdminManagement', 'CreateAdmin')
]);

// Update admin - Any admin can update their own profile, Super Admin can update any
$router->put('/api/admins/:id', function ($request, $response) {
   $controller = new UpdateAdmin();
   return $controller->execute($request, $response);
}, [
   new AuthenticationCheck(),
   // No RoleVerification here - we'll check in the controller
   new ActivityLogger('AdminManagement', 'UpdateAdmin')
]);

// Update admin status - Super Admin only
$router->put('/api/admins/:id/status', function ($request, $response) {
   $controller = new UpdateAdminStatus();
   return $controller->execute($request, $response);
}, [
   new AuthenticationCheck(),
   new RoleVerification('super_admin'),
   new ActivityLogger('AdminManagement', 'UpdateAdminStatus')
]);

// Delete admin - Super Admin only
$router->delete('/api/admins/:id', function ($request, $response) {
   $controller = new DeleteAdmin();
   return $controller->execute($request, $response);
}, [
   new AuthenticationCheck(),
   new RoleVerification('super_admin'), // Already correct
   new ActivityLogger('AdminManagement', 'DeleteAdmin')
]);
