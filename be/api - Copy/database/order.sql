-- 1. ORDERS TABLE - Main order information
CREATE TABLE orders (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    
    -- Order identification
    order_number VARCHAR(50) NOT NULL UNIQUE COMMENT 'Human-readable order number (e.g., ORD-ABC12345)',
    
    -- User information
    user_id BIGINT UNSIGNED NOT NULL,
    
    -- Order status and tracking
    status ENUM('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded') NOT NULL DEFAULT 'pending',
    payment_status ENUM('pending', 'paid', 'failed', 'refunded', 'partially_refunded') NOT NULL DEFAULT 'pending',
    
    -- Financial totals (matching your cart structure)
    base_amount DECIMAL(10, 2) NOT NULL DEFAULT 0.00 COMMENT 'Total base amount before taxes',
    subtotal DECIMAL(10, 2) NOT NULL DEFAULT 0.00 COMMENT 'Subtotal (base_amount + gst_amount)',
    
    -- Discounts
    product_discount_amount DECIMAL(10, 2) NOT NULL DEFAULT 0.00 COMMENT 'Total product discounts',
    coupon_discount_amount DECIMAL(10, 2) NOT NULL DEFAULT 0.00 COMMENT 'Coupon discount amount',
    total_discount_amount DECIMAL(10, 2) NOT NULL DEFAULT 0.00 COMMENT 'Total of all discounts',
    
    -- Additional charges
    shipping_charges DECIMAL(10, 2) NOT NULL DEFAULT 0.00 COMMENT 'Shipping charges',
    payment_charges DECIMAL(10, 2) NOT NULL DEFAULT 0.00 COMMENT 'Payment processing charges (COD, etc.)',
    
    -- Final amounts
    roundoff DECIMAL(10, 2) NOT NULL DEFAULT 0.00 COMMENT 'Roundoff amount',
    final_total DECIMAL(10, 2) NOT NULL DEFAULT 0.00 COMMENT 'Final payable amount',
    
    -- Coupon information (if applied)
    coupon_id BIGINT UNSIGNED NULL,
    
    -- Tax breakdown for compliance
    tax_type ENUM('igst', 'cgst_sgst') NOT NULL DEFAULT 'igst',
    igst_amount DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    cgst_amount DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    sgst_amount DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    
    -- Order metadata
    item_count INT UNSIGNED NOT NULL DEFAULT 0 COMMENT 'Total number of different items',
    total_quantity INT UNSIGNED NOT NULL DEFAULT 0 COMMENT 'Total quantity of all items',
    
    -- Important dates
    order_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    confirmed_at TIMESTAMP NULL,
    shipped_at TIMESTAMP NULL,
    delivered_at TIMESTAMP NULL,
    cancelled_at TIMESTAMP NULL,
    
    -- Admin tracking
    created_by BIGINT UNSIGNED NULL COMMENT 'Admin who created/confirmed the order',
    updated_by BIGINT UNSIGNED NULL COMMENT 'Admin who last updated the order',
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Indexes for performance
    INDEX idx_order_number (order_number),
    INDEX idx_user_id (user_id),
    INDEX idx_status (status),
    INDEX idx_payment_status (payment_status),
    INDEX idx_order_date (order_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;



ALTER TABLE orders ADD COLUMN original_price DECIMAL(10,2) NOT NULL DEFAULT 0.00 AFTER payment_status;




-- 2. ORDER_ITEMS TABLE - Individual items in each order
CREATE TABLE order_items (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    
    -- Order reference
    order_id BIGINT UNSIGNED NOT NULL,
    
    -- Product information (snapshot at time of order)
    product_id BIGINT UNSIGNED NOT NULL,
    variant_id BIGINT UNSIGNED NOT NULL,
    product_name VARCHAR(255) NOT NULL COMMENT 'Product name at time of order',
    variant_name VARCHAR(255) NOT NULL COMMENT 'Variant name at time of order',
    product_sku VARCHAR(100) NULL COMMENT 'SKU at time of order',
    
    -- Quantity and pricing (snapshot at time of order)
    quantity INT UNSIGNED NOT NULL,
    original_price DECIMAL(10, 2) NOT NULL COMMENT 'MRP at time of order',
    selling_price DECIMAL(10, 2) NOT NULL COMMENT 'Actual selling price (after product discount)',
    discount_amount DECIMAL(10, 2) NOT NULL DEFAULT 0.00 COMMENT 'Per unit discount amount',
    
    -- Tax information (snapshot at time of order)
    tax_rate DECIMAL(5, 2) NOT NULL COMMENT 'Tax rate applied',
    base_price DECIMAL(10, 2) NOT NULL COMMENT 'Price before tax per unit',
    tax_amount DECIMAL(10, 2) NOT NULL COMMENT 'Tax amount per unit',
    
    -- Line totals
    line_base_amount DECIMAL(10, 2) NOT NULL COMMENT 'Total base amount for this line',
    line_tax_amount DECIMAL(10, 2) NOT NULL COMMENT 'Total tax amount for this line',
    line_discount_amount DECIMAL(10, 2) NOT NULL DEFAULT 0.00 COMMENT 'Total discount for this line',
    line_total DECIMAL(10, 2) NOT NULL COMMENT 'Final line total',
    
    -- Product metadata at time of order
    product_image VARCHAR(500) NULL COMMENT 'Primary product image path',
    product_weight DECIMAL(10, 3) NULL COMMENT 'Product weight',
    product_hsn_code VARCHAR(20) NULL COMMENT 'HSN code for tax compliance',
    
    -- Item status (for partial fulfillment)
    status ENUM('pending', 'confirmed', 'packed', 'shipped', 'delivered', 'cancelled', 'returned') NOT NULL DEFAULT 'pending',
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Indexes
    INDEX idx_order_id (order_id),
    INDEX idx_product_id (product_id),
    INDEX idx_variant_id (variant_id),
    INDEX idx_status (status)
    
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. PAYMENTS TABLE - Payment information for orders
CREATE TABLE payments (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    
    -- Order reference
    order_id BIGINT UNSIGNED NOT NULL,
    
    -- Payment identification
    payment_id VARCHAR(100) NULL COMMENT 'External payment gateway transaction ID',
    payment_method ENUM('cod', 'online') NOT NULL,
    payment_gateway VARCHAR(50) NULL COMMENT 'Payment gateway used (razorpay, payu, etc.)',
    
    -- Payment amounts
    amount DECIMAL(10, 2) NOT NULL COMMENT 'Payment amount',
    gateway_charges DECIMAL(10, 2) NOT NULL DEFAULT 0.00 COMMENT 'Gateway processing charges',
    
    -- Payment status and details
    status ENUM('pending', 'processing', 'success', 'failed', 'cancelled', 'refunded') NOT NULL DEFAULT 'pending',
    gateway_response TEXT NULL COMMENT 'JSON response from payment gateway',
    failure_reason VARCHAR(500) NULL COMMENT 'Reason for payment failure',
    
    -- Payment dates
    initiated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP NULL,
    failed_at TIMESTAMP NULL,
    
    -- Refund information
    refund_amount DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    refund_reason VARCHAR(500) NULL,
    refunded_at TIMESTAMP NULL,
    refund_reference VARCHAR(100) NULL,
    
    -- Additional payment details
    payment_details JSON NULL COMMENT 'Additional payment gateway specific details',
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Indexes
    INDEX idx_order_id (order_id),
    INDEX idx_payment_id (payment_id),
    INDEX idx_payment_method (payment_method),
    INDEX idx_status (status),
    INDEX idx_initiated_at (initiated_at)
    
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. ORDER_SHIPPING TABLE - Shipping and delivery information
CREATE TABLE order_shipping (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    
    -- Order reference
    order_id BIGINT UNSIGNED NOT NULL,
    
    -- Shipping address (snapshot at time of order)
    contact_name VARCHAR(150) NOT NULL,
    contact_phone VARCHAR(20) NOT NULL,
    address_line1 VARCHAR(255) NOT NULL,
    address_line2 VARCHAR(255) NULL,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    postal_code VARCHAR(20) NOT NULL,
    country VARCHAR(100) NOT NULL DEFAULT 'India',
    address_type ENUM('home', 'work', 'other') DEFAULT 'other',
    
    -- Shipping details
    shipping_method VARCHAR(100) NULL COMMENT 'Standard, Express, etc.',
    shipping_charges DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    is_free_shipping BOOLEAN NOT NULL DEFAULT FALSE,
    shipping_savings DECIMAL(10, 2) NOT NULL DEFAULT 0.00 COMMENT 'Amount saved on shipping',
    
    -- Delivery tracking
    tracking_number VARCHAR(100) NULL,
    courier_partner VARCHAR(100) NULL COMMENT 'Delivery partner name',
    estimated_delivery_date DATE NULL,
    actual_delivery_date DATE NULL,
    delivery_instructions TEXT NULL,
    
    -- Shipping status
    status ENUM('pending', 'packed', 'shipped', 'out_for_delivery', 'delivered', 'failed', 'returned') NOT NULL DEFAULT 'pending',
    
    -- Important shipping dates
    packed_at TIMESTAMP NULL,
    shipped_at TIMESTAMP NULL,
    out_for_delivery_at TIMESTAMP NULL,
    delivered_at TIMESTAMP NULL,
    failed_at TIMESTAMP NULL,
    returned_at TIMESTAMP NULL,
    
    -- Delivery confirmation
    delivered_to VARCHAR(150) NULL COMMENT 'Name of person who received the order',
    delivery_notes TEXT NULL COMMENT 'Special delivery notes or instructions',
    delivery_image VARCHAR(500) NULL COMMENT 'Proof of delivery image',
    
    -- Return/exchange information
    return_reason VARCHAR(500) NULL,
    return_status ENUM('not_applicable', 'requested', 'approved', 'picked_up', 'completed', 'rejected') DEFAULT 'not_applicable',
    return_tracking_number VARCHAR(100) NULL,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Indexes
    INDEX idx_order_id (order_id),
    INDEX idx_tracking_number (tracking_number),
    INDEX idx_status (status),
    INDEX idx_postal_code (postal_code),
    INDEX idx_estimated_delivery_date (estimated_delivery_date),
    INDEX idx_delivered_at (delivered_at)

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;











-- Update orders table with new status enum values
ALTER TABLE orders 
MODIFY COLUMN status ENUM('placed', 'preparing', 'prepared', 'shipped', 'delivered', 'cancelled', 'refunded', 'returned') 
NOT NULL DEFAULT 'placed';

-- Add tracking URL column to order_shipping table
ALTER TABLE order_shipping
ADD COLUMN tracking_url VARCHAR(255) NULL AFTER tracking_number;

-- Update order_items table with matching status values
ALTER TABLE order_items
MODIFY COLUMN status ENUM('placed', 'preparing', 'prepared', 'shipped', 'delivered', 'cancelled', 'refunded', ' ') 
NOT NULL DEFAULT 'placed';

-- Add payment_received column to payments table for COD orders
ALTER TABLE payments
ADD COLUMN payment_received BOOLEAN NOT NULL DEFAULT FALSE AFTER status,
ADD COLUMN payment_received_at TIMESTAMP NULL AFTER payment_received;

-- Create order_status_history table to track status changes
CREATE TABLE IF NOT EXISTS order_status_history (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    order_id BIGINT UNSIGNED NOT NULL,
    status VARCHAR(50) NOT NULL,
    notes TEXT NULL,
    changed_by BIGINT UNSIGNED NULL,
    is_admin BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_order_id (order_id),
    INDEX idx_status (status),
    INDEX idx_changed_by (changed_by),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- Add return window setting to settings table
INSERT INTO settings (`key`, value) VALUES ('order_return_window_hours', '2') 
ON DUPLICATE KEY UPDATE value = '2';

-- Add other order-related settings
INSERT INTO settings (`key`, value) VALUES ('order_return_enabled', '1') 
ON DUPLICATE KEY UPDATE value = '1';
