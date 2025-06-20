<?php

namespace App\Features\Coupons\Services;

use App\Features\Coupons\DataAccess\CouponRepository;
use App\Shared\Exceptions\ValidationException;
use App\Shared\Exceptions\NotFoundException;

class CouponService
{
    private $couponRepository;

    public function __construct()
    {
        $this->couponRepository = new CouponRepository();
    }

    public function getAllCoupons(array $filters = [], int $page = 1, int $limit = 20, string $sortBy = 'created_at', string $sortOrder = 'DESC', bool $includeDeleted = false)
    {
        return $this->couponRepository->getAllCoupons($filters, $page, $limit, $sortBy, $sortOrder, $includeDeleted);
    }

    public function getCouponById(int $id, bool $includeDeleted = false)
    {
        $coupon = $this->couponRepository->getCouponById($id, $includeDeleted);
        
        if (!$coupon) {
            throw new NotFoundException("Coupon with ID {$id} not found");
        }
        
        return $coupon;
    }

    public function createCoupon(array $data)
    {
        try {
            // Check if coupon code already exists
            $existingCoupon = $this->couponRepository->getCouponByCode($data['code']);
            if ($existingCoupon) {
                throw new ValidationException("Coupon code '{$data['code']}' already exists");
            }
        } catch (NotFoundException $e) {
            // This is actually good - we want the code to not exist
        }
        
        // Create the coupon
        return $this->couponRepository->createCoupon($data);
    }

    public function updateCoupon(int $id, array $data)
    {
        // Check if coupon exists
        $coupon = $this->getCouponById($id);
        
        // Check if the updated code already exists (if code is being changed)
        if (isset($data['code']) && $data['code'] !== $coupon['code']) {
            try {
                $existingCoupon = $this->couponRepository->getCouponByCode($data['code']);
                if ($existingCoupon) {
                    throw new ValidationException("Coupon code '{$data['code']}' already exists");
                }
            } catch (NotFoundException $e) {
                // This is actually good - we want the code to not exist
            }
        }
        
        // Update the coupon
        return $this->couponRepository->updateCoupon($id, $data);
    }

    public function deleteCoupon(int $id)
    {
        // Check if coupon exists
        $this->getCouponById($id);
        
        // Delete the coupon (soft delete)
        return $this->couponRepository->deleteCoupon($id);
    }

    public function restoreCoupon(int $id)
    {
        // Check if coupon exists (including deleted ones)
        $this->getCouponById($id, true);
        
        // Restore the coupon
        $result = $this->couponRepository->restoreCoupon($id);
        
        if (!$result) {
            throw new NotFoundException("Coupon with ID {$id} could not be restored");
        }
        
        return $this->getCouponById($id);
    }

    public function getCouponStatistics(int $couponId, ?string $startDate = null, ?string $endDate = null, string $period = 'all')
    {
        try {
            error_log("CouponService: Getting statistics for coupon {$couponId}");
            
            // Check if coupon exists first
            $coupon = $this->getCouponById($couponId);
            error_log("CouponService: Found coupon - " . json_encode($coupon));
            
            $statistics = $this->couponRepository->getCouponStatistics($couponId, $startDate, $endDate, $period);
            error_log("CouponService: Retrieved statistics successfully");
            
            return $statistics;
        } catch (\Exception $e) {
            error_log("CouponService: Error in getCouponStatistics - " . $e->getMessage());
            throw $e;
        }
    }

    public function getAllCouponsStatistics(?string $startDate = null, ?string $endDate = null, string $period = 'all', bool $includeDeleted = false)
    {
        return $this->couponRepository->getAllCouponsStatistics($startDate, $endDate, $period, $includeDeleted);
    }
}
