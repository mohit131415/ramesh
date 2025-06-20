<?php

namespace App\Features\ProductCatalog\Subcategories\Services;

use App\Features\ProductCatalog\Subcategories\DataAccess\SubcategoryRepository;
use App\Features\ProductCatalog\Categories\DataAccess\CategoryRepository;
use App\Shared\Exceptions\ValidationException;
use App\Shared\Exceptions\NotFoundException;
use App\Shared\Exceptions\AuthorizationException;
use App\Shared\Helpers\FileUploader;
use Exception;
use App\Features\ProductCatalog\ComprehensiveProducts\DataAccess\ComprehensiveProductRepository;
use App\Features\ProductCatalog\ComprehensiveProducts\Services\ComprehensiveProductService;

class SubcategoryService
{
    private $subcategoryRepository;
    private $categoryRepository;

    public function __construct()
    {
        $this->subcategoryRepository = new SubcategoryRepository();
        $this->categoryRepository = new CategoryRepository();
    }

    /**
     * Get all subcategories with pagination
     *
     * @param int $page Page number
     * @param int $limit Items per page
     * @param array $filters Optional filters
     * @param bool $isSuperAdmin Whether the current user is a super admin
     * @return array Subcategories and pagination metadata
     */
    public function getAllSubcategories($page = 1, $limit = 10, $filters = [], $isSuperAdmin = false)
    {
        try {
            return $this->subcategoryRepository->getAllSubcategories($page, $limit, $filters, $isSuperAdmin);
        } catch (Exception $e) {
            throw new Exception('Failed to get subcategories: ' . $e->getMessage());
        }
    }

    /**
     * Get subcategories by category ID
     *
     * @param int $categoryId Category ID
     * @param int $page Page number
     * @param int $limit Items per page
     * @param array $filters Optional filters
     * @param bool $isSuperAdmin Whether the current user is a super admin
     * @return array Subcategories and pagination metadata
     */
    public function getSubcategoriesByCategoryId($categoryId, $page = 1, $limit = 10, $filters = [], $isSuperAdmin = false)
    {
        try {
            // Check if category exists
            $this->categoryRepository->getCategoryById($categoryId, $isSuperAdmin);
            
            // Add category_id to filters
            $filters['category_id'] = $categoryId;
            
            return $this->subcategoryRepository->getAllSubcategories($page, $limit, $filters, $isSuperAdmin);
        } catch (NotFoundException $e) {
            throw $e;
        } catch (Exception $e) {
            throw new Exception('Failed to get subcategories: ' . $e->getMessage());
        }
    }

    /**
     * Get subcategory by ID
     *
     * @param int $id Subcategory ID
     * @param bool $isSuperAdmin Whether the current user is a super admin
     * @return array Subcategory data
     * @throws NotFoundException
     */
    public function getSubcategoryById($id, $isSuperAdmin = false)
    {
        try {
            return $this->subcategoryRepository->getSubcategoryById($id, $isSuperAdmin);
        } catch (NotFoundException $e) {
            throw $e;
        } catch (Exception $e) {
            throw new Exception('Failed to get subcategory: ' . $e->getMessage());
        }
    }

    /**
     * Get subcategory by slug
     *
     * @param string $slug Subcategory slug
     * @param bool $isSuperAdmin Whether the current user is a super admin
     * @return array Subcategory data
     * @throws NotFoundException
     */
    public function getSubcategoryBySlug($slug, $isSuperAdmin = false)
    {
        try {
            return $this->subcategoryRepository->getSubcategoryBySlug($slug, $isSuperAdmin);
        } catch (NotFoundException $e) {
            throw $e;
        } catch (Exception $e) {
            throw new Exception('Failed to get subcategory: ' . $e->getMessage());
        }
    }

    /**
     * Create a new subcategory
     *
     * @param array $data Subcategory data
     * @param array $file Optional subcategory image file
     * @param int $userId ID of the user creating the subcategory
     * @return array Created subcategory data
     * @throws ValidationException
     */
    public function createSubcategory($data, $file = null, $userId = null)
    {
        try {
            // Validate required fields
            $this->validateSubcategoryData($data);
            
            // Check if category exists
            $this->categoryRepository->getCategoryById($data['category_id']);
            
            // Add created_by if provided
            if ($userId) {
                $data['created_by'] = $userId;
            }
            
            // Handle image upload if provided
            if ($file && !empty($file['tmp_name'])) {
                $uploadResult = $this->uploadSubcategoryImage($file);
                $data['image'] = $uploadResult['path'];
            }
            
            // Create subcategory
            return $this->subcategoryRepository->createSubcategory($data);
        } catch (ValidationException $e) {
            throw $e;
        } catch (NotFoundException $e) {
            throw $e;
        } catch (Exception $e) {
            throw new Exception('Failed to create subcategory: ' . $e->getMessage());
        }
    }

