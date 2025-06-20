<?php

namespace App\Features\UserManagement\Actions;

use App\Core\Request;
use App\Core\Response;
use App\Features\UserManagement\Services\AdminUserService;
use App\Shared\Helpers\ResponseFormatter;
use DateTime;
use Exception;

class ExportUsers
{
    private $userService;

    public function __construct()
    {
        $this->userService = new AdminUserService();
    }

    public function execute(Request $request, Response $response)
    {
        try {
            // Get filters from query parameters
            $filters = [
                'search' => $request->getQuery('search'),
                'status' => $request->getQuery('status'),
                'has_profile' => $request->getQuery('has_profile'),
                'registration_date_from' => $request->getQuery('registration_date_from'),
                'registration_date_to' => $request->getQuery('registration_date_to'),
                'last_login_from' => $request->getQuery('last_login_from'),
                'last_login_to' => $request->getQuery('last_login_to'),
                'has_orders' => $request->getQuery('has_orders'),
                'order_count_min' => $request->getQuery('order_count_min'),
                'order_count_max' => $request->getQuery('order_count_max'),
                'total_spent_min' => $request->getQuery('total_spent_min'),
                'total_spent_max' => $request->getQuery('total_spent_max')
            ];
            
            // Remove empty filters
            $filters = array_filter($filters, function($value) {
                return $value !== null && $value !== '';
            });

            // Validate date formats
            $this->validateDateFilters($filters);

            // Get export format (default to CSV)
            $format = $request->getQuery('format', 'csv');
            
            if ($format === 'csv') {
                return $this->exportAsCsv($filters, $response);
            } else {
                return $this->exportAsJson($filters);
            }
        } catch (Exception $e) {
            return ResponseFormatter::error(
                'Failed to export users: ' . $e->getMessage()
            );
        }
    }

    private function validateDateFilters($filters)
    {
        $dateFields = [
            'registration_date_from', 
            'registration_date_to', 
            'last_login_from', 
            'last_login_to'
        ];

        foreach ($dateFields as $field) {
            if (isset($filters[$field])) {
                $date = DateTime::createFromFormat('Y-m-d', $filters[$field]);
                if (!$date || $date->format('Y-m-d') !== $filters[$field]) {
                    throw new Exception("Invalid date format for {$field}. Use YYYY-MM-DD format.");
                }
            }
        }

        // Validate date ranges
        if (isset($filters['registration_date_from']) && isset($filters['registration_date_to'])) {
            if ($filters['registration_date_from'] > $filters['registration_date_to']) {
                throw new Exception("Registration date 'from' cannot be later than 'to' date.");
            }
        }

        if (isset($filters['last_login_from']) && isset($filters['last_login_to'])) {
            if ($filters['last_login_from'] > $filters['last_login_to']) {
                throw new Exception("Last login date 'from' cannot be later than 'to' date.");
            }
        }
    }

    private function exportAsCsv($filters, $response)
    {
        try {
            // Get export data
            $exportData = $this->userService->exportUsersData($filters);
            
            // Generate CSV content
            $csvContent = $this->userService->generateCsvContent(
                $exportData['headers'], 
                $exportData['data']
            );
            
            // Generate filename with date range if applicable
            $filename = $this->generateFilename($filters, 'csv');
            
            // Set headers for CSV download
            $response->setHeader('Content-Type', 'text/csv; charset=utf-8');
            $response->setHeader('Content-Disposition', 'attachment; filename="' . $filename . '"');
            $response->setHeader('Cache-Control', 'no-cache, must-revalidate');
            $response->setHeader('Expires', 'Mon, 26 Jul 1997 05:00:00 GMT');
            
            // Add BOM for proper UTF-8 encoding in Excel
            echo "\xEF\xBB\xBF" . $csvContent;
            exit;
        } catch (Exception $e) {
            throw new Exception('Failed to export as CSV: ' . $e->getMessage());
        }
    }

    private function exportAsJson($filters)
    {
        try {
            // Get export data
            $exportData = $this->userService->exportUsersData($filters);
            
            // Return JSON response
            return ResponseFormatter::success([
                'users' => $exportData['data'],
                'total_records' => $exportData['total_records'],
                'exported_at' => date('Y-m-d H:i:s'),
                'filters_applied' => $filters,
                'summary' => $exportData['summary']
            ], 'Users data exported successfully');
        } catch (Exception $e) {
            throw new Exception('Failed to export as JSON: ' . $e->getMessage());
        }
    }

    private function generateFilename($filters, $format)
    {
        $filename = 'users_export';
        
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
        $filename .= '_' . date('Y-m-d_H-i-s');
        
        // Add extension
        $filename .= '.' . $format;
        
        return $filename;
    }
}
