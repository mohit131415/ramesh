-- Coupons table - stores all coupon information
CREATE TABLE coupons (
    id INT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(50) NOT NULL UNIQUE COMMENT 'Unique coupon code',
    name VARCHAR(100) NOT NULL COMMENT 'Descriptive name for the coupon',
    description TEXT COMMENT 'Detailed description of the coupon',
    discount_type ENUM('percentage', 'fixed_amount') NOT NULL COMMENT 'Type of discount',
    discount_value DECIMAL(10, 2) NOT NULL COMMENT 'Value of the discount (percentage or fixed amount)',
    minimum_order_value DECIMAL(10, 2) DEFAULT 0 COMMENT 'Minimum order value required to use the coupon',
    maximum_discount_amount DECIMAL(10, 2) DEFAULT NULL COMMENT 'Maximum discount amount for percentage discounts',
    start_date DATETIME NOT NULL COMMENT 'When the coupon becomes valid',
    end_date DATETIME DEFAULT NULL COMMENT 'When the coupon expires (NULL for never)',
    usage_limit INT DEFAULT NULL COMMENT 'Maximum number of times this coupon can be used in total',
    is_active BOOLEAN DEFAULT TRUE COMMENT 'Whether the coupon is currently active',
    created_by INT DEFAULT NULL COMMENT 'Admin who created the coupon',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL DEFAULT NULL COMMENT 'Soft delete timestamp'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


ALTER TABLE coupons 
ADD COLUMN per_user_limit INT DEFAULT NULL COMMENT 'Maximum times a single user can use this coupon' 
AFTER usage_limit;



-- Indexes for better performance
CREATE INDEX idx_coupons_code ON coupons(code);
CREATE INDEX idx_coupons_dates ON coupons(start_date, end_date);
CREATE INDEX idx_coupons_active ON coupons(is_active);
CREATE INDEX idx_coupon_usage_dates ON coupon_usage(used_at);

-- Sample data for testing
INSERT INTO coupons (code, name, description, discount_type, discount_value, minimum_order_value, maximum_discount_amount, start_date, end_date, usage_limit, is_active)
VALUES 
('WELCOME10', 'Welcome Discount', '10% off your order', 'percentage', 10.00, 100.00, 200.00, NOW(), DATE_ADD(NOW(), INTERVAL 30 DAY), 100, TRUE),
('FLAT50', 'Flat ₹50 Off', '₹50 off on orders above ₹500', 'fixed_amount', 50.00, 500.00, NULL, NOW(), DATE_ADD(NOW(), INTERVAL 15 DAY), 50, TRUE),
('DIWALI25', 'Diwali Special', '25% off on all orders with maximum discount of ₹200', 'percentage', 25.00, 300.00, 200.00, NOW(), DATE_ADD(NOW(), INTERVAL 7 DAY), 200, TRUE);




-- Coupon usage tracking

CREATE TABLE coupon_usage (
    id INT AUTO_INCREMENT PRIMARY KEY,
    coupon_id INT NOT NULL,
    order_id VARCHAR(50) NOT NULL COMMENT 'Order where the coupon was applied',
    user_id INT DEFAULT NULL COMMENT 'User who used the coupon (if logged in)',
    discount_amount DECIMAL(10, 2) NOT NULL COMMENT 'Actual discount amount applied',
    used_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (coupon_id) REFERENCES coupons(id) ON DELETE CASCADE,
    UNIQUE KEY (order_id) COMMENT 'Only one coupon per order'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;