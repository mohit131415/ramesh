<?php

namespace App\Features\Coupons\DataAccess;

use App\Core\Database;
use App\Shared\Exceptions\NotFoundException;
use PDO;

class CouponRepository
{
    private $db;

    public function __construct()
    {
        $this->db = Database::getInstance()->getConnection();
    }

    public function getAllCoupons(array $filters = [], int $page = 1, int $limit = 20, string $sortBy = 'created_at', string $sortOrder = 'DESC', bool $includeDeleted = false)
    {
        $offset = ($page - 1) * $limit;
        
        // Base query
        $query = "SELECT * FROM coupons WHERE 1=1";
        $countQuery = "SELECT COUNT(*) FROM coupons WHERE 1=1";
        $params = [];
        
        // Apply filters
        if (isset($filters['search']) && !empty($filters['search'])) {
            $searchTerm = '%' . $filters['search'] . '%';
            $query .= " AND (code LIKE :search_code OR name LIKE :search_name OR description LIKE :search_desc)";
            $countQuery .= " AND (code LIKE :search_code OR name LIKE :search_name OR description LIKE :search_desc)";
            $params[':search_code'] = $searchTerm;
            $params[':search_name'] = $searchTerm;
            $params[':search_desc'] = $searchTerm;
        }
        
        if (isset($filters['is_active'])) {
            $query .= " AND is_active = :is_active";
            $countQuery .= " AND is_active = :is_active";
            $params[':is_active'] = $filters['is_active'] ? 1 : 0;
        }
        
        if (isset($filters['discount_type']) && !empty($filters['discount_type'])) {
            $query .= " AND discount_type = :discount_type";
            $countQuery .= " AND discount_type = :discount_type";
            $params[':discount_type'] = $filters['discount_type'];
        }
        
        if (isset($filters['start_date']) && !empty($filters['start_date'])) {
            $query .= " AND start_date >= :start_date";
            $countQuery .= " AND start_date >= :start_date";
            $params[':start_date'] = $filters['start_date'];
        }
        
        if (isset($filters['end_date']) && !empty($filters['end_date'])) {
            $query .= " AND end_date <= :end_date";
            $countQuery .= " AND end_date <= :end_date";
            $params[':end_date'] = $filters['end_date'];
        }
        
        // Only show non-deleted coupons by default, unless includeDeleted is true
        if (!$includeDeleted) {
            $query .= " AND deleted_at IS NULL";
            $countQuery .= " AND deleted_at IS NULL";
        }
        
        // Add sorting
        $query .= " ORDER BY " . $sortBy . " " . $sortOrder;
        
        // Add pagination
        $query .= " LIMIT :limit OFFSET :offset";
        $params[':limit'] = $limit;
        $params[':offset'] = $offset;
        
        // Execute count query
        $countStmt = $this->db->prepare($countQuery);
        foreach ($params as $key => $value) {
            if ($key !== ':limit' && $key !== ':offset') {
                $countStmt->bindValue($key, $value);
            }
        }
        $countStmt->execute();
        $totalCount = $countStmt->fetchColumn();
        
        // Execute main query
        $stmt = $this->db->prepare($query);
        foreach ($params as $key => $value) {
            $stmt->bindValue($key, $value);
        }
        $stmt->execute();
        $coupons = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        // Calculate pagination info
        $totalPages = ceil($totalCount / $limit);
        
        return [
            'data' => $coupons,
            'pagination' => [
                'total' => $totalCount,
                'per_page' => $limit,
                'current_page' => $page,
                'last_page' => $totalPages,
                'from' => $offset + 1,
                'to' => min($offset + $limit, $totalCount)
            ]
        ];
    }

    public function getCouponById(int $id, bool $includeDeleted = false)
    {
        $query = "SELECT * FROM coupons WHERE id = :id";
        
        if (!$includeDeleted) {
            $query .= " AND deleted_at IS NULL";
        }
        
        $stmt = $this->db->prepare($query);
        $stmt->bindParam(':id', $id, PDO::PARAM_INT);
        $stmt->execute();
        
        $coupon = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if (!$coupon) {
            throw new NotFoundException("Coupon with ID {$id} not found");
        }
        
        return $coupon;
    }

