<?php

use App\Core\Router;
use App\Features\Open\Cart\Actions\AddToCart;
use App\Features\Open\Cart\Actions\GetCart;
use App\Features\Open\Cart\Actions\UpdateCartItem;
use App\Features\Open\Cart\Actions\RemoveFromCart;
use App\Features\Open\Cart\Actions\ApplyCoupon;
use App\Features\Open\Cart\Actions\RemoveCoupon;
use App\Features\Open\Cart\Actions\GetAvailableCoupons;
use App\Features\Open\Cart\Actions\ValidateCoupon;
use App\Features\Open\Cart\Actions\CalculateCart;
use App\Features\Open\Cart\Actions\GetCartItems;
use App\Features\Open\Cart\Actions\SyncCart;
use App\Shared\Middleware\AuthenticationCheck;
use App\Shared\Middleware\ActivityLogger;

$router = Router::getInstance();

// Create middleware instances
$authMiddleware = new AuthenticationCheck();

// Routes that require authentication
// Get current cart contents - Auth required
$router->get('/api/public/cart', function ($request, $response) {
    $controller = new GetCart();
    return $controller->execute($request, $response);
}, [
    $authMiddleware,
    new ActivityLogger('Cart', 'GetCart')
]);

// Add item to cart - Auth required
$router->post('/api/public/cart/add', function ($request, $response) {
    $controller = new AddToCart();
    return $controller->execute($request, $response);
}, [
    $authMiddleware,
    new ActivityLogger('Cart', 'AddToCart')
]);

// Update cart item quantity - Auth required
$router->put('/api/public/cart/update', function ($request, $response) {
    $controller = new UpdateCartItem();
    return $controller->execute($request, $response);
}, [
    $authMiddleware,
    new ActivityLogger('Cart', 'UpdateCartItem')
]);

// Remove item from cart - Auth required
$router->delete('/api/public/cart/remove', function ($request, $response) {
    $controller = new RemoveFromCart();
    return $controller->execute($request, $response);
}, [
    $authMiddleware,
    new ActivityLogger('Cart', 'RemoveFromCart')
]);

// Get available coupons - Auth required
$router->get('/api/public/cart/coupons', function ($request, $response) {
    $controller = new GetAvailableCoupons();
    return $controller->execute($request, $response);
}, [
    $authMiddleware,
    new ActivityLogger('Cart', 'GetAvailableCoupons')
]);

// Validate coupon - Auth required
$router->post('/api/public/cart/coupon/validate', function ($request, $response) {
    $controller = new ValidateCoupon();
    return $controller->execute($request, $response);
}, [
    $authMiddleware,
    new ActivityLogger('Cart', 'ValidateCoupon')
]);

// Apply coupon to cart - Auth required
$router->post('/api/public/cart/coupon/apply', function ($request, $response) {
    $controller = new ApplyCoupon();
    return $controller->execute($request, $response);
}, [
    $authMiddleware,
    new ActivityLogger('Cart', 'ApplyCoupon')
]);

// Remove coupon from cart - Auth required
$router->delete('/api/public/cart/coupon/remove', function ($request, $response) {
    $controller = new RemoveCoupon();
    return $controller->execute($request, $response);
}, [
    $authMiddleware,
    new ActivityLogger('Cart', 'RemoveCoupon')
]);

// Sync cart with items from payload - Auth required
$router->post('/api/public/cart/sync', function ($request, $response) {
    $controller = new SyncCart();
    return $controller->execute($request, $response);
}, [
    $authMiddleware,
    new ActivityLogger('Cart', 'SyncCart')
]);

// Routes that do NOT require authentication
// Calculate cart totals - No auth required
$router->post('/api/public/cart/calculate', function ($request, $response) {
    $controller = new CalculateCart();
    return $controller->execute($request, $response);
}, [
    new ActivityLogger('Cart', 'CalculateCart')
]);

// Get detailed cart items - No auth required
$router->post('/api/public/cart/items', function ($request, $response) {
    $controller = new GetCartItems();
    return $controller->execute($request, $response);
}, [
    new ActivityLogger('Cart', 'GetCartItems')
]);
