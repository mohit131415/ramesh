<?php

namespace App\Features\FeaturedItems\Services;

use App\Features\FeaturedItems\DataAccess\FeaturedItemRepository;
use App\Shared\Exceptions\ValidationException;
use App\Shared\Exceptions\AuthorizationException;
use App\Shared\Exceptions\NotFoundException;
use App\Core\Security\Authorization;
use App\Core\Database;

class FeaturedItemService
{
    private $repository;
    private $authorization;
    private $database;

    public function __construct()
    {
        $this->repository = new FeaturedItemRepository();
        $this->authorization = Authorization::getInstance();
        $this->database = Database::getInstance();
    }

    /**
     * Replace a featured item's entity (simple entity_id update)
     *
     * @param int $id The ID of the featured item
     * @param int $newEntityId The new entity ID to replace with
     * @param int|null $userId The ID of the user performing the replacement
     * @return array The updated featured item
     * @throws NotFoundException If the featured item is not found
     * @throws ValidationException If validation fails
     * @throws AuthorizationException If the user doesn't have permission
     */
    public function replaceFeaturedItemEntity($id, $newEntityId, $userId = null)
    {
        // Verify admin permissions
        $this->verifyAdminPermissions();
        
        // Get the current featured item
        $currentItem = $this->getFeaturedItem($id);
        
        // Validate that the new entity exists based on the current display type
        $this->validateEntityExists($newEntityId, $currentItem['display_type']);
        
        // Check if the new entity is already featured in this display type (excluding current item)
        $isDuplicate = $this->repository->isEntityFeaturedExcludingItem($newEntityId, $currentItem['display_type'], $id);
        
        if ($isDuplicate) {
            throw new ValidationException("This item is already featured in this section");
        }
        
        // Update only the entity_id
        $updateData = [
            'entity_id' => $newEntityId
        ];
        
        $this->repository->updateFeaturedItem($id, $updateData, $userId);
        
        // Return the updated item
        return $this->getFeaturedItem($id);
    }

    /**
     * Get all featured items
     *
     * @return array The featured items
     */
    public function getAllFeaturedItems()
    {
        return $this->repository->getAllFeaturedItems();
    }

    /**
     * Get featured items by type
     *
     * @param string $displayType The type of featured items to retrieve
     * @return array The featured items
     */
    public function getFeaturedItemsByType($displayType)
    {
        $this->validateDisplayType($displayType);
        return $this->repository->getFeaturedItemsByType($displayType);
    }

    /**
     * Get a featured item by ID
     *
     * @param int $id The ID of the featured item
     * @return array The featured item
     * @throws NotFoundException If the featured item is not found
     */
    public function getFeaturedItem($id)
    {
        $item = $this->repository->getFeaturedItemById($id);
        
        if (!$item) {
            throw new NotFoundException("Featured item not found");
        }
        
        return $item;
    }

    /**
     * Get a featured item by entity ID and display type
     *
     * @param int $entityId The entity ID
     * @param string $displayType The display type
     * @return array|null The featured item or null if not found
     * @throws NotFoundException If the featured item is not found
     */
    public function getFeaturedItemByEntityAndType($entityId, $displayType)
    {
        $item = $this->repository->getExistingFeaturedItem($entityId, $displayType);
        
        if (!$item) {
            throw new NotFoundException("Featured item not found with entity ID: $entityId and display type: $displayType");
        }
        
        return $item;
    }

    /**
     * Get multiple featured items by their IDs
     *
     * @param array $ids Array of featured item IDs
     * @return array The featured items
     */
    public function getItemsByIds($ids)
    {
        return $this->repository->getFeaturedItemsByIds($ids);
    }

    /**
     * Verify that all items in the provided array exist
     *
     * @param array $itemIds Array of featured item IDs to verify
     * @return array Array of IDs that don't exist
     */
    public function verifyItemsExist($itemIds)
    {
        return $this->repository->findMissingItemIds($itemIds);
    }

