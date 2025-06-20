<?php

namespace App\Features\ActivityTracking\Utils;

use App\Core\Database;
use Exception;

class SchemaSetup
{
    private $database;

    public function __construct()
    {
        $this->database = Database::getInstance();
    }

    public function ensureActivityLogsTableExists()
    {
        try {
            // Check if table exists
            $checkSql = "SHOW TABLES LIKE 'activity_logs'";
            $tableExists = $this->database->fetch($checkSql);
            
            if (!$tableExists) {
                // Create the table
                $createTableSql = "
                CREATE TABLE `activity_logs` (
                  `id` int(11) NOT NULL AUTO_INCREMENT,
                  `user_id` int(11) DEFAULT NULL,
                  `module` varchar(50) NOT NULL,
                  `action` varchar(50) NOT NULL,
                  `route` varchar(255) NOT NULL,
                  `ip_address` varchar(45) DEFAULT NULL,
                  `user_agent` varchar(255) DEFAULT NULL,
                  `request_data` text DEFAULT NULL,
                  `response_code` int(11) DEFAULT NULL,
                  `execution_time` float DEFAULT NULL,
                  `data` text DEFAULT NULL,
                  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
                  PRIMARY KEY (`id`),
                  KEY `user_id` (`user_id`),
                  KEY `module` (`module`),
                  KEY `action` (`action`),
                  KEY `created_at` (`created_at`)
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
                ";
                
                $this->database->query($createTableSql);
                error_log("Created activity_logs table");
                
                return true;
            }
            
            return false;
        } catch (Exception $e) {
            error_log("Error ensuring activity_logs table exists: " . $e->getMessage());
            return false;
        }
    }
}
