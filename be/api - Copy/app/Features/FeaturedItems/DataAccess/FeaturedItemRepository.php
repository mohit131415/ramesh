<?php

namespace App\Features\FeaturedItems\DataAccess;

use App\Core\Database;
use App\Shared\Exceptions\NotFoundException;
use Exception;

class FeaturedItemRepository
{
    private $database;
    private $tableName = 'featured_items';
    private $settingsTable = 'settings';

    public function __construct()
    {
        $this->database = Database::getInstance();
    }

    /**
     * Get all featured items
     *
     * @return array The featured items
     */
    public function getAllFeaturedItems()
    {
        try {
            $sql = "SELECT * FROM featured_items ORDER BY display_type, display_order";
            return $this->database->fetchAll($sql);
        } catch (Exception $e) {
            error_log("Error in getAllFeaturedItems: " . $e->getMessage());
            throw new Exception('Error retrieving featured items: ' . $e->getMessage());
        }
    }

    /**
     * Get featured items by their IDs
     *
     * @param array $ids Array of featured item IDs
     * @return array The featured items
     */
    public function getFeaturedItemsByIds($ids)
    {
        if (empty($ids)) {
            return [];
        }
        
        try {
            // Convert array of IDs to comma-separated string for IN clause
            $idPlaceholders = implode(',', array_fill(0, count($ids), '?'));
            
            $sql = "SELECT fi.*, 
                    CASE 
                        WHEN fi.display_type IN ('featured_product', 'quick_pick') THEN 
                            (SELECT name FROM products WHERE id = fi.entity_id LIMIT 1)
                        WHEN fi.display_type = 'featured_category' THEN 
                            (SELECT name FROM categories WHERE id = fi.entity_id LIMIT 1)
                        ELSE NULL
                    END as entity_name,
                    CASE 
                        WHEN fi.display_type IN ('featured_product', 'quick_pick') THEN 
                            (SELECT pi.image_path FROM product_images pi 
                             WHERE pi.product_id = fi.entity_id AND pi.is_primary = 1 
                         LIMIT 1)
                    ELSE NULL
                    END as primary_image
                    FROM {$this->tableName} fi
                    WHERE fi.id IN ({$idPlaceholders})
                    ORDER BY fi.display_type, fi.display_order";
            
            return $this->database->fetchAll($sql, $ids);
        } catch (Exception $e) {
            error_log("Error fetching featured items by IDs: " . $e->getMessage());
            return [];
        }
    }

    /**
     * Find which item IDs from the provided array don't exist in the database
     *
     * @param array $itemIds Array of featured item IDs to check
     * @return array Array of IDs that don't exist
     */
    public function findMissingItemIds($itemIds)
    {
        if (empty($itemIds)) {
            return [];
        }
        
        try {
            // Convert array of IDs to comma-separated string for IN clause
            $idPlaceholders = implode(',', array_fill(0, count($itemIds), '?'));
            
            $sql = "SELECT id FROM {$this->tableName} WHERE id IN ({$idPlaceholders})";
            $existingItems = $this->database->fetchAll($sql, $itemIds);
            
            // Extract just the IDs from the result
            $existingIds = array_column($existingItems, 'id');
            
            // Find IDs that are in the input array but not in the result
            return array_values(array_diff($itemIds, $existingIds));
        } catch (Exception $e) {
            error_log("Error finding missing item IDs: " . $e->getMessage());
            return $itemIds; // Return all IDs as missing on error
        }
    }

