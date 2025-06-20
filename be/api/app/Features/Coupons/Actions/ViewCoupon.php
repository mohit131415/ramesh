<?php

namespace App\Features\Coupons\Actions;

use App\Core\Request;
use App\Core\Response;
use App\Features\Coupons\Services\CouponService;
use App\Core\Security\Authorization;
use App\Shared\Exceptions\NotFoundException;

class ViewCoupon
{
    private $couponService;
    private $authorization;

    public function __construct()
    {
        $this->couponService = new CouponService();
        $this->authorization = Authorization::getInstance();
    }

    public function execute(Request $request, Response $response)
    {
        try {
            $couponId = (int) $request->getParam('id');
            
            // Check if user is super_admin to determine if deleted coupons should be included
            $isSuperAdmin = $this->authorization->isSuperAdmin();
            
            // Only super_admin can view deleted coupons
            $includeDeleted = $isSuperAdmin;
            
            $coupon = $this->couponService->getCouponById($couponId, $includeDeleted);
            
            // Add flags for UI
            $coupon['is_deleted'] = !empty($coupon['deleted_at']);
            $coupon['can_restore'] = $isSuperAdmin && !empty($coupon['deleted_at']);
            
            return [
                'status' => 'success',
                'message' => 'Coupon retrieved successfully',
                'data' => $coupon,
                'meta' => [
                    'is_super_admin' => $isSuperAdmin,
                    'include_deleted' => $includeDeleted
                ]
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
