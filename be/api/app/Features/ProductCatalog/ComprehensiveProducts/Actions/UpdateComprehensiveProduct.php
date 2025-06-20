<?php

namespace App\Features\ProductCatalog\ComprehensiveProducts\Actions;

use App\Core\Request;
use App\Core\Response;
use App\Features\ProductCatalog\ComprehensiveProducts\Services\ComprehensiveProductService;
use App\Shared\Helpers\ResponseFormatter;
use App\Shared\Traits\ValidatesInput;
use App\Core\Security\Authentication;
use App\Shared\Exceptions\AuthenticationException;
use App\Shared\Exceptions\ValidationException;
use App\Shared\Exceptions\NotFoundException;
use App\Core\Database;
use Exception;

class UpdateComprehensiveProduct
{
    use ValidatesInput;
    
    private $productService;
    private $authentication;
    private $database;

    public function __construct()
    {
        $this->productService = new ComprehensiveProductService();
        $this->authentication = Authentication::getInstance();
        $this->database = Database::getInstance();
        
        error_log("UpdateComprehensiveProduct initialized");
    }

    // Update the execute method to include better error handling and debugging
    public function execute(Request $request, Response $response)
    {
        // We'll manage transactions at the service level, not here
        try {
            // Get authenticated user
            $user = $this->authentication->user();
            
            // Check if user is authenticated
            if (!$user) {
                throw new AuthenticationException('Your session has expired. Please log in again to continue.');
            }
            
            // Get user ID safely, handling both array and object formats
            $userId = null;
            if (is_array($user)) {
                $userId = $user['id'] ?? null;
            } else if (is_object($user)) {
                $userId = $user->id ?? null;
            }
            
            if (!$userId) {
                throw new AuthenticationException('We couldn\'t verify your account. Please log out and log in again.');
            }
            
            // Get product ID from route parameters
            $productId = $request->getParam('id');
            
            if (!$productId) {
                throw new Exception('We couldn\'t identify which product to update. Please try again.');
            }
            
            // Check if product exists
            $existingProduct = $this->productService->getComprehensiveProductById($productId);
            
            if (!$existingProduct) {
                throw new NotFoundException('The product you\'re trying to update doesn\'t exist or has been removed.');
            }
            
            // Get request data
            $data = $request->getBody();
            
            // Detailed logging for debugging
            error_log("Raw update data received: " . json_encode($data));
            
            // Process variants data - ensure it's an array
            if (isset($data['variants'])) {
                if (!is_array($data['variants'])) {
                    // Try to decode JSON string
                    $decodedVariants = json_decode($data['variants'], true);
                    if (is_array($decodedVariants)) {
                        $data['variants'] = $decodedVariants;
                    } else {
                        throw new ValidationException('There\'s an issue with your product variants. Please try again.');
                    }
                }
                
                // Ensure we have at least one variant
                if (empty($data['variants'])) {
                    throw new ValidationException('Your product needs at least one variant. Please add a variant to continue.');
                }
                
                // Process variants - ensure proper type conversion
                foreach ($data['variants'] as $index => &$variant) {
                    // Validate required variant fields
                    if (!isset($variant['variant_name']) || empty($variant['variant_name'])) {
                        throw new ValidationException('Please provide a name for all variants.');
                    }
                    
                    if (!isset($variant['sku']) || empty($variant['sku'])) {
                        throw new ValidationException('Please provide a SKU for all variants.');
                    }
                    
                    if (!isset($variant['price'])) {
                        throw new ValidationException('Please provide a price for all variants.');
                    }
                    
                    if (!isset($variant['status'])) {
                        throw new ValidationException('Please select a status for all variants.');
                    }
                    
                    // Convert string IDs to integers
                    if (isset($variant['id']) && !is_numeric($variant['id'])) {
                        $variant['id'] = (int)$variant['id'];
                    }
                    
                    // Convert numeric fields to proper types
                    if (isset($variant['price'])) {
                        $variant['price'] = (float)$variant['price'];
                    }
                    if (isset($variant['sale_price'])) {
                        $variant['sale_price'] = (float)$variant['sale_price'];
                    }
                    if (isset($variant['discount_percentage'])) {
                        $variant['discount_percentage'] = (float)$variant['discount_percentage'];
                    }
                    if (isset($variant['weight'])) {
                        $variant['weight'] = (float)$variant['weight'];
                    }
                    if (isset($variant['min_order_quantity'])) {
                        $variant['min_order_quantity'] = (int)$variant['min_order_quantity'];
                    }
                    if (isset($variant['max_order_quantity'])) {
                        $variant['max_order_quantity'] = (int)$variant['max_order_quantity'];
                    }
                    if (isset($variant['display_order'])) {
                        $variant['display_order'] = (int)$variant['display_order'];
                    }
                    
                    // Handle dimensions if it's a string
                    if (isset($variant['dimensions'])) {
                        if (is_string($variant['dimensions']) && !empty($variant['dimensions'])) {
                            // Check if it's already a JSON string
                            $decoded = json_decode($variant['dimensions'], true);
                            if (json_last_error() !== JSON_ERROR_NONE) {
                                // Not a valid JSON, try to convert it
                                $variant['dimensions'] = json_encode(['dimensions' => $variant['dimensions']]);
                            } else {
                                // It's already valid JSON, re-encode to ensure consistency
                                $variant['dimensions'] = json_encode($decoded);
                            }
                        } else if (is_array($variant['dimensions'])) {
                            $variant['dimensions'] = json_encode($variant['dimensions']);
                        } else if (empty($variant['dimensions'])) {
                            $variant['dimensions'] = null;
                        }
                    }
                    
                    // Calculate discount percentage if not provided
                    if (!isset($variant['discount_percentage']) && isset($variant['price']) && isset($variant['sale_price']) && 
                        $variant['price'] > 0 && $variant['sale_price'] > 0 && $variant['sale_price'] < $variant['price']) {
                        $variant['discount_percentage'] = round(((floatval($variant['price']) - floatval($variant['sale_price'])) / floatval($variant['price'])) * 100, 2);
                        error_log("Calculated discount percentage for variant {$variant['sku']}: {$variant['discount_percentage']}%");
                    }

                    // Validate sale price is not greater than regular price
                    if (isset($variant['sale_price']) && isset($variant['price']) && 
                        floatval($variant['sale_price']) > floatval($variant['price'])) {
                        throw new ValidationException("The sale price cannot be higher than the regular price for variant #" . ($index + 1));
                    }
                }
                
                // Validate variant uniqueness within this product
                $this->validateVariantUniqueness($data['variants']);
                
                // Check for SKU uniqueness in database (excluding current product variants)
                $this->validateSkuUniqueness($data['variants'], $productId);
            } else {
                // If no variants provided, use existing ones
                $existingVariants = [];
                foreach ($existingProduct['variants'] as $variant) {
                    $existingVariants[] = [
                        'id' => $variant['id'],
                        'variant_name' => $variant['variant_name'],
                        'sku' => $variant['sku'],
                        'price' => (float)$variant['price'],
                        'sale_price' => isset($variant['sale_price']) ? (float)$variant['sale_price'] : null,
                        'discount_percentage' => isset($variant['discount_percentage']) ? (float)$variant['discount_percentage'] : null,
                        'weight' => isset($variant['weight']) ? (float)$variant['weight'] : null,
                        'weight_unit' => $variant['weight_unit'] ?? 'g',
                        'dimensions' => $variant['dimensions'],
                        'status' => $variant['status'],
                        'min_order_quantity' => isset($variant['min_order_quantity']) ? (int)$variant['min_order_quantity'] : 1,
                        'max_order_quantity' => isset($variant['max_order_quantity']) ? (int)$variant['max_order_quantity'] : null,
                        'display_order' => isset($variant['display_order']) ? (int)$variant['display_order'] : 0
                    ];
                }
                $data['variants'] = $existingVariants;
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
            
            // Process delete_variant_ids
            if (isset($data['delete_variant_ids']) && !is_array($data['delete_variant_ids'])) {
                // Try to decode JSON string
                $decodedIds = json_decode($data['delete_variant_ids'], true);
                if (is_array($decodedIds)) {
                    $data['delete_variant_ids'] = $decodedIds;
                } else if (is_string($data['delete_variant_ids']) && !empty($data['delete_variant_ids'])) {
                    // Try comma-separated string
                    $data['delete_variant_ids'] = array_map('intval', array_map('trim', explode(',', $data['delete_variant_ids'])));
                } else {
                    $data['delete_variant_ids'] = [];
                }
            }
            
            // Process ingredients data
            if (isset($data['ingredients'])) {
                if (!is_array($data['ingredients'])) {
                    // Try to decode JSON string
                    $decodedIngredients = json_decode($data['ingredients'], true);
                    if (is_array($decodedIngredients)) {
                        $data['ingredients'] = json_encode($decodedIngredients);
                    } else if (is_string($data['ingredients']) && !empty($data['ingredients'])) {
                        // If it's a string but not JSON, try to convert comma-separated list
                        $ingredientsArray = array_map('trim', explode(',', $data['ingredients']));
                        $data['ingredients'] = json_encode($ingredientsArray);
                    } else if (empty($data['ingredients'])) {
                        $data['ingredients'] = json_encode([]);
                    }
                } else {
                    $data['ingredients'] = json_encode($data['ingredients']);
                }
            }
            
            // Process nutritional_info data
            if (isset($data['nutritional_info'])) {
                if (!is_array($data['nutritional_info'])) {
                    // Try to decode JSON string
                    $decodedNutritionalInfo = json_decode($data['nutritional_info'], true);
                    if (is_array($decodedNutritionalInfo)) {
                        $data['nutritional_info'] = json_encode($decodedNutritionalInfo);
                    } else if (empty($data['nutritional_info'])) {
                        $data['nutritional_info'] = json_encode([]);
                    }
                } else {
                    $data['nutritional_info'] = json_encode($data['nutritional_info']);
                }
            }
            
            // Process attributes data
            if (isset($data['attributes'])) {
                if (!is_array($data['attributes'])) {
                    // Try to decode JSON string
                    $decodedAttributes = json_decode($data['attributes'], true);
                    if (is_array($decodedAttributes)) {
                        $data['attributes'] = json_encode($decodedAttributes);
                    } else if (empty($data['attributes'])) {
                        $data['attributes'] = json_encode([]);
                    }
                } else {
                    $data['attributes'] = json_encode($data['attributes']);
                }
            }
            
            // Process tags data
            if (isset($data['tags'])) {
                if (!is_array($data['tags'])) {
                    // Try to decode JSON string
                    $decodedTags = json_decode($data['tags'], true);
                    if (is_array($decodedTags)) {
                        $data['tags'] = $decodedTags;
                    } else if (is_string($data['tags']) && !empty($data['tags'])) {
                        // Try comma-separated string
                        $data['tags'] = array_map('trim', explode(',', $data['tags']));
                    } else {
                        $data['tags'] = [];
                    }
                }
            } else {
                // If no tags provided, use existing ones
                $existingTags = [];
                if (isset($existingProduct['tags']) && is_array($existingProduct['tags'])) {
                    foreach ($existingProduct['tags'] as $tag) {
                        $existingTags[] = $tag['name'];
                    }
                }
                $data['tags'] = $existingTags;
            }
            
            // Get uploaded files
            $files = $request->getFile('images');

            // IMPROVED IMAGE HANDLING - Process image data
            $this->processImageData($data, $files, $existingProduct);
            
            // Handle primary_image_id
            if (isset($data['primary_image_id'])) {
                if (!empty($data['primary_image_id'])) {
                    $data['primary_image_id'] = (int)$data['primary_image_id'];
                } else {
                    unset($data['primary_image_id']);
                }
            }
            
            // Convert numeric fields to proper types
            if (isset($data['category_id'])) {
                $data['category_id'] = (int)$data['category_id'];
            } else {
                $data['category_id'] = $existingProduct['category_id'];
            }
            
            if (isset($data['subcategory_id'])) {
                $data['subcategory_id'] = (int)$data['subcategory_id'];
            } else {
                $data['subcategory_id'] = $existingProduct['subcategory_id'];
            }
            
            if (isset($data['tax_rate'])) {
                $data['tax_rate'] = (float)$data['tax_rate'];
            }
            
            if (isset($data['cgst_rate'])) {
                $data['cgst_rate'] = (float)$data['cgst_rate'];
            }
            
            if (isset($data['sgst_rate'])) {
                $data['sgst_rate'] = (float)$data['sgst_rate'];
            }
            
            if (isset($data['igst_rate'])) {
                $data['igst_rate'] = (float)$data['igst_rate'];
            }
            
            if (isset($data['display_order'])) {
                $data['display_order'] = (int)$data['display_order'];
            }
            
            if (isset($data['product_type'])) {
                // Validate product_type enum
                $allowedProductTypes = ['global', 'local', 'takeaway'];
                if (!in_array($data['product_type'], $allowedProductTypes)) {
                    throw new ValidationException("Product type must be one of: " . implode(', ', $allowedProductTypes));
                }
            }
            
            if (isset($data['is_vegetarian'])) {
                $data['is_vegetarian'] = (int)$data['is_vegetarian'];
            }
            
            // Ensure required fields are present
            if (!isset($data['name']) || empty($data['name'])) {
                $data['name'] = $existingProduct['name'];
            } else {
                // Validate product name
                $this->validateProductName($data['name']);
            }
            
            if (!isset($data['status']) || empty($data['status'])) {
                $data['status'] = $existingProduct['status'];
            }
            
            if (!isset($data['product_type']) || empty($data['product_type'])) {
                $data['product_type'] = $existingProduct['product_type'] ?? 'global';
            }
            
            // Set updated_by
            $data['updated_by'] = $userId;
            
            // Debug log
            error_log("Processed update data: " . json_encode($data));
            
            // Update product
            $result = $this->productService->updateComprehensiveProduct($productId, $data, $files, $userId);
            
            // Return response with simplified format
            return [
                'status' => 'success',
                'message' => 'Product updated successfully',
                'data' => $result
            ];
        } catch (ValidationException $e) {
            error_log("Validation error: " . $e->getMessage());
            return [
                'status' => 'error',
                'message' => $e->getMessage(),
                'data' => null
            ];
        } catch (AuthenticationException $e) {
            error_log("Authentication error: " . $e->getMessage());
            return [
                'status' => 'error',
                'message' => $e->getMessage(),
                'data' => null
            ];
        } catch (NotFoundException $e) {
            error_log("Not found error: " . $e->getMessage());
            return [
                'status' => 'error',
                'message' => $e->getMessage(),
                'data' => null
            ];
        } catch (Exception $e) {
            // Don't try to rollback here - let the service handle its own transactions
            error_log("Error in updateComprehensiveProduct: " . $e->getMessage());
            error_log("Stack trace: " . $e->getTraceAsString());

            // Provide specific error messages for common issues
            $errorMessage = $e->getMessage();
            $status = 'error';
            $responseMessage = '';

            // Check for specific error patterns and provide better messages
            if (strpos($errorMessage, 'Cannot activate this product because its category') !== false) {
                $responseMessage = $errorMessage; // Use the detailed category inactive message
            }
            else if (strpos($errorMessage, 'Cannot activate this product because its subcategory') !== false) {
                $responseMessage = $errorMessage; // Use the detailed subcategory inactive message
            }
            else if (strpos($errorMessage, 'must have at least one active variant') !== false) {
                $responseMessage = $errorMessage; // Use the active variant requirement message
            }
            else if (strpos($errorMessage, 'duplicate entry') !== false || 
                     strpos($errorMessage, 'already being used') !== false) {
                if (strpos($errorMessage, 'sku') !== false || strpos($errorMessage, 'SKU') !== false) {
                    $responseMessage = 'One of your product SKUs is already in use. Please use unique SKUs for all variants.';
                } else if (strpos($errorMessage, 'slug') !== false || strpos($errorMessage, 'name') !== false) {
                    $responseMessage = 'A product with this name already exists. Please choose a different product name.';
                } else {
                    $responseMessage = 'Some information you provided is already in use. Please check your inputs and try again.';
                }
            }
            else if (strpos($errorMessage, 'foreign key constraint') !== false) {
                $responseMessage = 'The category or subcategory you selected no longer exists. Please select a valid category and subcategory.';
            }
            else if (strpos($errorMessage, 'transaction') !== false) {
                $responseMessage = 'There was a database transaction issue. Please try again.';
            }
            else {
                // For other errors, use the original message if it seems user-friendly, otherwise use a generic message
                if (strlen($errorMessage) > 20 && !strpos($errorMessage, 'SQL') && !strpos($errorMessage, 'Exception')) {
                    $responseMessage = $errorMessage;
                } else {
                    $responseMessage = 'We couldn\'t update your product. Please try again or contact support if the problem persists.';
                }
            }

            return [
                'status' => $status,
                'message' => $responseMessage,
                'data' => null
            ];
        }
    }

    /**
     * Process image data for update
     * 
     * @param array &$data Request data (passed by reference to modify)
     * @param array $files Uploaded files
     * @param array $existingProduct Existing product data
     * @return void
     */
    private function processImageData(&$data, $files, $existingProduct)
    {
    // Initialize image IDs to delete
    $data['delete_image_ids'] = isset($data['delete_image_ids']) ? $data['delete_image_ids'] : [];
    
    // Convert delete_image_ids to array if it's not already
    if (!is_array($data['delete_image_ids'])) {
        // Try to decode JSON string
        $decodedIds = json_decode($data['delete_image_ids'], true);
        if (is_array($decodedIds)) {
            $data['delete_image_ids'] = $decodedIds;
        } else if (is_string($data['delete_image_ids']) && !empty($data['delete_image_ids'])) {
            // Try comma-separated string
            $data['delete_image_ids'] = array_map('intval', array_map('trim', explode(',', $data['delete_image_ids'])));
        } else {
            $data['delete_image_ids'] = [];
        }
    }
    
    // Filter out non-numeric values and ensure they're integers
    $data['delete_image_ids'] = array_map('intval', array_filter($data['delete_image_ids'], function($id) {
        return is_numeric($id) && $id > 0;
    }));
    
    error_log("Initial delete_image_ids: " . json_encode($data['delete_image_ids']));
    
    // Check if we have new images
    $hasNewImages = false;
    if ($files && isset($files['name']) && is_array($files['name'])) {
        foreach ($files['name'] as $i => $name) {
            if (!empty($name) && isset($files['error'][$i]) && $files['error'][$i] === UPLOAD_ERR_OK) {
                $hasNewImages = true;
                break;
            }
        }
    }
    
    error_log("Has new images: " . ($hasNewImages ? "Yes" : "No"));
    
    // Get existing image IDs
    $existingImageIds = [];
    if (isset($existingProduct['images']) && is_array($existingProduct['images'])) {
        foreach ($existingProduct['images'] as $image) {
            $existingImageIds[] = (int)$image['id'];
        }
    }
    
    error_log("Existing image IDs: " . json_encode($existingImageIds));
    
    // Handle image_order for reordering images
    if (isset($data['image_order']) && is_array($data['image_order'])) {
        error_log("Image order provided: " . json_encode($data['image_order']));
        // The image_order will be processed in the service layer
    } else if (isset($data['image_order']) && !is_array($data['image_order'])) {
        // Try to decode JSON string
        $decodedOrder = json_decode($data['image_order'], true);
        if (is_array($decodedOrder)) {
            $data['image_order'] = $decodedOrder;
            error_log("Decoded image order: " . json_encode($data['image_order']));
        } else {
            $data['image_order'] = [];
        }
    } else {
        $data['image_order'] = [];
    }
    
    // Check for explicit delete_all_images flag
    $deleteAllImages = isset($data['delete_all_images']) && 
                  ($data['delete_all_images'] === true || 
                   $data['delete_all_images'] === 'true' || 
                   $data['delete_all_images'] === '1' || 
                   $data['delete_all_images'] === 1);
    
    if ($deleteAllImages) {
        error_log("Delete all images flag is set to true");
        $data['delete_image_ids'] = $existingImageIds;
        error_log("Setting all existing images for deletion: " . json_encode($data['delete_image_ids']));
        return;
    }
    
    // Check for explicit keep_existing_images flag
    $keepExistingImages = isset($data['keep_existing_images']) && 
                     ($data['keep_existing_images'] === true || 
                      $data['keep_existing_images'] === 'true' || 
                      $data['keep_existing_images'] === '1' || 
                      $data['keep_existing_images'] === 1);
    
    // Process image_ids from the request (these are the images to keep)
    $keptImageIds = [];
    
    if (isset($data['image_ids'])) {
        if (is_array($data['image_ids'])) {
            $keptImageIds = array_map('intval', $data['image_ids']);
        } else if (is_string($data['image_ids'])) {
            // Try to decode JSON string
            $decodedIds = json_decode($data['image_ids'], true);
            if (is_array($decodedIds)) {
                $keptImageIds = array_map('intval', $decodedIds);
            } else {
                // Try comma-separated string
                $keptImageIds = array_map('intval', array_map('trim', explode(',', $data['image_ids'])));
            }
        }
    }
    
    // IMPROVED LOGIC: If image_order is provided, those are the images to keep
    if (!empty($data['image_order'])) {
        $keptImageIds = array_merge($keptImageIds, array_map('intval', $data['image_order']));
        error_log("Added image_order to kept images: " . json_encode($data['image_order']));
    }
    
    // IMPROVED LOGIC: If primary_image_id is provided and it's an existing image, keep it
    if (isset($data['primary_image_id']) && !empty($data['primary_image_id'])) {
        $primaryImageId = (int)$data['primary_image_id'];
        if (in_array($primaryImageId, $existingImageIds)) {
            $keptImageIds[] = $primaryImageId;
            error_log("Added primary_image_id to kept images: " . $primaryImageId);
        }
    }
    
    // Remove duplicates
    $keptImageIds = array_unique($keptImageIds);
    
    error_log("Kept image IDs from request: " . json_encode($keptImageIds));
    
    // IMPROVED LOGIC: Default behavior when new images are uploaded
    if ($hasNewImages) {
        if (!$keepExistingImages && empty($keptImageIds)) {
            // Only if no explicit instructions to keep images, replace all
            error_log("New images detected without explicit keep instructions. Replacing all images.");
            $data['delete_image_ids'] = $existingImageIds;
        } else {
            // Keep specified images and add new ones
            error_log("New images detected with keep instructions. Adding to existing images.");
            // Images to delete are those that exist but aren't in the kept list
            $imagesToDelete = array_diff($existingImageIds, $keptImageIds);
            if (!empty($imagesToDelete)) {
                error_log("Images to delete based on kept_image_ids: " . json_encode($imagesToDelete));
                $data['delete_image_ids'] = array_merge($data['delete_image_ids'], $imagesToDelete);
            }
        }
    } else {
        // No new images uploaded
        if (!empty($keptImageIds)) {
            // Images to delete are those that exist but aren't in the kept list
            $imagesToDelete = array_diff($existingImageIds, $keptImageIds);
            if (!empty($imagesToDelete)) {
                error_log("No new images, but kept_image_ids provided. Deleting non-kept images: " . json_encode($imagesToDelete));
                $data['delete_image_ids'] = array_merge($data['delete_image_ids'], $imagesToDelete);
            }
        }
        // If no new images and no kept images specified, don't delete anything
    }
    
    // Validate and prepare image files if provided
    if ($files) {
        error_log("Image files received in update: " . json_encode(array_keys($files)));
        
        // Check if files is a proper upload array
        if (isset($files['name']) && is_array($files['name']) && !empty($files['name'][0])) {
            error_log("Validating " . count($files['name']) . " image files for update");
            $this->validateImageFiles($files);
        } else {
            error_log("No valid image files found in update request");
            $files = null;
        }
    } else {
        error_log("No image files in update request");
    }
    
    // Remove duplicates from delete_image_ids and ensure they're all integers
    $data['delete_image_ids'] = array_map('intval', array_unique($data['delete_image_ids']));
    
    error_log("Final delete_image_ids: " . json_encode($data['delete_image_ids']));
}
    
    /**
     * Validate variant names and SKUs for uniqueness within this product
     *
     * @param array $variants Product variants
     * @throws ValidationException If validation fails
     */
    private function validateVariantUniqueness($variants)
    {
        $variantNames = [];
        $skus = [];
        
        foreach ($variants as $index => $variant) {
            $variantName = strtolower(trim($variant['variant_name']));
            $sku = strtolower(trim($variant['sku']));
            
            // Check for duplicate variant names within this product
            if (in_array($variantName, $variantNames)) {
                throw new ValidationException("You've used the name '{$variant['variant_name']}' more than once. Please give each variant a unique name.");
            }
            $variantNames[] = $variantName;
            
            // Check for duplicate SKUs within this product
            if (in_array($sku, $skus)) {
                throw new ValidationException("You've used the SKU '{$variant['sku']}' more than once. Please give each variant a unique SKU.");
            }
            $skus[] = $sku;
            
            // Validate SKU format
            if (!preg_match('/^[a-zA-Z0-9_\-\.]+$/', $variant['sku'])) {
                throw new ValidationException("The SKU '{$variant['sku']}' contains invalid characters. Please use only letters, numbers, underscores, hyphens, and periods.");
            }
            
            if (strlen($variant['sku']) > 50) {
                throw new ValidationException("The SKU '{$variant['sku']}' is too long. Please use 50 characters or less.");
            }
        }
    }
    
    /**
     * Check if SKUs already exist in the database (excluding current product variants)
     *
     * @param array $variants Product variants
     * @param int $productId Current product ID to exclude from check
     * @throws ValidationException If validation fails
     */
    private function validateSkuUniqueness($variants, $productId)
    {
        // Extract SKUs and IDs from variants
        $skusToCheck = [];
        $existingVariantIds = [];
        
        foreach ($variants as $variant) {
            if (isset($variant['id'])) {
                $existingVariantIds[] = $variant['id'];
            } else {
                $skusToCheck[] = $variant['sku'];
            }
        }
        
        // If no new SKUs to check, return
        if (empty($skusToCheck)) {
            return;
        }
        
        // Check if SKUs exist in other products
        $placeholders = implode(',', array_fill(0, count($skusToCheck), '?'));
        $query = "SELECT sku FROM product_variants WHERE sku IN ($placeholders) AND product_id != ?";
        
        $params = $skusToCheck;
        $params[] = $productId;
        
        $result = $this->database->fetchAll($query, $params);
        
        $existingSkus = [];
        foreach ($result as $row) {
            $existingSkus[] = $row['sku'];
        }
        
        if (!empty($existingSkus)) {
            throw new ValidationException("These SKUs are already in use: " . implode(", ", $existingSkus) . ". Please choose different SKUs.");
        }
    }
    
    /**
     * Validate product name format and length
     *
     * @param string $name Product name
     * @throws ValidationException If validation fails
     */
    private function validateProductName($name)
    {
        // Check length
        if (strlen($name) < 3) {
            throw new ValidationException("Please make your product name at least 3 characters long.");
        }
        
        if (strlen($name) > 255) {
            throw new ValidationException("Your product name is too long. Please use 255 characters or less.");
        }
        
        // Check for special characters that might cause issues
        if (preg_match('/[<>{}]/', $name)) {
            throw new ValidationException("Your product name contains invalid characters. Please remove special characters like < > { }.");
        }
    }
    
    /**
     * Calculate GST rates based on tax_rate
     *
     * @param float $taxRate Total tax rate
     * @return array GST rates (cgst_rate, sgst_rate, igst_rate)
     */
    
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
     * Generate a short description from the full description
     *
     * @param string $description Full product description
     * @return string Short description
     */
    private function generateShortDescription($description)
    {
        // Strip HTML tags
        $text = strip_tags($description);
        
        // Trim whitespace
        $text = trim($text);
        
        // Truncate to 160 characters (good for SEO)
        $maxLength = 160;
        
        if (strlen($text) <= $maxLength) {
            return $text;
        }
        
        // Find the last space within the limit
        $lastSpace = strrpos(substr($text, 0, $maxLength), ' ');
        
        if ($lastSpace === false) {
            // No space found, just cut at the limit
            return substr($text, 0, $maxLength) . '...';
        }
        
        // Cut at the last space and add ellipsis
        return substr($text, 0, $lastSpace) . '...';
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
            error_log("Invalid files array structure: " . json_encode($files));
            throw new ValidationException("Invalid file upload structure");
        }
        
        $fileCount = count($files['name']);
        error_log("Validating {$fileCount} image files for update");
        
        for ($i = 0; $i < $fileCount; $i++) {
            // Skip empty uploads
            if ($files['error'][$i] !== UPLOAD_ERR_OK || empty($files['name'][$i])) {
                error_log("Skipping file at index {$i} due to error or empty name");
                continue;
            }
            
            $fileName = $files['name'][$i];
            $fileType = $files['type'][$i];
            $fileSize = $files['size'][$i];
            
            error_log("Validating file: {$fileName}, type: {$fileType}, size: {$fileSize}");
            
            // Check file type
            if (!in_array($fileType, $allowedTypes)) {
                throw new ValidationException("Please upload only JPEG, PNG, GIF, or WebP image files. File '{$fileName}' has type '{$fileType}'.");
            }
            
            // Check file size
            if ($fileSize > $maxFileSize) {
                throw new ValidationException("Your image '{$fileName}' is too large ({$fileSize} bytes). Please upload an image smaller than 5MB.");
            }
        }
        
        error_log("All image files validated successfully for update");
    }
}
