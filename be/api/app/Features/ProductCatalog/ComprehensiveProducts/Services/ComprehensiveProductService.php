<?php

namespace App\Features\ProductCatalog\ComprehensiveProducts\Services;

use App\Features\ProductCatalog\ComprehensiveProducts\DataAccess\ComprehensiveProductRepository;
use App\Core\Database;
use App\Shared\Helpers\InputSanitizer;
use App\Shared\Exceptions\NotFoundException;
use Exception;

class ComprehensiveProductService
{
   private $productRepository;
   private $database;

   public function __construct()
   {
       $this->productRepository = new ComprehensiveProductRepository();
       $this->database = Database::getInstance();
   }

   /**
    * Get a product by SKU
    *
    * @param string $sku The SKU to search for
    * @param bool $isSuperAdmin Whether the current user is a super admin
    * @return array|null Product data or null if not found
    */
   public function getProductBySku($sku, $isSuperAdmin = false)
   {
       try {
           // Sanitize the SKU
           $sku = InputSanitizer::sanitize($sku);
           
           if (empty($sku)) {
               throw new Exception('SKU cannot be empty');
           }
           
           // Get product ID from the repository
           $productId = $this->productRepository->getProductIdBySku($sku);
           
           if (!$productId) {
               return null;
           }
           
           // Get the comprehensive product data
           return $this->getComprehensiveProductById($productId, $isSuperAdmin);
       } catch (Exception $e) {
           error_log("Error in getProductBySku: " . $e->getMessage());
           throw new Exception('Error retrieving product by SKU: ' . $e->getMessage());
       }
   }

   /**
    * Get products by partial SKU match
    *
    * @param string $sku The SKU to search for
    *
    * @param bool $isSuperAdmin Whether the current user is a super admin
    * @param int $limit Maximum number of results to return
    * @return array Array of products
    */
   public function getProductsByPartialSku($sku, $isSuperAdmin = false, $limit = 10)
   {
       try {
           // Sanitize the SKU
           $sku = InputSanitizer::sanitize($sku);
           
           if (empty($sku)) {
               throw new Exception('SKU cannot be empty');
           }
           
           // Get product IDs from the repository
           $productIds = $this->productRepository->getProductIdsByPartialSku($sku, $limit);
           
           if (empty($productIds)) {
               return [];
           }
           
           // Get comprehensive product data for each ID
           $products = [];
           foreach ($productIds as $productId) {
               $product = $this->getComprehensiveProductById($productId, $isSuperAdmin);
               if ($product) {
                   $products[] = $product;
               }
           }
           
           return $products;
       } catch (Exception $e) {
           error_log("Error in getProductsByPartialSku: " . $e->getMessage());
           throw new Exception('Error retrieving products by partial SKU: ' . $e->getMessage());
       }
   }

   /**
    * Check if SKUs already exist in the database
    *
    * @param array $skus Array of SKUs to check
    * @param int|null $excludeProductId Product ID to exclude
    * @return array Array of existing SKUs
    */
   public function checkExistingSkus($skus, $excludeProductId = null)
   {
       if (empty($skus)) {
           return [];
       }
       
       $placeholders = implode(',', array_fill(0, count($skus), '?'));
       $query = "SELECT sku FROM product_variants WHERE sku IN ($placeholders)";
       $params = $skus;
       
       if ($excludeProductId) {
           $query .= " AND product_id != ?";
           $params[] = $excludeProductId;
       }
       
       $result = $this->database->fetchAll($query, $params);
       
       $existingSkus = [];
       foreach ($result as $row) {
           $existingSkus[] = $row['sku'];
       }
       
       return $existingSkus;
   }

   /**
    * Get comprehensive products with all related data
    *
    * @param int $page Page number
    * @param int $limit Items per page
    * @param array $filters Optional filters
    * @param string $sortBy Field to sort by
    * @param string $sortOrder Sort order (asc/desc)
    * @param bool $isSuperAdmin Whether the current user is a super admin
    * @return array Products and pagination metadata
    */
   public function getComprehensiveProducts($page = 1, $limit = 10, $filters = [], $sortBy = 'created_at', $sortOrder = 'desc', $isSuperAdmin = false)
   {
       try {
           // Validate sort parameters
           $allowedSortFields = ['created_at', 'name', 'display_order', 'updated_at'];
           $sortBy = in_array($sortBy, $allowedSortFields) ? $sortBy : 'created_at';
           $sortOrder = strtolower($sortOrder) === 'asc' ? 'asc' : 'desc';
           
           // Get products with all related data
           $result = $this->productRepository->getComprehensiveProducts($page, $limit, $filters, $sortBy, $sortOrder, $isSuperAdmin);
           
           return $result;
       } catch (Exception $e) {
           throw new Exception('We couldn\'t retrieve the products: ' . $this->getUserFriendlyErrorMessage($e->getMessage()));
       }
   }

   /**
    * Get a single comprehensive product by ID with all related data
    *
    * @param int $productId Product ID
    * @param bool $includeDeleted Whether to include deleted products (for super admins)
    * @return array|null Product data or null if not found
    */
   public function getComprehensiveProductById($productId, $includeDeleted = false)
   {
       try {
           // Get product with all related data
           $product = $this->productRepository->getComprehensiveProductById($productId, $includeDeleted);
           
           return $product;
       } catch (Exception $e) {
           throw new Exception('We couldn\'t retrieve the product details: ' . $this->getUserFriendlyErrorMessage($e->getMessage()));
       }
   }
   
