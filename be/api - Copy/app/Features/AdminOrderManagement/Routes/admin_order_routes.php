<?php

use App\Core\Router;
use App\Shared\Middleware\AuthenticationCheck;
use App\Shared\Middleware\RoleVerification;
use App\Shared\Middleware\ActivityLogger;
use App\Features\AdminOrderManagement\Actions\ListOrders;
use App\Features\AdminOrderManagement\Actions\ViewOrder;
use App\Features\AdminOrderManagement\Actions\UpdateOrderStatus;
use App\Features\AdminOrderManagement\Actions\CancelOrder;
use App\Features\AdminOrderManagement\Actions\RefundOrder;
use App\Features\AdminOrderManagement\Actions\UpdateShippingDetails;
use App\Features\AdminOrderManagement\Actions\MarkPaymentReceived;
use App\Features\AdminOrderManagement\Actions\GetOrderStatistics;
use App\Features\AdminOrderManagement\Actions\ExportOrders;
use App\Features\AdminOrderManagement\Actions\MarkOrderReturned;
use App\Features\AdminOrderManagement\Actions\DownloadInvoice;

$router = Router::getInstance();

// List all orders - Admin or Super Admin
$router->get('/api/admin/orders', function ($request, $response) {
    $controller = new ListOrders();
    return $controller->execute($request, $response);
}, [
    new AuthenticationCheck(),
    new RoleVerification('admin'), // Both admin and super_admin roles can access
    new ActivityLogger('OrderManagement', 'ListOrders')
]);

// Get a specific order - Admin or Super Admin
$router->get('/api/admin/orders/:id', function ($request, $response) {
    $controller = new ViewOrder();
    return $controller->execute($request, $response);
}, [
    new AuthenticationCheck(),
    new RoleVerification('admin'), // Both admin and super_admin roles can access
    new ActivityLogger('OrderManagement', 'ViewOrder')
]);

// Update order status - Admin or Super Admin
$router->put('/api/admin/orders/:id/status', function ($request, $response) {
    $controller = new UpdateOrderStatus();
    return $controller->execute($request, $response);
}, [
    new AuthenticationCheck(),
    new RoleVerification('admin'), // Both admin and super_admin roles can access
    new ActivityLogger('OrderManagement', 'UpdateOrderStatus')
]);

// Cancel an order - Admin or Super Admin
$router->put('/api/admin/orders/:id/cancel', function ($request, $response) {
    $controller = new CancelOrder();
    return $controller->execute($request, $response);
}, [
    new AuthenticationCheck(),
    new RoleVerification('admin'), // Both admin and super_admin roles can access
    new ActivityLogger('OrderManagement', 'CancelOrder')
]);

// Process refund for an order - Admin or Super Admin
$router->put('/api/admin/orders/:id/refund', function ($request, $response) {
    $controller = new RefundOrder();
    return $controller->execute($request, $response);
}, [
    new AuthenticationCheck(),
    new RoleVerification('admin'), // Both admin and super_admin roles can access
    new ActivityLogger('OrderManagement', 'RefundOrder')
]);

// Update shipping details - Admin or Super Admin
$router->put('/api/admin/orders/:id/shipping', function ($request, $response) {
    $controller = new UpdateShippingDetails();
    return $controller->execute($request, $response);
}, [
    new AuthenticationCheck(),
    new RoleVerification('admin'), // Both admin and super_admin roles can access
    new ActivityLogger('OrderManagement', 'UpdateShippingDetails')
]);

// Mark COD payment as received - Admin or Super Admin
$router->put('/api/admin/orders/:id/payment-received', function ($request, $response) {
    $controller = new MarkPaymentReceived();
    return $controller->execute($request, $response);
}, [
    new AuthenticationCheck(),
    new RoleVerification('admin'), // Both admin and super_admin roles can access
    new ActivityLogger('OrderManagement', 'MarkPaymentReceived')
]);

// Mark order as returned - Admin or Super Admin
$router->put('/api/admin/orders/:id/return', function ($request, $response) {
    $controller = new MarkOrderReturned();
    return $controller->execute($request, $response);
}, [
    new AuthenticationCheck(),
    new RoleVerification('admin'), // Both admin and super_admin roles can access
    new ActivityLogger('OrderManagement', 'MarkOrderReturned')
]);

// Get order statistics - Admin or Super Admin
$router->get('/api/admin/orders/statistics/overview', function ($request, $response) {
    $controller = new GetOrderStatistics();
    return $controller->execute($request, $response);
}, [
    new AuthenticationCheck(),
    new RoleVerification('admin'), // Both admin and super_admin roles can access
    new ActivityLogger('OrderManagement', 'GetOrderStatistics')
]);

// Export orders to CSV - Admin or Super Admin
$router->get('/api/admin/orders/export', function ($request, $response) {
    $controller = new ExportOrders();
    return $controller->execute($request, $response);
}, [
    new AuthenticationCheck(),
    new RoleVerification('admin'), // Both admin and super_admin roles can access
    new ActivityLogger('OrderManagement', 'ExportOrders')
]);

// Download invoice for any order - Admin or Super Admin
$router->get('/api/admin/orders/:id/invoice', function ($request, $response) {
    $controller = new DownloadInvoice();
    return $controller->execute($request, $response);
}, [
    new AuthenticationCheck(),
    new RoleVerification('admin'), // Both admin and super_admin roles can access
    new ActivityLogger('OrderManagement', 'DownloadInvoice')
]);
