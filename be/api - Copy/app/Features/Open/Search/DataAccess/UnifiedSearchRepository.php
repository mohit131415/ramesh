<?php

namespace App\Features\Open\Search\DataAccess;

use App\Core\Database;
use App\Shared\DataFetchers\ProductDataFetcher;
use PDO;
use Exception;

class UnifiedSearchRepository
{
    private $db;
    private $productDataFetcher;
    
    public function __construct()
    {
        $this->db = Database::getInstance()->getConnection();
        $this->productDataFetcher = new ProductDataFetcher();
    }
    
    /**
     * Search products that START with the query (highest priority)
     */
    public function searchProductsStartsWith(string $query, int $limit): array
    {
        try {
            error_log("UnifiedSearchRepository::searchProductsStartsWith - Query: '$query'");
            
            $startsWithPattern = $query . '%';
            
            $sql = "
                SELECT DISTINCT p.id
                FROM products p
                WHERE p.status = 'active' 
                    AND p.deleted_at IS NULL
                    AND LOWER(p.name) LIKE LOWER(:pattern)
                ORDER BY p.name ASC, p.display_order DESC
                LIMIT :limit
            ";
            
            $stmt = $this->db->prepare($sql);
            $stmt->bindParam(':pattern', $startsWithPattern, PDO::PARAM_STR);
            $stmt->bindParam(':limit', $limit, PDO::PARAM_INT);
            $stmt->execute();
            
            $productIds = $stmt->fetchAll(PDO::FETCH_COLUMN);
            
            if (empty($productIds)) {
                return [];
            }
            
            $products = $this->productDataFetcher->getProductsByIds($productIds);
            
            // Preserve order and add type
            $orderedProducts = [];
            foreach ($productIds as $id) {
                foreach ($products as $product) {
                    if ($product['id'] == $id) {
                        $product['type'] = 'product';
                        $orderedProducts[] = $product;
                        break;
                    }
                }
            }
            
            return $orderedProducts;
            
        } catch (Exception $e) {
            error_log("ERROR in searchProductsStartsWith: " . $e->getMessage());
            return [];
        }
    }
    
    /**
     * Search products that CONTAIN the query in name (excluding those that start with it)
     */
    public function searchProductsContains(string $query, int $limit): array
    {
        try {
            error_log("UnifiedSearchRepository::searchProductsContains - Query: '$query'");
            
            $containsPattern = '%' . $query . '%';
            $startsWithPattern = $query . '%';
            
            $sql = "
                SELECT DISTINCT p.id
                FROM products p
                WHERE p.status = 'active' 
                    AND p.deleted_at IS NULL
                    AND LOWER(p.name) LIKE LOWER(:contains_pattern)
                    AND LOWER(p.name) NOT LIKE LOWER(:starts_pattern)
                ORDER BY p.name ASC, p.display_order DESC
                LIMIT :limit
            ";
            
            $stmt = $this->db->prepare($sql);
            $stmt->bindParam(':contains_pattern', $containsPattern, PDO::PARAM_STR);
            $stmt->bindParam(':starts_pattern', $startsWithPattern, PDO::PARAM_STR);
            $stmt->bindParam(':limit', $limit, PDO::PARAM_INT);
            $stmt->execute();
            
            $productIds = $stmt->fetchAll(PDO::FETCH_COLUMN);
            
            if (empty($productIds)) {
                return [];
            }
            
            $products = $this->productDataFetcher->getProductsByIds($productIds);
            
            // Preserve order and add type
            $orderedProducts = [];
            foreach ($productIds as $id) {
                foreach ($products as $product) {
                    if ($product['id'] == $id) {
                        $product['type'] = 'product';
                        $orderedProducts[] = $product;
                        break;
                    }
                }
            }
            
            return $orderedProducts;
            
        } catch (Exception $e) {
            error_log("ERROR in searchProductsContains: " . $e->getMessage());
            return [];
        }
    }
    
