<?php

namespace App\Features\Coupons\Actions;

use App\Core\Request;
use App\Core\Response;
use App\Features\Coupons\Services\CouponService;
use App\Shared\Exceptions\ValidationException;

class GetAllCouponsStatistics
{
    private $couponService;

    public function __construct()
    {
        $this->couponService = new CouponService();
    }

    public function execute(Request $request, Response $response)
    {
        try {
            // Get query parameters with defaults
            $startDate = $request->getQuery('start_date');
            $endDate = $request->getQuery('end_date');
            $period = $request->getQuery('period', 'all');
            $includeDeleted = filter_var($request->getQuery('include_deleted', false), FILTER_VALIDATE_BOOLEAN);
            
            // Log the request details for debugging
            error_log("GetAllCouponsStatistics: Period = {$period}, Start Date = " . ($startDate ?? 'null') . ", End Date = " . ($endDate ?? 'null'));
            
            // Validate custom period
            if ($period === 'custom' && (!$startDate || !$endDate)) {
                return [
                    'status' => 'error',
                    'message' => 'Start date and end date are required for custom period',
                    'data' => null
                ];
            }
            
            // Get all coupons statistics
            $statistics = $this->couponService->getAllCouponsStatistics($startDate, $endDate, $period, $includeDeleted);
            
            return [
                'status' => 'success',
                'message' => 'All coupons statistics retrieved successfully',
                'data' => $statistics
            ];
        } catch (ValidationException $e) {
            return [
                'status' => 'error',
                'message' => $e->getMessage(),
                'data' => null
            ];
        } catch (\Exception $e) {
            error_log("Error getting all coupons statistics: " . $e->getMessage());
            return [
                'status' => 'error',
                'message' => 'Failed to retrieve coupons statistics: ' . $e->getMessage(),
                'data' => null
            ];
        }
    }
}