   /**
    * Create a comprehensive product with all related data
    *
    * @param array $data Product data
    * @param array $files Image files
    * @param int $adminId Admin ID
    * @return array Created product data
    */
   public function createComprehensiveProduct($data, $files, $adminId)
   {
       try {
           $this->database->beginTransaction();
           
           // Debug log
           error_log("Starting product creation with data: " . json_encode($data));
           
           // Ensure variants exist and are properly formatted
           if (!isset($data['variants']) || !is_array($data['variants']) || empty($data['variants'])) {
               error_log("Variants missing or empty in service method");
               
               // Try to recover variants if they're in a different format
               if (isset($data['variants']) && is_string($data['variants'])) {
                   error_log("Variants is a string in service, attempting to decode JSON");
                   $decodedVariants = json_decode($data['variants'], true);
                   if (json_last_error() === JSON_ERROR_NONE && is_array($decodedVariants) && !empty($decodedVariants)) {
                       error_log("Successfully decoded variants from JSON string in service");
                       $data['variants'] = $decodedVariants;
                   } else {
                       error_log("Failed to decode variants JSON in service: " . json_last_error_msg());
                   }
               }
               
               // If still no variants, check if they might be in a nested structure
               if ((!isset($data['variants']) || !is_array($data['variants']) || empty($data['variants'])) && isset($data['product'])) {
                   error_log("Checking for variants in nested 'product' structure in service");
                   if (isset($data['product']['variants']) && is_array($data['product']['variants']) && !empty($data['product']['variants'])) {
                       error_log("Found variants in nested 'product' structure in service");
                       $data['variants'] = $data['product']['variants'];
                   }
               }
               
               // If still no variants, throw a clear error
               if (!isset($data['variants']) || !is_array($data['variants']) || empty($data['variants'])) {
                   throw new Exception('Please add at least one product variant to continue.');
               }
           }
           
           // Generate short description if not provided
           if (empty($data['short_description']) && !empty($data['description'])) {
               $data['short_description'] = $this->generateShortDescription($data['description']);
               error_log("Generated short description: " . $data['short_description']);
           }
           
           // Calculate GST rates if only tax_rate is provided
           if (isset($data['tax_rate']) && (!isset($data['cgst_rate']) || !isset($data['sgst_rate']) || !isset($data['igst_rate']))) {
               $gstRates = $this->calculateGstRates($data['tax_rate']);
               $data['cgst_rate'] = $gstRates['cgst_rate'];
               $data['sgst_rate'] = $gstRates['sgst_rate'];
               $data['igst_rate'] = $gstRates['igst_rate'];
               error_log("Calculated GST rates: CGST={$data['cgst_rate']}, SGST={$data['sgst_rate']}, IGST={$data['igst_rate']}");
           }
           
           // Process variants to calculate discount percentage
           foreach ($data['variants'] as $key => $variant) {
               if (isset($variant['price']) && isset($variant['sale_price']) && $variant['price'] > 0 && $variant['sale_price'] > 0 && $variant['sale_price'] < $variant['price']) {
                   $data['variants'][$key]['discount_percentage'] = round(((floatval($variant['price']) - floatval($variant['sale_price'])) / floatval($variant['price'])) * 100, 2);
                   error_log("Calculated discount percentage for variant {$variant['sku']}: {$data['variants'][$key]['discount_percentage']}%");
               }
           }
           
           // Ensure created_by is set
           $data['created_by'] = $adminId;

           // Ensure variants match product status
           if ($data['status'] === 'inactive' || $data['status'] === 'archived') {
               error_log("Product is being created with {$data['status']} status. Setting all variants to match.");
               foreach ($data['variants'] as $key => $variant) {
                   $data['variants'][$key]['status'] = $data['status'];
                   error_log("Set variant {$variant['sku']} status to {$data['status']}");
               }
           }
           
           // Validate required fields
           $this->validateRequiredFields($data);

           // Validate product type
           if (isset($data['product_type'])) {
               $this->validateProductType($data['product_type']);
           }
           
           // Validate category and subcategory
           $this->validateCategoryAndSubcategory($data['category_id'], $data['subcategory_id']);
           
           // Generate slug and validate uniqueness
           $slug = $this->generateSlug($data['name']);
           $this->validateSlugUniqueness($slug);
           
           // Create product
           error_log("Creating base product");
           $productId = $this->productRepository->createProduct($data, $slug, $adminId);
           
           if (!$productId) {
               throw new Exception('We couldn\'t create your product. Please try again or contact support.');
           }
           
           // Process variants
           error_log("Processing " . count($data['variants']) . " variants for product");
           $this->processVariants($productId, $data['variants'], $adminId);
           
           // Process tags
           error_log("Processing tags for product");
           if (isset($data['tags']) && !empty($data['tags'])) {
               try {
                   // Handle different tag formats
                   $tagsToProcess = $data['tags'];
                   
                   // If tags is a string (comma-separated or JSON), convert to array
                   if (is_string($data['tags'])) {
                       // Try to decode as JSON first
                       $decodedTags = json_decode($data['tags'], true);
                       if (json_last_error() === JSON_ERROR_NONE && is_array($decodedTags)) {
                           error_log("Successfully decoded tags from JSON string");
                           $tagsToProcess = $decodedTags;
                       } else {
                           // If not JSON, try comma-separated
                           error_log("Tags is a string, treating as comma-separated");
                           $tagsToProcess = array_map('trim', explode(',', $data['tags']));
                       }
                   }
                   
                   // Ensure we have an array of tags
                   if (!is_array($tagsToProcess)) {
                       error_log("Could not process tags into array, skipping tag processing");
                       $tagsToProcess = [];
                   }
                   
                   // Filter out empty tags
                   $tagsToProcess = array_filter($tagsToProcess, function($tag) {
                       return !empty($tag);
                   });
                   
                   if (!empty($tagsToProcess)) {
                       error_log("Processing " . count($tagsToProcess) . " tags for product");
                       $this->processTags($productId, $tagsToProcess);
                   } else {
                       error_log("No valid tags to process");
                   }
               } catch (Exception $e) {
                   error_log("Error processing tags: " . $e->getMessage());
                   // Continue with the creation instead of failing the entire process
               }
           }
           
           // Process images
           if ($files && !empty($files['name'][0])) {
               error_log("Processing images for product");
               $this->processImages($productId, $files);
           }
           
           $this->database->commit();
           error_log("Product creation completed successfully");
           
           // Get the created product with all related data
           return $this->getComprehensiveProductById($productId, true);
       } catch (Exception $e) {
           // Only rollback if we have an active transaction
           if ($this->database->getConnection()->inTransaction()) {
               $this->database->rollback();
           }
           error_log("Error in createComprehensiveProduct: " . $e->getMessage());
           error_log("Stack trace: " . $e->getTraceAsString());
           
           // Provide more specific error messages for common issues
           $errorMessage = $e->getMessage();
           
           // Check for field-specific error patterns
           if (strpos($errorMessage, 'product_name:') === 0) {
               // Format: "product_name:Error message"
               $parts = explode(':', $errorMessage, 2);
               throw new Exception($parts[1]);
           }
           else if (strpos($errorMessage, 'variant_sku:') === 0) {
               // Format: "variant_sku:sku_value:Error message"
               $parts = explode(':', $errorMessage, 3);
               throw new Exception($parts[2]);
           }
           // Check for specific error patterns and provide better messages
           else if (strpos($errorMessage, 'duplicate entry') !== false || 
                    strpos($errorMessage, 'already being used') !== false ||
                    strpos($errorMessage, 'already exists') !== false) {
               if (strpos($errorMessage, 'sku') !== false || strpos($errorMessage, 'SKU') !== false) {
                   throw new Exception("This SKU is already in use. Please choose a different SKU.");
               } else if (strpos($errorMessage, 'slug') !== false || 
                         strpos($errorMessage, 'name') !== false || 
                         strpos($errorMessage, 'product with this name') !== false) {
                   throw new Exception("A product with this name already exists. Please use a different name.");
               } else {
                   throw new Exception("Some information you provided is already in use. Please check your inputs and try again.");
               }
           }
           else if (strpos($errorMessage, 'foreign key constraint') !== false) {
               throw new Exception("The category or subcategory you selected may no longer exist. Please select a valid category and subcategory.");
           }
           else if (strpos($errorMessage, 'required') !== false) {
               // Try to extract field name from error message
               if (preg_match('/provide the ([a-zA-Z_\s]+)/i', $errorMessage, $matches)) {
                   $field = strtolower(trim($matches[1]));
                   $field = str_replace(' ', '_', $field);
                   throw new Exception("Please provide the {$matches[1]}.");
               } else {
                   throw new Exception("Please fill in all required fields.");
               }
           }
           else if (strpos($errorMessage, 'image') !== false || strpos($errorMessage, 'file') !== false) {
               throw new Exception("There was a problem with one or more of your product images. Please check the image files and try again.");
           }
           else if (strpos($errorMessage, 'variant') !== false) {
               throw new Exception("There was a problem with one or more of your product variants. Please check your variant information and try again.");
           }
           else if (strpos($errorMessage, 'transaction') !== false) {
               throw new Exception("There was a database transaction issue. Please try again.");
           }
           else {
               // For other errors, use the general user-friendly message
               throw new Exception("We couldn't create your product. Please try again or contact support if the problem persists.");
           }
       }
   }
   
