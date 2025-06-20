<?php

use App\Core\Router;
use App\Features\Open\UserAddress\Actions\CreateUserAddress;
use App\Features\Open\UserAddress\Actions\GetUserAddresses;
use App\Features\Open\UserAddress\Actions\GetUserAddress;
use App\Features\Open\UserAddress\Actions\UpdateUserAddress;
use App\Features\Open\UserAddress\Actions\DeleteUserAddress;
use App\Features\Open\UserAddress\Actions\GetDefaultAddress;
use App\Features\Open\UserAddress\Actions\GetAddressLimits;
use App\Shared\Middleware\AuthenticationCheck;
use App\Shared\Middleware\ActivityLogger;

$router = Router::getInstance();

// Create user address - Any authenticated user
$router->post('/api/public/user/addresses', function ($request, $response) {
    $controller = new CreateUserAddress();
    return $controller->execute($request, $response);
}, [
    new AuthenticationCheck(),
    new ActivityLogger('UserAddress', 'CreateUserAddress')
]);

// Get all user addresses - Any authenticated user
$router->get('/api/public/user/addresses', function ($request, $response) {
    $controller = new GetUserAddresses();
    return $controller->execute($request, $response);
}, [
    new AuthenticationCheck(),
    new ActivityLogger('UserAddress', 'GetUserAddresses')
]);

// Get single user address - Any authenticated user
$router->get('/api/public/user/addresses/:id', function ($request, $response) {
    $controller = new GetUserAddress();
    return $controller->execute($request, $response);
}, [
    new AuthenticationCheck(),
    new ActivityLogger('UserAddress', 'GetUserAddress')
]);

// Update user address - Any authenticated user
$router->put('/api/public/user/addresses/:id', function ($request, $response) {
    $controller = new UpdateUserAddress();
    return $controller->execute($request, $response);
}, [
    new AuthenticationCheck(),
    new ActivityLogger('UserAddress', 'UpdateUserAddress')
]);

// Delete user address - Any authenticated user
$router->delete('/api/public/user/addresses/:id', function ($request, $response) {
    $controller = new DeleteUserAddress();
    return $controller->execute($request, $response);
}, [
    new AuthenticationCheck(),
    new ActivityLogger('UserAddress', 'DeleteUserAddress')
]);

// Get default address - Any authenticated user
$router->get('/api/public/user/addresses/default/get', function ($request, $response) {
    $controller = new GetDefaultAddress();
    return $controller->execute($request, $response);
}, [
    new AuthenticationCheck(),
    new ActivityLogger('UserAddress', 'GetDefaultAddress')
]);

// Get address limits - Any authenticated user
$router->get('/api/public/user/addresses/limits/info', function ($request, $response) {
    $controller = new GetAddressLimits();
    return $controller->execute($request, $response);
}, [
    new AuthenticationCheck(),
    new ActivityLogger('UserAddress', 'GetAddressLimits')
]);
