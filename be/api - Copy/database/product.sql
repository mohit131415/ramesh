CREATE TABLE IF NOT EXISTS `products` (
    `id` INT(11) NOT NULL AUTO_INCREMENT,
    `category_id` INT(11) NOT NULL,
    `subcategory_id` INT(11) NOT NULL,
    `name` VARCHAR(255) NOT NULL,
    `slug` VARCHAR(255) NOT NULL,
    `description` TEXT,
    `short_description` VARCHAR(500),
    `hsn_code` VARCHAR(20) COMMENT 'Harmonized System Nomenclature code for tax classification',
    `tax_rate` DECIMAL(5, 2) DEFAULT 0.00 COMMENT 'Tax rate percentage',
    `cgst_rate` DECIMAL(5, 2) DEFAULT 0.00 COMMENT 'Central GST rate',
    `sgst_rate` DECIMAL(5, 2) DEFAULT 0.00 COMMENT 'State GST rate',
    `igst_rate` DECIMAL(5, 2) DEFAULT 0.00 COMMENT 'Integrated GST rate',
    `status` ENUM('active', 'inactive', 'archived') NOT NULL DEFAULT 'inactive' COMMENT 'Product availability status',
    `display_order` INT(11) NOT NULL DEFAULT 0 COMMENT 'Order for display in listings',
    `shelf_life` VARCHAR(100) COMMENT 'Product shelf life information',
    `ingredients` TEXT COMMENT 'JSON array of ingredients',
    `nutritional_info` TEXT COMMENT 'JSON object with nutritional values',
    `storage_instructions` TEXT COMMENT 'How to store the product',
    `is_vegetarian` TINYINT(1) DEFAULT NULL COMMENT '1 for vegetarian, 0 for non-vegetarian, NULL if not applicable',
    `attributes` TEXT COMMENT 'JSON object with additional attributes',
    `meta_title` VARCHAR(255) COMMENT 'SEO meta title',
    `meta_description` TEXT COMMENT 'SEO meta description',
    `meta_keywords` TEXT COMMENT 'SEO meta keywords',
    `created_by` INT(11) COMMENT 'Admin who created the product',
    `updated_by` INT(11) COMMENT 'Admin who last updated the product',
    `deleted_by` INT(11) COMMENT 'Admin who deleted the product',
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
    `deleted_at` TIMESTAMP NULL DEFAULT NULL,
    PRIMARY KEY (`id`),
    UNIQUE KEY `products_slug_unique` (`slug`),
    KEY `products_category_id_index` (`category_id`),
    KEY `products_subcategory_id_index` (`subcategory_id`),
    KEY `products_created_by_index` (`created_by`),
    KEY `products_updated_by_index` (`updated_by`),
    KEY `products_deleted_by_index` (`deleted_by`),
    KEY `products_status_index` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;



ALTER TABLE `products` 
ADD COLUMN `product_type` ENUM('global', 'local', 'takeaway') NOT NULL DEFAULT 'global' COMMENT 'Product availability type: global (available everywhere), local (location-specific), takeaway (takeaway only)' AFTER `display_order`;




        CREATE TABLE IF NOT EXISTS `product_variants` (
    `id` INT(11) NOT NULL AUTO_INCREMENT,
    `product_id` INT(11) NOT NULL,
    `variant_name` VARCHAR(255) NOT NULL COMMENT 'Variant name (e.g., "500g", "1kg", "Small", "Red")',
    `sku` VARCHAR(100) COMMENT 'Stock Keeping Unit - unique variant identifier',
    `price` DECIMAL(10, 2) NOT NULL COMMENT 'Regular price of this variant',
    `sale_price` DECIMAL(10, 2) COMMENT 'Discounted price if on sale',
    `discount_percentage` DECIMAL(5, 2) COMMENT 'Percentage discount applied',
    `weight` DECIMAL(10, 3) COMMENT 'Weight in kg',
    `weight_unit` ENUM('g', 'kg', 'mg', 'lb', 'oz') DEFAULT 'g' COMMENT 'Unit of weight measurement',
    `dimensions` JSON COMMENT 'JSON object with length, width, height in cm',
    `status` ENUM('active', 'inactive', 'archived') NOT NULL DEFAULT 'inactive' COMMENT 'Variant availability status',
    `min_order_quantity` INT(11) DEFAULT 1 COMMENT 'Minimum quantity that can be ordered',
    `max_order_quantity` INT(11) COMMENT 'Maximum quantity that can be ordered',
    `display_order` INT(11) NOT NULL DEFAULT 0 COMMENT 'Order for display in listings',
    `created_by` INT(11) COMMENT 'Admin who created the product variant',
    `updated_by` INT(11) COMMENT 'Admin who last updated the product variant',
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `product_variants_product_id_variant_name_unique` (`product_id`, `variant_name`),
    UNIQUE KEY `product_variants_sku_unique` (`sku`),
    KEY `product_variants_product_id_index` (`product_id`),
    KEY `product_variants_status_index` (`status`),
    KEY `product_variants_display_order_index` (`display_order`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `tags` (
    `id` INT(11) NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(100) NOT NULL,
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `tags_name_unique` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `product_tags` (
    `product_id` INT(11) NOT NULL,
    `tag_id` INT(11) NOT NULL,
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`product_id`, `tag_id`),
    KEY `product_tags_product_id_index` (`product_id`),
    KEY `product_tags_tag_id_index` (`tag_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `product_images` (
    `id` INT(11) NOT NULL AUTO_INCREMENT,
    `product_id` INT(11) NOT NULL,
    `image_path` VARCHAR(255) NOT NULL COMMENT 'Path to the image file',
    `is_primary` TINYINT(1) NOT NULL DEFAULT 0 COMMENT 'Whether this is the main product image',
    `display_order` INT(11) NOT NULL DEFAULT 0 COMMENT 'Order for display in product gallery',
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    KEY `product_images_product_id_index` (`product_id`),
    KEY `product_images_is_primary_index` (`is_primary`),
    KEY `product_images_display_order_index` (`display_order`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;