   /**
    * Update a comprehensive product with all related data
    *
    * @param int $productId Product ID
    * @param array $data Product data
    * @param array $files Image files
    * @param int $adminId Admin ID
    * @return array Updated product data
    */
   public function updateComprehensiveProduct($productId, $data, $files, $adminId)
   {
       try {
           $this->database->beginTransaction();
           
           // Debug log
           error_log("Starting product update for ID: " . $productId);
           
           // Get existing product
           $existingProduct = $this->productRepository->getProductById($productId);
           
           if (!$existingProduct) {
               throw new Exception('The product you\'re trying to update doesn\'t exist or has been removed.');
           }
           
           // Check if product status is being changed
           if (isset($data['status']) && $data['status'] !== $existingProduct['status']) {
               error_log("Product status change detected: {$existingProduct['status']} -> {$data['status']}");
               
               // If changing to inactive or archived, update all variants to match
               if ($data['status'] === 'inactive' || $data['status'] === 'archived') {
                   error_log("Setting all variants of product {$productId} to {$data['status']}");
                   $db = Database::getInstance();
                   try {
                       $variantUpdateSql = "UPDATE product_variants SET status = :status WHERE product_id = :product_id";
                       $variantUpdateParams = [
                           ':status' => $data['status'],
                           ':product_id' => $productId
                       ];
                       $variantUpdateResult = $db->query($variantUpdateSql, $variantUpdateParams);
                       $variantsUpdated = $variantUpdateResult->rowCount();
                       error_log("Updated {$variantsUpdated} variants to {$data['status']} status");
                       
                       // Also update any variants in the current request data
                       if (isset($data['variants']) && is_array($data['variants'])) {
                           foreach ($data['variants'] as $key => $variant) {
                               $data['variants'][$key]['status'] = $data['status'];
                               error_log("Updated variant in request data to status: {$data['status']}");
                           }
                       }
                   } catch (Exception $e) {
                       error_log("Error updating variant statuses: " . $e->getMessage());
                       throw new Exception("Failed to update variant statuses: " . $e->getMessage());
                   }
               }
               // If changing to active, verify category and subcategory are active
               elseif ($data['status'] === 'active') {
                   // Check if category is active
                   $categoryId = $data['category_id'] ?? $existingProduct['category_id'];
                   $subcategoryId = $data['subcategory_id'] ?? $existingProduct['subcategory_id'];
                   
                   $db = Database::getInstance();
                   
                   // Check category status
                   $categorySql = "SELECT status, name FROM categories WHERE id = :category_id";
                   $categoryResult = $db->fetch($categorySql, [':category_id' => $categoryId]);
                   
                   if (!$categoryResult) {
                       error_log("Cannot activate product {$productId}: Category {$categoryId} not found");
                       throw new Exception("Cannot activate this product because its category no longer exists.");
                   }
                   
                   if ($categoryResult['status'] !== 'active') {
                       error_log("Cannot activate product {$productId}: Category {$categoryId} is not active");
                       throw new Exception("Cannot activate this product because its category '{$categoryResult['name']}' is inactive. Please activate the category first or choose a different category.");
                   }
                   
                   // Check subcategory status
                   $subcategorySql = "SELECT status, name FROM subcategories WHERE id = :subcategory_id";
                   $subcategoryResult = $db->fetch($subcategorySql, [':subcategory_id' => $subcategoryId]);
                   
                   if (!$subcategoryResult) {
                       error_log("Cannot activate product {$productId}: Subcategory {$subcategoryId} not found");
                       throw new Exception("Cannot activate this product because its subcategory no longer exists.");
                   }
                   
                   if ($subcategoryResult['status'] !== 'active') {
                       error_log("Cannot activate product {$productId}: Subcategory {$subcategoryId} is not active");
                       throw new Exception("Cannot activate this product because its subcategory '{$subcategoryResult['name']}' is inactive. Please activate the subcategory first or choose a different subcategory.");
                   }
                   
                   // If both category and subcategory are active, set all variants to active
                   error_log("Setting all variants of product {$productId} to active");
                   try {
                       $variantUpdateSql = "UPDATE product_variants SET status = 'active' WHERE product_id = :product_id";
                       $variantUpdateParams = [':product_id' => $productId];
                       $variantUpdateResult = $db->query($variantUpdateSql, $variantUpdateParams);
                       $variantsUpdated = $variantUpdateResult->rowCount();
                       error_log("Updated {$variantsUpdated} variants to active status");
                   } catch (Exception $e) {
                       error_log("Error updating variant statuses: " . $e->getMessage());
                       // Continue with product update even if variant update fails
                   }
               }
           }
           
           // Generate short description if not provided but description is updated
           if ((!isset($data['short_description']) || empty($data['short_description'])) && 
               isset($data['description']) && $data['description'] !== $existingProduct['description']) {
               $data['short_description'] = $this->generateShortDescription($data['description']);
               error_log("Generated short description: " . $data['short_description']);
           }
           
           // Calculate GST rates if only tax_rate is provided
           if (isset($data['tax_rate']) && (!isset($data['cgst_rate']) || !isset($data['sgst_rate']) || !isset($data['igst_rate']))) {
               $gstRates = $this->calculateGstRates($data['tax_rate']);
               $data['cgst_rate'] = $gstRates['cgst_rate'];
               $data['sgst_rate'] = $gstRates['sgst_rate'];
               $data['igst_rate'] = $gstRates['igst_rate'];
               error_log("Calculated GST rates: CGST={$data['cgst_rate']}, SGST={$data['sgst_rate']}, IGST={$data['igst_rate']}");
           }
           
           // Process variants to calculate discount percentage
           if (isset($data['variants']) && is_array($data['variants'])) {
               foreach ($data['variants'] as $key => $variant) {
                   if (isset($variant['price']) && isset($variant['sale_price']) && $variant['price'] > 0 && $variant['sale_price'] > 0 && $variant['sale_price'] < $variant['price']) {
                       $data['variants'][$key]['discount_percentage'] = round(((floatval($variant['price']) - floatval($variant['sale_price'])) / floatval($variant['price'])) * 100, 2);
                       error_log("Calculated discount percentage for variant {$variant['sku']}: {$data['variants'][$key]['discount_percentage']}%");
                   }
               }
           }
           
           // Ensure updated_by is set
           $data['updated_by'] = $adminId;
           
           // Validate required fields
           $this->validateRequiredFields($data);

           // Validate product type
           if (isset($data['product_type'])) {
               $this->validateProductType($data['product_type']);
           }
           
           // Validate category and subcategory
           $this->validateCategoryAndSubcategory($data['category_id'], $data['subcategory_id']);
           
           // Generate slug if name changed and validate uniqueness
           $slug = $existingProduct['slug'];
           if (isset($data['name']) && $data['name'] !== $existingProduct['name']) {
               $slug = $this->generateSlug($data['name']);
               $this->validateSlugUniqueness($slug, $productId);
           }
           
           // Update product
           error_log("Updating product base data");
           $updateResult = $this->productRepository->updateProduct($productId, $data, $slug, $adminId);
           
           if (!$updateResult) {
               throw new Exception('We couldn\'t update your product information. Please check your inputs and try again.');
           }
           
           // Process variants
           error_log("Processing variants for product");
           $deleteVariantIds = isset($data['delete_variant_ids']) ? $data['delete_variant_ids'] : [];
           
           /**
            * Process variants for product update
            *
            * @param int $productId Product ID
            * @param array $variants Variants data
            * @param array $deleteVariantIds Variant IDs to delete
            * @param int $adminId Admin ID for updated_by field
            * @return bool Success
            */
           $this->processVariantsForUpdate($productId, $data['variants'], $deleteVariantIds, $adminId);
           
           // Process tags - handle separately to avoid transaction rollback on tag errors
           error_log("Processing tags for product");
           try {
               $this->productRepository->deleteProductTags($productId);
               if (isset($data['tags']) && !empty($data['tags'])) {
                   // Handle different tag formats
                   $tagsToProcess = $data['tags'];
                   
                   // If tags is a string (comma-separated or JSON), convert to array
                   if (is_string($data['tags'])) {
                       // Try to decode as JSON first
                       $decodedTags = json_decode($data['tags'], true);
                       if (json_last_error() === JSON_ERROR_NONE && is_array($decodedTags)) {
                           error_log("Successfully decoded tags from JSON string");
                           $tagsToProcess = $decodedTags;
                       } else {
                           // If not JSON, try comma-separated
                           error_log("Tags is a string, treating as comma-separated");
                           $tagsToProcess = array_map('trim', explode(',', $data['tags']));
                       }
                   }
                   
                   // Ensure we have an array of tags
                   if (!is_array($tagsToProcess)) {
                       error_log("Could not process tags into array, skipping tag processing");
                       $tagsToProcess = [];
                   }
                   
                   // Filter out empty tags
                   $tagsToProcess = array_filter($tagsToProcess, function($tag) {
                       return !empty($tag);
                   });
                   
                   if (!empty($tagsToProcess)) {
                       error_log("Processing " . count($tagsToProcess) . " tags for product");
                       $this->processTags($productId, $tagsToProcess);
                   } else {
                       error_log("No valid tags to process");
                   }
               }
           } catch (Exception $e) {
               error_log("Error processing tags: " . $e->getMessage());
               // Continue with the update instead of failing the entire process
           }
           
           // Process image deletions
           if (isset($data['delete_image_ids']) && is_array($data['delete_image_ids']) && !empty($data['delete_image_ids'])) {
               error_log("Deleting images: " . json_encode($data['delete_image_ids']));
               $this->deleteImages($productId, $data['delete_image_ids']);
           }
           
           // Set primary image
           if (isset($data['primary_image_id']) && !empty($data['primary_image_id'])) {
               error_log("Setting primary image: " . $data['primary_image_id']);
               $this->setPrimaryImage($productId, $data['primary_image_id']);
           }
           
           // Process new images
           if ($files && !empty($files['name'][0])) {
               error_log("Processing new images for product");
               $this->processImages($productId, $files);
           }
           
           // NEW: Reorder images if image_order is provided
           if (isset($data['image_order']) && is_array($data['image_order']) && !empty($data['image_order'])) {
               error_log("Reordering images based on provided order");
               $this->reorderProductImages($productId, $data['image_order']);
           }
           
           // Check if there's at least one active variant when product is active
           
           // No need to validate active variants when product is inactive
           // Just ensure product and variants have consistent statuses
           if (isset($data['status'])) {
               $productStatus = $data['status'];
               
               // If product is active, ensure it has at least one active variant
               if ($productStatus === 'active') {
                   $activeVariants = $this->database->fetchAll(
                       "SELECT COUNT(*) as count FROM product_variants WHERE product_id = :product_id AND status = 'active'",
                       [':product_id' => $productId]
                   );
                   
                   if ($activeVariants[0]['count'] < 1) {
                       throw new Exception('An active product must have at least one active variant. Please activate at least one variant before saving the product as active.');
                   }
               }
               // For inactive or archived products, we already set variants to match in earlier code
           }
           
           $this->database->commit();
           error_log("Product update completed successfully");
           
           // Get the updated product with all related data
           return $this->getComprehensiveProductById($productId, true);
       } catch (Exception $e) {
           // Only rollback if we have an active transaction
           if ($this->database->getConnection()->inTransaction()) {
               $this->database->rollback();
           }
           error_log("Error in updateComprehensiveProduct: " . $e->getMessage());
           error_log("Stack trace: " . $e->getTraceAsString());
           
           // Provide more specific error messages for common issues
           $errorMessage = $e->getMessage();
           
           // Check for field-specific error patterns
           if (strpos($errorMessage, 'product_name:') === 0) {
               // Format: "product_name:Error message"
               $parts = explode(':', $errorMessage, 2);
               throw new Exception($parts[1]);
           }
           else if (strpos($errorMessage, 'variant_sku:') === 0) {
               // Format: "variant_sku:sku_value:Error message"
               $parts = explode(':', $errorMessage, 3);
               throw new Exception($parts[2]);
           }
           // Check for specific error patterns and provide better messages
           else if (strpos($errorMessage, 'Cannot activate this product because its category') !== false ||
                    strpos($errorMessage, 'Cannot activate this product because its subcategory') !== false) {
               // Already has a good error message about category/subcategory status
               throw new Exception($errorMessage);
           }
           else if (strpos($errorMessage, 'duplicate entry') !== false || 
                    strpos($errorMessage, 'already being used') !== false ||
                    strpos($errorMessage, 'already exists') !== false) {
               if (strpos($errorMessage, 'sku') !== false || strpos($errorMessage, 'SKU') !== false) {
                   throw new Exception("This SKU is already in use. Please choose a different SKU.");
               } else if (strpos($errorMessage, 'slug') !== false || 
                         strpos($errorMessage, 'name') !== false || 
                         strpos($errorMessage, 'product with this name') !== false) {
                   throw new Exception("A product with this name already exists. Please use a different name.");
               } else {
                   throw new Exception("Some information you provided is already in use. Please check your inputs and try again.");
               }
           }
           // Additional check for SKU errors that might come from the database
           else if (strpos($errorMessage, 'Duplicate') !== false && strpos($errorMessage, 'sku') !== false) {
               throw new Exception("This SKU is already in use. Please choose a different SKU.");
           }
           else if (strpos($errorMessage, 'foreign key constraint') !== false) {
               throw new Exception("The category or subcategory you selected may no longer exist. Please select a valid category and subcategory.");
           }
           else if (strpos($errorMessage, 'required') !== false) {
               // Try to extract field name from error message
               if (preg_match('/provide the ([a-zA-Z_\s]+)/i', $errorMessage, $matches)) {
                   $field = strtolower(trim($matches[1]));
                   $field = str_replace(' ', '_', $field);
                   throw new Exception("Please provide the {$matches[1]}.");
               } else {
                   throw new Exception("Please fill in all required fields.");
               }
           }
           else if (strpos($errorMessage, 'image') !== false || strpos($errorMessage, 'file') !== false) {
               throw new Exception("There was a problem with one or more of your product images. Please check the image files and try again.");
           }
           else if (strpos($errorMessage, 'variant') !== false) {
               throw new Exception("There was a problem with one or more of your product variants. Please check your variant information and try again.");
           }
           else if (strpos($errorMessage, 'transaction') !== false) {
               throw new Exception("There was a database transaction issue. Please try again.");
           }
           else {
               // For other errors, use the general user-friendly message
               throw new Exception("We couldn't update your product. Please try again or contact support if the problem persists.");
           }
       }
   }
   
