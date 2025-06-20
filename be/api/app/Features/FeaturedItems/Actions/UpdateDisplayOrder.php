<?php

namespace App\Features\FeaturedItems\Actions;

use App\Core\Request;
use App\Core\Response;
use App\Core\Database;
use App\Core\Security\Authentication;
use App\Shared\Traits\ValidatesInput;

class UpdateDisplayOrder
{
    use ValidatesInput;

    private $authentication;
    private $database;
    private $tableName = 'featured_items';

    public function __construct()
    {
        $this->authentication = Authentication::getInstance();
        $this->database = Database::getInstance();
    }

    public function execute(Request $request, Response $response)
    {
        try {
            // Check if user is authenticated
            if (!$this->authentication->check()) {
                return [
                    'status' => 'error',
                    'message' => 'Unauthorized access',
                    'data' => null
                ];
            }
            
            $userId = null;
            try {
                $user = $this->authentication->user();
                if ($user && isset($user['id'])) {
                    $userId = $user['id'];
                }
            } catch (\Exception $e) {
                error_log("Error getting user: " . $e->getMessage());
            }
            
            // Validate input
            $rules = [
                'display_type' => 'required|string',
                'items' => 'required|array'
            ];
            
            $data = $this->validate($request->getBody(), $rules);
            
            // Validate display type
            $validDisplayTypes = ['featured_product', 'featured_category', 'quick_pick'];
            if (!in_array($data['display_type'], $validDisplayTypes)) {
                return [
                    'status' => 'error',
                    'message' => 'Invalid display type. Must be one of: ' . implode(', ', $validDisplayTypes),
                    'data' => null
                ];
            }
            
            // Validate each item in the array
            if (empty($data['items'])) {
                return [
                    'status' => 'error',
                    'message' => 'No items provided for update',
                    'data' => null
                ];
            }
            
            // Log the request data for debugging
            error_log("UpdateDisplayOrder request data: " . json_encode($data));
            
            // CRITICAL FIX: Determine if we're dealing with entity_ids instead of featured item ids
            // First, get all featured items of this type to check against
            $featuredItems = $this->getFeaturedItemsByType($data['display_type']);
            $featuredItemIds = array_column($featuredItems, 'id');
            $entityIds = array_column($featuredItems, 'entity_id');
            
            // Check the first item's ID to see if it matches any featured item IDs
            $firstItemId = $data['items'][0]['id'];
            $usingEntityIds = !in_array($firstItemId, $featuredItemIds) && in_array($firstItemId, $entityIds);
            
            error_log("First item ID: " . $firstItemId);
            error_log("Featured item IDs: " . implode(', ', $featuredItemIds));
            error_log("Entity IDs: " . implode(', ', $entityIds));
            error_log("Using entity IDs: " . ($usingEntityIds ? "true" : "false"));
            
            // Process the items based on whether we're using entity_ids or ids
            if ($usingEntityIds) {
                // Create a mapping of entity_ids to featured item ids
                $entityIdToItemIdMap = [];
                foreach ($featuredItems as $item) {
                    $entityIdToItemIdMap[$item['entity_id']] = $item['id'];
                }
                
                // Map the items using entity_ids to featured item ids
                $itemsToUpdate = [];
                foreach ($data['items'] as $item) {
                    if (isset($entityIdToItemIdMap[$item['id']])) {
                        $itemsToUpdate[] = [
                            'id' => $entityIdToItemIdMap[$item['id']],
                            'display_order' => $item['display_order']
                        ];
                } else {
                    error_log("Entity ID not found: " . $item['id']);
                }
            }
            
            if (empty($itemsToUpdate)) {
                return [
                    'status' => 'error',
                    'message' => 'Could not find featured items with the provided entity IDs',
                    'data' => null
                ];
            }
        } else {
            // Using regular featured item ids
            foreach ($data['items'] as $item) {
                if (!isset($item['id']) || !isset($item['display_order'])) {
                    return [
                        'status' => 'error',
                        'message' => 'Each item must have id and display_order',
                        'data' => null
                    ];
                }
                
                if (!is_numeric($item['id']) || !is_numeric($item['display_order'])) {
                    return [
                        'status' => 'error',
                        'message' => 'ID and display_order must be numeric',
                        'data' => null
                    ];
                }
            }
            $itemsToUpdate = $data['items'];
        }
        
        // Log the items we're going to update
        error_log("Items to update: " . json_encode($itemsToUpdate));
        
        // Update display order directly
        $success = $this->updateDisplayOrderDirectly($itemsToUpdate, $data['display_type']);
        
        if (!$success) {
            return [
                'status' => 'error',
                'message' => 'Failed to update display order',
                'data' => null
            ];
        }
        
        // Get the updated items to return in the response
        $updatedItems = $this->getFeaturedItemsByType($data['display_type']);
        
        return [
            'status' => 'success',
            'message' => 'Display order updated successfully',
            'data' => [
                'display_type' => $data['display_type'],
                'items' => $updatedItems
            ]
        ];
    } catch (\Exception $e) {
        error_log("Exception in UpdateDisplayOrder: " . $e->getMessage());
        return [
            'status' => 'error',
            'message' => $e->getMessage(),
            'data' => null
        ];
    }
}
    
