<?php

use App\Core\Router;
use App\Features\ProductCatalog\ProductImages\Actions\UploadProductImages;
use App\Shared\Middleware\AuthenticationCheck;
use App\Shared\Middleware\RoleVerification;
use App\Shared\Middleware\ActivityLogger;

$router = Router::getInstance();

// Upload images for a specific product - Admin or Super Admin
$router->post('/api/products/:id/images', function ($request, $response) {
    $controller = new UploadProductImages();
    return $controller->execute($request, $response);
}, [
    new AuthenticationCheck(),
    new RoleVerification('admin'), // Both admin and super_admin roles can access
    new ActivityLogger('ProductCatalog', 'UploadProductImages')
]);
