<?php

namespace App\Features\UserManagement\Services;

use App\Features\UserManagement\DataAccess\AdminUserRepository;
use App\Shared\Exceptions\ValidationException;
use App\Shared\Exceptions\NotFoundException;
use Exception;

class AdminUserService
{
    private $userRepository;

    public function __construct()
    {
        $this->userRepository = new AdminUserRepository();
    }

    /**
     * Get all users with pagination and filters
     *
     * @param int $page Page number
     * @param int $limit Items per page
     * @param array $filters Optional filters
     * @return array Users and pagination metadata
     */
    public function getAllUsers($page = 1, $limit = 20, $filters = [])
    {
        try {
            // Validate pagination parameters
            if ($page < 1) {
                $page = 1;
            }
            
            if ($limit < 1 || $limit > 100) {
                $limit = 20;
            }

            return $this->userRepository->getAllUsers($page, $limit, $filters);
        } catch (Exception $e) {
            throw new Exception('Failed to get users: ' . $e->getMessage());
        }
    }

    /**
     * Get user details with profile and addresses
     *
     * @param int $userId User ID
     * @return array User details
     * @throws NotFoundException
     */
    public function getUserDetails($userId)
    {
        try {
            if (!is_numeric($userId) || $userId <= 0) {
                throw new ValidationException('Invalid user ID', ['user_id' => 'User ID must be a positive integer']);
            }

            return $this->userRepository->getUserDetails($userId);
        } catch (NotFoundException $e) {
            throw $e;
        } catch (ValidationException $e) {
            throw $e;
        } catch (Exception $e) {
            throw new Exception('Failed to get user details: ' . $e->getMessage());
        }
    }

    /**
     * Update user status
     *
     * @param int $userId User ID
     * @param string $status New status
     * @return array Updated user details
     * @throws NotFoundException
     * @throws ValidationException
     */
    public function updateUserStatus($userId, $status)
    {
        try {
            if (!is_numeric($userId) || $userId <= 0) {
                throw new ValidationException('Invalid user ID', ['user_id' => 'User ID must be a positive integer']);
            }

            if (empty($status)) {
                throw new ValidationException('Status is required', ['status' => 'Status is required']);
            }

            // Update status
            $this->userRepository->updateUserStatus($userId, $status);

            // Return updated user details
            return $this->userRepository->getUserDetails($userId);
        } catch (NotFoundException $e) {
            throw $e;
        } catch (ValidationException $e) {
            throw $e;
        } catch (Exception $e) {
            throw new Exception('Failed to update user status: ' . $e->getMessage());
        }
    }

    /**
     * Export users data with comprehensive information
     *
     * @param array $filters Optional filters
     * @return array CSV data and headers with summary
     */
    public function exportUsersData($filters = [])
    {
        try {
            $users = $this->userRepository->getUsersForExport($filters);

            // Define comprehensive CSV headers
            $headers = [
                'ID',
                'Phone Number',
                'First Name',
                'Last Name',
                'Full Name',
                'Email',
                'Gender',
                'Date of Birth',
                'Status',
                'Address Count',
                'Registration Date',
                'Profile Created Date',
                'Last Login',
                'Days Since Registration',
                'Days Since Last Login',
                'Total Orders',
                'Completed Orders',
                'Cancelled Orders',
                'Total Spent (₹)',
                'Average Order Value (₹)',
                'COD Orders',
                'Online Orders',
                'Total Refunds (₹)',
                'First Order Date',
                'Last Order Date'
            ];

            // Format data for CSV
            $csvData = [];
            foreach ($users as $user) {
                $csvData[] = [
                    $user['id'],
                    $user['phone_number'],
                    $user['first_name'],
                    $user['last_name'],
                    $user['full_name'],
                    $user['email'],
                    $user['gender'],
                    $user['date_of_birth'],
                    ucfirst($user['status']),
                    $user['address_count'],
                    $user['registration_date'] ? date('Y-m-d H:i:s', strtotime($user['registration_date'])) : '',
                    $user['profile_created_at'] ? date('Y-m-d H:i:s', strtotime($user['profile_created_at'])) : '',
                    $user['last_login_at'] ? date('Y-m-d H:i:s', strtotime($user['last_login_at'])) : 'Never',
                    $user['days_since_registration'],
                    $user['days_since_last_login'] ?? 'Never',
                    $user['total_orders'],
                    $user['completed_orders'],
                    $user['cancelled_orders'],
                    $user['total_spent'],
                    $user['avg_order_value'],
                    $user['cod_orders'],
                    $user['online_orders'],
                    $user['total_refunds'],
                    $user['first_order_date'] ? date('Y-m-d', strtotime($user['first_order_date'])) : '',
                    $user['last_order_date'] ? date('Y-m-d', strtotime($user['last_order_date'])) : ''
                ];
            }

            // Generate summary statistics
            $summary = $this->generateExportSummary($users, $filters);

            return [
                'headers' => $headers,
                'data' => $csvData,
                'total_records' => count($csvData),
                'filename' => $this->generateExportFilename($filters),
                'summary' => $summary
            ];
        } catch (Exception $e) {
            throw new Exception('Failed to export users data: ' . $e->getMessage());
        }
    }