    /**
     * Update a subcategory
     *
     * @param int $id Subcategory ID
     * @param array $data Subcategory data
     * @param array $file Optional subcategory image file
     * @param int $userId ID of the user updating the subcategory
     * @param bool $isSuperAdmin Whether the current user is a super admin
     * @return array Updated subcategory data
     * @throws NotFoundException
     * @throws ValidationException
     */
    public function updateSubcategory($id, $data, $file = null, $userId = null, $isSuperAdmin = false)
    {
        try {
            // Debug log
            error_log("SubcategoryService updateSubcategory - Data: " . json_encode($data));
            error_log("SubcategoryService updateSubcategory - File: " . ($file ? 'Present' : 'Not present'));
        
            // Validate subcategory exists
            $subcategory = $this->subcategoryRepository->getSubcategoryById($id, $isSuperAdmin);
        
            // If subcategory is deleted and user is not super admin, throw error
            if (!empty($subcategory['deleted_at']) && !$isSuperAdmin) {
                throw new NotFoundException('Subcategory not found');
            }
        
            // If category_id is provided, check if category exists
            if (isset($data['category_id'])) {
                $this->categoryRepository->getCategoryById($data['category_id']);
            }
        
            // Add updated_by if provided
            if ($userId) {
                $data['updated_by'] = $userId;
                $data['updated_at'] = date('Y-m-d H:i:s');
            }
        
            // Handle image upload if provided
            if ($file && !empty($file['tmp_name'])) {
                $uploadResult = $this->uploadSubcategoryImage($file);
                $data['image'] = $uploadResult['path'];
        
                // Delete old image if exists
                if (!empty($subcategory['image'])) {
                    $this->deleteSubcategoryImage($subcategory['image']);
                }
            }
        
            // Check if status is being changed to inactive
            if (isset($data['status']) && $data['status'] === 'inactive' && $subcategory['status'] !== 'inactive') {
                // Handle cascading effects for status change
                $this->handleSubcategoryStatusChangeCascade($id, $userId);
            }

            // Check if status is being changed to active
            if (isset($data['status']) && $data['status'] === 'active' && $subcategory['status'] !== 'active') {
                // Handle cascading effects for status change to active
                $this->handleSubcategoryActivationCascade($id, $userId);
            }
        
            // Filter data to only include valid database fields
            $validFields = [
                'category_id', 'name', 'slug', 'description', 'image', 
                'meta_title', 'meta_description', 'meta_keywords',
                'status', 'display_order', 'updated_at', 'updated_by'
            ];
        
            $filteredData = [];
            foreach ($data as $key => $value) {
                if (in_array($key, $validFields)) {
                    $filteredData[$key] = $value;
                }
            }
        
            // Update subcategory with filtered data
            return $this->subcategoryRepository->updateSubcategory($id, $filteredData);
        } catch (NotFoundException $e) {
            throw $e;
        } catch (ValidationException $e) {
            throw $e;
        } catch (Exception $e) {
            error_log("SubcategoryService Error: " . $e->getMessage());
            throw new Exception('Failed to update subcategory: ' . $e->getMessage());
        }
    }

    /**
     * Delete a subcategory
     *
     * @param int $id Subcategory ID
     * @param int $userId ID of the user deleting the subcategory
     * @param bool $isSuperAdmin Whether the current user is a super admin
     * @return bool Success status
     * @throws NotFoundException
     */
    public function deleteSubcategory($id, $userId = null, $isSuperAdmin = false)
    {
        try {
            // Validate subcategory exists
            $subcategory = $this->subcategoryRepository->getSubcategoryById($id, $isSuperAdmin);
        
            // If subcategory is already deleted, throw error
            if (!empty($subcategory['deleted_at'])) {
                throw new ValidationException('Subcategory is already deleted');
            }
        
            // Handle cascading effects before deleting the subcategory
            $this->handleSubcategoryDeletionCascade($id, $userId);
        
            // Delete subcategory
            return $this->subcategoryRepository->deleteSubcategory($id, $userId);
        } catch (NotFoundException $e) {
            throw $e;
        } catch (ValidationException $e) {
            throw $e;
        } catch (Exception $e) {
            throw new Exception('Failed to delete subcategory: ' . $e->getMessage());
        }
    }

