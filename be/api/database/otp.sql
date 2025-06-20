CREATE TABLE `otps` (
  `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` bigint(20) UNSIGNED NULL,
  `phone_number` varchar(20) NOT NULL,
  `otp` varchar(6) NOT NULL,
  `type` enum('login', 'register') NOT NULL,
  `is_used` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `expires_at` timestamp NULL DEFAULT NULL,
  `used_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `otps_user_id_foreign` (`user_id`),
  KEY `otps_phone_number_index` (`phone_number`),
  KEY `otps_created_at_index` (`created_at`),
  KEY `otps_expires_at_index` (`expires_at`),
  CONSTRAINT `otps_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;










ALTER TABLE otps 
ADD COLUMN failure_reason VARCHAR(255) NULL AFTER status;
-- Add status column to otps table
ALTER TABLE otps ADD COLUMN status ENUM('valid', 'invalid', 'used') NOT NULL DEFAULT 'valid' AFTER is_used;

-- Update existing records
-- Set status to 'used' for all used OTPs
UPDATE otps SET status = 'used' WHERE is_used = 1;

-- Set status to 'valid' for all unused OTPs that haven't expired
UPDATE otps SET status = 'valid' WHERE is_used = 0 AND expires_at > NOW();

-- Set status to 'invalid' for all unused OTPs that have expired
UPDATE otps SET status = 'invalid' WHERE is_used = 0 AND expires_at <= NOW();