   /**
    * Delete a comprehensive product (soft delete)
    * This marks the product as deleted but keeps it in the database
    * The product will only be visible to super admins
    *
    * @param int $productId Product ID
    * @param int $adminId Admin ID
    * @return bool Success
    */
   public function deleteComprehensiveProduct($productId, $adminId)
   {
       try {
           $this->database->beginTransaction();
           
           // Check if the product exists and is not already deleted
           $product = $this->productRepository->getProductById($productId);
           
           if (!$product) {
               throw new NotFoundException('The product you\'re trying to archive could not be found.');
           }
           
           if (!empty($product['deleted_at'])) {
               throw new Exception('This product has already been archived.');
           }
           
           // Soft delete product (only mark as deleted, don't delete related entities)
           $result = $this->productRepository->softDeleteProduct($productId, $adminId);
           
           if (!$result) {
               throw new Exception('We couldn\'t archive this product. Please try again later.');
           }
           
           $this->database->commit();
           error_log("Product soft-deleted (archived) successfully: {$productId}");
           
           return true;
       } catch (Exception $e) {
           // Only rollback if we have an active transaction
           if ($this->database->getConnection()->inTransaction()) {
               $this->database->rollback();
           }
           error_log("Error in deleteComprehensiveProduct: " . $e->getMessage());
           
           // Provide more specific error messages
           $errorMessage = $e->getMessage();
           
           if (strpos($errorMessage, 'already been archived') !== false) {
               throw new Exception($errorMessage);
           } else if (strpos($errorMessage, 'could not be found') !== false) {
               throw new Exception($errorMessage);
           } else {
               throw new Exception('We couldn\'t archive this product: ' . $this->getUserFriendlyErrorMessage($errorMessage));
           }
       }
   }

