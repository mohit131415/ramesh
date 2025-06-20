<?php

namespace App\Features\ProductCatalog\Subcategories\DataAccess;

use App\Core\Database;
use App\Shared\Exceptions\NotFoundException;
use App\Shared\Exceptions\ValidationException;
use Exception;

class SubcategoryRepository
{
    private $database;

    public function __construct()
    {
        $this->database = Database::getInstance();
    }

    /**
     * Get all subcategories with optional pagination and filters
     *
     * @param int $page Page number
     * @param int $limit Items per page
     * @param array $filters Optional filters
     * @param bool $includeDeleted Whether to include deleted subcategories (for super admins)
     * @return array Subcategories and pagination metadata
     */
    public function getAllSubcategories($page = 1, $limit = 10, $filters = [], $includeDeleted = false)
    {
        try {
            // Debug log
            error_log("getAllSubcategories called with filters: " . json_encode($filters));
            
            $offset = ($page - 1) * $limit;
            $whereConditions = [];
            $params = [];

            // Only include non-deleted subcategories unless specifically requested
            if (!$includeDeleted) {
                $whereConditions[] = "s.deleted_at IS NULL";
            }

            // Apply filters if provided
            if (!empty($filters['search'])) {
                // Add search condition without using parameters for now
                $searchTerm = $this->database->getConnection()->quote('%' . $filters['search'] . '%');
                $whereConditions[] = "(s.name LIKE $searchTerm OR s.description LIKE $searchTerm OR s.slug LIKE $searchTerm)";
                
                // Debug log
                error_log("Search filter applied with term: " . $filters['search']);
                error_log("Quoted search term: " . $searchTerm);
            }

            if (!empty($filters['status'])) {
                $statusValue = $this->database->getConnection()->quote($filters['status']);
                $whereConditions[] = "s.status = $statusValue";
            }

            if (!empty($filters['category_id'])) {
                $categoryIdValue = $this->database->getConnection()->quote($filters['category_id']);
                $whereConditions[] = "s.category_id = $categoryIdValue";
            }

            // Build WHERE clause
            $whereClause = !empty($whereConditions) ? "WHERE " . implode(' AND ', $whereConditions) : "";

            // Get total count for pagination
            $countSql = "SELECT COUNT(*) as total FROM subcategories s $whereClause";
            error_log("Count SQL: " . $countSql);
            $countResult = $this->database->fetch($countSql);
            $total = $countResult['total'] ?? 0;

            // Get subcategories with pagination
            $sql = "SELECT 
                        s.id, s.category_id, s.name, s.slug, s.description, s.image, 
                        s.meta_title, s.meta_description, s.meta_keywords,
                        s.status, s.display_order, s.created_at, s.updated_at, s.deleted_at,
                        c.id as category_id, c.name as category_name, c.slug as category_slug, 
                        c.description as category_description, c.image as category_image,
                        c.status as category_status, c.display_order as category_display_order,
                        creator.id as creator_id, CONCAT(creator.first_name, ' ', creator.last_name) as created_by_name,
                        updater.id as updater_id, CONCAT(updater.first_name, ' ', updater.last_name) as updated_by_name,
                        deleter.id as deleter_id, CONCAT(deleter.first_name, ' ', deleter.last_name) as deleted_by_name
                    FROM subcategories s
                    LEFT JOIN categories c ON s.category_id = c.id
                    LEFT JOIN admins creator ON s.created_by = creator.id
                    LEFT JOIN admins updater ON s.updated_by = updater.id
                    LEFT JOIN admins deleter ON s.deleted_by = deleter.id
                    $whereClause
                    ORDER BY s.display_order ASC, s.name ASC
                    LIMIT $limit OFFSET $offset";

            error_log("Main SQL: " . $sql);
            $subcategories = $this->database->fetchAll($sql);

            // Process subcategories data
            foreach ($subcategories as &$subcategory) {
                // Add category details in a structured way
                if (!empty($subcategory['category_id'])) {
                    $subcategory['category'] = [
                        'id' => $subcategory['category_id'],
                        'name' => $subcategory['category_name'],
                        'slug' => $subcategory['category_slug'],
                        'description' => $subcategory['category_description'],
                        'status' => $subcategory['category_status'],
                        'display_order' => $subcategory['category_display_order']
                    ];
                    
                    // Add category image URL if exists
                    if (!empty($subcategory['category_image'])) {
                        $subcategory['category']['image'] = $subcategory['category_image'];
                        $subcategory['category']['image_url'] = $this->getImageUrl($subcategory['category_image']);
                    }
                }
                
                // Add image URL if exists
                if (!empty($subcategory['image'])) {
                    $subcategory['image_url'] = $this->getImageUrl($subcategory['image']);
                }
                
                // Format dates
                $subcategory['created_at_formatted'] = date('Y-m-d H:i:s', strtotime($subcategory['created_at']));
                if (!empty($subcategory['updated_at'])) {
                    $subcategory['updated_at_formatted'] = date('Y-m-d H:i:s', strtotime($subcategory['updated_at']));
                }
                if (!empty($subcategory['deleted_at'])) {
                    $subcategory['deleted_at_formatted'] = date('Y-m-d H:i:s', strtotime($subcategory['deleted_at']));
                }
                
                // Clean up null values for deleted info if not deleted
                if (empty($subcategory['deleted_at'])) {
                    $subcategory['deleted_by_name'] = null;
                    $subcategory['deleter_id'] = null;
                }
                
                // Clean up null values for updated info if not updated
                if (empty($subcategory['updated_at'])) {
                    $subcategory['updated_by_name'] = null;
                    $subcategory['updater_id'] = null;
                }
            }

            return [
                'data' => $subcategories,
                'meta' => [
                    'current_page' => $page,
                    'per_page' => $limit,
                    'total' => $total,
                    'total_pages' => ceil($total / $limit)
                ]
            ];
        } catch (Exception $e) {
            error_log("Error in getAllSubcategories: " . $e->getMessage());
            error_log("Stack trace: " . $e->getTraceAsString());
            throw new Exception('Error retrieving subcategories: ' . $e->getMessage());
        }
    }

