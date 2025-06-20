<?php

namespace App\Shared\DataFetchers;

use App\Core\Database;
use Exception;
use PDO;

/**
 * Utility class for fetching product data with all related information
 */
class ProductDataFetcher
{
    private $db;

    public function __construct()
    {
        $this->db = Database::getInstance()->getConnection();
    }

    /**
     * Get multiple products with all related data by array of IDs
     *
     * @param array $productIds Array of product IDs to fetch
     * @param bool $includeDeleted Whether to include deleted products
     * @return array Array of complete product records with variants, images, and tags
     */
    public function getProductsByIds(array $productIds, bool $includeDeleted = false): array
    {
        if (empty($productIds)) {
            return [];
        }

        try {
            // Create placeholders for the IN clause
            $placeholders = implode(',', array_fill(0, count($productIds), '?'));
            
            // Build WHERE clause
            $whereClause = "p.id IN ($placeholders)";
            if (!$includeDeleted) {
                $whereClause .= " AND p.deleted_at IS NULL";
            }

            // Get products with basic data
            $sql = "SELECT 
                    p.id, p.category_id, p.subcategory_id, p.name, p.slug, p.description, p.short_description,
                    p.hsn_code, p.tax_rate, p.cgst_rate, p.sgst_rate, p.igst_rate, p.status, p.display_order,
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
                    s.status as subcategory_status, s.display_order as subcategory_display_order
                FROM products p
                LEFT JOIN categories c ON p.category_id = c.id
                LEFT JOIN subcategories s ON p.subcategory_id = s.id
                WHERE $whereClause
                ORDER BY FIELD(p.id, $placeholders)";

            // Execute the query with the product IDs as parameters
            $stmt = $this->db->prepare($sql);
            
            // Bind all product IDs as parameters (twice - once for WHERE, once for ORDER BY)
            foreach ($productIds as $index => $id) {
                $stmt->bindValue($index + 1, $id, PDO::PARAM_INT);
                $stmt->bindValue($index + 1 + count($productIds), $id, PDO::PARAM_INT);
            }
            
            $stmt->execute();
            $products = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            // Process each product to include variants, images, and tags
            $result = [];
            foreach ($products as $product) {
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
                
                $result[] = $product;
            }
            
            return $result;
        } catch (Exception $e) {
            error_log("Error in getProductsByIds: " . $e->getMessage());
            error_log("Stack trace: " . $e->getTraceAsString());
            throw new Exception("Failed to retrieve products: " . $e->getMessage());
        }
    }
    
    /**
     * Get a single product with all related data by ID
     *
     * @param int $productId Product ID to fetch
     * @param bool $includeDeleted Whether to include deleted product
     * @return array|null Complete product record with variants, images, and tags or null if not found
     */
    public function getProductById(int $productId, bool $includeDeleted = false): ?array
    {
        $products = $this->getProductsByIds([$productId], $includeDeleted);
        return !empty($products) ? $products[0] : null;
    }
    
    /**
     * Get multiple categories by array of IDs
     *
     * @param array $categoryIds Array of category IDs to fetch
     * @param bool $includeDeleted Whether to include deleted categories
     * @return array Array of category records
     */
    public function getCategoriesByIds(array $categoryIds, bool $includeDeleted = false): array
    {
        if (empty($categoryIds)) {
            return [];
        }

        try {
            // Create placeholders for the IN clause
            $placeholders = implode(',', array_fill(0, count($categoryIds), '?'));
            
            // Build WHERE clause
            $whereClause = "c.id IN ($placeholders)";
            if (!$includeDeleted) {
                $whereClause .= " AND c.deleted_at IS NULL";
            }

            // Get categories with parent info
            $sql = "SELECT 
                    c.*, 
                    p.id as parent_id, p.name as parent_name, p.slug as parent_slug
                FROM categories c
                LEFT JOIN categories p ON c.parent_id = p.id
                WHERE $whereClause
                ORDER BY c.display_order ASC, c.id ASC";

            // Execute the query with the category IDs as parameters
            $stmt = $this->db->prepare($sql);
            
            // Bind all category IDs as parameters
            foreach ($categoryIds as $index => $id) {
                $stmt->bindValue($index + 1, $id, PDO::PARAM_INT);
            }
            
            $stmt->execute();
            $categories = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            // Process each category
            $result = [];
            foreach ($categories as $category) {
                // Format dates
                $category['created_at_formatted'] = date('Y-m-d H:i:s', strtotime($category['created_at']));
                if (!empty($category['updated_at'])) {
                    $category['updated_at_formatted'] = date('Y-m-d H:i:s', strtotime($category['updated_at']));
                }
                if (!empty($category['deleted_at'])) {
                    $category['deleted_at_formatted'] = date('Y-m-d H:i:s', strtotime($category['deleted_at']));
                }
                
                // Structure parent data if exists
                if (!empty($category['parent_id'])) {
                    $category['parent'] = [
                        'id' => $category['parent_id'],
                        'name' => $category['parent_name'],
                        'slug' => $category['parent_slug']
                    ];
                } else {
                    $category['parent'] = null;
                }
                
                // Remove redundant fields
                unset($category['parent_name'], $category['parent_slug']);
                
                $result[] = $category;
            }
            
            return $result;
        } catch (Exception $e) {
            error_log("Error in getCategoriesByIds: " . $e->getMessage());
            error_log("Stack trace: " . $e->getTraceAsString());
            throw new Exception("Failed to retrieve categories: " . $e->getMessage());
        }
    }
    
