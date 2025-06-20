<?php

namespace App\Features\FeaturedItems\Actions;

use App\Core\Request;
use App\Core\Response;
use App\Features\FeaturedItems\Services\FeaturedItemService;
use App\Core\Security\Authentication;
use App\Shared\Exceptions\AuthorizationException;

class GetFeaturedItemLimits
{
    private $featuredItemService;
    private $authentication;

    public function __construct()
    {
        $this->featuredItemService = new FeaturedItemService();
        $this->authentication = Authentication::getInstance();
    }

    public function execute(Request $request, Response $response)
    {
        try {
            // Check if user is authenticated
            if (!$this->authentication->check()) {
                return [
                    'status' => 'error',
                    'message' => 'Unauthorized access',
                    'data' => null
                ];
            }
            
            $limits = $this->featuredItemService->getFeaturedItemLimits();
            
            // Format the response to match expected structure
            $formattedLimits = [
                'featured_product' => $limits['featured_product']['limit'],
                'featured_category' => $limits['featured_category']['limit'],
                'quick_pick' => $limits['quick_pick']['limit']
            ];
            
            return [
                'status' => 'success',
                'message' => 'Featured item limits retrieved successfully',
                'data' => $formattedLimits
            ];
        } catch (AuthorizationException $e) {
            return [
                'status' => 'error',
                'message' => $e->getMessage(),
                'data' => null
            ];
        } catch (\Exception $e) {
            return [
                'status' => 'error',
                'message' => $e->getMessage(),
                'data' => null
            ];
        }
    }
}