    /**
     * Search products in other fields (description, tags, etc.)
     */
    public function searchProductsInFields(string $query, int $limit): array
    {
        try {
            error_log("UnifiedSearchRepository::searchProductsInFields - Query: '$query'");
            
            $searchPattern = '%' . $query . '%';
            
            $sql = "
                SELECT DISTINCT p.id
                FROM products p
                LEFT JOIN product_tags pt ON p.id = pt.product_id
                LEFT JOIN tags t ON pt.tag_id = t.id
                WHERE p.status = 'active' 
                    AND p.deleted_at IS NULL
                    AND LOWER(p.name) NOT LIKE LOWER(:search_pattern)
                    AND (
                        LOWER(p.description) LIKE LOWER(:search_pattern) OR
                        LOWER(p.short_description) LIKE LOWER(:search_pattern) OR
                        LOWER(p.meta_keywords) LIKE LOWER(:search_pattern) OR
                        LOWER(p.ingredients) LIKE LOWER(:search_pattern) OR
                        LOWER(t.name) LIKE LOWER(:search_pattern)
                    )
                ORDER BY p.name ASC, p.display_order DESC
                LIMIT :limit
            ";
            
            $stmt = $this->db->prepare($sql);
            $stmt->bindParam(':search_pattern', $searchPattern, PDO::PARAM_STR);
            $stmt->bindParam(':limit', $limit, PDO::PARAM_INT);
            $stmt->execute();
            
            $productIds = $stmt->fetchAll(PDO::FETCH_COLUMN);
            
            if (empty($productIds)) {
                return [];
            }
            
            $products = $this->productDataFetcher->getProductsByIds($productIds);
            
            // Preserve order and add type
            $orderedProducts = [];
            foreach ($productIds as $id) {
                foreach ($products as $product) {
                    if ($product['id'] == $id) {
                        $product['type'] = 'product';
                        $orderedProducts[] = $product;
                        break;
                    }
                }
            }
            
            return $orderedProducts;
            
        } catch (Exception $e) {
            error_log("ERROR in searchProductsInFields: " . $e->getMessage());
            return [];
        }
    }
    
    /**
     * FUZZY: Search products containing ALL characters (highest fuzzy priority)
     */
    public function searchProductsByAllCharacters(array $characters, int $limit): array
    {
        try {
            error_log("UnifiedSearchRepository::searchProductsByAllCharacters - Characters: " . implode(', ', $characters));
            
            if (empty($characters)) {
                return [];
            }
            
            // Build conditions for ALL characters
            $conditions = [];
            $params = [];
            
            foreach ($characters as $index => $char) {
                $conditions[] = "LOWER(p.name) LIKE :char{$index}";
                $params[":char{$index}"] = '%' . strtolower($char) . '%';
            }
            
            $sql = "
                SELECT DISTINCT p.id
                FROM products p
                WHERE p.status = 'active' 
                    AND p.deleted_at IS NULL
                    AND (" . implode(' AND ', $conditions) . ")
                ORDER BY p.display_order DESC, p.name ASC
                LIMIT :limit
            ";
            
            $stmt = $this->db->prepare($sql);
            foreach ($params as $param => $value) {
                $stmt->bindValue($param, $value, PDO::PARAM_STR);
            }
            $stmt->bindParam(':limit', $limit, PDO::PARAM_INT);
            $stmt->execute();
            
            $productIds = $stmt->fetchAll(PDO::FETCH_COLUMN);
            
            if (empty($productIds)) {
                return [];
            }
            
            $products = $this->productDataFetcher->getProductsByIds($productIds);
            
            // Preserve order and add type
            $orderedProducts = [];
            foreach ($productIds as $id) {
                foreach ($products as $product) {
                    if ($product['id'] == $id) {
                        $product['type'] = 'product';
                        $orderedProducts[] = $product;
                        break;
                    }
                }
            }
            
            return $orderedProducts;
            
        } catch (Exception $e) {
            error_log("ERROR in searchProductsByAllCharacters: " . $e->getMessage());
            return [];
        }
    }
    
