<?php

namespace App\Features\ProductCatalog\ComprehensiveProducts\DataAccess;

use App\Core\Database;
use App\Shared\Helpers\InputSanitizer;
use Exception;
use PDO;

class ComprehensiveProductRepository
{
    private $database;

    public function __construct()
    {
        $this->database = Database::getInstance();
    }
    
    /**
     * Get product ID by SKU
     *
     * @param string $sku SKU to search for
     * @return int|null Product ID or null if not found
     */
    public function getProductIdBySku($sku)
    {
        try {
            $sql = "SELECT pv.product_id 
                FROM product_variants pv 
                JOIN products p ON p.id = pv.product_id 
                WHERE pv.sku LIKE :sku 
                LIMIT 1";
        
            $params = [':sku' => '%' . $sku . '%'];
            
            $result = $this->database->fetch($sql, $params);
            
            return $result ? $result['product_id'] : null;
        } catch (Exception $e) {
            error_log("Error in getProductIdBySku: " . $e->getMessage());
            return null;
        }
    }

    /**
     * Get product IDs by partial SKU match
     *
     * @param string $sku SKU to search for
     * @param int $limit Maximum number of results to return
     * @return array Array of product IDs
     */
    public function getProductIdsByPartialSku($sku, $limit = 10)
    {
        try {
            $sql = "SELECT DISTINCT pv.product_id 
                FROM product_variants pv 
                JOIN products p ON p.id = pv.product_id 
                WHERE pv.sku LIKE :sku 
                ORDER BY pv.sku ASC
                LIMIT :limit";
        
            // Use PDO directly to bind the limit parameter as an integer
            $stmt = $this->database->getConnection()->prepare($sql);
            $stmt->bindValue(':sku', '%' . $sku . '%', PDO::PARAM_STR);
            $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
            $stmt->execute();
            
            $results = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            return array_column($results, 'product_id');
        } catch (Exception $e) {
            error_log("Error in getProductIdsByPartialSku: " . $e->getMessage());
            return [];
        }
    }