    /**
     * Get subcategory by ID
     *
     * @param int $id Subcategory ID
     * @param bool $includeDeleted Whether to include deleted subcategories (for super admins)
     * @return array Subcategory data
     * @throws NotFoundException
     */
    public function getSubcategoryById($id, $includeDeleted = false)
    {
        try {
            $whereClause = "s.id = :id";
            if (!$includeDeleted) {
                $whereClause .= " AND s.deleted_at IS NULL";
            }
            
            $sql = "SELECT 
                        s.id, s.category_id, s.name, s.slug, s.description, s.image, 
                        s.meta_title, s.meta_description, s.meta_keywords,
                        s.status, s.display_order, s.created_at, s.updated_at, s.deleted_at,
                        c.id as category_id, c.name as category_name, c.slug as category_slug, 
                        c.description as category_description, c.image as category_image,
                        c.status as category_status, c.display_order as category_display_order,
                        creator.id as creator_id, CONCAT(creator.first_name, ' ', creator.last_name) as created_by_name,
                        updater.id as updater_id, CONCAT(updater.first_name, ' ', updater.last_name) as updated_by_name,
                        deleter.id as deleter_id, CONCAT(deleter.first_name, ' ', deleter.last_name) as deleted_by_name
                    FROM subcategories s
                    LEFT JOIN categories c ON s.category_id = c.id
                    LEFT JOIN admins creator ON s.created_by = creator.id
                    LEFT JOIN admins updater ON s.updated_by = updater.id
                    LEFT JOIN admins deleter ON s.deleted_by = deleter.id
                    WHERE $whereClause";
            
            $subcategory = $this->database->fetch($sql, [':id' => $id]);
            
            if (!$subcategory) {
                throw new NotFoundException('Subcategory not found');
            }
            
            // Add category details in a structured way
            if (!empty($subcategory['category_id'])) {
                $subcategory['category'] = [
                    'id' => $subcategory['category_id'],
                    'name' => $subcategory['category_name'],
                    'slug' => $subcategory['category_slug'],
                    'description' => $subcategory['category_description'],
                    'status' => $subcategory['category_status'],
                    'display_order' => $subcategory['category_display_order']
                ];
                
                // Add category image URL if exists
                if (!empty($subcategory['category_image'])) {
                    $subcategory['category']['image'] = $subcategory['category_image'];
                    $subcategory['category']['image_url'] = $this->getImageUrl($subcategory['category_image']);
                }
            }
            
            // Add image URL if exists
            if (!empty($subcategory['image'])) {
                $subcategory['image_url'] = $this->getImageUrl($subcategory['image']);
            }
            
            // Format dates
            $subcategory['created_at_formatted'] = date('Y-m-d H:i:s', strtotime($subcategory['created_at']));
            if (!empty($subcategory['updated_at'])) {
                $subcategory['updated_at_formatted'] = date('Y-m-d H:i:s', strtotime($subcategory['updated_at']));
            }
            if (!empty($subcategory['deleted_at'])) {
                $subcategory['deleted_at_formatted'] = date('Y-m-d H:i:s', strtotime($subcategory['deleted_at']));
            }
            
            // Clean up null values for deleted info if not deleted
            if (empty($subcategory['deleted_at'])) {
                $subcategory['deleted_by_name'] = null;
                $subcategory['deleter_id'] = null;
            }
            
            // Clean up null values for updated info if not updated
            if (empty($subcategory['updated_at'])) {
                $subcategory['updated_by_name'] = null;
                $subcategory['updater_id'] = null;
            }
            
            return $subcategory;
        } catch (NotFoundException $e) {
            throw $e;
        } catch (Exception $e) {
            throw new Exception('Error retrieving subcategory: ' . $e->getMessage());
        }
    }