    /**
     * FUZZY: Search products containing a single character
     */
    public function searchProductsByCharacter(string $character, int $limit): array
    {
        try {
            error_log("UnifiedSearchRepository::searchProductsByCharacter - Character: '$character'");
            
            $charPattern = '%' . strtolower($character) . '%';
            
            $sql = "
                SELECT DISTINCT p.id
                FROM products p
                WHERE p.status = 'active' 
                    AND p.deleted_at IS NULL
                    AND LOWER(p.name) LIKE :char_pattern
                ORDER BY p.display_order DESC, p.name ASC
                LIMIT :limit
            ";
            
            $stmt = $this->db->prepare($sql);
            $stmt->bindParam(':char_pattern', $charPattern, PDO::PARAM_STR);
            $stmt->bindParam(':limit', $limit, PDO::PARAM_INT);
            $stmt->execute();
            
            $productIds = $stmt->fetchAll(PDO::FETCH_COLUMN);
            
            if (empty($productIds)) {
                return [];
            }
            
            $products = $this->productDataFetcher->getProductsByIds($productIds);
            
            // Preserve order and add type
            $orderedProducts = [];
            foreach ($productIds as $id) {
                foreach ($products as $product) {
                    if ($product['id'] == $id) {
                        $product['type'] = 'product';
                        $orderedProducts[] = $product;
                        break;
                    }
                }
            }
            
            return $orderedProducts;
            
        } catch (Exception $e) {
            error_log("ERROR in searchProductsByCharacter: " . $e->getMessage());
            return [];
        }
    }
    
    /**
     * FUZZY: Search categories containing ALL characters
     */
    public function searchCategoriesByAllCharacters(array $characters, int $limit): array
    {
        try {
            if (empty($characters)) {
                return [];
            }
            
            // Build conditions for ALL characters
            $conditions = [];
            $params = [];
            
            foreach ($characters as $index => $char) {
                $conditions[] = "LOWER(c.name) LIKE :char{$index}";
                $params[":char{$index}"] = '%' . strtolower($char) . '%';
            }
            
            $sql = "
                SELECT DISTINCT
                    c.id, c.name, c.slug, c.description, c.image, 'category' as type,
                    COUNT(DISTINCT p.id) as product_count
                FROM categories c
                JOIN subcategories s ON c.id = s.category_id AND s.status = 'active' AND s.deleted_at IS NULL
                JOIN products p ON s.id = p.subcategory_id AND p.status = 'active' AND p.deleted_at IS NULL
                WHERE c.status = 'active' 
                    AND c.deleted_at IS NULL
                    AND (" . implode(' AND ', $conditions) . ")
                GROUP BY c.id, c.name, c.slug, c.description, c.image
                HAVING COUNT(DISTINCT p.id) > 0
                ORDER BY c.display_order DESC, product_count DESC, c.name ASC
                LIMIT :limit
            ";
            
            $stmt = $this->db->prepare($sql);
            foreach ($params as $param => $value) {
                $stmt->bindValue($param, $value, PDO::PARAM_STR);
            }
            $stmt->bindParam(':limit', $limit, PDO::PARAM_INT);
            $stmt->execute();
            
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
            
        } catch (Exception $e) {
            error_log("ERROR in searchCategoriesByAllCharacters: " . $e->getMessage());
            return [];
        }
    }
    
    /**
     * FUZZY: Search categories containing a single character
     */
    public function searchCategoriesByCharacter(string $character, int $limit): array
    {
        try {
            $charPattern = '%' . strtolower($character) . '%';
            
            $sql = "
                SELECT DISTINCT
                    c.id, c.name, c.slug, c.description, c.image, 'category' as type,
                    COUNT(DISTINCT p.id) as product_count
                FROM categories c
                JOIN subcategories s ON c.id = s.category_id AND s.status = 'active' AND s.deleted_at IS NULL
                JOIN products p ON s.id = p.subcategory_id AND p.status = 'active' AND p.deleted_at IS NULL
                WHERE c.status = 'active' 
                    AND c.deleted_at IS NULL
                    AND LOWER(c.name) LIKE :char_pattern
                GROUP BY c.id, c.name, c.slug, c.description, c.image
                HAVING COUNT(DISTINCT p.id) > 0
                ORDER BY c.display_order DESC, product_count DESC, c.name ASC
                LIMIT :limit
            ";
            
            $stmt = $this->db->prepare($sql);
            $stmt->bindParam(':char_pattern', $charPattern, PDO::PARAM_STR);
            $stmt->bindParam(':limit', $limit, PDO::PARAM_INT);
            $stmt->execute();
            
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
            
        } catch (Exception $e) {
            error_log("ERROR in searchCategoriesByCharacter: " . $e->getMessage());
            return [];
        }
    }
    
