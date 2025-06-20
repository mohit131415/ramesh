<?php

namespace App\Features\ProductCatalog\ProductImages\Services;

use App\Features\ProductCatalog\ProductImages\DataAccess\ProductImageRepository;
use App\Features\ProductCatalog\ComprehensiveProducts\DataAccess\ComprehensiveProductRepository;
use App\Core\Database;
use App\Shared\Exceptions\NotFoundException;
use App\Shared\Exceptions\ValidationException;
use Exception;

class ProductImageService
{
    private $imageRepository;
    private $productRepository;
    private $database;

    public function __construct()
    {
        $this->imageRepository = new ProductImageRepository();
        $this->productRepository = new ComprehensiveProductRepository();
        $this->database = Database::getInstance();
    }

    /**
     * Upload images for a product
     *
     * @param int $productId Product ID
     * @param array $files Uploaded files
     * @param array $options Upload options
     * @param int $userId User ID
     * @return array Result with uploaded images and product data
     */
    public function uploadProductImages($productId, $files, $options = [], $userId = null)
    {
        try {
            $this->database->beginTransaction();
            
            // Verify product exists
            $product = $this->productRepository->getProductById($productId);
            if (!$product) {
                throw new NotFoundException('The product you\'re trying to upload images for doesn\'t exist.');
            }
            
            // Get current images
            $currentImages = $this->imageRepository->getProductImages($productId);
            
            // Process delete operations first
            if (!empty($options['delete_all_images'])) {
                // Delete all existing images
                foreach ($currentImages as $image) {
                    $this->imageRepository->deleteProductImage($productId, $image['id']);
                    $this->deleteImageFile($image['image_path']);
                }
                $currentImages = [];
            } else if (!empty($options['delete_image_ids'])) {
                // Delete specific images
                foreach ($options['delete_image_ids'] as $imageId) {
                    $imageToDelete = null;
                    foreach ($currentImages as $key => $image) {
                        if ($image['id'] == $imageId) {
                            $imageToDelete = $image;
                            unset($currentImages[$key]);
                            break;
                        }
                    }
                    
                    if ($imageToDelete) {
                        $this->imageRepository->deleteProductImage($productId, $imageId);
                        $this->deleteImageFile($imageToDelete['image_path']);
                    }
                }
                $currentImages = array_values($currentImages); // Re-index array
            }
            
            // Upload new images
            $uploadedImages = $this->processImageUploads($productId, $files, $currentImages);
            
            // Get all images after upload
            $allImages = $this->imageRepository->getProductImages($productId);
            
            // Handle primary image setting
            if (!empty($options['make_first_primary']) && !empty($uploadedImages)) {
                // Make the first uploaded image primary
                $firstUploadedImageId = $uploadedImages[0]['id'];
                $this->imageRepository->setPrimaryProductImage($productId, $firstUploadedImageId);
            } else if (!empty($options['primary_image_id'])) {
                // Set specific image as primary
                $this->imageRepository->setPrimaryProductImage($productId, $options['primary_image_id']);
            } else if (empty($currentImages) && !empty($uploadedImages)) {
                // If no existing images and we uploaded new ones, make first uploaded primary
                $this->imageRepository->setPrimaryProductImage($productId, $uploadedImages[0]['id']);
            }
            
            // Handle image ordering
            if (!empty($options['image_order'])) {
                $this->reorderProductImages($productId, $options['image_order']);
            }
            
            $this->database->commit();
            
            // Get final product data with all images
            $finalProduct = $this->productRepository->getComprehensiveProductById($productId, true);
            
            return [
                'product' => $finalProduct,
                'uploaded_images' => $uploadedImages,
                'total_images' => count($finalProduct['images']),
                'message' => count($uploadedImages) . ' image(s) uploaded successfully'
            ];
            
        } catch (Exception $e) {
            if ($this->database->getConnection()->inTransaction()) {
                $this->database->rollback();
            }
            error_log("Error in uploadProductImages: " . $e->getMessage());
            error_log("Stack trace: " . $e->getTraceAsString());
            throw $e;
        }
    }

