<?php

namespace App\Features\Open\FeaturedItems\Actions;

use App\Core\Request;
use App\Core\Response;
use App\Features\Open\FeaturedItems\Services\PublicFeaturedItemService;
use Exception;

class GetQuickPicks
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
            
            // Get quick picks
            $quickPicks = $this->featuredItemService->getQuickPicks($page, $limit);
            
            // Return response with only status, message, and data
            return [
                'status' => 'success',
                'message' => 'Quick picks retrieved successfully',
                'data' => $quickPicks
            ];
        } catch (Exception $e) {
            return [
                'status' => 'error',
                'message' => 'Failed to retrieve quick picks',
                'data' => []
            ];
        }
    }
}