   /**
    * Permanently delete a comprehensive product and all related data
    * This completely removes the product from the database
    * Cannot be undone
    *
    * @param int $productId Product ID
    * @return bool Success
    */
   public function permanentlyDeleteComprehensiveProduct($productId)
   {
       try {
           error_log("Service: Permanently deleting product ID: {$productId}");
           
           // Start transaction at service level
           $this->database->beginTransaction();
           
           // Verify the product exists (including soft-deleted products)
           $product = $this->productRepository->getProductById($productId, true);
           
           if (!$product) {
               throw new NotFoundException('The product you\'re trying to delete could not be found.');
           }
           
           // Get product images to delete files later
           $images = $this->productRepository->getProductImages($productId);
           
           // Permanently delete product from database
           $deleted = $this->productRepository->permanentlyDeleteProduct($productId);
           
           if (!$deleted) {
               throw new Exception('We couldn\'t delete this product. Please try again later.');
           }
           
           // Delete image files from storage
           if (!empty($images)) {
               foreach ($images as $image) {
                   if (!empty($image['image_path'])) {
                       $imagePath = $image['image_path'];
                       // Only delete local files, not external URLs
                       if (strpos($imagePath, 'http') !== 0) {
                           $fullPath = $_SERVER['DOCUMENT_ROOT'] . '/ramesh-be/be/api/public/' . ltrim($imagePath, '/');
                           if (file_exists($fullPath)) {
                               unlink($fullPath);
                               error_log("Deleted image file: {$fullPath}");
                           }
                       }
                   }
               }
           }
           
           $this->database->commit();
           error_log("Product permanently deleted successfully: {$productId}");
           
           return true;
       } catch (Exception $e) {
           // Only rollback if we have an active transaction
           if ($this->database->getConnection()->inTransaction()) {
               $this->database->rollback();
           }
           error_log("Error in permanentlyDeleteComprehensiveProduct: " . $e->getMessage());
           
           // Provide more specific error messages
           $errorMessage = $e->getMessage();
           
           if (strpos($errorMessage, 'could not be found') !== false) {
               throw new Exception($errorMessage);
           } else if (strpos($errorMessage, 'foreign key constraint') !== false) {
               throw new Exception('This product cannot be deleted because it is referenced by other records in the system.');
           } else {
               throw new Exception('We couldn\'t permanently delete this product: ' . $this->getUserFriendlyErrorMessage($errorMessage));
           }
       }
   }
   
   /**
    * Generate short description from full description
    *
    * @param string $description Full description
    * @param int $maxLength Maximum length of short description
    * @return string Short description
    */
   private function generateShortDescription($description, $maxLength = 150)
   {
       // Strip HTML tags
       $text = strip_tags($description);
       
       // Truncate to max length
       if (strlen($text) <= $maxLength) {
           return $text;
       }
       
       // Find the last space within the limit
       $lastSpace = strrpos(substr($text, 0, $maxLength), ' ');
       
       // If no space found, just cut at max length
       if ($lastSpace === false) {
           $lastSpace = $maxLength;
       }
       
       // Truncate and add ellipsis
       return substr($text, 0, $lastSpace) . '...';
   }
   
   /**
    * Calculate GST rates based on tax_rate
    *
    * @param float $taxRate Total tax rate
    * @return array GST rates (cgst_rate, sgst_rate, igst_rate)
    */
   private function calculateGstRates($taxRate)
   {
       $taxRate = (float) $taxRate;
       
       // IGST is equal to the total tax rate
       $igstRate = $taxRate;
       
       // CGST and SGST are each half of the total tax rate
       $cgstRate = $taxRate / 2;
       $sgstRate = $taxRate / 2;
       
       return [
           'cgst_rate' => $cgstRate,
           'sgst_rate' => $sgstRate,
           'igst_rate' => $igstRate
       ];
   }
   
   /**
    * Validate required fields for product
    *
    * @param array $data Product data
    * @return bool Valid
    */
   private function validateRequiredFields($data)
   {
       $requiredFields = [
        'name' => 'product_name',
        'category_id' => 'category',
        'subcategory_id' => 'subcategory',
        'status' => 'status',
        'product_type' => 'product_type'
    ];
    
    foreach ($requiredFields as $field => $errorField) {
        if (!isset($data[$field]) || (is_string($data[$field]) && trim($data[$field]) === '')) {
            throw new Exception("{$errorField}:Field is required");
        }
    }
    
    if (!isset($data['variants']) || !is_array($data['variants']) || empty($data['variants'])) {
        throw new Exception("variants:At least one variant required");
    }
    
    foreach ($data['variants'] as $index => $variant) {
        if (!isset($variant['variant_name']) || empty($variant['variant_name'])) {
            throw new Exception("variant_name:Variant name required");
        }
        
        if (!isset($variant['sku']) || empty($variant['sku'])) {
            throw new Exception("variant_sku:SKU required");
        }
        
        if (!isset($variant['price'])) {
            throw new Exception("variant_price:Price required");
        }
        
        if (!isset($variant['status'])) {
            throw new Exception("variant_status:Status required");
        }
    }
    
    return true;
   }

   /**
    * Validate product type
    *
    * @param string $productType Product type
    * @throws Exception If validation fails
    */
   private function validateProductType($productType)
   {
       $allowedTypes = ['global', 'local', 'takeaway'];
       
       if (!in_array($productType, $allowedTypes)) {
           throw new Exception("product_type:Invalid product type. Must be one of: " . implode(', ', $allowedTypes));
       }
   }
   
   /**
    * Validate category and subcategory
    *
    * @param int $categoryId Category ID
    * @param int $subcategoryId Subcategory ID
    * @return bool Valid
    */
   private function validateCategoryAndSubcategory($categoryId, $subcategoryId)
   {
       // Validate category exists
       $category = $this->database->fetch(
        "SELECT id, name FROM categories WHERE id = :category_id",
        [':category_id' => $categoryId]
    );
    
    if (!$category) {
        throw new Exception("category:Category does not exist");
    }
    
    // Validate subcategory exists and belongs to the category
    $subcategory = $this->database->fetch(
        "SELECT id, name FROM subcategories WHERE id = :subcategory_id AND category_id = :category_id",
        [
            ':subcategory_id' => $subcategoryId,
            ':category_id' => $categoryId
        ]
    );
    
    if (!$subcategory) {
        throw new Exception("subcategory:Invalid subcategory for category");
    }
    
    return true;
   }
   
   /**
    * Generate slug from name
    *
    * @param string $name Product name
    * @return string Slug
    */
   private function generateSlug($name)
   {
       // Convert to lowercase
       $slug = strtolower($name);
       
       // Replace non-alphanumeric characters with hyphens
       $slug = preg_replace('/[^a-z0-9]+/', '-', $slug);
       
       // Remove leading and trailing hyphens
       $slug = trim($slug, '-');
       
       return $slug;
   }
   
   /**
    * Validate slug uniqueness
    *
    * @param string $slug Slug
    * @param int|null $excludeProductId Product ID to exclude from check
    * @return bool Valid
    */
   private function validateSlugUniqueness($slug, $excludeProductId = null)
   {
       $sql = "SELECT id, name FROM products WHERE slug = :slug";
       $params = [':slug' => $slug];
       
       if ($excludeProductId) {
           $sql .= " AND id != :id";
           $params[':id'] = $excludeProductId;
       }
       
       $existingProduct = $this->database->fetch($sql, $params);
       
       if ($existingProduct) {
        throw new Exception("product_name:A product with this name already exists. Please use a different name.");
    }
    
    return true;
   }
   
