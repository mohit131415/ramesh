<?php

namespace App\Features\Open\Filters\Services;

use App\Features\Open\Filters\DataAccess\ComprehensiveFilterRepository;
use App\Shared\DataFetchers\ProductDataFetcher;
use App\Core\Database;
use Exception;
use PDO;

class ComprehensiveFilterService
{
    private $filterRepository;
    private $productDataFetcher;
    private $db;
    
    public function __construct()
    {
        $this->filterRepository = new ComprehensiveFilterRepository();
        $this->productDataFetcher = new ProductDataFetcher();
        $this->db = Database::getInstance()->getConnection();
    }
    
    /**
     * Get filtered products with pagination and sorting
     * 
     * @param int|null $categoryId Category ID
     * @param array $subcategoryIds Array of subcategory IDs
     * @param float|null $minPrice Minimum price
     * @param float|null $maxPrice Maximum price
     * @param int|null $isVegetarian Vegetarian filter (1 or 0)
     * @param string $sortBy Sort option
     * @param int $page Page number
     * @param int $limit Items per page
     * @return array Filtered products with pagination info
     */
    public function getFilteredProducts(
        ?int $categoryId,
        array $subcategoryIds,
        ?float $minPrice,
        ?float $maxPrice,
        ?int $isVegetarian,
        string $sortBy = 'popular',
        int $page = 1,
        int $limit = 12
    ): array {
        try {
            // Log input parameters
            error_log("getFilteredProducts - Input parameters:");
            error_log("categoryId: " . ($categoryId ?? 'null'));
            error_log("subcategoryIds: " . json_encode($subcategoryIds));
            error_log("minPrice: " . ($minPrice ?? 'null'));
            error_log("maxPrice: " . ($maxPrice ?? 'null'));
            error_log("isVegetarian: " . ($isVegetarian ?? 'null'));
            error_log("sortBy: " . $sortBy);
            error_log("page: " . $page);
            error_log("limit: " . $limit);
            
            // Get filtered product IDs
            $filteredProducts = $this->filterRepository->getFilteredProductIds(
                $categoryId,
                $subcategoryIds,
                $minPrice,
                $maxPrice,
                $isVegetarian
            );
            
            $productIds = $filteredProducts['product_ids'];
            $totalCount = $filteredProducts['total_count'];
            
            // Calculate pagination
            $offset = ($page - 1) * $limit;
            $totalPages = ceil($totalCount / $limit);
            
            // Get products with sorting and pagination
            $products = [];
            if (!empty($productIds)) {
                // Get all products first
                $allProducts = $this->productDataFetcher->getProductsWithSorting($productIds, $sortBy);
                
                // Apply pagination
                $products = array_slice($allProducts, $offset, $limit);
                
                error_log("Retrieved " . count($products) . " products after sorting and pagination");
            } else {
                error_log("No product IDs found for the filter criteria");
            }
            
            // Get price range
            $priceRange = $this->filterRepository->getPriceRange($categoryId, $subcategoryIds);
            
            // Get available subcategories
            $availableSubcategories = [];
            if ($categoryId !== null) {
                $availableSubcategories = $this->filterRepository->getSubcategoriesByCategory($categoryId);
            } else {
                $availableSubcategories = $this->filterRepository->getAllSubcategories();
            }
            
            // Get available categories
            $availableCategories = $this->filterRepository->getAllCategoriesWithProductCount();
            
            // Sort options
            $sortOptions = [
                ['value' => 'popular', 'label' => 'Popular'],
                ['value' => 'name_asc', 'label' => 'Name: A to Z'],
                ['value' => 'name_desc', 'label' => 'Name: Z to A'],
                ['value' => 'price_low', 'label' => 'Price: Low to High'],
                ['value' => 'price_high', 'label' => 'Price: High to Low'],
                ['value' => 'discount_low', 'label' => 'Discount: Low to High'],
                ['value' => 'discount_high', 'label' => 'Discount: High to Low'],
                ['value' => 'newest', 'label' => 'Newest First']
            ];
            
            // Return structured response
            return [
                'products' => [
                    'items' => $products,
                    'total' => $totalCount,
                    'page' => $page,
                    'limit' => $limit,
                    'total_pages' => $totalPages
                ],
                'filters' => [
                    'price_range' => $priceRange,
                    'sort_options' => $sortOptions,
                    'current_sort' => $sortBy,
                    'category' => $categoryId,
                    'subcategories' => $subcategoryIds,
                    'available_subcategories' => $availableSubcategories,
                    'available_categories' => $availableCategories,
                    'applied_filters' => [
                        'category_id' => $categoryId,
                        'subcategory_ids' => $subcategoryIds,
                        'min_price' => $minPrice ?? $priceRange['min_price'],
                        'max_price' => $maxPrice ?? $priceRange['max_price'],
                        'is_vegetarian' => $isVegetarian
                    ]
                ]
            ];
        } catch (Exception $e) {
            error_log("Error in getFilteredProducts: " . $e->getMessage());
            error_log("Stack trace: " . $e->getTraceAsString());
            throw $e;
        }
    }

