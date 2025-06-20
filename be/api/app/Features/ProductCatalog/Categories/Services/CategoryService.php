<?php

namespace App\Features\ProductCatalog\Categories\Services;

use App\Features\ProductCatalog\Categories\DataAccess\CategoryRepository;
use App\Shared\Exceptions\ValidationException;
use App\Shared\Exceptions\NotFoundException;
use App\Shared\Exceptions\AuthorizationException;
use App\Shared\Helpers\FileUploader;
use Exception;

class CategoryService
{
    private $categoryRepository;

    public function __construct()
    {
        $this->categoryRepository = new CategoryRepository();
    }

    /**
     * Get all categories with pagination
     *
     * @param int $page Page number
     * @param int $limit Items per page
     * @param array $filters Optional filters
     * @param bool $isSuperAdmin Whether the current user is a super admin
     * @return array Categories and pagination metadata
     */
    public function getAllCategories($page = 1, $limit = 10, $filters = [], $isSuperAdmin = false)
    {
        try {
            return $this->categoryRepository->getAllCategories($page, $limit, $filters, $isSuperAdmin);
        } catch (Exception $e) {
            throw new Exception('Failed to get categories: ' . $e->getMessage());
        }
    }

    /**
     * Get category by ID
     *
     * @param int $id Category ID
     * @param bool $isSuperAdmin Whether the current user is a super admin
     * @return array Category data
     * @throws NotFoundException
     */
    public function getCategoryById($id, $isSuperAdmin = false)
    {
        try {
            return $this->categoryRepository->getCategoryById($id, $isSuperAdmin);
        } catch (NotFoundException $e) {
            throw $e;
        } catch (Exception $e) {
            throw new Exception('Failed to get category: ' . $e->getMessage());
        }
    }

    /**
     * Get category by slug
     *
     * @param string $slug Category slug
     * @param bool $isSuperAdmin Whether the current user is a super admin
     * @return array Category data
     * @throws NotFoundException
     */
    public function getCategoryBySlug($slug, $isSuperAdmin = false)
    {
        try {
            return $this->categoryRepository->getCategoryBySlug($slug, $isSuperAdmin);
        } catch (NotFoundException $e) {
            throw $e;
        } catch (Exception $e) {
            throw new Exception('Failed to get category: ' . $e->getMessage());
        }
    }

    /**
     * Get categories with nested subcategories (tree structure)
     *
     * @param int $page Page number
     * @param int $limit Items per page
     * @param array $filters Optional filters for categories
     * @param array $subcategoryOptions Options for subcategories
     * @param bool $isSuperAdmin Whether the current user is a super admin
     * @return array Categories with nested subcategories and pagination metadata
     */
    public function getCategoryTree($page = 1, $limit = 10, $filters = [], $subcategoryOptions = [], $isSuperAdmin = false)
    {
        try {
            return $this->categoryRepository->getCategoryTree($page, $limit, $filters, $subcategoryOptions, $isSuperAdmin);
        } catch (Exception $e) {
            throw new Exception('Failed to get category tree: ' . $e->getMessage());
        }
    }

    /**
     * Create a new category
     *
     * @param array $data Category data
     * @param array $file Optional category image file
     * @param int $userId ID of the user creating the category
     * @return array Created category data
     * @throws ValidationException
     */
    public function createCategory($data, $file = null, $userId = null)
    {
        try {
            // Validate required fields
            $this->validateCategoryData($data);
            
            // Process is_takeaway field
            if (isset($data['is_takeaway'])) {
                $data['is_takeaway'] = (int) $data['is_takeaway'];
            }
        
            // Add created_by if provided
            if ($userId) {
                $data['created_by'] = $userId;
            }
        
            // Handle image upload if provided
            if ($file && !empty($file['tmp_name'])) {
                $uploadResult = $this->uploadCategoryImage($file);
                $data['image'] = $uploadResult['path'];
            }
        
            // Create category
            return $this->categoryRepository->createCategory($data);
        } catch (ValidationException $e) {
            throw $e;
        } catch (Exception $e) {
            throw new Exception('Failed to create category: ' . $e->getMessage());
        }
    }

