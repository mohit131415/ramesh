<?php

namespace App\Features\Open\Filters\DataAccess;

use App\Core\Database;
use App\Shared\DataFetchers\ProductDataFetcher;
use Exception;
use PDO;

class ComprehensiveFilterRepository
{
    private $db;
    private $productDataFetcher;
    
    public function __construct()
    {
        $this->db = Database::getInstance()->getConnection();
        $this->productDataFetcher = new ProductDataFetcher();
    }
    
    /**
     * Get database connection
     * 
     * @return PDO Database connection
     */
    public function getDb(): PDO
    {
        return $this->db;
    }
    
    /**
     * Get filtered product IDs based on various criteria
     * 
     * @param int|null $categoryId Category ID
     * @param array $subcategoryIds Array of subcategory IDs
     * @param float|null $minPrice Minimum price
     * @param float|null $maxPrice Maximum price
     * @param int|null $isVegetarian Vegetarian filter (1 or 0)
     * @return array Product IDs and total count
     */
    public function getFilteredProductIds(
        ?int $categoryId,
        array $subcategoryIds,
        ?float $minPrice,
        ?float $maxPrice,
        ?int $isVegetarian
    ): array {
        try {
            // Debug log the input parameters
            error_log("getFilteredProductIds - Input parameters:");
            error_log("categoryId: " . ($categoryId ?? 'null'));
            error_log("subcategoryIds: " . json_encode($subcategoryIds));
            error_log("minPrice: " . ($minPrice ?? 'null'));
            error_log("maxPrice: " . ($maxPrice ?? 'null'));
            error_log("isVegetarian: " . ($isVegetarian ?? 'null'));
            
            // If category is selected but no subcategories, get all subcategories for that category
            if ($categoryId !== null && empty($subcategoryIds)) {
                $subcategoryIds = $this->getSubcategoryIdsByCategory($categoryId);
                error_log("Subcategory IDs for category $categoryId: " . json_encode($subcategoryIds));
            }
            
            // First, get the lowest price for each product
            $lowestPriceSubquery = "
                SELECT 
                    p.id as product_id,
                    MIN(CASE WHEN pv.sale_price > 0 THEN pv.sale_price ELSE pv.price END) as lowest_price
                FROM products p
                JOIN product_variants pv ON p.id = pv.product_id
                JOIN subcategories s ON p.subcategory_id = s.id
                JOIN categories c ON s.category_id = c.id
                WHERE p.status = 'active' AND pv.status = 'active'
                AND s.status = 'active' AND c.status = 'active'
                GROUP BY p.id
            ";
            
            // Start building the main query
            $baseQuery = "
                FROM products p 
                JOIN subcategories s ON p.subcategory_id = s.id
                JOIN categories c ON s.category_id = c.id
                JOIN ($lowestPriceSubquery) as lp ON p.id = lp.product_id
                WHERE p.status = 'active'
                AND s.status = 'active' AND c.status = 'active'
            ";
            
            $whereConditions = [];
            $params = [];
            
            // Add category filter
            if ($categoryId !== null) {
                $whereConditions[] = "c.id = ?";
                $params[] = $categoryId;
            }
            
            // Add subcategory filter
            if (!empty($subcategoryIds)) {
                $placeholders = implode(',', array_fill(0, count($subcategoryIds), '?'));
                $whereConditions[] = "p.subcategory_id IN ($placeholders)";
                foreach ($subcategoryIds as $id) {
                    $params[] = $id;
                }
            }
            
            // Add vegetarian filter
            if ($isVegetarian !== null) {
                $whereConditions[] = "p.is_vegetarian = ?";
                $params[] = $isVegetarian;
            }
            
            // Add price filters based on the lowest price of each product
            if ($minPrice !== null) {
                $whereConditions[] = "lp.lowest_price >= ?";
                $params[] = $minPrice;
            }
            
            if ($maxPrice !== null) {
                $whereConditions[] = "lp.lowest_price <= ?";
                $params[] = $maxPrice;
            }
            
            // Add WHERE conditions to the base query
            if (!empty($whereConditions)) {
                $baseQuery .= " AND " . implode(" AND ", $whereConditions);
            }
            
            // Count total products that match the criteria
            $countSql = "SELECT COUNT(DISTINCT p.id) " . $baseQuery;
            
            // Debug log
            error_log("Count SQL Query: " . $countSql);
            error_log("SQL Params: " . json_encode($params));
            
            // Execute the count query
            $stmt = $this->db->prepare($countSql);
            $i = 1;
            foreach ($params as $param) {
                $paramType = is_int($param) ? PDO::PARAM_INT : PDO::PARAM_STR;
                $stmt->bindValue($i++, $param, $paramType);
            }
            $stmt->execute();
            $totalCount = (int)$stmt->fetchColumn();
            
            // Get the product IDs
            $sql = "SELECT DISTINCT p.id " . $baseQuery;
            
            // Debug log
            error_log("Product IDs SQL Query: " . $sql);
            
            // Execute the query to get product IDs
            $stmt = $this->db->prepare($sql);
            $i = 1;
            foreach ($params as $param) {
                $paramType = is_int($param) ? PDO::PARAM_INT : PDO::PARAM_STR;
                $stmt->bindValue($i++, $param, $paramType);
            }
            $stmt->execute();
            $productIds = $stmt->fetchAll(PDO::FETCH_COLUMN, 0);
            
            // Debug log
            error_log("Found " . count($productIds) . " product IDs: " . json_encode($productIds));
            error_log("Total count: " . $totalCount);
            
            return [
                'product_ids' => $productIds,
                'total_count' => $totalCount
            ];
        } catch (Exception $e) {
            error_log("Error in getFilteredProductIds: " . $e->getMessage());
            error_log("Stack trace: " . $e->getTraceAsString());
            throw $e;
        }
    }
    