    /**
     * Handle cascading effects when a subcategory is deleted
     *
     * @param int $subcategoryId Subcategory ID
     * @param int $userId ID of the user performing the action
     * @return bool Success status
     */
    public function handleSubcategoryDeletionCascade($subcategoryId, $userId)
    {
        try {
            error_log("Starting handleSubcategoryDeletionCascade for subcategory ID: {$subcategoryId}");
            
            // Get all products for this subcategory
            $productRepo = new ComprehensiveProductRepository();
            $products = $productRepo->getComprehensiveProducts(1, 1000, ['subcategory_id' => $subcategoryId], 'created_at', 'desc', true);
            
            error_log("Found " . count($products['data']) . " products for subcategory ID: {$subcategoryId}");
            
            if (!empty($products['data'])) {
                $productService = new ComprehensiveProductService();
                
                // Mark all products as inactive
                foreach ($products['data'] as $product) {
                    // Only update if not already deleted
                    if (empty($product['deleted_at'])) {
                        error_log("Setting product ID: {$product['id']} to inactive (deletion cascade)");
                        
                        try {
                            // Set product to inactive
                            $result = $productService->updateComprehensiveProduct(
                                $product['id'], 
                                ['status' => 'inactive'], 
                                [], // files parameter as empty array
                                $userId
                            );
                            
                            error_log("Product status update result: " . ($result ? "Success" : "Failed"));
                        } catch (Exception $e) {
                            error_log("Error updating product {$product['id']} status: " . $e->getMessage());
                        }
                    }
                }
            } else {
                error_log("No products found for subcategory ID: {$subcategoryId}");
            }
            
            return true;
        } catch (Exception $e) {
            error_log('Error in handleSubcategoryDeletionCascade: ' . $e->getMessage());
            error_log('Stack trace: ' . $e->getTraceAsString());
            return false;
        }
    }

    /**
     * Handle cascading effects when a subcategory status is changed
     *
     * @param int $subcategoryId Subcategory ID
     * @param int $userId ID of the user performing the action
     * @return bool Success status
     */
    public function handleSubcategoryStatusChangeCascade($subcategoryId, $userId)
    {
        try {
            error_log("Starting handleSubcategoryStatusChangeCascade for subcategory ID: {$subcategoryId}");
            
            // Get all products for this subcategory directly from database
            $db = \App\Core\Database::getInstance();
            $sql = "SELECT id, name, status FROM products WHERE subcategory_id = :subcategory_id AND deleted_at IS NULL";
            $params = [':subcategory_id' => $subcategoryId];
            $directProducts = $db->fetchAll($sql, $params);
            
            error_log("Found " . count($directProducts) . " products directly from database for subcategory ID: {$subcategoryId}");
            
            if (!empty($directProducts)) {
                $productService = new ComprehensiveProductService();
                
                // Mark all products as inactive
                foreach ($directProducts as $product) {
                    // Only update if not already inactive or archived
                    if ($product['status'] !== 'inactive' && $product['status'] !== 'archived') {
                        error_log("Setting product ID: {$product['id']} ({$product['name']}) to inactive (status cascade)");
                        
                        try {
                            // Direct database update to ensure it works
                            $updateSql = "UPDATE products SET status = 'inactive', updated_at = NOW() WHERE id = :id";
                            $updateParams = [':id' => $product['id']];
                            $db->query($updateSql, $updateParams);
                            
                            error_log("Product {$product['id']} status updated directly in database");
                            
                            // Also try the service method as a backup
                            $productService->updateComprehensiveProduct(
                                $product['id'], 
                                ['status' => 'inactive'], 
                                [], // files parameter as empty array
                                $userId
                            );
                        } catch (Exception $e) {
                            error_log("Error updating product {$product['id']} status: " . $e->getMessage());
                        }
                    } else {
                        error_log("Product ID: {$product['id']} already has status: {$product['status']}, skipping update");
                    }
                }
            } else {
                error_log("No products found directly from database for subcategory ID: {$subcategoryId}");
                
                // Try the repository method as a fallback
                $productRepo = new ComprehensiveProductRepository();
                $products = $productRepo->getComprehensiveProducts(1, 1000, ['subcategory_id' => $subcategoryId], 'created_at', 'desc', true);
                
                error_log("Found " . count($products['data']) . " products via repository for subcategory ID: {$subcategoryId}");
                
                if (!empty($products['data'])) {
                    $productService = new ComprehensiveProductService();
                    
                    // Mark all products as inactive
                    foreach ($products['data'] as $product) {
                        // Only update if not already deleted and not already inactive or archived
                        if (empty($product['deleted_at']) && $product['status'] !== 'inactive' && $product['status'] !== 'archived') {
                            error_log("Setting product ID: {$product['id']} to inactive (status cascade via repository)");
                            
                            try {
                                // Set product to inactive
                                $productService->updateComprehensiveProduct(
                                    $product['id'], 
                                    ['status' => 'inactive'], 
                                    [], // files parameter as empty array
                                    $userId
                                );
                            } catch (Exception $e) {
                                error_log("Error updating product {$product['id']} status: " . $e->getMessage());
                            }
                        }
                    }
                }
            }
            
            // Update product variants directly
            try {
                $newStatus = 'inactive';
                $variantUpdateQuery = "
                    UPDATE product_variants pv
                    JOIN products p ON pv.product_id = p.id
                    SET pv.status = :status
                    WHERE p.subcategory_id = :subcategory_id
                ";
                
                $variantParams = [
                    ':status' => $newStatus,
                    ':subcategory_id' => $subcategoryId
                ];
                
                $db = \App\Core\Database::getInstance();
                $variantStmt = $db->getConnection()->prepare($variantUpdateQuery);
                foreach ($variantParams as $param => $value) {
                    $variantStmt->bindValue($param, $value);
                }
                
                $variantStmt->execute();
                $variantUpdateCount = $variantStmt->rowCount();
                
                error_log("Updated {$variantUpdateCount} product variants for subcategory {$subcategoryId} to {$newStatus}");
            } catch (Exception $e) {
                error_log("Error updating product variants for subcategory {$subcategoryId}: " . $e->getMessage());
                error_log("Stack trace: " . $e->getTraceAsString());
            }

            return true;
        } catch (Exception $e) {
            error_log('Error in handleSubcategoryStatusChangeCascade: ' . $e->getMessage());
            error_log('Stack trace: ' . $e->getTraceAsString());
            return false;
        }
    }

