<?php

namespace App\Features\Open\FeaturedItems\DataAccess;

use App\Core\Database;
use App\Shared\DataFetchers\CategoryDataFetcher;
use App\Shared\DataFetchers\ProductDataFetcher;
use App\Shared\DataFetchers\BulkDataFetcher;
use Exception;
use PDO;

class PublicFeaturedItemRepository
{
    private $db;
    private $categoryDataFetcher;
    private $productDataFetcher;

    public function __construct()
    {
        $this->db = Database::getInstance()->getConnection();
        $this->categoryDataFetcher = new CategoryDataFetcher();
        $this->productDataFetcher = new ProductDataFetcher();
    }

    /**
     * Get featured items by display type with pagination
     *
     * @param string $displayType Type of featured display (featured_product, featured_category, quick_pick)
     * @param int $page Page number
     * @param int $limit Items per page
     * @return array Featured items with complete data
     */
    public function getFeaturedItemsByType(string $displayType, int $page = 1, int $limit = 10): array
    {
        try {
            // Calculate offset for pagination
            $offset = ($page - 1) * $limit;
            
            // Get the limit from settings if available
            $settingLimit = $this->getSettingLimit($displayType);
            if ($settingLimit > 0) {
                $limit = min($limit, $settingLimit);
            }
            
            // Get featured item IDs from the database
            $query = "
                SELECT id, entity_id, display_order
                FROM featured_items
                WHERE display_type = :display_type
                ORDER BY display_order ASC, id ASC
                LIMIT :limit OFFSET :offset
            ";
            
            $stmt = $this->db->prepare($query);
            $stmt->bindParam(':display_type', $displayType, PDO::PARAM_STR);
            $stmt->bindParam(':limit', $limit, PDO::PARAM_INT);
            $stmt->bindParam(':offset', $offset, PDO::PARAM_INT);
            $stmt->execute();
            
            $featuredItems = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            if (empty($featuredItems)) {
                return [];
            }
            
            // Extract entity IDs
            $entityIds = array_column($featuredItems, 'entity_id');
            
            // Fetch complete data based on display type
            $completeData = [];
            
            if ($displayType === 'featured_category') {
                // Use BulkDataFetcher for categories (static method)
                $completeData = BulkDataFetcher::getCategoriesByIds($entityIds);
            } else {
                // For featured_product and quick_pick, use ProductDataFetcher (instance method)
                foreach ($entityIds as $productId) {
                    $product = $this->productDataFetcher->getProductById($productId);
                    if ($product) {
                        $completeData[] = $product;
                    }
                }
            }
            
            // Map featured item metadata to the complete data
            $result = [];
            foreach ($featuredItems as $featuredItem) {
                $entityId = $featuredItem['entity_id'];
                
                // Find the corresponding entity in the complete data
                foreach ($completeData as $entity) {
                    if ($entity['id'] == $entityId) {
                        // Add featured item metadata
                        $entity['featured_item_id'] = $featuredItem['id'];
                        $entity['display_order'] = $featuredItem['display_order'];
                        $entity['display_type'] = $displayType;
                        
                        $result[] = $entity;
                        break;
                    }
                }
            }
            
            // Sort by display_order
            usort($result, function($a, $b) {
                return $a['display_order'] <=> $b['display_order'];
            });
            
            return $result;
        } catch (Exception $e) {
            error_log("Error in getFeaturedItemsByType: " . $e->getMessage());
            error_log("Stack trace: " . $e->getTraceAsString());
            return [];  // Return empty array instead of throwing exception
        }
    }
    
    /**
     * Get the limit for a specific display type from settings
     *
     * @param string $displayType Type of featured display
     * @return int Limit value or 0 if not found
     */
    private function getSettingLimit(string $displayType): int
    {
        try {
            $settingKey = 'featured_limit_' . $displayType;
            
            $query = "SELECT value FROM settings WHERE `key` = :key LIMIT 1";
            $stmt = $this->db->prepare($query);
            $stmt->bindParam(':key', $settingKey, PDO::PARAM_STR);
            $stmt->execute();
            
            $result = $stmt->fetch(PDO::FETCH_ASSOC);
            
            return $result ? (int)$result['value'] : 0;
        } catch (Exception $e) {
            error_log("Error in getSettingLimit: " . $e->getMessage());
            return 0;
        }
    }
}