    /**
     * Get subcategory IDs by category
     * 
     * @param int $categoryId Category ID
     * @return array Array of subcategory IDs
     */
    private function getSubcategoryIdsByCategory(int $categoryId): array
    {
        try {
            $sql = "
                SELECT s.id
                FROM subcategories s
                JOIN products p ON s.id = p.subcategory_id
                JOIN product_variants pv ON p.id = pv.product_id
                WHERE s.category_id = ? 
                AND s.status = 'active' 
                AND p.status = 'active'
                AND pv.status = 'active'
                GROUP BY s.id
            ";
            
            $stmt = $this->db->prepare($sql);
            $stmt->bindValue(1, $categoryId, PDO::PARAM_INT);
            $stmt->execute();
            
            return $stmt->fetchAll(PDO::FETCH_COLUMN, 0);
        } catch (Exception $e) {
            error_log("Error in getSubcategoryIdsByCategory: " . $e->getMessage());
            error_log("Stack trace: " . $e->getTraceAsString());
            return [];
        }
    }
    
    /**
     * Get price range based on filters
     * 
     * @param int|null $categoryId Category ID
     * @param array $subcategoryIds Array of subcategory IDs
     * @return array Price range with min_price and max_price
     */
    public function getPriceRange(?int $categoryId, array $subcategoryIds): array
    {
        try {
            // If category is selected but no subcategories, get all subcategories for that category
            if ($categoryId !== null && empty($subcategoryIds)) {
                $subcategoryIds = $this->getSubcategoryIdsByCategory($categoryId);
            }
            
            // First, create a subquery to get the lowest price variant for each product
            $subquery = "
                SELECT 
                    p.id as product_id,
                    MIN(CASE WHEN pv.sale_price > 0 THEN pv.sale_price ELSE pv.price END) as lowest_price
                FROM products p
                JOIN product_variants pv ON p.id = pv.product_id
                JOIN subcategories s ON p.subcategory_id = s.id
                JOIN categories c ON s.category_id = c.id
                WHERE p.status = 'active' AND pv.status = 'active'
                AND s.status = 'active' AND c.status = 'active'
            ";
            
            $whereConditions = [];
            $params = [];
            
            // Add category filter
            if ($categoryId !== null) {
                $whereConditions[] = "c.id = ?";
                $params[] = $categoryId;
            }
            
            // Add subcategory filter
            if (!empty($subcategoryIds)) {
                $placeholders = implode(',', array_fill(0, count($subcategoryIds), '?'));
                $whereConditions[] = "p.subcategory_id IN ($placeholders)";
                foreach ($subcategoryIds as $id) {
                    $params[] = $id;
                }
            }
            
            // Add WHERE conditions to subquery
            if (!empty($whereConditions)) {
                $subquery .= " AND " . implode(" AND ", $whereConditions);
            }
            
            // Group by product to get lowest price per product
            $subquery .= " GROUP BY p.id";
            
            // Now get the min and max of these lowest prices
            $sql = "
                SELECT 
                    MIN(lowest_price) as min_price,
                    MAX(lowest_price) as max_price
                FROM ($subquery) as product_lowest_prices
            ";
            
            // Debug log
            error_log("Price Range SQL Query: " . $sql);
            error_log("Price Range SQL Params: " . json_encode($params));
            
            // Execute the query using positional parameters
            $stmt = $this->db->prepare($sql);
            $i = 1;
            foreach ($params as $param) {
                $paramType = is_int($param) ? PDO::PARAM_INT : PDO::PARAM_STR;
                $stmt->bindValue($i++, $param, $paramType);
            }
            $stmt->execute();
            
            $result = $stmt->fetch(PDO::FETCH_ASSOC);
            
            return [
                'min_price' => (float)($result['min_price'] ?? 0),
                'max_price' => (float)($result['max_price'] ?? 0)
            ];
        } catch (Exception $e) {
            error_log("Error in getPriceRange: " . $e->getMessage());
            error_log("Stack trace: " . $e->getTraceAsString());
            return [
                'min_price' => 0,
                'max_price' => 0
            ];
        }
    }
    
