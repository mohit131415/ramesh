<?php

namespace App\Shared\DataFetchers;

use App\Core\Database;
use Exception;
use PDO;

/**
 * Utility class for fetching category data with all related information
 */
class CategoryDataFetcher
{
    private $database;

    public function __construct()
    {
        $this->database = Database::getInstance();
    }

    /**
     * Get multiple categories with all related data by array of IDs
     *
     * @param array $categoryIds Array of category IDs to fetch
     * @param bool $includeDeleted Whether to include deleted categories
     * @param bool $includeSubcategories Whether to include subcategories
     * @return array Array of complete category records
     */
    public function getCategoriesByIds(array $categoryIds, bool $includeDeleted = false, bool $includeSubcategories = true): array
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
                    p.id as parent_id, p.name as parent_name, p.slug as parent_slug,
                    creator.id as creator_id, CONCAT(creator.first_name, ' ', creator.last_name) as created_by_name,
                    updater.id as updater_id, CONCAT(updater.first_name, ' ', updater.last_name) as updated_by_name,
                    deleter.id as deleter_id, CONCAT(deleter.first_name, ' ', deleter.last_name) as deleted_by_name
                FROM categories c
                LEFT JOIN categories p ON c.parent_id = p.id
                LEFT JOIN admins creator ON c.created_by = creator.id
                LEFT JOIN admins updater ON c.updated_by = updater.id
                LEFT JOIN admins deleter ON c.deleted_by = deleter.id
                WHERE $whereClause
                ORDER BY c.display_order ASC, c.id ASC";

            // Execute the query with the category IDs as parameters
            $stmt = $this->database->getConnection()->prepare($sql);
            
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
                
                // Clean up null values for deleted info if not deleted
                if (empty($category['deleted_at'])) {
                    $category['deleted_by_name'] = null;
                    $category['deleter_id'] = null;
                }
                