    /**
     * Get detailed product data
     *
     * @param int $productId The product ID
     * @return array The detailed product data
     * @throws NotFoundException If the product is not found
     */
    public function getProductDetails($productId)
    {
        $product = $this->repository->getProductDetails($productId);
        
        if (!$product) {
            throw new NotFoundException("Product not found");
        }
        
        return $product;
    }

    /**
     * Get detailed category data
     *
     * @param int $categoryId The category ID
     * @return array The detailed category data
     * @throws NotFoundException If the category is not found
     */
    public function getCategoryDetails($categoryId)
    {
        $category = $this->repository->getCategoryDetails($categoryId);
        
        if (!$category) {
            throw new NotFoundException("Category not found");
        }
        
        return $category;
    }

    /**
     * Create a new featured item
     *
     * @param array $data The featured item data
     * @param int|null $userId The ID of the user creating the item
     * @return array The created featured item
     * @throws ValidationException If validation fails
     * @throws AuthorizationException If the user doesn't have permission
     */
    public function createFeaturedItem($data, $userId = null)
    {
        // Verify admin permissions
        $this->verifyAdminPermissions();
        
        // Validate input
        $this->validateFeaturedItemData($data);
        
        // Check if entity exists based on display type
        $this->validateEntityExists($data['entity_id'], $data['display_type']);
        
        // CRITICAL CHANGE: Only check for duplicates within the same display type
        // This allows the same product to be in both featured_product and quick_pick
        $isDuplicate = false;
        
        // Check if this exact combination of entity_id and display_type already exists
        $sql = "SELECT COUNT(*) as count FROM featured_items 
            WHERE entity_id = ? AND display_type = ?";
        $result = $this->database->fetch($sql, [$data['entity_id'], $data['display_type']]);
        $isDuplicate = $result && $result['count'] > 0;
        
        if ($isDuplicate) {
            throw new ValidationException("This item is already featured in this section");
        }
        
        // Check if we've reached the limit for this display type
        $currentCount = $this->repository->countFeaturedItemsByType($data['display_type']);
        $limits = $this->repository->getFeaturedItemLimits();
        
        // Fix: Access the limit value correctly from the nested array structure
        $limit = isset($limits[$data['display_type']]['limit']) 
            ? $limits[$data['display_type']]['limit'] 
            : 5; // fallback default
        
        if ($currentCount >= $limit) {
            throw new ValidationException("Maximum limit of {$limit} items reached for this section. Current count: {$currentCount}");
        }
        
        // Create the featured item
        $id = $this->repository->createFeaturedItem($data, $userId);
        
        // Return the created item
        return $this->getFeaturedItem($id);
    }

    /**
     * Update a featured item
     *
     * @param int $id The ID of the featured item
     * @param array $data The updated featured item data
     * @param int|null $userId The ID of the user updating the item
     * @return array The updated featured item
     * @throws NotFoundException If the featured item is not found
     * @throws ValidationException If validation fails
     * @throws AuthorizationException If the user doesn't have permission
     */
    public function updateFeaturedItem($id, $data, $userId = null)
    {
        // Verify admin permissions
        $this->verifyAdminPermissions();
        
        // Check if featured item exists
        $item = $this->getFeaturedItem($id);
        
        // If entity_id or display_type is changing, validate the entity
        if (isset($data['entity_id']) || isset($data['display_type'])) {
            $entityId = $data['entity_id'] ?? $item['entity_id'];
            $displayType = $data['display_type'] ?? $item['display_type'];
            
            // Validate display type if it's changing
            if (isset($data['display_type'])) {
                $this->validateDisplayType($displayType);
            }
            
            // Validate entity exists
            $this->validateEntityExists($entityId, $displayType);
            
            // CRITICAL CHANGE: Only check for duplicates within the same display type
            // This allows the same product to be in both featured_product and quick_pick
            $isDuplicate = false;
            
            // Check if this exact combination of entity_id and display_type already exists (excluding this item)
            $sql = "SELECT COUNT(*) as count FROM featured_items 
                    WHERE entity_id = ? AND display_type = ? AND id != ?";
            $result = $this->database->fetch($sql, [$entityId, $displayType, $id]);
            $isDuplicate = $result && $result['count'] > 0;
            
            if ($isDuplicate) {
                throw new ValidationException("This item is already featured in this section");
            }
        }
        
        // Update the featured item
        $this->repository->updateFeaturedItem($id, $data, $userId);
        
        // Return the updated item
        return $this->getFeaturedItem($id);
    }