    /**
     * Get subcategory by slug
     *
     * @param string $slug Subcategory slug
     * @param bool $includeDeleted Whether to include deleted subcategories (for super admins)
     * @return array Subcategory data
     * @throws NotFoundException
     */
    public function getSubcategoryBySlug($slug, $includeDeleted = false)
    {
        try {
            $whereClause = "s.slug = :slug";
            if (!$includeDeleted) {
                $whereClause .= " AND s.deleted_at IS NULL";
            }
            
            $sql = "SELECT 
                        s.id, s.category_id, s.name, s.slug, s.description, s.image, 
                        s.meta_title, s.meta_description, s.meta_keywords,
                        s.status, s.display_order, s.created_at, s.updated_at, s.deleted_at,
                        c.id as category_id, c.name as category_name, c.slug as category_slug, 
                        c.description as category_description, c.image as category_image,
                        c.status as category_status, c.display_order as category_display_order,
                        creator.id as creator_id, CONCAT(creator.first_name, ' ', creator.last_name) as created_by_name,
                        updater.id as updater_id, CONCAT(updater.first_name, ' ', updater.last_name) as updated_by_name,
                        deleter.id as deleter_id, CONCAT(deleter.first_name, ' ', deleter.last_name) as deleted_by_name
                    FROM subcategories s
                    LEFT JOIN categories c ON s.category_id = c.id
                    LEFT JOIN admins creator ON s.created_by = creator.id
                    LEFT JOIN admins updater ON s.updated_by = updater.id
                    LEFT JOIN admins deleter ON s.deleted_by = deleter.id
                    WHERE $whereClause";
            
            $subcategory = $this->database->fetch($sql, [':slug' => $slug]);
            
            if (!$subcategory) {
                throw new NotFoundException('Subcategory not found');
            }
            
            // Add category details in a structured way
            if (!empty($subcategory['category_id'])) {
                $subcategory['category'] = [
                    'id' => $subcategory['category_id'],
                    'name' => $subcategory['category_name'],
                    'slug' => $subcategory['category_slug'],
                    'description' => $subcategory['category_description'],
                    'status' => $subcategory['category_status'],
                    'display_order' => $subcategory['category_display_order']
                ];
                
                // Add category image URL if exists
                if (!empty($subcategory['category_image'])) {
                    $subcategory['category']['image'] = $subcategory['category_image'];
                    $subcategory['category']['image_url'] = $this->getImageUrl($subcategory['category_image']);
                }
            }
            
            // Add image URL if exists
            if (!empty($subcategory['image'])) {
                $subcategory['image_url'] = $this->getImageUrl($subcategory['image']);
            }
            
            // Format dates
            $subcategory['created_at_formatted'] = date('Y-m-d H:i:s', strtotime($subcategory['created_at']));
            if (!empty($subcategory['updated_at'])) {
                $subcategory['updated_at_formatted'] = date('Y-m-d H:i:s', strtotime($subcategory['updated_at']));
            }
            if (!empty($subcategory['deleted_at'])) {
                $subcategory['deleted_at_formatted'] = date('Y-m-d H:i:s', strtotime($subcategory['deleted_at']));
            }
            
            // Clean up null values for deleted info if not deleted
            if (empty($subcategory['deleted_at'])) {
                $subcategory['deleted_by_name'] = null;
                $subcategory['deleter_id'] = null;
            }
            
            // Clean up null values for updated info if not updated
            if (empty($subcategory['updated_at'])) {
                $subcategory['updated_by_name'] = null;
                $subcategory['updater_id'] = null;
            }
            
            return $subcategory;
        } catch (NotFoundException $e) {
            throw $e;
        } catch (Exception $e) {
            throw new Exception('Error retrieving subcategory: ' . $e->getMessage());
        }
    }

