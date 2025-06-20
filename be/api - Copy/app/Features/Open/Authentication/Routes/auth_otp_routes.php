<?php

use App\Core\Router;
use App\Features\Open\Authentication\Actions\RegisterUser;
use App\Features\Open\Authentication\Actions\LoginUser;
use App\Features\Open\Authentication\Actions\VerifyOtp;
use App\Features\Open\Authentication\Actions\ValidateToken;
use App\Features\Open\Authentication\Actions\LogoutUser;

$router = Router::getInstance();

// Register user with OTP
$router->post('/api/public/register', function ($request, $response) {
   $controller = new RegisterUser();
   return $controller($request, $response);
});

// Login user with OTP
$router->post('/api/public/login', function ($request, $response) {
   $controller = new LoginUser();
   return $controller($request, $response);
});

// Verify OTP for registration or login
$router->post('/api/public/verify-otp', function ($request, $response) {
   $controller = new VerifyOtp();
   return $controller($request, $response);
});

// Validate token - POST method only (more secure)
$router->post('/api/public/validate-token', function ($request, $response) {
   $controller = new ValidateToken();
   return $controller($request, $response);
});

// Logout user
$router->post('/api/public/logout', function ($request, $response) {
   $controller = new LogoutUser();
   return $controller($request, $response);
});
