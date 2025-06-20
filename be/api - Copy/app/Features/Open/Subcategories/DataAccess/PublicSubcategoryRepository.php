<?php

namespace App\Features\Open\Subcategories\DataAccess;

use App\Core\Database;
use PDO;

class PublicSubcategoryRepository
{
    private $db;

    public function __construct()
    {
        $this->db = Database::getInstance()->getConnection();
    }

    /**
     * Get all subcategories for a specific category that have at least one product
     * 
     * @param int $categoryId The ID of the category
     * @return array Array of subcategories with product counts
     */
    public function getSubcategoriesByCategory(int $categoryId): array
    {
        try {
            $query = "
                SELECT 
                    s.id,
                    s.name,
                    s.slug,
                    s.description,
                    s.meta_title,
                    s.meta_description,
                    s.meta_keywords,
                    s.image,
                    s.display_order,
                    s.status,
                    s.created_at,
                    s.updated_at,
                    c.id as category_id,
                    c.name as category_name,
                    c.slug as category_slug,
                    COUNT(DISTINCT p.id) as product_count
                FROM 
                    subcategories s
                JOIN 
                    categories c ON s.category_id = c.id
                JOIN 
                    products p ON p.subcategory_id = s.id
                WHERE 
                    s.category_id = :category_id
                    AND s.status = 'active'
                    AND p.status = 'active'
                GROUP BY 
                    s.id
                HAVING 
                    COUNT(DISTINCT p.id) > 0
                ORDER BY 
                    s.display_order ASC, s.name ASC
            ";

            $stmt = $this->db->prepare($query);
            $stmt->bindParam(':category_id', $categoryId, PDO::PARAM_INT);
            $stmt->execute();

            $subcategories = [];
            while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
                // Format the subcategory data
                $subcategory = [
                    'id' => (int)$row['id'],
                    'name' => $row['name'],
                    'slug' => $row['slug'],
                    'description' => $row['description'],
                    'meta_title' => $row['meta_title'],
                    'meta_description' => $row['meta_description'],
                    'meta_keywords' => $row['meta_keywords'],
                    'image' => $row['image'],
                    'display_order' => (int)$row['display_order'],
                    'status' => $row['status'],
                    'created_at' => $row['created_at'],
                    'updated_at' => $row['updated_at'],
                    'category' => [
                        'id' => (int)$row['category_id'],
                        'name' => $row['category_name'],
                        'slug' => $row['category_slug']
                    ],
                    'product_count' => (int)$row['product_count']
                ];

                $subcategories[] = $subcategory;
            }

            return $subcategories;
        } catch (\PDOException $e) {
            // Log the error
            error_log('Database error: ' . $e->getMessage());
            return [];
        }
    }
}
