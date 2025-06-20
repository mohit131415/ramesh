<?php

namespace App\Features\Coupons\Actions;

use App\Core\Request;
use App\Core\Response;
use App\Features\Coupons\Services\CouponService;
use App\Shared\Exceptions\ValidationException;
use App\Shared\Exceptions\NotFoundException;
use App\Shared\Traits\ValidatesInput;

class UpdateCoupon
{
    use ValidatesInput;

    private $couponService;

    public function __construct()
    {
        $this->couponService = new CouponService();
    }

    public function execute(Request $request, Response $response)
    {
        try {
            $couponId = (int) $request->getParam('id');
            
            // Get request body
            $data = $request->getBody();
            
            // Format dates properly before validation
            if (isset($data['start_date']) && !empty($data['start_date'])) {
                // Get the date part
                $startDate = date('Y-m-d', strtotime($data['start_date']));
                $currentDate = date('Y-m-d');
                
                // If start date is today, use current time
                if ($startDate === $currentDate) {
                    // Get current time
                    $currentTime = date('H:i:s');
                    $data['start_date'] = $startDate . ' ' . $currentTime;
                } else {
                    // If start date is in the future, set time to beginning of day (00:00:00)
                    $data['start_date'] = $startDate . ' 00:00:00';
                }
            }

            if (isset($data['end_date']) && !empty($data['end_date'])) {
                // Set end date time to 11:59 PM
                $endDate = date('Y-m-d', strtotime($data['end_date']));
                $data['end_date'] = $endDate . ' 23:59:59';
            } else if (isset($data['end_date']) && empty($data['end_date'])) {
                // If end_date is explicitly set to empty, set it to NULL for lifetime coupons
                $data['end_date'] = null;
            }
            
            // Validate input
            $this->validate($data, [
                'code' => 'string|min:3|max:50',
                'name' => 'string|max:100',
                'description' => 'string|max:255',
                'discount_type' => 'in:percentage,fixed_amount',
                'discount_value' => 'numeric|min:0',
                'minimum_order_value' => 'numeric|min:0',
                'maximum_discount_amount' => 'numeric|min:0',
                'start_date' => '',
                'end_date' => '',
                'usage_limit' => 'integer|min:0',
                'per_user_limit' => 'integer|min:0',
                'is_active' => 'boolean'
            ]);
            
            // Update coupon
            $coupon = $this->couponService->updateCoupon($couponId, $data);
            
            return [
                'status' => 'success',
                'message' => 'Coupon updated successfully',
                'data' => $coupon
            ];
        } catch (ValidationException $e) {
            return [
                'status' => 'error',
                'message' => 'Validation failed',
                'errors' => $e->getErrors(),
                'data' => null
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