   /**
    * Process variants for a product
    *
    * @param int $productId Product ID
    * @param array $variants Variants data
    * @param int $adminId Admin ID for created_by field
    * @return bool Success
    */
   private function processVariants($productId, $variants, $adminId)
   {
       if (!is_array($variants)) {
           error_log("Variants is not an array: " . gettype($variants));
           throw new Exception('Variants must be an array');
       }
       
       if (empty($variants)) {
           error_log("Variants array is empty");
           throw new Exception('At least one product variant is required');
       }
       
       error_log("Processing " . count($variants) . " variants for product {$productId}");
       
       foreach ($variants as $index => $variant) {
           error_log("Processing variant #" . ($index + 1) . ": " . json_encode($variant));
           
           if (!is_array($variant)) {
               error_log("Variant #" . ($index + 1) . " is not an array: " . gettype($variant));
               throw new Exception("There's an issue with variant #" . ($index + 1) . ". Please try again.");
           }
           
           // Validate required fields
           if (!isset($variant['variant_name']) || empty($variant['variant_name'])) {
               throw new Exception("Please provide a name for variant #" . ($index + 1));
           }
           
           if (!isset($variant['sku']) || empty($variant['sku'])) {
               throw new Exception("Please provide a SKU for variant #" . ($index + 1));
           }
           
           if (!isset($variant['price'])) {
               throw new Exception("Please provide a price for variant #" . ($index + 1));
           }
           
           if (!isset($variant['status'])) {
               throw new Exception("Please select a status for variant #" . ($index + 1));
           }
           
           // Validate SKU uniqueness
           $existingVariant = $this->database->fetch(
            "SELECT id, variant_name FROM product_variants WHERE sku = :sku",
            [':sku' => $variant['sku']]
        );
        
        if ($existingVariant) {
            throw new Exception("variant_sku:{$variant['sku']}:SKU already in use");
        }
           
           // Add created_by to variant
           $variant['created_by'] = $adminId;
           
           // Create variant
           error_log("Creating variant with SKU: " . $variant['sku']);
           $variantId = $this->productRepository->createProductVariant($productId, $variant);
           
           if (!$variantId) {
               throw new Exception("We couldn't create variant '{$variant['variant_name']}'. Please check the information and try again.");
           }
           
           error_log("Successfully created variant #" . ($index + 1) . " with ID: " . $variantId);
       }
       
       return true;
   }
   
   /**
    * Process variants for product update
    *
    * @param int $productId Product ID
    * @param array $variants Variants data
    * @param array $deleteVariantIds Variant IDs to delete
    * @param int $adminId Admin ID for updated_by field
    * @return bool Success
    */
   private function processVariantsForUpdate($productId, $variants, $deleteVariantIds, $adminId)
   {
       if (!is_array($variants) || empty($variants)) {
           throw new Exception('Your product needs at least one variant. Please add a variant to continue.');
       }
       
       // Delete variants if specified
       if (!empty($deleteVariantIds)) {
           foreach ($deleteVariantIds as $variantId) {
               $this->productRepository->deleteProductVariant($productId, $variantId);
           }
       }
       
       // Process variants
       foreach ($variants as $variant) {
           // Get current product status
           $productStatus = $this->database->fetch(
               "SELECT status FROM products WHERE id = :product_id",
               [':product_id' => $productId]
           )['status'];

           // Ensure variants can't be active if product is inactive
           if (($productStatus === 'inactive' || $productStatus === 'archived') && 
               isset($variant['status']) && $variant['status'] === 'active') {
               error_log("Cannot set variant to active when product is {$productStatus}. Forcing variant status to {$productStatus}.");
               $variant['status'] = $productStatus;
           }
           // Add updated_by to variant
           $variant['updated_by'] = $adminId;
           
           if (isset($variant['id'])) {
               // Check if the variant ID is valid (numeric)
               if (!is_numeric($variant['id'])) {
                   error_log("Invalid variant ID format: " . $variant['id'] . ". Creating as new variant instead.");
                   // Create as new variant instead
                   $variant['created_by'] = $adminId;
                   $this->productRepository->createProductVariant($productId, $variant);
                   continue;
               }
               
               // Validate SKU uniqueness for existing variant
               $existingVariant = $this->database->fetch(
                "SELECT id, variant_name FROM product_variants WHERE sku = :sku AND id != :id",
                [':sku' => $variant['sku'], ':id' => $variant['id']]
            );
            
            if ($existingVariant) {
                throw new Exception("variant_sku:{$variant['sku']}:SKU already in use");
            }
               
               // Update existing variant
               $updateResult = $this->productRepository->updateProductVariant($variant['id'], $productId, $variant);
               
               // If update failed (variant not found), create it as a new variant
               if ($updateResult === false) {
                   error_log("Variant with ID {$variant['id']} not found. Creating as new variant.");
                   $variant['created_by'] = $adminId;
                   $this->productRepository->createProductVariant($productId, $variant);
               }
           } else {
               // Validate SKU uniqueness for new variant
               $existingVariant = $this->database->fetch(
                   "SELECT id, variant_name FROM product_variants WHERE sku = :sku",
                   [':sku' => $variant['sku']]
               );
               
               if ($existingVariant) {
                   throw new Exception("variant_sku:{$variant['sku']}:SKU already in use");
               }
               
               // Add created_by to new variant
               $variant['created_by'] = $adminId;
               
               // Create new variant
               $this->productRepository->createProductVariant($productId, $variant);
           }
       }
       
       // Ensure at least one variant remains
       $remainingVariants = $this->database->fetchAll(
           "SELECT COUNT(*) as count FROM product_variants WHERE product_id = :product_id",
           [':product_id' => $productId]
       );
       
       if ($remainingVariants[0]['count'] < 1) {
           throw new Exception('Your product needs at least one variant. Please add a variant to continue.');
       }
       
       // Check if there's at least one active variant
       $activeVariants = $this->database->fetchAll(
           "SELECT COUNT(*) as count FROM product_variants WHERE product_id = :product_id AND status = 'active'",
           [':product_id' => $productId]
       );

       // Get the current product status
       $productStatus = $this->database->fetch(
           "SELECT status FROM products WHERE id = :product_id",
           [':product_id' => $productId]
       )['status'];

       // Only validate active variants if the product itself is active
       if ($productStatus === 'active') {
           $activeVariants = $this->database->fetchAll(
               "SELECT COUNT(*) as count FROM product_variants WHERE product_id = :product_id AND status = 'active'",
               [':product_id' => $productId]
           );

           if ($activeVariants[0]['count'] < 1) {
               throw new Exception('An active product must have at least one active variant. Please activate at least one variant before saving.');
           }
       }
       
       return true;
   }
   
   /**
    * Process tags for a product
    *
    * @param int $productId Product ID
    * @param array $tags Tags data
    * @return bool Success
    */
   private function processTags($productId, $tags)
   {
       if (!is_array($tags)) {
           error_log("Tags is not an array: " . gettype($tags));
           throw new Exception('Tags must be an array');
       }
       
       error_log("Processing " . count($tags) . " tags for product {$productId}");
       
       foreach ($tags as $tagItem) {
           // Handle both string tags and object/array tags with 'name' property
           $tagName = '';
           if (is_string($tagItem)) {
               $tagName = $tagItem;
           } elseif (is_array($tagItem) && isset($tagItem['name'])) {
               $tagName = $tagItem['name'];
           } elseif (is_object($tagItem) && isset($tagItem->name)) {
               $tagName = $tagItem->name;
           } elseif (is_numeric($tagItem) || is_bool($tagItem)) {
               // Convert numeric or boolean values to string
               $tagName = (string)$tagItem;
           }
           
           $tagName = trim(InputSanitizer::sanitize($tagName));
           
           if (empty($tagName)) {
               error_log("Skipping empty tag after sanitization");
               continue;
           }
           
           try {
               // Check if tag exists or create it
               error_log("Getting or creating tag: " . $tagName);
               $tagId = $this->productRepository->getOrCreateTag($tagName);
               
               if (!$tagId) {
                   error_log("Failed to get or create tag: " . $tagName);
                   continue;
               }
               
               // Associate tag with product
               error_log("Associating tag {$tagId} with product {$productId}");
               $this->productRepository->associateTagWithProduct($productId, $tagId);
           } catch (Exception $e) {
               error_log("Error processing tag '{$tagName}': " . $e->getMessage());
               // Continue with other tags instead of failing the entire process
           }
       }
       
       return true;
   }
   
