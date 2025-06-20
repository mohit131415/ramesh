<?php

namespace App\Features\Open\Products\DataAccess;

use App\Core\Database;
use PDO;

class PublicProductRepository
{
    private $db;
    
    public function __construct()
    {
        $this->db = Database::getInstance()->getConnection();
    }
    
    public function getProducts($page = 1, $limit = 12, $sortBy = 'created_at', $sortOrder = 'desc')
    {
        $offset = ($page - 1) * $limit;
        
        // Validate sort parameters to prevent SQL injection
        $allowedSortFields = ['created_at', 'name', 'price', 'display_order'];
        $sortBy = in_array($sortBy, $allowedSortFields) ? $sortBy : 'created_at';
        $sortOrder = strtolower($sortOrder) === 'asc' ? 'ASC' : 'DESC';
        
        $query = "
            SELECT p.*, 
               c.id as category_id, c.name as category_name, c.slug as category_slug, 
               c.description as category_description, c.image as category_image, 
               c.meta_title as category_meta_title, c.meta_description as category_meta_description, 
               c.meta_keywords as category_meta_keywords, c.status as category_status, 
               c.display_order as category_display_order,
               s.id as subcategory_id, s.name as subcategory_name, s.slug as subcategory_slug, 
               s.description as subcategory_description, s.image as subcategory_image, 
               s.meta_title as subcategory_meta_title, s.meta_description as subcategory_meta_description, 
               s.meta_keywords as subcategory_meta_keywords, s.status as subcategory_status, 
               s.display_order as subcategory_display_order
        FROM products p
        LEFT JOIN categories c ON p.category_id = c.id
        LEFT JOIN subcategories s ON p.subcategory_id = s.id
        WHERE p.status = 'active'
        ORDER BY p.{$sortBy} {$sortOrder}
        LIMIT :offset, :limit
    ";
    
    $stmt = $this->db->prepare($query);
    $stmt->bindParam(':offset', $offset, PDO::PARAM_INT);
    $stmt->bindParam(':limit', $limit, PDO::PARAM_INT);
    $stmt->execute();
    
    $products = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Enhance products with variants, images, tags, and structured category/subcategory data
    foreach ($products as &$product) {
        $product['variants'] = $this->getProductVariants($product['id']);
        $product['images'] = $this->getProductImages($product['id']);
        $product['tags'] = $this->getProductTags($product['id']);
        
        // Structure category data
        if (!empty($product['category_id'])) {
            $product['category'] = [
                'id' => $product['category_id'],
                'name' => $product['category_name'],
                'slug' => $product['category_slug'],
                'description' => $product['category_description'],
                'image' => $product['category_image'],
                'meta_title' => $product['category_meta_title'],
                'meta_description' => $product['category_meta_description'],
                'meta_keywords' => $product['category_meta_keywords'],
                'status' => $product['category_status'],
                'display_order' => $product['category_display_order']
            ];
            
            // Add image URL if exists
            if (!empty($product['category_image'])) {
                $product['category']['image_url'] = $this->getImageUrl($product['category_image']);
            }
        } else {
            $product['category'] = null;
        }
        
        // Structure subcategory data
        if (!empty($product['subcategory_id'])) {
            $product['subcategory'] = [
                'id' => $product['subcategory_id'],
                'name' => $product['subcategory_name'],
                'slug' => $product['subcategory_slug'],
                'description' => $product['subcategory_description'],
                'image' => $product['subcategory_image'],
                'meta_title' => $product['subcategory_meta_title'],
                'meta_description' => $product['subcategory_meta_description'],
                'meta_keywords' => $product['subcategory_meta_keywords'] ?? null,
                'status' => $product['subcategory_status'],
                'display_order' => $product['subcategory_display_order'],
                'category_id' => $product['category_id']
            ];
            
            // Add image URL if exists
            if (!empty($product['subcategory_image'])) {
                $product['subcategory']['image_url'] = $this->getImageUrl($product['subcategory_image']);
            }
        } else {
            $product['subcategory'] = null;
        }
        
        // Remove the individual category and subcategory fields from the product
        unset(
            $product['category_id'], $product['category_name'], $product['category_slug'], 
            $product['category_description'], $product['category_image'], $product['category_meta_title'], 
            $product['category_meta_description'], $product['category_meta_keywords'], 
            $product['category_status'], $product['category_display_order'],
            $product['subcategory_id'], $product['subcategory_name'], $product['subcategory_slug'], 
            $product['subcategory_description'], $product['subcategory_image'], $product['subcategory_meta_title'], 
            $product['subcategory_meta_description'], $product['subcategory_meta_keywords'], 
            $product['subcategory_status'], $product['subcategory_display_order']
        );
    }
    
    return $products;
}

/**
 * Get image URL
 *
 * @param string $imagePath Image path
 * @return string Image URL
 */
private function getImageUrl($imagePath)
{
    // Base URL from config
    $baseUrl = config('app.url');
    
    // If image path is already a URL, return as is
    if (filter_var($imagePath, FILTER_VALIDATE_URL)) {
        return $imagePath;
    }
    
    // Otherwise, construct URL from base URL and image path
    return rtrim($baseUrl, '/') . '/' . ltrim($imagePath, '/');
}

    
    public function countProducts()
    {
        $query = "
            SELECT COUNT(*) as total 
            FROM products 
            WHERE status = 'active'
        ";
        
        $stmt = $this->db->prepare($query);
        $stmt->execute();
        $result = $stmt->fetch(PDO::FETCH_ASSOC);
        
        return $result['total'] ?? 0;
    }
    
