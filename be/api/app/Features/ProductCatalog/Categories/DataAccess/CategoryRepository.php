<?php

namespace App\Features\ProductCatalog\Categories\DataAccess;

use App\Core\Database;
use App\Shared\Exceptions\NotFoundException;
use App\Shared\Exceptions\ValidationException;
use Exception;

class CategoryRepository
{
    private $database;

    public function __construct()
    {
        $this->database = Database::getInstance();
    }

    /**
     * Get all categories with optional pagination and filters
     *
     * @param int $page Page number
     * @param int $limit Items per page
     * @param array $filters Optional filters
     * @param bool $includeDeleted Whether to include deleted categories (for super admins)
     * @return array Categories and pagination metadata
     */
    public function getAllCategories($page = 1, $limit = 10, $filters = [], $includeDeleted = false)
    {
        try {
            // Debug log
            error_log("getAllCategories called with filters: " . json_encode($filters));
            
            $offset = ($page - 1) * $limit;
            $whereConditions = [];
            $params = [];

            // Only include non-deleted categories unless specifically requested
            if (!$includeDeleted) {
                $whereConditions[] = "c.deleted_at IS NULL";
            }

            // Apply filters if provided
            if (!empty($filters['search'])) {
                // Add search condition without using parameters for now
                $searchTerm = $this->database->getConnection()->quote('%' . $filters['search'] . '%');
                $whereConditions[] = "(c.name LIKE $searchTerm OR c.description LIKE $searchTerm OR c.slug LIKE $searchTerm)";
                
                // Debug log
                error_log("Search filter applied with term: " . $filters['search']);
                error_log("Quoted search term: " . $searchTerm);
            }

            if (!empty($filters['status'])) {
                $statusValue = $this->database->getConnection()->quote($filters['status']);
                $whereConditions[] = "c.status = $statusValue";
            }

            // Build WHERE clause
            $whereClause = !empty($whereConditions) ? "WHERE " . implode(' AND ', $whereConditions) : "";

            // Get total count for pagination
            $countSql = "SELECT COUNT(*) as total FROM categories c $whereClause";
            error_log("Count SQL: " . $countSql);
            $countResult = $this->database->fetch($countSql);
            $total = $countResult['total'] ?? 0;

            // Get categories with pagination
            $sql = "SELECT 
                        c.id, c.name, c.slug, c.description, c.image, 
                        c.meta_title, c.meta_description, c.meta_keywords,
                        c.status, c.display_order, c.is_takeaway, c.created_at, c.updated_at, c.deleted_at,
                        creator.id as creator_id, CONCAT(creator.first_name, ' ', creator.last_name) as created_by_name,
                        updater.id as updater_id, CONCAT(updater.first_name, ' ', creator.last_name) as updated_by_name,
                        deleter.id as deleter_id, CONCAT(deleter.first_name, ' ', deleter.last_name) as deleted_by_name
                    FROM categories c
                    LEFT JOIN admins creator ON c.created_by = creator.id
                    LEFT JOIN admins updater ON c.updated_by = updater.id
                    LEFT JOIN admins deleter ON c.deleted_by = deleter.id
                    $whereClause
                    ORDER BY c.display_order ASC, c.name ASC
                    LIMIT $limit OFFSET $offset";

            error_log("Main SQL: " . $sql);
            $categories = $this->database->fetchAll($sql);

            // Process categories data
            foreach ($categories as &$category) {
                // Add image URL if exists
                if (!empty($category['image'])) {
                    $category['image_url'] = $this->getImageUrl($category['image']);
                }
                
                // Format dates
                $category['created_at_formatted'] = date('Y-m-d H:i:s', strtotime($category['created_at']));
                if (!empty($category['updated_at'])) {
                    $category['updated_at_formatted'] = date('Y-m-d H:i:s', strtotime($category['updated_at']));
                }
                if (!empty($category['deleted_at'])) {
                    $category['deleted_at_formatted'] = date('Y-m-d H:i:s', strtotime($category['deleted_at']));
                }
                
                // Clean up null values for deleted info if not deleted
                if (empty($category['deleted_at'])) {
                    $category['deleted_by_name'] = null;
                    $category['deleter_id'] = null;
                }
                
                // Clean up null values for updated info if not updated
                if (empty($category['updated_at'])) {
                    $category['updated_by_name'] = null;
                    $category['updater_id'] = null;
                }
            }

            return [
                'data' => $categories,
                'meta' => [
                    'current_page' => $page,
                    'per_page' => $limit,
                    'total' => $total,
                    'total_pages' => ceil($total / $limit)
                ]
            ];
        } catch (Exception $e) {
            error_log("Error in getAllCategories: " . $e->getMessage());
            error_log("Stack trace: " . $e->getTraceAsString());
            throw new Exception('Error retrieving categories: ' . $e->getMessage());
        }
    }