    /**
     * Get a single category by ID
     *
     * @param int $categoryId Category ID to fetch
     * @param bool $includeDeleted Whether to include deleted category
     * @return array|null Category record or null if not found
     */
    public function getCategoryById(int $categoryId, bool $includeDeleted = false): ?array
    {
        $categories = $this->getCategoriesByIds([$categoryId], $includeDeleted);
        return !empty($categories) ? $categories[0] : null;
    }
    
    /**
     * Get product variants for a product
     *
     * @param int $productId Product ID
     * @return array Product variants
     */
    private function getProductVariants(int $productId): array
    {
        $sql = "
            SELECT 
                pv.*
            FROM product_variants pv
            WHERE pv.product_id = ? AND pv.status = 'active'
            ORDER BY pv.display_order ASC, pv.id ASC
        ";
        
        try {
            $stmt = $this->db->prepare($sql);
            $stmt->bindValue(1, $productId, PDO::PARAM_INT);
            $stmt->execute();
            $variants = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            // Process variants to ensure proper format
            foreach ($variants as &$variant) {
                // Format dates
                if (!empty($variant['created_at'])) {
                    $variant['created_at_formatted'] = date('Y-m-d H:i:s', strtotime($variant['created_at']));
                }
                
                if (!empty($variant['updated_at'])) {
                    $variant['updated_at_formatted'] = date('Y-m-d H:i:s', strtotime($variant['updated_at']));
                }
                
                // Parse dimensions JSON if exists
                if (!empty($variant['dimensions'])) {
                    try {
                        $variant['dimensions_object'] = json_decode($variant['dimensions'], true);
                    } catch (Exception $e) {
                        $variant['dimensions_object'] = null;
                    }
                }
                
                // Remove redundant fields
                unset($variant['creator_id'], $variant['updater_id'], $variant['created_by_name'], $variant['updated_by_name']);
            }
            
            return $variants;
        } catch (Exception $e) {
            error_log("Error getting product variants: " . $e->getMessage());
            return [];
        }
    }
    
    /**
     * Get product images for a product
     *
     * @param int $productId Product ID
     * @return array Product images
     */
    private function getProductImages(int $productId): array
    {
        $sql = "
            SELECT id, product_id, image_path, is_primary, display_order, created_at, updated_at
            FROM product_images 
            WHERE product_id = ?
            ORDER BY is_primary DESC, display_order ASC, id ASC
        ";
        
        try {
            $stmt = $this->db->prepare($sql);
            $stmt->bindValue(1, $productId, PDO::PARAM_INT);
            $stmt->execute();
            $images = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            // Process images without adding image_url
            foreach ($images as &$image) {
                // Format dates only
                if (!empty($image['created_at'])) {
                    $image['created_at_formatted'] = date('Y-m-d H:i:s', strtotime($image['created_at']));
                }
                
                if (!empty($image['updated_at'])) {
                    $image['updated_at_formatted'] = date('Y-m-d H:i:s', strtotime($image['updated_at']));
                }
            }
            
            return $images;
        } catch (Exception $e) {
            error_log("Error getting product images: " . $e->getMessage());
            return [];
        }
    }
    