    /**
     * Get comprehensive products with all related data
     *
     * @param int $page Page number
     * @param int $limit Items per page
     * @param array $filters Optional filters
     * @param string $sortBy Field to sort by
     * @param string $sortOrder Sort order (asc/desc)
     * @param bool $includeDeleted Whether to include deleted products (for super admins)
     * @return array Products and pagination metadata
     */
    public function getComprehensiveProducts($page = 1, $limit = 10, $filters = [], $sortBy = 'created_at', $sortOrder = 'desc', $includeDeleted = false)
    {
        try {
            // Debug log
            error_log("getComprehensiveProducts called with filters: " . json_encode($filters) . " (product_type: " . ($filters['product_type'] ?? 'not set') . ")");
            
            $offset = ($page - 1) * $limit;
            $whereConditions = [];
            $params = [];

            // Only include non-deleted products unless specifically requested
            if (!$includeDeleted) {
                $whereConditions[] = "p.deleted_at IS NULL";
            }

            // Apply filters if provided
            if (!empty($filters['search'])) {
                $searchTerm = trim($filters['search']);
                $searchPattern = '%' . $searchTerm . '%';
                
                // Create fuzzy search patterns for better matching
                $fuzzyPatterns = $this->generateFuzzyPatterns($searchTerm);
                
                // Build search conditions with relevance scoring
                $searchConditions = [];
                
                // Exact name match (highest priority)
                $searchConditions[] = "p.name = " . $this->database->getConnection()->quote($searchTerm);
                
                // Name starts with search term (high priority)
                $searchConditions[] = "p.name LIKE " . $this->database->getConnection()->quote($searchTerm . '%');
                
                // Name contains search term (medium-high priority)
                $searchConditions[] = "p.name LIKE " . $this->database->getConnection()->quote($searchPattern);
                
                // Fuzzy name matches (medium priority)
                foreach ($fuzzyPatterns as $pattern) {
                    $searchConditions[] = "p.name LIKE " . $this->database->getConnection()->quote($pattern);
                }
                
                // Other field matches (lower priority)
                $searchConditions[] = "p.description LIKE " . $this->database->getConnection()->quote($searchPattern);
                $searchConditions[] = "p.slug LIKE " . $this->database->getConnection()->quote($searchPattern);
                $searchConditions[] = "p.hsn_code LIKE " . $this->database->getConnection()->quote($searchPattern);
                
                $whereConditions[] = "(" . implode(' OR ', $searchConditions) . ")";
            }

            if (!empty($filters['status'])) {
                if (is_array($filters['status'])) {
                    $statusValues = array_map(function($status) {
                        return $this->database->getConnection()->quote($status);
                    }, $filters['status']);
                    $whereConditions[] = "p.status IN (" . implode(',', $statusValues) . ")";
                } else {
                    $statusValue = $this->database->getConnection()->quote($filters['status']);
                    $whereConditions[] = "p.status = $statusValue";
                }
            }

            if (!empty($filters['category_id'])) {
                $categoryIdValue = $this->database->getConnection()->quote($filters['category_id']);
                $whereConditions[] = "p.category_id = $categoryIdValue";
            }

            if (!empty($filters['subcategory_id'])) {
                $subcategoryIdValue = $this->database->getConnection()->quote($filters['subcategory_id']);
                $whereConditions[] = "p.subcategory_id = $subcategoryIdValue";
            }

            if (isset($filters['is_vegetarian']) && $filters['is_vegetarian'] !== '') {
                $isVegetarianValue = $this->database->getConnection()->quote($filters['is_vegetarian']);
                $whereConditions[] = "p.is_vegetarian = $isVegetarianValue";
            }
            
            if (!empty($filters['product_type'])) {
                if (is_array($filters['product_type'])) {
                    $productTypeValues = array_map(function($type) {
                        return $this->database->getConnection()->quote($type);
                    }, $filters['product_type']);
                    $whereConditions[] = "p.product_type IN (" . implode(',', $productTypeValues) . ")";
                } else {
                    $productTypeValue = $this->database->getConnection()->quote($filters['product_type']);
                    $whereConditions[] = "p.product_type = $productTypeValue";
                }
            }

            // Price range filters (if variants exist)
            if (!empty($filters['min_price']) || !empty($filters['max_price'])) {
                $priceJoin = " JOIN product_variants pv ON p.id = pv.product_id ";
                
                if (!empty($filters['min_price'])) {
                    $minPriceValue = $this->database->getConnection()->quote($filters['min_price']);
                    $whereConditions[] = "pv.sale_price >= $minPriceValue";
                }
                
                if (!empty($filters['max_price'])) {
                    $maxPriceValue = $this->database->getConnection()->quote($filters['max_price']);
                    $whereConditions[] = "pv.sale_price <= $maxPriceValue";
                }
            } else {
                $priceJoin = "";
            }
            
            // Tags filter
            if (!empty($filters['tags'])) {
                $tagsArray = explode(',', $filters['tags']);
                $tagJoin = " JOIN product_tags pt ON p.id = pt.tag_id JOIN tags t ON pt.tag_id = t.id ";
                
                $tagConditions = [];
                foreach ($tagsArray as $tag) {
                    $tagValue = $this->database->getConnection()->quote($tag);
                    $tagConditions[] = "t.name = $tagValue";
                }
                
                $whereConditions[] = "(" . implode(' OR ', $tagConditions) . ")";
            } else {
                $tagJoin = "";
            }

            // Build WHERE clause
            $whereClause = !empty($whereConditions) ? "WHERE " . implode(' AND ', $whereConditions) : "";

            // Validate sort parameters
            $allowedSortFields = ['created_at', 'name', 'display_order', 'updated_at'];
            $sortBy = in_array($sortBy, $allowedSortFields) ? $sortBy : 'created_at';
            $sortOrder = strtolower($sortOrder) === 'asc' ? 'ASC' : 'DESC';

            // Get total count for pagination
            $countSql = "SELECT COUNT(DISTINCT p.id) as total FROM products p $priceJoin $tagJoin $whereClause";
            error_log("Count SQL: " . $countSql);
            $countResult = $this->database->fetch($countSql);
            $total = $countResult['total'] ?? 0;

            // Get products with pagination and relevance scoring
            $sql = "SELECT DISTINCT
                        p.id, p.category_id, p.subcategory_id, p.name, p.slug, p.description, p.short_description,
                        p.hsn_code, p.tax_rate, p.cgst_rate, p.sgst_rate, p.igst_rate, p.status, p.display_order, p.product_type,
                        p.shelf_life, p.ingredients, p.nutritional_info, p.storage_instructions, p.is_vegetarian,
                        p.attributes, p.meta_title, p.meta_description, p.meta_keywords,
                        p.created_at, p.updated_at, p.deleted_at, p.created_by, p.updated_by, p.deleted_by,
                        c.name as category_name, c.slug as category_slug, c.description as category_description,
                        c.image as category_image, c.meta_title as category_meta_title, 
                        c.meta_description as category_meta_description, c.meta_keywords as category_meta_keywords,
                        c.status as category_status, c.display_order as category_display_order,
                        s.name as subcategory_name, s.slug as subcategory_slug, s.description as subcategory_description,
                        s.image as subcategory_image, s.meta_title as subcategory_meta_title, 
                        s.meta_description as subcategory_meta_description, s.meta_keywords as subcategory_meta_keywords,
                        s.status as subcategory_status, s.display_order as subcategory_display_order,
                        creator.id as creator_id, CONCAT(creator.first_name, ' ', creator.last_name) as created_by_name,
                        updater.id as updater_id, CONCAT(updater.first_name, ' ', updater.last_name) as updated_by_name,
                        deleter.id as deleter_id, CONCAT(deleter.first_name, ' ', deleter.last_name) as deleted_by_name" .
                        (!empty($filters['search']) ? $this->getSearchRelevanceScore($filters['search']) : "") . "
                    FROM products p
                    LEFT JOIN categories c ON p.category_id = c.id
                    LEFT JOIN subcategories s ON p.subcategory_id = s.id
                    LEFT JOIN admins creator ON p.created_by = creator.id
                    LEFT JOIN admins updater ON p.updated_by = updater.id
                    LEFT JOIN admins deleter ON p.deleted_by = deleter.id
                    $priceJoin
                    $tagJoin
                    $whereClause
                    GROUP BY p.id
                    ORDER BY " . (!empty($filters['search']) ? "search_relevance DESC, " : "") . "p.$sortBy $sortOrder
                    LIMIT $limit OFFSET $offset";

            error_log("Main SQL: " . $sql);
            $products = $this->database->fetchAll($sql);

            // Process products data
            foreach ($products as &$product) {
                // Process JSON fields
                $product = $this->processJsonFields($product);
                
                // Format dates
                $product['created_at_formatted'] = date('Y-m-d H:i:s', strtotime($product['created_at']));
                if (!empty($product['updated_at'])) {
                    $product['updated_at_formatted'] = date('Y-m-d H:i:s', strtotime($product['updated_at']));
                }
                if (!empty($product['deleted_at'])) {
                    $product['deleted_at_formatted'] = date('Y-m-d H:i:s', strtotime($product['deleted_at']));
                }
                
                // Clean up null values for deleted info if not deleted
                if (empty($product['deleted_at'])) {
                    $product['deleted_by_name'] = null;
                    $product['deleter_id'] = null;
                }
                
                // Clean up null values for updated info if not updated
                if (empty($product['updated_at'])) {
                    $product['updated_by_name'] = null;
                    $product['updater_id'] = null;
                }
                
                // Structure category data
                if (!empty($product['category_id'])) {
                    $product['category'] = [
                        'id' => $product['category_id'],
                        'name' => $product['category_name'],
                        'slug' => $product['category_slug'],
                        'description' => $product['category_description'],
                        'image' => $product['category_image'],
                        'meta_title' => $product['category_meta_title'],
                        'meta_description' => $product['category_meta_description'],
                        'meta_keywords' => $product['category_meta_keywords'],
                        'status' => $product['category_status'],
                        'display_order' => $product['category_display_order']
                    ];
                    
                    
                } else {
                    $product['category'] = null;
                }
                
                // Structure subcategory data
                if (!empty($product['subcategory_id'])) {
                    $product['subcategory'] = [
                        'id' => $product['subcategory_id'],
                        'name' => $product['subcategory_name'],
                        'slug' => $product['subcategory_slug'],
                        'description' => $product['subcategory_description'],
                        'image' => $product['subcategory_image'],
                        'meta_title' => $product['subcategory_meta_title'],
                        'meta_description' => $product['subcategory_meta_description'],
                        'meta_keywords' => $product['subcategory_meta_keywords'] ?? null,
                        'status' => $product['subcategory_status'],
                        'display_order' => $product['subcategory_display_order'],
                        'category_id' => $product['category_id']
                    ];
                    
                    
                } else {
                    $product['subcategory'] = null;
                }
                
                // Get variants
                $product['variants'] = $this->getProductVariants($product['id']);
                
                // Get images
                $product['images'] = $this->getProductImages($product['id']);
                
                // Get tags
                $product['tags'] = $this->getProductTags($product['id']);
                
                // Remove the individual category and subcategory fields from the product
                unset(
                    $product['category_name'], $product['category_slug'], 
                    $product['category_description'], $product['category_image'], $product['category_meta_title'], 
                    $product['category_meta_description'], $product['category_meta_keywords'], 
                    $product['category_status'], $product['category_display_order'],
                    $product['subcategory_name'], $product['subcategory_slug'], 
                    $product['subcategory_description'], $product['subcategory_image'], $product['subcategory_meta_title'], 
                    $product['subcategory_meta_description'], $product['subcategory_meta_keywords'], 
                    $product['subcategory_status'], $product['subcategory_display_order']
                );
            }

            return [
                'data' => $products,
                'meta' => [
                    'current_page' => $page,
                    'per_page' => $limit,
                    'total' => $total,
                    'total_pages' => ceil($total / $limit)
                ]
            ];
        } catch (Exception $e) {
            error_log("Error in getComprehensiveProducts: " . $e->getMessage());
            error_log("Stack trace: " . $e->getTraceAsString());
            throw new Exception('Error retrieving comprehensive products: ' . $e->getMessage());
        }
    }
    
