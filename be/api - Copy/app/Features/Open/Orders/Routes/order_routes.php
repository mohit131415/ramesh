<?php

use App\Core\Router;
use App\Features\Open\Orders\Actions\CreateOrder;
use App\Features\Open\Orders\Actions\DownloadInvoice;
use App\Features\Open\Orders\Actions\GetOrderHistory;
use App\Features\Open\Orders\Actions\GetOrderDetails;
use App\Shared\Middleware\AuthenticationCheck;
use App\Shared\Middleware\ActivityLogger;

$router = Router::getInstance();

// Create middleware instances
$authMiddleware = new AuthenticationCheck();

// Create order endpoint - handles both online and COD payments
$router->post('/api/public/orders/create', function ($request, $response) {
    $controller = new CreateOrder();
    return $controller->execute($request, $response);
}, [
    $authMiddleware,
    new ActivityLogger('Orders', 'CreateOrder')
]);

// Download invoice endpoint
$router->get('/api/public/orders/invoice/:order_number', function ($request, $response, $params) {
    // Pass the params directly to the execute method
    $controller = new DownloadInvoice();
    return $controller->execute($request, $response, $params);
}, [
    $authMiddleware,
    new ActivityLogger('Orders', 'DownloadInvoice')
]);

// Get order history endpoint
$router->get('/api/public/orders/history', function ($request, $response) {
    $controller = new GetOrderHistory();
    return $controller->execute($request, $response);
}, [
    $authMiddleware,
    new ActivityLogger('Orders', 'GetOrderHistory')
]);

// Get order details endpoint - supports both order ID and order number
$router->get('/api/public/orders/details/:order_identifier', function ($request, $response, $params) {
    // Pass the params directly to the execute method
    $controller = new GetOrderDetails();
    return $controller->execute($request, $response, $params);
}, [
    $authMiddleware,
    new ActivityLogger('Orders', 'GetOrderDetails')
]);