    /**
     * Enhanced search for products with advanced fuzzy matching
     * 
     * @param string $searchTerm Search term
     * @param int $page Page number
     * @param int $limit Items per page
     * @return array Products with pagination info
     */
    public function searchProducts(string $searchTerm, int $page = 1, int $limit = 12): array
    {
        try {
            // Log search parameters
            error_log("Product Search - Parameters: " . json_encode([
                'q' => $searchTerm,
                'page' => $page,
                'limit' => $limit
            ]));
            
            // Calculate offset for pagination
            $offset = ($page - 1) * $limit;
            
            // Clean and normalize the search term
            $searchTerm = $this->normalizeSearchTerm($searchTerm);
            
            // If search term is empty after normalization, return empty result
            if (empty($searchTerm)) {
                return [
                    'products' => [],
                    'pagination' => [
                        'total' => 0,
                        'per_page' => $limit,
                        'current_page' => $page,
                        'last_page' => 0,
                        'from' => 0,
                        'to' => 0
                    ]
                ];
            }
            
            // Get product IDs and total count that match the search criteria
            $searchResults = $this->filterRepository->getProductIdsBySearchTerm($searchTerm, $limit, $offset);
            $productIds = $searchResults['product_ids'];
            $totalCount = $searchResults['total_count'];
            
            // If no products found, return empty result
            if (empty($productIds)) {
                return [
                    'products' => [],
                    'pagination' => [
                        'total' => 0,
                        'per_page' => $limit,
                        'current_page' => $page,
                        'last_page' => 0,
                        'from' => 0,
                        'to' => 0
                    ]
                ];
            }
            
            // Use ProductDataFetcher to get complete product information
            $products = $this->productDataFetcher->getProductsByIds($productIds);
            
            // Calculate pagination metadata
            $totalPages = ceil($totalCount / $limit);
            
            return [
                'products' => $products,
                'pagination' => [
                    'total' => (int)$totalCount,
                    'per_page' => $limit,
                    'current_page' => $page,
                    'last_page' => $totalPages,
                    'from' => $offset + 1,
                    'to' => min($offset + $limit, $totalCount)
                ]
            ];
        } catch (Exception $e) {
            error_log("Error in searchProducts: " . $e->getMessage());
            error_log("Stack trace: " . $e->getTraceAsString());
            throw $e;
        }
    }
    
    /**
     * Normalize search term by removing extra spaces, special characters, etc.
     * 
     * @param string $searchTerm Search term
     * @return string Normalized search term
     */
    private function normalizeSearchTerm(string $searchTerm): string
    {
        // Convert to lowercase
        $searchTerm = strtolower($searchTerm);
        
        // Remove extra spaces
        $searchTerm = preg_replace('/\s+/', ' ', $searchTerm);
        
        // Remove special characters but keep spaces
        $searchTerm = preg_replace('/[^\p{L}\p{N}\s]/u', '', $searchTerm);
        
        // Trim whitespace
        $searchTerm = trim($searchTerm);
        
        return $searchTerm;
    }

