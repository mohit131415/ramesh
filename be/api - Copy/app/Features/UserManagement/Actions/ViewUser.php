<?php

namespace App\Features\UserManagement\Actions;

use App\Core\Request;
use App\Core\Response;
use App\Features\UserManagement\Services\AdminUserService;
use App\Shared\Helpers\ResponseFormatter;
use App\Shared\Exceptions\ValidationException;
use App\Shared\Exceptions\NotFoundException;
use Exception;

class ViewUser
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

            // Get user details
            $user = $this->userService->getUserDetails($userId);
            
            // Return response
            return ResponseFormatter::success(
                $user,
                'User details retrieved successfully'
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
                'Failed to retrieve user details: ' . $e->getMessage()
            );
        }
    }
}