    /**
     * Get a single comprehensive product by ID with all related data
     *
     * @param int $productId Product ID
     * @param bool $includeDeleted Whether to include deleted products (for super admins)
     * @return array|null Product data or null if not found
     */
    public function getComprehensiveProductById($productId, $includeDeleted = false)
    {
        try {
            // Debug log
            error_log("getComprehensiveProductById called with ID: " . $productId . ", includeDeleted: " . ($includeDeleted ? 'true' : 'false'));
        
            $whereConditions = ["p.id = :product_id"];
            $params = [':product_id' => $productId];

            // Only include non-deleted products unless specifically requested
            if (!$includeDeleted) {
                $whereConditions[] = "p.deleted_at IS NULL";
            }

            // Build WHERE clause
            $whereClause = "WHERE " . implode(' AND ', $whereConditions);

            // Get product
            $sql = "SELECT 
                    p.id, p.category_id, p.subcategory_id, p.name, p.slug, p.description, p.short_description,
                    p.hsn_code, p.tax_rate, p.cgst_rate, p.sgst_rate, p.igst_rate, p.status, p.display_order, p.product_type,
                    p.shelf_life, p.ingredients, p.nutritional_info, p.storage_instructions, p.is_vegetarian,
                    p.attributes, p.meta_title, p.meta_description, p.meta_keywords,
                    p.created_at, p.updated_at, p.deleted_at, p.created_by, p.updated_by, p.deleted_by,
                    c.name as category_name, c.slug as category_slug, c.description as category_description,
                    c.image as category_image, c.meta_title as category_meta_title, 
                    c.meta_description as category_meta_description, c.meta_keywords as category_meta_keywords,
                    c.status as category_status, c.display_order as category_display_order,
                    s.name as subcategory_name, s.slug as subcategory_slug, s.description as subcategory_description,
                    s.image as subcategory_image, s.meta_title as subcategory_meta_title, 
                    s.meta_description as subcategory_meta_description, s.meta_keywords as subcategory_meta_keywords,
                    s.status as subcategory_status, s.display_order as subcategory_display_order,
                    creator.id as creator_id, CONCAT(creator.first_name, ' ', creator.last_name) as created_by_name,
                    updater.id as updater_id, CONCAT(updater.first_name, ' ', updater.last_name) as updated_by_name,
                    deleter.id as deleter_id, CONCAT(deleter.first_name, ' ', deleter.last_name) as deleted_by_name
                FROM products p
                LEFT JOIN categories c ON p.category_id = c.id
                LEFT JOIN subcategories s ON p.subcategory_id = s.id
                LEFT JOIN admins creator ON p.created_by = creator.id
                LEFT JOIN admins updater ON p.updated_by = updater.id
                LEFT JOIN admins deleter ON p.deleted_by = deleter.id
                $whereClause
                LIMIT 1";

        error_log("SQL: " . $sql);
        $product = $this->database->fetch($sql, $params);
        
        if (!$product) {
            error_log("Product not found with ID: {$productId}, includeDeleted: " . ($includeDeleted ? 'true' : 'false'));
            return null;
        }

        // Process product data
        // Process JSON fields
        $product = $this->processJsonFields($product);
        
        // Format dates
        $product['created_at_formatted'] = date('Y-m-d H:i:s', strtotime($product['created_at']));
        if (!empty($product['updated_at'])) {
            $product['updated_at_formatted'] = date('Y-m-d H:i:s', strtotime($product['updated_at']));
        }
        if (!empty($product['deleted_at'])) {
            $product['deleted_at_formatted'] = date('Y-m-d H:i:s', strtotime($product['deleted_at']));
        }
        
        // Clean up null values for deleted info if not deleted
        if (empty($product['deleted_at'])) {
            $product['deleted_by_name'] = null;
            $product['deleter_id'] = null;
        }
        
        // Clean up null values for updated info if not updated
        if (empty($product['updated_at'])) {
            $product['updated_by_name'] = null;
            $product['updater_id'] = null;
        }
        
        // Structure category data
        if (!empty($product['category_id'])) {
            $product['category'] = [
                'id' => $product['category_id'],
                'name' => $product['category_name'],
                'slug' => $product['category_slug'],
                'description' => $product['category_description'],
                'image' => $product['category_image'],
                'meta_title' => $product['category_meta_title'],
                'meta_description' => $product['category_meta_description'],
                'meta_keywords' => $product['category_meta_keywords'],
                'status' => $product['category_status'],
                'display_order' => $product['category_display_order']
            ];
            
            
        } else {
            $product['category'] = null;
        }
        
        // Structure subcategory data
        if (!empty($product['subcategory_id'])) {
            $product['subcategory'] = [
                'id' => $product['subcategory_id'],
                'name' => $product['subcategory_name'],
                'slug' => $product['subcategory_slug'],
                'description' => $product['subcategory_description'],
                'image' => $product['subcategory_image'],
                'meta_title' => $product['subcategory_meta_title'],
                'meta_description' => $product['subcategory_meta_description'],
                'meta_keywords' => $product['subcategory_meta_keywords'] ?? null,
                'status' => $product['subcategory_status'],
                'display_order' => $product['subcategory_display_order'],
                'category_id' => $product['category_id']
            ];
            
            
        } else {
            $product['subcategory'] = null;
        }
        
        // Get variants - even for deleted products
        $product['variants'] = $this->getProductVariants($product['id']);
        
        // Get images - even for deleted products
        $product['images'] = $this->getProductImages($product['id']);
        
        // Get tags - even for deleted products
        $product['tags'] = $this->getProductTags($product['id']);
        
        // Remove the individual category and subcategory fields from the product
        unset(
            $product['category_name'], $product['category_slug'], 
            $product['category_description'], $product['category_image'], $product['category_meta_title'], 
            $product['category_meta_description'], $product['category_meta_keywords'], 
            $product['category_status'], $product['category_display_order'],
            $product['subcategory_name'], $product['subcategory_slug'], 
            $product['subcategory_description'], $product['subcategory_image'], $product['subcategory_meta_title'], 
            $product['subcategory_meta_description'], $product['subcategory_meta_keywords'], 
            $product['subcategory_status'], $product['subcategory_display_order']
        );

        return $product;
    } catch (Exception $e) {
        error_log("Error in getComprehensiveProductById: " . $e->getMessage());
        error_log("Stack trace: " . $e->getTraceAsString());
        throw new Exception('Error retrieving comprehensive product: ' . $e->getMessage());
    }
}
    
    /**
     * Get product by ID (basic data only)
     *
     * @param int $productId Product ID
     * @param bool $includeDeleted Whether to include deleted products
     * @return array|null Product data or null if not found
     */
    public function getProductById($productId, $includeDeleted = false)
    {
        try {
            $sql = "SELECT * FROM products WHERE id = :id";
            $params = [':id' => $productId];
            
            // Only include non-deleted products unless specifically requested
            if (!$includeDeleted) {
                $sql .= " AND deleted_at IS NULL";
            }
            
            return $this->database->fetch($sql, $params);
        } catch (Exception $e) {
            error_log("Error in getProductById: " . $e->getMessage());
            throw new Exception('Error retrieving product: ' . $e->getMessage());
        }
    }
    