    /**
     * Get category by ID
     *
     * @param int $id Category ID
     * @param bool $includeDeleted Whether to include deleted categories (for super admins)
     * @return array Category data
     * @throws NotFoundException
     */
    public function getCategoryById($id, $includeDeleted = false)
    {
        try {
            $whereClause = "c.id = :id";
            if (!$includeDeleted) {
                $whereClause .= " AND c.deleted_at IS NULL";
            }
            
            $sql = "SELECT 
                        c.id, c.name, c.slug, c.description, c.image, 
                        c.meta_title, c.meta_description, c.meta_keywords,
                        c.status, c.display_order, c.is_takeaway, c.created_at, c.updated_at, c.deleted_at,
                        creator.id as creator_id, CONCAT(creator.first_name, ' ', creator.last_name) as created_by_name,
                        updater.id as updater_id, CONCAT(updater.first_name, ' ', creator.last_name) as updated_by_name,
                        deleter.id as deleter_id, CONCAT(deleter.first_name, ' ', deleter.last_name) as deleted_by_name
                    FROM categories c
                    LEFT JOIN admins creator ON c.created_by = creator.id
                    LEFT JOIN admins updater ON c.updated_by = updater.id
                    LEFT JOIN admins deleter ON c.deleted_by = deleter.id
                    WHERE $whereClause";
            
            $category = $this->database->fetch($sql, [':id' => $id]);
            
            if (!$category) {
                throw new NotFoundException('Category not found');
            }
            
            // Add image URL if exists
            if (!empty($category['image'])) {
                $category['image_url'] = $this->getImageUrl($category['image']);
            }
            
            // Format dates
            $category['created_at_formatted'] = date('Y-m-d H:i:s', strtotime($category['created_at']));
            if (!empty($category['updated_at'])) {
                $category['updated_at_formatted'] = date('Y-m-d H:i:s', strtotime($category['updated_at']));
            }
            if (!empty($category['deleted_at'])) {
                $category['deleted_at_formatted'] = date('Y-m-d H:i:s', strtotime($category['deleted_at']));
            }
            
            // Clean up null values for deleted info if not deleted
            if (empty($category['deleted_at'])) {
                $category['deleted_by_name'] = null;
                $category['deleter_id'] = null;
            }
            
            // Clean up null values for updated info if not updated
            if (empty($category['updated_at'])) {
                $category['updated_by_name'] = null;
                $category['updater_id'] = null;
            }
            
            return $category;
        } catch (NotFoundException $e) {
            throw $e;
        } catch (Exception $e) {
            throw new Exception('Error retrieving category: ' . $e->getMessage());
        }
    }