    /**
     * FUZZY: Search subcategories containing ALL characters
     */
    public function searchSubcategoriesByAllCharacters(array $characters, int $limit): array
    {
        try {
            if (empty($characters)) {
                return [];
            }
            
            // Build conditions for ALL characters
            $conditions = [];
            $params = [];
            
            foreach ($characters as $index => $char) {
                $conditions[] = "LOWER(s.name) LIKE :char{$index}";
                $params[":char{$index}"] = '%' . strtolower($char) . '%';
            }
            
            $sql = "
                SELECT DISTINCT
                    s.id, s.name, s.slug, s.description, s.image,
                    c.id as category_id, c.name as category_name, 'subcategory' as type,
                    COUNT(DISTINCT p.id) as product_count
                FROM subcategories s
                JOIN categories c ON s.category_id = c.id AND c.status = 'active' AND c.deleted_at IS NULL
                JOIN products p ON s.id = p.subcategory_id AND p.status = 'active' AND p.deleted_at IS NULL
                WHERE s.status = 'active' 
                    AND s.deleted_at IS NULL
                    AND (" . implode(' AND ', $conditions) . ")
                GROUP BY s.id, s.name, s.slug, s.description, s.image, c.id, c.name
                HAVING COUNT(DISTINCT p.id) > 0
                ORDER BY s.display_order DESC, product_count DESC, s.name ASC
                LIMIT :limit
            ";
            
            $stmt = $this->db->prepare($sql);
            foreach ($params as $param => $value) {
                $stmt->bindValue($param, $value, PDO::PARAM_STR);
            }
            $stmt->bindParam(':limit', $limit, PDO::PARAM_INT);
            $stmt->execute();
            
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
            
        } catch (Exception $e) {
            error_log("ERROR in searchSubcategoriesByAllCharacters: " . $e->getMessage());
            return [];
        }
    }
    
    /**
     * FUZZY: Search subcategories containing a single character
     */
    public function searchSubcategoriesByCharacter(string $character, int $limit): array
    {
        try {
            $charPattern = '%' . strtolower($character) . '%';
            
            $sql = "
                SELECT DISTINCT
                    s.id, s.name, s.slug, s.description, s.image,
                    c.id as category_id, c.name as category_name, 'subcategory' as type,
                    COUNT(DISTINCT p.id) as product_count
                FROM subcategories s
                JOIN categories c ON s.category_id = c.id AND c.status = 'active' AND c.deleted_at IS NULL
                JOIN products p ON s.id = p.subcategory_id AND p.status = 'active' AND p.deleted_at IS NULL
                WHERE s.status = 'active' 
                    AND s.deleted_at IS NULL
                    AND LOWER(s.name) LIKE :char_pattern
                GROUP BY s.id, s.name, s.slug, s.description, s.image, c.id, c.name
                HAVING COUNT(DISTINCT p.id) > 0
                ORDER BY s.display_order DESC, product_count DESC, s.name ASC
                LIMIT :limit
            ";
            
            $stmt = $this->db->prepare($sql);
            $stmt->bindParam(':char_pattern', $charPattern, PDO::PARAM_STR);
            $stmt->bindParam(':limit', $limit, PDO::PARAM_INT);
            $stmt->execute();
            
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
            
        } catch (Exception $e) {
            error_log("ERROR in searchSubcategoriesByCharacter: " . $e->getMessage());
            return [];
        }
    }
    
    /**
     * Search categories that START with the query
     */
    public function searchCategoriesStartsWith(string $query, int $limit): array
    {
        try {
            $startsWithPattern = $query . '%';
            
            $sql = "
                SELECT DISTINCT
                    c.id, c.name, c.slug, c.description, c.image, 'category' as type,
                    COUNT(DISTINCT p.id) as product_count
                FROM categories c
                JOIN subcategories s ON c.id = s.category_id AND s.status = 'active' AND s.deleted_at IS NULL
                JOIN products p ON s.id = p.subcategory_id AND p.status = 'active' AND p.deleted_at IS NULL
                WHERE c.status = 'active' 
                    AND c.deleted_at IS NULL
                    AND LOWER(c.name) LIKE LOWER(:pattern)
                GROUP BY c.id, c.name, c.slug, c.description, c.image
                HAVING COUNT(DISTINCT p.id) > 0
                ORDER BY c.display_order DESC, product_count DESC, c.name ASC
                LIMIT :limit
            ";
            
            $stmt = $this->db->prepare($sql);
            $stmt->bindParam(':pattern', $startsWithPattern, PDO::PARAM_STR);
            $stmt->bindParam(':limit', $limit, PDO::PARAM_INT);
            $stmt->execute();
            
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
            
        } catch (Exception $e) {
            error_log("ERROR in searchCategoriesStartsWith: " . $e->getMessage());
            return [];
        }
    }
    
