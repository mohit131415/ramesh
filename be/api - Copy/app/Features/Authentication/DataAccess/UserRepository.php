<?php

namespace App\Features\Authentication\DataAccess;

use App\Core\Database;
use App\Shared\Exceptions\NotFoundException;
use Exception;

class UserRepository
{
    private $database;

    public function __construct()
    {
        $this->database = Database::getInstance();
    }

    public function findById($id)
    {
        try {
            $sql = "SELECT * FROM admins WHERE id = :id AND deleted_at IS NULL";
            $user = $this->database->fetch($sql, [':id' => $id]);
            
            if (!$user) {
                throw new NotFoundException('User not found');
            }
            
            return $user;
        } catch (Exception $e) {
            if ($e instanceof NotFoundException) {
                throw $e;
            }
            throw new Exception('Error finding user: ' . $e->getMessage());
        }
    }

    public function findByEmail($email)
    {
        try {
            $sql = "SELECT * FROM admins WHERE email = :email AND deleted_at IS NULL";
            $user = $this->database->fetch($sql, [':email' => $email]);
            
            if (!$user) {
                throw new NotFoundException('User not found');
            }
            
            return $user;
        } catch (Exception $e) {
            if ($e instanceof NotFoundException) {
                throw $e;
            }
            throw new Exception('Error finding user: ' . $e->getMessage());
        }
    }

    public function findByUsername($username)
    {
        try {
            $sql = "SELECT * FROM admins WHERE username = :username AND deleted_at IS NULL";
            $user = $this->database->fetch($sql, [':username' => $username]);
            
            if (!$user) {
                throw new NotFoundException('User not found');
            }
            
            return $user;
        } catch (Exception $e) {
            if ($e instanceof NotFoundException) {
                throw $e;
            }
            throw new Exception('Error finding user: ' . $e->getMessage());
        }
    }

    public function updateLastLogin($userId)
    {
        try {
            $sql = "UPDATE admins SET last_login_at = :last_login_at WHERE id = :id";
            $this->database->query($sql, [
                ':id' => $userId,
                ':last_login_at' => date('Y-m-d H:i:s')
            ]);
            
            return true;
        } catch (Exception $e) {
            throw new Exception('Error updating last login: ' . $e->getMessage());
        }
    }
    
    public function updatePassword($userId, $hashedPassword)
    {
        try {
            $sql = "UPDATE admins SET password = :password, updated_at = :updated_at WHERE id = :id";
            $this->database->query($sql, [
                ':id' => $userId,
                ':password' => $hashedPassword,
                ':updated_at' => date('Y-m-d H:i:s')
            ]);
            
            return true;
        } catch (Exception $e) {
            throw new Exception('Error updating password: ' . $e->getMessage());
        }
    }
}
