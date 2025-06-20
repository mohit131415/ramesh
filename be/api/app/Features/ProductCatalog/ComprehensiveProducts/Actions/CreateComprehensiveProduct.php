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
use App\Core\Database;
use Exception;

class CreateComprehensiveProduct
{
    use ValidatesInput;
    
    private $productService;
    private $authentication;
    private $database;
    private $baseUrl;

    public function __construct()
    {
        $this->productService = new ComprehensiveProductService();
        $this->authentication = Authentication::getInstance();
        $this->database = Database::getInstance();
        
        // Get base URL from environment configuration
        $this->baseUrl = config('app.url');
        
        // Ensure the base URL ends with a trailing slash
        if (substr($this->baseUrl, -1) !== '/') {
            $this->baseUrl .= '/';
        }
        
        error_log("CreateComprehensiveProduct - Base URL set to: " . $this->baseUrl);
    }

    public function execute(Request $request, Response $response)
    {
        try {
            // Get authenticated user
            $user = $this->authentication->user();
        
            // Check if user is authenticated
            if (!$user) {
                throw new AuthenticationException('User not authenticated');
            }
        
            // Get user ID safely, handling both array and object formats
            $userId = null;
            if (is_array($user)) {
                $userId = $user['id'] ?? null;
            } else if (is_object($user)) {
                $userId = $user->id ?? null;
            }
        
            if (!$userId) {
                throw new AuthenticationException('User ID not found');
            }
        
            // Get request data
            $data = $request->getBody();
        
            // Debug log the request data
            error_log("Create product request data: " . json_encode($data));
        
            // Check if variants exist in the request
            if (!isset($data['variants']) || !is_array($data['variants']) || empty($data['variants'])) {
                error_log("Variants missing or empty in request data");
            
                // Check if variants might be in a different format (e.g., JSON string)
                if (isset($data['variants']) && is_string($data['variants'])) {
                    error_log("Variants is a string, attempting to decode JSON");
                    $decodedVariants = json_decode($data['variants'], true);
                    if (json_last_error() === JSON_ERROR_NONE && is_array($decodedVariants) && !empty($decodedVariants)) {
                        error_log("Successfully decoded variants from JSON string");
                        $data['variants'] = $decodedVariants;
                    } else {
                        error_log("Failed to decode variants JSON: " . json_last_error_msg());
                    }
                }
            
                // If still no variants, check if they might be in a nested structure
                if ((!isset($data['variants']) || !is_array($data['variants']) || empty($data['variants'])) && isset($data['product'])) {
                    error_log("Checking for variants in nested 'product' structure");
                    if (isset($data['product']['variants']) && is_array($data['product']['variants']) && !empty($data['product']['variants'])) {
                        error_log("Found variants in nested 'product' structure");
                        $data['variants'] = $data['product']['variants'];
                    }
                }
            
                // If still no variants, throw a clear error
                if (!isset($data['variants']) || !is_array($data['variants']) || empty($data['variants'])) {
                    throw new ValidationException("Please add at least one product variant to continue.");
                }
            }
        
            // Validate required fields
            $this->validateRequiredFields($data);
            
            // Validate product name
            $this->validateProductName($data['name']);
            
            // Validate variant uniqueness
            $this->validateVariantUniqueness($data['variants']);
            
            // Validate SKU uniqueness
            $this->validateSkuUniqueness($data['variants']);
            
            // Generate short description if not provided
            if (!isset($data['short_description']) || empty($data['short_description'])) {
                $data['short_description'] = $this->generateShortDescription($data['description'] ?? '');
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
            
            // Calculate discount percentage for variants if not provided
            foreach ($data['variants'] as &$variant) {
                if (!isset($variant['discount_percentage']) && isset($variant['price']) && isset($variant['sale_price']) && 
                    $variant['price'] > 0 && $variant['sale_price'] > 0 && $variant['sale_price'] < $variant['price']) {
                    $variant['discount_percentage'] = round(((floatval($variant['price']) - floatval($variant['sale_price'])) / floatval($variant['price'])) * 100, 2);
                    error_log("Calculated discount percentage for variant {$variant['sku']}: {$variant['discount_percentage']}%");
                }
            }
            
            // Get files
            $files = $request->getFile('images');

            // Validate and prepare image files if provided
            if ($files) {
                error_log("Image files received: " . json_encode(array_keys($files)));
                
                // Check if files is a proper upload array
                if (isset($files['name']) && is_array($files['name']) && !empty($files['name'][0])) {
                    error_log("Validating " . count($files['name']) . " image files");
                    $this->validateImageFiles($files);
                } else {
                    error_log("No valid image files found in request");
                    $files = null;
                }
            } else {
                error_log("No image files in request");
            }
        
            // Create product
            $result = $this->productService->createComprehensiveProduct($data, $files, $userId);
            
            // Format image URLs in the result
            if (isset($result['images']) && is_array($result['images'])) {
                foreach ($result['images'] as &$image) {
                    if (!empty($image['image_path'])) {
                        // Ensure we don't duplicate the base URL if it's already there
                        if (strpos($image['image_path'], $this->baseUrl) !== 0) {
                            $image['image_url'] = $this->baseUrl . $image['image_path'];
                        } else {
                            $image['image_url'] = $image['image_path'];
                        }
                    }
                }
            }
        
            // Return response
            return ResponseFormatter::success(
                $result,
                'Product created successfully'
            );
        } catch (ValidationException $e) {
            error_log("Validation error in CreateComprehensiveProduct: " . $e->getMessage());
            throw $e;
        } catch (AuthenticationException $e) {
            error_log("Authentication error in CreateComprehensiveProduct: " . $e->getMessage());
            throw $e;
        } catch (Exception $e) {
            error_log("Error in CreateComprehensiveProduct: " . $e->getMessage());
            error_log("Stack trace: " . $e->getTraceAsString());
            throw new Exception('We couldn\'t create your product. ' . $this->getUserFriendlyErrorMessage($e->getMessage()));
        }
    }
    
    /**
     * Validate required fields for product creation
     *
     * @param array $data Request data
     * @throws ValidationException If validation fails
     */
    private function validateRequiredFields($data)
    {
        $requiredFields = [
            'name' => 'Product name',
            'category_id' => 'Category',
            'subcategory_id' => 'Subcategory',
            'status' => 'Status',
            'product_type' => 'Product type'
        ];
        
        foreach ($requiredFields as $field => $label) {
            if (!isset($data[$field]) || (is_string($data[$field]) && trim($data[$field]) === '')) {
                throw new ValidationException("{$label} is required");
            }
        }

        // Validate product_type enum
        if (isset($data['product_type'])) {
            $allowedProductTypes = ['global', 'local', 'takeaway'];
            if (!in_array($data['product_type'], $allowedProductTypes)) {
                throw new ValidationException("Product type must be one of: " . implode(', ', $allowedProductTypes));
            }
        }
        
        // Validate variants with detailed error messages
        if (!isset($data['variants'])) {
            throw new ValidationException("Product variants are required but 'variants' field is missing");
        }
        
        if (!is_array($data['variants'])) {
            throw new ValidationException("Product variants must be an array, " . gettype($data['variants']) . " given");
        }
        
        if (empty($data['variants'])) {
            throw new ValidationException("At least one product variant is required, but variants array is empty");
        }
        
        error_log("Validating " . count($data['variants']) . " variants");
        
        // Validate each variant
        foreach ($data['variants'] as $index => $variant) {
            error_log("Validating variant #" . ($index + 1) . ": " . json_encode($variant));
            
            if (!is_array($variant)) {
                throw new ValidationException("Variant #" . ($index + 1) . " must be an array, " . gettype($variant) . " given");
            }
            
            if (!isset($variant['variant_name']) || empty($variant['variant_name'])) {
                throw new ValidationException("Please provide a name for variant #" . ($index + 1));
            }
            
            if (!isset($variant['sku']) || empty($variant['sku'])) {
                throw new ValidationException("Please provide a SKU for variant #" . ($index + 1));
            }
            
            if (!isset($variant['price'])) {
                throw new ValidationException("Please provide a price for variant #" . ($index + 1));
            }
            
            if (!isset($variant['status'])) {
                throw new ValidationException("Please select a status for variant #" . ($index + 1));
            }
            
            // Validate price is positive
            if (isset($variant['price']) && floatval($variant['price']) <= 0) {
                throw new ValidationException("Please enter a price greater than zero for variant #" . ($index + 1));
            }
            
            // Validate sale price is not greater than regular price
            if (isset($variant['sale_price']) && isset($variant['price']) && 
                floatval($variant['sale_price']) > floatval($variant['price'])) {
                throw new ValidationException("The sale price cannot be higher than the regular price for variant #" . ($index + 1));
            }
            
            // Validate SKU format
            if (isset($variant['sku']) && !preg_match('/^[a-zA-Z0-9_\-\.]+$/', $variant['sku'])) {
                throw new ValidationException("The SKU '{$variant['sku']}' contains invalid characters. Please use only letters, numbers, underscores, hyphens, and periods.");
            }
            
            if (isset($variant['sku']) && strlen($variant['sku']) > 50) {
                throw new ValidationException("The SKU '{$variant['sku']}' is too long. Please use 50 characters or less.");
            }
        }
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
        }
    }
    
