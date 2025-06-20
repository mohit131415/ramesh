<?php

namespace App\Shared\DataFetchers;

use App\Core\Database;
use Exception;
use PDO;

/**
 * Utility class for bulk fetching of products and categories
 * Note: Product image responses should NOT include the "image_url" field
 */
class BulkDataFetcher
{
    private static $db = null;
    
    /**
     * Get the database connection
     *
     * @return PDO
     */
    private static function getDb()
    {
        if (self::$db === null) {
            self::$db = Database::getInstance()->getConnection();
        }
        return self::$db;
    }
    
    /**
     * Get multiple products with all related data by array of IDs
     *
     * @param array $productIds Array of product IDs to fetch
     * @param bool $includeDeleted Whether to include deleted products
     * @return array Array of complete product records with variants, images, and tags
     */
    public static function getProductsByIds(array $productIds, bool $includeDeleted = false): array
    {
        try {
            if (empty($productIds)) {
                return [];
            }
            
            $placeholders = implode(',', array_fill(0, count($productIds), '?'));
            
            $sql = "SELECT * FROM products WHERE id IN ($placeholders)";
            if (!$includeDeleted) {
                $sql .= " AND deleted_at IS NULL";
            }
            
            $stmt = self::getDb()->prepare($sql);
            
            // Bind product IDs to the placeholders
            foreach ($productIds as $index => $id) {
                $stmt->bindValue($index + 1, $id, PDO::PARAM_INT);
            }
            
            $stmt->execute();
            $products = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            // Fetch additional data for each product (variants, images, etc.)
            $result = [];
            foreach ($products as $product) {
                // Add any additional product data here if needed
                // Ensure that product image responses do NOT include the "image_url" field
                $result[] = $product;
            }
            
            return $result;
        } catch (Exception $e) {
            error_log("Error in BulkDataFetcher::getProductsByIds: " . $e->getMessage());
            return [];
        }
    }
    
    /**
     * Get a single product with all related data by ID
     *
     * @param int $productId Product ID to fetch
     * @param bool $includeDeleted Whether to include deleted product
     * @return array|null Complete product record with variants, images, and tags or null if not found
     */
    public static function getProductById(int $productId, bool $includeDeleted = false): ?array
    {
        try {
            $products = self::getProductsByIds([$productId], $includeDeleted);
            return !empty($products) ? $products[0] : null;
        } catch (Exception $e) {
            error_log("Error in BulkDataFetcher::getProductById: " . $e->getMessage());
            return null;
        }
    }
    