    /**
     * Create a new product
     *
     * @param array $data Product data
     * @param string $slug Product slug
     * @param int $adminId Admin ID
     * @return int Product ID
     */
    public function createProduct($data, $slug, $adminId)
    {
        try {
            // Prepare product data
            $productData = [
                'category_id' => $data['category_id'],
                'subcategory_id' => $data['subcategory_id'],
                'name' => InputSanitizer::sanitize($data['name']),
                'slug' => $slug,
                'description' => isset($data['description']) ? InputSanitizer::sanitizeHtml($data['description']) : null,
                'short_description' => isset($data['short_description']) ? InputSanitizer::sanitize($data['short_description']) : null,
                'hsn_code' => isset($data['hsn_code']) ? InputSanitizer::sanitize($data['hsn_code']) : null,
                'tax_rate' => isset($data['tax_rate']) ? (float)$data['tax_rate'] : 0,
                'cgst_rate' => isset($data['cgst_rate']) ? (float)$data['cgst_rate'] : 0,
                'sgst_rate' => isset($data['sgst_rate']) ? (float)$data['sgst_rate'] : 0,
                'igst_rate' => isset($data['igst_rate']) ? (float)$data['igst_rate'] : 0,
                'status' => $data['status'],
                'display_order' => isset($data['display_order']) ? (int)$data['display_order'] : 0,
                'product_type' => isset($data['product_type']) ? $data['product_type'] : 'global',
                'shelf_life' => isset($data['shelf_life']) ? InputSanitizer::sanitize($data['shelf_life']) : null,
                'ingredients' => isset($data['ingredients']) ? $data['ingredients'] : null,
                'nutritional_info' => isset($data['nutritional_info']) ? $data['nutritional_info'] : null,
                'storage_instructions' => isset($data['storage_instructions']) ? InputSanitizer::sanitize($data['storage_instructions']) : null,
                'is_vegetarian' => isset($data['is_vegetarian']) ? (int)$data['is_vegetarian'] : null,
                'attributes' => isset($data['attributes']) ? $data['attributes'] : null,
                'meta_title' => isset($data['meta_title']) ? InputSanitizer::sanitize($data['meta_title']) : null,
                'meta_description' => isset($data['meta_description']) ? InputSanitizer::sanitize($data['meta_description']) : null,
                'meta_keywords' => isset($data['meta_keywords']) ? InputSanitizer::sanitize($data['meta_keywords']) : null,
                'created_by' => $adminId,
                'created_at' => date('Y-m-d H:i:s')
            ];
            
            // Insert product
            $productId = $this->database->insert('products', $productData);
            
            if (!$productId) {
                throw new Exception('Failed to create product');
            }
            
            return $productId;
        } catch (Exception $e) {
            error_log("Error in createProduct: " . $e->getMessage());
            throw new Exception('Error creating product: ' . $e->getMessage());
        }
    }
    
    /**
     * Update an existing product
     *
     * @param int $productId Product ID
     * @param array $data Product data
     * @param string $slug Product slug
     * @param int $adminId Admin ID
     * @return bool Success
     */
    public function updateProduct($productId, $data, $slug, $adminId)
    {
        try {
            // Get existing product
            $existingProduct = $this->getProductById($productId);
            
            if (!$existingProduct) {
                throw new Exception('Product not found');
            }
            
            // Prepare product data with defaults from existing product
            $productData = [
                'category_id' => $data['category_id'] ?? $existingProduct['category_id'],
                'subcategory_id' => $data['subcategory_id'] ?? $existingProduct['subcategory_id'],
                'name' => isset($data['name']) ? InputSanitizer::sanitize($data['name']) : $existingProduct['name'],
                'slug' => $slug,
                'updated_by' => $adminId,
                'updated_at' => date('Y-m-d H:i:s')
            ];
            
            // Only include fields that are provided in the update
            if (isset($data['description'])) {
                $productData['description'] = InputSanitizer::sanitizeHtml($data['description']);
            }
            
            if (isset($data['short_description'])) {
                $productData['short_description'] = InputSanitizer::sanitize($data['short_description']);
            }
            
            if (isset($data['hsn_code'])) {
                $productData['hsn_code'] = InputSanitizer::sanitize($data['hsn_code']);
            }
            
            if (isset($data['tax_rate'])) {
                $productData['tax_rate'] = (float)$data['tax_rate'];
            }
            
            if (isset($data['cgst_rate'])) {
                $productData['cgst_rate'] = (float)$data['cgst_rate'];
            }
            
            if (isset($data['sgst_rate'])) {
                $productData['sgst_rate'] = (float)$data['sgst_rate'];
            }
            
            if (isset($data['igst_rate'])) {
                $productData['igst_rate'] = (float)$data['igst_rate'];
            }
            
            if (isset($data['status'])) {
                $productData['status'] = $data['status'];
            }
            
            if (isset($data['display_order'])) {
                $productData['display_order'] = (int)$data['display_order'];
            }

            if (isset($data['product_type'])) {
                $productData['product_type'] = $data['product_type'];
            }
            
            if (isset($data['shelf_life'])) {
                $productData['shelf_life'] = InputSanitizer::sanitize($data['shelf_life']);
            }
            
            if (isset($data['ingredients'])) {
                $productData['ingredients'] = $data['ingredients'];
            }
            
            if (isset($data['nutritional_info'])) {
                $productData['nutritional_info'] = $data['nutritional_info'];
            }
            
            if (isset($data['storage_instructions'])) {
                $productData['storage_instructions'] = InputSanitizer::sanitize($data['storage_instructions']);
            }
            
            if (isset($data['is_vegetarian'])) {
                $productData['is_vegetarian'] = (int)$data['is_vegetarian'];
            }
            
            if (isset($data['attributes'])) {
                $productData['attributes'] = $data['attributes'];
            }
            
            if (isset($data['meta_title'])) {
                $productData['meta_title'] = InputSanitizer::sanitize($data['meta_title']);
            }
            
            if (isset($data['meta_description'])) {
                $productData['meta_description'] = InputSanitizer::sanitize($data['meta_description']);
            }
            
            if (isset($data['meta_keywords'])) {
                $productData['meta_keywords'] = InputSanitizer::sanitize($data['meta_keywords']);
            }
            
            // Debug log
            error_log("Updating product with data: " . json_encode($productData));
            
            // Update product
            $updated = $this->database->update('products', $productData, ['id' => $productId]);
            
            if (!$updated) {
                // Check if there was actually a change or if the data was the same
                $lastError = $this->database->getConnection()->errorInfo();
                if ($lastError[0] !== '00000') {
                    error_log("Database error: " . json_encode($lastError));
                    throw new Exception('Database error: ' . $lastError[2]);
                }
            }
            
            return true;
        } catch (Exception $e) {
            error_log("Error in updateProduct: " . $e->getMessage());
            error_log("Stack trace: " . $e->getTraceAsString());
            throw new Exception('Error updating product: ' . $e->getMessage());
        }
    }

