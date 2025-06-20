-- Simple Featured Items Table (No Foreign Keys)
CREATE TABLE featured_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    entity_id INT NOT NULL COMMENT 'ID of the product or category',
    display_type ENUM('featured_product', 'featured_category', 'quick_pick') NOT NULL COMMENT 'Type of featured display',
    display_order INT NOT NULL DEFAULT 0 COMMENT 'Order in which to display the item',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by INT,
    updated_by INT,
    INDEX idx_display_type (display_type, display_order)
);


-- Drop any existing constraint first (if it exists)
ALTER TABLE featured_items 
DROP INDEX IF EXISTS unique_entity;

-- Add the correct unique constraint on the combination of entity_id AND display_type
ALTER TABLE featured_items 
ADD CONSTRAINT unique_entity_display_type UNIQUE (entity_id, display_type);
