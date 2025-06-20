<?php

namespace App\Core\Security;

use App\Core\Security\Authentication;
use App\Shared\Exceptions\AuthorizationException;

class Authorization
{
    private static $instance = null;
    private $authentication;

    private function __construct()
    {
        $this->authentication = Authentication::getInstance();
    }

    public static function getInstance()
    {
        if (self::$instance === null) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    public function authorize($requiredRole = 'admin')
    {
        $user = $this->authentication->user();
        
        if (!$user) {
            throw new AuthorizationException('User not authenticated');
        }
        
        if ($requiredRole === 'super_admin' && $user['role'] !== 'super_admin') {
            throw new AuthorizationException('Insufficient permissions. Super admin access required.');
        }
        
        return true;
    }

    public function hasRole($role)
    {
        $user = $this->authentication->user();
        
        if (!$user) {
            return false;
        }
        
        if ($role === 'admin') {
            // Both admin and super_admin have 'admin' permissions
            return in_array($user['role'], ['admin', 'super_admin']);
        }
        
        return $user['role'] === $role;
    }

    public function isSuperAdmin()
    {
        return $this->hasRole('super_admin');
    }

    public function isAdmin()
    {
        return $this->hasRole('admin');
    }
}