    /**
     * Create a new subcategory
     *
     * @param array $data Subcategory data
     * @return array Created subcategory data
     * @throws ValidationException
     */
    public function createSubcategory($data)
    {
        try {
            // Check if slug already exists
            if (!empty($data['slug'])) {
                $this->checkDuplicateSlug($data['slug']);
            } else {
                // Generate slug from name
                $data['slug'] = $this->generateSlug($data['name']);
            }
            
            // Set created_at
            $data['created_at'] = date('Y-m-d H:i:s');
            
            // Insert subcategory
            $subcategoryId = $this->database->insert('subcategories', $data);
            
            if (!$subcategoryId) {
                throw new Exception('Failed to create subcategory');
            }
            
            // Return created subcategory
            return $this->getSubcategoryById($subcategoryId);
        } catch (ValidationException $e) {
            throw $e;
        } catch (Exception $e) {
            throw new Exception('Error creating subcategory: ' . $e->getMessage());
        }
    }

    /**
     * Update a subcategory
     *
     * @param int $id Subcategory ID
     * @param array $data Subcategory data
     * @return array Updated subcategory data
     * @throws NotFoundException
     * @throws ValidationException
     */
    public function updateSubcategory($id, $data)
    {
        try {
            // Check if subcategory exists
            $subcategory = $this->getSubcategoryById($id);
            
            // Check if slug already exists (if being updated)
            if (isset($data['slug']) && !empty($data['slug']) && $data['slug'] !== $subcategory['slug']) {
                $this->checkDuplicateSlug($data['slug']);
            } else if (isset($data['name']) && $data['name'] !== $subcategory['name'] && (!isset($data['slug']) || empty($data['slug']))) {
                // Generate new slug from updated name
                $data['slug'] = $this->generateSlug($data['name']);
            }
            
            // Debug log the data being sent to the database
            error_log("SubcategoryRepository updateSubcategory - Data for DB update: " . json_encode($data));
            
            // Update subcategory
            $result = $this->database->update('subcategories', $data, 'id = :id', [':id' => $id]);
            
            if (!$result) {
                throw new Exception('Failed to update subcategory');
            }
            
            // Return updated subcategory
            return $this->getSubcategoryById($id);
        } catch (NotFoundException $e) {
            throw $e;
        } catch (ValidationException $e) {
            throw $e;
        } catch (Exception $e) {
            error_log("SubcategoryRepository Error: " . $e->getMessage());
            throw new Exception('Error updating subcategory: ' . $e->getMessage());
        }
    }