    /**
     * Update a category
     *
     * @param int $id Category ID
     * @param array $data Category data
     * @param array $file Optional category image file
     * @param int $userId ID of the user updating the category
     * @param bool $isSuperAdmin Whether the current user is a super admin
     * @return array Updated category data
     * @throws NotFoundException
     * @throws ValidationException
     */
    public function updateCategory($id, $data, $file = null, $userId = null, $isSuperAdmin = false)
    {
        try {
            // Debug log
            error_log("CategoryService updateCategory - Data: " . json_encode($data));
            error_log("CategoryService updateCategory - File: " . ($file ? 'Present' : 'Not present'));
            
            // Process is_takeaway field
            if (isset($data['is_takeaway'])) {
                $data['is_takeaway'] = (int) $data['is_takeaway'];
            }

            // Add updated_by if provided
            if ($userId) {
                $data['updated_by'] = $userId;
                $data['updated_at'] = date('Y-m-d H:i:s');
            }
            
            // Validate category exists
            $category = $this->categoryRepository->getCategoryById($id, $isSuperAdmin);
            
            // If category is deleted and user is not super admin, throw error
            if (!empty($category['deleted_at']) && !$isSuperAdmin) {
                throw new NotFoundException('Category not found');
            }
            
            
            // Handle image upload if provided
            if ($file && !empty($file['tmp_name'])) {
                $uploadResult = $this->uploadCategoryImage($file);
                $data['image'] = $uploadResult['path'];
        
            // Delete old image if exists
            if (!empty($category['image'])) {
                $this->deleteCategoryImage($category['image']);
            }
        }
        
        // Check if status is being changed to inactive
        if (isset($data['status']) && $data['status'] === 'inactive' && $category['status'] !== 'inactive') {
            // Handle cascading effects for status change
            $this->handleCategoryStatusChangeCascade($id, $data['status'], $userId);
        }

        // Check if status is being changed to active
        if (isset($data['status']) && $data['status'] === 'active' && $category['status'] !== 'active') {
            // Handle cascading effects for status change to active
            $this->handleCategoryActivationCascade($id, $userId);
        }
        
        // Filter data to only include valid database fields
        $validFields = [
            'name', 'slug', 'description', 'image', 
            'meta_title', 'meta_description', 'meta_keywords',
            'status', 'display_order', 'updated_at', 'updated_by', 'is_takeaway'
        ];
        
        $filteredData = [];
        foreach ($data as $key => $value) {
            if (in_array($key, $validFields)) {
                $filteredData[$key] = $value;
            }
        }
        
        // Update category with filtered data
        return $this->categoryRepository->updateCategory($id, $filteredData);
    } catch (NotFoundException $e) {
        throw $e;
    } catch (ValidationException $e) {
        throw $e;
    } catch (Exception $e) {
        error_log("CategoryService Error: " . $e->getMessage());
        throw new Exception('Failed to update category: ' . $e->getMessage());
    }
}

/**
 * Delete a category
 *
 * @param int $id Category ID
 * @param int $userId ID of the user deleting the category
 * @param bool $isSuperAdmin Whether the current user is a super admin
 * @return bool Success status
 * @throws NotFoundException
 */
public function deleteCategory($id, $userId = null, $isSuperAdmin = false)
{
    try {
        // Validate category exists
        $category = $this->categoryRepository->getCategoryById($id, $isSuperAdmin);
        
        // If category is already deleted, throw error
        if (!empty($category['deleted_at'])) {
            throw new ValidationException('Category is already deleted');
        }
        
        // Handle cascading effects before deleting the category
        $this->handleCategoryDeletionCascade($id, $userId);
        
        // Delete category
        return $this->categoryRepository->deleteCategory($id, $userId);
    } catch (NotFoundException $e) {
        throw $e;
    } catch (ValidationException $e) {
        throw $e;
    } catch (Exception $e) {
        throw new Exception('Failed to delete category: ' . $e->getMessage());
    }
}

/**
 * Handle cascading effects when a category is deleted
 *
 * @param int $categoryId Category ID
 * @param int $userId ID of the user performing the action
 * @return bool Success status
 */
private function handleCategoryDeletionCascade($categoryId, $userId)
{
    try {
        error_log("Starting handleCategoryDeletionCascade for category ID: {$categoryId}");
        
        // Get all subcategories for this category
        $subcategoriesRepo = new \App\Features\ProductCatalog\Subcategories\DataAccess\SubcategoryRepository();
        $subcategories = $subcategoriesRepo->getAllSubcategories(1, 1000, ['category_id' => $categoryId], true);
        
        error_log("Found " . count($subcategories['data']) . " subcategories for category ID: {$categoryId}");
        
        if (!empty($subcategories['data'])) {
            $subcategoryService = new \App\Features\ProductCatalog\Subcategories\Services\SubcategoryService();
            
            // Mark all subcategories as inactive
            foreach ($subcategories['data'] as $subcategory) {
                // Only update if not already deleted
                if (empty($subcategory['deleted_at'])) {
                    error_log("Setting subcategory ID: {$subcategory['id']} to inactive (deletion cascade)");
                    
                    try {
                        // Set subcategory to inactive
                        $subcategoryService->updateSubcategory(
                            $subcategory['id'], 
                            ['status' => 'inactive'], 
                            null, 
                            $userId, 
                            true
                        );
                        
                        // Handle cascading to products
                        $subcategoryService->handleSubcategoryStatusChangeCascade($subcategory['id'], $userId);
                    } catch (Exception $e) {
                        error_log("Error updating subcategory {$subcategory['id']} status: " . $e->getMessage());
                    }
                }
            }
        }
        
        // Also directly update products that belong to this category
        try {
            $db = \App\Core\Database::getInstance();
            
            // Get all products for this category
            $sql = "SELECT id, name, status FROM products WHERE category_id = :category_id AND deleted_at IS NULL";
            $params = [':category_id' => $categoryId];
            $products = $db->fetchAll($sql, $params);
            
            error_log("Found " . count($products) . " products directly for category ID: {$categoryId}");
            
            if (!empty($products)) {
                // Update all products to inactive
                foreach ($products as $product) {
                    if ($product['status'] !== 'inactive' && $product['status'] !== 'archived') {
                        error_log("Directly setting product ID: {$product['id']} ({$product['name']}) to inactive");
                        
                        $updateSql = "UPDATE products SET status = 'inactive', updated_at = NOW() WHERE id = :id";
                        $updateParams = [':id' => $product['id']];
                        $db->query($updateSql, $updateParams);
                    }
                }
            }
        } catch (Exception $e) {
            error_log("Error directly updating products for category {$categoryId}: " . $e->getMessage());
        }
        
        return true;
    } catch (Exception $e) {
        error_log('Error in handleCategoryDeletionCascade: ' . $e->getMessage());
        error_log('Stack trace: ' . $e->getTraceAsString());
        return false;
    }
}

/**
 * Handle cascading effects when a category status is changed
 *
 * @param int $categoryId Category ID
 * @param string $status New status
 * @param int $userId ID of the user performing the action
 * @return bool Success status
 */
private function handleCategoryStatusChangeCascade($categoryId, $status, $userId)
{
    // Only cascade if the category is being set to inactive
    if ($status !== 'inactive') {
        return true;
    }
    
    try {
        error_log("Starting handleCategoryStatusChangeCascade for category ID: {$categoryId}");
        
        // Get all subcategories for this category
        $subcategoriesRepo = new \App\Features\ProductCatalog\Subcategories\DataAccess\SubcategoryRepository();
        $subcategories = $subcategoriesRepo->getAllSubcategories(1, 1000, ['category_id' => $categoryId], true);
        
        error_log("Found " . count($subcategories['data']) . " subcategories for category ID: {$categoryId}");
        
        if (!empty($subcategories['data'])) {
            $subcategoryService = new \App\Features\ProductCatalog\Subcategories\Services\SubcategoryService();
            
            // Mark all subcategories as inactive
            foreach ($subcategories['data'] as $subcategory) {
                // Only update if not already deleted and not already inactive
                if (empty($subcategory['deleted_at']) && $subcategory['status'] !== 'inactive') {
                    error_log("Setting subcategory ID: {$subcategory['id']} to inactive (status cascade)");
                    
                    try {
                        // Set subcategory to inactive
                        $subcategoryService->updateSubcategory(
                            $subcategory['id'], 
                            ['status' => 'inactive'], 
                            null, 
                            $userId, 
                            true
                        );
                        
                        // Handle cascading to products
                        $subcategoryService->handleSubcategoryStatusChangeCascade($subcategory['id'], $userId);
                    } catch (Exception $e) {
                        error_log("Error updating subcategory {$subcategory['id']} status: " . $e->getMessage());
                    }
                }
            }
        }
        
        // Also directly update products that belong to this category
        try {
            $db = \App\Core\Database::getInstance();
            
            // Get all products for this category
            $sql = "SELECT id, name, status FROM products WHERE category_id = :category_id AND deleted_at IS NULL";
            $params = [':category_id' => $categoryId];
            $products = $db->fetchAll($sql, $params);
            
            error_log("Found " . count($products) . " products directly for category ID: {$categoryId}");
            
            if (!empty($products)) {
                // Update all products to inactive
                foreach ($products as $product) {
                    if ($product['status'] !== 'inactive' && $product['status'] !== 'archived') {
                        error_log("Directly setting product ID: {$product['id']} ({$product['name']}) to inactive");
                        
                        $updateSql = "UPDATE products SET status = 'inactive', updated_at = NOW() WHERE id = :id";
                        $updateParams = [':id' => $product['id']];
                        $db->query($updateSql, $updateParams);
                    }
                }
            }
        } catch (Exception $e) {
            error_log("Error directly updating products for category {$categoryId}: " . $e->getMessage());
        }
        
        // Update product variants directly
        try {
            $db = \App\Core\Database::getInstance();
            $newStatus = 'inactive';
            
            $variantUpdateQuery = "
                UPDATE product_variants pv
                JOIN products p ON pv.product_id = p.id
                SET pv.status = :status
                WHERE p.category_id = :category_id
            ";
            
            $variantParams = [
                ':status' => $newStatus,
                ':category_id' => $categoryId
            ];
            
            $variantStmt = $db->getConnection()->prepare($variantUpdateQuery);
            foreach ($variantParams as $param => $value) {
                $variantStmt->bindValue($param, $value);
            }
            
            $variantStmt->execute();
            $variantUpdateCount = $variantStmt->rowCount();
            
            error_log("Updated {$variantUpdateCount} product variants for category {$categoryId} to {$newStatus}");
        } catch (Exception $e) {
            error_log("Error updating product variants for category {$categoryId}: " . $e->getMessage());
            error_log("Stack trace: " . $e->getTraceAsString());
        }
        
        return true;
    } catch (Exception $e) {
        error_log('Error in handleCategoryStatusChangeCascade: ' . $e->getMessage());
        error_log('Stack trace: ' . $e->getTraceAsString());
        return false;
    }
}

/**
 * Handle cascading effects when a category is activated
 *
 * @param int $categoryId Category ID
 * @param int $userId ID of the user performing the action
 * @return bool Success status
 */
private function handleCategoryActivationCascade($categoryId, $userId)
{
    try {
        error_log("Starting handleCategoryActivationCascade for category ID: {$categoryId}");
        
        // Get all subcategories for this category
        $subcategoriesRepo = new \App\Features\ProductCatalog\Subcategories\DataAccess\SubcategoryRepository();
        $subcategories = $subcategoriesRepo->getAllSubcategories(1, 1000, ['category_id' => $categoryId], true);
        
        error_log("Found " . count($subcategories['data']) . " subcategories for category ID: {$categoryId}");
        
        if (!empty($subcategories['data'])) {
            $subcategoryService = new \App\Features\ProductCatalog\Subcategories\Services\SubcategoryService();
            
            // Mark all subcategories as active
            foreach ($subcategories['data'] as $subcategory) {
                // Only update if not deleted and not already active
                if (empty($subcategory['deleted_at']) && $subcategory['status'] !== 'active') {
                    error_log("Setting subcategory ID: {$subcategory['id']} to active (activation cascade)");
                    
                    try {
                        // Set subcategory to active
                        $subcategoryService->updateSubcategory(
                            $subcategory['id'], 
                            ['status' => 'active'], 
                            null, 
                            $userId, 
                            true
                        );
                        
                        // Handle cascading to products
                        $subcategoryService->handleSubcategoryActivationCascade($subcategory['id'], $userId);
                    } catch (Exception $e) {
                        error_log("Error updating subcategory {$subcategory['id']} status: " . $e->getMessage());
                    }
                }
            }
        }
        
        // Also directly update products that belong to this category
        try {
            $db = \App\Core\Database::getInstance();
            
            // Get all products for this category
            $sql = "SELECT id, name, status FROM products WHERE category_id = :category_id AND deleted_at IS NULL";
            $params = [':category_id' => $categoryId];
            $products = $db->fetchAll($sql, $params);
            
            error_log("Found " . count($products) . " products directly for category ID: {$categoryId}");
            
            if (!empty($products)) {
                // Update all products to active
                foreach ($products as $product) {
                    if ($product['status'] !== 'active') {
                        error_log("Directly setting product ID: {$product['id']} ({$product['name']}) to active");
                        
                        $updateSql = "UPDATE products SET status = 'active', updated_at = NOW() WHERE id = :id";
                        $updateParams = [':id' => $product['id']];
                        $db->query($updateSql, $updateParams);
                    }
                }
            }
        } catch (Exception $e) {
            error_log("Error directly updating products for category {$categoryId}: " . $e->getMessage());
        }
        
        // Update product variants directly
        try {
            $db = \App\Core\Database::getInstance();
            $newStatus = 'active';
            
            $variantUpdateQuery = "
                UPDATE product_variants pv
                JOIN products p ON pv.product_id = p.id
                SET pv.status = :status
                WHERE p.category_id = :category_id
            ";
            
            $variantParams = [
                ':status' => $newStatus,
                ':category_id' => $categoryId
            ];
            
            $variantStmt = $db->getConnection()->prepare($variantUpdateQuery);
            foreach ($variantParams as $param => $value) {
                $variantStmt->bindValue($param, $value);
            }
            
            $variantStmt->execute();
            $variantUpdateCount = $variantStmt->rowCount();
            
            error_log("Updated {$variantUpdateCount} product variants for category {$categoryId} to {$newStatus}");
        } catch (Exception $e) {
            error_log("Error updating product variants for category {$categoryId}: " . $e->getMessage());
            error_log("Stack trace: " . $e->getTraceAsString());
        }
        
        return true;
    } catch (Exception $e) {
        error_log('Error in handleCategoryActivationCascade: ' . $e->getMessage());
        error_log('Stack trace: ' . $e->getTraceAsString());
        return false;
    }
}

/**
 * Restore a deleted category
 *
 * @param int $id Category ID
 * @param int $userId ID of the user restoring the category
 * @return array Restored category data
 * @throws NotFoundException
 * @throws ValidationException
 */
public function restoreCategory($id, $userId = null)
{
    try {
        // Restore category
        return $this->categoryRepository->restoreCategory($id, $userId);
    } catch (NotFoundException $e) {
        throw $e;
    } catch (ValidationException $e) {
        throw $e;
    } catch (Exception $e) {
        throw new Exception('Failed to restore category: ' . $e->getMessage());
    }
}

/**
 * Validate category data
 *
 * @param array $data Category data
 * @throws ValidationException
 */
private function validateCategoryData($data)
{
    $errors = [];
        
    // Required fields
    if (!isset($data['name']) || empty($data['name'])) {
        $errors['name'] = 'Name is required';
    }
        
    // Validate status if provided
    if (isset($data['status']) && !in_array($data['status'], ['active', 'inactive'])) {
        $errors['status'] = 'Status must be either active or inactive';
    }
        
    // Validate display_order if provided
    if (isset($data['display_order']) && !is_numeric($data['display_order'])) {
        $errors['display_order'] = 'Display order must be a number';
    }

    // Validate is_takeaway if provided
    if (isset($data['is_takeaway']) && !in_array($data['is_takeaway'], [0, 1, '0', '1', true, false])) {
        $errors['is_takeaway'] = 'Takeaway option must be 0 or 1';
    }
        
    if (!empty($errors)) {
        throw new ValidationException('Validation failed', $errors);
    }
}

/**
 * Upload category image
 *
 * @param array $file Category image file
 * @return array Upload result with relative path
 * @throws ValidationException
 */
private function uploadCategoryImage($file)
{
    try {
        $uploadDir = APP_ROOT . '/public/uploads/categories/';
            
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
        $relativePath = 'uploads/categories/' . basename($result['path']);
        $result['path'] = $relativePath;
            
        return $result;
    } catch (ValidationException $e) {
        throw $e;
    } catch (Exception $e) {
        throw new Exception('Failed to upload category image: ' . $e->getMessage());
    }
}

/**
 * Delete category image
 *
 * @param string $imagePath Path to category image
 * @return bool Success status
 */
private function deleteCategoryImage($imagePath)
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
        error_log('Failed to delete category image: ' . $e->getMessage());
        return false;
    }
}
}