    /**
     * Search products with additional filters
     * 
     * @param string $searchTerm Search term
     * @param int|null $categoryId Category ID
     * @param array $subcategoryIds Array of subcategory IDs
     * @param float|null $minPrice Minimum price
     * @param float|null $maxPrice Maximum price
     * @param int|null $isVegetarian Vegetarian filter (1 or 0)
     * @param int $page Page number
     * @param int $limit Items per page
     * @return array Products with pagination info
     */
    public function searchProductsWithFilters(
        string $searchTerm,
        ?int $categoryId,
        array $subcategoryIds,
        ?float $minPrice,
        ?float $maxPrice,
        ?int $isVegetarian,
        int $page = 1,
        int $limit = 12
    ): array {
        try {
            // Log search and filter parameters
            error_log("searchProductsWithFilters - Input parameters:");
            error_log("searchTerm: " . $searchTerm);
            error_log("categoryId: " . ($categoryId ?? 'null'));
            error_log("subcategoryIds: " . json_encode($subcategoryIds));
            error_log("minPrice: " . ($minPrice ?? 'null'));
            error_log("maxPrice: " . ($maxPrice ?? 'null'));
            error_log("isVegetarian: " . ($isVegetarian ?? 'null'));
            error_log("page: " . $page);
            error_log("limit: " . $limit);
            
            // Clean and normalize the search term
            $searchTerm = $this->normalizeSearchTerm($searchTerm);
            
            // If search term is empty after normalization, return empty result
            if (empty($searchTerm)) {
                return [
                    'products' => [],
                    'pagination' => [
                        'total' => 0,
                        'per_page' => $limit,
                        'current_page' => $page,
                        'last_page' => 0,
                        'from' => 0,
                        'to' => 0
                    ]
                ];
            }
            
            // Get product IDs that match the search term and filters
            $searchResults = $this->filterRepository->getProductIdsBySearchTermWithFilters(
                $searchTerm,
                $categoryId,
                $subcategoryIds,
                $minPrice,
                $maxPrice,
                $isVegetarian,
                $limit,
                ($page - 1) * $limit
            );
            
            $productIds = $searchResults['product_ids'];
            $totalCount = $searchResults['total_count'];
            
            // If no products found, return empty result
            if (empty($productIds)) {
                return [
                    'products' => [],
                    'pagination' => [
                        'total' => 0,
                        'per_page' => $limit,
                        'current_page' => $page,
                        'last_page' => 0,
                        'from' => 0,
                        'to' => 0
                    ]
                ];
            }
            
            // Use ProductDataFetcher to get complete product information
            $products = $this->productDataFetcher->getProductsByIds($productIds);
            
            // Calculate pagination metadata
            $totalPages = ceil($totalCount / $limit);
            
            return [
                'products' => $products,
                'pagination' => [
                    'total' => (int)$totalCount,
                    'per_page' => $limit,
                    'current_page' => $page,
                    'last_page' => $totalPages,
                    'from' => ($page - 1) * $limit + 1,
                    'to' => min($page * $limit, $totalCount)
                ]
            ];
        } catch (Exception $e) {
            error_log("Error in searchProductsWithFilters: " . $e->getMessage());
            error_log("Stack trace: " . $e->getTraceAsString());
            throw $e;
        }
    }