    /**
     * Search categories that CONTAIN the query (excluding those that start with it)
     */
    public function searchCategoriesContains(string $query, int $limit): array
    {
        try {
            $containsPattern = '%' . $query . '%';
            $startsWithPattern = $query . '%';
            
            $sql = "
                SELECT DISTINCT
                    c.id, c.name, c.slug, c.description, c.image, 'category' as type,
                    COUNT(DISTINCT p.id) as product_count
                FROM categories c
                JOIN subcategories s ON c.id = s.category_id AND s.status = 'active' AND s.deleted_at IS NULL
                JOIN products p ON s.id = p.subcategory_id AND p.status = 'active' AND p.deleted_at IS NULL
                WHERE c.status = 'active' 
                    AND c.deleted_at IS NULL
                    AND LOWER(c.name) LIKE LOWER(:contains_pattern)
                    AND LOWER(c.name) NOT LIKE LOWER(:starts_pattern)
                GROUP BY c.id, c.name, c.slug, c.description, c.image
                HAVING COUNT(DISTINCT p.id) > 0
                ORDER BY c.display_order DESC, product_count DESC, c.name ASC
                LIMIT :limit
            ";
            
            $stmt = $this->db->prepare($sql);
            $stmt->bindParam(':contains_pattern', $containsPattern, PDO::PARAM_STR);
            $stmt->bindParam(':starts_pattern', $startsWithPattern, PDO::PARAM_STR);
            $stmt->bindParam(':limit', $limit, PDO::PARAM_INT);
            $stmt->execute();
            
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
            
        } catch (Exception $e) {
            error_log("ERROR in searchCategoriesContains: " . $e->getMessage());
            return [];
        }
    }
    
    /**
     * Search categories in other fields
     */
    public function searchCategoriesInFields(string $query, int $limit): array
    {
        try {
            $searchPattern = '%' . $query . '%';
            
            $sql = "
                SELECT DISTINCT
                    c.id, c.name, c.slug, c.description, c.image, 'category' as type,
                    COUNT(DISTINCT p.id) as product_count
                FROM categories c
                JOIN subcategories s ON c.id = s.category_id AND s.status = 'active' AND s.deleted_at IS NULL
                JOIN products p ON s.id = p.subcategory_id AND p.status = 'active' AND p.deleted_at IS NULL
                WHERE c.status = 'active' 
                    AND c.deleted_at IS NULL
                    AND LOWER(c.name) NOT LIKE LOWER(:search_pattern)
                    AND (
                        LOWER(c.description) LIKE LOWER(:search_pattern) OR
                        LOWER(c.meta_keywords) LIKE LOWER(:search_pattern)
                    )
                GROUP BY c.id, c.name, c.slug, c.description, c.image
                HAVING COUNT(DISTINCT p.id) > 0
                ORDER BY c.display_order DESC, product_count DESC, c.name ASC
                LIMIT :limit
            ";
            
            $stmt = $this->db->prepare($sql);
            $stmt->bindParam(':search_pattern', $searchPattern, PDO::PARAM_STR);
            $stmt->bindParam(':limit', $limit, PDO::PARAM_INT);
            $stmt->execute();
            
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
            
        } catch (Exception $e) {
            error_log("ERROR in searchCategoriesInFields: " . $e->getMessage());
            return [];
        }
    }
    
    /**
     * Search subcategories that START with the query
     */
    public function searchSubcategoriesStartsWith(string $query, int $limit): array
    {
        try {
            $startsWithPattern = $query . '%';
            
            $sql = "
                SELECT DISTINCT
                    s.id, s.name, s.slug, s.description, s.image,
                    c.id as category_id, c.name as category_name, 'subcategory' as type,
                    COUNT(DISTINCT p.id) as product_count
                FROM subcategories s
                JOIN categories c ON s.category_id = c.id AND c.status = 'active' AND c.deleted_at IS NULL
                JOIN products p ON s.id = p.subcategory_id AND p.status = 'active' AND p.deleted_at IS NULL
                WHERE s.status = 'active' 
                    AND s.deleted_at IS NULL
                    AND LOWER(s.name) LIKE LOWER(:pattern)
                GROUP BY s.id, s.name, s.slug, s.description, s.image, c.id, c.name
                HAVING COUNT(DISTINCT p.id) > 0
                ORDER BY s.display_order DESC, product_count DESC, s.name ASC
                LIMIT :limit
            ";
            
            $stmt = $this->db->prepare($sql);
            $stmt->bindParam(':pattern', $startsWithPattern, PDO::PARAM_STR);
            $stmt->bindParam(':limit', $limit, PDO::PARAM_INT);
            $stmt->execute();
            
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
            
        } catch (Exception $e) {
            error_log("ERROR in searchSubcategoriesStartsWith: " . $e->getMessage());
            return [];
        }
    }
    
