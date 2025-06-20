<?php

namespace App\Features\ProductCatalog\ProductImages\Actions;

use App\Core\Request;
use App\Core\Response;
use App\Features\ProductCatalog\ProductImages\Services\ProductImageService;
use App\Shared\Exceptions\ValidationException;
use App\Shared\Helpers\ResponseFormatter;
use App\Shared\Traits\ValidatesInput;
use App\Core\Security\Authentication;
use Exception;

class UploadProductImages
{
    use ValidatesInput;
    
    private $imageService;
    private $authentication;

    public function __construct()
    {
        $this->imageService = new ProductImageService();
        $this->authentication = Authentication::getInstance();
    }

    public function execute(Request $request, Response $response)
    {
        try {
            // Get authenticated user
            $user = $this->authentication->user();
            
            // Get product ID from route parameters
            $productId = $request->getParam('id');
            
            if (!$productId || !is_numeric($productId)) {
                throw new ValidationException('Invalid product ID provided.');
            }
            
            // Get uploaded files
            $files = $request->getFile('images');
            
            if (!$files || empty($files['name'][0])) {
                throw new ValidationException('Please select at least one image to upload.');
            }
            
            // Upload images
            $result = $this->imageService->uploadProductImages($productId, $files, [], $user['id']);
            
            // Return response
            return ResponseFormatter::success(
                $result,
                'Product images uploaded successfully'
            );
        } catch (ValidationException $e) {
            throw $e;
        } catch (Exception $e) {
            throw new Exception('Failed to upload product images: ' . $e->getMessage());
        }
    }
}