    /**
     * Process image uploads
     *
     * @param int $productId Product ID
     * @param array $files Uploaded files
     * @param array $currentImages Current product images
     * @return array Uploaded images data
     */
    private function processImageUploads($productId, $files, $currentImages)
    {
        $uploadedImages = [];
        
        // Create upload directory
        $baseUploadDir = $_SERVER['DOCUMENT_ROOT'] . '/ramesh-be/be/api/public/uploads/product_images/';
        $relativeUploadDir = 'uploads/product_images/';
        
        if (!is_dir($baseUploadDir)) {
            if (!mkdir($baseUploadDir, 0755, true)) {
                throw new Exception("Couldn't create the image upload directory. Please try again later.");
            }
        }
        
        // Get current highest display order
        $highestOrder = 0;
        foreach ($currentImages as $image) {
            if ($image['display_order'] > $highestOrder) {
                $highestOrder = $image['display_order'];
            }
        }
        
        // Validate and upload files
        $this->validateImageFiles($files);
        
        $fileCount = count($files['name']);
        
        for ($i = 0; $i < $fileCount; $i++) {
            // Skip empty uploads
            if ($files['error'][$i] !== UPLOAD_ERR_OK || empty($files['name'][$i])) {
                continue;
            }
            
            $fileName = $files['name'][$i];
            $fileTmpName = $files['tmp_name'][$i];
            $fileType = $files['type'][$i];
            $fileSize = $files['size'][$i];
            
            // Generate unique filename
            $fileExtension = pathinfo($fileName, PATHINFO_EXTENSION);
            $uniqueHash = time() . '_' . bin2hex(random_bytes(8));
            $newFileName = $uniqueHash . '.' . $fileExtension;
            $fullFilePath = $baseUploadDir . $newFileName;
            $relativeFilePath = $relativeUploadDir . $newFileName;
            
            // Upload file
            if (!move_uploaded_file($fileTmpName, $fullFilePath)) {
                throw new Exception("Failed to upload image: {$fileName}");
            }
            
            // Determine if this should be primary
            $isPrimary = (empty($currentImages) && $i === 0) ? 1 : 0;
            
            // Create image record
            $imageId = $this->imageRepository->createProductImage(
                $productId,
                $relativeFilePath,
                $isPrimary,
                $highestOrder + $i + 1
            );
            
            if (!$imageId) {
                // If database insert failed, remove the uploaded file
                if (file_exists($fullFilePath)) {
                    unlink($fullFilePath);
                }
                throw new Exception("Failed to save image record for: {$fileName}");
            }
            
            $uploadedImages[] = [
                'id' => $imageId,
                'product_id' => $productId,
                'image_path' => $relativeFilePath,
                'is_primary' => $isPrimary,
                'display_order' => $highestOrder + $i + 1,
                'original_name' => $fileName
            ];
        }
        
        return $uploadedImages;
    }

    /**
     * Validate image files
     *
     * @param array $files Image files
     * @throws ValidationException If validation fails
     */
    private function validateImageFiles($files)
    {
        $allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
        $maxFileSize = 5 * 1024 * 1024; // 5MB
        
        if (!isset($files['name']) || !is_array($files['name'])) {
            throw new ValidationException("Invalid file upload structure");
        }
        
        $fileCount = count($files['name']);
        $validFileCount = 0;
        
        for ($i = 0; $i < $fileCount; $i++) {
            // Skip empty uploads
            if ($files['error'][$i] !== UPLOAD_ERR_OK || empty($files['name'][$i])) {
                continue;
            }
            
            $validFileCount++;
            $fileName = $files['name'][$i];
            $fileType = $files['type'][$i];
            $fileSize = $files['size'][$i];
            
            // Check file type
            if (!in_array($fileType, $allowedTypes)) {
                throw new ValidationException("Please upload only JPEG, PNG, GIF, or WebP image files. File '{$fileName}' has type '{$fileType}'.");
            }
            
            // Check file size
            if ($fileSize > $maxFileSize) {
                throw new ValidationException("Your image '{$fileName}' is too large. Please upload images smaller than 5MB.");
            }
        }
        
        if ($validFileCount === 0) {
            throw new ValidationException("No valid image files found. Please select at least one image to upload.");
        }
    }

    /**
     * Delete an image file from storage
     *
     * @param string $imagePath Relative path to the image
     * @return bool Success
     */
    private function deleteImageFile($imagePath)
    {
        try {
            $fullPath = $_SERVER['DOCUMENT_ROOT'] . '/ramesh-be/be/api/public/' . $imagePath;
            
            if (file_exists($fullPath)) {
                return unlink($fullPath);
            }
            
            return true; // Consider it success if file doesn't exist
        } catch (Exception $e) {
            error_log("Error deleting image file: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Reorder product images
     *
     * @param int $productId Product ID
     * @param array $imageOrder Array of image IDs in desired order
     * @return bool Success
     */
    private function reorderProductImages($productId, $imageOrder)
    {
        try {
            foreach ($imageOrder as $index => $imageId) {
                $this->database->update(
                    'product_images',
                    ['display_order' => $index],
                    ['id' => $imageId, 'product_id' => $productId]
                );
            }
            return true;
        } catch (Exception $e) {
            error_log("Error reordering images: " . $e->getMessage());
            throw new Exception('Failed to reorder images');
        }
    }
}