    /**
     * Search subcategories that CONTAIN the query (excluding those that start with it)
     */
    public function searchSubcategoriesContains(string $query, int $limit): array
    {
        try {
            $containsPattern = '%' . $query . '%';
            $startsWithPattern = $query . '%';
            
            $sql = "
                SELECT DISTINCT
                    s.id, s.name, s.slug, s.description, s.image,
                    c.id as category_id, c.name as category_name, 'subcategory' as type,
                    COUNT(DISTINCT p.id) as product_count
                FROM subcategories s
                JOIN categories c ON s.category_id = c.id AND c.status = 'active' AND c.deleted_at IS NULL
                JOIN products p ON s.id = p.subcategory_id AND p.status = 'active' AND p.deleted_at IS NULL
                WHERE s.status = 'active' 
                    AND s.deleted_at IS NULL
                    AND LOWER(s.name) LIKE LOWER(:contains_pattern)
                    AND LOWER(s.name) NOT LIKE LOWER(:starts_pattern)
                GROUP BY s.id, s.name, s.slug, s.description, s.image, c.id, c.name
                HAVING COUNT(DISTINCT p.id) > 0
                ORDER BY s.display_order DESC, product_count DESC, s.name ASC
                LIMIT :limit
            ";
            
            $stmt = $this->db->prepare($sql);
            $stmt->bindParam(':contains_pattern', $containsPattern, PDO::PARAM_STR);
            $stmt->bindParam(':starts_pattern', $startsWithPattern, PDO::PARAM_STR);
            $stmt->bindParam(':limit', $limit, PDO::PARAM_INT);
            $stmt->execute();
            
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
            
        } catch (Exception $e) {
            error_log("ERROR in searchSubcategoriesContains: " . $e->getMessage());
            return [];
        }
    }
    
    /**
     * Search subcategories in other fields
     */
    public function searchSubcategoriesInFields(string $query, int $limit): array
    {
        try {
            $searchPattern = '%' . $query . '%';
            
            $sql = "
                SELECT DISTINCT
                    s.id, s.name, s.slug, s.description, s.image,
                    c.id as category_id, c.name as category_name, 'subcategory' as type,
                    COUNT(DISTINCT p.id) as product_count
                FROM subcategories s
                JOIN categories c ON s.category_id = c.id AND c.status = 'active' AND c.deleted_at IS NULL
                JOIN products p ON s.id = p.subcategory_id AND p.status = 'active' AND p.deleted_at IS NULL
                WHERE s.status = 'active' 
                    AND s.deleted_at IS NULL
                    AND LOWER(s.name) NOT LIKE LOWER(:search_pattern)
                    AND (
                        LOWER(s.description) LIKE LOWER(:search_pattern) OR
                        LOWER(s.meta_keywords) LIKE LOWER(:search_pattern)
                    )
                GROUP BY s.id, s.name, s.slug, s.description, s.image, c.id, c.name
                HAVING COUNT(DISTINCT p.id) > 0
                ORDER BY s.display_order DESC, product_count DESC, s.name ASC
                LIMIT :limit
            ";
            
            $stmt = $this->db->prepare($sql);
            $stmt->bindParam(':search_pattern', $searchPattern, PDO::PARAM_STR);
            $stmt->bindParam(':limit', $limit, PDO::PARAM_INT);
            $stmt->execute();
            
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
            
        } catch (Exception $e) {
            error_log("ERROR in searchSubcategoriesInFields: " . $e->getMessage());
            return [];
        }
    }
    
