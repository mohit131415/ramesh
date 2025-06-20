<?php

namespace App\Features\FeaturedItems\Actions;

use App\Core\Request;
use App\Core\Response;
use App\Features\FeaturedItems\Services\FeaturedItemSelectionService;
use App\Core\Security\Authentication;
use App\Shared\Exceptions\AuthorizationException;
use App\Shared\Helpers\ResponseFormatter;

class GetAllCategoriesForSelection
{
    private $selectionService;
    private $authentication;

    public function __construct()
    {
        $this->selectionService = new FeaturedItemSelectionService();
        $this->authentication = Authentication::getInstance();
    }

    public function execute(Request $request, Response $response)
    {
        try {
            // Check if user is authenticated
            if (!$this->authentication->check()) {
                return ResponseFormatter::error('Unauthorized access');
            }
        
            $search = $request->getParam('search', '');
        
            // Get all categories for selection - no pagination
            $result = $this->selectionService->getAllCategoriesForSelection($search);
        
            return ResponseFormatter::success($result, 'Categories retrieved successfully for selection');
        
        } catch (AuthorizationException $e) {
            error_log("AuthorizationException: " . $e->getMessage());
            return ResponseFormatter::error($e->getMessage());
        } catch (\Exception $e) {
            error_log("Exception in GetAllCategoriesForSelection: " . $e->getMessage());
            return ResponseFormatter::error('Failed to retrieve categories: ' . $e->getMessage());
        }
    }
}