    /**
     * Get product IDs by search term with improved relevance ranking
     * 
     * @param string $searchTerm Search term
     * @param int $limit Limit
     * @param int $offset Offset
     * @return array Product IDs and total count
     */
    private function getProductIdsBySearchTerm(string $searchTerm, int $limit, int $offset): array
    {
        try {
            // Prepare the search term for LIKE query
            $searchPattern = '%' . $searchTerm . '%';
            $exactPattern = $searchTerm;
            
            // Get similar product names for fuzzy search
            $similarProductNames = $this->getSimilarProductNames($searchTerm);
            $fuzzySearchCondition = '';
            $fuzzyParams = [];
            
            if (!empty($similarProductNames)) {
                $placeholders = implode(',', array_fill(0, count($similarProductNames), '?'));
                $fuzzySearchCondition = " OR p.name IN ($placeholders)";
                $fuzzyParams = $similarProductNames;
            }
            
            // Query to get products matching the search term with relevance ranking
            $sql = "
                SELECT 
                    p.id,
                    CASE
                        WHEN p.name = ? THEN 100  -- Exact match with product name (highest priority)
                        WHEN p.name LIKE ? THEN 90  -- Starts with search term
                        WHEN t.name = ? THEN 80  -- Exact match with tag name
                        WHEN p.name LIKE ? THEN 70  -- Contains search term in product name
                        WHEN t.name LIKE ? THEN 60  -- Contains search term in tag name
                        WHEN p.description LIKE ? THEN 50  -- Contains search term in description
                        ELSE 10  -- Other matches
                    END as relevance_score,
                    COUNT(*) OVER() as total_count
                FROM 
                    products p
                JOIN 
                    product_variants pv ON p.id = pv.product_id
                JOIN 
                    subcategories s ON p.subcategory_id = s.id
                JOIN 
                    categories c ON s.category_id = c.id
                LEFT JOIN
                    product_tags pt ON p.id = pt.product_id
                LEFT JOIN
                    tags t ON pt.tag_id = t.id
                WHERE 
                    p.status = 'active' 
                    AND pv.status = 'active'
                    AND s.status = 'active'
                    AND c.status = 'active'
                    AND (
                        p.name LIKE ? 
                        OR p.description LIKE ? 
                        OR t.name LIKE ?
                        $fuzzySearchCondition
                    )
                GROUP BY 
                    p.id
                ORDER BY 
                    relevance_score DESC,
                    p.name ASC
                LIMIT ? OFFSET ?
            ";
            
            $stmt = $this->db->prepare($sql);
            
            // Bind parameters for relevance scoring
            $stmt->bindValue(1, $exactPattern, PDO::PARAM_STR); // Exact match with product name
            $stmt->bindValue(2, $searchTerm . '%', PDO::PARAM_STR); // Starts with search term
            $stmt->bindValue(3, $exactPattern, PDO::PARAM_STR); // Exact match with tag name
            $stmt->bindValue(4, $searchPattern, PDO::PARAM_STR); // Contains search term in product name
            $stmt->bindValue(5, $searchPattern, PDO::PARAM_STR); // Contains search term in tag name
            $stmt->bindValue(6, $searchPattern, PDO::PARAM_STR); // Contains search term in description
            
            // Bind parameters for WHERE clause
            $stmt->bindValue(7, $searchPattern, PDO::PARAM_STR);
            $stmt->bindValue(8, $searchPattern, PDO::PARAM_STR);
            $stmt->bindValue(9, $searchPattern, PDO::PARAM_STR);
            
            // Bind fuzzy search parameters
            $paramIndex = 10;
            foreach ($fuzzyParams as $param) {
                $stmt->bindValue($paramIndex++, $param, PDO::PARAM_STR);
            }
            
            // Bind limit and offset
            $stmt->bindValue($paramIndex++, $limit, PDO::PARAM_INT);
            $stmt->bindValue($paramIndex++, $offset, PDO::PARAM_INT);
            
            $stmt->execute();
            
            $results = $stmt->fetchAll(PDO::FETCH_ASSOC);
            $totalCount = !empty($results) ? $results[0]['total_count'] : 0;
            
            // Extract product IDs
            $productIds = array_column($results, 'id');
            
            return [
                'product_ids' => $productIds,
                'total_count' => (int)$totalCount
            ];
        } catch (Exception $e) {
            error_log("Error in getProductIdsBySearchTerm: " . $e->getMessage());
            error_log("Stack trace: " . $e->getTraceAsString());
            throw $e;
        }
    }

    /**
     * Get product IDs by phonetic search
     * 
     * @param string $searchTerm Search term
     * @param int $limit Limit
     * @param int $offset Offset
     * @return array Product IDs and total count
     */
    private function getProductIdsByPhoneticSearch(string $searchTerm, int $limit, int $offset): array
    {
        try {
            // Get the soundex code for the search term
            $soundexCode = soundex($searchTerm);
            
            // Query to get products matching the phonetic pattern
            $sql = "
                SELECT 
                    p.id,
                    COUNT(*) OVER() as total_count
                FROM 
                    products p
                JOIN 
                    product_variants pv ON p.id = pv.product_id
                JOIN 
                    subcategories s ON p.subcategory_id = s.id
                JOIN 
                    categories c ON s.category_id = c.id
                WHERE 
                    p.status = 'active' 
                    AND pv.status = 'active'
                    AND s.status = 'active'
                    AND c.status = 'active'
                    AND SOUNDEX(p.name) = ?
                GROUP BY 
                    p.id
                ORDER BY 
                    p.name ASC
                LIMIT ? OFFSET ?
            ";
            
            $stmt = $this->db->prepare($sql);
            $stmt->bindValue(1, $soundexCode, PDO::PARAM_STR);
            $stmt->bindValue(2, $limit, PDO::PARAM_INT);
            $stmt->bindValue(3, $offset, PDO::PARAM_INT);
            $stmt->execute();
            
            $results = $stmt->fetchAll(PDO::FETCH_ASSOC);
            $totalCount = !empty($results) ? $results[0]['total_count'] : 0;
            
            // Extract product IDs
            $productIds = array_column($results, 'id');
            
            return [
                'product_ids' => $productIds,
                'total_count' => (int)$totalCount
            ];
        } catch (Exception $e) {
            error_log("Error in getProductIdsByPhoneticSearch: " . $e->getMessage());
            error_log("Stack trace: " . $e->getTraceAsString());
            return [
                'product_ids' => [],
                'total_count' => 0
            ];
        }
    }

