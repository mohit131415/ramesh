<?php

namespace App\Features\FeaturedItems\Actions;

use App\Core\Request;
use App\Core\Response;
use App\Features\FeaturedItems\Services\FeaturedItemService;
use App\Core\Security\Authentication;
use App\Shared\Exceptions\AuthorizationException;
use App\Shared\Exceptions\NotFoundException;
use App\Shared\Helpers\ResponseFormatter;

class ListFeaturedItems
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
                return ResponseFormatter::error('Unauthorized access');
            }
            
            // Check if a specific ID is requested
            $id = (int) $request->getParam('id', 0);
            if ($id > 0) {
                // Get a single featured item by ID
                $featuredItem = $this->featuredItemService->getFeaturedItem($id);
                return ResponseFormatter::success($featuredItem, 'Featured item retrieved successfully');
            }
            
            // Get display type from query parameters if provided
            $displayType = $request->getParam('display_type');
            
            // Get featured items based on display type
            if ($displayType) {
                $featuredItems = $this->featuredItemService->getFeaturedItemsByType($displayType);
                return ResponseFormatter::success(
                    $featuredItems, 
                    ucfirst(str_replace('_', ' ', $displayType)) . ' retrieved successfully'
                );
            } else {
                // If no display type specified, get all types but organized by type
                $featuredProducts = $this->featuredItemService->getFeaturedItemsByType('featured_product');
                $featuredCategories = $this->featuredItemService->getFeaturedItemsByType('featured_category');
                $quickPicks = $this->featuredItemService->getFeaturedItemsByType('quick_pick');
                
                // Debug information
                error_log("Featured Products Count: " . count($featuredProducts));
                error_log("Featured Categories Count: " . count($featuredCategories));
                error_log("Quick Picks Count: " . count($quickPicks));
                
                // Return data in the expected structure
                return ResponseFormatter::success([
                    'featured_products' => $featuredProducts,
                    'featured_categories' => $featuredCategories,
                    'quick_picks' => $quickPicks
                ], 'Featured items retrieved successfully');
            }
        } catch (NotFoundException $e) {
            error_log("NotFoundException: " . $e->getMessage());
            return ResponseFormatter::error($e->getMessage());
        } catch (AuthorizationException $e) {
            error_log("AuthorizationException: " . $e->getMessage());
            return ResponseFormatter::error($e->getMessage());
        } catch (\Exception $e) {
            error_log("Exception in ListFeaturedItems: " . $e->getMessage());
            return ResponseFormatter::error($e->getMessage());
        }
    }
}