    /**
     * Check if SKUs already exist in the database
     *
     * @param array $variants Product variants
     * @throws ValidationException If validation fails
     */
    private function validateSkuUniqueness($variants)
    {
        // Extract SKUs from variants
        $skusToCheck = [];
        foreach ($variants as $variant) {
            $skusToCheck[] = $variant['sku'];
        }
        
        // Check if SKUs exist in the database
        $existingSkus = $this->productService->checkExistingSkus($skusToCheck);
        
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
        error_log("Validating {$fileCount} image files");
        
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
        
        error_log("All image files validated successfully");
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
            '/database error/i' => 'There was a problem with our system.',
            '/duplicate entry/i' => 'This information is already in use.',
            '/foreign key constraint/i' => 'This item is being used by other records.',
            '/not found/i' => 'The requested item could not be found.',
            '/permission/i' => 'You don\'t have permission to perform this action.',
            '/timeout/i' => 'The operation took too long to complete. Please try again.',
            '/invalid/i' => 'Some of the information provided is not valid.',
            '/required/i' => 'Please fill in all required fields.',
            '/Trying to get property/i' => 'There was an issue with your account information.',
            '/Variant with ID/i' => 'One of the product variants could not be found. It may have been deleted.',
        ];
        
        // Check if the error message matches any patterns
        foreach ($errorMap as $pattern => $friendlyMessage) {
            if (preg_match($pattern, $errorMessage)) {
                return $friendlyMessage;
            }
        }
        
        // If no match, return a generic message
        return 'Please try again or contact support if the problem persists.';
    }
}
