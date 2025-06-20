CREATE TABLE carts (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    
    -- User and cart status
    user_id BIGINT UNSIGNED NOT NULL,
    status ENUM('active', 'merged', 'abandoned', 'converted') NOT NULL DEFAULT 'active',

    -- Coupon/discount related fields (optional)
    coupon_id BIGINT UNSIGNED NULL,
    coupon_code VARCHAR(50) NULL,
    discount_type ENUM('percentage', 'fixed_amount', 'free_shipping') NULL,
    discount_value DECIMAL(10, 2) NULL,     -- % or fixed amount
    discount_amount DECIMAL(10, 2) NULL,    -- Final calculated discount

    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NULL,

    -- Indexes
    INDEX idx_user_id (user_id),
    INDEX idx_status (status),

    -- Foreign keys
    CONSTRAINT fk_carts_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);




ALTER TABLE carts
ADD COLUMN base_amount DECIMAL(10, 2) DEFAULT 0.00 COMMENT 'Total base amount before taxes',
ADD COLUMN gst_amount DECIMAL(10, 2) DEFAULT 0.00 COMMENT 'Total GST/tax amount',
ADD COLUMN subtotal DECIMAL(10, 2) DEFAULT 0.00 COMMENT 'Subtotal (base_amount + gst_amount)',
ADD COLUMN roundoff DECIMAL(10, 2) DEFAULT 0.00 COMMENT 'Roundoff amount',
ADD COLUMN final_total DECIMAL(10, 2) DEFAULT 0.00 COMMENT 'Final total after discount and roundoff';


-- Cart items table to store products in the cart
CREATE TABLE cart_items (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    cart_id BIGINT UNSIGNED NOT NULL,
    product_id BIGINT UNSIGNED NOT NULL,
    variant_id BIGINT UNSIGNED NOT NULL,
    quantity INT UNSIGNED NOT NULL DEFAULT 1,
    
    -- Price details
    price_with_tax DECIMAL(10, 2) NOT NULL, -- Price including GST
    tax_rate DECIMAL(5, 2) NOT NULL, -- GST percentage (e.g., 18.00 for 18%)
    
    -- Calculated fields
    base_price DECIMAL(10, 2) GENERATED ALWAYS AS (
        ROUND(price_with_tax / (1 + (tax_rate / 100)), 2)
    ) STORED,
    igst_amount DECIMAL(10, 2) GENERATED ALWAYS AS (
        ROUND(price_with_tax - (price_with_tax / (1 + (tax_rate / 100))), 2)
    ) STORED,
    line_total DECIMAL(10, 2) GENERATED ALWAYS AS (
        ROUND(price_with_tax * quantity)
    ) STORED,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Ensure unique product+variant per cart
    UNIQUE KEY unique_product_in_cart (cart_id, product_id, variant_id),
    
    -- Foreign key constraints
    CONSTRAINT fk_cart_items_cart FOREIGN KEY (cart_id) REFERENCES carts(id) ON DELETE CASCADE,
    
    -- Indexes
    INDEX idx_product_id (product_id),
    INDEX idx_variant_id (variant_id)
);