    /**
     * Update a product variant
     *
     * @param int $variantId Variant ID
     * @param int $productId Product ID
     * @param array $variant Variant data
     * @return bool Success
     */
    public function updateProductVariant($variantId, $productId, $variant)
    {
        try {
            // Check if variant exists and belongs to this product
            $existingVariant = $this->database->fetch(
                "SELECT * FROM product_variants WHERE id = :id AND product_id = :product_id",
                [':id' => $variantId, ':product_id' => $productId]
            );
        
            if (!$existingVariant) {
                // Instead of throwing an exception, log the issue and return false
                error_log("Variant with ID {$variantId} not found or does not belong to product {$productId}. Skipping update.");
                return false;
            }
        
            // Prepare variant data
            $variantData = [
                'variant_name' => InputSanitizer::sanitize($variant['variant_name']),
                'sku' => InputSanitizer::sanitize($variant['sku']),
                'price' => (float)$variant['price'],
                'updated_at' => date('Y-m-d H:i:s')
            ];
        
            // Only include fields that are provided in the update
            if (isset($variant['sale_price'])) {
                $variantData['sale_price'] = (float)$variant['sale_price'];
            }
        
            if (isset($variant['discount_percentage'])) {
                $variantData['discount_percentage'] = (float)$variant['discount_percentage'];
            }
        
            if (isset($variant['weight'])) {
                $variantData['weight'] = (float)$variant['weight'];
            }
        
            if (isset($variant['weight_unit'])) {
                $variantData['weight_unit'] = $variant['weight_unit'];
            }
        
            if (isset($variant['dimensions'])) {
                $variantData['dimensions'] = $variant['dimensions'];
            }
        
            if (isset($variant['status'])) {
                $variantData['status'] = $variant['status'];
            }
        
            if (isset($variant['min_order_quantity'])) {
                $variantData['min_order_quantity'] = (int)$variant['min_order_quantity'];
            }
        
            if (isset($variant['max_order_quantity'])) {
                $variantData['max_order_quantity'] = (int)$variant['max_order_quantity'];
            }
        
            if (isset($variant['display_order'])) {
                $variantData['display_order'] = (int)$variant['display_order'];
            }
        
            if (isset($variant['updated_by'])) {
                $variantData['updated_by'] = (int)$variant['updated_by'];
            }
        
            // Debug log
            error_log("Updating variant {$variantId} with data: " . json_encode($variantData));
        
            // Update variant
            $updated = $this->database->update('product_variants', $variantData, ['id' => $variantId, 'product_id' => $productId]);
        
            if (!$updated) {
                // Check if there was actually a change or if the data was the same
                $lastError = $this->database->getConnection()->errorInfo();
                if ($lastError[0] !== '00000') {
                    error_log("Database error: " . json_encode($lastError));
                    throw new Exception('Database error: ' . $lastError[2]);
                }
            }
        
            return true;
        } catch (Exception $e) {
            error_log("Error in updateProductVariant: " . $e->getMessage());
            error_log("Stack trace: ". $e->getTraceAsString());
            throw new Exception('Error updating product variant: ' . $e->getMessage());
        }
    }
    
    /**
     * Soft delete a product
     *
     * @param int $productId Product ID
     * @param int $adminId Admin ID
     * @return bool Success
     */
    public function softDeleteProduct($productId, $adminId)
    {
        try {
            // Update product with deleted_at timestamp and deleted_by admin ID
            $updated = $this->database->update(
                'products',
                [
                    'deleted_at' => date('Y-m-d H:i:s'),
                    'deleted_by' => $adminId,
                    'status' => 'archived' // Also update status to archived
                ],
                ['id' => $productId]
            );
            
            if (!$updated) {
                throw new Exception('Failed to delete product');
            }
            
            return true;
        } catch (Exception $e) {
            error_log("Error in softDeleteProduct: " . $e->getMessage());
            throw new Exception('Error deleting product: ' . $e->getMessage());
        }
    }
    
    /**
     * Permanently delete a product and all related data
     *
     * @param int $productId Product ID
     * @return bool Success
     */
public function permanentlyDeleteProduct($productId)
{
    try {
        error_log("Starting HARD deletion of product ID: {$productId}");
        
        // Remove transaction management from here
        // this->database->beginTransaction(); - REMOVED
        
        try {
            // 1. First verify the product exists
            $productExists = $this->database->fetch(
                "SELECT id FROM products WHERE id = :product_id",
                [':product_id' => $productId]
            );
            
            if (!$productExists) {
                error_log("Product ID {$productId} not found for deletion");
                throw new Exception("Product not found");
            }
            
            // 2. Delete product variants with direct SQL
            $variantsSql = "DELETE FROM product_variants WHERE product_id = :product_id";
            $variantsStmt = $this->database->query($variantsSql, [':product_id' => $productId]);
            $variantsDeleted = $variantsStmt->rowCount();
            error_log("Deleted {$variantsDeleted} product variants for product {$productId}");
            
            // 3. Delete product tags (junction table only) with direct SQL
            $tagsSql = "DELETE FROM product_tags WHERE product_id = :product_id";
            $tagsStmt = $this->database->query($tagsSql, [':product_id' => $productId]);
            $tagsDeleted = $tagsStmt->rowCount();
            error_log("Deleted {$tagsDeleted} product tags for product {$productId}");
            
            // 4. Delete product images (database records only) with direct SQL
            $imagesSql = "DELETE FROM product_images WHERE product_id = :product_id";
            $imagesStmt = $this->database->query($imagesSql, [':product_id' => $productId]);
            $imagesDeleted = $imagesStmt->rowCount();
            error_log("Deleted {$imagesDeleted} product images for product {$productId}");
            
            // 5. Finally, delete the product itself with direct SQL
            $productSql = "DELETE FROM products WHERE id = :product_id";
            $productStmt = $this->database->query($productSql, [':product_id' => $productId]);
            $productDeleted = $productStmt->rowCount();
            
            if ($productDeleted === 0) {
                error_log("Failed to delete product ID: {$productId}");
                throw new Exception("Failed to delete product");
            }
            
            error_log("Successfully deleted product record for product {$productId}");
            
            // Remove transaction commit
            // this->database->commit(); - REMOVED
            error_log("Product deletion completed for product ID: {$productId}");
            
            return true;
        } catch (Exception $e) {
            // Remove transaction rollback
            // this->database->rollback(); - REMOVED
            error_log("Error during deletion of product ID: {$productId}. Error: " . $e->getMessage());
            throw $e;
        }
    } catch (Exception $e) {
        error_log("Error in permanentlyDeleteProduct: " . $e->getMessage());
        error_log("Stack trace: " . $e->getTraceAsString());
        throw new Exception('Error permanently deleting product: ' . $e->getMessage());
    }
}
    
    /**
     * Archive all variants of a product
     *
     * @param int $productId Product ID
     * @return bool Success
     */
    public function archiveProductVariants($productId)
    {
        try {
            // Update all variants to archived status
            $updated = $this->database->update(
                'product_variants',
                ['status' => 'archived'],
                ['product_id' => $productId]
            );
            
            return true;
        } catch (Exception $e) {
            error_log("Error in archiveProductVariants: " . $e->getMessage());
            throw new Exception('Error archiving product variants: ' . $e->getMessage());
        }
    }
    