    /**
     * Get featured items by type - SIMPLIFIED VERSION
     *
     * @param string $displayType The type of featured items to retrieve
     * @return array The featured items with minimal data
     */
    public function getFeaturedItemsByType($displayType)
    {
        try {
            if ($displayType === 'featured_product' || $displayType === 'quick_pick') {
                return $this->getFeaturedProductsSimplified($displayType);
            } else if ($displayType === 'featured_category') {
                return $this->getFeaturedCategoriesSimplified();
            } else {
                // Fallback to generic query if type is not recognized
                $sql = "SELECT fi.id as featured_item_id,
                        fi.entity_id as id,
                        fi.display_order as position,
                        fi.display_type,
                        CASE 
                            WHEN fi.display_type IN ('featured_product', 'quick_pick') THEN 
                                (SELECT name FROM products WHERE id = fi.entity_id LIMIT 1)
                            WHEN fi.display_type = 'featured_category' THEN 
                                (SELECT name FROM categories WHERE id = fi.entity_id LIMIT 1)
                            ELSE NULL
                        END as name,
                        CASE 
                            WHEN fi.display_type IN ('featured_product', 'quick_pick') THEN 
                                (SELECT pi.image_path FROM product_images pi 
                                 WHERE pi.product_id = fi.entity_id AND pi.is_primary = 1 
                                 LIMIT 1) as image
                            WHEN fi.display_type = 'featured_category' THEN 
                                (SELECT image FROM categories WHERE id = fi.entity_id LIMIT 1)
                            ELSE NULL
                        END as image
                        FROM {$this->tableName} fi
                        WHERE fi.display_type = ?
                        ORDER BY fi.display_order";
                
                $items = $this->database->fetchAll($sql, [$displayType]);
                return $items;
            }
        } catch (Exception $e) {
            error_log("Error fetching featured items by type: " . $e->getMessage());
            return [];
        }
    }

    /**
     * Get featured products with minimal data - SIMPLIFIED VERSION
     *
     * @param string $displayType Either 'featured_product' or 'quick_pick'
     * @return array The featured products with minimal data
     */
    private function getFeaturedProductsSimplified($displayType)
    {
        try {
            $sql = "SELECT fi.id as featured_item_id,
                    fi.entity_id as id,
                    fi.display_order as position,
                    fi.display_type,
                    p.name,
                    (SELECT pi.image_path FROM product_images pi 
                     WHERE pi.product_id = fi.entity_id AND pi.is_primary = 1 
                     LIMIT 1) as image
                    FROM {$this->tableName} fi
                    INNER JOIN products p ON p.id = fi.entity_id AND p.deleted_at IS NULL
                    WHERE fi.display_type = ?
                    ORDER BY fi.display_order";
            
            return $this->database->fetchAll($sql, [$displayType]);
        } catch (Exception $e) {
            error_log("Error in getFeaturedProductsSimplified: " . $e->getMessage());
            return [];
        }
    }

    /**
     * Get featured categories with minimal data - SIMPLIFIED VERSION
     *
     * @return array The featured categories with minimal data
     */
    private function getFeaturedCategoriesSimplified()
    {
        try {
            $sql = "SELECT fi.id as featured_item_id,
                    fi.entity_id as id,
                    fi.display_order as position,
                    fi.display_type,
                    c.name,
                    c.image,
                    (SELECT COUNT(*) FROM products WHERE category_id = c.id AND deleted_at IS NULL) as product_count
                    FROM {$this->tableName} fi
                    INNER JOIN categories c ON c.id = fi.entity_id AND c.deleted_at IS NULL
                    WHERE fi.display_type = 'featured_category'
                    ORDER BY fi.display_order";
            
            return $this->database->fetchAll($sql);
        } catch (Exception $e) {
            error_log("Error in getFeaturedCategoriesSimplified: " . $e->getMessage());
            return [];
        }
    }

    /**
     * Get a featured item by ID
     *
     * @param int $id The ID of the featured item
     * @return array|null The featured item or null if not found
     */
    public function getFeaturedItem($id)
    {
        try {
            $sql = "SELECT * FROM featured_items WHERE id = ?";
            $result = $this->database->fetch($sql, [$id]);
            
            if (!$result) {
                throw new NotFoundException('Featured item not found');
            }
            
            return $result;
        } catch (NotFoundException $e) {
            throw $e;
        } catch (Exception $e) {
            error_log("Error in getFeaturedItem: " . $e->getMessage());
            throw new Exception('Error retrieving featured item: ' . $e->getMessage());
        }
    }

