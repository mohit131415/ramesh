<?php

namespace App\Features\Open\FeaturedItems\Services;

use App\Features\Open\FeaturedItems\DataAccess\PublicFeaturedItemRepository;
use Exception;

class PublicFeaturedItemService
{
    private $repository;

    public function __construct()
    {
        $this->repository = new PublicFeaturedItemRepository();
    }

    /**
     * Get featured products
     *
     * @param int $page Page number
     * @param int $limit Items per page
     * @return array Featured products
     */
    public function getFeaturedProducts(int $page = 1, int $limit = 10): array
    {
        try {
            return $this->repository->getFeaturedItemsByType('featured_product', $page, $limit);
        } catch (Exception $e) {
            error_log("Error in getFeaturedProducts: " . $e->getMessage());
            return [];
        }
    }

    /**
     * Get featured categories
     *
     * @param int $page Page number
     * @param int $limit Items per page
     * @return array Featured categories
     */
    public function getFeaturedCategories(int $page = 1, int $limit = 10): array
    {
        try {
            return $this->repository->getFeaturedItemsByType('featured_category', $page, $limit);
        } catch (Exception $e) {
            error_log("Error in getFeaturedCategories: " . $e->getMessage());
            return [];
        }
    }

    /**
     * Get quick picks
     *
     * @param int $page Page number
     * @param int $limit Items per page
     * @return array Quick picks
     */
    public function getQuickPicks(int $page = 1, int $limit = 10): array
    {
        try {
            return $this->repository->getFeaturedItemsByType('quick_pick', $page, $limit);
        } catch (Exception $e) {
            error_log("Error in getQuickPicks: " . $e->getMessage());
            return [];
        }
    }

    /**
     * Get all featured items grouped by type
     *
     * @param int $page Page number
     * @param int $limit Items per page
     * @return array All featured items
     */
    public function getAllFeaturedItems(int $page = 1, int $limit = 10): array
    {
        try {
            return [
                'featured_products' => $this->getFeaturedProducts($page, $limit),
                'featured_categories' => $this->getFeaturedCategories($page, $limit),
                'quick_picks' => $this->getQuickPicks($page, $limit)
            ];
        } catch (Exception $e) {
            error_log("Error in getAllFeaturedItems: " . $e->getMessage());
            return [
                'featured_products' => [],
                'featured_categories' => [],
                'quick_picks' => []
            ];
        }
    }
}