    /**
     * Get product tags for a product
     *
     * @param int $productId Product ID
     * @return array Product tags
     */
    private function getProductTags(int $productId): array
    {
        $sql = "
            SELECT t.* 
            FROM tags t
            JOIN product_tags pt ON t.id = pt.tag_id
            WHERE pt.product_id = ?
            ORDER BY t.name ASC
        ";
        
        try {
            $stmt = $this->db->prepare($sql);
            $stmt->bindValue(1, $productId, PDO::PARAM_INT);
            $stmt->execute();
            $tags = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            // Format dates
            foreach ($tags as &$tag) {
                if (!empty($tag['created_at'])) {
                    $tag['created_at_formatted'] = date('Y-m-d H:i:s', strtotime($tag['created_at']));
                }
                
                if (!empty($tag['updated_at'])) {
                    $tag['updated_at_formatted'] = date('Y-m-d H:i:s', strtotime($tag['updated_at']));
                }
            }
            
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
    private function processJsonFields(array $product): array
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
     * Get products by IDs with custom sorting
     * 
     * @param array $productIds Array of product IDs (optional, if not provided will get all products)
     * @param string $sortBy Sort option
     * @param int $limit Items per page
     * @param int $offset Offset for pagination
     * @return array Products with all related information
     */
    public function getProductsWithSorting(?array $productIds = null, string $sortBy = 'popular', int $limit = 12, int $offset = 0): array
    {
        try {
            // If no product IDs provided, return empty array
            if (empty($productIds)) {
                error_log("No product IDs provided to getProductsWithSorting");
                return [];
            }
            
            // Debug log
            error_log("getProductsWithSorting - Product IDs: " . json_encode($productIds));
            error_log("getProductsWithSorting - Sort By: " . $sortBy);
            error_log("getProductsWithSorting - Limit: " . $limit);
            error_log("getProductsWithSorting - Offset: " . $offset);
            
            // Get product data first
            $products = $this->getProductsByIds($productIds);
            
            // If no products found, return empty array
            if (empty($products)) {
                error_log("No products found for the given IDs");
                return [];
            }
            
            // Sort the products based on the sort option
            switch ($sortBy) {
                case 'price_low':
                    usort($products, function($a, $b) {
                        $aPrice = $this->getMinPrice($a['variants']);
                        $bPrice = $this->getMinPrice($b['variants']);
                        return $aPrice <=> $bPrice;
                    });
                    break;
                    
                case 'price_high':
                    usort($products, function($a, $b) {
                        $aPrice = $this->getMaxPrice($a['variants']);
                        $bPrice = $this->getMaxPrice($b['variants']);
                        return $bPrice <=> $aPrice;
                    });
                    break;
                    
                case 'name_asc':
                    usort($products, function($a, $b) {
                        return strcmp($a['name'], $b['name']);
                    });
                    break;
                    
                case 'name_desc':
                    usort($products, function($a, $b) {
                        return strcmp($b['name'], $a['name']);
                    });
                    break;
                    
                case 'newest':
                    usort($products, function($a, $b) {
                        return strtotime($b['created_at']) - strtotime($a['created_at']);
                    });
                    break;
                    
                case 'discount_low':
                    usort($products, function($a, $b) {
                        $aDiscount = $this->getMinDiscount($a['variants']);
                        $bDiscount = $this->getMinDiscount($b['variants']);
                        return $aDiscount <=> $bDiscount;
                    });
                    break;
                    
                case 'discount_high':
                    usort($products, function($a, $b) {
                        $aDiscount = $this->getMaxDiscount($a['variants']);
                        $bDiscount = $this->getMaxDiscount($b['variants']);
                        return $bDiscount <=> $aDiscount;
                    });
                    break;
                    
                case 'popular':
                default:
                    usort($products, function($a, $b) {
                        // Sort by display_order first, then by ID
                        if ($a['display_order'] == $b['display_order']) {
                            return $a['id'] - $b['id'];
                        }
                        return $a['display_order'] - $b['display_order'];
                    });
                    break;
            }
            
            // Debug log
            error_log("Sorted products count: " . count($products));
            
            // Return the sorted products
            return $products;
        } catch (Exception $e) {
            error_log("Error in getProductsWithSorting: " . $e->getMessage());
            error_log("Stack trace: " . $e->getTraceAsString());
            return [];
        }
    }
    
    /**
     * Get minimum price from product variants
     * 
     * @param array $variants Product variants
     * @return float Minimum price
     */
    private function getMinPrice(array $variants): float
    {
        if (empty($variants)) {
            return 0;
        }
        
        $prices = [];
        foreach ($variants as $variant) {
            if ($variant['sale_price'] > 0) {
                $prices[] = $variant['sale_price'];
            } else {
                $prices[] = $variant['price'];
            }
        }
        
        return !empty($prices) ? min($prices) : 0;
    }
    
    /**
     * Get maximum price from product variants
     * 
     * @param array $variants Product variants
     * @return float Maximum price
     */
    private function getMaxPrice(array $variants): float
    {
        if (empty($variants)) {
            return 0;
        }
        
        $prices = [];
        foreach ($variants as $variant) {
            if ($variant['sale_price'] > 0) {
                $prices[] = $variant['sale_price'];
            } else {
                $prices[] = $variant['price'];
            }
        }
        
        return !empty($prices) ? max($prices) : 0;
    }
    
    /**
     * Get minimum discount percentage from product variants
     * 
     * @param array $variants Product variants
     * @return float Minimum discount percentage
     */
    private function getMinDiscount(array $variants): float
    {
        if (empty($variants)) {
            return 0;
        }
        
        $discounts = [];
        foreach ($variants as $variant) {
            if ($variant['sale_price'] > 0 && $variant['price'] > 0) {
                $discounts[] = (($variant['price'] - $variant['sale_price']) / $variant['price']) * 100;
            } else {
                $discounts[] = 0;
            }
        }
        
        return !empty($discounts) ? min($discounts) : 0;
    }
    
    /**
     * Get maximum discount percentage from product variants
     * 
     * @param array $variants Product variants
     * @return float Maximum discount percentage
     */
    private function getMaxDiscount(array $variants): float
    {
        if (empty($variants)) {
            return 0;
        }
        
        $discounts = [];
        foreach ($variants as $variant) {
            if ($variant['sale_price'] > 0 && $variant['price'] > 0) {
                $discounts[] = (($variant['price'] - $variant['sale_price']) / $variant['price']) * 100;
            } else {
                $discounts[] = 0;
            }
        }
        
        return !empty($discounts) ? max($discounts) : 0;
    }
}