    /**
     * Create a product variant
     *
     * @param int $productId Product ID
     * @param array $variant Variant data
     * @return int Variant ID
     */
    public function createProductVariant($productId, $variant)
    {
        try {
            // Prepare variant data
            $variantData = [
                'product_id' => $productId,
                'variant_name' => InputSanitizer::sanitize($variant['variant_name']),
                'sku' => InputSanitizer::sanitize($variant['sku']),
                'price' => (float)$variant['price'],
                'sale_price' => isset($variant['sale_price']) ? (float)$variant['sale_price'] : null,
                'discount_percentage' => isset($variant['discount_percentage']) ? (float)$variant['discount_percentage'] : null,
                'weight' => isset($variant['weight']) ? (float)$variant['weight'] : null,
                'weight_unit' => isset($variant['weight_unit']) ? $variant['weight_unit'] : 'g',
                'dimensions' => isset($variant['dimensions']) ? $variant['dimensions'] : null,
                'status' => $variant['status'],
                'min_order_quantity' => isset($variant['min_order_quantity']) ? (int)$variant['min_order_quantity'] : 1,
                'max_order_quantity' => isset($variant['max_order_quantity']) ? (int)$variant['max_order_quantity'] : null,
                'display_order' => isset($variant['display_order']) ? (int)$variant['display_order'] : 0,
                'created_at' => date('Y-m-d H:i:s'),
                'created_by' => isset($variant['created_by']) ? (int)$variant['created_by'] : null
            ];
            
            // Insert variant
            $variantId = $this->database->insert('product_variants', $variantData);
            
            if (!$variantId) {
                throw new Exception('Failed to create product variant');
            }
            
            return $variantId;
        } catch (Exception $e) {
            error_log("Error in createProductVariant: " . $e->getMessage());
            throw new Exception('Error creating product variant: ' . $e->getMessage());
        }
    }
    
    
    /**
     * Delete a product variant
     *
     * @param int $productId Product ID
     * @param int $variantId Variant ID
     * @return bool Success
     */
    public function deleteProductVariant($productId, $variantId)
    {
        try {
            // Check if variant belongs to this product
            $variant = $this->database->fetch(
                "SELECT id FROM product_variants WHERE id = :id AND product_id = :product_id",
                [':id' => $variantId, ':product_id' => $productId]
            );
            
            if (!$variant) {
                return false;
            }
            
            // Delete variant
            $deleted = $this->database->delete('product_variants', ['id' => $variantId]);
            
            if (!$deleted) {
                throw new Exception('Failed to delete product variant');
            }
            
            return true;
        } catch (Exception $e) {
            error_log("Error in deleteProductVariant: " . $e->getMessage());
            throw new Exception('Error deleting product variant: ' . $e->getMessage());
        }
    }
    
    /**
     * Get or create a tag
     *
     * @param string $tagName Tag name
     * @return int Tag ID
     */
    public function getOrCreateTag($tagName)
    {
        try {
            // Sanitize tag name
            $tagName = trim(InputSanitizer::sanitize($tagName));
            
            if (empty($tagName)) {
                throw new Exception('Tag name cannot be empty');
            }
            
            // Check if tag exists using prepared statement to avoid SQL injection
            $tag = $this->database->fetch(
                "SELECT id FROM tags WHERE name = :name",
                [':name' => $tagName]
            );
            
            if ($tag) {
                error_log("Tag '{$tagName}' already exists with ID: " . $tag['id']);
                return $tag['id'];
            }
            
            // Create new tag
            $tagData = [
                'name' => $tagName,
                'created_at' => date('Y-m-d H:i:s')
            ];
            
            error_log("Creating new tag: " . $tagName);
            $tagId = $this->database->insert('tags', $tagData);
            
            if (!$tagId) {
                $error = $this->database->getConnection()->errorInfo();
                error_log("Failed to create tag. Error: " . json_encode($error));
            
                // If it failed because of a duplicate, try to get the existing tag
                if ($error[0] == 23000 && strpos($error[2], 'Duplicate') !== false) {
                    $tag = $this->database->fetch(
                        "SELECT id FROM tags WHERE name = :name",
                        [':name' => $tagName]
                    );
                    
                    if ($tag) {
                        error_log("Retrieved existing tag after duplicate error: " . $tag['id']);
                        return $tag['id'];
                    }
                }
                
                throw new Exception('Failed to create tag: ' . ($error[2] ?? 'Unknown error'));
            }
            
            return $tagId;
        } catch (Exception $e) {
            error_log("Error in getOrCreateTag: " . $e->getMessage());
            error_log("Stack trace: " . $e->getTraceAsString());
            throw new Exception('Error processing tag: ' . $e->getMessage());
        }
    }
    
    /**
     * Associate a tag with a product
     *
     * @param int $productId Product ID
     * @param int $tagId Tag ID
     * @return bool Success
     */
    public function associateTagWithProduct($productId, $tagId)
    {
        try {
            // Validate inputs
            if (empty($productId) || !is_numeric($productId)) {
                throw new Exception('Invalid product ID');
            }
            
            if (empty($tagId) || !is_numeric($tagId)) {
                throw new Exception('Invalid tag ID');
            }
            
            // Check if product exists
            $product = $this->database->fetch(
                "SELECT id FROM products WHERE id = :id",
                [':id' => $productId]
            );
            
            if (!$product) {
                throw new Exception("Product with ID {$productId} not found");
            }
            
            // Check if tag exists
            $tag = $this->database->fetch(
                "SELECT id FROM tags WHERE id = :id",
                [':id' => $tagId]
            );
            
            if (!$tag) {
                throw new Exception("Tag with ID {$tagId} not found");
            }
            
            // Check if association already exists
            $association = $this->database->fetch(
                "SELECT product_id FROM product_tags WHERE product_id = :product_id AND tag_id = :tag_id",
                [':product_id' => $productId, ':tag_id' => $tagId]
            );
            
            if ($association) {
                error_log("Tag {$tagId} is already associated with product {$productId}");
                return true;
            }
            
            // Create association
            $associationData = [
                'product_id' => $productId,
                'tag_id' => $tagId,
                'created_at' => date('Y-m-d H:i:s')
            ];
            
            error_log("Associating tag {$tagId} with product {$productId}");
            $inserted = $this->database->insert('product_tags', $associationData);
            
            if (!$inserted) {
                $error = $this->database->getConnection()->errorInfo();
                error_log("Failed to associate tag with product. Error: " . json_encode($error));
            
                // If it failed because of a duplicate, it's already associated
                if ($error[0] == 23000 && strpos($error[2], 'Duplicate') !== false) {
                    error_log("Tag {$tagId} is already associated with product {$productId} (duplicate key)");
                    return true;
                }
                
                throw new Exception('Failed to associate tag with product: ' . ($error[2] ?? 'Unknown error'));
            }
            
            return true;
        } catch (Exception $e) {
            error_log("Error in associateTagWithProduct: " . $e->getMessage());
            error_log("Stack trace: " . $e->getTraceAsString());
            throw new Exception('Error associating tag with product: ' . $e->getMessage());
        }
    }
    
    /**
     * Delete all tags associated with a product
     *
     * @param int $productId Product ID
     * @return bool Success
     */
    public function deleteProductTags($productId)
    {
        try {
            // Validate input
            if (empty($productId) || !is_numeric($productId)) {
                throw new Exception('Invalid product ID');
            }
            
            error_log("Deleting all tags for product {$productId}");
            
            // Delete all tag associations
            $deleted = $this->database->delete('product_tags', ['product_id' => $productId]);
            
            // Even if no rows were affected, consider it successful
            return true;
        } catch (Exception $e) {
            error_log("Error in deleteProductTags: " . $e->getMessage());
            error_log("Stack trace: " . $e->getTraceAsString());
            throw new Exception('Error deleting product tags: ' . $e->getMessage());
        }
    }
    
