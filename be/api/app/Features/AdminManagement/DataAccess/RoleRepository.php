<?php

namespace App\Features\AdminManagement\DataAccess;

use App\Core\Database;
use Exception;

class RoleRepository
{
    private $database;

    public function __construct()
    {
        $this->database = Database::getInstance();
    }

    /**
     * Get all available roles
     *
     * @return array List of roles
     */
    public function getAllRoles()
    {
        try {
            // For now, we're using the ENUM values from the database schema
            // In a more complex system, this might come from a roles table
            return [
                [
                    'id' => 'super_admin',
                    'name' => 'Super Admin',
                    'description' => 'Full access to all features'
                ],
                [
                    'id' => 'admin',
                    'name' => 'Admin',
                    'description' => 'Administrative access with some restrictions'
                ]
            ];
        } catch (Exception $e) {
            throw new Exception('Error retrieving roles: ' . $e->getMessage());
        }
    }

    /**
     * Get role by ID
     *
     * @param string $roleId Role ID
     * @return array|null Role data or null if not found
     */
    public function getRoleById($roleId)
    {
        $roles = $this->getAllRoles();
        
        foreach ($roles as $role) {
            if ($role['id'] === $roleId) {
                return $role;
            }
        }
        
        return null;
    }
}
