<?php

namespace App\Features\Open\Subcategories\Actions;

use App\Core\Request;
use App\Core\Response;
use App\Features\Open\Subcategories\Services\PublicSubcategoryService;

class ListSubcategoriesByCategory
{
    private $subcategoryService;
    private $response;

    public function __construct()
    {
        $this->subcategoryService = new PublicSubcategoryService();
        $this->response = new Response();
    }

    /**
     * Handle the request to list subcategories by category
     * 
     * @param Request $request The HTTP request
     * @return Response The HTTP response
     */
    public function __invoke(Request $request): Response
    {
        try {
            // Get the category ID from the query parameters (not route parameters)
            $categoryId = (int)$request->getQuery('category_id');
            
            // Debug log
            error_log("Category ID from query: " . $categoryId);
            
            // Validate the category ID
            if (!$categoryId) {
                $this->response->badRequest('Category ID is required');
                return $this->response;
            }

            // Get subcategories for the category
            $subcategories = $this->subcategoryService->getSubcategoriesByCategory($categoryId);
            
            // Set the response and return
            $this->response->ok($subcategories, 'Subcategories retrieved successfully');
            return $this->response;
        } catch (\Exception $e) {
            // Log the error
            error_log('Error retrieving subcategories: ' . $e->getMessage());
            
            // Set error response and return
            $this->response->serverError('Failed to retrieve subcategories: ' . $e->getMessage());
            return $this->response;
        }
    }
}
