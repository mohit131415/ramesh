<?php

namespace App\Features\Open\Search\Actions;

use App\Core\Request;
use App\Core\Response;
use App\Features\Open\Search\Services\UnifiedSearchService;
use Exception;

class UnifiedSearch
{
    private $searchService;

    public function __construct()
    {
        $this->searchService = new UnifiedSearchService();
    }

    // Update the execute method to ensure proper ordering of results
    public function execute(Request $request, Response $response)
    {
    try {
        // Log all query parameters for debugging
        error_log("Search request received with query string: " . $_SERVER['QUERY_STRING']);
    
        // Get search query parameter - check all possible parameter names
        $query = $request->getQuery('query', '');
        error_log("query parameter: " . $query);
    
        // If query is empty, check other common parameter names
        if (empty($query)) {
            $query = $request->getQuery('q', '');
            if (!empty($query)) error_log("Using q parameter: " . $query);
        }
    
        if (empty($query)) {
            $query = $request->getQuery('search', '');
            if (!empty($query)) error_log("Using search parameter: " . $query);
        }
    
        if (empty($query)) {
            $query = $request->getQuery('s', '');
            if (!empty($query)) error_log("Using s parameter: " . $query);
        }
    
        if (empty($query)) {
            $query = $request->getQuery('keyword', '');
            if (!empty($query)) error_log("Using keyword parameter: " . $query);
        }
    
        if (empty($query)) {
            $query = $request->getQuery('term', '');
            if (!empty($query)) error_log("Using term parameter: " . $query);
        }
    
        if (empty($query)) {
            $query = $request->getQuery('sa', '');
            if (!empty($query)) error_log("Using sa parameter: " . $query);
        }
    
        // Get other parameters
        $type = $request->getQuery('type', ''); // Optional: category, subcategory, product
        $limit = (int) $request->getQuery('limit', 10);
    
        // Log the final search parameters
        error_log("Final search parameters - query: '$query', type: '$type', limit: $limit");
    
        // If query is empty, return empty results
        if (empty($query)) {
            error_log("No search query provided, returning empty results");
            return [
                'status' => 'success',
                'message' => 'No search query provided',
                'data' => [
                    'categories' => [],
                    'subcategories' => [],
                    'products' => []
                ]
            ];
        }
    
        // Perform search
        error_log("Performing search with query: '$query'");
        $results = $this->searchService->search($query, $type, $limit);
    
        // Log search results summary
        error_log("UnifiedSearch::execute - Search completed. Found categories: " . count($results['categories']) . 
                  ", subcategories: " . count($results['subcategories']) . 
                  ", products: " . count($results['products']));
    
        // Format the results into a flat array with sophisticated ordering
        $formattedResults = [];
    
        // Categorize products with more sophisticated matching
        $exactNameMatches = [];
        $wordStartsWithQueryMatches = [];
        $startsWithQueryMatches = [];
        $containsQueryMatches = [];
        $otherProducts = [];

        foreach ($results['products'] as $product) {
            $imageUrl = null;

            // Try to get the primary image first
            if (isset($product['images']) && is_array($product['images']) && !empty($product['images'])) {
                foreach ($product['images'] as $image) {
                    if (isset($image['is_primary']) && $image['is_primary'] == 1) {
                        $imageUrl = $image['image_path'];
                        break;
                    }
                }
            
                // If no primary image found, use the first image
                if (!$imageUrl && !empty($product['images'][0]['image_path'])) {
                    $imageUrl = $product['images'][0]['image_path'];
                }
            }

            $formattedProduct = [
                'type' => 'product',
                'id' => $product['id'],
                'name' => $product['name'],
                'image' => $imageUrl,
                'slug' => $product['slug']
            ];

            $productNameLower = strtolower($product['name']);
            $queryLower = strtolower($query);

            // Check if this is an exact name match
            if ($productNameLower === $queryLower) {
                $exactNameMatches[] = $formattedProduct;
            } 
            // MOST IMPORTANT: Check if any word in the name starts with the query
            else {
                $words = explode(' ', $productNameLower);
                $wordStartsWithQuery = false;
                
                foreach ($words as $word) {
                    // Remove any punctuation and check if word starts with query
                    $cleanWord = preg_replace('/[^a-z0-9]/', '', $word);
                    if (strpos($cleanWord, $queryLower) === 0 && strlen($queryLower) > 0) {
                        $wordStartsWithQuery = true;
                        break;
                    }
                }
                
                if ($wordStartsWithQuery) {
                    $wordStartsWithQueryMatches[] = $formattedProduct;
                }
                // Check if name starts with the query
                elseif (strpos($productNameLower, $queryLower) === 0) {
                    $startsWithQueryMatches[] = $formattedProduct;
                }
                // Check if name contains query anywhere
                elseif (strpos($productNameLower, $queryLower) !== false) {
                    $containsQueryMatches[] = $formattedProduct;
                }
                // All other products
                else {
                    $otherProducts[] = $formattedProduct;
                }
            }

            error_log("Processed product: " . $product['name'] . " with image: " . $imageUrl);
        }
    
        // Add categories and subcategories
        $categories = [];
        foreach ($results['categories'] as $category) {
            $categories[] = [
                'type' => 'category',
                'id' => $category['id'],
                'name' => $category['name'],
                'image' => $category['image'] ?? null,
                'slug' => $category['slug']
            ];
        }
    
        $subcategories = [];
        foreach ($results['subcategories'] as $subcategory) {
            $subcategories[] = [
                'type' => 'subcategory',
                'id' => $subcategory['id'],
                'name' => $subcategory['name'],
                'image' => $subcategory['image'] ?? null,
                'slug' => $subcategory['slug']
            ];
        }
    
        // Combine results in the most logical order:
        // 1. Exact product name matches
        // 2. Products where ANY WORD starts with the query (HIGHEST PRIORITY for "Kaju" products)
        // 3. Products that start with the query
        // 4. Categories and subcategories
        // 5. Products that contain the query
        // 6. Other products
        $formattedResults = array_merge(
            $exactNameMatches,
            $wordStartsWithQueryMatches,  // This should catch "Kaju" products for "kj" search
            $startsWithQueryMatches,
            $categories,
            $subcategories,
            $containsQueryMatches,
            $otherProducts
        );
    
        return [
            'status' => 'success',
            'message' => 'Search results retrieved successfully',
            'data' => $formattedResults
        ];
    
    } catch (Exception $e) {
        error_log("ERROR in UnifiedSearch: " . $e->getMessage());
        error_log("Exception trace: " . $e->getTraceAsString());
    
        return [
            'status' => 'error',
            'message' => 'An error occurred while searching: ' . $e->getMessage(),
            'data' => []
        ];
    }
}
}
