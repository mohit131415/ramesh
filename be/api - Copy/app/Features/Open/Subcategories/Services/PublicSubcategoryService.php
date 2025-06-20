<?php

namespace App\Features\Open\Subcategories\Services;

use App\Features\Open\Subcategories\DataAccess\PublicSubcategoryRepository;

class PublicSubcategoryService
{
    private $subcategoryRepository;

    public function __construct()
    {
        $this->subcategoryRepository = new PublicSubcategoryRepository();
    }

    /**
     * Get all subcategories for a specific category that have at least one product
     * 
     * @param int $categoryId The ID of the category
     * @return array Array of subcategories with product counts
     */
    public function getSubcategoriesByCategory(int $categoryId): array
    {
        return $this->subcategoryRepository->getSubcategoriesByCategory($categoryId);
    }
}