    /**
     * Get similar product names using Levenshtein distance
     * 
     * @param string $searchTerm Search term
     * @return array Similar product names
     */
    private function getSimilarProductNames(string $searchTerm): array
    {
        try {
            // Get all product names
            $sql = "
                SELECT DISTINCT name 
                FROM products 
                WHERE status = 'active'
            ";
            
            $stmt = $this->db->prepare($sql);
            $stmt->execute();
            $productNames = $stmt->fetchAll(PDO::FETCH_COLUMN);
            
            // Find similar names using Levenshtein distance
            $similarNames = [];
            $maxDistance = min(3, strlen($searchTerm) / 2); // Adjust distance based on term length
            
            foreach ($productNames as $name) {
                // Calculate Levenshtein distance
                $distance = levenshtein(strtolower($searchTerm), strtolower($name));
                
                // Check if name is similar enough
                if ($distance <= $maxDistance) {
                    $similarNames[] = $name;
                }
            }
            
            return $similarNames;
        } catch (Exception $e) {
            error_log("Error in getSimilarProductNames: " . $e->getMessage());
            error_log("Stack trace: " . $e->getTraceAsString());
            return [];
        }
    }

    /**
     * Perform unified search across products, categories, and subcategories
     * 
     * @param string $searchTerm Search term
     * @param string|null $type Optional type filter: 'product', 'category', 'subcategory'
     * @param int $limit Limit
     * @return array Search results
     */
    public function unifiedSearch(string $searchTerm, ?string $type = null, int $limit = 10): array
    {
        try {
            // Log search parameters
            error_log("Unified Search - Parameters: " . json_encode([
                'unified_search' => $searchTerm,
                'type' => $type,
                'limit' => $limit
            ]));
            
            $results = [];
            
            // Search products if type is not specified or type is 'product'
            if (!$type || $type === 'product') {
                $productResults = $this->getUnifiedProductResults($searchTerm, $limit);
                $results = array_merge($results, $productResults);
            }
            
            // Search categories if type is not specified or type is 'category'
            if (!$type || $type === 'category') {
                $categoryResults = $this->getUnifiedCategoryResults($searchTerm, $limit);
                $results = array_merge($results, $categoryResults);
            }
            
            // Search subcategories if type is not specified or type is 'subcategory'
            if (!$type || $type === 'subcategory') {
                $subcategoryResults = $this->getUnifiedSubcategoryResults($searchTerm, $limit);
                $results = array_merge($results, $subcategoryResults);
            }
            
            // If a specific search term is provided (like "a"), return all types of results
            if (strlen($searchTerm) <= 2 && !$type && empty($results)) {
                // Get some sample data from each type for quick results
                $sampleResults = [];
                
                // Sample products
                $productSampleResults = $this->getSampleUnifiedProductResults(3);
                $sampleResults = array_merge($sampleResults, $productSampleResults);
                
                // Sample categories
                $categorySampleResults = $this->getSampleUnifiedCategoryResults(3);
                $sampleResults = array_merge($sampleResults, $categorySampleResults);
                
                // Sample subcategories
                $subcategorySampleResults = $this->getSampleUnifiedSubcategoryResults(3);
                $sampleResults = array_merge($sampleResults, $subcategorySampleResults);
                
                // If we have actual search results, use those, otherwise use the samples
                $results = !empty($results) ? $results : $sampleResults;
            }
            
            return $results;
        } catch (Exception $e) {
            error_log("Error in unifiedSearch: " . $e->getMessage());
            error_log("Stack trace: " . $e->getTraceAsString());
            throw $e;
        }
    }

