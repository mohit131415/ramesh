-- Table for storing application settings including featured item limits
CREATE TABLE settings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    `key` VARCHAR(255) NOT NULL COMMENT 'Setting key/name',
    value TEXT NULL COMMENT 'Setting value'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert default limits for featured items
INSERT INTO settings (`key`, value) VALUES 
('featured_limit_featured_product', '5'),
('featured_limit_featured_category', '5'),
('featured_limit_quick_pick', '15');