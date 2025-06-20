CREATE TABLE IF NOT EXISTS `activity_logs` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) DEFAULT NULL,
  `module` varchar(50) NOT NULL,
  `action` varchar(50) NOT NULL,
  `route` varchar(255) DEFAULT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` varchar(255) DEFAULT NULL,
  `request_data` text DEFAULT NULL,
  `response_code` int(11) DEFAULT NULL,
  `execution_time` float DEFAULT NULL,
  `data` text DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  KEY `module` (`module`),
  KEY `action` (`action`),
  KEY `created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


-- Add is_admin column to activity_logs table
ALTER TABLE `activity_logs` 
ADD COLUMN `is_admin` TINYINT(1) NOT NULL DEFAULT 0 AFTER `user_id`;

-- Add index for better performance
ALTER TABLE `activity_logs` 
ADD INDEX `idx_is_admin` (`is_admin`);

-- Add composite index for user_id and is_admin
ALTER TABLE `activity_logs` 
ADD INDEX `idx_user_admin` (`user_id`, `is_admin`);

-- Update existing records to set is_admin based on route patterns
-- Admin routes (not starting with /api/public)
UPDATE `activity_logs` 
SET `is_admin` = 1 
WHERE `route` NOT LIKE '/api/public%' 
AND `route` IS NOT NULL 
AND `route` != '';

-- Public/User routes (starting with /api/public)
UPDATE `activity_logs` 
SET `is_admin` = 0 
WHERE `route` LIKE '/api/public%';
