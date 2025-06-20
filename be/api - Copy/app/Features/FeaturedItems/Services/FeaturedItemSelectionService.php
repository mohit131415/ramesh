<?php

namespace App\Features\FeaturedItems\Services;

use App\Features\FeaturedItems\DataAccess\FeaturedItemSelectionRepository;
use App\Core\Security\Authorization;

class FeaturedItemSelectionService
{
    private $repository;
    private $authorization;

    public function __construct()
    {
        $this->repository = new FeaturedItemSelectionRepository();
        $this->authorization = Authorization::getInstance();
    }

    /**
     * Get all products for featured item selection
     *
     * @param string $search Search term
     * @param string $displayType Display type (featured_product or quick_pick)
     * @return array Products with selection status
     */
    public function getAllProductsForSelection($search = '', $displayType = 'featured_product')
    {
        // Verify admin permissions
        $this->verifyAdminPermissions();
        
        // Validate display type
        $validDisplayTypes = ['featured_product', 'quick_pick'];
        if (!in_array($displayType, $validDisplayTypes)) {
            throw new \InvalidArgumentException('Invalid display type. Must be one of: ' . implode(', ', $validDisplayTypes));
        }
        
        // Sanitize search term
        $search = trim($search);
        
        error_log("FeaturedItemSelectionService: Getting products for display_type: " . $displayType . ", search: '" . $search . "'");
        
        $result = $this->repository->getAllProductsForSelection($search, $displayType);
        
        // Add metadata about the request
        $result['request_info'] = [
            'display_type' => $displayType,
            'search_term' => $search,
            'search_applied' => !empty($search),
            'timestamp' => date('Y-m-d H:i:s')
        ];
        
        return $result;
    }

    /**
     * Get all categories for featured item selection
     *
     * @param string $search Search term
     * @return array Categories with selection status
     */
    public function getAllCategoriesForSelection($search = '')
    {
        // Verify admin permissions
        $this->verifyAdminPermissions();
        
        // Sanitize search term
        $search = trim($search);
        
        error_log("FeaturedItemSelectionService: Getting categories with search: '" . $search . "'");
        
        $result = $this->repository->getAllCategoriesForSelection($search);
        
        // Add metadata about the request
        $result['request_info'] = [
            'search_term' => $search,
            'search_applied' => !empty($search),
            'timestamp' => date('Y-m-d H:i:s')
        ];
        
        return $result;
    }

    /**
     * Verify that the current user has admin permissions
     *
     * @throws \App\Shared\Exceptions\AuthorizationException If the user doesn't have admin permissions
     */
    private function verifyAdminPermissions()
    {
        if (!$this->authorization->hasRole('admin')) {
            throw new \App\Shared\Exceptions\AuthorizationException("You don't have permission to perform this action");
        }
    }
}
