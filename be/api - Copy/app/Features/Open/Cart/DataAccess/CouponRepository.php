<?php

namespace App\Features\Open\Cart\DataAccess;

use App\Core\Database;
use PDO;
use Exception;

class CouponRepository
{
    private $db;

    public function __construct()
    {
        $this->db = Database::getInstance()->getConnection();
    }

    public function getCouponById(int $id)
    {
        $query = "SELECT * FROM coupons WHERE id = :id AND deleted_at IS NULL";
        $stmt = $this->db->prepare($query);
        $stmt->bindParam(':id', $id, PDO::PARAM_INT);
        $stmt->execute();

        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    public function getCouponByCode(string $code)
    {
        $query = "SELECT * FROM coupons WHERE code = :code AND deleted_at IS NULL";
        $stmt = $this->db->prepare($query);
        $stmt->bindParam(':code', $code);
        $stmt->execute();

        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    public function getActiveCoupons()
    {
        $currentDate = date('Y-m-d H:i:s');
        
        $query = "SELECT * FROM coupons 
                  WHERE is_active = 1 
                  AND deleted_at IS NULL 
                  AND start_date <= :current_date1 
                  AND (end_date IS NULL OR end_date >= :current_date2)
                  ORDER BY created_at DESC";
        
        $stmt = $this->db->prepare($query);
        $stmt->bindValue(':current_date1', $currentDate);
        $stmt->bindValue(':current_date2', $currentDate);
        $stmt->execute();
        
        $coupons = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        // Filter out coupons that have reached their usage limit
        $activeCoupons = [];
        foreach ($coupons as $coupon) {
            if ($coupon['usage_limit']) {
                $usageCount = $this->getCouponUsageCount($coupon['id']);
                if ($usageCount < $coupon['usage_limit']) {
                    $activeCoupons[] = $coupon;
                } else {
                    // Auto-deactivate coupon if usage limit reached
                    $this->deactivateCoupon($coupon['id'], 'Usage limit reached');
                }
            } else {
                $activeCoupons[] = $coupon;
            }
        }
        
        return $activeCoupons;
    }

    public function createCoupon(array $data)
    {
        $query = "INSERT INTO coupons (code, name, description, discount_type, discount_value, minimum_order_value, maximum_discount_amount, start_date, end_date, is_active, usage_limit, created_at, updated_at) 
                  VALUES (:code, :name, :description, :discount_type, :discount_value, :minimum_order_value, :maximum_discount_amount, :start_date, :end_date, :is_active, :usage_limit, NOW(), NOW())";
        
        $stmt = $this->db->prepare($query);
        $stmt->bindParam(':code', $data['code']);
        $stmt->bindParam(':name', $data['name']);
        $stmt->bindParam(':description', $data['description']);
        $stmt->bindParam(':discount_type', $data['discount_type']);
        $stmt->bindParam(':discount_value', $data['discount_value']);
        $stmt->bindParam(':minimum_order_value', $data['minimum_order_value']);
        $stmt->bindParam(':maximum_discount_amount', $data['maximum_discount_amount']);
        $stmt->bindParam(':start_date', $data['start_date']);
        $stmt->bindParam(':end_date', $data['end_date']);
        $stmt->bindParam(':is_active', $data['is_active'], PDO::PARAM_INT);
        $stmt->bindParam(':usage_limit', $data['usage_limit'], PDO::PARAM_INT);
        $stmt->execute();

        return $this->db->lastInsertId();
    }

    public function updateCoupon(int $id, array $data)
    {
        $query = "UPDATE coupons SET 
                  code = :code, 
                  name = :name,
                  description = :description,
                  discount_type = :discount_type, 
                  discount_value = :discount_value, 
                  minimum_order_value = :minimum_order_value,
                  maximum_discount_amount = :maximum_discount_amount,
                  start_date = :start_date, 
                  end_date = :end_date, 
                  is_active = :is_active, 
                  usage_limit = :usage_limit,
                  updated_at = NOW()
                  WHERE id = :id AND deleted_at IS NULL";
                  
        $stmt = $this->db->prepare($query);
        $stmt->bindParam(':id', $id, PDO::PARAM_INT);
        $stmt->bindParam(':code', $data['code']);
        $stmt->bindParam(':name', $data['name']);
        $stmt->bindParam(':description', $data['description']);
        $stmt->bindParam(':discount_type', $data['discount_type']);
        $stmt->bindParam(':discount_value', $data['discount_value']);
        $stmt->bindParam(':minimum_order_value', $data['minimum_order_value']);
        $stmt->bindParam(':maximum_discount_amount', $data['maximum_discount_amount']);
        $stmt->bindParam(':start_date', $data['start_date']);
        $stmt->bindParam(':end_date', $data['end_date']);
        $stmt->bindParam(':is_active', $data['is_active'], PDO::PARAM_INT);
        $stmt->bindParam(':usage_limit', $data['usage_limit'], PDO::PARAM_INT);
        $stmt->execute();

        return $stmt->rowCount();
    }

    public function deleteCoupon(int $id)
    {
        $query = "UPDATE coupons SET deleted_at = NOW() WHERE id = :id";
        $stmt = $this->db->prepare($query);
        $stmt->bindParam(':id', $id, PDO::PARAM_INT);
        $stmt->execute();

        return $stmt->rowCount();
    }

    /**
     * Deactivate a coupon when usage limit is reached
     * 
     * @param int $couponId Coupon ID
     * @param string $reason Reason for deactivation
     * @return bool Success status
     */
    public function deactivateCoupon(int $couponId, string $reason = '')
    {
        try {
            $query = "UPDATE coupons SET is_active = 0, updated_at = NOW() WHERE id = :coupon_id";
            $stmt = $this->db->prepare($query);
            $stmt->bindParam(':coupon_id', $couponId, PDO::PARAM_INT);
            $result = $stmt->execute();
            
            if ($result) {
                error_log("Coupon ID {$couponId} deactivated: {$reason}");
            }
            
            return $result;
        } catch (Exception $e) {
            error_log("Error deactivating coupon {$couponId}: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Check if coupon has reached its total usage limit and deactivate if needed
     * 
     * @param int $couponId Coupon ID
     * @return bool True if coupon is still active, false if deactivated
     */
    public function checkAndUpdateCouponStatus(int $couponId)
    {
        try {
            // Get coupon details
            $coupon = $this->getCouponById($couponId);
            
            if (!$coupon || !$coupon['is_active']) {
                return false;
            }
            
            // Check if coupon has usage limit
            if ($coupon['usage_limit'] && $coupon['usage_limit'] > 0) {
                $currentUsage = $this->getCouponUsageCount($couponId);
                
                // If usage has reached or exceeded limit, deactivate
                if ($currentUsage >= $coupon['usage_limit']) {
                    $this->deactivateCoupon($couponId, "Total usage limit reached: {$currentUsage}/{$coupon['usage_limit']}");
                    return false;
                }
            }
            
            return true;
        } catch (Exception $e) {
            error_log("Error checking coupon status: " . $e->getMessage());
            return false;
        }
    }

    public function getCouponUsageCount(int $couponId)
    {
        $query = "SELECT COUNT(*) FROM coupon_usage WHERE coupon_id = :coupon_id";
        $stmt = $this->db->prepare($query);
        $stmt->bindParam(':coupon_id', $couponId, PDO::PARAM_INT);
        $stmt->execute();

        return (int) $stmt->fetchColumn();
    }

    /**
     * Get number of times a user has used a specific coupon
     * 
     * @param int $couponId Coupon ID
     * @param int $userId User ID
     * @return int Number of times used
     */
    public function getUserCouponUsageCount(int $couponId, int $userId)
    {
        $query = "SELECT COUNT(*) FROM coupon_usage WHERE coupon_id = :coupon_id AND user_id = :user_id";
        $stmt = $this->db->prepare($query);
        $stmt->bindParam(':coupon_id', $couponId, PDO::PARAM_INT);
        $stmt->bindParam(':user_id', $userId, PDO::PARAM_INT);
        $stmt->execute();

        return (int) $stmt->fetchColumn();
    }

    /**
     * Log coupon usage and check if total limit is reached
     * 
     * @param int $couponId Coupon ID
     * @param string $orderId Order ID
     * @param int|null $userId User ID
     * @param float $discountAmount Discount amount applied
     * @return int Usage log ID
     */
    public function logCouponUsage(int $couponId, string $orderId, ?int $userId = null, float $discountAmount = 0)
    {
        try {
            // Start transaction
            $this->db->beginTransaction();
            
            // Log the usage
            $query = "INSERT INTO coupon_usage (coupon_id, order_id, user_id, discount_amount, used_at) 
                      VALUES (:coupon_id, :order_id, :user_id, :discount_amount, NOW())";
                      
            $stmt = $this->db->prepare($query);
            $stmt->bindParam(':coupon_id', $couponId, PDO::PARAM_INT);
            $stmt->bindParam(':order_id', $orderId);
            $stmt->bindParam(':user_id', $userId, PDO::PARAM_INT);
            $stmt->bindParam(':discount_amount', $discountAmount);
            $stmt->execute();
            
            $usageId = $this->db->lastInsertId();
            
            // Check if this usage has reached the total limit
            $coupon = $this->getCouponById($couponId);
            if ($coupon && $coupon['usage_limit'] && $coupon['usage_limit'] > 0) {
                $totalUsage = $this->getCouponUsageCount($couponId);
                
                // If we've reached the limit, deactivate the coupon
                if ($totalUsage >= $coupon['usage_limit']) {
                    $this->deactivateCoupon($couponId, "Total usage limit reached after order {$orderId}: {$totalUsage}/{$coupon['usage_limit']}");
                    error_log("Coupon {$coupon['code']} (ID: {$couponId}) automatically deactivated - usage limit reached");
                }
            }
            
            // Commit transaction
            $this->db->commit();
            
            return $usageId;
        } catch (Exception $e) {
            // Rollback on error
            $this->db->rollback();
            error_log("Error logging coupon usage: " . $e->getMessage());
            throw $e;
        }
    }

    public function isCouponUsedInOrder(int $couponId, string $orderId)
    {
        $query = "SELECT COUNT(*) FROM coupon_usage WHERE coupon_id = :coupon_id AND order_id = :order_id";
        $stmt = $this->db->prepare($query);
        $stmt->bindParam(':coupon_id', $couponId, PDO::PARAM_INT);
        $stmt->bindParam(':order_id', $orderId);
        $stmt->execute();
        
        return $stmt->fetchColumn() > 0;
    }

    /**
     * Get detailed coupon usage statistics
     * 
     * @param int $couponId Coupon ID
     * @return array Usage statistics
     */
    public function getCouponUsageStats(int $couponId): ?array
    {
        try {
            $coupon = $this->getCouponById($couponId);
            if (!$coupon) {
                return null;
            }
            
            $totalUsage = $this->getCouponUsageCount($couponId);
            $usageLimit = $coupon['usage_limit'] ?? 0;
            
            return [
                'coupon_id' => $couponId,
                'coupon_code' => $coupon['code'],
                'total_usage' => $totalUsage,
                'usage_limit' => $usageLimit,
                'remaining_uses' => $usageLimit > 0 ? max(0, $usageLimit - $totalUsage) : null,
                'is_limit_reached' => $usageLimit > 0 && $totalUsage >= $usageLimit,
                'is_active' => (bool) $coupon['is_active']
            ];
        } catch (Exception $e) {
            error_log("Error getting coupon usage stats: " . $e->getMessage());
            return null;
        }
    }
}
