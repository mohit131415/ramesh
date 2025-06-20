<?php

namespace App\Features\Open\Products\Actions;

use App\Core\Request;
use App\Core\Response;
use App\Features\Open\Products\Services\PublicProductService;
use App\Shared\Exceptions\NotFoundException;

class GetPublicProduct
{
   private $productService;
   
   public function __construct()
   {
       $this->productService = new PublicProductService();
   }
   
   public function __invoke(Request $request, Response $response, array $args)
   {
       try {
           $productId = (int)$args['id'];
           $product = $this->productService->getProduct($productId);
           
           if (!$product) {
               throw new NotFoundException('Product not found');
           }
           
           return $response->json([
               'status' => 'success',
               'message' => 'Product retrieved successfully',
               'data' => $product
           ]);
       } catch (NotFoundException $e) {
           return $response->json([
               'status' => 'error',
               'message' => $e->getMessage()
           ], 404);
       } catch (\Exception $e) {
           return $response->json([
               'status' => 'error',
               'message' => 'Failed to retrieve product: ' . $e->getMessage()
           ], 500);
       }
   }
}