   /**
    * Process images for a product
    *
    * @param int $productId Product ID
    * @param array $files Image files
    * @return bool Success
    */
   private function processImages($productId, $files)
   {
       try {
           // Create base upload directory if it doesn't exist
           // Use the document root from environment
           $baseUploadDir = $_SERVER['DOCUMENT_ROOT'] . '/ramesh-be/be/api/public/uploads/product_images/';
           // Store relative path for database
           $relativeUploadDir = 'uploads/product_images/';
           
           error_log("Base upload directory: " . $baseUploadDir);
           
           if (!is_dir($baseUploadDir)) {
               if (!mkdir($baseUploadDir, 0755, true)) {
                   error_log("Failed to create directory: " . $baseUploadDir);
                   throw new Exception("We couldn't create the image upload directory. Please try again later or contact support.");
               }
               error_log("Created directory: " . $baseUploadDir);
           }
           
           // Get current highest display order
           $highestOrder = $this->database->fetch(
               "SELECT MAX(display_order) as max_order FROM product_images WHERE product_id = :product_id",
               [':product_id' => $productId]
           );
           
           $displayOrder = $highestOrder && $highestOrder['max_order'] !== null ? ($highestOrder['max_order'] + 1) : 0;
           
           // Check if files is a proper upload array
           if (!isset($files['name']) || !is_array($files['name'])) {
               error_log("Invalid files array structure: " . json_encode($files));
               return false;
           }
           
           $fileCount = count($files['name']);
           error_log("Processing {$fileCount} images for product {$productId}");
           
           $successCount = 0;
           
           for ($i = 0; $i < $fileCount; $i++) {
               // Skip empty uploads
               if ($files['error'][$i] !== UPLOAD_ERR_OK || empty($files['name'][$i])) {
                   error_log("Skipping file at index {$i} due to error or empty name");
                   continue;
               }
               
               $fileName = $files['name'][$i];
               $fileTmpName = $files['tmp_name'][$i];
               $fileType = $files['type'][$i];
               $fileSize = $files['size'][$i];
               
               error_log("Processing file: {$fileName}, type: {$fileType}, size: {$fileSize}");
               
               // Validate file
               if (!$this->validateFile($fileName, $fileType, $fileSize)) {
                   error_log("File validation failed for {$fileName}");
                   continue;
               }
               
               // Generate unique filename with timestamp and random string
               $fileExtension = pathinfo($fileName, PATHINFO_EXTENSION);
               $uniqueHash = time() . '_' . bin2hex(random_bytes(8));
               $newFileName = $uniqueHash . '.' . $fileExtension;
               $fullFilePath = $baseUploadDir . $newFileName;
               $relativeFilePath = $relativeUploadDir . $newFileName;
               
               error_log("Attempting to move uploaded file to {$fullFilePath}");
               
               // Upload file
               if (!move_uploaded_file($fileTmpName, $fullFilePath)) {
                   error_log("Failed to move uploaded file from {$fileTmpName} to {$fullFilePath}");
                   // Try to copy the file if move_uploaded_file fails
                   if (!copy($fileTmpName, $fullFilePath)) {
                       error_log("Failed to copy file as fallback");
                       continue;
                   }
                   error_log("Successfully copied file as fallback");
               } else {
                   error_log("File successfully moved to {$fullFilePath}");
               }
               
               // Verify file exists after upload
               if (!file_exists($fullFilePath)) {
                   error_log("File does not exist after upload: {$fullFilePath}");
                   continue;
               }
               
               // Check if this is the first image for the product
               $existingImages = $this->database->fetch(
                   "SELECT COUNT(*) as count FROM product_images WHERE product_id = :product_id",
                   [':product_id' => $productId]
               );
               
               $isPrimary = ($existingImages['count'] == 0) ? 1 : 0;
               
               // Create image record
               $imageId = $this->productRepository->createProductImage($productId, $relativeFilePath, $isPrimary, $displayOrder + $i);
               
               if ($imageId) {
                   error_log("Created image record with ID {$imageId} for product {$productId}");
                   error_log("Image path stored in database: {$relativeFilePath}");
                   $successCount++;
               } else {
                   error_log("Failed to create image record for product {$productId}");
                   // If database insert failed, remove the uploaded file
                   if (file_exists($fullFilePath)) {
                       unlink($fullFilePath);
                       error_log("Removed file {$fullFilePath} due to database insert failure");
                   }
               }
           }
           
           error_log("Successfully processed {$successCount} out of {$fileCount} images");
           return $successCount > 0;
       } catch (Exception $e) {
           error_log("Error in processImages: " . $e->getMessage());
           error_log("Stack trace: " . $e->getTraceAsString());
           throw new Exception('There was a problem uploading your product images. Please check the image files and try again.');
       }
   }
   
   /**
    * Delete images for a product
    *
    * @param int $productId Product ID
    * @param array $imageIds Image IDs to delete
    * @return bool Success
    */
private function deleteImages($productId, $imageIds)
{
    try {
        if (empty($imageIds)) {
            error_log("No image IDs provided for deletion");
            return true;
        }
        
        error_log("Deleting images: " . json_encode($imageIds) . " for product {$productId}");
        
        // Get image paths before deleting records
        $placeholders = implode(',', array_fill(0, count($imageIds), '?'));
        $params = array_merge([$productId], $imageIds);
        
        $sql = "SELECT id, image_path FROM product_images WHERE product_id = ? AND id IN ({$placeholders})";
        $images = $this->database->fetchAll($sql, $params);
        
        if (empty($images)) {
            error_log("No images found to delete with IDs: " . json_encode($imageIds));
            return true;
        }
        
        $successCount = 0;
        
        foreach ($images as $image) {
            // Delete the file from filesystem
            $this->deleteImageFile($image['image_path']);
            
            // Delete the database record
            $deleted = $this->productRepository->deleteProductImage($productId, $image['id']);
            
            if ($deleted) {
                error_log("Successfully deleted image record with ID {$image['id']}");
                $successCount++;
            } else {
                error_log("Failed to delete image record with ID {$image['id']}");
            }
        }
        
        error_log("Successfully deleted {$successCount} out of " . count($images) . " images");
        return true;
    } catch (Exception $e) {
        error_log("Error in deleteImages: " . $e->getMessage());
        error_log("Stack trace: " . $e->getTraceAsString());
        throw new Exception('There was a problem deleting some product images. Please try again.');
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
           // Get the full path to the image file
           $fullPath = $_SERVER['DOCUMENT_ROOT'] . '/ramesh-be/be/api/public/' . $imagePath;
           
           error_log("Attempting to delete file: {$fullPath}");
           
           if (file_exists($fullPath)) {
               if (unlink($fullPath)) {
                   error_log("Successfully deleted file: {$fullPath}");
                   return true;
               } else {
                   error_log("Failed to delete file: {$fullPath}. Error: " . error_get_last()['message']);
                   return false;
               }
           } else {
               error_log("File does not exist: {$fullPath}");
               return true; // Consider it a success if file doesn't exist
           }
       } catch (Exception $e) {
           error_log("Error deleting image file: " . $e->getMessage());
           return false;
       }
   }

   /**
    * Set primary image for a product
    *
    * @param int $productId Product ID
    * @param int $imageId Image ID to set as primary
    * @return bool Success
    */
   private function setPrimaryImage($productId, $imageId)
   {
       return $this->productRepository->setPrimaryProductImage($productId, $imageId);
   }
   
