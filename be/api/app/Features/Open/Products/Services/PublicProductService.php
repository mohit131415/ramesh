<?php

namespace App\Features\Open\Products\Services;

use App\Features\Open\Products\DataAccess\PublicProductRepository;

class PublicProductService
{
    private $productRepository;
    
    public function __construct()
    {
        $this->productRepository = new PublicProductRepository();
    }
    
    /**
     * Get a list of products with pagination and filtering
     * 
     * @param array $params Request parameters
     * @return array Products with pagination info
     */
    public function getProducts(array $params): array
    {
        $page = isset($params['page']) && is_numeric($params['page']) ? (int)$params['page'] : 1;
        $limit = isset($params['limit']) && is_numeric($params['limit']) ? (int)$params['limit'] : 12;
        
        // Limit the maximum number of items per page
        $limit = min($limit, 50);
        
        // Extract filters
        $filters = [];
        
        if (!empty($params['category_id']) && is_numeric($params['category_id'])) {
            $filters['category_id'] = (int)$params['category_id'];
        }
        
        if (!empty($params['subcategory_id']) && is_numeric($params['subcategory_id'])) {
            $filters['subcategory_id'] = (int)$params['subcategory_id'];
        }
        
        if (!empty($params['min_price']) && is_numeric($params['min_price'])) {
            $filters['min_price'] = (float)$params['min_price'];
        }
        
        if (!empty($params['max_price']) && is_numeric($params['max_price'])) {
            $filters['max_price'] = (float)$params['max_price'];
        }
        
        if (!empty($params['is_vegetarian']) && in_array($params['is_vegetarian'], ['veg', 'non-veg', 'all'])) {
            $filters['is_vegetarian'] = $params['is_vegetarian'];
        }
        
        if (!empty($params['tags'])) {
            $filters['tags'] = $params['tags'];
        }
        
        if (!empty($params['sort']) && in_array($params['sort'], ['price_low', 'price_high', 'name_asc', 'name_desc', 'newest'])) {
            $filters['sort'] = $params['sort'];
        }
        
        $products = $this->productRepository->getProducts($page, $limit);
        $total = $this->productRepository->countProducts();
        
        return [
            'products' => $products,
            'total' => $total,
            'page' => $page,
            'limit' => $limit,
            'total_pages' => ceil($total / $limit)
        ];
    }
    
    /**
     * Get a single product with all its details
     * 
     * @param int $productId Product ID
     * @return array|null Product with all details or null if not found
     */
    public function getProduct(int $productId): ?array
    {
        $product = $this->productRepository->getProduct($productId);
        
        if (!$product) {
            return null;
        }
        
        // Get variants
        $product['variants'] = $this->productRepository->getProductVariants($product['id']);
        
        // Get images
        $product['images'] = $this->productRepository->getProductImages($product['id']);
        
        // Get tags
        $product['tags'] = $this->productRepository->getProductTags($product['id']);
        
        return $product;
    }
    
    /**
     * Get a single product by its slug
     * 
     * @param string $slug Product slug
     * @return array|null Product with all details or null if not found
     */
    public function getProductBySlug(string $slug): ?array
    {
        $product = $this->productRepository->getProductBySlug($slug);
        
        if (!$product) {
            return null;
        }
        
        // Get variants
        $product['variants'] = $this->productRepository->getProductVariants($product['id']);
        
        // Get images
        $product['images'] = $this->productRepository->getProductImages($product['id']);
        
        // Get tags
        $product['tags'] = $this->productRepository->getProductTags($product['id']);
        
        return $product;
    }
    
    /**
     * Search products by keyword
     * 
     * @param string $keyword Search keyword
     * @param int $page Current page number
     * @param int $limit Items per page
     * @return array Search results with pagination
     */
    public function searchProducts(string $keyword, int $page = 1, int $limit = 12): array
    {
        $products = $this->productRepository->searchProducts($keyword, $page, $limit);
        $total = $this->productRepository->countSearchResults($keyword);
        
        return [
            'products' => $products,
            'total' => $total,
            'page' => $page,
            'limit' => $limit,
            'total_pages' => ceil($total / $limit),
            'search_term' => $keyword
        ];
    }
    
    /**
     * Get products by price range
     * 
     * @param float $minPrice Minimum price
     * @param float $maxPrice Maximum price
     * @param int $page Current page number
     * @param int $limit Items per page
     * @return array Products within price range with pagination
     */
    public function getProductsByPriceRange(float $minPrice, float $maxPrice, int $page = 1, int $limit = 12): array
    {
        $products = $this->productRepository->getProductsByPriceRange($minPrice, $maxPrice, $page, $limit);
        $total = $this->productRepository->countProductsByPriceRange($minPrice, $maxPrice);
        
        return [
            'products' => $products,
            'total' => $total,
            'page' => $page,
            'limit' => $limit,
            'total_pages' => ceil($total / $limit),
            'price_range' => [
                'min' => $minPrice,
                'max' => $maxPrice
            ]
        ];
    }
    