    /**
     * Delete a subcategory (soft delete)
     *
     * @param int $id Subcategory ID
     * @param int $deletedBy ID of admin who deleted the subcategory
     * @return bool Success status
     * @throws NotFoundException
     */
    public function deleteSubcategory($id, $deletedBy)
    {
        try {
            // Check if subcategory exists
            $this->getSubcategoryById($id);
            
            // Soft delete subcategory
            $data = [
                'deleted_at' => date('Y-m-d H:i:s'),
                'deleted_by' => $deletedBy,
                'status' => 'inactive' // Also set status to inactive
            ];
            
            $result = $this->database->update('subcategories', $data, 'id = :id', [':id' => $id]);
            
            if (!$result) {
                throw new Exception('Failed to delete subcategory');
            }
            
            return true;
        } catch (NotFoundException $e) {
            throw $e;
        } catch (Exception $e) {
            throw new Exception('Error deleting subcategory: ' . $e->getMessage());
        }
    }

    /**
     * Restore a deleted subcategory
     *
     * @param int $id Subcategory ID
     * @param int $updatedBy ID of admin who restored the subcategory
     * @return array Restored subcategory data
     * @throws NotFoundException
     */
    public function restoreSubcategory($id, $updatedBy)
    {
        try {
            // Check if subcategory exists (including deleted)
            $subcategory = $this->getSubcategoryById($id, true);
            
            if (empty($subcategory['deleted_at'])) {
                throw new ValidationException('Subcategory is not deleted');
            }
            
            // Restore subcategory
            $data = [
                'deleted_at' => null,
                'deleted_by' => null,
                'updated_at' => date('Y-m-d H:i:s'),
                'updated_by' => $updatedBy,
                'status' => 'active' // Reset status to active
            ];
            
            $result = $this->database->update('subcategories', $data, 'id = :id', [':id' => $id]);
            
            if (!$result) {
                throw new Exception('Failed to restore subcategory');
            }
            
            // Return restored subcategory
            return $this->getSubcategoryById($id);
        } catch (NotFoundException $e) {
            throw $e;
        } catch (ValidationException $e) {
            throw $e;
        } catch (Exception $e) {
            throw new Exception('Error restoring subcategory: ' . $e->getMessage());
        }
    }

    /**
     * Check if slug already exists
     *
     * @param string $slug Slug to check
     * @throws ValidationException
     */
    private function checkDuplicateSlug($slug)
    {
        $sql = "SELECT id FROM subcategories WHERE slug = :slug AND deleted_at IS NULL";
        $result = $this->database->fetch($sql, [':slug' => $slug]);
        
        if ($result) {
            throw new ValidationException('Validation failed', ['slug' => 'Slug already exists']);
        }
    }

    /**
     * Generate a unique slug from name
     *
     * @param string $name Subcategory name
     * @return string Unique slug
     */
    private function generateSlug($name)
    {
        // Convert to lowercase and replace spaces with hyphens
        $slug = strtolower(trim(preg_replace('/[^a-zA-Z0-9]+/', '-', $name), '-'));
        
        // Check if slug already exists
        $sql = "SELECT id FROM subcategories WHERE slug = :slug AND deleted_at IS NULL";
        $result = $this->database->fetch($sql, [':slug' => $slug]);
        
        if (!$result) {
            return $slug;
        }
        
        // If slug exists, append a number
        $i = 1;
        do {
            $newSlug = $slug . '-' . $i++;
            $result = $this->database->fetch($sql, [':slug' => $newSlug]);
        } while ($result);
        
        return $newSlug;
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
}