    /**
     * Get popular categories
     */
    public function getPopularCategories(int $limit): array
    {
        try {
            $sql = "
                SELECT DISTINCT
                    c.id, c.name, c.slug, c.description, c.image, 'category' as type,
                    COUNT(DISTINCT p.id) as product_count
                FROM categories c
                JOIN subcategories s ON c.id = s.category_id AND s.status = 'active' AND s.deleted_at IS NULL
                JOIN products p ON s.id = p.subcategory_id AND p.status = 'active' AND p.deleted_at IS NULL
                WHERE c.status = 'active' AND c.deleted_at IS NULL
                GROUP BY c.id, c.name, c.slug, c.description, c.image
                HAVING COUNT(DISTINCT p.id) > 0
                ORDER BY c.display_order DESC, product_count DESC, c.name ASC
                LIMIT :limit
            ";
            
            $stmt = $this->db->prepare($sql);
            $stmt->bindParam(':limit', $limit, PDO::PARAM_INT);
            $stmt->execute();
            
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
            
        } catch (Exception $e) {
            error_log("ERROR in getPopularCategories: " . $e->getMessage());
            return [];
        }
    }
    
    /**
     * Get popular subcategories
     */
    public function getPopularSubcategories(int $limit): array
    {
        try {
            $sql = "
                SELECT DISTINCT
                    s.id, s.name, s.slug, s.description, s.image,
                    c.id as category_id, c.name as category_name, 'subcategory' as type,
                    COUNT(DISTINCT p.id) as product_count
                FROM subcategories s
                JOIN categories c ON s.category_id = c.id AND c.status = 'active' AND c.deleted_at IS NULL
                JOIN products p ON s.id = p.subcategory_id AND p.status = 'active' AND p.deleted_at IS NULL
                WHERE s.status = 'active' AND s.deleted_at IS NULL
                GROUP BY s.id, s.name, s.slug, s.description, s.image, c.id, c.name
                HAVING COUNT(DISTINCT p.id) > 0
                ORDER BY s.display_order DESC, product_count DESC, s.name ASC
                LIMIT :limit
            ";
            
            $stmt = $this->db->prepare($sql);
            $stmt->bindParam(':limit', $limit, PDO::PARAM_INT);
            $stmt->execute();
            
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
            
        } catch (Exception $e) {
            error_log("ERROR in getPopularSubcategories: " . $e->getMessage());
            return [];
        }
    }
    
    /**
     * Get popular products
     */
    public function getPopularProducts(int $limit): array
    {
        try {
            $sql = "
                SELECT DISTINCT p.id
                FROM products p
                WHERE p.status = 'active' AND p.deleted_at IS NULL
                ORDER BY p.display_order DESC, p.created_at DESC
                LIMIT :limit
            ";
            
            $stmt = $this->db->prepare($sql);
            $stmt->bindParam(':limit', $limit, PDO::PARAM_INT);
            $stmt->execute();
            
            $productIds = $stmt->fetchAll(PDO::FETCH_COLUMN);
            
            if (empty($productIds)) {
                return [];
            }
            
            $products = $this->productDataFetcher->getProductsByIds($productIds);
            
            foreach ($products as &$product) {
                $product['type'] = 'product';
            }
            
            return $products;
            
        } catch (Exception $e) {
            error_log("ERROR in getPopularProducts: " . $e->getMessage());
            return [];
        }
    }

