<?php

namespace App\Features\Open\Categories\DataAccess;

use App\Core\Database;
use App\Shared\Exceptions\NotFoundException;
use Exception;

class PublicCategoryRepository
{
    private $database;

    public function __construct()
    {
        $this->database = Database::getInstance();
    }

    /**
     * Get all active categories that have at least one product
     *
     * @param int $page Page number
     * @param int $limit Items per page
     * @param array $filters Optional filters
     * @return array Categories and pagination metadata
     */
    public function getAllCategories($page = 1, $limit = 10, $filters = [])
    {
        try {
            $offset = ($page - 1) * $limit;
            $whereConditions = ["c.status = 'active'", "c.deleted_at IS NULL"];
            $params = [];

            // Apply filters if provided
            if (!empty($filters['search'])) {
                $searchTerm = $this->database->getConnection()->quote('%' . $filters['search'] . '%');
                $whereConditions[] = "(c.name LIKE $searchTerm OR c.description LIKE $searchTerm OR c.slug LIKE $searchTerm)";
            }

            // Build WHERE clause
            $whereClause = !empty($whereConditions) ? "WHERE " . implode(' AND ', $whereConditions) : "";

            // Get total count for pagination - only count categories with at least one product
            $countSql = "SELECT COUNT(DISTINCT c.id) as total 
                         FROM categories c 
                         JOIN products p ON p.category_id = c.id 
                         WHERE p.status = 'active' AND p.deleted_at IS NULL 
                         AND c.status = 'active' AND c.deleted_at IS NULL";
            
            $countResult = $this->database->fetch($countSql);
            $total = $countResult['total'] ?? 0;

            // Get categories with pagination - only get categories with at least one product
            $sql = "SELECT DISTINCT
                        c.id, c.name, c.slug, c.description, c.image, 
                        c.meta_title, c.meta_description, c.meta_keywords,
                        c.status, c.display_order, c.created_at
                    FROM categories c
                    JOIN products p ON p.category_id = c.id
                    WHERE p.status = 'active' AND p.deleted_at IS NULL
                    AND c.status = 'active' AND c.deleted_at IS NULL
                    ORDER BY c.display_order ASC, c.name ASC
                    LIMIT $limit OFFSET $offset";

            $categories = $this->database->fetchAll($sql);

            // Process categories data
            foreach ($categories as &$category) {
                // Remove image_url generation - as requested
                // We're keeping the original image field but not adding the image_url
                
                // Get product count for this category
                $productCountSql = "SELECT COUNT(*) as count 
                                   FROM products 
                                   WHERE category_id = :category_id 
                                   AND status = 'active' 
                                   AND deleted_at IS NULL";
                
                $productCount = $this->database->fetch($productCountSql, [':category_id' => $category['id']]);
                $category['product_count'] = $productCount['count'] ?? 0;
                
                // Get subcategories for this category
                $subcategoriesSql = "SELECT 
                                        s.id, s.name, s.slug, s.description, s.image,
                                        s.meta_title, s.meta_description, s.meta_keywords,
                                        s.status, s.display_order
                                    FROM subcategories s
                                    JOIN products p ON p.subcategory_id = s.id
                                    WHERE s.category_id = :category_id 
                                    AND s.status = 'active' 
                                    AND s.deleted_at IS NULL
                                    AND p.status = 'active'
                                    AND p.deleted_at IS NULL
                                    GROUP BY s.id
                                    ORDER BY s.display_order ASC, s.name ASC";
                
                $subcategories = $this->database->fetchAll($subcategoriesSql, [':category_id' => $category['id']]);
                
                // Process subcategories
                foreach ($subcategories as &$subcategory) {
                    // Remove image_url generation for subcategories as well
                    // We're keeping the original image field but not adding the image_url
                    
                    // Get product count for this subcategory
                    $subProductCountSql = "SELECT COUNT(*) as count 
                                          FROM products 
                                          WHERE subcategory_id = :subcategory_id 
                                          AND status = 'active' 
                                          AND deleted_at IS NULL";
                    
                    $subProductCount = $this->database->fetch($subProductCountSql, [':subcategory_id' => $subcategory['id']]);
                    $subcategory['product_count'] = $subProductCount['count'] ?? 0;
                }
                
                $category['subcategories'] = $subcategories;
                $category['subcategories_count'] = count($subcategories);
            }

            return [
                'data' => $categories,
                'meta' => [
                    'current_page' => $page,
                    'per_page' => $limit,
                    'total' => $total,
                    'total_pages' => ceil($total / $limit)
                ]
            ];
        } catch (Exception $e) {
            error_log("Error in getAllCategories: " . $e->getMessage());
            error_log("Stack trace: " . $e->getTraceAsString());
            throw new Exception('Error retrieving categories: ' . $e->getMessage());
        }
    }
}