    /**
     * Check if an entity is already featured in a specific display type
     * 
     * IMPORTANT: This method allows the same product to be in both 'featured_product' and 'quick_pick'
     *
     * @param int $entityId The entity ID
     * @param string $displayType The display type
     * @return bool True if the entity is already featured in this display type
     */
    public function isEntityFeatured($entityId, $displayType)
    {
        try {
            // Check if this exact combination of entity_id and display_type already exists
            $sql = "SELECT COUNT(*) as count FROM {$this->tableName} 
                WHERE entity_id = ? AND display_type = ?";
        
            $result = $this->database->fetch($sql, [$entityId, $displayType]);
            return $result && $result['count'] > 0;
        } catch (Exception $e) {
            error_log("Error in isEntityFeatured: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Get an existing featured item by entity ID and display type
     *
     * @param int $entityId The entity ID
     * @param string $displayType The display type
     * @return array|null The existing featured item or null if not found
     */
    public function getExistingFeaturedItem($entityId, $displayType)
    {
        try {
            $sql = "SELECT * FROM {$this->tableName} 
                WHERE entity_id = ? AND display_type = ?";
        
            return $this->database->fetch($sql, [$entityId, $displayType]);
        } catch (Exception $e) {
            error_log("Error in getExistingFeaturedItem: " . $e->getMessage());
            return null;
        }
    }

    /**
     * Check if an entity is already featured in a specific display type, excluding a specific item
     *
     * @param int $entityId The entity ID
     * @param string $displayType The display type
     * @param int $excludeItemId The item ID to exclude from the check
     * @return bool True if the entity is already featured in this display type
     */
    public function isEntityFeaturedExcludingItem($entityId, $displayType, $excludeItemId = null)
    {
        try {
            $sql = "SELECT COUNT(*) as count FROM {$this->tableName} 
                    WHERE entity_id = ? AND display_type = ?";
            $params = [$entityId, $displayType];
            
            if ($excludeItemId) {
                $sql .= " AND id != ?";
                $params[] = $excludeItemId;
            }
            
            error_log("SQL Query: " . $sql);
            error_log("Params: " . json_encode($params));
            
            $result = $this->database->fetch($sql, $params);
            return ($result['count'] ?? 0) > 0;
        } catch (Exception $e) {
            error_log("Error in isEntityFeaturedExcludingItem: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Count featured items by type
     *
     * @param string $displayType The display type
     * @return int The count of featured items
     */
    public function countFeaturedItemsByType($displayType)
    {
        $sql = "SELECT COUNT(*) as count FROM {$this->tableName} 
                WHERE display_type = ?";
        
        try {
            $result = $this->database->fetch($sql, [$displayType]);
            return $result ? (int)$result['count'] : 0;
        } catch (Exception $e) {
            error_log("Error counting featured items by type: " . $e->getMessage());
            return 0;
        }
    }

    /**
     * Create a new featured item
     *
     * @param array $data The featured item data
     * @param int|null $userId The ID of the user creating the item
     * @return int The ID of the created item
     */
    public function createFeaturedItem($data, $userId = null)
    {
        try {
            // Get the next display order
            $nextOrder = $this->getNextDisplayOrder($data['display_type']);
            
            // Prepare data for insertion using direct SQL
            $sql = "INSERT INTO {$this->tableName} (entity_id, display_type, display_order, created_by, updated_by, created_at, updated_at) 
                    VALUES (?, ?, ?, ?, ?, NOW(), NOW())";
            
            $params = [
                $data['entity_id'],
                $data['display_type'],
                $data['display_order'] ?? $nextOrder,
                $userId,
                $userId
            ];
            
            // Execute the insert
            $result = $this->database->query($sql, $params);
            
            if ($result) {
                // Get the last inserted ID using a separate query
                $lastIdResult = $this->database->fetch("SELECT LAST_INSERT_ID() as id");
                $newId = $lastIdResult['id'] ?? null;
                
                if ($newId) {
                    // Log the activity if user ID is provided
                    if ($userId) {
                        $this->logActivity('featured_item_created', $userId, [
                            'featured_item_id' => $newId,
                            'entity_id' => $data['entity_id'],
                            'display_type' => $data['display_type']
                        ], $data); // Pass the original data as request data
                    }
                    return (int)$newId;
                }
            }
            
            throw new Exception('Failed to create featured item');
            
        } catch (Exception $e) {
            error_log("Error in createFeaturedItem: " . $e->getMessage());
            throw new Exception('Error creating featured item: ' . $e->getMessage());
        }
    }

    /**
     * Update a featured item
     *
     * @param int $id The ID of the featured item
     * @param array $data The updated featured item data
     * @param int|null $userId The ID of the user updating the item
     * @return bool True if successful
     */
    public function updateFeaturedItem($id, $data, $userId = null)
    {
        try {
            $updateFields = [];
            $params = [];
            
            if (isset($data['entity_id'])) {
                $updateFields[] = "entity_id = ?";
                $params[] = $data['entity_id'];
            }
            
            if (isset($data['display_type'])) {
                $updateFields[] = "display_type = ?";
                $params[] = $data['display_type'];
            }
            
            if (isset($data['display_order'])) {
                $updateFields[] = "display_order = ?";
                $params[] = $data['display_order'];
            }
            
            if ($userId) {
                $updateFields[] = "updated_by = ?";
                $params[] = $userId;
            }
            
            $updateFields[] = "updated_at = ?";
            $params[] = date('Y-m-d H:i:s');
            
            $params[] = $id;
            
            $sql = "UPDATE featured_items SET " . implode(', ', $updateFields) . " WHERE id = ?";
            
            error_log("SQL Query: " . $sql);
            error_log("Params: " . json_encode($params));
            
            $result = $this->database->query($sql, $params);
            
            if ($result && $result->rowCount() > 0) {
                // Log the activity if user ID is provided
                if ($userId) {
                    $this->logActivity('featured_item_updated', $userId, [
                        'featured_item_id' => $id,
                        'updated_fields' => array_keys($data)
                    ], $data); // Pass the update data as request data
                }
                return true;
            } else {
                throw new NotFoundException('Featured item not found or no changes made');
            }
            
        } catch (NotFoundException $e) {
            throw $e;
        } catch (Exception $e) {
            error_log("Error in updateFeaturedItem: " . $e->getMessage());
            throw new Exception('Error updating featured item: ' . $e->getMessage());
        }
    }

    /**
     * Get items that need to be reordered after deletion
     *
     * @param string $displayType The display type
     * @param int $deletedDisplayOrder The display order of the deleted item
     * @return array Items to reorder
     */
    public function getItemsToReorder($displayType, $deletedDisplayOrder)
    {
        try {
            $sql = "SELECT id, display_order FROM {$this->tableName} 
                WHERE display_type = ? AND display_order > ? 
                ORDER BY display_order ASC";
        
            return $this->database->fetchAll($sql, [$displayType, $deletedDisplayOrder]);
        } catch (Exception $e) {
            error_log("Error getting items to reorder: " . $e->getMessage());
            return [];
        }
    }

    /**
     * Delete a featured item and reorder remaining items
     *
     * @param int $id The ID of the featured item
     * @param int|null $userId The ID of the user deleting the item
     * @return bool True if successful
     */
    public function deleteFeaturedItem($id, $userId = null)
    {
        try {
            $sql = "DELETE FROM {$this->tableName} WHERE id = ?";
            $result = $this->database->query($sql, [$id]);
            
            if ($result->rowCount() === 0) {
                throw new NotFoundException('Featured item not found');
            }
            
            // Log the activity if user ID is provided
            if ($userId) {
                $this->logActivity('featured_item_deleted', $userId, [
                    'featured_item_id' => $id
                ], ['id' => $id]); // Pass the deletion data as request data
            }
            
            return true;
        } catch (NotFoundException $e) {
            throw $e;
        } catch (Exception $e) {
            error_log("Error in deleteFeaturedItem: " . $e->getMessage());
            throw new Exception('Error deleting featured item: ' . $e->getMessage());
        }
    }

    /**
     * Update display order of featured items
     *
     * @param array $items Array of items with id and display_order
     * @param int|null $userId The ID of the user updating the order
     * @return bool True if successful
     */
    public function updateDisplayOrder($items, $userId = null)
    {
        try {
            $this->database->beginTransaction();
            
            foreach ($items as $item) {
                $sql = "UPDATE featured_items SET display_order = ?, updated_at = ? WHERE id = ?";
                $params = [$item['display_order'], date('Y-m-d H:i:s'), $item['id']];
                $this->database->query($sql, $params);
            }
            
            $this->database->commit();
            
            // Log the activity if user ID is provided
            if ($userId) {
                $this->logActivity('featured_item_order_updated', $userId, [
                    'item_count' => count($items)
                ]);
            }
            
            return true;
        } catch (Exception $e) {
            $this->database->rollback();
            error_log("Error in updateDisplayOrder: " . $e->getMessage());
            throw new Exception('Error updating display order: ' . $e->getMessage());
        }
    }

    /**
     * Get featured item limits
     *
     * @return array The limits for each display type
     */
    public function getFeaturedItemLimits()
    {
        try {
            // First get the current count of items by display type
            $sql = "SELECT display_type, COUNT(*) as current_count 
                FROM featured_items 
                GROUP BY display_type";
        
            $countResults = $this->database->fetchAll($sql);
            $currentCounts = [];
        
            foreach ($countResults as $result) {
                $currentCounts[$result['display_type']] = (int)$result['current_count'];
            }
        
            // Now get the configured limits from settings table
            $sql = "SELECT `key`, value FROM {$this->settingsTable} 
                WHERE `key` IN ('featured_limit_featured_product', 'featured_limit_featured_category', 'featured_limit_quick_pick')";
        
            $limitResults = $this->database->fetchAll($sql);
        
            // Default limits if not found in database
            $limits = [
                'featured_product' => ['limit' => 5, 'current' => $currentCounts['featured_product'] ?? 0],
                'featured_category' => ['limit' => 5, 'current' => $currentCounts['featured_category'] ?? 0],
                'quick_pick' => ['limit' => 15, 'current' => $currentCounts['quick_pick'] ?? 0]
            ];
        
            // Update with values from database
            foreach ($limitResults as $result) {
                $key = str_replace('featured_limit_', '', $result['key']);
                if (isset($limits[$key])) {
                    $limits[$key]['limit'] = (int)$result['value'];
                }
            }
        
            error_log("Featured item limits retrieved: " . json_encode($limits));
            return $limits;
        } catch (Exception $e) {
            error_log("Error in getFeaturedItemLimits: " . $e->getMessage());
            // Return safe defaults on error
            return [
                'featured_product' => ['limit' => 5, 'current' => 0],
                'featured_category' => ['limit' => 5, 'current' => 0],
                'quick_pick' => ['limit' => 15, 'current' => 0]
            ];
        }
    }

    /**
     * Update featured item limits
     *
     * @param array $limits The new limits for each display type
     * @param int|null $userId The ID of the user updating the limits
     * @return bool True if successful
     */
    public function updateFeaturedItemLimits($limits, $userId = null)
    {
        try {
            foreach ($limits as $type => $limit) {
                $key = "featured_limit_{$type}";
                
                // Use direct SQL queries with consistent parameter style
                // First check if the setting exists
                $checkSql = "SELECT COUNT(*) as count FROM {$this->settingsTable} WHERE `key` = ?";
                $result = $this->database->fetch($checkSql, [$key]);
                
                if ($result && $result['count'] > 0) {
                    // Update existing setting with direct SQL
                    $updateSql = "UPDATE {$this->settingsTable} SET value = ? WHERE `key` = ?";
                    $this->database->query($updateSql, [(string)$limit, $key]);
                } else {
                    // Insert new setting with direct SQL
                    $insertSql = "INSERT INTO {$this->settingsTable} (`key`, value) VALUES (?, ?)";
                    $this->database->query($insertSql, [$key, (string)$limit]);
                }
            }
            
            // Log the activity if user ID is provided
            if ($userId) {
                $this->logActivity('featured_item_limits_updated', $userId, [
                    'limits' => $limits
                ]);
            }
            
            return true;
        } catch (Exception $e) {
            error_log("Error updating featured item limits: " . $e->getMessage());
            throw new Exception('Error updating featured item limits: ' . $e->getMessage());
        }
    }

    /**
     * Get detailed product data
     *
     * @param int $productId The product ID
     * @return array|null The detailed product data
     */
    public function getProductDetails($productId)
    {
        try {
            $sql = "SELECT p.*, 
                    c.name as category_name, 
                    sc.name as subcategory_name,
                    (SELECT pi.image_path FROM product_images pi WHERE pi.product_id = p.id AND pi.is_primary = 1 LIMIT 1) as primary_image
                    FROM products p
                    LEFT JOIN categories c ON p.category_id = c.id
                    LEFT JOIN subcategories sc ON p.subcategory_id = sc.id
                    WHERE p.id = ? AND p.deleted_at IS NULL";
            
            $product = $this->database->fetch($sql, [$productId]);
            
            if ($product) {
                // Get all product images
                $product['images'] = $this->getProductImages($productId);
                
                // Get product variants
                $product['variants'] = $this->getProductVariants($productId);
            }
            
            return $product;
        } catch (Exception $e) {
            error_log("Error fetching product details: " . $e->getMessage());
            return null;
        }
    }

    /**
     * Get product images
     *
     * @param int $productId The product ID
     * @return array The product images
     */
    public function getProductImages($productId)
    {
        try {
            $sql = "SELECT id, product_id, image_path, is_primary, display_order, created_at 
                    FROM product_images 
                    WHERE product_id = ?
                    ORDER BY is_primary DESC, display_order ASC, id ASC";
            
            return $this->database->fetchAll($sql, [$productId]);
        } catch (Exception $e) {
            error_log("Error getting product images: " . $e->getMessage());
            return [];
        }
    }

    /**
     * Get product variants
     *
     * @param int $productId The product ID
     * @return array The product variants
     */
    public function getProductVariants($productId)
    {
        try {
            $sql = "SELECT * FROM product_variants WHERE product_id = ? ORDER BY display_order ASC, id ASC";
            return $this->database->fetchAll($sql, [$productId]);
        } catch (Exception $e) {
            error_log("Error getting product variants: " . $e->getMessage());
            return [];
        }
    }

    /**
     * Get detailed category data
     *
     * @param int $categoryId The category ID
     * @return array|null The detailed category data
     */
    public function getCategoryDetails($categoryId)
    {
        try {
            $sql = "SELECT c.*, 
                    (SELECT COUNT(*) FROM products p WHERE p.category_id = c.id AND p.deleted_at IS NULL) as product_count,
                    (SELECT COUNT(*) FROM subcategories sc WHERE sc.category_id = c.id AND sc.deleted_at IS NULL) as subcategory_count
                    FROM categories c
                    WHERE c.id = ? AND c.deleted_at IS NULL";
            
            $category = $this->database->fetch($sql, [$categoryId]);
            
            if ($category) {
                // Get subcategories
                $category['subcategories'] = $this->getCategorySubcategories($categoryId);
            }
            
            return $category;
        } catch (Exception $e) {
            error_log("Error fetching category details: " . $e->getMessage());
            return null;
        }
    }

    /**
     * Get subcategories for a category
     *
     * @param int $categoryId The category ID
     * @return array The subcategories
     */
    public function getCategorySubcategories($categoryId)
    {
        try {
            $sql = "SELECT id, name, slug, image, description, status, display_order 
                    FROM subcategories 
                    WHERE category_id = ? AND deleted_at IS NULL 
                    ORDER BY display_order ASC, name ASC";
            
            return $this->database->fetchAll($sql, [$categoryId]);
        } catch (Exception $e) {
            error_log("Error getting category subcategories: " . $e->getMessage());
            return [];
        }
    }

    /**
     * Get the next display order for a display type
     *
     * @param string $displayType The display type
     * @return int The next display order
     */
    private function getNextDisplayOrder($displayType)
    {
        try {
            $sql = "SELECT MAX(display_order) as max_order FROM {$this->tableName} 
                    WHERE display_type = ?";
            
            $result = $this->database->fetch($sql, [$displayType]);
            return $result && isset($result['max_order']) ? (int)$result['max_order'] + 1 : 1;
        } catch (Exception $e) {
            error_log("Error getting next display order: " . $e->getMessage());
            return 1;
        }
    }

    /**
     * Ensure a limit exists in the settings table
     *
     * @param string $type The display type
     * @param int $defaultValue The default value
     * @return bool True if successful
     */
    private function ensureLimitExists($type, $defaultValue)
    {
        try {
            $key = "featured_limit_{$type}";
            
            // Use direct SQL query with consistent parameter style
            $checkSql = "SELECT COUNT(*) as count FROM {$this->settingsTable} WHERE `key` = ?";
            $result = $this->database->fetch($checkSql, [$key]);
            
            if (!$result || $result['count'] == 0) {
                // Insert default setting with direct SQL
                $insertSql = "INSERT INTO {$this->settingsTable} (`key`, value) VALUES (?, ?)";
                $this->database->query($insertSql, [$key, (string)$defaultValue]);
            }
            
            return true;
        } catch (Exception $e) {
            error_log("Error ensuring limit exists: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Check if an entity exists
     *
     * @param int $entityId The entity ID
     * @param string $displayType The display type
     * @return bool True if the entity exists
     */
    public function checkEntityExists($entityId, $displayType)
    {
        try {
            if ($displayType === 'featured_category') {
                $sql = "SELECT id FROM categories WHERE id = ? AND deleted_at IS NULL";
            } else {
                $sql = "SELECT id FROM products WHERE id = ? AND deleted_at IS NULL";
            }
            
            error_log("SQL Query: " . $sql);
            error_log("Params: " . json_encode([$entityId]));
            
            $result = $this->database->fetch($sql, [$entityId]);
            return !empty($result);
        } catch (Exception $e) {
            error_log("Error in checkEntityExists: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Get display type limits
     *
     * @return array The limits for each display type
     */
    public function getDisplayTypeLimits()
    {
        return [
            'featured_product' => 10,
            'featured_category' => 8,
            'quick_pick' => 20
        ];
    }

    /**
     * Get display type count
     *
     * @param string $displayType The display type
     * @return int The count of items for the display type
     */
    public function getDisplayTypeCount($displayType)
    {
        try {
            $sql = "SELECT COUNT(*) as count FROM featured_items WHERE display_type = ?";
            $result = $this->database->fetch($sql, [$displayType]);
            return (int)($result['count'] ?? 0);
        } catch (Exception $e) {
            error_log("Error in getDisplayTypeCount: " . $e->getMessage());
            return 0;
        }
    }

    /**
     * Override the logActivity method to handle missing users table
     *
     * @param string $action The action being logged
     * @param int $userId The ID of the user performing the action
     * @param array $data Additional data to log
     * @param array $requestData Optional request data to log
     * @return bool True if successful
     */
    protected function logActivity($action, $userId, $data = [], $requestData = null)
    {
        try {
            // Check if activity_logs table exists
            $sql = "SHOW TABLES LIKE 'activity_logs'";
            $result = $this->database->fetch($sql);
            
            if (!$result) {
                // Table doesn't exist, just return without logging
                return false;
            }
            
            // If request data is not provided, try to get it from the request
            if ($requestData === null) {
                // Try to get JSON input first
                $input = file_get_contents('php://input');
                if (!empty($input)) {
                    $requestData = json_decode($input, true) ?: [];
                } else {
                    // Fallback to POST/GET data
                    $requestData = array_merge($_GET ?? [], $_POST ?? []);
                }
                if (!empty($input)) {
                    $requestData = json_decode($input, true) ?: [];
                } else {
                    // Fallback to POST/GET data
                    $requestData = array_merge($_GET ?? [], $_POST ?? []);
                }
            }
            
            // Insert activity log using direct SQL with ALL required fields
            $sql = "INSERT INTO activity_logs (user_id, module, action, route, ip_address, user_agent, request_data, response_code, execution_time, data, created_at) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
            
            $params = [
                $userId,
                'FeaturedItems', // module
                $action,
                $_SERVER['REQUEST_URI'] ?? 'Unknown', // route
                $_SERVER['REMOTE_ADDR'] ?? '0.0.0.0',
                $_SERVER['HTTP_USER_AGENT'] ?? 'Unknown',
                json_encode($requestData), // request_data
                http_response_code() ?: 200, // response_code
                0.0, // execution_time (not available in repository context)
                json_encode($data),
                date('Y-m-d H:i:s')
            ];
            
            $this->database->query($sql, $params);
            return true;
        } catch (Exception $e) {
            // Just log the error but don't throw - activity logging should not break main functionality
            error_log("Error logging activity: " . $e->getMessage());
            return false;
        }
    }

    public function getFeaturedItemById($id)
    {
        return $this->getFeaturedItem($id);
    }

    public function updateDisplayOrderByType($displayType, $items, $userId = null)
    {
        try {
            $this->database->beginTransaction();
            
            foreach ($items as $item) {
                $sql = "UPDATE featured_items SET display_order = ?, updated_at = ? WHERE id = ? AND display_type = ?";
                $params = [$item['display_order'], date('Y-m-d H:i:s'), $item['id'], $displayType];
                $this->database->query($sql, $params);
            }
            
            $this->database->commit();
            
            // Log the activity if user ID is provided
            if ($userId) {
                $this->logActivity('featured_item_order_updated', $userId, [
                    'display_type' => $displayType,
                    'item_count' => count($items)
                ]);
            }
            
            return true;
        } catch (Exception $e) {
            $this->database->rollback();
            error_log("Error in updateDisplayOrderByType: " . $e->getMessage());
            throw new Exception('Error updating display order by type: ' . $e->getMessage());
        }
    }
}
