CREATE TABLE `categories` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(255) NOT NULL,
  `slug` VARCHAR(255) DEFAULT NULL,
  `description` TEXT DEFAULT NULL,
  `image` VARCHAR(255) DEFAULT NULL,
  `meta_title` VARCHAR(255) DEFAULT NULL,
  `meta_description` TEXT DEFAULT NULL,
  `meta_keywords` TEXT DEFAULT NULL,
  `status` ENUM('active', 'inactive') DEFAULT 'active',
  `display_order` INT(11) DEFAULT '0',
  `created_by` INT(11) DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` TIMESTAMP NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `created_by` (`created_by`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


ALTER TABLE `categories` 
ADD COLUMN `updated_by` INT(11) DEFAULT NULL AFTER `updated_at`,
ADD COLUMN `deleted_by` INT(11) DEFAULT NULL AFTER `deleted_at`;

ALTER TABLE `categories` 
ADD COLUMN `is_takeaway` TINYINT(1) NOT NULL DEFAULT 0 COMMENT '1 if takeaway, 0 if not' AFTER `display_order`;