    /**
     * Handle cascading effects when a subcategory is activated
     *
     * @param int $subcategoryId Subcategory ID
     * @param int $userId ID of the user performing the action
     * @return bool Success status
     */
    public function handleSubcategoryActivationCascade($subcategoryId, $userId)
    {
        try {
            error_log("Starting handleSubcategoryActivationCascade for subcategory ID: {$subcategoryId}");
            
            // Get all products for this subcategory directly from database
            $db = \App\Core\Database::getInstance();
            $sql = "SELECT id, name, status FROM products WHERE subcategory_id = :subcategory_id AND deleted_at IS NULL";
            $params = [':subcategory_id' => $subcategoryId];
            $directProducts = $db->fetchAll($sql, $params);
            
            error_log("Found " . count($directProducts) . " products directly from database for subcategory ID: {$subcategoryId}");
            
            if (!empty($directProducts)) {
                $productService = new ComprehensiveProductService();
                
                // Mark all products as active
                foreach ($directProducts as $product) {
                    // Only update if not already active
                    if ($product['status'] !== 'active') {
                        error_log("Setting product ID: {$product['id']} ({$product['name']}) to active (activation cascade)");
                        
                        try {
                            // Direct database update to ensure it works
                            $updateSql = "UPDATE products SET status = 'active', updated_at = NOW() WHERE id = :id";
                            $updateParams = [':id' => $product['id']];
                            $db->query($updateSql, $updateParams);
                            
                            error_log("Product {$product['id']} status updated directly in database");
                            
                            // Also try the service method as a backup
                            $productService->updateComprehensiveProduct(
                                $product['id'], 
                                ['status' => 'active'], 
                                [], // files parameter as empty array
                                $userId
                            );
                        } catch (Exception $e) {
                            error_log("Error updating product {$product['id']} status: " . $e->getMessage());
                        }
                    } else {
                        error_log("Product ID: {$product['id']} already has status: {$product['status']}, skipping update");
                    }
                }
            } else {
                error_log("No products found directly from database for subcategory ID: {$subcategoryId}");
                
                // Try the repository method as a fallback
                $productRepo = new ComprehensiveProductRepository();
                $products = $productRepo->getComprehensiveProducts(1, 1000, ['subcategory_id' => $subcategoryId], 'created_at', 'desc', true);
                
                error_log("Found " . count($products['data']) . " products via repository for subcategory ID: {$subcategoryId}");
                
                if (!empty($products['data'])) {
                    $productService = new ComprehensiveProductService();
                    
                    // Mark all products as active
                    foreach ($products['data'] as $product) {
                        // Only update if not deleted and not already active
                        if (empty($product['deleted_at']) && $product['status'] !== 'active') {
                            error_log("Setting product ID: {$product['id']} to active (activation cascade via repository)");
                            
                            try {
                                // Set product to active
                                $productService->updateComprehensiveProduct(
                                    $product['id'], 
                                    ['status' => 'active'], 
                                    [], // files parameter as empty array
                                    $userId
                                );
                            } catch (Exception $e) {
                                error_log("Error updating product {$product['id']} status: " . $e->getMessage());
                            }
                        }
                    }
                }
            }
            
            return true;
        } catch (Exception $e) {
            error_log('Error in handleSubcategoryActivationCascade: ' . $e->getMessage());
            error_log('Stack trace: ' . $e->getTraceAsString());
            return false;
        }
    }

