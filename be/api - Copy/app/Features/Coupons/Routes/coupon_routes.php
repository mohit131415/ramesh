<?php

use App\Core\Router;
use App\Shared\Middleware\AuthenticationCheck;
use App\Shared\Middleware\RoleVerification;
use App\Shared\Middleware\ActivityLogger;
use App\Features\Coupons\Actions\ListCoupons;
use App\Features\Coupons\Actions\ViewCoupon;
use App\Features\Coupons\Actions\CreateCoupon;
use App\Features\Coupons\Actions\UpdateCoupon;
use App\Features\Coupons\Actions\DeleteCoupon;
use App\Features\Coupons\Actions\RestoreCoupon;
use App\Features\Coupons\Actions\GetCouponStatistics;
use App\Features\Coupons\Actions\GetAllCouponsStatistics;

$router = Router::getInstance();

// List all coupons - Admin or Super Admin
$router->get('/api/coupons', function ($request, $response) {
    $controller = new ListCoupons();
    return $controller->execute($request, $response);
}, [
    new AuthenticationCheck(),
    new RoleVerification('admin'), // Both admin and super_admin roles can access
    new ActivityLogger('ProductCatalog', 'ListCoupons')
]);

// Get a specific coupon - Admin or Super Admin
$router->get('/api/coupons/:id', function ($request, $response) {
    $controller = new ViewCoupon();
    return $controller->execute($request, $response);
}, [
    new AuthenticationCheck(),
    new RoleVerification('admin'), // Both admin and super_admin roles can access
    new ActivityLogger('ProductCatalog', 'ViewCoupon')
]);

// Create a new coupon - Admin or Super Admin
$router->post('/api/coupons', function ($request, $response) {
    $controller = new CreateCoupon();
    return $controller->execute($request, $response);
}, [
    new AuthenticationCheck(),
    new RoleVerification('admin'), // Both admin and super_admin roles can access
    new ActivityLogger('ProductCatalog', 'CreateCoupon')
]);

// Update an existing coupon - Admin or Super Admin
$router->put('/api/coupons/:id', function ($request, $response) {
    $controller = new UpdateCoupon();
    return $controller->execute($request, $response);
}, [
    new AuthenticationCheck(),
    new RoleVerification('admin'), // Both admin and super_admin roles can access
    new ActivityLogger('ProductCatalog', 'UpdateCoupon')
]);

// Delete a coupon (soft delete) - Admin or Super Admin
$router->delete('/api/coupons/:id', function ($request, $response) {
    $controller = new DeleteCoupon();
    return $controller->execute($request, $response);
}, [
    new AuthenticationCheck(),
    new RoleVerification('admin'), // Both admin and super_admin roles can access
    new ActivityLogger('ProductCatalog', 'DeleteCoupon')
]);

// Restore a soft-deleted coupon - Super Admin only
$router->post('/api/coupons/:id/restore', function ($request, $response) {
    $controller = new RestoreCoupon();
    return $controller->execute($request, $response);
}, [
    new AuthenticationCheck(),
    new RoleVerification('super_admin'), // Only super_admin can restore
    new ActivityLogger('ProductCatalog', 'RestoreCoupon')
]);

// Get statistics for a specific coupon - Admin or Super Admin
$router->get('/api/coupons/:id/statistics', function ($request, $response) {
    $controller = new GetCouponStatistics();
    return $controller->execute($request, $response);
}, [
    new AuthenticationCheck(),
    new RoleVerification('admin'), // Both admin and super_admin roles can access
    new ActivityLogger('ProductCatalog', 'GetCouponStatistics')
]);

// Get overall statistics for all coupons - Admin or Super Admin
$router->get('/api/coupons/statistics/overview', function ($request, $response) {
    $controller = new GetAllCouponsStatistics();
    return $controller->execute($request, $response);
}, [
    new AuthenticationCheck(),
    new RoleVerification('admin'), // Both admin and super_admin roles can access
    new ActivityLogger('ProductCatalog', 'GetAllCouponsStatistics')
]);