                // Clean up null values for updated info if not updated
                if (empty($category['updated_at'])) {
                    $category['updated_by_name'] = null;
                    $category['updater_id'] = null;
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
                
                // Get subcategories if requested
                if ($includeSubcategories) {
                    $category['subcategories'] = $this->getSubcategoriesByCategoryId($category['id'], $includeDeleted);
                }
                
                // Add image URL if image exists
                if (!empty($category['image'])) {
                    $baseUrl = isset($_SERVER['HTTP_HOST']) ? 
                           ((isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? "https://" : "http://") . $_SERVER['HTTP_HOST']) : 
                           '';
                
                    // If the image path already starts with http, don't add the base URL
                    if (strpos($category['image'], 'http') !== 0) {
                        $category['image_url'] = $baseUrl . '/' . ltrim($category['image'], '/');
                    } else {
                        $category['image_url'] = $category['image'];
                    }
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
     * Get a single category with all related data by ID
     *
     * @param int $categoryId Category ID to fetch
     * @param bool $includeDeleted Whether to include deleted category
     * @param bool $includeSubcategories Whether to include subcategories
     * @return array|null Complete category record or null if not found
     */
    public function getCategoryById(int $categoryId, bool $includeDeleted = false, bool $includeSubcategories = true): ?array
    {
        $categories = $this->getCategoriesByIds([$categoryId], $includeDeleted, $includeSubcategories);
        return !empty($categories) ? $categories[0] : null;
    }
    
    /**
     * Get subcategories for a category
     *
     * @param int $categoryId Category ID
     * @param bool $includeDeleted Whether to include deleted subcategories
     * @return array Subcategories
     */
    public function getSubcategoriesByCategoryId(int $categoryId, bool $includeDeleted = false): array
    {
        try {
            // Build WHERE clause
            $whereClause = "s.category_id = ?";
            if (!$includeDeleted) {
                $whereClause .= " AND s.deleted_at IS NULL";
            }

            $sql = "SELECT 
                    s.*, 
                    creator.id as creator_id, CONCAT(creator.first_name, ' ', creator.last_name) as created_by_name,
                    updater.id as updater_id, CONCAT(updater.first_name, ' ', updater.last_name) as updated_by_name,
                    deleter.id as deleter_id, CONCAT(deleter.first_name, ' ', deleter.last_name) as deleted_by_name
                FROM subcategories s
                LEFT JOIN admins creator ON s.created_by = creator.id
                LEFT JOIN admins updater ON s.updated_by = updater.id
                LEFT JOIN admins deleter ON s.deleted_by = deleter.id
                WHERE $whereClause
                ORDER BY s.display_order ASC, s.id ASC";

            $stmt = $this->database->getConnection()->prepare($sql);
            $stmt->bindValue(1, $categoryId, PDO::PARAM_INT);
            $stmt->execute();
            $subcategories = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            // Process each subcategory
            foreach ($subcategories as &$subcategory) {
                // Format dates
                $subcategory['created_at_formatted'] = date('Y-m-d H:i:s', strtotime($subcategory['created_at']));
                if (!empty($subcategory['updated_at'])) {
                    $subcategory['updated_at_formatted'] = date('Y-m-d H:i:s', strtotime($subcategory['updated_at']));
                }
                if (!empty($subcategory['deleted_at'])) {
                    $subcategory['deleted_at_formatted'] = date('Y-m-d H:i:s', strtotime($subcategory['deleted_at']));
                }
                
                // Clean up null values for deleted info if not deleted
                if (empty($subcategory['deleted_at'])) {
                    $subcategory['deleted_by_name'] = null;
                    $subcategory['deleter_id'] = null;
                }
                
                // Clean up null values for updated info if not updated
                if (empty($subcategory['updated_at'])) {
                    $subcategory['updated_by_name'] = null;
                    $subcategory['updater_id'] = null;
                }
                
                // Add image URL if image exists
                if (!empty($subcategory['image'])) {
                    $baseUrl = isset($_SERVER['HTTP_HOST']) ? 
                           ((isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? "https://" : "http://") . $_SERVER['HTTP_HOST']) : 
                           '';
                
                    // If the image path already starts with http, don't add the base URL
                    if (strpos($subcategory['image'], 'http') !== 0) {
                        $subcategory['image_url'] = $baseUrl . '/' . ltrim($subcategory['image'], '/');
                    } else {
                        $subcategory['image_url'] = $subcategory['image'];
                    }
                }
                
                // Remove redundant fields
                unset($subcategory['creator_id'], $subcategory['updater_id'], $subcategory['deleter_id']);
            }
            
            return $subcategories;
        } catch (Exception $e) {
            error_log("Error in getSubcategoriesByCategoryId: " . $e->getMessage());
            return [];
        }
    }
    
    /**
     * Get multiple subcategories by array of IDs
     *
     * @param array $subcategoryIds Array of subcategory IDs to fetch
     * @param bool $includeDeleted Whether to include deleted subcategories
     * @return array Array of subcategory records
     */
    public function getSubcategoriesByIds(array $subcategoryIds, bool $includeDeleted = false): array
    {
        if (empty($subcategoryIds)) {
            return [];
        }

        try {
            // Create placeholders for the IN clause
            $placeholders = implode(',', array_fill(0, count($subcategoryIds), '?'));
            
            // Build WHERE clause
            $whereClause = "s.id IN ($placeholders)";
            if (!$includeDeleted) {
                $whereClause .= " AND s.deleted_at IS NULL";
            }

            $sql = "SELECT 
                    s.*, 
                    c.name as category_name, c.slug as category_slug,
                    creator.id as creator_id, CONCAT(creator.first_name, ' ', creator.last_name) as created_by_name,
                    updater.id as updater_id, CONCAT(updater.first_name, ' ', updater.last_name) as updated_by_name,
                    deleter.id as deleter_id, CONCAT(deleter.first_name, ' ', deleter.last_name) as deleted_by_name
                FROM subcategories s
                LEFT JOIN categories c ON s.category_id = c.id
                LEFT JOIN admins creator ON s.created_by = creator.id
                LEFT JOIN admins updater ON s.updated_by = updater.id
                LEFT JOIN admins deleter ON s.deleted_by = deleter.id
                WHERE $whereClause
                ORDER BY s.display_order ASC, s.id ASC";

            // Execute the query with the subcategory IDs as parameters
            $stmt = $this->database->getConnection()->prepare($sql);
            
            // Bind all subcategory IDs as parameters
            foreach ($subcategoryIds as $index => $id) {
                $stmt->bindValue($index + 1, $id, PDO::PARAM_INT);
            }
            
            $stmt->execute();
            $subcategories = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            // Process each subcategory
            $result = [];
            foreach ($subcategories as $subcategory) {
                // Format dates
                $subcategory['created_at_formatted'] = date('Y-m-d H:i:s', strtotime($subcategory['created_at']));
                if (!empty($subcategory['updated_at'])) {
                    $subcategory['updated_at_formatted'] = date('Y-m-d H:i:s', strtotime($subcategory['updated_at']));
                }
                if (!empty($subcategory['deleted_at'])) {
                    $subcategory['deleted_at_formatted'] = date('Y-m-d H:i:s', strtotime($subcategory['deleted_at']));
                }
                
                // Clean up null values for deleted info if not deleted
                if (empty($subcategory['deleted_at'])) {
                    $subcategory['deleted_by_name'] = null;
                    $subcategory['deleter_id'] = null;
                }
                
                // Clean up null values for updated info if not updated
                if (empty($subcategory['updated_at'])) {
                    $subcategory['updated_by_name'] = null;
                    $subcategory['updater_id'] = null;
                }
                
                // Structure category data
                if (!empty($subcategory['category_id'])) {
                    $subcategory['category'] = [
                        'id' => $subcategory['category_id'],
                        'name' => $subcategory['category_name'],
                        'slug' => $subcategory['category_slug']
                    ];
                } else {
                    $subcategory['category'] = null;
                }
                
                // Add image URL if image exists
                if (!empty($subcategory['image'])) {
                    $baseUrl = isset($_SERVER['HTTP_HOST']) ? 
                           ((isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? "https://" : "http://") . $_SERVER['HTTP_HOST']) : 
                           '';
                
                    // If the image path already starts with http, don't add the base URL
                    if (strpos($subcategory['image'], 'http') !== 0) {
                        $subcategory['image_url'] = $baseUrl . '/' . ltrim($subcategory['image'], '/');
                    } else {
                        $subcategory['image_url'] = $subcategory['image'];
                    }
                }
                
                // Remove redundant fields
                unset($subcategory['category_name'], $subcategory['category_slug']);
                
                $result[] = $subcategory;
            }
            
            return $result;
        } catch (Exception $e) {
            error_log("Error in getSubcategoriesByIds: " . $e->getMessage());
            error_log("Stack trace: " . $e->getTraceAsString());
            throw new Exception("Failed to retrieve subcategories: " . $e->getMessage());
        }
    }
    
    /**
     * Get a single subcategory by ID
     *
     * @param int $subcategoryId Subcategory ID to fetch
     * @param bool $includeDeleted Whether to include deleted subcategory
     * @return array|null Subcategory record or null if not found
     */
    public function getSubcategoryById(int $subcategoryId, bool $includeDeleted = false): ?array
    {
        $subcategories = $this->getSubcategoriesByIds([$subcategoryId], $includeDeleted);
        return !empty($subcategories) ? $subcategories[0] : null;
    }
}