    /**
     * Create a product image
     *
     * @param int $productId Product ID
     * @param string $imagePath Image path
     * @param bool $isPrimary Whether this is the primary image
     * @param int $displayOrder Display order
     * @return int Image ID
     */
    public function createProductImage($productId, $imagePath, $isPrimary, $displayOrder)
    {
        try {
            // Prepare image data
            $imageData = [
                'product_id' => $productId,
                'image_path' => $imagePath,
                'is_primary' => $isPrimary ? 1 : 0,
                'display_order' => $displayOrder,
                'created_at' => date('Y-m-d H:i:s')
            ];
            
            // Insert image
            $imageId = $this->database->insert('product_images', $imageData);
            
            if (!$imageId) {
                throw new Exception('Failed to create product image');
            }
            
            return $imageId;
        } catch (Exception $e) {
            error_log("Error in createProductImage: " . $e->getMessage());
            throw new Exception('Error creating product image: ' . $e->getMessage());
        }
    }
    
    /**
     * Delete a product image
     *
     * @param int $productId Product ID
     * @param int $imageId Image ID
     * @return bool Success
     */
    public function deleteProductImage($productId, $imageId)
    {
        try {
            // Check if image belongs to this product
            $image = $this->database->fetch(
                "SELECT id, image_path FROM product_images WHERE id = :id AND product_id = :product_id",
                [':id' => $imageId, ':product_id' => $productId]
            );
        
            if (!$image) {
                error_log("Image {$imageId} not found or does not belong to product {$productId}");
                return false;
            }
        
            // Delete image record
            $deleted = $this->database->delete('product_images', ['id' => $imageId]);
            
            if (!$deleted) {
                $error = $this->database->getConnection()->errorInfo();
                error_log("Failed to delete product image record for image {$imageId}. Error: " . json_encode($error));
                return false;
            }
            
            error_log("Successfully deleted product image record for image {$imageId}");
            return true;
        } catch (Exception $e) {
            error_log("Error in deleteProductImage: " . $e->getMessage());
            error_log("Stack trace: " . $e->getTraceAsString());
            throw new Exception('Error deleting product image: ' . $e->getMessage());
        }
    }
    
    /**
     * Set primary image for a product
     *
     * @param int $productId Product ID
     * @param int $imageId Image ID
     * @return bool Success
     */
    public function setPrimaryProductImage($productId, $imageId)
    {
        try {
            // Check if image belongs to this product
            $image = $this->database->fetch(
                "SELECT id FROM product_images WHERE id = :id AND product_id = :product_id",
                [':id' => $imageId, ':product_id' => $productId]
            );
            
            if (!$image) {
                return false;
            }
            
            // Reset all images to non-primary
            $this->database->update(
                'product_images',
                ['is_primary' => 0],
                ['product_id' => $productId]
            );
            
            // Set specified image as primary
            $updated = $this->database->update(
                'product_images',
                ['is_primary' => 1],
                ['id' => $imageId]
            );
            
            if (!$updated) {
                throw new Exception('Failed to set primary product image');
            }
            
            return true;
        } catch (Exception $e) {
            error_log("Error in setPrimaryProductImage: " . $e->getMessage());
            throw new Exception('Error setting primary product image: ' . $e->getMessage());
        }
    }
    
    /**
     * Get product variants
     *
     * @param int $productId Product ID
     * @return array Product variants
     */
    private function getProductVariants($productId)
    {
        $sql = "
            SELECT 
            pv.*,
            creator.id as creator_id, 
            CONCAT(creator.first_name, ' ', creator.last_name) as created_by_name,
            updater.id as updater_id, 
            CONCAT(updater.first_name, ' ', updater.last_name) as updated_by_name
        FROM product_variants pv
        LEFT JOIN admins creator ON pv.created_by = creator.id
        LEFT JOIN admins updater ON pv.updated_by = updater.id
            WHERE pv.product_id = :product_id
            ORDER BY pv.display_order ASC, pv.id ASC
        ";
        
        $params = [':product_id' => $productId];
        
        try {
            $variants = $this->database->fetchAll($sql, $params);
            
            // Process variants to ensure proper format
            foreach ($variants as &$variant) {
                // Replace created_by ID with name
                if (isset($variant['created_by_name']) && !empty($variant['created_by_name'])) {
                    $variant['created_by'] = $variant['created_by_name'];
                } else {
                    $variant['created_by'] = null;
                }
                
                // Replace updated_by ID with name
                if (isset($variant['updated_by_name']) && !empty($variant['updated_by_name'])) {
                    $variant['updated_by'] = $variant['updated_by_name'];
                } else {
                    $variant['updated_by'] = null;
                }
                
                // Format dates
                if (!empty($variant['created_at'])) {
                    $variant['created_at_formatted'] = date('Y-m-d H:i:s', strtotime($variant['created_at']));
                }
                
                if (!empty($variant['updated_at'])) {
                    $variant['updated_at_formatted'] = date('Y-m-d H:i:s', strtotime($variant['updated_at']));
                }
            }
            
            return $variants;
        } catch (Exception $e) {
            error_log("Error getting product variants: " . $e->getMessage());
            return [];
        }
    }
    
    /**
     * Get product images
     *
     * @param int $productId Product ID
     * @return array Product images
     */
    public function getProductImages($productId)
    {
        $sql = "
            SELECT id, product_id, image_path, is_primary, display_order, created_at 
            FROM product_images 
            WHERE product_id = :product_id
            ORDER BY is_primary DESC, display_order ASC, id ASC
        ";
        
        $params = [':product_id' => $productId];
        
        try {
            $images = $this->database->fetchAll($sql, $params);
            
            // Only return database fields - no URL processing
            // image_path contains only the relative path stored in database
            return $images;
        } catch (Exception $e) {
            error_log("Error getting product images: " . $e->getMessage());
            return [];
        }
    }
    
    /**
     * Get product tags
     *
     * @param int $productId Product ID
     * @return array Product tags
     */
    private function getProductTags($productId)
    {
        $sql = "
            SELECT t.* 
            FROM tags t
            JOIN product_tags pt ON t.id = pt.tag_id
            WHERE pt.product_id = :product_id
            ORDER BY t.name ASC
        ";
        
        $params = [':product_id' => $productId];
        
        try {
            $tags = $this->database->fetchAll($sql, $params);
            return $tags;
        } catch (Exception $e) {
            error_log("Error getting product tags: " . $e->getMessage());
            return [];
        }
    }
    
    /**
     * Process JSON fields in product data
     *
     * @param array $product Product data
     * @return array Processed product data
     */
    private function processJsonFields($product)
    {
        // Process ingredients
        if (!empty($product['ingredients'])) {
            try {
                $product['ingredients_array'] = json_decode($product['ingredients'], true);
            } catch (Exception $e) {
                $product['ingredients_array'] = [];
            }
        } else {
            $product['ingredients_array'] = [];
        }
        
        // Process nutritional_info
        if (!empty($product['nutritional_info'])) {
            try {
                $product['nutritional_info_object'] = json_decode($product['nutritional_info'], true);
            } catch (Exception $e) {
                $product['nutritional_info_object'] = [];
            }
        } else {
            $product['nutritional_info_object'] = [];
        }
        
        // Process attributes
        if (!empty($product['attributes'])) {
            try {
                $product['attributes_object'] = json_decode($product['attributes'], true);
            } catch (Exception $e) {
                $product['attributes_object'] = [];
            }
        } else {
            $product['attributes_object'] = [];
        }
        
        return $product;
    }
    
