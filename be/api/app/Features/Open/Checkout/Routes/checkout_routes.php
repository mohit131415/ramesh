<?php

use App\Core\Router;
use App\Features\Open\Checkout\Actions\PrepareCheckout;
use App\Shared\Middleware\AuthenticationCheck;
use App\Shared\Middleware\ActivityLogger;

$router = Router::getInstance();

// Create middleware instances
$authMiddleware = new AuthenticationCheck();

// Prepare checkout - Get final cart data with shipping and payment calculations
$router->get('/api/public/checkout/prepare', function ($request, $response) {
    $controller = new PrepareCheckout();
    return $controller->execute($request, $response);
}, [
    $authMiddleware,
    new ActivityLogger('Checkout', 'PrepareCheckout')
]);

