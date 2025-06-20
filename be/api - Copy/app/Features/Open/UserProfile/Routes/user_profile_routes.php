<?php

use App\Core\Router;
use App\Features\Open\UserProfile\Actions\CreateUserProfile;
use App\Features\Open\UserProfile\Actions\GetUserProfile;
use App\Features\Open\UserProfile\Actions\UpdateUserProfile;
use App\Features\Open\UserProfile\Actions\GetProfileCompletionStatus;
use App\Shared\Middleware\AuthenticationCheck;
use App\Shared\Middleware\ActivityLogger;

$router = Router::getInstance();

// Create user profile - Any authenticated user
$router->post('/api/public/user/profile', function ($request, $response) {
    $controller = new CreateUserProfile();
    return $controller->execute($request, $response);
}, [
    new AuthenticationCheck(),
    new ActivityLogger('UserProfile', 'CreateUserProfile')
]);

// Get user profile - Any authenticated user
$router->get('/api/public/user/profile', function ($request, $response) {
    $controller = new GetUserProfile();
    return $controller->execute($request, $response);
}, [
    new AuthenticationCheck(),
    new ActivityLogger('UserProfile', 'GetUserProfile')
]);

// Update user profile - Any authenticated user
$router->put('/api/public/user/profile', function ($request, $response) {
    $controller = new UpdateUserProfile();
    return $controller->execute($request, $response);
}, [
    new AuthenticationCheck(),
    new ActivityLogger('UserProfile', 'UpdateUserProfile')
]);

// Get profile completion status - Any authenticated user
$router->get('/api/public/user/profile/completion', function ($request, $response) {
    $controller = new GetProfileCompletionStatus();
    return $controller->execute($request, $response);
}, [
    new AuthenticationCheck(),
    new ActivityLogger('UserProfile', 'GetProfileCompletionStatus')
]);