    /**
     * Get detailed user statistics
     *
     * @return array Comprehensive user statistics
     */
    public function getDetailedUserStatistics()
    {
        try {
            $statistics = $this->userRepository->getDetailedUserStatistics();
            
            // Calculate additional metrics
            if ($statistics['total_users'] > 0) {
                $statistics['profile_completion_rate'] = round(
                    ($statistics['users_with_complete_profiles'] / $statistics['total_users']) * 100, 2
                );
                
                $statistics['address_completion_rate'] = round(
                    ($statistics['users_with_addresses'] / $statistics['total_users']) * 100, 2
                );
                
                $statistics['order_conversion_rate'] = round(
                    ($statistics['users_with_orders'] / $statistics['total_users']) * 100, 2
                );
            } else {
                $statistics['profile_completion_rate'] = 0;
                $statistics['address_completion_rate'] = 0;
                $statistics['order_conversion_rate'] = 0;
            }

            return $statistics;
        } catch (Exception $e) {
            throw new Exception('Failed to get detailed user statistics: ' . $e->getMessage());
        }
    }

    /**
     * Generate CSV content from data
     *
     * @param array $headers CSV headers
     * @param array $data CSV data
     * @return string CSV content
     */
    public function generateCsvContent($headers, $data)
    {
        $output = fopen('php://temp', 'r+');
        
        // Add headers
        fputcsv($output, $headers);
        
        // Add data rows
        foreach ($data as $row) {
            fputcsv($output, $row);
        }
        
        rewind($output);
        $csvContent = stream_get_contents($output);
        fclose($output);
        
        return $csvContent;
    }

    /**
     * Generate export summary statistics
     *
     * @param array $users User data
     * @param array $filters Applied filters
     * @return array Summary statistics
     */
    private function generateExportSummary($users, $filters)
    {
        $summary = [
            'total_exported' => count($users),
            'filters_applied' => $filters,
            'export_date' => date('Y-m-d H:i:s')
        ];

        if (!empty($users)) {
            $totalSpent = array_sum(array_map(function($user) {
                return (float)str_replace(',', '', $user['total_spent']);
            }, $users));

            $totalOrders = array_sum(array_column($users, 'total_orders'));
            
            $usersWithOrders = array_filter($users, function($user) {
                return $user['total_orders'] > 0;
            });

            $summary['statistics'] = [
                'users_with_profiles' => count(array_filter($users, function($user) {
                    return !empty($user['first_name']) || !empty($user['last_name']);
                })),
                'users_with_orders' => count($usersWithOrders),
                'total_revenue' => number_format($totalSpent, 2),
                'total_orders' => $totalOrders,
                'average_orders_per_user' => $totalOrders > 0 ? round($totalOrders / count($users), 2) : 0,
                'average_spent_per_user' => count($users) > 0 ? number_format($totalSpent / count($users), 2) : '0.00'
            ];
        }

        return $summary;
    }

    /**
     * Generate export filename based on filters
     *
     * @param array $filters Applied filters
     * @return string Filename
     */
    private function generateExportFilename($filters)
    {
        $filename = 'users_comprehensive_export';
        
        // Add date range to filename if specified
        if (isset($filters['registration_date_from']) || isset($filters['registration_date_to'])) {
            $dateRange = '';
            if (isset($filters['registration_date_from'])) {
                $dateRange .= '_from_' . $filters['registration_date_from'];
            }
            if (isset($filters['registration_date_to'])) {
                $dateRange .= '_to_' . $filters['registration_date_to'];
            }
            $filename .= $dateRange;
        }
        
        // Add timestamp
        $filename .= '_' . date('Y-m-d_H-i-s') . '.csv';
        
        return $filename;
    }
}