   /**
    * Validate file
    *
    * @param string $fileName File name
    * @param string $fileType File type
    * @param int $fileSize File size
    * @return bool Valid
    */
   private function validateFile($fileName, $fileType, $fileSize)
   {
       try {
           // Check file type
           $allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
           
           if (!in_array($fileType, $allowedTypes)) {
               error_log("Invalid file type: {$fileType} for file {$fileName}. Allowed types: " . implode(', ', $allowedTypes));
               throw new Exception("The file '{$fileName}' is not a valid image type. Please upload only JPEG, PNG, GIF, or WebP images.");
           }
           
           // Check file size (max 5MB)
           $maxSize = 5 * 1024 * 1024;
           
           if ($fileSize > $maxSize) {
               error_log("File too large: {$fileSize} bytes for file {$fileName}. Max size: {$maxSize} bytes");
               throw new Exception("The image '{$fileName}' is too large. Please upload images smaller than 5MB.");
           }
           
           return true;
       } catch (Exception $e) {
           error_log("Error validating file {$fileName}: " . $e->getMessage());
           throw $e; // Re-throw to be caught by the calling method
       }
   }

   /**
    * Convert technical error messages to user-friendly ones
    *
    * @param string $errorMessage Technical error message
    * @return string User-friendly error message
    */
   private function getUserFriendlyErrorMessage($errorMessage) {
       // Map of technical error patterns to user-friendly messages
       $errorMap = [
           '/database error/i' => 'There was a problem with our system. Please try again later.',
           '/duplicate entry/i' => 'Some information you provided is already in use. Please check your inputs and try again.',
           '/foreign key constraint/i' => 'The category or subcategory you selected may no longer exist. Please select a valid category and subcategory.',
           '/not found/i' => 'The item you\'re looking for could not be found. It may have been removed.',
           '/permission/i' => 'You don\'t have permission to perform this action.',
           '/timeout/i' => 'The operation took too long to complete. Please try again.',
           '/invalid/i' => 'Some of the information you provided is not valid. Please check your inputs and try again.',
           '/required/i' => 'Please fill in all required fields.',
           '/Trying to get property/i' => 'There was an issue with your account information. Please log out and log back in.',
           '/Variant with ID/i' => 'One of the product variants could not be found. It may have been deleted.',
           '/image/i' => 'There was a problem with one or more of your product images. Please check the image files and try again.',
           '/file/i' => 'There was a problem with one or more of your files. Please check the files and try again.',
           '/transaction/i/i' => 'There was a database transaction issue. Please try again.',
       ];
       
       // Check if the error message matches any patterns
       foreach ($errorMap as $pattern => $friendlyMessage) {
           if (preg_match($pattern, $errorMessage)) {
               return $friendlyMessage;
           }
       }
       
       // If no match, return a generic message
       return 'An unexpected error occurred. Please try again or contact support if the problem persists.';
   }
     
   /**
    * Get tag suggestions based on search query
    *
    * @param string $query Search query
    * @param int $limit Maximum number of suggestions to return
    * @return array Tag suggestions
    */
   public function getTagSuggestions($query, $limit = 1000)
   {
       try {
           // Validate input
           if (empty($query)) {
               // If no query is provided, return the most used tags
               return $this->getMostUsedTags($limit);
           }
           
           // Get tag suggestions from repository
           $suggestions = $this->productRepository->getTagSuggestions($query, $limit);
           
           return $suggestions;
       } catch (Exception $e) {
           error_log("Error in getTagSuggestions: " . $e->getMessage());
           throw new Exception('We couldn\'t retrieve tag suggestions: ' . $this->getUserFriendlyErrorMessage($e->getMessage()));
       }
   }
   
   /**
    * Get most used tags
    *
    * @param int $limit Maximum number of tags to return
    * @return array Most used tags
    */
   private function getMostUsedTags($limit = 1000)
   {
       try {
           $sql = "SELECT t.id, t.name, COUNT(pt.product_id) as usage_count 
                   FROM tags t 
                   JOIN product_tags pt ON t.id = pt.tag_id 
                   GROUP BY t.id 
                   ORDER BY usage_count DESC, t.name ASC 
                   LIMIT :limit";
           
           $params = [':limit' => $limit];
           
           $tags = $this->database->fetchAll($sql, $params);
           
           return $tags;
       } catch (Exception $e) {
           error_log("Error in getMostUsedTags: " . $e->getMessage());
           return [];
       }
   }

/**
 * Reorder product images
 *
 * @param int $productId Product ID
 * @param array $imageOrder Array of image IDs in the desired order
 * @return bool Success
 */
private function reorderProductImages($productId, $imageOrder)
{
    try {
        if (empty($imageOrder) || !is_array($imageOrder)) {
            error_log("No image order provided for reordering");
            return false;
        }
        
        error_log("Reordering images for product {$productId}: " . json_encode($imageOrder));
        
        // Validate that all images belong to this product
        $existingImages = $this->database->fetchAll(
            "SELECT id FROM product_images WHERE product_id = :product_id",
            [':product_id' => $productId]
        );
        
        $existingImageIds = array_column($existingImages, 'id');
        
        // Filter out any image IDs that don't belong to this product
        $validImageOrder = array_filter($imageOrder, function($imageId) use ($existingImageIds) {
            return in_array($imageId, $existingImageIds);
        });
        
        if (empty($validImageOrder)) {
            error_log("No valid image IDs found for reordering");
            return false;
        }
        
        // Update display_order for each image
        $successCount = 0;
        foreach ($validImageOrder as $index => $imageId) {
            $updated = $this->database->update(
                'product_images',
                ['display_order' => $index],
                ['id' => $imageId, 'product_id' => $productId]
            );
            
            if ($updated) {
                $successCount++;
            }
        }
        
        error_log("Successfully reordered {$successCount} out of " . count($validImageOrder) . " images");
        return $successCount > 0;
    } catch (Exception $e) {
        error_log("Error in reorderProductImages: " . $e->getMessage());
        error_log("Stack trace: ".$e->getTraceAsString());
        throw new Exception('There was a problem reordering your product images. Please try again.');
    }
}

private function validateProductName($name)
{
    // Check length
    if (strlen($name) < 3) {
        throw new Exception("product_name:Name too short (min 3 chars)");
    }
    
    if (strlen($name) > 255) {
        throw new Exception("product_name:Name too long (max 255 chars)");
    }
    
    // Check for special characters that might cause issues
    if (preg_match('/[<>{}]/', $name)) {
        throw new Exception("product_name:Name contains invalid characters");
    }
}
// Add this new method after the getTagSuggestions method

/**
 * Get all product SKUs for frontend validation
 *
 * @return array Array of products with their SKUs
 */
public function getAllProductSkus()
{
    try {
        // Get all products with their SKUs from repository
        $productsWithSkus = $this->productRepository->getAllProductSkus();
        
        return $productsWithSkus;
    } catch (Exception $e) {
        error_log("Error in getAllProductSkus: " . $e->getMessage());
        throw new Exception('We couldn\'t retrieve the product SKUs: ' . $this->getUserFriendlyErrorMessage($e->getMessage()));
    }
}
// Add this new method after the getAllProductSkus method

/**
 * Check if a product name already exists
 *
 * @param string $name Product name to check
 * @param int|null $excludeProductId Product ID to exclude from check
 * @return bool True if name exists, false otherwise
 */
public function checkProductNameExists($name, $excludeProductId = null)
{
    try {
        // Check if product name exists
        return $this->productRepository->checkProductNameExists($name, $excludeProductId);
    } catch (Exception $e) {
        error_log("Error in checkProductNameExists: " . $e->getMessage());
        throw new Exception('We couldn\'t check the product name: ' . $this->getUserFriendlyErrorMessage($e->getMessage()));
    }
}
}