    /**
     * Restore a deleted subcategory
     *
     * @param int $id Subcategory ID
     * @param int $userId ID of the user restoring the subcategory
     * @return array Restored subcategory data
     * @throws NotFoundException
     * @throws ValidationException
     */
    public function restoreSubcategory($id, $userId = null)
    {
        try {
            // Restore subcategory
            return $this->subcategoryRepository->restoreSubcategory($id, $userId);
        } catch (NotFoundException $e) {
            throw $e;
        } catch (ValidationException $e) {
            throw $e;
        } catch (Exception $e) {
            throw new Exception('Failed to restore subcategory: ' . $e->getMessage());
        }
    }

    /**
     * Validate subcategory data
     *
     * @param array $data Subcategory data
     * @throws ValidationException
     */
    private function validateSubcategoryData($data)
    {
        $errors = [];
        
        // Required fields
        if (!isset($data['name']) || empty($data['name'])) {
            $errors['name'] = 'Name is required';
        }
        
        if (!isset($data['category_id']) || empty($data['category_id'])) {
            $errors['category_id'] = 'Category ID is required';
        }
        
        // Validate status if provided
        if (isset($data['status']) && !in_array($data['status'], ['active', 'inactive'])) {
            $errors['status'] = 'Status must be either active or inactive';
        }
        
        // Validate display_order if provided
        if (isset($data['display_order']) && !is_numeric($data['display_order'])) {
            $errors['display_order'] = 'Display order must be a number';
        }
        
        if (!empty($errors)) {
            throw new ValidationException('Validation failed', $errors);
        }
    }

    /**
     * Upload subcategory image
     *
     * @param array $file Subcategory image file
     * @return array Upload result with relative path
     * @throws ValidationException
     */
    private function uploadSubcategoryImage($file)
    {
        try {
            $uploadDir = APP_ROOT . '/public/uploads/subcategories/';
            
            // Create directory if it doesn't exist
            if (!is_dir($uploadDir)) {
                mkdir($uploadDir, 0755, true);
            }
            
            // Define allowed file types and max size
            $options = [
                'allowed_types' => ['jpg', 'jpeg', 'png', 'gif', 'webp'],
                'max_size' => 2 * 1024 * 1024, // 2MB
                'encrypt_name' => true
            ];
            
            // Upload file
            $fileUploader = new FileUploader();
            $result = $fileUploader->upload($file, $uploadDir, $options);
            
            // Convert absolute path to relative path
            $relativePath = 'uploads/subcategories/' . basename($result['path']);
            $result['path'] = $relativePath;
            
            return $result;
        } catch (ValidationException $e) {
            throw $e;
        } catch (Exception $e) {
            throw new Exception('Failed to upload subcategory image: ' . $e->getMessage());
        }
    }

    /**
     * Delete subcategory image
     *
     * @param string $imagePath Path to subcategory image
     * @return bool Success status
     */
    private function deleteSubcategoryImage($imagePath)
    {
        try {
            // If image path is a URL, extract the path part
            if (filter_var($imagePath, FILTER_VALIDATE_URL)) {
                $baseUrl = config('app.url');
                $imagePath = str_replace($baseUrl, APP_ROOT . '/public', $imagePath);
            } else {
                $imagePath = APP_ROOT . '/public/' . ltrim($imagePath, '/');
            }
            
            // Delete file if it exists
            if (file_exists($imagePath)) {
                return unlink($imagePath);
            }
            
            return false;
        } catch (Exception $e) {
            // Log error but don't throw - this is a non-critical operation
            error_log('Failed to delete subcategory image: ' . $e->getMessage());
            return false;
        }
    }
}
