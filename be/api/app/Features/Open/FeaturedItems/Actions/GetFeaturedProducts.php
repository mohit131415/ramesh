<?php

namespace App\Features\Open\FeaturedItems\Actions;

use App\Core\Request;
use App\Core\Response;
use App\Features\Open\FeaturedItems\Services\PublicFeaturedItemService;
use App\Shared\Helpers\ResponseFormatter;
use Exception;

class GetFeaturedProducts
{
    private $featuredItemService;

    public function __construct()
    {
        $this->featuredItemService = new PublicFeaturedItemService();
    }

    public function execute(Request $request, Response $response)
    {
        try {
            // Get pagination parameters
            $page = (int) $request->getQuery('page', 1);
            // Use a higher default limit to ensure we get all items
            // The actual limit will be determined by the setting in the database
            $limit = (int) $request->getQuery('limit', 100);
            
            // Get featured products
            $featuredProducts = $this->featuredItemService->getFeaturedProducts($page, $limit);
            
            // Return response with only status, message, and data
            return [
                'status' => 'success',
                'message' => 'Featured products retrieved successfully',
                'data' => $featuredProducts
            ];
        } catch (Exception $e) {
            return [
                'status' => 'error',
                'message' => 'Failed to retrieve featured products',
                'data' => []
            ];
        }
    }
}