    /**
     * Map entity_ids to actual ids
     *
     * @param array $items Array of items with entity_id and display_order
     * @param string $displayType The display type
     * @return array Array of items with id and display_order
     */
    private function mapEntityIdsToIds($items, $displayType)
    {
        try {
            $mappedItems = [];
            $entityIds = array_column($items, 'entity_id');
            
            // Log the entity IDs we're looking for
            error_log("Looking for entity_ids: " . implode(', ', $entityIds));
            
            if (empty($entityIds)) {
                return [];
            }
            
            // Get the mapping from entity_id to id
            $idPlaceholders = implode(',', array_fill(0, count($entityIds), '?'));
            $params = array_merge([$displayType], $entityIds);
            
            $sql = "SELECT id, entity_id FROM {$this->tableName} 
                    WHERE display_type = ? AND entity_id IN ({$idPlaceholders})";
            
            $results = $this->database->fetchAll($sql, $params);
            
            if (empty($results)) {
                error_log("No featured items found with the provided entity_ids");
                return [];
            }
            
            // Create a mapping of entity_id to id
            $entityIdToIdMap = [];
            foreach ($results as $result) {
                $entityIdToIdMap[$result['entity_id']] = $result['id'];
            }
            
            // Log the mapping
            error_log("Entity ID to ID mapping: " . json_encode($entityIdToIdMap));
            
            // Map the items
            foreach ($items as $item) {
                if (isset($entityIdToIdMap[$item['entity_id']])) {
                    $mappedItems[] = [
                        'id' => $entityIdToIdMap[$item['entity_id']],
                        'display_order' => $item['display_order']
                    ];
                }
            }
            
            // Log the mapped items
            error_log("Mapped items: " . json_encode($mappedItems));
            
            return $mappedItems;
        } catch (\Exception $e) {
            error_log("Error mapping entity_ids to ids: " . $e->getMessage());
            return [];
        }
    }
    
    /**
     * Update display order directly using the database
     *
     * @param array $items Array of items with id and display_order
     * @param string $displayType The display type
     * @return bool True if successful
     */
    private function updateDisplayOrderDirectly($items, $displayType)
    {
        try {
            // Begin transaction for batch update
            $this->database->beginTransaction();
            
            foreach ($items as $item) {
                // Log the update operation
                error_log("Updating item ID {$item['id']} to display_order {$item['display_order']} for type {$displayType}");
                
                // Use direct SQL query for better control and debugging
                $sql = "UPDATE {$this->tableName} SET 
                        display_order = ?, 
                        updated_at = ? 
                        WHERE id = ? AND display_type = ?";
                
                $params = [
                    $item['display_order'],
                    date('Y-m-d H:i:s'),
                    $item['id'],
                    $displayType
                ];
                
                // Execute the update
                $result = $this->database->query($sql, $params);
                
                // Check if the update was successful
                if (!$result) {
                    error_log("Failed to update display order for item ID: {$item['id']} with type {$displayType}");
                    $this->database->rollback();
                    return false;
                }
            }
            
            // Commit transaction
            $this->database->commit();
            
            return true;
        } catch (\Exception $e) {
            // Rollback transaction on error
            $this->database->rollback();
            error_log("Error updating display order directly: " . $e->getMessage());
            return false;
        }
    }
    
    /**
     * Get featured items by type
     *
     * @param string $displayType The type of featured items to retrieve
     * @return array The featured items
     */
    private function getFeaturedItemsByType($displayType)
    {
        try {
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
                    WHERE fi.display_type = ?
                    ORDER BY fi.display_order";
            
            return $this->database->fetchAll($sql, [$displayType]);
        } catch (\Exception $e) {
            error_log("Error fetching featured items by type: " . $e->getMessage());
            return [];
        }
    }
}
