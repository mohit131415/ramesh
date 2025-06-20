<?php

namespace App\Features\Open\Categories\Services;

use App\Features\Open\Categories\DataAccess\PublicCategoryRepository;
use App\Shared\Exceptions\NotFoundException;
use Exception;

class PublicCategoryService
{
    private $categoryRepository;

    public function __construct()
    {
        $this->categoryRepository = new PublicCategoryRepository();
    }

    /**
     * Get all active categories with at least one product
     *
     * @param int $page Page number
     * @param int $limit Items per page
     * @param array $filters Optional filters
     * @return array Categories and pagination metadata
     */
    public function getAllCategories($page = 1, $limit = 10, $filters = [])
    {
        try {
            return $this->categoryRepository->getAllCategories($page, $limit, $filters);
        } catch (Exception $e) {
            throw new Exception('Failed to get categories: ' . $e->getMessage());
        }
    }
}