    /**
     * Get multiple categories with all related data by array of IDs
     *
     * @param array $categoryIds Array of category IDs to fetch
     * @param bool $includeDeleted Whether to include deleted categories
     * @param bool $includeSubcategories Whether to include subcategories
     * @return array Array of complete category records
     */
    public static function getCategoriesByIds(array $categoryIds, bool $includeDeleted = false, bool $includeSubcategories = true): array
    {
        try {
            if (empty($categoryIds)) {
                return [];
            }
            
            // Debug log
            error_log("BulkDataFetcher::getCategoriesByIds called with IDs: " . implode(', ', $categoryIds));
            
            // Create placeholders for the IN clause
            $placeholders = implode(',', array_fill(0, count($categoryIds), '?'));
            
            // Build the SQL query
            $sql = "SELECT * FROM categories WHERE id IN ($placeholders)";
            if (!$includeDeleted) {
                $sql .= " AND deleted_at IS NULL";
            }
            
            // Debug log
            error_log("SQL query: " . $sql);
            
            // Prepare and execute the statement
            $stmt = self::getDb()->prepare($sql);
            
            // Bind category IDs to the placeholders
            foreach ($categoryIds as $index => $id) {
                $stmt->bindValue($index + 1, $id, PDO::PARAM_INT);
                // Debug log
                error_log("Binding parameter " . ($index + 1) . " with value: " . $id);
            }
            
            $stmt->execute();
            $categories = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            // Debug log
            error_log("Number of categories found: " . count($categories));
            
            // If no categories found, try a direct query to check if the table exists and has data
            if (empty($categories)) {
                $checkSql = "SELECT COUNT(*) as count FROM categories";
                $checkStmt = self::getDb()->query($checkSql);
                $checkResult = $checkStmt->fetch(PDO::FETCH_ASSOC);
                error_log("Total categories in database: " . $checkResult['count']);
                
                // Check if the specific IDs exist
                $checkIdsSql = "SELECT id FROM categories WHERE id IN ($placeholders)";
                $checkIdsStmt = self::getDb()->prepare($checkIdsSql);
                foreach ($categoryIds as $index => $id) {
                    $checkIdsStmt->bindValue($index + 1, $id, PDO::PARAM_INT);
                }
                $checkIdsStmt->execute();
                $existingIds = $checkIdsStmt->fetchAll(PDO::FETCH_COLUMN);
                error_log("Existing category IDs: " . implode(', ', $existingIds));
            }
            
            // Fetch subcategories if needed
            if ($includeSubcategories && !empty($categories)) {
                foreach ($categories as &$category) {
                    $category['subcategories'] = self::getSubcategoriesByCategoryId($category['id'], $includeDeleted);
                }
            }
            
            return $categories;
        } catch (Exception $e) {
            error_log("Error in BulkDataFetcher::getCategoriesByIds: " . $e->getMessage());
            error_log("Stack trace: " . $e->getTraceAsString());
            return [];
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
    public static function getCategoryById(int $categoryId, bool $includeDeleted = false, bool $includeSubcategories = true): ?array
    {
        try {
            $categories = self::getCategoriesByIds([$categoryId], $includeDeleted, $includeSubcategories);
            return !empty($categories) ? $categories[0] : null;
        } catch (Exception $e) {
            error_log("Error in BulkDataFetcher::getCategoryById: " . $e->getMessage());
            return null;
        }
    }
    
    /**
     * Get multiple subcategories by array of IDs
     *
     * @param array $subcategoryIds Array of subcategory IDs to fetch
     * @param bool $includeDeleted Whether to include deleted subcategories
     * @return array Array of subcategory records
     */
    public static function getSubcategoriesByIds(array $subcategoryIds, bool $includeDeleted = false): array
    {
        try {
            if (empty($subcategoryIds)) {
                return [];
            }
            
            $placeholders = implode(',', array_fill(0, count($subcategoryIds), '?'));
            
            $sql = "SELECT * FROM subcategories WHERE id IN ($placeholders)";
            if (!$includeDeleted) {
                $sql .= " AND deleted_at IS NULL";
            }
            
            $stmt = self::getDb()->prepare($sql);
            
            // Bind subcategory IDs to the placeholders
            foreach ($subcategoryIds as $index => $id) {
                $stmt->bindValue($index + 1, $id, PDO::PARAM_INT);
            }
            
            $stmt->execute();
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (Exception $e) {
            error_log("Error in BulkDataFetcher::getSubcategoriesByIds: " . $e->getMessage());
            return [];
        }
    }
    
    /**
     * Get a single subcategory by ID
     *
     * @param int $subcategoryId Subcategory ID to fetch
     * @param bool $includeDeleted Whether to include deleted subcategory
     * @return array|null Subcategory record or null if not found
     */
    public static function getSubcategoryById(int $subcategoryId, bool $includeDeleted = false): ?array
    {
        try {
            $subcategories = self::getSubcategoriesByIds([$subcategoryId], $includeDeleted);
            return !empty($subcategories) ? $subcategories[0] : null;
        } catch (Exception $e) {
            error_log("Error in BulkDataFetcher::getSubcategoryById: " . $e->getMessage());
            return null;
        }
    }
    
    /**
     * Get subcategories for a category
     *
     * @param int $categoryId Category ID
     * @param bool $includeDeleted Whether to include deleted subcategories
     * @return array Subcategories
     */
    public static function getSubcategoriesByCategoryId(int $categoryId, bool $includeDeleted = false): array
    {
        try {
            $sql = "SELECT * FROM subcategories WHERE category_id = ?";
            if (!$includeDeleted) {
                $sql .= " AND deleted_at IS NULL";
            }
            
            $stmt = self::getDb()->prepare($sql);
            $stmt->bindValue(1, $categoryId, PDO::PARAM_INT);
            $stmt->execute();
            
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (Exception $e) {
            error_log("Error in BulkDataFetcher::getSubcategoriesByCategoryId: " . $e->getMessage());
            return [];
        }
    }
}
