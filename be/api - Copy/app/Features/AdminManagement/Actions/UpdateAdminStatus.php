<?php

namespace App\Features\AdminManagement\Actions;

use App\Core\Request;
use App\Core\Response;
use App\Features\AdminManagement\Services\AdminService;
use App\Shared\Helpers\ResponseFormatter;
use App\Shared\Exceptions\ValidationException;
use App\Shared\Exceptions\NotFoundException;
use Exception;

class UpdateAdminStatus
{
    private $adminService;

    public function __construct()
    {
        $this->adminService = new AdminService();
    }

    public function execute(Request $request, Response $response)
    {
        try {
            // Get admin ID from URL parameters
            $adminId = $request->getParam('id');
            if (!$adminId) {
                throw new ValidationException('Admin ID is required', ['id' => 'Admin ID is required']);
            }

            // Get status from request body
            $data = $request->getBody();
            if (!isset($data['status'])) {
                throw new ValidationException('Status is required', ['status' => 'Status is required']);
            }

            // Validate status value
            $status = $data['status'];
            $validStatuses = ['active', 'inactive', 'suspended'];
            if (!in_array($status, $validStatuses)) {
                throw new ValidationException(
                    'Invalid status', 
                    ['status' => 'Status must be one of: ' . implode(', ', $validStatuses)]
                );
            }

            // Update admin status
            $admin = $this->adminService->updateAdminStatus($adminId, $status);
            
            // Return success response
            return ResponseFormatter::success(
                $admin,
                'Admin status updated successfully'
            );
        } catch (ValidationException $e) {
            return ResponseFormatter::error(
                $e->getMessage(),
                $e->getErrors(),
                400
            );
        } catch (NotFoundException $e) {
            return ResponseFormatter::error(
                $e->getMessage(),
                [],
                404
            );
        } catch (Exception $e) {
            return ResponseFormatter::error(
                'Failed to update admin status: ' . $e->getMessage()
            );
        }
    }
}