    /**
     * Get products by category with filters
     * 
     * @param int $categoryId Category ID
     * @param array $params Request parameters
     * @return array Products in category with pagination
     */
    public function getProductsByCategoryWithFilters(int $categoryId, array $params): array
    {
        $page = isset($params['page']) && is_numeric($params['page']) ? (int)$params['page'] : 1;
        $limit = isset($params['limit']) && is_numeric($params['limit']) ? (int)$params['limit'] : 12;
        
        // Limit the maximum number of items per page
        $limit = min($limit, 50);
        
        $minPrice = isset($params['min_price']) && is_numeric($params['min_price']) ? (float)$params['min_price'] : null;
        $maxPrice = isset($params['max_price']) && is_numeric($params['max_price']) ? (float)$params['max_price'] : null;
        $isVegetarian = isset($params['is_vegetarian']) ? (int)$params['is_vegetarian'] : null;
        $sortBy = $params['sort_by'] ?? 'created_at';
        $sortOrder = $params['sort_order'] ?? 'desc';
        
        $products = $this->productRepository->getProductsByCategoryWithFilters(
            $categoryId, 
            $page, 
            $limit, 
            $sortBy, 
            $sortOrder, 
            $minPrice, 
            $maxPrice, 
            $isVegetarian
        );
        
        // Fix: Ensure countProductsByCategoryWithFilters returns an integer
        $total = $this->productRepository->countProductsByCategoryWithFilters(
            $categoryId, 
            $minPrice, 
            $maxPrice, 
            $isVegetarian
        ) ?? 0; // Add fallback to 0 if null is returned
        
        return [
            'products' => $products,
            'total' => $total,
            'page' => $page,
            'limit' => $limit,
            'total_pages' => ceil($total / $limit),
            'category_id' => $categoryId
        ];
    }
    
    /**
     * Get products by subcategory with filters
     * 
     * @param int $subcategoryId Subcategory ID
     * @param array $params Request parameters
     * @return array Products in subcategory with pagination
     */
    public function getProductsBySubcategory(int $subcategoryId, array $params): array
    {
        $page = isset($params['page']) && is_numeric($params['page']) ? (int)$params['page'] : 1;
        $limit = isset($params['limit']) && is_numeric($params['limit']) ? (int)$params['limit'] : 12;
        
        // Limit the maximum number of items per page
        $limit = min($limit, 50);
        
        $minPrice = isset($params['min_price']) && is_numeric($params['min_price']) ? (float)$params['min_price'] : null;
        $maxPrice = isset($params['max_price']) && is_numeric($params['max_price']) ? (float)$params['max_price'] : null;
        $isVegetarian = isset($params['is_vegetarian']) ? (int)$params['is_vegetarian'] : null;
        $sortBy = $params['sort_by'] ?? 'created_at';
        $sortOrder = $params['sort_order'] ?? 'desc';
        
        $products = $this->productRepository->getProductsBySubcategoryWithFilters(
            $subcategoryId, 
            $page, 
            $limit, 
            $sortBy, 
            $sortOrder, 
            $minPrice, 
            $maxPrice, 
            $isVegetarian
        );
        
        $total = $this->productRepository->countProductsBySubcategoryWithFilters(
            $subcategoryId, 
            $minPrice, 
            $maxPrice, 
            $isVegetarian
        ) ?? 0; // Add fallback to 0 if null is returned
        
        return [
            'products' => $products,
            'total' => $total,
            'page' => $page,
            'limit' => $limit,
            'total_pages' => ceil($total / $limit),
            'subcategory_id' => $subcategoryId
        ];
    }

    /**
     * Get related products for a specific product
     * 
     * @param int $productId Product ID
     * @param int $limit Maximum number of related products to return
     * @return array Related products
     */
    public function getRelatedProducts(int $productId, int $limit = 4): array
    {
        // First, get the product to find its category and subcategory
        $product = $this->getProduct($productId);
        
        if (!$product) {
            return [];
        }
        
        // Get related products using a smart algorithm
        $relatedProducts = $this->productRepository->getRelatedProducts(
            $productId,
            $limit
        );
        
        return [
            'products' => $relatedProducts,
            'total' => count($relatedProducts)
        ];
    }
}
