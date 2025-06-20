<?php

namespace App\Features\Open\Products\Actions;

use App\Core\Request;
use App\Core\Response;
use App\Features\Open\Products\Services\PublicProductService;

class GetProductsByCategoryWithFilters
{
   private $productService;
   
   public function __construct()
   {
       $this->productService = new PublicProductService();
   }
   
   public function __invoke(Request $request, Response $response, array $args)
   {
       try {
           $categoryId = (int)$args['id'];
           $params = $request->getQuery();
           
           $result = $this->productService->getProductsByCategoryWithFilters($categoryId, $params);
           
           return $response->json([
               'status' => 'success',
               'message' => 'Products retrieved successfully',
               'data' => $result
           ]);
       } catch (\Exception $e) {
           return $response->json([
               'status' => 'error',
               'message' => 'Failed to retrieve products: ' . $e->getMessage()
           ], 500);
       }
   }
}
