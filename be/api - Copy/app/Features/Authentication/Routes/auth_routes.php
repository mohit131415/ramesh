<?php

use App\Core\Router;
use App\Features\Authentication\Actions\LoginUser;
use App\Features\Authentication\Actions\LogoutUser;
use App\Features\Authentication\Actions\RefreshUserToken;
use App\Features\Authentication\Actions\ChangePasswordAction;
use App\Features\Authentication\Actions\ValidateToken;
use App\Shared\Middleware\AuthenticationCheck;
use App\Shared\Middleware\ActivityLogger;

$router = Router::getInstance();

// Login route - NOW WITH ActivityLogger middleware for proper is_admin tracking
$router->post('/api/auth/login', function ($request, $response) {
    $controller = new LoginUser();
    return $controller->execute($request, $response);
}, [
    new ActivityLogger('Authentication', 'Login')
]);

// Logout route
$router->post('/api/auth/logout', function ($request, $response) {
    $controller = new LogoutUser();
    return $controller->execute($request, $response);
}, [
    new AuthenticationCheck(),
    new ActivityLogger('Authentication', 'Logout')
]);

// Refresh token route
$router->post('/api/auth/refresh', function ($request, $response) {
    $controller = new RefreshUserToken();
    return $controller->execute($request, $response);
}, [
    new ActivityLogger('Authentication', 'TokenRefresh')
]);

// Validate token route
$router->post('/api/auth/validate', function ($request, $response) {
   $controller = new ValidateToken();
   return $controller->execute($request, $response);
}, [
   new ActivityLogger('Authentication', 'TokenValidation')
]);

// Change password route
$router->post('/api/auth/change-password', function ($request, $response) {
    $controller = new ChangePasswordAction();
    return $controller->execute($request, $response);
}, [
    new AuthenticationCheck(),
    new ActivityLogger('Authentication', 'PasswordChange')
]);