    /**
     * Get unified product results
     * 
     * @param string $searchTerm Search term
     * @param int $limit Limit
     * @return array Product results in unified format
     */
    private function getUnifiedProductResults(string $searchTerm, int $limit): array
    {
        try {
            // Prepare the search term for LIKE query
            $searchPattern = '%' . $searchTerm . '%';
            $exactPattern = $searchTerm;
            
            // Get similar product names for fuzzy search
            $similarProductNames = $this->getSimilarProductNames($searchTerm);
            $fuzzySearchCondition = '';
            $fuzzyParams = [];
            
            if (!empty($similarProductNames)) {
                $placeholders = implode(',', array_fill(0, count($similarProductNames), '?'));
                $fuzzySearchCondition = " OR p.name IN ($placeholders)";
                $fuzzyParams = $similarProductNames;
            }
            
            // Query to get products matching the search term with relevance ranking
            $sql = "
                SELECT 
                    'product' as type,
                    p.id,
                    p.name,
                    pi.image_path as image,
                    p.slug,
                    CASE
                        WHEN p.name = ? THEN 100  -- Exact match with product name (highest priority)
                        WHEN p.name LIKE ? THEN 90  -- Starts with search term
                        WHEN t.name = ? THEN 80  -- Exact match with tag name
                        WHEN p.name LIKE ? THEN 70  -- Contains search term in product name
                        WHEN t.name LIKE ? THEN 60  -- Contains search term in tag name
                        WHEN p.description LIKE ? THEN 50  -- Contains search term in description
                        ELSE 10  -- Other matches
                    END as relevance_score
                FROM 
                    products p
                JOIN 
                    product_variants pv ON p.id = pv.product_id
                JOIN 
                    subcategories s ON p.subcategory_id = s.id
                JOIN 
                    categories c ON s.category_id = c.id
                LEFT JOIN
                    product_tags pt ON p.id = pt.product_id
                LEFT JOIN
                    tags t ON pt.tag_id = t.id
                LEFT JOIN
                    product_images pi ON p.id = pi.product_id AND pi.is_primary = 1
                WHERE 
                    p.status = 'active' 
                    AND pv.status = 'active'
                    AND s.status = 'active'
                    AND c.status = 'active'
                    AND (
                        p.name LIKE ? 
                        OR p.description LIKE ? 
                        OR t.name LIKE ?
                        $fuzzySearchCondition
                    )
                GROUP BY 
                    p.id
                ORDER BY 
                    relevance_score DESC,
                    p.name ASC
                LIMIT ?
            ";
            
            $stmt = $this->db->prepare($sql);
            
            // Bind parameters for relevance scoring
            $stmt->bindValue(1, $exactPattern, PDO::PARAM_STR); // Exact match with product name
            $stmt->bindValue(2, $searchTerm . '%', PDO::PARAM_STR); // Starts with search term
            $stmt->bindValue(3, $exactPattern, PDO::PARAM_STR); // Exact match with tag name
            $stmt->bindValue(4, $searchPattern, PDO::PARAM_STR); // Contains search term in product name
            $stmt->bindValue(5, $searchPattern, PDO::PARAM_STR); // Contains search term in tag name
            $stmt->bindValue(6, $searchPattern, PDO::PARAM_STR); // Contains search term in description
            
            // Bind parameters for WHERE clause
            $stmt->bindValue(7, $searchPattern, PDO::PARAM_STR);
            $stmt->bindValue(8, $searchPattern, PDO::PARAM_STR);
            $stmt->bindValue(9, $searchPattern, PDO::PARAM_STR);
            
            // Bind fuzzy search parameters
            $paramIndex = 10;
            foreach ($fuzzyParams as $param) {
                $stmt->bindValue($paramIndex++, $param, PDO::PARAM_STR);
            }
            
            // Bind limit
            $stmt->bindValue($paramIndex++, $limit, PDO::PARAM_INT);
            
            $stmt->execute();
            
            $results = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            // Remove relevance_score from results
            foreach ($results as &$result) {
                unset($result['relevance_score']);
            }
            
            // If no results found with regular search, try phonetic search
            if (empty($results)) {
                $results = $this->getUnifiedProductResultsByPhoneticSearch($searchTerm, $limit);
            }
            
            return $results;
        } catch (Exception $e) {
            error_log("Error in getUnifiedProductResults: " . $e->getMessage());
            error_log("Stack trace: " . $e->getTraceAsString());
            return [];
        }
    }