    /**
     * Generate fuzzy search patterns for better matching
     *
     * @param string $searchTerm Original search term
     * @return array Array of fuzzy patterns
     */
    private function generateFuzzyPatterns($searchTerm)
    {
        $patterns = [];
        $searchTerm = strtolower($searchTerm);
        
        // Handle common missing characters (like "cke" for "cake")
        if (strlen($searchTerm) >= 3) {
            // Try adding common vowels in different positions
            $vowels = ['a', 'e', 'i', 'o', 'u'];
            
            for ($i = 0; $i <= strlen($searchTerm); $i++) {
                foreach ($vowels as $vowel) {
                    $fuzzyTerm = substr($searchTerm, 0, $i) . $vowel . substr($searchTerm, $i);
                    if ($fuzzyTerm !== $searchTerm && strlen($fuzzyTerm) <= strlen($searchTerm) + 2) {
                        $patterns[] = '%' . $fuzzyTerm . '%';
                    }
                }
            }
        
            // Handle single character omissions (like "cke" for "cake")
            for ($i = 0; $i < strlen($searchTerm); $i++) {
                $omittedTerm = substr($searchTerm, 0, $i) . substr($searchTerm, $i + 1);
                if (strlen($omittedTerm) >= 2) {
                    $patterns[] = '%' . $omittedTerm . '%';
                }
            }
        
            // Handle single character substitutions
            $commonSubs = [
                'c' => 'k', 'k' => 'c', 'f' => 'ph', 'ph' => 'f',
                's' => 'z', 'z' => 's', 'i' => 'y', 'y' => 'i'
            ];
        
            foreach ($commonSubs as $from => $to) {
                if (strpos($searchTerm, $from) !== false) {
                    $substituted = str_replace($from, $to, $searchTerm);
                    $patterns[] = '%' . $substituted . '%';
                }
            }
        }
        
        // Remove duplicates and limit patterns
        $patterns = array_unique($patterns);
        return array_slice($patterns, 0, 10); // Limit to prevent too many OR conditions
    }
    
    /**
     * Get tag suggestions based on search query
     *
     * @param string $query Search query
     * @param int $limit Maximum number of suggestions to return
     * @return array Tag suggestions
     */
    public function getTagSuggestions($query, $limit = 1000)
    {
        try {
            // Sanitize the query to prevent SQL injection
            $sanitizedQuery = InputSanitizer::sanitize($query);
            
            // Prepare the SQL query with LIKE for partial matching
            $sql = "SELECT id, name, 
                    (SELECT COUNT(*) FROM product_tags WHERE tag_id = tags.id) as usage_count 
                    FROM tags 
                    WHERE name LIKE :query 
                    ORDER BY usage_count DESC, name ASC 
                    LIMIT :limit";
            
            $params = [
                ':query' => '%' . $sanitizedQuery . '%',
                ':limit' => $limit
            ];
            
            // Execute the query
            $tags = $this->database->fetchAll($sql, $params);
            
            return $tags;
        } catch (Exception $e) {
            error_log("Error in getTagSuggestions: " . $e->getMessage());
            error_log("Stack trace: " . $e->getTraceAsString());
            throw new Exception('Error retrieving tag suggestions: ' . $e->getMessage());
        }
    }

    /**
     * Get search relevance score SQL
     *
     * @param string $searchTerm Search term
     * @return string SQL for relevance scoring
     */
    private function getSearchRelevanceScore($searchTerm)
    {
        $searchTerm = trim($searchTerm);
        $searchPattern = '%' . $searchTerm . '%';
        $quotedTerm = $this->database->getConnection()->quote($searchTerm);
        $quotedPattern = $this->database->getConnection()->quote($searchPattern);
        $quotedStartPattern = $this->database->getConnection()->quote($searchTerm . '%');
        
        return ",
            CASE
                WHEN p.name = $quotedTerm THEN 1000
                WHEN p.name LIKE $quotedStartPattern THEN 900
                WHEN p.name LIKE $quotedPattern THEN 800
                WHEN p.description LIKE $quotedPattern THEN 300
                WHEN p.slug LIKE $quotedPattern THEN 200
                WHEN p.hsn_code LIKE $quotedPattern THEN 100
                ELSE 0
            END as search_relevance";
    }

    // Add this new method after the getTagSuggestions method

    /**
     * Get all product SKUs for frontend validation
     *
     * @return array Array of products with their SKUs
     */
    public function getAllProductSkus()
    {
        try {
            // Query to get all products with their variants and SKUs
            $sql = "
                SELECT 
                    p.id as product_id, 
                    p.name as product_name, 
                    p.slug as product_slug,
                    p.status as product_status,
                    pv.id as variant_id, 
                    pv.variant_name, 
                    pv.sku, 
                    pv.status as variant_status
                FROM 
                    products p
                JOIN 
                    product_variants pv ON p.id = pv.product_id
                WHERE 
                    p.deleted_at IS NULL
                ORDER BY 
                    p.name ASC, pv.variant_name ASC
            ";
            
            $results = $this->database->fetchAll($sql);
            
            // Organize data by product
            $productsWithSkus = [];
            $productMap = [];
            
            foreach ($results as $row) {
                $productId = $row['product_id'];
                
                // If this is the first variant for this product, create the product entry
                if (!isset($productMap[$productId])) {
                    $productMap[$productId] = count($productsWithSkus);
                    $productsWithSkus[] = [
                        'id' => $productId,
                        'name' => $row['product_name'],
                        'slug' => $row['product_slug'],
                        'status' => $row['product_status'],
                        'variants' => []
                    ];
                }
                
                // Add variant to the product
                $productIndex = $productMap[$productId];
                $productsWithSkus[$productIndex]['variants'][] = [
                    'id' => $row['variant_id'],
                    'name' => $row['variant_name'],
                    'sku' => $row['sku'],
                    'status' => $row['variant_status']
                ];
            }
            
            return $productsWithSkus;
        } catch (Exception $e) {
            error_log("Error in getAllProductSkus: " . $e->getMessage());
            error_log("Stack trace: " . $e->getTraceAsString());
            throw new Exception('Error retrieving product SKUs: ' . $e->getMessage());
        }
    }

    // Add this new method after the getAllProductSkus method

    /**
     * Check if a product name already exists
     *
     * @param string $name Product name to check
     * @param int|null $excludeProductId Product ID to exclude from check
     * @return bool True if name exists, false otherwise
     */
    public function checkProductNameExists($name, $excludeProductId = null)
    {
        try {
            $slug = strtolower($name);
            $slug = preg_replace('/[^a-z0-9]+/', '-', $slug);
            $slug = trim($slug, '-');
            
            $sql = "SELECT id FROM products WHERE (name = :name OR slug = :slug)";
            $params = [':name' => $name, ':slug' => $slug];
            
            if ($excludeProductId) {
                $sql .= " AND id != :id";
                $params[':id'] = $excludeProductId;
            }
            
            $sql .= " AND deleted_at IS NULL LIMIT 1";
            
            $result = $this->database->fetch($sql, $params);
            
            return $result ? true : false;
        } catch (Exception $e) {
            error_log("Error in checkProductNameExists: " . $e->getMessage());
            throw new Exception('Error checking product name: ' . $e->getMessage());
        }
    }
}
