<?php

namespace App\Features\Open\Filters\Actions;

use App\Core\Response;
use App\Features\Open\Filters\Services\ComprehensiveFilterService;
use Exception;

class ComprehensiveFilter
{
    private $filterService;

    public function __construct()
    {
        $this->filterService = new ComprehensiveFilterService();
    }

    public function __invoke($request, $response, $args = [])
    {
        try {
            // Check if this is a search request
            if ($request->getQuery('q') !== null) {
                return $this->handleProductSearch($request, $response);
            }
            
            // Get all filter parameters
            $categoryId = $request->getQuery('category_id') ? (int)$request->getQuery('category_id') : null;
            
            // Handle multiple subcategory IDs - check for array format first
            $subcategoryIds = [];
            
            // Check if subcategory_ids is provided as an array (subcategory_ids[]=15)
            if ($request->getQuery('subcategory_ids') && is_array($request->getQuery('subcategory_ids'))) {
                $subcategoryIds = array_map('intval', $request->getQuery('subcategory_ids'));
                error_log("Subcategory IDs from array: " . json_encode($subcategoryIds));
            } 
            // Check for single subcategory_id parameter
            elseif ($request->getQuery('subcategory_id')) {
                // Check if it's a comma-separated list
                $subcategoryParam = $request->getQuery('subcategory_id');
                if (strpos($subcategoryParam, ',') !== false) {
                    $subcategoryIds = array_map('intval', explode(',', $subcategoryParam));
                } else {
                    $subcategoryIds = [(int)$subcategoryParam];
                }
                error_log("Subcategory IDs from subcategory_id: " . json_encode($subcategoryIds));
            }
            
            // Get price range parameters
            $minPrice = $request->getQuery('min_price') !== null && $request->getQuery('min_price') !== '' 
                ? (float)$request->getQuery('min_price') 
                : null;
            
            $maxPrice = $request->getQuery('max_price') !== null && $request->getQuery('max_price') !== '' 
                ? (float)$request->getQuery('max_price') 
                : null;
            
            $isVegetarian = $request->getQuery('is_vegetarian') !== null && $request->getQuery('is_vegetarian') !== '' 
                ? (int)$request->getQuery('is_vegetarian') 
                : null;
            
            // Check for both sort and sort_by parameters
            $sortBy = 'popular'; // Default value
            if ($request->getQuery('sort_by') && $request->getQuery('sort_by') !== '') {
                $sortBy = $request->getQuery('sort_by');
            } elseif ($request->getQuery('sort') && $request->getQuery('sort') !== '') {
                $sortBy = $request->getQuery('sort');
            }
            
            $page = $request->getQuery('page') ? (int)$request->getQuery('page') : 1;
            $limit = $request->getQuery('limit') ? (int)$request->getQuery('limit') : 12;
            
            // Log the request parameters for debugging
            error_log("ComprehensiveFilter - Parameters: " . json_encode([
                'category_id' => $categoryId,
                'subcategory_ids' => $subcategoryIds,
                'min_price' => $minPrice,
                'max_price' => $maxPrice,
                'is_vegetarian' => $isVegetarian,
                'sort_by' => $sortBy,
                'page' => $page,
                'limit' => $limit
            ]));
            
            // Call the service to get filtered products
            $result = $this->filterService->getFilteredProducts(
                $categoryId,
                $subcategoryIds,
                $minPrice,
                $maxPrice,
                $isVegetarian,
                $sortBy,
                $page,
                $limit
            );
            
            // Return a simple response structure using the correct Response methods
            return $response->json([
                'status' => 'success',
                'message' => 'Products retrieved successfully',
                'data' => $result
            ], 200);
        } catch (Exception $e) {
            error_log("Error in ComprehensiveFilter: " . $e->getMessage());
            error_log("Stack trace: " . $e->getTraceAsString());
            
            // Return a simple error response structure using the correct Response methods
            return $response->json([
                'status' => 'error',
                'message' => 'An error occurred while filtering products: ' . $e->getMessage(),
                'data' => null
            ], 500);
        }
    }
    
    /**
     * Handle product search request
     * 
     * @param object $request Request object
     * @param object $response Response object
     * @return object Response with search results
     */
    private function handleProductSearch($request, $response)
    {
        try {
            $searchTerm = $request->getQuery('q');
            $page = $request->getQuery('page') ? (int)$request->getQuery('page') : 1;
            $limit = $request->getQuery('limit') ? (int)$request->getQuery('limit') : 12;
            
            // Get filter parameters
            $categoryId = $request->getQuery('category_id') ? (int)$request->getQuery('category_id') : null;
            
            // Handle multiple subcategory IDs
            $subcategoryIds = [];
            if ($request->getQuery('subcategory_ids') && is_array($request->getQuery('subcategory_ids'))) {
                $subcategoryIds = array_map('intval', $request->getQuery('subcategory_ids'));
            } elseif ($request->getQuery('subcategory_id')) {
                $subcategoryParam = $request->getQuery('subcategory_id');
                if (strpos($subcategoryParam, ',') !== false) {
                    $subcategoryIds = array_map('intval', explode(',', $subcategoryParam));
                } else {
                    $subcategoryIds = [(int)$subcategoryParam];
                }
            }
            
            // Get price range parameters
            $minPrice = $request->getQuery('min_price') !== null && $request->getQuery('min_price') !== '' 
                ? (float)$request->getQuery('min_price') 
                : null;
            
            $maxPrice = $request->getQuery('max_price') !== null && $request->getQuery('max_price') !== '' 
                ? (float)$request->getQuery('max_price') 
                : null;
            
            $isVegetarian = $request->getQuery('is_vegetarian') !== null && $request->getQuery('is_vegetarian') !== '' 
                ? (int)$request->getQuery('is_vegetarian') 
                : null;
            
            if (empty($searchTerm)) {
                return $response->json([
                    'status' => 'error',
                    'message' => 'Search term is required',
                    'data' => null
                ], 400);
            }
            
            // Log the search and filter parameters
            error_log("Search with filters - Parameters: " . json_encode([
                'q' => $searchTerm,
                'category_id' => $categoryId,
                'subcategory_ids' => $subcategoryIds,
                'min_price' => $minPrice,
                'max_price' => $maxPrice,
                'is_vegetarian' => $isVegetarian,
                'page' => $page,
                'limit' => $limit
            ]));
            
            // Call the service to search products with filters
            $result = $this->filterService->searchProductsWithFilters(
                $searchTerm,
                $categoryId,
                $subcategoryIds,
                $minPrice,
                $maxPrice,
                $isVegetarian,
                $page,
                $limit
            );
            
            // Return the complete product data
            return $response->json([
                'status' => 'success',
                'message' => 'Search results found',
                'data' => $result
            ], 200);
        } catch (Exception $e) {
            error_log("Error in handleProductSearch: " . $e->getMessage());
            error_log("Stack trace: " . $e->getTraceAsString());
            
            return $response->json([
                'status' => 'error',
                'message' => 'An error occurred while searching products: ' . $e->getMessage(),
                'data' => null
            ], 500);
        }
    }
}
