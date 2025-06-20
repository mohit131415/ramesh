<?php

namespace App\Features\Coupons\Actions;

use App\Core\Request;
use App\Core\Response;
use App\Features\Coupons\Services\CouponService;
use App\Shared\Exceptions\NotFoundException;

class GetCouponStatistics
{
    private $couponService;

    public function __construct()
    {
        $this->couponService = new CouponService();
    }

    public function execute(Request $request, Response $response)
    {
        try {
            $couponId = (int) $request->getParam('id');
            
            // Log the request details
            error_log("GetCouponStatistics: Coupon ID = {$couponId}");
            
            // Get query parameters with defaults
            $startDate = $request->getQuery('start_date');
            $endDate = $request->getQuery('end_date');
            $period = $request->getQuery('period', 'all');
            
            error_log("GetCouponStatistics: Period = {$period}, Start Date = " . ($startDate ?? 'null') . ", End Date = " . ($endDate ?? 'null'));
            
            // Validate coupon ID
            if ($couponId <= 0) {
                return [
                    'status' => 'error',
                    'message' => 'Invalid coupon ID provided',
                    'data' => null
                ];
            }
            
            // Get coupon statistics
            $statistics = $this->couponService->getCouponStatistics($couponId, $startDate, $endDate, $period);
            
            error_log("GetCouponStatistics: Successfully retrieved statistics for coupon {$couponId}");
            
            return [
                'status' => 'success',
                'message' => 'Coupon statistics retrieved successfully',
                'data' => $statistics
            ];
        } catch (NotFoundException $e) {
            error_log("GetCouponStatistics: NotFoundException - " . $e->getMessage());
            return [
                'status' => 'error',
                'message' => $e->getMessage(),
                'data' => null
            ];
        } catch (\Exception $e) {
            error_log("GetCouponStatistics: Exception - " . $e->getMessage());
            error_log("GetCouponStatistics: Stack trace - " . $e->getTraceAsString());
            return [
                'status' => 'error',
                'message' => 'Failed to retrieve coupon statistics: ' . $e->getMessage(),
                'data' => null
            ];
        }
    }
}
