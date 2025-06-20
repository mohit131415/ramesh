<?php

namespace App\Features\UserManagement\Actions;

use App\Core\Request;
use App\Core\Response;
use App\Features\UserManagement\Services\AdminUserService;
use App\Shared\Helpers\ResponseFormatter;
use App\Shared\Exceptions\ValidationException;
use App\Shared\Exceptions\NotFoundException;
use Exception;

class UpdateUserStatus
{
    private $userService;

    public function __construct()
    {
        $this->userService = new AdminUserService();
    }

    public function execute(Request $request, Response $response)
    {
        try {
            // Get user ID from URL parameters
            $userId = $request->getParam('id');
            if (!$userId) {
                throw new ValidationException('User ID is required', ['id' => 'User ID is required']);
            }

            // Get status from request body
            $data = $request->getBody();
            if (!isset($data['status'])) {
                throw new ValidationException('Status is required', ['status' => 'Status is required']);
            }

            // Validate status value
            $status = $data['status'];
            $validStatuses = ['active', 'inactive'];
            if (!in_array($status, $validStatuses)) {
                throw new ValidationException(
                    'Invalid status', 
                    ['status' => 'Status must be one of: ' . implode(', ', $validStatuses)]
                );
            }

            // Update user status
            $user = $this->userService->updateUserStatus($userId, $status);
            
            // Return success response
            return ResponseFormatter::success(
                $user,
                'User status updated successfully'
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
                'Failed to update user status: ' . $e->getMessage()
            );
        }
    }
}