    public function getProduct($id)
    {
        $query = "
        SELECT p.*, 
               c.id as category_id, c.name as category_name, c.slug as category_slug, 
               c.description as category_description, c.image as category_image, 
               c.meta_title as category_meta_title, c.meta_description as category_meta_description, 
               c.meta_keywords as category_meta_keywords, c.status as category_status, 
               c.display_order as category_display_order,
               s.id as subcategory_id, s.name as subcategory_name, s.slug as subcategory_slug, 
               s.description as subcategory_description, s.image as subcategory_image, 
               s.meta_title as subcategory_meta_title, s.meta_description as subcategory_meta_description, 
               s.meta_keywords as subcategory_meta_keywords, s.status as subcategory_status, 
               s.display_order as subcategory_display_order
        FROM products p
        LEFT JOIN categories c ON p.category_id = c.id
        LEFT JOIN subcategories s ON p.subcategory_id = s.id
        WHERE p.id = :id AND p.status = 'active'
    ";
    
    $stmt = $this->db->prepare($query);
    $stmt->bindParam(':id', $id, PDO::PARAM_INT);
    $stmt->execute();
    
    $product = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$product) {
        return null;
    }
    
    // Add variants, images, and tags
    $product['variants'] = $this->getProductVariants($product['id']);
    $product['images'] = $this->getProductImages($product['id']);
    $product['tags'] = $this->getProductTags($product['id']);
    
    // Structure category data
    if (!empty($product['category_id'])) {
        $product['category'] = [
            'id' => $product['category_id'],
            'name' => $product['category_name'],
            'slug' => $product['category_slug'],
            'description' => $product['category_description'],
            'image' => $product['category_image'],
            'meta_title' => $product['category_meta_title'],
            'meta_description' => $product['category_meta_description'],
            'meta_keywords' => $product['category_meta_keywords'],
            'status' => $product['category_status'],
            'display_order' => $product['category_display_order']
        ];
        
        // Add image URL if exists
        if (!empty($product['category_image'])) {
            $product['category']['image_url'] = $this->getImageUrl($product['category_image']);
        }
    } else {
        $product['category'] = null;
    }
    
    // Structure subcategory data
    if (!empty($product['subcategory_id'])) {
        $product['subcategory'] = [
            'id' => $product['subcategory_id'],
            'name' => $product['subcategory_name'],
            'slug' => $product['subcategory_slug'],
            'description' => $product['subcategory_description'],
            'image' => $product['subcategory_image'],
            'meta_title' => $product['subcategory_meta_title'],
            'meta_description' => $product['subcategory_meta_description'],
            'meta_keywords' => $product['subcategory_meta_keywords'] ?? null,
            'status' => $product['subcategory_status'],
            'display_order' => $product['subcategory_display_order'],
            'category_id' => $product['category_id']
        ];
        
        // Add image URL if exists
        if (!empty($product['subcategory_image'])) {
            $product['subcategory']['image_url'] = $this->getImageUrl($product['subcategory_image']);
        }
    } else {
        $product['subcategory'] = null;
    }
    
    // Remove the individual category and subcategory fields from the product
    unset(
        $product['category_id'], $product['category_name'], $product['category_slug'], 
        $product['category_description'], $product['category_image'], $product['category_meta_title'], 
        $product['category_meta_description'], $product['category_meta_keywords'], 
        $product['category_status'], $product['category_display_order'],
        $product['subcategory_id'], $product['subcategory_name'], $product['subcategory_slug'], 
        $product['subcategory_description'], $product['subcategory_image'], $product['subcategory_meta_title'], 
        $product['subcategory_meta_description'], $product['subcategory_meta_keywords'], 
        $product['subcategory_status'], $product['subcategory_display_order']
    );
    