    /**
     * Delete a featured item
     *
     * @param int $id The ID of the featured item
     * @param int|null $userId The ID of the user deleting the item
     * @return bool True if successful
     * @throws NotFoundException If the featured item is not found
     * @throws AuthorizationException If the user doesn't have permission
     */
    public function deleteFeaturedItem($id, $userId = null)
    {
        // Verify admin permissions
        $this->verifyAdminPermissions();
        
        // Check if featured item exists
        $this->getFeaturedItem($id);
        
        // Delete the featured item
        return $this->repository->deleteFeaturedItem($id, $userId);
    }

    /**
     * Reorder items after deletion to ensure no gaps in display order
     *
     * @param string $displayType The display type of the deleted item
     * @param int $deletedDisplayOrder The display order of the deleted item
     * @return bool True if successful
     */
    public function reorderAfterDeletion($displayType, $deletedDisplayOrder)
    {
        try {
            // Get all items of this display type with display order greater than the deleted item
            $items = $this->repository->getItemsToReorder($displayType, $deletedDisplayOrder);
            
            if (empty($items)) {
                // No items to reorder
                return true;
            }
            
            // Begin transaction
            $this->database->beginTransaction();
            
            // Update each item's display order
            foreach ($items as $item) {
                $newDisplayOrder = $item['display_order'] - 1;
                
                $sql = "UPDATE featured_items SET 
                        display_order = ?, 
                        updated_at = ? 
                        WHERE id = ?";
                
                $params = [
                    $newDisplayOrder,
                    date('Y-m-d H:i:s'),
                    $item['id']
                ];
                
                $result = $this->database->query($sql, $params);
                
                if (!$result) {
                    // If any update fails, rollback and return false
                    $this->database->rollback();
                    error_log("Failed to update display order for item ID: {$item['id']} during reordering");
                    return false;
                }
            }
            
            // Commit transaction
            $this->database->commit();
            
            error_log("Successfully reordered {$displayType} items after deletion of item with display_order {$deletedDisplayOrder}");
            return true;
        } catch (\Exception $e) {
            // Rollback transaction on error
            try {
                $this->database->rollback();
            } catch (\Exception $rollbackEx) {
                error_log("Error during rollback: " . $rollbackEx->getMessage());
            }
            error_log("Error reordering items after deletion: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Update display order of featured items
     *
     * @param array $items Array of items with id and display_order
     * @param int|null $userId The ID of the user updating the order
     * @return bool True if successful
     * @throws ValidationException If validation fails
     */
    public function updateDisplayOrder($items, $userId = null)
    {
        // Verify admin permissions
        $this->verifyAdminPermissions();
        
        if (empty($items) || !is_array($items)) {
            throw new ValidationException("Items array is required");
        }
        
        foreach ($items as $item) {
            if (!isset($item['id']) || !isset($item['display_order'])) {
                throw new ValidationException("Each item must have id and display_order");
            }
            
            if (!is_numeric($item['id']) || !is_numeric($item['display_order'])) {
                throw new ValidationException("ID and display_order must be numeric");
            }
        }
        
        // Log the items being updated
        error_log("Updating display order for items: " . json_encode($items));
        
        // Verify all items exist before updating
        $itemIds = array_column($items, 'id');
        $missingIds = $this->repository->findMissingItemIds($itemIds);
        
        if (!empty($missingIds)) {
            throw new ValidationException("Some featured items do not exist: " . implode(', ', $missingIds));
        }
        
        $result = $this->repository->updateDisplayOrder($items, $userId);
        
        // Log the result
        error_log("Update display order result: " . ($result ? "success" : "failure"));
        
        return $result;
    }

    /**
     * Update display order of all featured items of a specific type
     *
     * @param string $displayType The display type
     * @param array $items Array of items with id and display_order
     * @param int|null $userId The ID of the user updating the order
     * @return bool True if successful
     * @throws ValidationException If validation fails
     */
    public function updateDisplayOrderByType($displayType, $items, $userId = null)
    {
        // Verify admin permissions
        $this->verifyAdminPermissions();
        
        // Validate display type
        $this->validateDisplayType($displayType);
        
        if (empty($items) || !is_array($items)) {
            throw new ValidationException("Items array is required");
        }
        
        foreach ($items as $item) {
            if (!isset($item['id']) || !isset($item['display_order'])) {
                throw new ValidationException("Each item must have id and display_order");
            }
            
            if (!is_numeric($item['id']) || !is_numeric($item['display_order'])) {
                throw new ValidationException("ID and display_order must be numeric");
            }
        }
        
        // Log the items being updated
        error_log("Updating display order for type {$displayType} with items: " . json_encode($items));
        
        // Verify all items exist and belong to the specified display type
        $itemIds = array_column($items, 'id');
        $existingItems = $this->repository->getFeaturedItemsByIds($itemIds);
        
        // Check if all items exist
        if (count($existingItems) !== count($itemIds)) {
            throw new ValidationException("Some featured items do not exist");
        }
        
        // Check if all items belong to the specified display type
        foreach ($existingItems as $item) {
            if ($item['display_type'] !== $displayType) {
                throw new ValidationException("Item ID {$item['id']} does not belong to display type '{$displayType}'");
            }
        }
        
        $result = $this->repository->updateDisplayOrderByType($displayType, $items, $userId);
        
        // Log the result
        error_log("Update display order by type result: " . ($result ? "success" : "failure"));
        
        return $result;
    }

    /**
     * Get featured item limits
     *
     * @return array The limits for each display type
     */
    public function getFeaturedItemLimits()
    {
        return $this->repository->getFeaturedItemLimits();
    }

    /**
     * Update featured item limits
     *
     * @param array $limits The new limits for each display type
     * @param int|null $userId The ID of the user updating the limits
     * @return bool True if successful
     * @throws ValidationException If validation fails
     * @throws AuthorizationException If the user doesn't have permission
     */
    public function updateFeaturedItemLimits($limits, $userId = null)
    {
        // Verify superadmin permissions
        $this->verifySuperadminPermissions();
        
        // Validate limits
        foreach ($limits as $type => $limit) {
            if (!in_array($type, ['featured_product', 'featured_category', 'quick_pick'])) {
                throw new ValidationException("Invalid display type: {$type}");
            }
            
            if (!is_numeric($limit) || $limit < 1) {
                throw new ValidationException("Limit must be a positive number");
            }
        }
        
        // Update limits
        return $this->repository->updateFeaturedItemLimits($limits, $userId);
    }

    /**
     * Check if an item can be featured
     * 
     * @param int $entityId The entity ID
     * @param string $displayType The display type
     * @return array Status information about whether the item can be featured
     */
    public function checkFeaturedItemAvailability($entityId, $displayType)
    {
        try {
            // Validate display type
            $this->validateDisplayType($displayType);
            
            // Check if entity exists
            try {
                $this->validateEntityExists($entityId, $displayType);
                $entityExists = true;
            } catch (ValidationException $e) {
                return [
                    'can_feature' => false,
                    'reason' => $e->getMessage(),
                    'entity_exists' => false
                ];
            }
            
            // Check if already featured
            $existingItem = $this->repository->getExistingFeaturedItem($entityId, $displayType);
            if ($existingItem) {
                return [
                    'can_feature' => false,
                    'reason' => "Already featured in this section",
                    'existing_item' => $existingItem,
                    'entity_exists' => true
                ];
            }
            
            // Check limits
            $currentCount = $this->repository->countFeaturedItemsByType($displayType);
            $limits = $this->repository->getFeaturedItemLimits();
            
            // Fix: Access the limit value correctly from the nested array structure
            $limit = isset($limits[$displayType]['limit']) 
                ? $limits[$displayType]['limit'] 
                : 5; // fallback default
            
            if ($currentCount >= $limit) {
                return [
                    'can_feature' => false,
                    'reason' => "Maximum limit of {$limit} items reached for this section",
                    'current_count' => $currentCount,
                    'limit' => $limit,
                    'entity_exists' => true
                ];
            }
            
            return [
                'can_feature' => true,
                'entity_exists' => true
            ];
        } catch (ValidationException $e) {
            return [
                'can_feature' => false,
                'reason' => $e->getMessage(),
                'entity_exists' => false
            ];
        } catch (\Exception $e) {
            return [
                'can_feature' => false,
                'reason' => "An error occurred: " . $e->getMessage(),
                'entity_exists' => false
            ];
        }
    }

    /**
     * Validate featured item data
     *
     * @param array $data The featured item data
     * @throws ValidationException If validation fails
     */
    private function validateFeaturedItemData($data)
    {
        if (!isset($data['entity_id']) || !is_numeric($data['entity_id'])) {
            throw new ValidationException("Entity ID is required and must be numeric");
        }
        
        if (!isset($data['display_type'])) {
            throw new ValidationException("Display type is required");
        }
        
        $this->validateDisplayType($data['display_type']);
    }

    /**
     * Validate display type
     *
     * @param string $displayType The display type
     * @throws ValidationException If the display type is invalid
     */
    private function validateDisplayType($displayType)
    {
        $validTypes = ['featured_product', 'featured_category', 'quick_pick'];
        
        if (!in_array($displayType, $validTypes)) {
            throw new ValidationException("Invalid display type. Must be one of: " . implode(', ', $validTypes));
        }
    }

    /**
     * Validate that an entity exists
     *
     * @param int $entityId The entity ID
     * @param string $displayType The display type
     * @throws ValidationException If the entity doesn't exist
     */
    private function validateEntityExists($entityId, $displayType)
    {
        if ($displayType === 'featured_product' || $displayType === 'quick_pick') {
            // Check if product exists in products table
            $sql = "SELECT id FROM products WHERE id = ? AND deleted_at IS NULL";
            $product = $this->database->fetch($sql, [$entityId]);
            
            if (!$product) {
                throw new ValidationException("Product not found");
            }
        } else if ($displayType === 'featured_category') {
            // Check if category exists in categories table
            $sql = "SELECT id FROM categories WHERE id = ? AND deleted_at IS NULL";
            $category = $this->database->fetch($sql, [$entityId]);
            
            if (!$category) {
                throw new ValidationException("Category not found");
            }
        }
    }

    /**
     * Verify that the current user has admin permissions
     *
     * @throws AuthorizationException If the user doesn't have admin permissions
     */
    private function verifyAdminPermissions()
    {
        if (!$this->authorization->hasRole('admin')) {
            throw new AuthorizationException("You don't have permission to perform this action");
        }
    }

    /**
     * Verify that the current user has superadmin permissions
     *
     * @throws AuthorizationException If the user doesn't have superadmin permissions
     */
    private function verifySuperadminPermissions()
    {
        if (!$this->authorization->hasRole('super_admin')) {
            throw new AuthorizationException("Only superadmins can modify these settings");
        }
    }
}
