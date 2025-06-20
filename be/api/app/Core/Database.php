<?php

namespace App\Core;

use PDO;
use Exception;
use PDOException;

class Database
{
    private static $instance = null;
    private $connection = null;
    private $isConnected = false;
    private $lastError = null;
    private $lastStatement = null;

    private function __construct()
    {
        try {
            $this->connect();
            $this->isConnected = true;
        } catch (PDOException $e) {
            $this->lastError = $e->getMessage();
            error_log("Database connection error: " . $e->getMessage());
            // Don't throw here - we'll check isConnected before operations
        }
    }

    public static function getInstance()
    {
        if (self::$instance === null) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    private function connect()
    {
        $config = config('database.connections.' . config('database.default'));
        
        $dsn = $config['driver'] . ':host=' . $config['host'] . ';port=' . $config['port'] . ';dbname=' . $config['database'];
        
        $this->connection = new PDO(
            $dsn,
            $config['username'],
            $config['password'],
            $config['options'] ?? []
        );
    }

    public function reconnect()
    {
        $this->connection = null;
        try {
            $this->connect();
            $this->isConnected = true;
            $this->lastError = null;
            return true;
        } catch (PDOException $e) {
            $this->lastError = $e->getMessage();
            $this->isConnected = false;
            error_log("Database reconnection error: " . $e->getMessage());
            return false;
        }
    }

    public function getConnection()
    {
        if (!$this->isConnected) {
            $this->reconnect();
        }
        return $this->connection;
    }

    public function isConnected()
    {
        return $this->isConnected;
    }

    public function getLastError()
    {
        return $this->lastError;
    }

    public function query($sql, $params = [])
    {
        if (!$this->isConnected) {
            if (!$this->reconnect()) {
                throw new Exception("Database connection error: " . $this->lastError);
            }
        }
        
        try {
            // Debug log
            error_log("SQL Query: " . $sql);
            if (!empty($params)) {
                error_log("Params: " . json_encode($params));
            }
            
            $statement = $this->connection->prepare($sql);
            $this->lastStatement = $statement; // Store the last statement
            
            if (!$statement) {
                $errorInfo = $this->connection->errorInfo();
                throw new Exception("Prepare statement failed: " . $errorInfo[2]);
            }
            
            // If no parameters, just execute the statement
            if (empty($params)) {
                $statement->execute();
                return $statement;
            }
            
            // Bind parameters correctly
            foreach ($params as $key => $value) {
                $paramName = is_int($key) ? $key + 1 : $key;
                $paramType = PDO::PARAM_STR;
                
                if (is_int($value)) {
                    $paramType = PDO::PARAM_INT;
                } elseif (is_bool($value)) {
                    $paramType = PDO::PARAM_BOOL;
                } elseif (is_null($value)) {
                    $paramType = PDO::PARAM_NULL;
                } elseif (is_array($value)) {
                    // Convert array to JSON string
                    $value = json_encode($value);
                }
                
                $statement->bindValue($paramName, $value, $paramType);
            }
            
            $statement->execute();
            return $statement;
        } catch (PDOException $e) {
            error_log("Database query error: " . $e->getMessage() . " | SQL: " . $sql);
            throw new Exception("Database query error: " . $e->getMessage());
        }
    }

    public function fetch($sql, $params = [], $fetchMode = PDO::FETCH_ASSOC)
    {
        $statement = $this->query($sql, $params);
        return $statement->fetch($fetchMode);
    }

    public function fetchAll($sql, $params = [], $fetchMode = PDO::FETCH_ASSOC)
    {
        $statement = $this->query($sql, $params);
        return $statement->fetchAll($fetchMode);
    }

    public function insert($table, $data)
    {
        if (empty($data)) {
            throw new Exception("No data provided for insert operation");
        }
        
        $columns = array_keys($data);
        $placeholders = [];
        $values = [];
        
        foreach ($columns as $column) {
            $placeholders[] = ':' . $column;
            $values[':' . $column] = $data[$column];
        }
        
        $sql = "INSERT INTO " . $table . " (" . implode(', ', $columns) . ") 
                VALUES (" . implode(', ', $placeholders) . ")";
        
        // Debug log
        error_log("Insert SQL: " . $sql);
        error_log("Insert values: " . json_encode($values));
        
        $this->query($sql, $values);
        return $this->connection->lastInsertId();
    }

    public function update($table, $data, $where, $whereParams = [])
    {
        if (empty($data)) {
            throw new Exception("No data provided for update operation");
        }
        
        $setParts = [];
        $params = [];
        
        foreach ($data as $column => $value) {
            // Handle array values by converting to JSON
            if (is_array($value)) {
                $value = json_encode($value);
            }
            
            $setParts[] = $column . ' = :set_' . $column;
            $params[':set_' . $column] = $value;
        }
        
        // Convert where condition to string if it's an array
        if (is_array($where)) {
            $whereParts = [];
            foreach ($where as $column => $value) {
                $whereParts[] = $column . ' = :where_' . $column;
                $params[':where_' . $column] = $value;
            }
            $where = implode(' AND ', $whereParts);
        } else {
            // Merge where parameters with set parameters, ensuring unique parameter names
            foreach ($whereParams as $key => $value) {
                // Make sure the key has a colon prefix
                $paramKey = (strpos($key, ':') === 0) ? $key : ':' . $key;
                $params[$paramKey] = $value;
            }
        }
        
        $sql = "UPDATE " . $table . " SET " . implode(', ', $setParts) . " WHERE " . $where;
        
        // Debug log
        error_log("Update SQL: " . $sql);
        error_log("Update params: " . json_encode($params));
        
        $statement = $this->query($sql, $params);
        return $statement->rowCount();
    }

    public function delete($table, $where, $params = [])
    {
        // Convert where condition to string if it's an array
        if (is_array($where)) {
            $whereParts = [];
            foreach ($where as $column => $value) {
                $whereParts[] = $column . ' = :' . $column;
                $params[':' . $column] = $value;
            }
            $where = implode(' AND ', $whereParts);
        }
        
        $sql = "DELETE FROM " . $table . " WHERE " . $where;
        
        // Debug log
        error_log("Delete SQL: " . $sql);
        error_log("Delete params: " . json_encode($params));
        
        $statement = $this->query($sql, $params);
        return $statement->rowCount();
    }

    public function beginTransaction()
    {
        return $this->connection->beginTransaction();
    }

    public function commit()
    {
        return $this->connection->commit();
    }

    public function rollback()
    {
        return $this->connection->rollBack();
    }

    /**
     * Get the last executed statement
     *
     * @return \PDOStatement|null The last executed statement
     */
    public function getLastStatement()
    {
        return $this->lastStatement ?? null;
    }
}
