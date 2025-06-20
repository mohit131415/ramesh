<?php

namespace App\Features\Open\FeaturedItems\Actions;

use App\Core\Request;
use App\Core\Response;
use App\Features\Open\FeaturedItems\Services\PublicFeaturedItemService;
use Exception;

class GetAllFeaturedItems
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
            $limit = (int) $request->getQuery('limit', 10);
            
            // Get all featured items
            $allFeaturedItems = $this->featuredItemService->getAllFeaturedItems($page, $limit);
            
            // Return response with only status, message, and data
            return [
                'status' => 'success',
                'message' => 'All featured items retrieved successfully',
                'data' => $allFeaturedItems
            ];
        } catch (Exception $e) {
            return [
                'status' => 'error',
                'message' => 'Failed to retrieve featured items',
                'data' => []
            ];
        }
    }
}
