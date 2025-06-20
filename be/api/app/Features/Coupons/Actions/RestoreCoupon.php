<?php

namespace App\Features\Coupons\Actions;

use App\Core\Request;
use App\Core\Response;
use App\Features\Coupons\Services\CouponService;
use App\Shared\Exceptions\NotFoundException;

class RestoreCoupon
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
            $coupon = $this->couponService->restoreCoupon($couponId);
            
            return [
                'status' => 'success',
                'message' => 'Coupon restored successfully',
                'data' => $coupon
            ];
        } catch (NotFoundException $e) {
            return [
                'status' => 'error',
                'message' => $e->getMessage(),
                'data' => null
            ];
        } catch (\Exception $e) {
            return [
                'status' => 'error',
                'message' => $e->getMessage(),
                'data' => null
            ];
        }
    }
}