    /**
     * Get unified product results by phonetic search
     * 
     * @param string $searchTerm Search term
     * @param int $limit Limit
     * @return array Product results in unified format
     */
    private function getUnifiedProductResultsByPhoneticSearch(string $searchTerm, int $limit): array
    {
        try {
            // Get the soundex code for the search term
            $soundexCode = soundex($searchTerm);
            
            // Query to get products matching the phonetic pattern
            $sql = "
                SELECT 
                    'product' as type,
                    p.id,
                    p.name,
                    pi.image_path as image,
                    p.slug
                FROM 
                    products p
                JOIN 
                    product_variants pv ON p.id = pv.product_id
                JOIN 
                    subcategories s ON p.subcategory_id = s.id
                JOIN 
                    categories c ON s.category_id = c.id
                LEFT JOIN
                    product_images pi ON p.id = pi.product_id AND pi.is_primary = 1
                WHERE 
                    p.status = 'active' 
                    AND pv.status = 'active'
                    AND s.status = 'active'
                    AND c.status = 'active'
                    AND SOUNDEX(p.name) = ?
                GROUP BY 
                    p.id
                ORDER BY 
                    p.name ASC
                LIMIT ?
            ";
            
            $stmt = $this->db->prepare($sql);
            $stmt->bindValue(1, $soundexCode, PDO::PARAM_STR);
            $stmt->bindValue(2, $limit, PDO::PARAM_INT);
            $stmt->execute();
            
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (Exception $e) {
            error_log("Error in getUnifiedProductResultsByPhoneticSearch: " . $e->getMessage());
            error_log("Stack trace: " . $e->getTraceAsString());
            return [];
        }
    }

    /**
     * Get unified category results
     * 
     * @param string $searchTerm Search term
     * @param int $limit Limit
     * @return array Category results in unified format
     */
    private function getUnifiedCategoryResults(string $searchTerm, int $limit): array
    {
        try {
            // Prepare the search term for LIKE query
            $searchPattern = '%' . $searchTerm . '%';
            $exactPattern = $searchTerm;
            
            $sql = "
                SELECT 
                    'category' as type,
                    c.id,
                    c.name,
                    c.image,
                    c.slug,
                    CASE
                        WHEN c.name = ? THEN 100  -- Exact match with category name (highest priority)
                        WHEN c.name LIKE ? THEN 90  -- Starts with search term
                        WHEN c.name LIKE ? THEN 70  -- Contains search term in category name
                        WHEN c.description LIKE ? THEN 50  -- Contains search term in description
                        ELSE 10  -- Other matches
                    END as relevance_score
                FROM 
                    categories c
                WHERE 
                    c.status = 'active'
                    AND (
                        c.name LIKE ? 
                        OR c.description LIKE ?
                        OR SOUNDEX(c.name) = SOUNDEX(?)
                    )
                ORDER BY 
                    relevance_score DESC,
                    c.name ASC
                LIMIT ?
            ";
            
            $stmt = $this->db->prepare($sql);
            
            // Bind parameters for relevance scoring
            $stmt->bindValue(1, $exactPattern, PDO::PARAM_STR); // Exact match with category name
            $stmt->bindValue(2, $searchTerm . '%', PDO::PARAM_STR); // Starts with search term
            $stmt->bindValue(3, $searchPattern, PDO::PARAM_STR); // Contains search term in category name
            $stmt->bindValue(4, $searchPattern, PDO::PARAM_STR); // Contains search term in description
            
            // Bind parameters for WHERE clause
            $stmt->bindValue(5, $searchPattern, PDO::PARAM_STR);
            $stmt->bindValue(6, $searchPattern, PDO::PARAM_STR);
            $stmt->bindValue(7, $searchTerm, PDO::PARAM_STR); // For phonetic search
            
            // Bind limit
            $stmt->bindValue(8, $limit, PDO::PARAM_INT);
            
            $stmt->execute();
            
            $results = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            // Remove relevance_score from results
            foreach ($results as &$result) {
                unset($result['relevance_score']);
            }
            
            return $results;
        } catch (Exception $e) {
            error_log("Error in getUnifiedCategoryResults: " . $e->getMessage());
            error_log("Stack trace: " . $e->getTraceAsString());
            return [];
        }
    }

    /**
     * Get unified subcategory results
     * 
     * @param string $searchTerm Search term
     * @param int $limit Limit
     * @return array Subcategory results in unified format
     */
    private function getUnifiedSubcategoryResults(string $searchTerm, int $limit): array
    {
        try {
            // Prepare the search term for LIKE query
            $searchPattern = '%' . $searchTerm . '%';
            $exactPattern = $searchTerm;
            
            $sql = "
                SELECT 
                    'subcategory' as type,
                    s.id,
                    s.name,
                    s.image,
                    s.slug,
                    CASE
                        WHEN s.name = ? THEN 100  -- Exact match with subcategory name (highest priority)
                        WHEN s.name LIKE ? THEN 90  -- Starts with search term
                        WHEN s.name LIKE ? THEN 70  -- Contains search term in subcategory name
                        WHEN s.description LIKE ? THEN 50  -- Contains search term in description
                        ELSE 10  -- Other matches
                    END as relevance_score
                FROM 
                    subcategories s
                JOIN 
                    categories c ON s.category_id = c.id
                WHERE 
                    s.status = 'active'
                    AND c.status = 'active'
                    AND (
                        s.name LIKE ? 
                        OR s.description LIKE ?
                        OR SOUNDEX(s.name) = SOUNDEX(?)
                    )
                ORDER BY 
                    relevance_score DESC,
                    s.name ASC
                LIMIT ?
            ";
            
            $stmt = $this->db->prepare($sql);
            
            // Bind parameters for relevance scoring
            $stmt->bindValue(1, $exactPattern, PDO::PARAM_STR); // Exact match with subcategory name
            $stmt->bindValue(2, $searchTerm . '%', PDO::PARAM_STR); // Starts with search term
            $stmt->bindValue(3, $searchPattern, PDO::PARAM_STR); // Contains search term in subcategory name
            $stmt->bindValue(4, $searchPattern, PDO::PARAM_STR); // Contains search term in description
            
            // Bind parameters for WHERE clause
            $stmt->bindValue(5, $searchPattern, PDO::PARAM_STR);
            $stmt->bindValue(6, $searchPattern, PDO::PARAM_STR);
            $stmt->bindValue(7, $searchTerm, PDO::PARAM_STR); // For phonetic search
            
            // Bind limit
            $stmt->bindValue(8, $limit, PDO::PARAM_INT);
            
            $stmt->execute();
            
            $results = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            // Remove relevance_score from results
            foreach ($results as &$result) {
                unset($result['relevance_score']);
            }
            
            return $results;
        } catch (Exception $e) {
            error_log("Error in getUnifiedSubcategoryResults: " . $e->getMessage());
            error_log("Stack trace: " . $e->getTraceAsString());
            return [];
        }
    }

    /**
     * Get sample unified product results
     * 
     * @param int $limit Limit
     * @return array Sample product results in unified format
     */
    private function getSampleUnifiedProductResults(int $limit): array
    {
        try {
            $sql = "
                SELECT 
                    'product' as type,
                    p.id,
                    p.name,
                    pi.image_path as image,
                    p.slug
                FROM 
                    products p
                JOIN 
                    product_variants pv ON p.id = pv.product_id
                LEFT JOIN
                    product_images pi ON p.id = pi.product_id AND pi.is_primary = 1
                WHERE 
                    p.status = 'active' 
                    AND pv.status = 'active'
                GROUP BY
                    p.id
                ORDER BY 
                    p.name ASC
                LIMIT ?
            ";
            
            $stmt = $this->db->prepare($sql);
            $stmt->bindValue(1, $limit, PDO::PARAM_INT);
            $stmt->execute();
            
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (Exception $e) {
            error_log("Error in getSampleUnifiedProductResults: " . $e->getMessage());
            error_log("Stack trace: " . $e->getTraceAsString());
            return [];
        }
    }

    /**
     * Get sample unified category results
     * 
     * @param int $limit Limit
     * @return array Sample category results in unified format
     */
    private function getSampleUnifiedCategoryResults(int $limit): array
    {
        try {
            $sql = "
                SELECT 
                    'category' as type,
                    c.id,
                    c.name,
                    c.image,
                    c.slug
                FROM 
                    categories c
                WHERE 
                    c.status = 'active'
                ORDER BY 
                    c.name ASC
                LIMIT ?
            ";
            
            $stmt = $this->db->prepare($sql);
            $stmt->bindValue(1, $limit, PDO::PARAM_INT);
            $stmt->execute();
            
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (Exception $e) {
            error_log("Error in getSampleUnifiedCategoryResults: " . $e->getMessage());
            error_log("Stack trace: " . $e->getTraceAsString());
            return [];
        }
    }

    /**
     * Get sample unified subcategory results
     * 
     * @param int $limit Limit
     * @return array Sample subcategory results in unified format
     */
    private function getSampleUnifiedSubcategoryResults(int $limit): array
    {
        try {
            $sql = "
                SELECT 
                    'subcategory' as type,
                    s.id,
                    s.name,
                    s.image,
                    s.slug
                FROM 
                    subcategories s
                WHERE 
                    s.status = 'active'
                ORDER BY 
                    s.name ASC
                LIMIT ?
            ";
            
            $stmt = $this->db->prepare($sql);
            $stmt->bindValue(1, $limit, PDO::PARAM_INT);
            $stmt->execute();
            
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (Exception $e) {
            error_log("Error in getSampleUnifiedSubcategoryResults: " . $e->getMessage());
            error_log("Stack trace: " . $e->getTraceAsString());
            return [];
        }
    }
}