    public function getCouponByCode(string $code)
    {
        $query = "SELECT * FROM coupons WHERE code = :code AND deleted_at IS NULL";
        $stmt = $this->db->prepare($query);
        $stmt->bindParam(':code', $code);
        $stmt->execute();
        
        $coupon = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if (!$coupon) {
            throw new NotFoundException("Coupon with code {$code} not found");
        }
        
        return $coupon;
    }

    public function createCoupon(array $data)
    {
        $query = "INSERT INTO coupons (
            code, 
            name,
            discount_type, 
            discount_value, 
            minimum_order_value, 
            maximum_discount_amount, 
            start_date, 
            end_date, 
            usage_limit, 
            per_user_limit,
            is_active, 
            description,
            created_at,
            updated_at
        ) VALUES (
            :code,
            :name,
            :discount_type, 
            :discount_value, 
            :minimum_order_value, 
            :maximum_discount_amount, 
            :start_date, 
            :end_date, 
            :usage_limit, 
            :per_user_limit,
            :is_active, 
            :description,
            NOW(),
            NOW()
        )";
        
        $stmt = $this->db->prepare($query);
        $stmt->bindParam(':code', $data['code']);
        $stmt->bindParam(':name', $data['name']);
        $stmt->bindParam(':discount_type', $data['discount_type']);
        $stmt->bindParam(':discount_value', $data['discount_value']);
        $stmt->bindParam(':minimum_order_value', $data['minimum_order_value']);
        $stmt->bindParam(':maximum_discount_amount', $data['maximum_discount_amount']);
        $stmt->bindParam(':start_date', $data['start_date']);
        $stmt->bindParam(':end_date', $data['end_date']);
        $stmt->bindParam(':usage_limit', $data['usage_limit']);
        $stmt->bindParam(':per_user_limit', $data['per_user_limit']);
        $stmt->bindParam(':is_active', $data['is_active'], PDO::PARAM_BOOL);
        $stmt->bindParam(':description', $data['description']);
        
        $stmt->execute();
        
        $id = $this->db->lastInsertId();
        
