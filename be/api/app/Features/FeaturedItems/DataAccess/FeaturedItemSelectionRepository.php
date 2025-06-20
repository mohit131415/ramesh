<?php

namespace App\Features\FeaturedItems\DataAccess;

use App\Core\Database;
use Exception;

class FeaturedItemSelectionRepository
{
    private $database;

    public function __construct()
    {
        $this->database = Database::getInstance();
    }

    /**
     * Get all products for featured item selection
     *
     * @param string $search Search term
     * @param string $displayType Display type (featured_product or quick_pick)
     * @return array Products with selection status
     */
    public function getAllProductsForSelection($search = '', $displayType = 'featured_product')
    {
        try {
            // Validate display type
            $validDisplayTypes = ['featured_product', 'quick_pick'];
            if (!in_array($displayType, $validDisplayTypes)) {
                throw new \InvalidArgumentException("Invalid display type. Must be one of: " . implode(', ', $validDisplayTypes));
            }

            // Build the WHERE clause for search
            $whereClause = "WHERE p.deleted_at IS NULL AND p.status = 'active'";
            $params = [];
            
            if (!empty($search)) {
                // Search only in product name
                $whereClause .= " AND p.name LIKE ?";
                $searchTerm = "%{$search}%";
                $params = [$searchTerm];
                error_log("FeaturedItemSelectionRepository: Applying search filter for product name: " . $search);
            }
            
            // Log the display type being used
            error_log("FeaturedItemSelectionRepository: Getting products for display_type: " . $displayType);
            
            // Only the fields you requested: id, name, image, is_featured
            $sql = "SELECT 
                    p.id,
                    p.name,
                    COALESCE(
                        (SELECT pi.image_path FROM product_images pi 
                         WHERE pi.product_id = p.id AND pi.is_primary = 1 
                         LIMIT 1),
                        (SELECT pi.image_path FROM product_images pi 
                         WHERE pi.product_id = p.id 
                         ORDER BY pi.id ASC 
                         LIMIT 1),
                        ''
                    ) as image,
                    CASE 
                        WHEN fi.id IS NOT NULL THEN 1 
                        ELSE 0 
                    END as is_featured
                FROM products p
                LEFT JOIN featured_items fi ON p.id = fi.entity_id 
                    AND fi.display_type = ?
                {$whereClause}
                ORDER BY 
                    CASE WHEN fi.id IS NOT NULL THEN 1 ELSE 0 END DESC, 
                    p.name ASC";
        
            // Add display_type parameter first, then search params
            $queryParams = array_merge([$displayType], $params);
        
            error_log("FeaturedItemSelectionRepository SQL: " . $sql);
            error_log("FeaturedItemSelectionRepository Params: " . json_encode($queryParams));
        
            $products = $this->database->fetchAll($sql, $queryParams);
        
            // Count featured vs non-featured for logging
            $featuredCount = count(array_filter($products, function($p) { return $p['is_featured'] == 1; }));
            $totalCount = count($products);
        
            error_log("FeaturedItemSelectionRepository: Found {$totalCount} products, {$featuredCount} are featured for display_type: {$displayType}" . (!empty($search) ? " with search: {$search}" : ""));
        
            return [
                'products' => $products,
                'display_type' => $displayType,
                'search_term' => $search,
                'total_count' => $totalCount,
                'featured_count' => $featuredCount
            ];
        
        } catch (Exception $e) {
            error_log("Error in getAllProductsForSelection: " . $e->getMessage());
            return [
                'products' => [],
                'error' => $e->getMessage()
            ];
        }
    }

    /**
     * Get all categories for featured item selection
     * Only includes categories that have at least one active product
     *
     * @param string $search Search term
     * @return array Categories with selection status
     */
    public function getAllCategoriesForSelection($search = '')
    {
        try {
            // Build the WHERE clause for search
            $whereClause = "WHERE c.deleted_at IS NULL AND c.status = 'active'";
            $params = [];
            
            if (!empty($search)) {
                // Search only in category name
                $whereClause .= " AND c.name LIKE ?";
                $searchTerm = "%{$search}%";
                $params = [$searchTerm];
                error_log("FeaturedItemSelectionRepository: Applying category search filter for: " . $search);
            }
            
            // Add condition to only include categories with at least one active product
            $whereClause .= " AND EXISTS (
                SELECT 1 FROM products p 
                WHERE p.category_id = c.id 
                AND p.deleted_at IS NULL 
                AND p.status = 'active'
            )";
            
            // Get categories with featured status and product count - simplified fields
            $sql = "SELECT 
                        c.id,
                        c.name,
                        COALESCE(c.image, '') as image,
                        COUNT(p.id) as product_count,
                        CASE 
                            WHEN fi.id IS NOT NULL THEN 1 
                            ELSE 0 
                        END as is_featured
                    FROM categories c
                    LEFT JOIN products p ON c.id = p.category_id AND p.deleted_at IS NULL AND p.status = 'active'
                    LEFT JOIN featured_items fi ON c.id = fi.entity_id AND fi.display_type = 'featured_category'
                    {$whereClause}
                    GROUP BY c.id, c.name, c.image, fi.id
                    HAVING product_count > 0
                    ORDER BY 
                        CASE WHEN fi.id IS NOT NULL THEN 1 ELSE 0 END DESC,
                        c.name ASC";
            
            error_log("FeaturedItemSelectionRepository Category SQL: " . $sql);
            error_log("FeaturedItemSelectionRepository Category Params: " . json_encode($params));
            
            $categories = $this->database->fetchAll($sql, $params);
            
            // Count featured vs non-featured for logging
            $featuredCount = count(array_filter($categories, function($c) { return $c['is_featured'] == 1; }));
            $totalCount = count($categories);
            
            error_log("FeaturedItemSelectionRepository: Found {$totalCount} categories, {$featuredCount} are featured" . (!empty($search) ? " with search: {$search}" : ""));
            
            return [
                'categories' => $categories,
                'search_term' => $search,
                'total_count' => $totalCount,
                'featured_count' => $featuredCount
            ];
            
        } catch (Exception $e) {
            error_log("Error in getAllCategoriesForSelection: " . $e->getMessage());
            return [
                'categories' => [],
                'error' => $e->getMessage()
            ];
        }
    }
}