    /**
     * Get subcategories by category with product counts
     * Only returns subcategories that have at least one active product
     * 
     * @param int $categoryId Category ID
     * @return array Subcategories with product counts
     */
    public function getSubcategoriesByCategory(int $categoryId): array
    {
        try {
            $sql = "
                SELECT s.id, s.name, s.slug, s.description, s.image, s.status, s.display_order,
                       COUNT(DISTINCT p.id) as product_count
                FROM subcategories s
                JOIN products p ON s.id = p.subcategory_id
                JOIN product_variants pv ON p.id = pv.product_id
                WHERE s.category_id = ? 
                AND s.status = 'active' 
                AND p.status = 'active'
                AND pv.status = 'active'
                GROUP BY s.id
                HAVING COUNT(DISTINCT p.id) > 0
                ORDER BY s.display_order ASC, s.name ASC
            ";
            
            $stmt = $this->db->prepare($sql);
            $stmt->bindValue(1, $categoryId, PDO::PARAM_INT);
            $stmt->execute();
            
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (Exception $e) {
            error_log("Error in getSubcategoriesByCategory: " . $e->getMessage());
            error_log("Stack trace: " . $e->getTraceAsString());
            return [];
        }
    }
    
    /**
     * Get all subcategories with product counts
     * Only returns subcategories that have at least one active product
     * 
     * @return array All subcategories with product counts
     */
    public function getAllSubcategories(): array
    {
        try {
            $sql = "
                SELECT s.id, s.name, s.slug, s.description, s.image, s.status, s.display_order,
                       s.category_id, c.name as category_name, c.slug as category_slug,
                       COUNT(DISTINCT p.id) as product_count
                FROM subcategories s
                JOIN categories c ON s.category_id = c.id
                JOIN products p ON s.id = p.subcategory_id
                JOIN product_variants pv ON p.id = pv.product_id
                WHERE s.status = 'active' 
                AND c.status = 'active'
                AND p.status = 'active'
                AND pv.status = 'active'
                GROUP BY s.id
                HAVING COUNT(DISTINCT p.id) > 0
                ORDER BY s.display_order ASC, s.name ASC
            ";
            
            $stmt = $this->db->prepare($sql);
            $stmt->execute();
            
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (Exception $e) {
            error_log("Error in getAllSubcategories: " . $e->getMessage());
            error_log("Stack trace: " . $e->getTraceAsString());
            return [];
        }
    }
    
    /**
     * Get all categories with product counts
     * Only returns categories that have at least one subcategory with at least one active product
     * 
     * @return array All categories with product counts
     */
    public function getAllCategoriesWithProductCount(): array
    {
        try {
            $sql = "
                SELECT c.id, c.name, c.slug, c.description, c.image, c.status, c.display_order,
                       COUNT(DISTINCT p.id) as product_count
                FROM categories c
                JOIN subcategories s ON c.id = s.category_id
                JOIN products p ON s.id = p.subcategory_id
                JOIN product_variants pv ON p.id = pv.product_id
                WHERE c.status = 'active'
                AND s.status = 'active'
                AND p.status = 'active'
                AND pv.status = 'active'
                GROUP BY c.id
                HAVING COUNT(DISTINCT p.id) > 0
                ORDER BY c.display_order ASC, c.name ASC
            ";
            
            $stmt = $this->db->prepare($sql);
            $stmt->execute();
            
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (Exception $e) {
            error_log("Error in getAllCategoriesWithProductCount: " . $e->getMessage());
            error_log("Stack trace: " . $e->getTraceAsString());
            return [];
        }
    }

    /**
     * Enhanced product search with improved fuzzy matching for cases like "snesh" matching "sandesh"
     * 
     * @param string $searchTerm Search term
     * @param int $limit Limit
     * @param int $offset Offset
     * @return array Product IDs and total count
     */
    public function getProductIdsBySearchTerm(string $searchTerm, int $limit, int $offset): array
    {
        try {
            // Log the search term
            error_log("Searching for products with term: " . $searchTerm);
            
            // Clean and normalize the search term
            $searchTerm = $this->normalizeSearchTerm($searchTerm);
            if (empty($searchTerm)) {
                return ['product_ids' => [], 'total_count' => 0];
            }
            
            // Try the simplified search first for better performance
            $simplifiedResults = $this->getProductIdsBySimplifiedSearch($searchTerm, $limit, $offset);
            
            // If we found results with the simplified search, return them
            if (!empty($simplifiedResults['product_ids'])) {
                error_log("Found results with simplified search: " . count($simplifiedResults['product_ids']));
                return $simplifiedResults;
            }
            
            // If no results with simplified search, try the advanced search
            error_log("No results with simplified search, trying advanced search");
            
            // Get all product names for fuzzy matching
            $allProductNames = $this->getAllProductNames();
            
            // Find similar product names using improved fuzzy matching
            $similarProductNames = $this->findSimilarProductNames($searchTerm, $allProductNames);
            
            if (empty($similarProductNames)) {
                error_log("No similar product names found");
                return ['product_ids' => [], 'total_count' => 0];
            }
            
            error_log("Found similar product names: " . json_encode($similarProductNames));
            
            // Get product IDs for the similar product names
            $productIds = $this->getProductIdsByNames($similarProductNames, $limit, $offset);
            $totalCount = count($productIds);
            
            error_log("Found " . count($productIds) . " products with fuzzy matching");
            
            return [
                'product_ids' => $productIds,
                'total_count' => $totalCount
            ];
        } catch (Exception $e) {
            error_log("Error in getProductIdsBySearchTerm: " . $e->getMessage());
            error_log("Stack trace: " . $e->getTraceAsString());
            
            // Fallback to basic search if advanced search fails
            return $this->getProductIdsByBasicSearch($searchTerm, $limit, $offset);
        }
    }
    
    /**
     * Get product IDs by simplified search (faster but less comprehensive)
     * 
     * @param string $searchTerm Search term
     * @param int $limit Limit
     * @param int $offset Offset
     * @return array Product IDs and total count
     */
    private function getProductIdsBySimplifiedSearch(string $searchTerm, int $limit, int $offset): array
    {
        try {
            // Prepare search patterns
            $exactPattern = $searchTerm;
            $likePattern = '%' . $searchTerm . '%';
            $startPattern = $searchTerm . '%';
            $endPattern = '%' . $searchTerm;
            
            // Get phonetic codes
            $soundexCode = soundex($searchTerm);
            
            // Query to get products matching the search term
            $sql = "
                SELECT 
                    p.id,
                    CASE
                        WHEN LOWER(p.name) = LOWER(?) THEN 100  -- Exact match
                        WHEN LOWER(p.name) LIKE LOWER(?) THEN 90  -- Starts with
                        WHEN LOWER(p.name) LIKE LOWER(?) THEN 80  -- Ends with
                        WHEN LOWER(p.name) LIKE LOWER(?) THEN 70  -- Contains
                        WHEN SOUNDEX(p.name) = ? THEN 60  -- Phonetic match
                        ELSE 50
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
                        LOWER(p.name) = LOWER(?) OR
                        LOWER(p.name) LIKE LOWER(?) OR
                        LOWER(p.name) LIKE LOWER(?) OR
                        LOWER(p.name) LIKE LOWER(?) OR
                        LOWER(p.description) LIKE LOWER(?) OR
                        LOWER(t.name) LIKE LOWER(?) OR
                        SOUNDEX(p.name) = ?
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
            $stmt->bindValue(1, $exactPattern, PDO::PARAM_STR);
            $stmt->bindValue(2, $startPattern, PDO::PARAM_STR);
            $stmt->bindValue(3, $endPattern, PDO::PARAM_STR);
            $stmt->bindValue(4, $likePattern, PDO::PARAM_STR);
            $stmt->bindValue(5, $soundexCode, PDO::PARAM_STR);
            
            // Bind parameters for WHERE clause
            $stmt->bindValue(6, $exactPattern, PDO::PARAM_STR);
            $stmt->bindValue(7, $startPattern, PDO::PARAM_STR);
            $stmt->bindValue(8, $endPattern, PDO::PARAM_STR);
            $stmt->bindValue(9, $likePattern, PDO::PARAM_STR);
            $stmt->bindValue(10, $likePattern, PDO::PARAM_STR);
            $stmt->bindValue(11, $likePattern, PDO::PARAM_STR);
            $stmt->bindValue(12, $soundexCode, PDO::PARAM_STR);
            
            // Bind limit and offset
            $stmt->bindValue(13, $limit, PDO::PARAM_INT);
            $stmt->bindValue(14, $offset, PDO::PARAM_INT);
            
            $stmt->execute();
            
            $results = $stmt->fetchAll(PDO::FETCH_ASSOC);
            $totalCount = !empty($results) ? (int)$results[0]['total_count'] : 0;
            
            // Extract product IDs
            $productIds = array_column($results, 'id');
            
            return [
                'product_ids' => $productIds,
                'total_count' => $totalCount
            ];
        } catch (Exception $e) {
            error_log("Error in getProductIdsBySimplifiedSearch: " . $e->getMessage());
            error_log("Stack trace: " . $e->getTraceAsString());
            return [
                'product_ids' => [],
                'total_count' => 0
            ];
        }
    }
    
    /**
     * Get all product names for fuzzy matching
     * 
     * @return array All product names
     */
    private function getAllProductNames(): array
    {
        try {
            $sql = "
                SELECT id, name
                FROM products
                WHERE status = 'active'
            ";
            
            $stmt = $this->db->prepare($sql);
            $stmt->execute();
            
            return $stmt->fetchAll(PDO::FETCH_KEY_PAIR);
        } catch (Exception $e) {
            error_log("Error in getAllProductNames: " . $e->getMessage());
            error_log("Stack trace: " . $e->getTraceAsString());
            return [];
        }
    }
    
    /**
     * Find similar product names using improved fuzzy matching
     * 
     * @param string $searchTerm Search term
     * @param array $productNames Product names
     * @return array Similar product names
     */
    private function findSimilarProductNames(string $searchTerm, array $productNames): array
    {
        $similarProductIds = [];
        $searchTermLength = strlen($searchTerm);
        
        // Adjust Levenshtein threshold based on search term length
        $maxDistance = min(3, max(1, floor($searchTermLength / 3)));
        
        // For very short search terms, be more lenient
        if ($searchTermLength <= 3) {
            $maxDistance = 1;
        }
        
        // Generate character n-grams for the search term
        $searchTermNgrams = $this->generateCharNgrams($searchTerm, 2);
        
        // Check each product name for similarity
        foreach ($productNames as $productId => $productName) {
            $productNameLower = strtolower($productName);
            
            // 1. Check if product name contains the search term (with some flexibility)
            if (strpos($productNameLower, $searchTerm) !== false) {
                $similarProductIds[$productId] = $productName;
                continue;
            }
            
            // 2. Check if search term is a substring of product name with some characters removed
            // This helps with cases like "snesh" matching "sandesh" (missing 'a' and 'd')
            if ($this->isSubsequence($searchTerm, $productNameLower)) {
                $similarProductIds[$productId] = $productName;
                continue;
            }
            
            // 3. Check for n-gram similarity (character level)
            $productNameNgrams = $this->generateCharNgrams($productNameLower, 2);
            $ngramSimilarity = $this->calculateJaccardSimilarity($searchTermNgrams, $productNameNgrams);
            
            if ($ngramSimilarity >= 0.3) {  // 30% similarity threshold
                $similarProductIds[$productId] = $productName;
                continue;
            }
            
            // 4. Check individual words in product name
            $productWords = explode(' ', $productNameLower);
            foreach ($productWords as $word) {
                // Skip very short words
                if (strlen($word) < 3) continue;
                
                // Check Levenshtein distance for each word
                $distance = levenshtein($searchTerm, $word);
                $threshold = min($maxDistance, floor(max(strlen($word), $searchTermLength) / 3));
                
                if ($distance <= $threshold) {
                    $similarProductIds[$productId] = $productName;
                    break;
                }
                
                // Check if search term is a subsequence of the word
                if ($this->isSubsequence($searchTerm, $word)) {
                    $similarProductIds[$productId] = $productName;
                    break;
                }
            }
        }
        
        return $similarProductIds;
    }
    
    /**
     * Check if string A is a subsequence of string B (characters in same order but not necessarily adjacent)
     * 
     * @param string $a String A
     * @param string $b String B
     * @return bool True if A is a subsequence of B
     */
    private function isSubsequence(string $a, string $b): bool
    {
        $a = strtolower($a);
        $b = strtolower($b);
        
        $aLen = strlen($a);
        $bLen = strlen($b);
        
        if ($aLen > $bLen) return false;
        
        $i = 0; // Index for string A
        $j = 0; // Index for string B
        
        while ($i < $aLen && $j < $bLen) {
            if ($a[$i] == $b[$j]) {
                $i++;
            }
            $j++;
        }
        
        // If we've gone through all characters in A, then A is a subsequence of B
        return $i == $aLen;
    }
    
    /**
     * Generate character n-grams from a string
     * 
     * @param string $str Input string
     * @param int $n N-gram size
     * @return array N-grams
     */
    private function generateCharNgrams(string $str, int $n): array
    {
        $ngrams = [];
        $len = strlen($str);
        
        if ($len < $n) {
            return [$str];
        }
        
        for ($i = 0; $i <= $len - $n; $i++) {
            $ngrams[] = substr($str, $i, $n);
        }
        
        return $ngrams;
    }
    
    /**
     * Calculate Jaccard similarity between two sets
     * 
     * @param array $set1 First set
     * @param array $set2 Second set
     * @return float Similarity (0-1)
     */
    private function calculateJaccardSimilarity(array $set1, array $set2): float
    {
        if (empty($set1) || empty($set2)) {
            return 0;
        }
        
        $intersection = array_intersect($set1, $set2);
        $union = array_unique(array_merge($set1, $set2));
        
        return count($intersection) / count($union);
    }
    
    /**
     * Get product IDs by product names
     * 
     * @param array $productNames Product names (id => name)
     * @param int $limit Limit
     * @param int $offset Offset
     * @return array Product IDs
     */
    private function getProductIdsByNames(array $productNames, int $limit, int $offset): array
    {
        if (empty($productNames)) {
            return [];
        }
        
        try {
            $productIds = array_keys($productNames);
            
            // Apply pagination
            $paginatedIds = array_slice($productIds, $offset, $limit);
            
            return $paginatedIds;
        } catch (Exception $e) {
            error_log("Error in getProductIdsByNames: " . $e->getMessage());
            error_log("Stack trace: " . $e->getTraceAsString());
            return [];
        }
    }
    
    /**
     * Basic search fallback if advanced search fails
     * 
     * @param string $searchTerm Search term
     * @param int $limit Limit
     * @param int $offset Offset
     * @return array Product IDs and total count
     */
    private function getProductIdsByBasicSearch(string $searchTerm, int $limit, int $offset): array
    {
        try {
            // Prepare the search term for LIKE query
            $searchPattern = '%' . $searchTerm . '%';
            
            // Query to get products matching the search term
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
                        OR SOUNDEX(p.name) = SOUNDEX(?)
                    )
                GROUP BY 
                    p.id
                ORDER BY 
                    CASE
                        WHEN p.name LIKE ? THEN 1  -- Starts with search term
                        WHEN p.name LIKE ? THEN 2  -- Contains search term
                        ELSE 3
                    END,
                    p.name ASC
                LIMIT ? OFFSET ?
            ";
            
            $stmt = $this->db->prepare($sql);
            $stmt->bindValue(1, $searchPattern, PDO::PARAM_STR);
            $stmt->bindValue(2, $searchPattern, PDO::PARAM_STR);
            $stmt->bindValue(3, $searchPattern, PDO::PARAM_STR);
            $stmt->bindValue(4, $searchTerm, PDO::PARAM_STR);
            $stmt->bindValue(5, $searchTerm . '%', PDO::PARAM_STR); // Starts with
            $stmt->bindValue(6, $searchPattern, PDO::PARAM_STR); // Contains
            $stmt->bindValue(7, $limit, PDO::PARAM_INT);
            $stmt->bindValue(8, $offset, PDO::PARAM_INT);
            $stmt->execute();
            
            $results = $stmt->fetchAll(PDO::FETCH_ASSOC);
            $totalCount = !empty($results) ? (int)$results[0]['total_count'] : 0;
            
            // Extract product IDs
            $productIds = array_column($results, 'id');
            
            return [
                'product_ids' => $productIds,
                'total_count' => $totalCount
            ];
        } catch (Exception $e) {
            error_log("Error in getProductIdsByBasicSearch: " . $e->getMessage());
            error_log("Stack trace: " . $e->getTraceAsString());
            return [
                'product_ids' => [],
                'total_count' => 0
            ];
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
     * Get sample product IDs for unified search
     * 
     * @param int $limit Limit
     * @return array Product IDs
     */
    public function getSampleProductIds(int $limit): array
    {
        try {
            $sql = "
                SELECT 
                    p.id
                FROM 
                    products p
                JOIN 
                    product_variants pv ON p.id = pv.product_id
                WHERE 
                    p.status = 'active' 
                    AND pv.status = 'active'
                ORDER BY 
                    p.name ASC
                LIMIT ?
            ";
            
            $stmt = $this->db->prepare($sql);
            $stmt->bindValue(1, $limit, PDO::PARAM_INT);
            $stmt->execute();
            
            return $stmt->fetchAll(PDO::FETCH_COLUMN);
        } catch (Exception $e) {
            error_log("Error in getSampleProductIds: " . $e->getMessage());
            error_log("Stack trace: " . $e->getTraceAsString());
            return [];
        }
    }

    // Add a new method to get product IDs by search term with filters

    /**
     * Get product IDs by search term with additional filters
     * 
     * @param string $searchTerm Search term
     * @param int|null $categoryId Category ID
     * @param array $subcategoryIds Array of subcategory IDs
     * @param float|null $minPrice Minimum price
     * @param float|null $maxPrice Maximum price
     * @param int|null $isVegetarian Vegetarian filter (1 or 0)
     * @param int $limit Limit
     * @param int $offset Offset
     * @return array Product IDs and total count
     */
    public function getProductIdsBySearchTermWithFilters(
        string $searchTerm,
        ?int $categoryId,
        array $subcategoryIds,
        ?float $minPrice,
        ?float $maxPrice,
        ?int $isVegetarian,
        int $limit,
        int $offset
    ): array {
        try {
            // Log the search and filter parameters
            error_log("Searching for products with term and filters: " . $searchTerm);
            error_log("Filters: " . json_encode([
                'categoryId' => $categoryId,
                'subcategoryIds' => $subcategoryIds,
                'minPrice' => $minPrice,
                'maxPrice' => $maxPrice,
                'isVegetarian' => $isVegetarian
            ]));
            
            // Prepare the search term for LIKE query
            $searchPattern = '%' . $searchTerm . '%';
            $exactPattern = $searchTerm;
            
            // First, create a subquery to get the lowest price variant for each product
            $lowestPriceSubquery = "
                SELECT 
                    p.id as product_id,
                    MIN(CASE WHEN pv.sale_price > 0 THEN pv.sale_price ELSE pv.price END) as lowest_price
                FROM products p
                JOIN product_variants pv ON p.id = pv.product_id
                WHERE p.status = 'active' AND pv.status = 'active'
                GROUP BY p.id
            ";
            
            // Build the main query with search and filter conditions
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
                JOIN 
                    ($lowestPriceSubquery) as lp ON p.id = lp.product_id
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
                        OR SOUNDEX(p.name) = SOUNDEX(?)
                    )
                ";
            
            $params = [
                // Relevance scoring parameters
                $exactPattern,           // 1: Exact match with product name
                $searchTerm . '%',       // 2: Starts with search term
                $exactPattern,           // 3: Exact match with tag name
                $searchPattern,          // 4: Contains search term in product name
                $searchPattern,          // 5: Contains search term in tag name
                $searchPattern,          // 6: Contains search term in description
                
                // Search condition parameters
                $searchPattern,          // 7: p.name LIKE
                $searchPattern,          // 8: p.description LIKE
                $searchPattern,          // 9: t.name LIKE
                $searchTerm              // 10: SOUNDEX
            ];
            
            // Add category filter
            if ($categoryId !== null) {
                $sql .= " AND c.id = ?";
                $params[] = $categoryId;
            }
            
            // Add subcategory filter
            if (!empty($subcategoryIds)) {
                $placeholders = implode(',', array_fill(0, count($subcategoryIds), '?'));
                $sql .= " AND p.subcategory_id IN ($placeholders)";
                foreach ($subcategoryIds as $id) {
                    $params[] = $id;
                }
            }
            
            // Add vegetarian filter
            if ($isVegetarian !== null) {
                $sql .= " AND p.is_vegetarian = ?";
                $params[] = $isVegetarian;
            }
            
            // Add price filters
            if ($minPrice !== null) {
                $sql .= " AND lp.lowest_price >= ?";
                $params[] = $minPrice;
            }
            
            if ($maxPrice !== null) {
                $sql .= " AND lp.lowest_price <= ?";
                $params[] = $maxPrice;
            }
            
            // Add group by, order by, and limit
            $sql .= "
                GROUP BY p.id
                ORDER BY relevance_score DESC, p.name ASC
                LIMIT ? OFFSET ?
            ";
            
            $params[] = $limit;
            $params[] = $offset;
            
            // Debug log
            error_log("SQL Query: " . $sql);
            
            $stmt = $this->db->prepare($sql);
            
            // Bind all parameters
            for ($i = 0; $i < count($params); $i++) {
                $paramType = is_int($params[$i]) ? PDO::PARAM_INT : PDO::PARAM_STR;
                $stmt->bindValue($i + 1, $params[$i], $paramType);
            }
            
            $stmt->execute();
            
            $results = $stmt->fetchAll(PDO::FETCH_ASSOC);
            $totalCount = !empty($results) ? (int)$results[0]['total_count'] : 0;
            
            // Extract product IDs
            $productIds = array_column($results, 'id');
            
            error_log("Found " . count($productIds) . " products with search and filters");
            
            return [
                'product_ids' => $productIds,
                'total_count' => $totalCount
            ];
        } catch (Exception $e) {
            error_log("Error in getProductIdsBySearchTermWithFilters: " . $e->getMessage());
            error_log("Stack trace: " . $e->getTraceAsString());
            return [
                'product_ids' => [],
                'total_count' => 0
            ];
        }
    }
}