        return $this->getCouponById($id);
    }

    public function updateCoupon(int $id, array $data)
    {
        // First, get the current coupon data
        $currentCoupon = $this->getCouponById($id);
        
        // Build the update query dynamically based on provided fields
        $query = "UPDATE coupons SET updated_at = NOW()";
        $params = [':id' => $id];
        
        // Only include fields that are provided in the update
        if (isset($data['code'])) {
            $query .= ", code = :code";
            $params[':code'] = $data['code'];
        }
        
        if (isset($data['name'])) {
            $query .= ", name = :name";
            $params[':name'] = $data['name'];
        }
        
        if (isset($data['discount_type'])) {
            $query .= ", discount_type = :discount_type";
            $params[':discount_type'] = $data['discount_type'];
        }
        
        if (isset($data['discount_value'])) {
            $query .= ", discount_value = :discount_value";
            $params[':discount_value'] = $data['discount_value'];
        }
        
        if (isset($data['minimum_order_value'])) {
            $query .= ", minimum_order_value = :minimum_order_value";
            $params[':minimum_order_value'] = $data['minimum_order_value'];
        }
        
        if (isset($data['maximum_discount_amount'])) {
            $query .= ", maximum_discount_amount = :maximum_discount_amount";
            $params[':maximum_discount_amount'] = $data['maximum_discount_amount'];
        }
        
        if (isset($data['start_date'])) {
            $query .= ", start_date = :start_date";
            $params[':start_date'] = $data['start_date'];
        }
        
        if (isset($data['end_date'])) {
            $query .= ", end_date = :end_date";
            $params[':end_date'] = $data['end_date'];
        }
        
        if (isset($data['usage_limit'])) {
            $query .= ", usage_limit = :usage_limit";
            $params[':usage_limit'] = $data['usage_limit'];
        }

        if (isset($data['per_user_limit'])) {
            $query .= ", per_user_limit = :per_user_limit";
            $params[':per_user_limit'] = $data['per_user_limit'];
        }
        
        if (isset($data['is_active'])) {
            $query .= ", is_active = :is_active";
            $params[':is_active'] = $data['is_active'];
        }
        
        if (isset($data['description'])) {
            $query .= ", description = :description";
            $params[':description'] = $data['description'];
        }
        
        $query .= " WHERE id = :id";
        
        $stmt = $this->db->prepare($query);
        
        foreach ($params as $key => $value) {
            if ($key === ':id') {
                $stmt->bindValue($key, $value, PDO::PARAM_INT);
            } else if ($key === ':is_active') {
                $stmt->bindValue($key, $value, PDO::PARAM_BOOL);
            } else {
                $stmt->bindValue($key, $value);
            }
        }
        
        $stmt->execute();
        
        return $this->getCouponById($id);
    }

    public function deleteCoupon(int $id)
    {
        $query = "UPDATE coupons SET deleted_at = NOW() WHERE id = :id";
        $stmt = $this->db->prepare($query);
        $stmt->bindParam(':id', $id, PDO::PARAM_INT);
        
        return $stmt->execute();
    }

    public function restoreCoupon(int $id)
    {
        $query = "UPDATE coupons SET deleted_at = NULL WHERE id = :id";
        $stmt = $this->db->prepare($query);
        $stmt->bindParam(':id', $id, PDO::PARAM_INT);
        
        return $stmt->execute();
    }

    public function recordCouponUsage(int $couponId, int $userId, string $orderId, float $discountAmount)
    {
        $query = "INSERT INTO coupon_usage (
            coupon_id, 
            user_id,
            order_id,
            discount_amount, 
            used_at
        ) VALUES (
            :coupon_id, 
            :user_id,
            :order_id,
            :discount_amount, 
            NOW()
        )";
        
        $stmt = $this->db->prepare($query);
        $stmt->bindParam(':coupon_id', $couponId, PDO::PARAM_INT);
        $stmt->bindParam(':user_id', $userId, PDO::PARAM_INT);
        $stmt->bindParam(':order_id', $orderId);
        $stmt->bindParam(':discount_amount', $discountAmount);
        
        return $stmt->execute();
    }

    public function getCouponUsageCount(int $couponId)
    {
        $query = "SELECT COUNT(*) FROM coupon_usage WHERE coupon_id = :coupon_id";
        $stmt = $this->db->prepare($query);
        $stmt->bindParam(':coupon_id', $couponId, PDO::PARAM_INT);
        $stmt->execute();
        
        return $stmt->fetchColumn();
    }

    public function getCouponUsageHistory(int $couponId, int $page = 1, int $limit = 20)
    {
        $offset = ($page - 1) * $limit;
        
        $query = "SELECT cu.*, u.phone_number as user_phone
                 FROM coupon_usage cu
                 LEFT JOIN users u ON cu.user_id = u.id
                 WHERE cu.coupon_id = :coupon_id
                 ORDER BY cu.used_at DESC
                 LIMIT :limit OFFSET :offset";
        
        $countQuery = "SELECT COUNT(*) FROM coupon_usage WHERE coupon_id = :coupon_id";
        
        // Execute count query
        $countStmt = $this->db->prepare($countQuery);
        $countStmt->bindParam(':coupon_id', $couponId, PDO::PARAM_INT);
        $countStmt->execute();
        $totalCount = $countStmt->fetchColumn();
        
        // Execute main query
        $stmt = $this->db->prepare($query);
        $stmt->bindParam(':coupon_id', $couponId, PDO::PARAM_INT);
        $stmt->bindParam(':limit', $limit, PDO::PARAM_INT);
        $stmt->bindParam(':offset', $offset, PDO::PARAM_INT);
        $stmt->execute();
        $usageHistory = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        // Calculate pagination info
        $totalPages = ceil($totalCount / $limit);
        
        return [
            'data' => $usageHistory,
            'pagination' => [
                'total' => $totalCount,
                'per_page' => $limit,
                'current_page' => $page,
                'last_page' => $totalPages,
                'from' => $offset + 1,
                'to' => min($offset + $limit, $totalCount)
            ]
        ];
    }

    public function checkCouponUsedInOrder(string $orderId)
    {
        $query = "SELECT * FROM coupon_usage WHERE order_id = :order_id";
        $stmt = $this->db->prepare($query);
        $stmt->bindValue(':order_id', $orderId);
        $stmt->execute();
        
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    public function getUserCouponUsageCount(int $couponId, int $userId)
    {
        $query = "SELECT COUNT(*) FROM coupon_usage WHERE coupon_id = :coupon_id AND user_id = :user_id";
        $stmt = $this->db->prepare($query);
        $stmt->bindParam(':coupon_id', $couponId, PDO::PARAM_INT);
        $stmt->bindParam(':user_id', $userId, PDO::PARAM_INT);
        $stmt->execute();
        
        return $stmt->fetchColumn();
    }

    public function getCouponStatistics(int $couponId, ?string $startDate = null, ?string $endDate = null, string $period = 'all')
    {
        try {
            // Get basic coupon information
            $coupon = $this->getCouponById($couponId);
            
            // Build date filter conditions
            $dateCondition = "";
            $params = [':coupon_id' => $couponId];
            
            // Handle custom period with start and end dates
            if ($period === 'custom' && $startDate && $endDate) {
                $dateCondition = " AND DATE(cu.used_at) BETWEEN :start_date AND :end_date";
                $params[':start_date'] = $startDate;
                $params[':end_date'] = $endDate;
            } elseif ($period !== 'all') {
                switch ($period) {
                    case 'today':
                        $dateCondition = " AND DATE(cu.used_at) = CURDATE()";
                        break;
                    case 'week':
                        $dateCondition = " AND cu.used_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)";
                        break;
                    case 'month':
                        $dateCondition = " AND cu.used_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)";
                        break;
                    case 'year':
                        $dateCondition = " AND cu.used_at >= DATE_SUB(NOW(), INTERVAL 1 YEAR)";
                        break;
                }
            } elseif ($startDate && $endDate) {
                // Fallback for when period is not custom but dates are provided
                $dateCondition = " AND DATE(cu.used_at) BETWEEN :start_date AND :end_date";
                $params[':start_date'] = $startDate;
                $params[':end_date'] = $endDate;
            } elseif ($startDate) {
                $dateCondition = " AND DATE(cu.used_at) >= :start_date";
                $params[':start_date'] = $startDate;
            } elseif ($endDate) {
                $dateCondition = " AND DATE(cu.used_at) <= :end_date";
                $params[':end_date'] = $endDate;
            }
            
            // Get usage statistics
            $usageQuery = "SELECT 
                COUNT(*) as total_uses,
                COALESCE(SUM(cu.discount_amount), 0) as total_discount_given,
                COALESCE(AVG(cu.discount_amount), 0) as average_discount,
                COALESCE(MIN(cu.discount_amount), 0) as min_discount,
                COALESCE(MAX(cu.discount_amount), 0) as max_discount,
                MIN(cu.used_at) as first_used,
                MAX(cu.used_at) as last_used,
                COUNT(DISTINCT cu.user_id) as unique_users
            FROM coupon_usage cu 
            WHERE cu.coupon_id = :coupon_id" . $dateCondition;
            
            $stmt = $this->db->prepare($usageQuery);
            foreach ($params as $key => $value) {
                $stmt->bindValue($key, $value);
            }
            $stmt->execute();
            $usageStats = $stmt->fetch(PDO::FETCH_ASSOC);
            
            // Get daily usage breakdown for the filtered period
            $dailyUsageQuery = "SELECT 
                DATE(cu.used_at) as usage_date,
                COUNT(*) as daily_uses,
                COALESCE(SUM(cu.discount_amount), 0) as daily_discount
            FROM coupon_usage cu 
            WHERE cu.coupon_id = :coupon_id" . $dateCondition . "
            GROUP BY DATE(cu.used_at)
            ORDER BY usage_date DESC";
            
            $stmt = $this->db->prepare($dailyUsageQuery);
            foreach ($params as $key => $value) {
                $stmt->bindValue($key, $value);
            }
            $stmt->execute();
            $dailyUsage = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            // Get hourly usage pattern for the filtered period
            $hourlyUsageQuery = "SELECT 
                HOUR(cu.used_at) as usage_hour,
                COUNT(*) as hourly_uses
            FROM coupon_usage cu 
            WHERE cu.coupon_id = :coupon_id" . $dateCondition . "
            GROUP BY HOUR(cu.used_at)
            ORDER BY usage_hour";
            
            $stmt = $this->db->prepare($hourlyUsageQuery);
            foreach ($params as $key => $value) {
                $stmt->bindValue($key, $value);
            }
            $stmt->execute();
            $hourlyUsage = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            // Calculate remaining usage
            $remainingUsage = null;
            if ($coupon['usage_limit'] > 0) {
                $totalUsageCount = $this->getCouponUsageCount($couponId);
                $remainingUsage = max(0, $coupon['usage_limit'] - $totalUsageCount);
            }
            
            // Calculate coupon status
            $currentDate = date('Y-m-d H:i:s');
            $status = 'active';
            if (!$coupon['is_active']) {
                $status = 'inactive';
            } elseif ($currentDate < $coupon['start_date']) {
                $status = 'scheduled';
            } elseif ($coupon['end_date'] && $currentDate > $coupon['end_date']) {
                $status = 'expired';
            } elseif ($coupon['usage_limit'] > 0 && $remainingUsage === 0) {
                $status = 'exhausted';
            }
            
            return [
                'coupon_info' => [
                    'id' => $coupon['id'],
                    'code' => $coupon['code'],
                    'name' => $coupon['name'],
                    'discount_type' => $coupon['discount_type'],
                    'discount_value' => (float) $coupon['discount_value'],
                    'minimum_order_value' => (float) $coupon['minimum_order_value'],
                    'maximum_discount_amount' => $coupon['maximum_discount_amount'] ? (float) $coupon['maximum_discount_amount'] : null,
                    'start_date' => $coupon['start_date'],
                    'end_date' => $coupon['end_date'],
                    'usage_limit' => $coupon['usage_limit'] ? (int) $coupon['usage_limit'] : null,
                    'is_active' => (bool) $coupon['is_active'],
                    'status' => $status,
                    'remaining_usage' => $remainingUsage
                ],
                'usage_statistics' => [
                    'total_uses' => (int) $usageStats['total_uses'],
                    'total_discount_given' => (float) $usageStats['total_discount_given'],
                    'average_discount' => (float) $usageStats['average_discount'],
                    'min_discount' => (float) $usageStats['min_discount'],
                    'max_discount' => (float) $usageStats['max_discount'],
                    'unique_users' => (int) $usageStats['unique_users'],
                    'first_used' => $usageStats['first_used'],
                    'last_used' => $usageStats['last_used']
                ],
                'usage_trends' => [
                    'daily_usage' => $dailyUsage,
                    'hourly_pattern' => $hourlyUsage
                ],
                'performance_metrics' => [
                    'usage_rate' => $coupon['usage_limit'] > 0 ? 
                        round(((int) $usageStats['total_uses'] / $coupon['usage_limit']) * 100, 2) : null,
                    'average_savings_per_user' => $usageStats['unique_users'] > 0 ? 
                        round($usageStats['total_discount_given'] / $usageStats['unique_users'], 2) : 0,
                    'days_active' => $usageStats['first_used'] && $usageStats['last_used'] ? 
                        (strtotime($usageStats['last_used']) - strtotime($usageStats['first_used'])) / (60 * 60 * 24) + 1 : 0
                ]
            ];
            
        } catch (\Exception $e) {
            error_log("Error in getCouponStatistics: " . $e->getMessage());
            throw $e;
        }
    }

    public function getAllCouponsStatistics(?string $startDate = null, ?string $endDate = null, string $period = 'all', bool $includeDeleted = false)
    {
        try {
            // Build date filter conditions
            $dateCondition = "";
            $params = [];
            
            // Handle custom period with start and end dates
            if ($period === 'custom' && $startDate && $endDate) {
                $dateCondition = " AND DATE(cu.used_at) BETWEEN :start_date AND :end_date";
                $params[':start_date'] = $startDate;
                $params[':end_date'] = $endDate;
            } elseif ($period !== 'all') {
                switch ($period) {
                    case 'today':
                        $dateCondition = " AND DATE(cu.used_at) = CURDATE()";
                        break;
                    case 'week':
                        $dateCondition = " AND cu.used_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)";
                        break;
                    case 'month':
                        $dateCondition = " AND cu.used_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)";
                        break;
                    case 'year':
                        $dateCondition = " AND cu.used_at >= DATE_SUB(NOW(), INTERVAL 1 YEAR)";
                        break;
                }
            } elseif ($startDate && $endDate) {
                // Fallback for when period is not custom but dates are provided
                $dateCondition = " AND DATE(cu.used_at) BETWEEN :start_date AND :end_date";
                $params[':start_date'] = $startDate;
                $params[':end_date'] = $endDate;
            } elseif ($startDate) {
                $dateCondition = " AND DATE(cu.used_at) >= :start_date";
                $params[':start_date'] = $startDate;
            } elseif ($endDate) {
                $dateCondition = " AND DATE(cu.used_at) <= :end_date";
                $params[':end_date'] = $endDate;
            }
            
            // Get overall coupon counts
            $couponCountsQuery = "SELECT 
                COUNT(*) as total_coupons,
                SUM(CASE WHEN is_active = 1 AND (end_date IS NULL OR end_date > NOW()) AND (start_date <= NOW()) THEN 1 ELSE 0 END) as active_coupons,
                SUM(CASE WHEN is_active = 0 THEN 1 ELSE 0 END) as inactive_coupons,
                SUM(CASE WHEN end_date IS NOT NULL AND end_date <= NOW() THEN 1 ELSE 0 END) as expired_coupons,
                SUM(CASE WHEN start_date > NOW() THEN 1 ELSE 0 END) as scheduled_coupons,
                SUM(CASE WHEN discount_type = 'percentage' THEN 1 ELSE 0 END) as percentage_coupons,
                SUM(CASE WHEN discount_type = 'fixed_amount' THEN 1 ELSE 0 END) as fixed_amount_coupons,
                SUM(CASE WHEN deleted_at IS NOT NULL THEN 1 ELSE 0 END) as deleted_coupons
            FROM coupons";
            
            if (!$includeDeleted) {
                $couponCountsQuery .= " WHERE deleted_at IS NULL";
            }
            
            $stmt = $this->db->prepare($couponCountsQuery);
            $stmt->execute();
            $couponCounts = $stmt->fetch(PDO::FETCH_ASSOC);
            
            // Get overall usage statistics with date filtering
            $usageStatsQuery = "SELECT 
                COUNT(*) as total_uses,
                COUNT(DISTINCT cu.coupon_id) as coupons_used,
                COALESCE(SUM(cu.discount_amount), 0) as total_discount_given,
                COALESCE(AVG(cu.discount_amount), 0) as average_discount,
                COUNT(DISTINCT cu.user_id) as unique_users,
                MIN(cu.used_at) as first_usage,
                MAX(cu.used_at) as last_usage
            FROM coupon_usage cu 
            JOIN coupons c ON cu.coupon_id = c.id
            WHERE 1=1" . $dateCondition;
            
            if (!$includeDeleted) {
                $usageStatsQuery .= " AND c.deleted_at IS NULL";
            }
            
            $stmt = $this->db->prepare($usageStatsQuery);
            foreach ($params as $key => $value) {
                $stmt->bindValue($key, $value);
            }
            $stmt->execute();
            $usageStats = $stmt->fetch(PDO::FETCH_ASSOC);
            
            // Get top performing coupons by usage with date filtering
            $topCouponsByUsageQuery = "SELECT 
                c.id,
                c.code,
                c.name,
                c.discount_type,
                c.discount_value,
                COUNT(cu.id) as usage_count,
                COALESCE(SUM(cu.discount_amount), 0) as total_discount_given,
                COALESCE(AVG(cu.discount_amount), 0) as average_discount
            FROM coupons c
            LEFT JOIN coupon_usage cu ON c.id = cu.coupon_id";
            
            if (!empty($dateCondition)) {
                $topCouponsByUsageQuery .= " AND 1=1" . $dateCondition;
            }
            
            $topCouponsByUsageQuery .= " WHERE 1=1";
            
            if (!$includeDeleted) {
                $topCouponsByUsageQuery .= " AND c.deleted_at IS NULL";
            }
            
            $topCouponsByUsageQuery .= " GROUP BY c.id, c.code, c.name, c.discount_type, c.discount_value
            ORDER BY usage_count DESC, total_discount_given DESC
            LIMIT 10";
            
            $stmt = $this->db->prepare($topCouponsByUsageQuery);
            foreach ($params as $key => $value) {
                $stmt->bindValue($key, $value);
            }
            $stmt->execute();
            $topCouponsByUsage = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            // Get top performing coupons by discount amount with date filtering
            $topCouponsByDiscountQuery = "SELECT 
                c.id,
                c.code,
                c.name,
                c.discount_type,
                c.discount_value,
                COUNT(cu.id) as usage_count,
                COALESCE(SUM(cu.discount_amount), 0) as total_discount_given,
                COALESCE(AVG(cu.discount_amount), 0) as average_discount
            FROM coupons c
            LEFT JOIN coupon_usage cu ON c.id = cu.coupon_id";
            
            if (!empty($dateCondition)) {
                $topCouponsByDiscountQuery .= " AND 1=1" . $dateCondition;
            }
            
            $topCouponsByDiscountQuery .= " WHERE 1=1";
            
            if (!$includeDeleted) {
                $topCouponsByDiscountQuery .= " AND c.deleted_at IS NULL";
            }
            
            $topCouponsByDiscountQuery .= " GROUP BY c.id, c.code, c.name, c.discount_type, c.discount_value
            HAVING total_discount_given > 0
            ORDER BY total_discount_given DESC, usage_count DESC
            LIMIT 10";
            
            $stmt = $this->db->prepare($topCouponsByDiscountQuery);
            foreach ($params as $key => $value) {
                $stmt->bindValue($key, $value);
            }
            $stmt->execute();
            $topCouponsByDiscount = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            // Get monthly usage trends for the filtered period or last 12 months
            $monthlyTrendsQuery = "SELECT 
                DATE_FORMAT(cu.used_at, '%Y-%m') as month,
                COUNT(*) as usage_count,
                COALESCE(SUM(cu.discount_amount), 0) as total_discount,
                COUNT(DISTINCT cu.coupon_id) as coupons_used,
                COUNT(DISTINCT cu.user_id) as unique_users
            FROM coupon_usage cu 
            JOIN coupons c ON cu.coupon_id = c.id
            WHERE 1=1";
            
            if (!empty($dateCondition)) {
                $monthlyTrendsQuery .= $dateCondition;
            } else {
                $monthlyTrendsQuery .= " AND cu.used_at >= DATE_SUB(NOW(), INTERVAL 12 MONTH)";
            }
            
            if (!$includeDeleted) {
                $monthlyTrendsQuery .= " AND c.deleted_at IS NULL";
            }
            
            $monthlyTrendsQuery .= " GROUP BY DATE_FORMAT(cu.used_at, '%Y-%m')
            ORDER BY month DESC";
            
            $stmt = $this->db->prepare($monthlyTrendsQuery);
            foreach ($params as $key => $value) {
                $stmt->bindValue($key, $value);
            }
            $stmt->execute();
            $monthlyTrends = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            // Get discount type performance with date filtering
            $discountTypeQuery = "SELECT 
                c.discount_type,
                COUNT(cu.id) as usage_count,
                COALESCE(SUM(cu.discount_amount), 0) as total_discount_given,
                COALESCE(AVG(cu.discount_amount), 0) as average_discount,
                COUNT(DISTINCT c.id) as coupon_count
            FROM coupons c
            LEFT JOIN coupon_usage cu ON c.id = cu.coupon_id";
            
            if (!empty($dateCondition)) {
                $discountTypeQuery .= " AND 1=1" . $dateCondition;
            }
            
            $discountTypeQuery .= " WHERE 1=1";
            
            if (!$includeDeleted) {
                $discountTypeQuery .= " AND c.deleted_at IS NULL";
            }
            
            $discountTypeQuery .= " GROUP BY c.discount_type";
            
            $stmt = $this->db->prepare($discountTypeQuery);
            foreach ($params as $key => $value) {
                $stmt->bindValue($key, $value);
            }
            $stmt->execute();
            $discountTypePerformance = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            return [
                'overview' => [
                    'total_coupons' => (int) $couponCounts['total_coupons'],
                    'active_coupons' => (int) $couponCounts['active_coupons'],
                    'inactive_coupons' => (int) $couponCounts['inactive_coupons'],
                    'expired_coupons' => (int) $couponCounts['expired_coupons'],
                    'scheduled_coupons' => (int) $couponCounts['scheduled_coupons'],
                    'deleted_coupons' => (int) $couponCounts['deleted_coupons'],
                    'percentage_coupons' => (int) $couponCounts['percentage_coupons'],
                    'fixed_amount_coupons' => (int) $couponCounts['fixed_amount_coupons']
                ],
                'usage_statistics' => [
                    'total_uses' => (int) $usageStats['total_uses'],
                    'coupons_used' => (int) $usageStats['coupons_used'],
                    'total_discount_given' => (float) $usageStats['total_discount_given'],
                    'average_discount' => (float) $usageStats['average_discount'],
                    'unique_users' => (int) $usageStats['unique_users'],
                    'first_usage' => $usageStats['first_usage'],
                    'last_usage' => $usageStats['last_usage']
                ],
                'top_performers' => [
                    'by_usage' => $topCouponsByUsage,
                    'by_discount_amount' => $topCouponsByDiscount
                ],
                'trends' => [
                    'monthly_usage' => $monthlyTrends
                ],
                'discount_type_performance' => $discountTypePerformance,
                'performance_metrics' => [
                    'coupon_utilization_rate' => $couponCounts['total_coupons'] > 0 ? 
                        round(($usageStats['coupons_used'] / $couponCounts['total_coupons']) * 100, 2) : 0,
                    'average_uses_per_coupon' => $usageStats['coupons_used'] > 0 ? 
                        round($usageStats['total_uses'] / $usageStats['coupons_used'], 2) : 0,
                    'average_savings_per_user' => $usageStats['unique_users'] > 0 ? 
                        round($usageStats['total_discount_given'] / $usageStats['unique_users'], 2) : 0
                ]
            ];
        } catch (\Exception $e) {
            error_log("Error in getAllCouponsStatistics: " . $e->getMessage());
            throw $e;
        }
    }
}
