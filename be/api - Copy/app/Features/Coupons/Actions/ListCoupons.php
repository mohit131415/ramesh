<?php

namespace App\Features\Coupons\Actions;

use App\Core\Request;
use App\Core\Response;
use App\Features\Coupons\Services\CouponService;
use App\Shared\Traits\ValidatesInput;
use App\Core\Security\Authorization;

class ListCoupons
{
    use ValidatesInput;

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
            // Get query parameters with defaults
            $page = (int) ($request->getQuery('page', 1));
            $limit = (int) ($request->getQuery('per_page', $request->getQuery('limit', 20)));
            $sortBy = $request->getQuery('sort_by', 'created_at');
            $sortOrder = $request->getQuery('sort_order', 'DESC');
            
            // Check if user is super_admin
            $isSuperAdmin = $this->authorization->isSuperAdmin();
            
            // Get show_deleted parameter from request
            $showDeletedParam = $request->getQuery('show_deleted', null);
            
            // Default to true for super_admin to always show deleted coupons
            $showDeleted = true;
            
            // Only if explicitly set to false, don't show deleted coupons
            if ($showDeletedParam === 'false' || $showDeletedParam === '0' || $showDeletedParam === false || $showDeletedParam === 0) {
                $showDeleted = false;
            }
            
            // Only include deleted coupons if user is super_admin AND show_deleted is true
            $includeDeleted = $isSuperAdmin && $showDeleted;
            
            // Build filters from query parameters
            $filters = [];

            $searchParam = $request->getQuery('search');
            if ($searchParam && !empty(trim($searchParam))) {
                $filters['search'] = trim($searchParam);
            }

            if ($request->getQuery('is_active') !== null) {
                $filters['is_active'] = filter_var($request->getQuery('is_active'), FILTER_VALIDATE_BOOLEAN);
            }

            if ($request->getQuery('discount_type')) {
                $filters['discount_type'] = $request->getQuery('discount_type');
            }

            if ($request->getQuery('start_date')) {
                $filters['start_date'] = $request->getQuery('start_date');
            }

            if ($request->getQuery('end_date')) {
                $filters['end_date'] = $request->getQuery('end_date');
            }
            
            // Get coupons with pagination
            $result = $this->couponService->getAllCoupons($filters, $page, $limit, $sortBy, $sortOrder, $includeDeleted);
            
            // Add can_restore flag to each coupon
            foreach ($result['data'] as &$coupon) {
                $coupon['is_deleted'] = !empty($coupon['deleted_at']);
                $coupon['can_restore'] = $isSuperAdmin && !empty($coupon['deleted_at']);
            }
            
            return [
                'status' => 'success',
                'message' => 'Coupons retrieved successfully',
                'data' => $result['data'],
                'pagination' => $result['pagination'],
                'meta' => [
                    'is_super_admin' => $isSuperAdmin,
                    'show_deleted_param' => $showDeletedParam,
                    'show_deleted' => $showDeleted,
                    'include_deleted' => $includeDeleted
                ]
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
