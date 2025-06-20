<?php

use App\Core\Router;

// Get router instance
$router = Router::getInstance();

// Function to safely include route files
function safelyIncludeRoutes($filePath) {
    if (file_exists($filePath)) {
        try {
            require_once $filePath;
            return true;
        } catch (Throwable $e) {
            // Log the error but continue execution
            error_log("Error loading routes file {$filePath}: " . $e->getMessage());
        }
    }
    return false;
}

// Include all route files private
require_once __DIR__ . '/../app/Features/Authentication/Routes/auth_routes.php';
require_once __DIR__ . '/../app/Features/AdminManagement/Routes/admin_routes.php';
require_once __DIR__ . '/../app/Features/ActivityTracking/Routes/activity_routes.php';
require_once __DIR__ . '/../app/Features/ProductCatalog/Categories/Routes/category_routes.php';
require_once __DIR__ . '/../app/Features/ProductCatalog/Subcategories/Routes/subcategory_routes.php';
require_once __DIR__ . '/../app/Features/ProductCatalog/ComprehensiveProducts/Routes/comprehensive_product_routes.php';
require_once __DIR__ . '/../app/Features/ProductCatalog/ProductImages/Routes/product_image_routes.php';
require_once __DIR__ . '/../app/Features/Coupons/Routes/coupon_routes.php';
require_once __DIR__ . '/../app/Features/FeaturedItems/Routes/featured_item_routes.php';
require_once __DIR__ . '/../app/Features/UserManagement/Routes/admin_user_routes.php';
require_once __DIR__ . '/../app/Features/AdminOrderManagement/Routes/admin_order_routes.php';

// Include only the routes we need public
require_once __DIR__ . '/../app/Features/Open/Products/Routes/open_product_routes.php';
require_once __DIR__ . '/../app/Features/Open/Categories/Routes/open_category_routes.php';
require_once __DIR__ . '/../app/Features/Open/Subcategories/Routes/open_subcategory_routes.php';
require_once __DIR__ . '/../app/Features/Open/Filters/Routes/open_filter_routes.php';
require_once __DIR__ . '/../app/Features/Open/FeaturedItems/Routes/open_featured_item_routes.php';
require_once __DIR__ . '/../app/Features/Open/Search/Routes/open_search_routes.php';
require_once __DIR__ . '/../app/Features/Open/Authentication/Routes/auth_otp_routes.php';
require_once __DIR__ . '/../app/Features/Open/Cart/Routes/open_cart_routes.php';
require_once __DIR__ . '/../app/Features/Open/UserProfile/Routes/user_profile_routes.php';
require_once __DIR__ . '/../app/Features/Open/UserAddress/Routes/user_address_routes.php';
require_once __DIR__ . '/../app/Features/Open/Checkout/Routes/checkout_routes.php';
require_once __DIR__ . '/../app/Features/Open/Orders/Routes/order_routes.php';


// Default route for API health check - always available
$router->get('/', function () {
    return [
        'status' => 'success',
        'message' => 'Ramesh Sweets API is running',
        'version' => '1.0.0',
        'timestamp' => date('Y-m-d H:i:s'),
    ];
});

// 404 Route - always available
$router->setNotFoundHandler(function () {
    http_response_code(404);
    return [
        'status' => 'error',
        'message' => 'Endpoint not found',
        'data' => null
    ];
});