    /**
     * Search products by partial match for short queries
     */
    public function searchProductsByPartialMatch(string $query, int $limit): array
    {
        try {
            error_log("UnifiedSearchRepository::searchProductsByPartialMatch - Query: '$query'");
            
            $partialPattern = '%' . $query . '%';
            
            $sql = "
                SELECT DISTINCT p.id
                FROM products p
                WHERE p.status = 'active' 
                    AND p.deleted_at IS NULL
                    AND LOWER(p.name) LIKE LOWER(:pattern)
                ORDER BY 
                    CASE WHEN LOWER(p.name) LIKE LOWER(:starts_pattern) THEN 1 ELSE 2 END,
                    p.display_order DESC, 
                    p.name ASC
                LIMIT :limit
            ";
            
        $startsPattern = $query . '%';
        
        $stmt = $this->db->prepare($sql);
        $stmt->bindParam(':pattern', $partialPattern, PDO::PARAM_STR);
        $stmt->bindParam(':starts_pattern', $startsPattern, PDO::PARAM_STR);
        $stmt->bindParam(':limit', $limit, PDO::PARAM_INT);
        $stmt->execute();
        
        $productIds = $stmt->fetchAll(PDO::FETCH_COLUMN);
        
        if (empty($productIds)) {
            return [];
        }
        
        $products = $this->productDataFetcher->getProductsByIds($productIds);
        
        // Preserve order and add type
        $orderedProducts = [];
        foreach ($productIds as $id) {
            foreach ($products as $product) {
                if ($product['id'] == $id) {
                    $product['type'] = 'product';
                    $orderedProducts[] = $product;
                    break;
                }
            }
        }
        
        return $orderedProducts;
        
    } catch (Exception $e) {
        error_log("ERROR in searchProductsByPartialMatch: " . $e->getMessage());
        return [];
    }
}

/**
 * Search categories by partial match for short queries
 */
public function searchCategoriesByPartialMatch(string $query, int $limit): array
{
    try {
        error_log("UnifiedSearchRepository::searchCategoriesByPartialMatch - Query: '$query'");
        
        $partialPattern = '%' . $query . '%';
        $startsPattern = $query . '%';
        
        $sql = "
            SELECT DISTINCT
                c.id, c.name, c.slug, c.description, c.image, 'category' as type,
                COUNT(DISTINCT p.id) as product_count
            FROM categories c
            JOIN subcategories s ON c.id = s.category_id AND s.status = 'active' AND s.deleted_at IS NULL
            JOIN products p ON s.id = p.subcategory_id AND p.status = 'active' AND p.deleted_at IS NULL
            WHERE c.status = 'active' 
                AND c.deleted_at IS NULL
                AND LOWER(c.name) LIKE LOWER(:pattern)
            GROUP BY c.id, c.name, c.slug, c.description, c.image
            HAVING COUNT(DISTINCT p.id) > 0
            ORDER BY 
                CASE WHEN LOWER(c.name) LIKE LOWER(:starts_pattern) THEN 1 ELSE 2 END,
                c.display_order DESC, 
                product_count DESC, 
                c.name ASC
            LIMIT :limit
        ";
        
        $stmt = $this->db->prepare($sql);
        $stmt->bindParam(':pattern', $partialPattern, PDO::PARAM_STR);
        $stmt->bindParam(':starts_pattern', $startsPattern, PDO::PARAM_STR);
        $stmt->bindParam(':limit', $limit, PDO::PARAM_INT);
        $stmt->execute();
        
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
        
    } catch (Exception $e) {
        error_log("ERROR in searchCategoriesByPartialMatch: " . $e->getMessage());
        return [];
    }
}

/**
 * Search subcategories by partial match for short queries
 */
public function searchSubcategoriesByPartialMatch(string $query, int $limit): array
{
    try {
        error_log("UnifiedSearchRepository::searchSubcategoriesByPartialMatch - Query: '$query'");
        
        $partialPattern = '%' . $query . '%';
        $startsPattern = $query . '%';
        
        $sql = "
            SELECT DISTINCT
                s.id, s.name, s.slug, s.description, s.image,
                c.id as category_id, c.name as category_name, 'subcategory' as type,
                COUNT(DISTINCT p.id) as product_count
            FROM subcategories s
            JOIN categories c ON s.category_id = c.id AND c.status = 'active' AND c.deleted_at IS NULL
            JOIN products p ON s.id = p.subcategory_id AND p.status = 'active' AND p.deleted_at IS NULL
            WHERE s.status = 'active' 
                AND s.deleted_at IS NULL
                AND LOWER(s.name) LIKE LOWER(:pattern)
            GROUP BY s.id, s.name, s.slug, s.description, s.image, c.id, c.name
            HAVING COUNT(DISTINCT p.id) > 0
            ORDER BY 
                CASE WHEN LOWER(s.name) LIKE LOWER(:starts_pattern) THEN 1 ELSE 2 END,
                s.display_order DESC, 
                product_count DESC, 
                s.name ASC
            LIMIT :limit
        ";
        
        $stmt = $this->db->prepare($sql);
        $stmt->bindParam(':pattern', $partialPattern, PDO::PARAM_STR);
        $stmt->bindParam(':starts_pattern', $startsPattern, PDO::PARAM_STR);
        $stmt->bindParam(':limit', $limit, PDO::PARAM_INT);
        $stmt->execute();
        
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
        
    } catch (Exception $e) {
        error_log("ERROR in searchSubcategoriesByPartialMatch: " . $e->getMessage());
        return [];
    }
}
}
