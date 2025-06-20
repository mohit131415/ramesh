<?php

namespace App\Features\Open\FeaturedItems\Actions;

use App\Core\Request;
use App\Core\Response;
use App\Features\Open\FeaturedItems\Services\PublicFeaturedItemService;
use Exception;

class GetFeaturedCategories
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
            
            // Get featured categories
            $featuredCategories = $this->featuredItemService->getFeaturedCategories($page, $limit);
            
            // Return success response
            return [
                'status' => 'success',
                'message' => 'Featured categories retrieved successfully',
                'data' => $featuredCategories
            ];
        } catch (Exception $e) {
            error_log("Error in GetFeaturedCategories: " . $e->getMessage());
            
            // Return error response
            return [
                'status' => 'error',
                'message' => 'Failed to retrieve featured categories',
                'data' => []
            ];
        }
    }
}
