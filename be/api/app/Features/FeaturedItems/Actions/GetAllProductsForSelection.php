<?php

namespace App\Features\FeaturedItems\Actions;

use App\Core\Request;
use App\Core\Response;
use App\Features\FeaturedItems\Services\FeaturedItemSelectionService;
use App\Core\Security\Authentication;
use App\Shared\Exceptions\AuthorizationException;
use App\Shared\Helpers\ResponseFormatter;

class GetAllProductsForSelection
{
    private $selectionService;
    private $authentication;

    public function __construct()
    {
        $this->selectionService = new FeaturedItemSelectionService();
        $this->authentication = Authentication::getInstance();
    }

    public function execute(Request $request, Response $response)
    {
        try {
            // Check if user is authenticated
            if (!$this->authentication->check()) {
                return ResponseFormatter::error('Unauthorized access');
            }
        
            $search = $request->getParam('search', '');
            $displayType = $request->getParam('display_type', 'featured_product'); // featured_product or quick_pick
        
            // Validate display type
            if (!in_array($displayType, ['featured_product', 'quick_pick'])) {
                return ResponseFormatter::error('Invalid display type. Must be featured_product or quick_pick');
            }
        
            // Get all products for selection - no pagination
            $result = $this->selectionService->getAllProductsForSelection($search, $displayType);
        
            return ResponseFormatter::success($result, 'Products retrieved successfully for selection');
        
        } catch (AuthorizationException $e) {
            error_log("AuthorizationException: " . $e->getMessage());
            return ResponseFormatter::error($e->getMessage());
        } catch (\Exception $e) {
            error_log("Exception in GetAllProductsForSelection: " . $e->getMessage());
            return ResponseFormatter::error('Failed to retrieve products: ' . $e->getMessage());
        }
    }
}