    return $product;
}
    
    /**
     * Get a product by its slug
     * 
     * @param string $slug Product slug
     * @return array|null Product or null if not found
     */
    public function getProductBySlug($slug)
    {
        $query = "
        SELECT p.*, 
               c.id as category_id, c.name as category_name, c.slug as category_slug, 
               c.description as category_description, c.image as category_image, 
               c.meta_title as category_meta_title, c.meta_description as category_meta_description, 
               c.meta_keywords as category_meta_keywords, c.status as category_status, 
               c.display_order as category_display_order,
               s.id as subcategory_id, s.name as subcategory_name, s.slug as subcategory_slug, 
               s.description as subcategory_description, s.image as subcategory_image, 
               s.meta_title as subcategory_meta_title, s.meta_description as subcategory_meta_description, 
               s.meta_keywords as subcategory_meta_keywords, s.status as subcategory_status, 
               s.display_order as subcategory_display_order
        FROM products p
        LEFT JOIN categories c ON p.category_id = c.id
        LEFT JOIN subcategories s ON p.subcategory_id = s.id
        WHERE p.slug = :slug AND p.status = 'active'
    ";
    
    try {
        $stmt = $this->db->prepare($query);
        $stmt->bindParam(':slug', $slug, PDO::PARAM_STR);
        $stmt->execute();
        
        $product = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if (!$product) {
            return null;
        }
        
        // Add variants, images, and tags
        $product['variants'] = $this->getProductVariants($product['id']);
        $product['images'] = $this->getProductImages($product['id']);
        $product['tags'] = $this->getProductTags($product['id']);
        
        // Structure category data
        if (!empty($product['category_id'])) {
            $product['category'] = [
                'id' => $product['category_id'],
                'name' => $product['category_name'],
                'slug' => $product['category_slug'],
                'description' => $product['category_description'],
                'image' => $product['category_image'],
                'meta_title' => $product['category_meta_title'],
                'meta_description' => $product['category_meta_description'],
                'meta_keywords' => $product['category_meta_keywords'],
                'status' => $product['category_status'],
                'display_order' => $product['category_display_order']
            ];
            
            // Add image URL if exists
            if (!empty($product['category_image'])) {
                $product['category']['image_url'] = $this->getImageUrl($product['category_image']);
            }
        } else {
            $product['category'] = null;
        }
        
        // Structure subcategory data
        if (!empty($product['subcategory_id'])) {
            $product['subcategory'] = [
                'id' => $product['subcategory_id'],
                'name' => $product['subcategory_name'],
                'slug' => $product['subcategory_slug'],
                'description' => $product['subcategory_description'],
                'image' => $product['subcategory_image'],
                'meta_title' => $product['subcategory_meta_title'],
                'meta_description' => $product['subcategory_meta_description'],
                'meta_keywords' => $product['subcategory_meta_keywords'] ?? null,
                'status' => $product['subcategory_status'],
                'display_order' => $product['subcategory_display_order'],
                'category_id' => $product['category_id']
            ];
            
            // Add image URL if exists
            if (!empty($product['subcategory_image'])) {
                $product['subcategory']['image_url'] = $this->getImageUrl($product['subcategory_image']);
            }
        } else {
            $product['subcategory'] = null;
        }
        
        // Remove the individual category and subcategory fields from the product
        unset(
            $product['category_id'], $product['category_name'], $product['category_slug'], 
            $product['category_description'], $product['category_image'], $product['category_meta_title'], 
            $product['category_meta_description'], $product['category_meta_keywords'], 
            $product['category_status'], $product['category_display_order'],
            $product['subcategory_id'], $product['subcategory_name'], $product['subcategory_slug'], 
            $product['subcategory_description'], $product['subcategory_image'], $product['subcategory_meta_title'], 
            $product['subcategory_meta_description'], $product['subcategory_meta_keywords'], 
            $product['subcategory_status'], $product['subcategory_display_order']
        );
        
        return $product;
    } catch (\PDOException $e) {
        error_log("SQL Error in getProductBySlug: " . $e->getMessage());
        error_log("SQL Query: " . $query);
        throw $e;
    }
}
    
    public function getProductVariants($productId)
    {
        $query = "
            SELECT * 
            FROM product_variants 
            WHERE product_id = :product_id AND status = 'active'
            ORDER BY display_order ASC
        ";
        
        $stmt = $this->db->prepare($query);
        $stmt->bindParam(':product_id', $productId, PDO::PARAM_INT);
        $stmt->execute();
        
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
    
    public function getProductImages($productId)
    {
        $query = "
            SELECT * 
            FROM product_images 
            WHERE product_id = :product_id
            ORDER BY is_primary DESC, display_order ASC
        ";
        
        $stmt = $this->db->prepare($query);
        $stmt->bindParam(':product_id', $productId, PDO::PARAM_INT);
        $stmt->execute();
        
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
    
    public function getProductTags($productId)
    {
        $query = "
            SELECT t.* 
            FROM tags t
            JOIN product_tags pt ON t.id = pt.tag_id
            WHERE pt.product_id = :product_id
        ";
        
        $stmt = $this->db->prepare($query);
        $stmt->bindParam(':product_id', $productId, PDO::PARAM_INT);
        $stmt->execute();
        
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
    
    public function searchProducts($keyword, $page = 1, $limit = 12)
{
    $offset = ($page - 1) * $limit;
    $searchTerm = "%{$keyword}%";
    
    // Debug log
    error_log("Searching for: " . $keyword);
    error_log("Search term with wildcards: " . $searchTerm);
    error_log("Page: " . $page . ", Limit: " . $limit . ", Offset: " . $offset);
    
    // FIX: Use different parameter names for each occurrence of the search term
    $query = "
        SELECT DISTINCT p.*, 
               c.id as category_id, c.name as category_name, c.slug as category_slug, 
               c.description as category_description, c.image as category_image, 
               c.meta_title as category_meta_title, c.meta_description as category_meta_description, 
               c.meta_keywords as category_meta_keywords, c.status as category_status, 
               c.display_order as category_display_order,
               s.id as subcategory_id, s.name as subcategory_name, s.slug as subcategory_slug, 
               s.description as subcategory_description, s.image as subcategory_image, 
               s.meta_title as subcategory_meta_title, s.meta_description as subcategory_meta_description, 
               s.meta_keywords as subcategory_meta_keywords, s.status as subcategory_status, 
               s.display_order as subcategory_display_order
        FROM products p
        LEFT JOIN categories c ON p.category_id = c.id
        LEFT JOIN subcategories s ON p.subcategory_id = s.id
        LEFT JOIN product_variants pv ON p.id = pv.product_id
        LEFT JOIN product_tags pt ON p.id = pt.product_id
        LEFT JOIN tags t ON pt.tag_id = t.id
        WHERE p.status = 'active'
        AND (
            p.name LIKE :search_term1 OR 
            p.description LIKE :search_term2 OR 
            p.short_description LIKE :search_term3 OR 
            pv.sku LIKE :search_term4 OR 
            t.name LIKE :search_term5
        )
        ORDER BY p.created_at DESC
        LIMIT :offset, :limit
    ";
    
    try {
        $stmt = $this->db->prepare($query);
        
        // Bind each search term parameter separately
        $stmt->bindParam(':search_term1', $searchTerm, PDO::PARAM_STR);
        $stmt->bindParam(':search_term2', $searchTerm, PDO::PARAM_STR);
        $stmt->bindParam(':search_term3', $searchTerm, PDO::PARAM_STR);
        $stmt->bindParam(':search_term4', $searchTerm, PDO::PARAM_STR);
        $stmt->bindParam(':search_term5', $searchTerm, PDO::PARAM_STR);
        $stmt->bindParam(':offset', $offset, PDO::PARAM_INT);
        $stmt->bindParam(':limit', $limit, PDO::PARAM_INT);
        
        $stmt->execute();
        
        $products = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        // Debug log
        error_log("Found " . count($products) . " products");
        
        // Enhance products with variants, images, tags, and structured category/subcategory data
        foreach ($products as &$product) {
            $product['variants'] = $this->getProductVariants($product['id']);
            $product['images'] = $this->getProductImages($product['id']);
            $product['tags'] = $this->getProductTags($product['id']);
            
            // Structure category data
            if (!empty($product['category_id'])) {
                $product['category'] = [
                    'id' => $product['category_id'],
                    'name' => $product['category_name'],
                    'slug' => $product['category_slug'],
                    'description' => $product['category_description'],
                    'image' => $product['category_image'],
                    'meta_title' => $product['category_meta_title'],
                    'meta_description' => $product['category_meta_description'],
                    'meta_keywords' => $product['category_meta_keywords'],
                    'status' => $product['category_status'],
                    'display_order' => $product['category_display_order']
                ];
                
                // Add image URL if exists
                if (!empty($product['category_image'])) {
                    $product['category']['image_url'] = $this->getImageUrl($product['category_image']);
                }
            } else {
                $product['category'] = null;
            }
            
            // Structure subcategory data
            if (!empty($product['subcategory_id'])) {
                $product['subcategory'] = [
                    'id' => $product['subcategory_id'],
                    'name' => $product['subcategory_name'],
                    'slug' => $product['subcategory_slug'],
                    'description' => $product['subcategory_description'],
                    'image' => $product['subcategory_image'],
                    'meta_title' => $product['subcategory_meta_title'],
                    'meta_description' => $product['subcategory_meta_description'],
                    'meta_keywords' => $product['subcategory_meta_keywords'] ?? null,
                    'status' => $product['subcategory_status'],
                    'display_order' => $product['subcategory_display_order'],
                    'category_id' => $product['category_id']
                ];
                
                // Add image URL if exists
                if (!empty($product['subcategory_image'])) {
                    $product['subcategory']['image_url'] = $this->getImageUrl($product['subcategory_image']);
                }
            } else {
                $product['subcategory'] = null;
            }
            
            // Remove the individual category and subcategory fields from the product
            unset(
                $product['category_id'], $product['category_name'], $product['category_slug'], 
                $product['category_description'], $product['category_image'], $product['category_meta_title'], 
                $product['category_meta_description'], $product['category_meta_keywords'], 
                $product['category_status'], $product['category_display_order'],
                $product['subcategory_id'], $product['subcategory_name'], $product['subcategory_slug'], 
                $product['subcategory_description'], $product['subcategory_image'], $product['subcategory_meta_title'], 
                $product['subcategory_meta_description'], $product['subcategory_meta_keywords'], 
                $product['subcategory_status'], $product['subcategory_display_order']
            );
        }
        
        return $products;
    } catch (\PDOException $e) {
        error_log("SQL Error in searchProducts: " . $e->getMessage());
        error_log("SQL Query: " . $query);
        throw $e;
    }
}
    
    public function countSearchResults($keyword)
    {
        $searchTerm = "%{$keyword}%";
        
        // FIX: Use different parameter names for each occurrence of the search term
        $query = "
            SELECT COUNT(DISTINCT p.id) as total 
            FROM products p
            LEFT JOIN product_variants pv ON p.id = pv.product_id
            LEFT JOIN product_tags pt ON p.id = pt.product_id
            LEFT JOIN tags t ON pt.tag_id = t.id
            WHERE p.status = 'active'
            AND (
                p.name LIKE :search_term1 OR 
                p.description LIKE :search_term2 OR 
                p.short_description LIKE :search_term3 OR 
                pv.sku LIKE :search_term4 OR 
                t.name LIKE :search_term5
            )
        ";
        
        try {
            $stmt = $this->db->prepare($query);
            
            // Bind each search term parameter separately
            $stmt->bindParam(':search_term1', $searchTerm, PDO::PARAM_STR);
            $stmt->bindParam(':search_term2', $searchTerm, PDO::PARAM_STR);
            $stmt->bindParam(':search_term3', $searchTerm, PDO::PARAM_STR);
            $stmt->bindParam(':search_term4', $searchTerm, PDO::PARAM_STR);
            $stmt->bindParam(':search_term5', $searchTerm, PDO::PARAM_STR);
            
            $stmt->execute();
            
            $result = $stmt->fetch(PDO::FETCH_ASSOC);
            return $result['total'] ?? 0;
        } catch (\PDOException $e) {
            error_log("SQL Error in countSearchResults: " . $e->getMessage());
            error_log("SQL Query: " . $query);
            throw $e;
        }
    }
    
    public function getProductsByCategory($categoryId, $page = 1, $limit = 12)
    {
        $offset = ($page - 1) * $limit;
        
        $query = "
            SELECT p.* 
            FROM products p
            WHERE p.category_id = :category_id AND p.status = 'active'
            ORDER BY p.display_order ASC, p.created_at DESC
            LIMIT :offset, :limit
        ";
        
        $stmt = $this->db->prepare($query);
        $stmt->bindParam(':category_id', $categoryId, PDO::PARAM_INT);
        $stmt->bindParam(':offset', $offset, PDO::PARAM_INT);
        $stmt->bindParam(':limit', $limit, PDO::PARAM_INT);
        $stmt->execute();
        
        $products = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        // Enhance products with variants, images, and tags
        foreach ($products as &$product) {
            $product['variants'] = $this->getProductVariants($product['id']);
            $product['images'] = $this->getProductImages($product['id']);
            $product['tags'] = $this->getProductTags($product['id']);
        }
        
        return $products;
    }
    
    public function getProductsByPriceRange($minPrice, $maxPrice, $page = 1, $limit = 12)
    {
        $offset = ($page - 1) * $limit;
        
        $query = "
            SELECT DISTINCT p.* 
            FROM products p
            JOIN product_variants pv ON p.id = pv.product_id
            WHERE p.status = 'active'
            AND pv.sale_price >= :min_price AND pv.sale_price <= :max_price
            ORDER BY p.display_order ASC, p.created_at DESC
            LIMIT :offset, :limit
        ";
        
        $stmt = $this->db->prepare($query);
        $stmt->bindParam(':min_price', $minPrice, PDO::PARAM_STR);
        $stmt->bindParam(':max_price', $maxPrice, PDO::PARAM_STR);
        $stmt->bindParam(':offset', $offset, PDO::PARAM_INT);
        $stmt->bindParam(':limit', $limit, PDO::PARAM_INT);
        $stmt->execute();
        
        $products = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        // Enhance products with variants, images, and tags
        foreach ($products as &$product) {
            $product['variants'] = $this->getProductVariants($product['id']);
            $product['images'] = $this->getProductImages($product['id']);
            $product['tags'] = $this->getProductTags($product['id']);
        }
        
        return $products;
    }
    
    public function countProductsByPriceRange($minPrice, $maxPrice)
    {
        $query = "
            SELECT COUNT(DISTINCT p.id) as total 
            FROM products p
            JOIN product_variants pv ON p.id = pv.product_id
            WHERE p.status = 'active'
            AND pv.sale_price >= :min_price AND pv.sale_price <= :max_price
        ";
        
        $stmt = $this->db->prepare($query);
        $stmt->bindParam(':min_price', $minPrice, PDO::PARAM_STR);
        $stmt->bindParam(':max_price', $maxPrice, PDO::PARAM_STR);
        $stmt->execute();
        
        $result = $stmt->fetch(PDO::FETCH_ASSOC);
        return $result['total'] ?? 0;
    }
    
    public function getProductsByCategoryWithFilters($categoryId, $page = 1, $limit = 12, $sortBy = 'created_at', $sortOrder = 'desc', $minPrice = null, $maxPrice = null, $isVegetarian = null)
{
    $offset = ($page - 1) * $limit;
    
    // Validate sort parameters to prevent SQL injection
    $allowedSortFields = ['created_at', 'name', 'price', 'display_order'];
    $sortBy = in_array($sortBy, $allowedSortFields) ? $sortBy : 'created_at';
    $sortOrder = strtolower($sortOrder) === 'asc' ? 'ASC' : 'DESC';
    
    // Build the query with filters
    $query = "
        SELECT DISTINCT p.*, 
               c.id as category_id, c.name as category_name, c.slug as category_slug, 
               c.description as category_description, c.image as category_image, 
               c.meta_title as category_meta_title, c.meta_description as category_meta_description, 
               c.meta_keywords as category_meta_keywords, c.status as category_status, 
               c.display_order as category_display_order,
               s.id as subcategory_id, s.name as subcategory_name, s.slug as subcategory_slug, 
               s.description as subcategory_description, s.image as subcategory_image, 
               s.meta_title as subcategory_meta_title, s.meta_description as subcategory_meta_description, 
               s.meta_keywords as subcategory_meta_keywords, s.status as subcategory_status, 
               s.display_order as subcategory_display_order
        FROM products p
        LEFT JOIN categories c ON p.category_id = c.id
        LEFT JOIN subcategories s ON p.subcategory_id = s.id
        LEFT JOIN product_variants pv ON p.id = pv.product_id
        WHERE p.category_id = :category_id AND p.status = 'active'
    ";
    
    $params = [':category_id' => $categoryId];
    
    if ($minPrice !== null && $maxPrice !== null) {
        $query .= " AND pv.sale_price >= :min_price AND pv.sale_price <= :max_price";
        $params[':min_price'] = $minPrice;
        $params[':max_price'] = $maxPrice;
    }
    
    if ($isVegetarian !== null) {
        $query .= " AND p.is_vegetarian = :is_vegetarian";
        $params[':is_vegetarian'] = $isVegetarian;
    }
    
    $query .= " ORDER BY p.{$sortBy} {$sortOrder} LIMIT :offset, :limit";
    $params[':offset'] = $offset;
    $params[':limit'] = $limit;
    
    $stmt = $this->db->prepare($query);
    
    foreach ($params as $key => $value) {
        if (in_array($key, [':offset', ':limit'])) {
            $stmt->bindValue($key, $value, PDO::PARAM_INT);
        } else {
            $stmt->bindValue($key, $value);
        }
    }
    
    $stmt->execute();
    $products = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Enhance products with variants, images, tags, and structured category/subcategory data
    foreach ($products as &$product) {
        $product['variants'] = $this->getProductVariants($product['id']);
        $product['images'] = $this->getProductImages($product['id']);
        $product['tags'] = $this->getProductTags($product['id']);
        
        // Structure category data
        if (!empty($product['category_id'])) {
            $product['category'] = [
                'id' => $product['category_id'],
                'name' => $product['category_name'],
                'slug' => $product['category_slug'],
                'description' => $product['category_description'],
                'image' => $product['category_image'],
                'meta_title' => $product['category_meta_title'],
                'meta_description' => $product['category_meta_description'],
                'meta_keywords' => $product['category_meta_keywords'],
                'status' => $product['category_status'],
                'display_order' => $product['category_display_order']
            ];
            
            // Add image URL if exists
            if (!empty($product['category_image'])) {
                $product['category']['image_url'] = $this->getImageUrl($product['category_image']);
            }
        } else {
            $product['category'] = null;
        }
        
        // Structure subcategory data
        if (!empty($product['subcategory_id'])) {
            $product['subcategory'] = [
                'id' => $product['subcategory_id'],
                'name' => $product['subcategory_name'],
                'slug' => $product['subcategory_slug'],
                'description' => $product['subcategory_description'],
                'image' => $product['subcategory_image'],
                'meta_title' => $product['subcategory_meta_title'],
                'meta_description' => $product['subcategory_meta_description'],
                'meta_keywords' => $product['subcategory_meta_keywords'] ?? null,
                'status' => $product['subcategory_status'],
                'display_order' => $product['subcategory_display_order'],
                'category_id' => $product['category_id']
            ];
            
            // Add image URL if exists
            if (!empty($product['subcategory_image'])) {
                $product['subcategory']['image_url'] = $this->getImageUrl($product['subcategory_image']);
            }
        } else {
            $product['subcategory'] = null;
        }
        
        // Remove the individual category and subcategory fields from the product
        unset(
            $product['category_id'], $product['category_name'], $product['category_slug'], 
            $product['category_description'], $product['category_image'], $product['category_meta_title'], 
            $product['category_meta_description'], $product['category_meta_keywords'], 
            $product['category_status'], $product['category_display_order'],
            $product['subcategory_id'], $product['subcategory_name'], $product['subcategory_slug'], 
            $product['subcategory_description'], $product['subcategory_image'], $product['subcategory_meta_title'], 
            $product['subcategory_meta_description'], $product['subcategory_meta_keywords'], 
            $product['subcategory_status'], $product['subcategory_display_order']
        );
    }
    
    return $products;
}
    
    public function countProductsByCategoryWithFilters($categoryId, $minPrice = null, $maxPrice = null, $isVegetarian = null)
    {
        // Build the query with filters
        $query = "
            SELECT COUNT(DISTINCT p.id) as total 
            FROM products p
            LEFT JOIN product_variants pv ON p.id = pv.product_id
            WHERE p.category_id = :category_id AND p.status = 'active'
        ";
        
        $params = [':category_id' => $categoryId];
        
        if ($minPrice !== null && $maxPrice !== null) {
            $query .= " AND pv.sale_price >= :min_price AND pv.sale_price <= :max_price";
            $params[':min_price'] = $minPrice;
            $params[':max_price'] = $maxPrice;
        }
        
        if ($isVegetarian !== null) {
            $query .= " AND p.is_vegetarian = :is_vegetarian";
            $params[':is_vegetarian'] = $isVegetarian;
        }
        
        $stmt = $this->db->prepare($query);
        
        foreach ($params as $key => $value) {
            $stmt->bindValue($key, $value);
        }
        
        $stmt->execute();
        $result = $stmt->fetch(PDO::FETCH_ASSOC);
        
        return $result['total'] ?? 0;
    }
    
    /**
     * Get products by subcategory with filters
     * 
     * @param int $subcategoryId Subcategory ID
     * @param int $page Page number
     * @param int $limit Items per page
     * @param string $sortBy Field to sort by
     * @param string $sortOrder Sort order (asc/desc)
     * @param float|null $minPrice Minimum price
     * @param float|null $maxPrice Maximum price
     * @param int|null $isVegetarian Vegetarian filter
     * @return array Products matching the criteria
     */
    public function getProductsBySubcategoryWithFilters(
        int $subcategoryId, 
        int $page = 1, 
        int $limit = 12, 
        string $sortBy = 'created_at', 
        string $sortOrder = 'desc', 
        ?float $minPrice = null, 
        ?float $maxPrice = null, 
        ?int $isVegetarian = null
    ): array {
        $offset = ($page - 1) * $limit;
        
        // Validate sort parameters to prevent SQL injection
        $allowedSortFields = ['created_at', 'name', 'price', 'display_order'];
        $sortBy = in_array($sortBy, $allowedSortFields) ? $sortBy : 'created_at';
        $sortOrder = strtolower($sortOrder) === 'asc' ? 'ASC' : 'DESC';
        
        // Build the query with filters
        $query = "
            SELECT DISTINCT p.*, 
                   c.id as category_id, c.name as category_name, c.slug as category_slug, 
                   c.description as category_description, c.image as category_image, 
                   c.meta_title as category_meta_title, c.meta_description as category_meta_description, 
                   c.meta_keywords as category_meta_keywords, c.status as category_status, 
                   c.display_order as category_display_order,
                   s.id as subcategory_id, s.name as subcategory_name, s.slug as subcategory_slug, 
                   s.description as subcategory_description, s.image as subcategory_image, 
                   s.meta_title as subcategory_meta_title, s.meta_description as subcategory_meta_description, 
                   s.meta_keywords as subcategory_meta_keywords, s.status as subcategory_status, 
                   s.display_order as subcategory_display_order
            FROM products p
            LEFT JOIN categories c ON p.category_id = c.id
            LEFT JOIN subcategories s ON p.subcategory_id = s.id
            LEFT JOIN product_variants pv ON p.id = pv.product_id
            WHERE p.subcategory_id = :subcategory_id AND p.status = 'active'
        ";
        
        $params = [':subcategory_id' => $subcategoryId];
        
        if ($minPrice !== null && $maxPrice !== null) {
            $query .= " AND pv.sale_price >= :min_price AND pv.sale_price <= :max_price";
            $params[':min_price'] = $minPrice;
            $params[':max_price'] = $maxPrice;
        }
        
        if ($isVegetarian !== null) {
            $query .= " AND p.is_vegetarian = :is_vegetarian";
            $params[':is_vegetarian'] = $isVegetarian;
        }
        
        $query .= " GROUP BY p.id ORDER BY p.{$sortBy} {$sortOrder} LIMIT :offset, :limit";
        $params[':offset'] = $offset;
        $params[':limit'] = $limit;
        
        try {
            $stmt = $this->db->prepare($query);
            
            foreach ($params as $key => $value) {
                if (in_array($key, [':offset', ':limit'])) {
                    $stmt->bindValue($key, $value, PDO::PARAM_INT);
                } else {
                    $stmt->bindValue($key, $value);
                }
            }
            
            $stmt->execute();
            $products = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            // Enhance products with variants, images, tags, and structured category/subcategory data
            foreach ($products as &$product) {
                $product['variants'] = $this->getProductVariants($product['id']);
                $product['images'] = $this->getProductImages($product['id']);
                $product['tags'] = $this->getProductTags($product['id']);
                
                // Structure category data
                if (!empty($product['category_id'])) {
                    $product['category'] = [
                        'id' => $product['category_id'],
                        'name' => $product['category_name'],
                        'slug' => $product['category_slug'],
                        'description' => $product['category_description'],
                        'image' => $product['category_image'],
                        'meta_title' => $product['category_meta_title'],
                        'meta_description' => $product['category_meta_description'],
                        'meta_keywords' => $product['category_meta_keywords'],
                        'status' => $product['category_status'],
                        'display_order' => $product['category_display_order']
                    ];
                    
                    // Add image URL if exists
                    if (!empty($product['category_image'])) {
                        $product['category']['image_url'] = $this->getImageUrl($product['category_image']);
                    }
                } else {
                    $product['category'] = null;
                }
                
                // Structure subcategory data
                if (!empty($product['subcategory_id'])) {
                    $product['subcategory'] = [
                        'id' => $product['subcategory_id'],
                        'name' => $product['subcategory_name'],
                        'slug' => $product['subcategory_slug'],
                        'description' => $product['subcategory_description'],
                        'image' => $product['subcategory_image'],
                        'meta_title' => $product['subcategory_meta_title'],
                        'meta_description' => $product['subcategory_meta_description'],
                        'meta_keywords' => $product['subcategory_meta_keywords'] ?? null,
                        'status' => $product['subcategory_status'],
                        'display_order' => $product['subcategory_display_order'],
                        'category_id' => $product['category_id']
                    ];
                    
                    // Add image URL if exists
                    if (!empty($product['subcategory_image'])) {
                        $product['subcategory']['image_url'] = $this->getImageUrl($product['subcategory_image']);
                    }
                } else {
                    $product['subcategory'] = null;
                }
                
                // Remove the individual category and subcategory fields from the product
                unset(
                    $product['category_id'], $product['category_name'], $product['category_slug'], 
                    $product['category_description'], $product['category_image'], $product['category_meta_title'], 
                    $product['category_meta_description'], $product['category_meta_keywords'], 
                    $product['category_status'], $product['category_display_order'],
                    $product['subcategory_id'], $product['subcategory_name'], $product['subcategory_slug'], 
                    $product['subcategory_description'], $product['subcategory_image'], $product['subcategory_meta_title'], 
                    $product['subcategory_meta_description'], $product['subcategory_meta_keywords'], 
                    $product['subcategory_status'], $product['subcategory_display_order']
                );
            }
            
            return $products;
        } catch (\PDOException $e) {
            error_log("SQL Error in getProductsBySubcategoryWithFilters: " . $e->getMessage());
            error_log("SQL Query: " . $query);
            throw $e;
        }
    }
    
    /**
     * Count products by subcategory with filters
     * 
     * @param int $subcategoryId Subcategory ID
     * @param float|null $minPrice Minimum price
     * @param float|null $maxPrice Maximum price
     * @param int|null $isVegetarian Vegetarian filter
     * @return int Number of products matching the criteria
     */
    public function countProductsBySubcategoryWithFilters(
        int $subcategoryId, 
        ?float $minPrice = null, 
        ?float $maxPrice = null, 
        ?int $isVegetarian = null
    ): int {
        // Build the query with filters
        $query = "
            SELECT COUNT(DISTINCT p.id) as total 
            FROM products p
            LEFT JOIN product_variants pv ON p.id = pv.product_id
            WHERE p.subcategory_id = :subcategory_id AND p.status = 'active'
        ";
        
        $params = [':subcategory_id' => $subcategoryId];
        
        if ($minPrice !== null && $maxPrice !== null) {
            $query .= " AND pv.sale_price >= :min_price AND pv.sale_price <= :max_price";
            $params[':min_price'] = $minPrice;
            $params[':max_price'] = $maxPrice;
        }
        
        if ($isVegetarian !== null) {
            $query .= " AND p.is_vegetarian = :is_vegetarian";
            $params[':is_vegetarian'] = $isVegetarian;
        }
        
        try {
            $stmt = $this->db->prepare($query);
            
            foreach ($params as $key => $value) {
                $stmt->bindValue($key, $value);
            }
            
            $stmt->execute();
            $result = $stmt->fetch(PDO::FETCH_ASSOC);
            
            return (int)($result['total'] ?? 0);
        } catch (\PDOException $e) {
            error_log("SQL Error in countProductsBySubcategoryWithFilters: " . $e->getMessage());
            error_log("SQL Query: " . $query);
            throw $e;
        }
    }
    
    /**
     * Get related products for a given product
     * 
     * @param int $productId Product ID
     * @param int $limit Maximum number of related products to return
     * @return array Related products
     */
    public function getRelatedProducts(int $productId, int $limit = 4): array
    {
        try {
            // First, get the product to find its category and subcategory
            $query = "
                SELECT category_id, subcategory_id 
                FROM products 
                WHERE id = :product_id AND status = 'active'
            ";
            
            $stmt = $this->db->prepare($query);
            $stmt->bindParam(':product_id', $productId, PDO::PARAM_INT);
            $stmt->execute();
            
            $product = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if (!$product) {
                return [];
            }
            
            $categoryId = $product['category_id'];
            $subcategoryId = $product['subcategory_id'];
            
            $relatedProducts = [];
            
            // Step 1: Try to find products from the same subcategory (if exists)
            if ($subcategoryId) {
                $query = "
                    SELECT p.* 
                    FROM products p
                    WHERE p.subcategory_id = :subcategory_id 
                    AND p.id != :product_id 
                    AND p.status = 'active'
                    ORDER BY RAND()
                    LIMIT :limit
                ";
                
                $stmt = $this->db->prepare($query);
                $stmt->bindParam(':subcategory_id', $subcategoryId, PDO::PARAM_INT);
                $stmt->bindParam(':product_id', $productId, PDO::PARAM_INT);
                $stmt->bindParam(':limit', $limit, PDO::PARAM_INT);
                $stmt->execute();
                
                $relatedProducts = $stmt->fetchAll(PDO::FETCH_ASSOC);
            }
            
            // Step 2: If we don't have enough products, add products from the same category
            $remainingLimit = $limit - count($relatedProducts);
            
            if ($remainingLimit > 0 && $categoryId) {
                $excludeIds = [$productId];
                
                // Add already found related product IDs to exclude list
                foreach ($relatedProducts as $relatedProduct) {
                    $excludeIds[] = $relatedProduct['id'];
                }
                
                $placeholders = implode(',', array_fill(0, count($excludeIds), '?'));
                
                $query = "
                    SELECT p.* 
                    FROM products p
                    WHERE p.category_id = ? 
                    AND p.id NOT IN ({$placeholders}) 
                    AND p.status = 'active'
                    ORDER BY RAND()
                    LIMIT ?
                ";
                
                $stmt = $this->db->prepare($query);
                
                // Bind parameters
                $paramIndex = 1;
                $stmt->bindParam($paramIndex++, $categoryId, PDO::PARAM_INT);
                
                foreach ($excludeIds as $excludeId) {
                    $stmt->bindParam($paramIndex++, $excludeId, PDO::PARAM_INT);
                }
                
                $stmt->bindParam($paramIndex, $remainingLimit, PDO::PARAM_INT);
                $stmt->execute();
                
                $categoryRelatedProducts = $stmt->fetchAll(PDO::FETCH_ASSOC);
                $relatedProducts = array_merge($relatedProducts, $categoryRelatedProducts);
            }
            
            // Step 3: If we still don't have enough products, add popular products
            $remainingLimit = $limit - count($relatedProducts);
            
            if ($remainingLimit > 0) {
                $excludeIds = [$productId];
                
                // Add already found related product IDs to exclude list
                foreach ($relatedProducts as $relatedProduct) {
                    $excludeIds[] = $relatedProduct['id'];
                }
                
                $placeholders = implode(',', array_fill(0, count($excludeIds), '?'));
                
                $query = "
                    SELECT p.* 
                    FROM products p
                    WHERE p.id NOT IN ({$placeholders}) 
                    AND p.status = 'active'
                    ORDER BY p.display_order ASC, RAND()
                    LIMIT ?
                ";
                
                $stmt = $this->db->prepare($query);
                
                // Bind parameters
                $paramIndex = 1;
                foreach ($excludeIds as $excludeId) {
                    $stmt->bindParam($paramIndex++, $excludeId, PDO::PARAM_INT);
                }
                
                $stmt->bindParam($paramIndex, $remainingLimit, PDO::PARAM_INT);
                $stmt->execute();
                
                $popularProducts = $stmt->fetchAll(PDO::FETCH_ASSOC);
                $relatedProducts = array_merge($relatedProducts, $popularProducts);
            }
            
            // Enhance products with variants, images, tags, and structured category/subcategory data
            foreach ($relatedProducts as &$product) {
                $product['variants'] = $this->getProductVariants($product['id']);
                $product['images'] = $this->getProductImages($product['id']);
                $product['tags'] = $this->getProductTags($product['id']);
                
                // Get category data
                if (!empty($product['category_id'])) {
                    $categoryQuery = "
                        SELECT * FROM categories WHERE id = :category_id
                    ";
                    $categoryStmt = $this->db->prepare($categoryQuery);
                    $categoryStmt->bindParam(':category_id', $product['category_id'], PDO::PARAM_INT);
                    $categoryStmt->execute();
                    $category = $categoryStmt->fetch(PDO::FETCH_ASSOC);
                    
                    if ($category) {
                        $product['category'] = $category;
                        
                        // Add image URL if exists
                        if (!empty($category['image'])) {
                            $product['category']['image_url'] = $this->getImageUrl($category['image']);
                        }
                    } else {
                        $product['category'] = null;
                    }
                } else {
                    $product['category'] = null;
                }
                
                // Get subcategory data
                if (!empty($product['subcategory_id'])) {
                    $subcategoryQuery = "
                        SELECT * FROM subcategories WHERE id = :subcategory_id
                    ";
                    $subcategoryStmt = $this->db->prepare($subcategoryQuery);
                    $subcategoryStmt->bindParam(':subcategory_id', $product['subcategory_id'], PDO::PARAM_INT);
                    $subcategoryStmt->execute();
                    $subcategory = $subcategoryStmt->fetch(PDO::FETCH_ASSOC);
                    
                    if ($subcategory) {
                        $product['subcategory'] = $subcategory;
                        
                        // Add image URL if exists
                        if (!empty($subcategory['image'])) {
                            $product['subcategory']['image_url'] = $this->getImageUrl($subcategory['image']);
                        }
                    } else {
                        $product['subcategory'] = null;
                    }
                } else {
                    $product['subcategory'] = null;
                }
            }
            
            return $relatedProducts;
            
        } catch (\PDOException $e) {
            error_log("SQL Error in getRelatedProducts: " . $e->getMessage());
            throw $e;
        }
    }
}