    /**
     * Get category by slug
     *
     * @param string $slug Category slug
     * @param bool $includeDeleted Whether to include deleted categories (for super admins)
     * @return array Category data
     * @throws NotFoundException
     */
    public function getCategoryBySlug($slug, $includeDeleted = false)
    {
        try {
            $whereClause = "c.slug = :slug";
            if (!$includeDeleted) {
                $whereClause .= " AND c.deleted_at IS NULL";
            }
            
            $sql = "SELECT 
                        c.id, c.name, c.slug, c.description, c.image, 
                        c.meta_title, c.meta_description, c.meta_keywords,
                        c.status, c.display_order, c.is_takeaway, c.created_at, c.updated_at, c.deleted_at,
                        creator.id as creator_id, CONCAT(creator.first_name, ' ', creator.last_name) as created_by_name,
                        updater.id as updater_id, CONCAT(updater.first_name, ' ', creator.last_name) as updated_by_name,
                        deleter.id as deleter_id, CONCAT(deleter.first_name, ' ', deleter.last_name) as deleted_by_name
                    FROM categories c
                    LEFT JOIN admins creator ON c.created_by = creator.id
                    LEFT JOIN admins updater ON c.updated_by = updater.id
                    LEFT JOIN admins deleter ON c.deleted_by = deleter.id
                    WHERE $whereClause";
            
            $category = $this->database->fetch($sql, [':slug' => $slug]);
            
            if (!$category) {
                throw new NotFoundException('Category not found');
            }
            
            // Add image URL if exists
            if (!empty($category['image'])) {
                $category['image_url'] = $this->getImageUrl($category['image']);
            }
            
            // Format dates
            $category['created_at_formatted'] = date('Y-m-d H:i:s', strtotime($category['created_at']));
            if (!empty($category['updated_at'])) {
                $category['updated_at_formatted'] = date('Y-m-d H:i:s', strtotime($category['updated_at']));
            }
            if (!empty($category['deleted_at'])) {
                $category['deleted_at_formatted'] = date('Y-m-d H:i:s', strtotime($category['deleted_at']));
            }
            
            // Clean up null values for deleted info if not deleted
            if (empty($category['deleted_at'])) {
                $category['deleted_by_name'] = null;
                $category['deleter_id'] = null;
            }
            
            // Clean up null values for updated info if not updated
            if (empty($category['updated_at'])) {
                $category['updated_by_name'] = null;
                $category['updater_id'] = null;
            }
            
            return $category;
        } catch (NotFoundException $e) {
            throw $e;
        } catch (Exception $e) {
            throw new Exception('Error retrieving category: ' . $e->getMessage());
        }
    }

    /**
     * Create a new category
     *
     * @param array $data Category data
     * @return array Created category data
     * @throws ValidationException
     */
    public function createCategory($data)
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
            
            // Insert category
            $categoryId = $this->database->insert('categories', $data);
            
            if (!$categoryId) {
                throw new Exception('Failed to create category');
            }
            
