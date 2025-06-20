<?php

namespace App\Features\ProductCatalog\ProductImages\DataAccess;

use App\Core\Database;
use Exception;

class ProductImageRepository
{
    private $database;

    public function __construct()
    {
        $this->database = Database::getInstance();
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
            
            // Add full URL to image paths
            foreach ($images as &$image) {
                $baseUrl = isset($_SERVER['HTTP_HOST']) ? 
                       ((isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? "https://" : "http://") . $_SERVER['HTTP_HOST']) : 
                       '';
            
                if (!empty($image['image_path']) && strpos($image['image_path'], 'http') !== 0) {
                    $image['image_url'] = $baseUrl . '/' . ltrim($image['image_path'], '/');
                } else {
                    $image['image_url'] = $image['image_path'];
                }
            }
            
            return $images;
        } catch (Exception $e) {
            error_log("Error getting product images: " . $e->getMessage());
            return [];
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
            $imageData = [
                'product_id' => $productId,
                'image_path' => $imagePath,
                'is_primary' => $isPrimary ? 1 : 0,
                'display_order' => $displayOrder,
                'created_at' => date('Y-m-d H:i:s')
            ];
            
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
            $image = $this->database->fetch(
                "SELECT id, image_path FROM product_images WHERE id = :id AND product_id = :product_id",
                [':id' => $imageId, ':product_id' => $productId]
            );
        
            if (!$image) {
                return false;
            }
        
            $deleted = $this->database->delete('product_images', ['id' => $imageId]);
            
            return $deleted;
        } catch (Exception $e) {
            error_log("Error in deleteProductImage: " . $e->getMessage());
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
            
            return $updated;
        } catch (Exception $e) {
            error_log("Error in setPrimaryProductImage: " . $e->getMessage());
            throw new Exception('Error setting primary product image: ' . $e->getMessage());
        }
    }
}