            // Return created category
            return $this->getCategoryById($categoryId);
        } catch (ValidationException $e) {
            throw $e;
        } catch (Exception $e) {
            throw new Exception('Error creating category: ' . $e->getMessage());
        }
    }

    /**
     * Update a category
     *
     * @param int $id Category ID
     * @param array $data Category data
     * @return array Updated category data
     * @throws NotFoundException
     * @throws ValidationException
     */
    public function updateCategory($id, $data)
    {
        try {
            // Check if category exists
            $category = $this->getCategoryById($id);
            
            // Check if slug already exists (if being updated)
            if (isset($data['slug']) && !empty($data['slug']) && $data['slug'] !== $category['slug']) {
                $this->checkDuplicateSlug($data['slug']);
            } else if (isset($data['name']) && $data['name'] !== $category['name'] && (!isset($data['slug']) || empty($data['slug']))) {
                // Generate new slug from updated name
                $data['slug'] = $this->generateSlug($data['name']);
            }
            
            // Debug log the data being sent to the database
            error_log("CategoryRepository updateCategory - Data for DB update: " . json_encode($data));
            
            // Filter data to only include valid database fields
            $validFields = [
                'name', 'slug', 'description', 'image', 
                'meta_title', 'meta_description', 'meta_keywords',
                'status', 'display_order', 'is_takeaway', 'updated_at', 'updated_by'
            ];
            
            // Filter the input data to only include valid fields
            $filteredData = array_intersect_key($data, array_flip($validFields));
            
            // Update category
            $result = $this->database->update('categories', $filteredData, 'id = :id', [':id' => $id]);
            
            if (!$result) {
                throw new Exception('Failed to update category');
            }
            
            // Return updated category
            return $this->getCategoryById($id);
        } catch (NotFoundException $e) {
            throw $e;
        } catch (ValidationException $e) {
            throw $e;
        } catch (Exception $e) {
            error_log("CategoryRepository Error: " . $e->getMessage());
            throw new Exception('Error updating category: ' . $e->getMessage());
        }
    }

    /**
     * Delete a category (soft delete)
     *
     * @param int $id Category ID
     * @param int $deletedBy ID of admin who deleted the category
     * @return bool Success status
     * @throws NotFoundException
     */
    public function deleteCategory($id, $deletedBy)
    {
        try {
            // Check if category exists
            $this->getCategoryById($id);
            
            // Soft delete category
            $data = [
                'deleted_at' => date('Y-m-d H:i:s'),
                'deleted_by' => $deletedBy,
                'status' => 'inactive' // Also set status to inactive
            ];
            
            $result = $this->database->update('categories', $data, 'id = :id', [':id' => $id]);
            
            if (!$result) {
                throw new Exception('Failed to delete category');
            }
            
            return true;
        } catch (NotFoundException $e) {
            throw $e;
        } catch (Exception $e) {
            throw new Exception('Error deleting category: ' . $e->getMessage());
        }
    }

    /**
     * Restore a deleted category
     *
     * @param int $id Category ID
     * @param int $updatedBy ID of admin who restored the category
     * @return array Restored category data
     * @throws NotFoundException
     */
    public function restoreCategory($id, $updatedBy)
    {
        try {
            // Check if category exists (including deleted)
            $category = $this->getCategoryById($id, true);
            
            if (empty($category['deleted_at'])) {
                throw new ValidationException('Category is not deleted');
            }
            
            // Restore category
            $data = [
                'deleted_at' => null,
                'deleted_by' => null,
                'updated_at' => date('Y-m-d H:i:s'),
                'updated_by' => $updatedBy,
                'status' => 'active' // Reset status to active
            ];
            
            $result = $this->database->update('categories', $data, 'id = :id', [':id' => $id]);
            
            if (!$result) {
                throw new Exception('Failed to restore category');
            }
            
            // Return restored category
            return $this->getCategoryById($id);
        } catch (NotFoundException $e) {
            throw $e;
        } catch (ValidationException $e) {
            throw $e;
        } catch (Exception $e) {
            throw new Exception('Error restoring category: ' . $e->getMessage());
        }
    }

    /**
     * Update category image
     *
     * @param int $id Category ID
     * @param string $imagePath Path to image
     * @return array Updated category data
     * @throws NotFoundException
     */
    public function updateCategoryImage($id, $imagePath)
    {
        try {
            // Check if category exists
            $this->getCategoryById($id);
            
            // Update image
            $data = [
                'image' => $imagePath,
                'updated_at' => date('Y-m-d H:i:s')
            ];
            
            $result = $this->database->update('categories', $data, 'id = :id', [':id' => $id]);
            
            if (!$result) {
                throw new Exception('Failed to update category image');
            }
            
            // Return updated category
            return $this->getCategoryById($id);
        } catch (NotFoundException $e) {
            throw $e;
        } catch (Exception $e) {
            throw new Exception('Error updating category image: ' . $e->getMessage());
        }
    }

    /**
     * Get categories with nested subcategories (tree structure)
     *
     * @param int $page Page number
     * @param int $limit Items per page
     * @param array $filters Optional filters for categories
     * @param array $subcategoryOptions Options for subcategories
     * @param bool $includeDeleted Whether to include deleted categories (for super admins)
     * @return array Categories with nested subcategories and pagination metadata
     */
    public function getCategoryTree($page = 1, $limit = 10, $filters = [], $subcategoryOptions = [], $includeDeleted = false)
    {
        try {
            // Debug log
            error_log("getCategoryTree called with filters: " . json_encode($filters));
            error_log("Subcategory options: " . json_encode($subcategoryOptions));
            
            // Extract subcategory options
            $includeSubcategories = $subcategoryOptions['include_subcategories'] ?? true;
            $subcategoryStatus = $subcategoryOptions['subcategory_status'] ?? null;
            $expandAll = $subcategoryOptions['expand_all'] ?? false;
            
            // First, get paginated categories
            $categoriesResult = $this->getAllCategories($page, $limit, $filters, $includeDeleted);
            $categories = $categoriesResult['data'];
            $pagination = $categoriesResult['meta'];
            
            // If subcategories should be included
            if ($includeSubcategories) {
            // Get all category IDs
                $categoryIds = array_column($categories, 'id');
                
                if (!empty($categoryIds)) {
                    // Build subcategory query
                    $whereConditions = ["s.category_id IN (" . implode(',', $categoryIds) . ")"];
                    $params = [];
                    
                    // Only include non-deleted subcategories unless specifically requested
                    if (!$includeDeleted) {
                        $whereConditions[] = "s.deleted_at IS NULL";
                    }
                    
                    // Filter subcategories by status if provided
                    if (!empty($subcategoryStatus)) {
                        $statusValue = $this->database->getConnection()->quote($subcategoryStatus);
                        $whereConditions[] = "s.status = $statusValue";
                    }
                    
                    // Build WHERE clause
                    $whereClause = !empty($whereConditions) ? "WHERE " . implode(' AND ', $whereConditions) : "";
                    
                    // Get subcategories for these categories
                    $sql = "SELECT 
                                s.id, s.category_id, s.name, s.slug, s.description, s.image, 
                                s.meta_title, s.meta_description, s.meta_keywords,
                                s.status, s.display_order, s.created_at, s.updated_at, s.deleted_at
                            FROM subcategories s
                            $whereClause
                            ORDER BY s.category_id, s.display_order ASC, s.name ASC";
                    
                    error_log("Subcategories SQL: " . $sql);
                    $subcategories = $this->database->fetchAll($sql);
                    
                    // Process subcategories
                    $subcategoriesByCategory = [];
                    foreach ($subcategories as $subcategory) {
                        $categoryId = $subcategory['category_id'];
                        
                        // Add image URL if exists
                        if (!empty($subcategory['image'])) {
                            $subcategory['image_url'] = $this->getImageUrl($subcategory['image']);
                        }
                        
                        // Format dates
                        $subcategory['created_at_formatted'] = date('Y-m-d H:i:s', strtotime($subcategory['created_at']));
                        if (!empty($subcategory['updated_at'])) {
                            $subcategory['updated_at_formatted'] = date('Y-m-d H:i:s', strtotime($subcategory['updated_at']));
                        }
                        
                        // Group subcategories by category_id
                        if (!isset($subcategoriesByCategory[$categoryId])) {
                            $subcategoriesByCategory[$categoryId] = [];
                        }
                        $subcategoriesByCategory[$categoryId][] = $subcategory;
                    }
                    
                    // Add subcategories to their parent categories
                    foreach ($categories as &$category) {
                        $categoryId = $category['id'];
                        $category['subcategories'] = $subcategoriesByCategory[$categoryId] ?? [];
                        $category['subcategories_count'] = count($category['subcategories']);
                    }
                } else {
                    // No categories found, so no subcategories to add
                    foreach ($categories as &$category) {
                        $category['subcategories'] = [];
                        $category['subcategories_count'] = 0;
                    }
                }
                
                // If expand_all is true, get subcategories for all categories (not just the paginated ones)
                if ($expandAll && !empty($filters['search'])) {
                    // This is a special case where we want to show all categories that match the search term
                    // or have subcategories that match the search term
                    
                    // First, get all categories that match the search term
                    $searchCategories = $this->searchCategories($filters['search'], $includeDeleted);
                    
                    // Then, get all subcategories that match the search term
                    $searchSubcategories = $this->searchSubcategories($filters['search'], $includeDeleted);
                    
                    // Extract category IDs from subcategories
                    $subcategoryCategoryIds = array_unique(array_column($searchSubcategories, 'category_id'));
                    
                    // Get all categories for these subcategories
                    $additionalCategoryIds = array_diff($subcategoryCategoryIds, array_column($searchCategories, 'id'));
                    
                    if (!empty($additionalCategoryIds)) {
                        // Get these additional categories
                        $additionalCategories = $this->getCategoriesByIds($additionalCategoryIds, $includeDeleted);
                        
                        // Merge with search categories
                        $allCategories = array_merge($searchCategories, $additionalCategories);
                        
                        // Replace the paginated categories with all matching categories
                        $categories = $allCategories;
                        
                        // Update pagination metadata
                        $pagination['total'] = count($categories);
                        $pagination['total_pages'] = 1;
                        $pagination['current_page'] = 1;
                        $pagination['per_page'] = count($categories);
                        
                        // Now get all subcategories for these categories
                        $allCategoryIds = array_column($categories, 'id');
                        
                        if (!empty($allCategoryIds)) {
                            // Build subcategory query
                            $whereConditions = ["s.category_id IN (" . implode(',', $allCategoryIds) . ")"];
                            
                            // Only include non-deleted subcategories unless specifically requested
                            if (!$includeDeleted) {
                                $whereConditions[] = "s.deleted_at IS NULL";
                            }
                            
                            // Filter subcategories by status if provided
                            if (!empty($subcategoryStatus)) {
                                $statusValue = $this->database->getConnection()->quote($subcategoryStatus);
                                $whereConditions[] = "s.status = $statusValue";
                            }
                            
                            // Build WHERE clause
                            $whereClause = !empty($whereConditions) ? "WHERE " . implode(' AND ', $whereConditions) : "";
                            
                            // Get subcategories for these categories
                            $sql = "SELECT 
                                        s.id, s.category_id, s.name, s.slug, s.description, s.image, 
                                        s.meta_title, s.meta_description, s.meta_keywords,
                                        s.status, s.display_order, s.created_at, s.updated_at, s.deleted_at
                                    FROM subcategories s
                                    $whereClause
                                    ORDER BY s.category_id, s.display_order ASC, s.name ASC";
                            
                            $allSubcategories = $this->database->fetchAll($sql);
                            
                            // Process subcategories
                            $subcategoriesByCategory = [];
                            foreach ($allSubcategories as $subcategory) {
                                $categoryId = $subcategory['category_id'];
                                
                                // Add image URL if exists
                                if (!empty($subcategory['image'])) {
                                    $subcategory['image_url'] = $this->getImageUrl($subcategory['image']);
                                }
                                
                                // Format dates
                                $subcategory['created_at_formatted'] = date('Y-m-d H:i:s', strtotime($subcategory['created_at']));
                                if (!empty($subcategory['updated_at'])) {
                                    $subcategory['updated_at_formatted'] = date('Y-m-d H:i:s', strtotime($subcategory['updated_at']));
                                }
                                
                                // Group subcategories by category_id
                                if (!isset($subcategoriesByCategory[$categoryId])) {
                                    $subcategoriesByCategory[$categoryId] = [];
                                }
                                $subcategoriesByCategory[$categoryId][] = $subcategory;
                            }
                            
                            // Add subcategories to their parent categories
                            foreach ($categories as &$category) {
                                $categoryId = $category['id'];
                                $category['subcategories'] = $subcategoriesByCategory[$categoryId] ?? [];
                                $category['subcategories_count'] = count($category['subcategories']);
                            }
                        }
                    }
                }
            } else {
                // If subcategories are not included, add empty arrays
                foreach ($categories as &$category) {
                    $category['subcategories'] = [];
                    $category['subcategories_count'] = 0;
                }
            }
            
            return [
                'data' => $categories,
                'meta' => $pagination
            ];
        } catch (Exception $e) {
            error_log("Error in getCategoryTree: " . $e->getMessage());
            error_log("Stack trace: " . $e->getTraceAsString());
            throw new Exception('Error retrieving category tree: ' . $e->getMessage());
        }
    }

    /**
     * Search categories by name, description, or slug
     *
     * @param string $searchTerm Search term
     * @param bool $includeDeleted Whether to include deleted categories
     * @return array Matching categories
     */
    private function searchCategories($searchTerm, $includeDeleted = false)
    {
        try {
            $whereConditions = [];
            
            // Only include non-deleted categories unless specifically requested
            if (!$includeDeleted) {
                $whereConditions[] = "c.deleted_at IS NULL";
            }
            
            // Add search condition
            $searchTermQuoted = $this->database->getConnection()->quote('%' . $searchTerm . '%');
            $whereConditions[] = "(c.name LIKE $searchTermQuoted OR c.description LIKE $searchTermQuoted OR c.slug LIKE $searchTermQuoted)";
            
            // Build WHERE clause
            $whereClause = !empty($whereConditions) ? "WHERE " . implode(' AND ', $whereConditions) : "";
            
            // Get categories
            $sql = "SELECT 
                        c.id, c.name, c.slug, c.description, c.image, 
                        c.meta_title, c.meta_description, c.meta_keywords,
                        c.status, c.display_order, c.is_takeaway, c.created_at, c.updated_at, c.deleted_at
                    FROM categories c
                    $whereClause
                    ORDER BY c.display_order ASC, c.name ASC";
            
            $categories = $this->database->fetchAll($sql);
            
            // Process categories
            foreach ($categories as &$category) {
                // Add image URL if exists
                if (!empty($category['image'])) {
                    $category['image_url'] = $this->getImageUrl($category['image']);
                }
                
                // Format dates
                $category['created_at_formatted'] = date('Y-m-d H:i:s', strtotime($category['created_at']));
                if (!empty($category['updated_at'])) {
                    $category['updated_at_formatted'] = date('Y-m-d H:i:s', strtotime($category['updated_at']));
                }
            }
            
            return $categories;
        } catch (Exception $e) {
            error_log("Error in searchCategories: " . $e->getMessage());
            throw new Exception('Error searching categories: ' . $e->getMessage());
        }
    }

    /**
     * Search subcategories by name, description, or slug
     *
     * @param string $searchTerm Search term
     * @param bool $includeDeleted Whether to include deleted subcategories
     * @return array Matching subcategories
     */
    private function searchSubcategories($searchTerm, $includeDeleted = false)
    {
        try {
            $whereConditions = [];
            
            // Only include non-deleted subcategories unless specifically requested
            if (!$includeDeleted) {
                $whereConditions[] = "s.deleted_at IS NULL";
            }
            
            // Add search condition
            $searchTermQuoted = $this->database->getConnection()->quote('%' . $searchTerm . '%');
            $whereConditions[] = "(s.name LIKE $searchTermQuoted OR s.description LIKE $searchTermQuoted OR s.slug LIKE $searchTermQuoted)";
            
            // Build WHERE clause
            $whereClause = !empty($whereConditions) ? "WHERE " . implode(' AND ', $whereConditions) : "";
            
            // Get subcategories
            $sql = "SELECT 
                        s.id, s.category_id, s.name, s.slug, s.description, s.image, 
                        s.meta_title, s.meta_description, s.meta_keywords,
                        s.status, s.display_order, s.created_at, s.updated_at, s.deleted_at
                    FROM subcategories s
                    $whereClause
                    ORDER BY s.category_id, s.display_order ASC, s.name ASC";
            
            return $this->database->fetchAll($sql);
        } catch (Exception $e) {
            error_log("Error in searchSubcategories: " . $e->getMessage());
            throw new Exception('Error searching subcategories: ' . $e->getMessage());
        }
    }

    /**
     * Get categories by IDs
     *
     * @param array $categoryIds Category IDs
     * @param bool $includeDeleted Whether to include deleted categories
     * @return array Categories
     */
    private function getCategoriesByIds($categoryIds, $includeDeleted = false)
    {
        try {
            if (empty($categoryIds)) {
                return [];
            }
            
            $whereConditions = ["c.id IN (" . implode(',', $categoryIds) . ")"];
            
            // Only include non-deleted categories unless specifically requested
            if (!$includeDeleted) {
                $whereConditions[] = "c.deleted_at IS NULL";
            }
            
            // Build WHERE clause
            $whereClause = !empty($whereConditions) ? "WHERE " . implode(' AND ', $whereConditions) : "";
            
            // Get categories
            $sql = "SELECT 
                        c.id, c.name, c.slug, c.description, c.image, 
                        c.meta_title, c.meta_description, c.meta_keywords,
                        c.status, c.display_order, c.is_takeaway, c.created_at, c.updated_at, c.deleted_at
                    FROM categories c
                    $whereClause
                    ORDER BY c.display_order ASC, c.name ASC";
            
            $categories = $this->database->fetchAll($sql);
            
            // Process categories
            foreach ($categories as &$category) {
                // Add image URL if exists
                if (!empty($category['image'])) {
                    $category['image_url'] = $this->getImageUrl($category['image']);
                }
                
                // Format dates
                $category['created_at_formatted'] = date('Y-m-d H:i:s', strtotime($category['created_at']));
                if (!empty($category['updated_at'])) {
                    $category['updated_at_formatted'] = date('Y-m-d H:i:s', strtotime($category['updated_at']));
            }
        }
        
        return $categories;
    } catch (Exception $e) {
        error_log("Error in getCategoriesByIds: " . $e->getMessage());
        throw new Exception('Error retrieving categories by IDs: ' . $e->getMessage());
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
        $sql = "SELECT id FROM categories WHERE slug = :slug AND deleted_at IS NULL";
        $result = $this->database->fetch($sql, [':slug' => $slug]);
        
        if ($result) {
            throw new ValidationException('Validation failed', ['slug' => 'Slug already exists']);
        }
    }

    /**
     * Generate a unique slug from name
     *
     * @param string $name Category name
     * @return string Unique slug
     */
    private function generateSlug($name)
    {
        // Convert to lowercase and replace spaces with hyphens
        $slug = strtolower(trim(preg_replace('/[^a-zA-Z0-9]+/', '-', $name), '-'));
        
        // Check if slug already exists
        $sql = "SELECT id FROM categories WHERE slug = :slug AND deleted_at IS NULL";
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
