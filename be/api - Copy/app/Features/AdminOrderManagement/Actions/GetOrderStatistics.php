<?php

namespace App\Features\AdminOrderManagement\Actions;

use App\Core\Request;
use App\Core\Response;
use App\Features\AdminOrderManagement\Services\AdminOrderService;
use App\Shared\Helpers\ResponseFormatter;
use App\Core\Security\Authorization;
use App\Shared\Helpers\InputValidator;
use Exception;
use PDO;
use App\Core\Database;

class GetOrderStatistics
{
    private $orderService;
    private $authorization;
    private $db;

    public function __construct()
    {
        $this->orderService = new AdminOrderService();
        $this->authorization = Authorization::getInstance();
        $this->db = Database::getInstance()->getConnection();
    }

    public function execute(Request $request, Response $response)
    {
        try {
            // Check if user is admin
            $isAdmin = $this->authorization->isAdmin();
            if (!$isAdmin) {
                throw new Exception('Unauthorized access');
            }

            // Get query parameters with defaults
            $period = $request->getQuery('period', 'month');
            $dateFrom = $request->getQuery('date_from');
            $dateTo = $request->getQuery('date_to');
            $status = $request->getQuery('status');
            $paymentMethod = $request->getQuery('payment_method');
            $paymentStatus = $request->getQuery('payment_status');
            $categoryId = $request->getQuery('category_id');
            $subcategoryId = $request->getQuery('subcategory_id');
            $productId = $request->getQuery('product_id');
            $state = $request->getQuery('state');
            $city = $request->getQuery('city');
            $pincode = $request->getQuery('pincode');
            $comparison = $request->getQuery('comparison', 'previous_period');
            $groupBy = $request->getQuery('group_by');
            $metrics = $request->getQuery('metrics');
            $limit = (int)$request->getQuery('limit', 10);
            $includeDetails = filter_var($request->getQuery('include_details', 'false'), FILTER_VALIDATE_BOOLEAN);

            // Validate parameters manually
            $errors = [];

            // Validate period
            $validPeriods = ['today', 'yesterday', 'week', 'month', 'quarter', 'year', 'custom'];
            if (!in_array($period, $validPeriods)) {
                $errors[] = 'Invalid period. Must be one of: ' . implode(', ', $validPeriods);
            }

            // Validate dates if provided
            if ($dateFrom && !strtotime($dateFrom)) {
                $errors[] = 'Invalid date_from format. Use YYYY-MM-DD format.';
            }
            if ($dateTo && !strtotime($dateTo)) {
                $errors[] = 'Invalid date_to format. Use YYYY-MM-DD format.';
            }

            // Validate date range logic
            if ($dateFrom && $dateTo && strtotime($dateFrom) > strtotime($dateTo)) {
                $errors[] = 'date_from cannot be later than date_to';
            }

            // Check if date range is not too large (optional - prevent performance issues)
            if ($dateFrom && $dateTo) {
                $daysDiff = (strtotime($dateTo) - strtotime($dateFrom)) / (60 * 60 * 24);
                if ($daysDiff > 365) {
                    $errors[] = 'Date range cannot exceed 365 days';
                }
            }

            // Validate numeric fields
            if ($categoryId && !is_numeric($categoryId)) {
                $errors[] = 'category_id must be numeric';
            }
            if ($subcategoryId && !is_numeric($subcategoryId)) {
                $errors[] = 'subcategory_id must be numeric';
            }
            if ($productId && !is_numeric($productId)) {
                $errors[] = 'product_id must be numeric';
            }

            // Validate comparison
            $validComparisons = ['previous_period', 'previous_year', 'none'];
            if ($comparison && !in_array($comparison, $validComparisons)) {
                $errors[] = 'Invalid comparison. Must be one of: ' . implode(', ', $validComparisons);
            }

            // Validate group_by
            $validGroupBy = ['day', 'week', 'month', 'quarter', 'year'];
            if ($groupBy && !in_array($groupBy, $validGroupBy)) {
                $errors[] = 'Invalid group_by. Must be one of: ' . implode(', ', $validGroupBy);
            }

            // Validate limit
            if ($limit < 1 || $limit > 100) {
                $errors[] = 'Limit must be between 1 and 100';
            }

            // If there are validation errors, return error response
            if (!empty($errors)) {
                return ResponseFormatter::error(
                    'Invalid parameters: ' . implode(', ', $errors),
                    [],
                    400
                );
            }

            // Parse metrics if provided
            $metricsArray = $metrics ? explode(',', $metrics) : null;

            // Build filters array
            $filters = [
                'period' => $period,
                'date_from' => $dateFrom,
                'date_to' => $dateTo,
                'status' => $status,
                'payment_method' => $paymentMethod,
                'payment_status' => $paymentStatus,
                'category_id' => $categoryId,
                'subcategory_id' => $subcategoryId,
                'product_id' => $productId,
                'state' => $state,
                'city' => $city,
                'pincode' => $pincode,
                'comparison' => $comparison,
                'group_by' => $groupBy,
                'metrics' => $metricsArray,
                'limit' => $limit,
                'include_details' => $includeDetails
            ];

            // Get order statistics
            $statistics = $this->getComprehensiveStatistics($filters);

            // Return response
            return ResponseFormatter::success(
                $statistics,
                'Order statistics retrieved successfully'
            );
        } catch (Exception $e) {
            return ResponseFormatter::error(
                'Failed to retrieve order statistics: ' . $e->getMessage(),
                [],
                500
            );
        }
    }

    private function getComprehensiveStatistics(array $filters): array
    {
        // Calculate date ranges based on period
        $dateRange = $this->calculateDateRange($filters['period'], $filters['date_from'], $filters['date_to']);
        $comparisonDateRange = $this->calculateComparisonDateRange($dateRange, $filters['comparison']);
        
        // Get overall statistics
        $overall = $this->getOverallStatistics($dateRange, $filters);
        
        // Get comparison statistics if requested
        $comparison = null;
        if ($filters['comparison'] !== 'none') {
            $comparison = $this->getOverallStatistics($comparisonDateRange, $filters);
        }
        
        // Get time series data if group_by is specified
        $timeSeries = null;
        if ($filters['group_by']) {
            $timeSeries = $this->getTimeSeriesData($dateRange, $filters);
        }
        
        // Get status breakdown
        $statusBreakdown = $this->getStatusBreakdown($dateRange, $filters);
        
        // Get payment method breakdown
        $paymentMethodBreakdown = $this->getPaymentMethodBreakdown($dateRange, $filters);
        
        // Get top products
        $topProducts = $this->getTopProducts($dateRange, $filters);
        
        // Get geographic distribution
        $geographicDistribution = $this->getGeographicDistribution($dateRange, $filters);
        
        // Get customer metrics
        $customerMetrics = $this->getCustomerMetrics($dateRange, $filters);
        
        // Get refund statistics
        $refundStats = $this->getRefundStatistics($dateRange, $filters);
        
        // Get detailed order data if requested
        $orderDetails = null;
        if ($filters['include_details']) {
            $orderDetails = $this->getOrderDetails($dateRange, $filters);
        }
        
        // Return comprehensive statistics
        return [
            'summary' => [
                'period' => $filters['period'],
                'date_range' => $dateRange,
                'comparison_date_range' => $comparisonDateRange,
                'overall' => $overall,
                'comparison' => $comparison,
                'growth' => $this->calculateGrowth($overall, $comparison)
            ],
            'time_series' => $timeSeries,
            'breakdowns' => [
                'by_status' => $statusBreakdown,
                'by_payment_method' => $paymentMethodBreakdown,
                'by_geography' => $geographicDistribution
            ],
            'products' => $topProducts,
            'customers' => $customerMetrics,
            'refunds' => $refundStats,
            'order_details' => $orderDetails
        ];
    }

    private function calculateDateRange(string $period, ?string $dateFrom, ?string $dateTo): array
    {
        $today = date('Y-m-d');
        $now = date('Y-m-d H:i:s');
        
        // If date_from and date_to are provided, treat as custom period regardless of period parameter
        if ($dateFrom && $dateTo) {
            return [
                'start' => $dateFrom . ' 00:00:00',
                'end' => $dateTo . ' 23:59:59',
                'label' => "Custom: $dateFrom to $dateTo"
            ];
        }
        
        // If only date_from is provided, use it as start date with today as end
        if ($dateFrom && !$dateTo) {
            return [
                'start' => $dateFrom . ' 00:00:00',
                'end' => $now,
                'label' => "From $dateFrom to today"
            ];
        }
        
        // If only date_to is provided, use predefined period logic but end at date_to
        if (!$dateFrom && $dateTo) {
            $endTime = $dateTo . ' 23:59:59';
            
            switch ($period) {
                case 'today':
                    return [
                        'start' => $dateTo . ' 00:00:00',
                        'end' => $endTime,
                        'label' => "Day: $dateTo"
                    ];
                case 'week':
                    $weekStart = date('Y-m-d', strtotime($dateTo . ' -7 days'));
                    return [
                        'start' => $weekStart . ' 00:00:00',
                        'end' => $endTime,
                        'label' => "Week ending $dateTo"
                    ];
                case 'month':
                    $monthStart = date('Y-m-d', strtotime($dateTo . ' -30 days'));
                    return [
                        'start' => $monthStart . ' 00:00:00',
                        'end' => $endTime,
                        'label' => "Month ending $dateTo"
                    ];
                default:
                    return [
                        'start' => $dateTo . ' 00:00:00',
                        'end' => $endTime,
                        'label' => "Day: $dateTo"
                    ];
            }
        }
        
        // Calculate based on predefined periods (no custom dates provided)
        switch ($period) {
            case 'today':
                return [
                    'start' => $today . ' 00:00:00',
                    'end' => $now,
                    'label' => 'Today'
                ];
            
            case 'yesterday':
                $yesterday = date('Y-m-d', strtotime('-1 day'));
                return [
                    'start' => $yesterday . ' 00:00:00',
                    'end' => $yesterday . ' 23:59:59',
                    'label' => 'Yesterday'
                ];
            
            case 'week':
                $weekStart = date('Y-m-d', strtotime('-7 days'));
                return [
                    'start' => $weekStart . ' 00:00:00',
                    'end' => $now,
                    'label' => 'Last 7 days'
                ];
            
            case 'month':
                $monthStart = date('Y-m-d', strtotime('-30 days'));
                return [
                    'start' => $monthStart . ' 00:00:00',
                    'end' => $now,
                    'label' => 'Last 30 days'
                ];
            
            case 'quarter':
                $quarterStart = date('Y-m-d', strtotime('-90 days'));
                return [
                    'start' => $quarterStart . ' 00:00:00',
                    'end' => $now,
                    'label' => 'Last 90 days'
                ];
            
            case 'year':
                $yearStart = date('Y-m-d', strtotime('-365 days'));
                return [
                    'start' => $yearStart . ' 00:00:00',
                    'end' => $now,
                    'label' => 'Last 365 days'
                ];
            
            case 'custom':
                // If custom period but no dates provided, default to last 30 days
                $monthStart = date('Y-m-d', strtotime('-30 days'));
                return [
                    'start' => $monthStart . ' 00:00:00',
                    'end' => $now,
                    'label' => 'Last 30 days (default)'
                ];
            
            default:
                // Default to last 30 days
                $monthStart = date('Y-m-d', strtotime('-30 days'));
                return [
                    'start' => $monthStart . ' 00:00:00',
                    'end' => $now,
                    'label' => 'Last 30 days'
                ];
        }
    }

    private function calculateComparisonDateRange(array $dateRange, string $comparison): array
    {
        $start = new \DateTime($dateRange['start']);
        $end = new \DateTime($dateRange['end']);
        $interval = $start->diff($end);
        
        $days = $interval->days + 1; // Include both start and end days
        
        if ($comparison === 'previous_period') {
            $newEnd = clone $start;
            $newEnd->modify('-1 day');
            $newStart = clone $newEnd;
            $newStart->modify("-{$days} days");
            
            return [
                'start' => $newStart->format('Y-m-d H:i:s'),
                'end' => $newEnd->format('Y-m-d H:i:s'),
                'label' => 'Previous Period'
            ];
        } else if ($comparison === 'previous_year') {
            return [
                'start' => date('Y-m-d H:i:s', strtotime($dateRange['start'] . ' -1 year')),
                'end' => date('Y-m-d H:i:s', strtotime($dateRange['end'] . ' -1 year')),
                'label' => 'Previous Year'
            ];
        }
        
        return $dateRange; // Default fallback
    }

    private function getOverallStatistics(array $dateRange, array $filters): array
    {
        $sql = "
            SELECT 
                COUNT(*) as total_orders,
                SUM(o.final_total) as total_revenue,
                AVG(o.final_total) as average_order_value,
                SUM(o.item_count) as total_items,
                SUM(o.total_quantity) as total_quantity,
                COUNT(DISTINCT o.user_id) as unique_customers,
                SUM(CASE WHEN o.payment_status = 'paid' THEN o.final_total ELSE 0 END) as collected_revenue,
                SUM(CASE WHEN o.payment_status = 'pending' THEN o.final_total ELSE 0 END) as pending_revenue,
                SUM(CASE WHEN o.status = 'cancelled' THEN o.final_total ELSE 0 END) as cancelled_value,
                SUM(o.coupon_discount_amount) as total_discounts,
                SUM(o.shipping_charges) as shipping_revenue,
                SUM(CASE WHEN o.status = 'delivered' THEN 1 ELSE 0 END) as delivered_orders,
                SUM(CASE WHEN o.status = 'returned' THEN 1 ELSE 0 END) as returned_orders,
                MIN(o.final_total) as min_order_value,
                MAX(o.final_total) as max_order_value
            FROM orders o
            LEFT JOIN payments p ON o.id = p.order_id
            LEFT JOIN order_shipping os ON o.id = os.order_id
            WHERE o.order_date BETWEEN :start_date AND :end_date
        ";
    
    $params = [
        ':start_date' => $dateRange['start'],
        ':end_date' => $dateRange['end']
    ];
    
    // Add additional filters
    list($additionalWhere, $additionalParams) = $this->buildAdditionalFilters($filters);
    if ($additionalWhere) {
        $sql .= " AND " . $additionalWhere;
        $params = array_merge($params, $additionalParams);
    }
    
    $stmt = $this->db->prepare($sql);
    foreach ($params as $key => $value) {
        $stmt->bindValue($key, $value);
    }
    $stmt->execute();
    $result = $stmt->fetch(PDO::FETCH_ASSOC);
    
    // Calculate additional metrics
    $result['conversion_rate'] = null;
    $result['refund_rate'] = $result['total_orders'] > 0 ? ($result['returned_orders'] / $result['total_orders']) * 100 : 0;
    $result['cancellation_rate'] = $result['total_orders'] > 0 ? ($result['cancelled_value'] / ($result['total_revenue'] ?: 1)) * 100 : 0;
    $result['discount_rate'] = $result['total_revenue'] > 0 ? ($result['total_discounts'] / $result['total_revenue']) * 100 : 0;
    
    return $result;
}

    private function getTimeSeriesData(array $dateRange, array $filters): array
    {
        $groupBy = $filters['group_by'] ?? 'day';
        
        // Define date format based on grouping
        $dateFormat = '%Y-%m-%d'; // Default for day
        $groupByClause = "DATE(order_date)";
        
        switch ($groupBy) {
            case 'week':
                $dateFormat = '%Y-%u'; // Year and week number
                $groupByClause = "YEARWEEK(order_date, 1)";
                break;
            case 'month':
                $dateFormat = '%Y-%m'; // Year and month
                $groupByClause = "DATE_FORMAT(order_date, '%Y-%m')";
                break;
            case 'quarter':
                $dateFormat = '%Y-Q%q'; // Year and quarter
                $groupByClause = "CONCAT(YEAR(order_date), '-Q', QUARTER(order_date))";
                break;
            case 'year':
                $dateFormat = '%Y'; // Year only
                $groupByClause = "YEAR(order_date)";
                break;
        }
        
        $sql = "
            SELECT 
                {$groupByClause} as period,
                DATE_FORMAT(MIN(o.order_date), '{$dateFormat}') as formatted_period,
                COUNT(*) as orders,
                SUM(o.final_total) as revenue,
                AVG(o.final_total) as aov,
                SUM(o.item_count) as items,
                COUNT(DISTINCT o.user_id) as customers
            FROM orders o
            WHERE o.order_date BETWEEN :start_date AND :end_date
        ";
        
        $params = [
            ':start_date' => $dateRange['start'],
            ':end_date' => $dateRange['end']
        ];
        
        // Add additional filters
        list($additionalWhere, $additionalParams) = $this->buildAdditionalFilters($filters);
        if ($additionalWhere) {
            $sql .= " AND " . $additionalWhere;
            $params = array_merge($params, $additionalParams);
        }
        
        $sql .= " GROUP BY {$groupByClause} ORDER BY MIN(o.order_date) ASC";
        
        $stmt = $this->db->prepare($sql);
        foreach ($params as $key => $value) {
            $stmt->bindValue($key, $value);
        }
        $stmt->execute();
        
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    private function getStatusBreakdown(array $dateRange, array $filters): array
    {
        $sql = "
            SELECT 
                o.status,
                COUNT(*) as count,
                SUM(o.final_total) as revenue,
                AVG(o.final_total) as average_value,
                SUM(o.item_count) as items,
                SUM(o.total_quantity) as quantity
            FROM orders o
            WHERE o.order_date BETWEEN :start_date AND :end_date
        ";
        
        $params = [
            ':start_date' => $dateRange['start'],
            ':end_date' => $dateRange['end']
        ];
        
        // Add additional filters
        list($additionalWhere, $additionalParams) = $this->buildAdditionalFilters($filters);
        if ($additionalWhere) {
            $sql .= " AND " . $additionalWhere;
            $params = array_merge($params, $additionalParams);
        }
        
        $sql .= " GROUP BY status ORDER BY count DESC";
        
        $stmt = $this->db->prepare($sql);
        foreach ($params as $key => $value) {
            $stmt->bindValue($key, $value);
        }
        $stmt->execute();
        
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    private function getPaymentMethodBreakdown(array $dateRange, array $filters): array
    {
        $sql = "
            SELECT 
                p.payment_method,
                COUNT(*) as count,
                SUM(o.final_total) as revenue,
                AVG(o.final_total) as average_value,
                COUNT(DISTINCT o.user_id) as unique_customers
            FROM orders o
            LEFT JOIN payments p ON o.id = p.order_id
            WHERE o.order_date BETWEEN :start_date AND :end_date
        ";
        
        $params = [
            ':start_date' => $dateRange['start'],
            ':end_date' => $dateRange['end']
        ];
        
        // Add additional filters
        list($additionalWhere, $additionalParams) = $this->buildAdditionalFilters($filters);
        if ($additionalWhere) {
            $sql .= " AND " . $additionalWhere;
            $params = array_merge($params, $additionalParams);
        }
        
        $sql .= " GROUP BY p.payment_method ORDER BY count DESC";
        
        $stmt = $this->db->prepare($sql);
        foreach ($params as $key => $value) {
            $stmt->bindValue($key, $value);
        }
        $stmt->execute();
        
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    private function getTopProducts(array $dateRange, array $filters): array
    {
        $limit = $filters['limit'] ?? 10;
        
        $sql = "
            SELECT 
                oi.product_id,
                oi.product_name,
                oi.product_sku,
                SUM(oi.quantity) as quantity_sold,
                COUNT(DISTINCT o.id) as order_count,
                SUM(oi.line_total) as revenue,
                AVG(oi.selling_price) as average_price
            FROM order_items oi
            JOIN orders o ON oi.order_id = o.id
            WHERE o.order_date BETWEEN :start_date AND :end_date
        ";
        
        $params = [
            ':start_date' => $dateRange['start'],
            ':end_date' => $dateRange['end']
        ];
        
        // Add additional filters
        list($additionalWhere, $additionalParams) = $this->buildAdditionalFilters($filters);
        if ($additionalWhere) {
            $sql .= " AND " . $additionalWhere;
            $params = array_merge($params, $additionalParams);
        }
        
        $sql .= " GROUP BY oi.product_id, oi.product_name, oi.product_sku 
                  ORDER BY quantity_sold DESC 
                  LIMIT :limit";
        
        $stmt = $this->db->prepare($sql);
        foreach ($params as $key => $value) {
            $stmt->bindValue($key, $value);
        }
        $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
        $stmt->execute();
        
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    private function getGeographicDistribution(array $dateRange, array $filters): array
    {
        $sql = "
            SELECT 
                os.state,
                os.city,
                COUNT(*) as order_count,
                SUM(o.final_total) as revenue,
                COUNT(DISTINCT o.user_id) as customer_count,
                AVG(o.final_total) as average_order_value
            FROM orders o
            JOIN order_shipping os ON o.id = os.order_id
            WHERE o.order_date BETWEEN :start_date AND :end_date
        ";
        
        $params = [
            ':start_date' => $dateRange['start'],
            ':end_date' => $dateRange['end']
        ];
        
        // Add additional filters
        list($additionalWhere, $additionalParams) = $this->buildAdditionalFilters($filters);
        if ($additionalWhere) {
            $sql .= " AND " . $additionalWhere;
            $params = array_merge($params, $additionalParams);
        }
        
        $sql .= " GROUP BY os.state, os.city ORDER BY order_count DESC";
        
        $stmt = $this->db->prepare($sql);
        foreach ($params as $key => $value) {
            $stmt->bindValue($key, $value);
        }
        $stmt->execute();
        
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    private function getCustomerMetrics(array $dateRange, array $filters): array
{
    $sql = "
        SELECT 
            COUNT(DISTINCT user_id) as total_customers,
            COUNT(*) / GREATEST(COUNT(DISTINCT user_id), 1) as orders_per_customer,
            SUM(final_total) / GREATEST(COUNT(DISTINCT user_id), 1) as revenue_per_customer,
            COUNT(CASE WHEN user_id IN (
                SELECT DISTINCT user_id FROM orders 
                WHERE order_date < :start_date_check
            ) THEN 1 END) as returning_customers,
            COUNT(CASE WHEN user_id NOT IN (
                SELECT DISTINCT user_id FROM orders 
                WHERE order_date < :start_date_check2
            ) THEN 1 END) as new_customers
        FROM orders o
        WHERE order_date BETWEEN :start_date AND :end_date
    ";
    
    $params = [
        ':start_date' => $dateRange['start'],
        ':end_date' => $dateRange['end'],
        ':start_date_check' => $dateRange['start'],
        ':start_date_check2' => $dateRange['start']
    ];
    
    // Add additional filters
    list($additionalWhere, $additionalParams) = $this->buildAdditionalFilters($filters);
    if ($additionalWhere) {
        $sql .= " AND " . $additionalWhere;
        $params = array_merge($params, $additionalParams);
    }
    
    $stmt = $this->db->prepare($sql);
    foreach ($params as $key => $value) {
        $stmt->bindValue($key, $value);
    }
    $stmt->execute();
    $basicMetrics = $stmt->fetch(PDO::FETCH_ASSOC);
    
    // Get top customers
    $limit = $filters['limit'] ?? 10;
    $sql2 = "
        SELECT 
            o.user_id,
            CONCAT(COALESCE(up.first_name, ''), ' ', COALESCE(up.last_name, '')) as customer_name,
            up.email,
            u.phone_number,
            COUNT(*) as order_count,
            SUM(o.final_total) as total_spent,
            MAX(o.order_date) as last_order_date
        FROM orders o
        LEFT JOIN users u ON o.user_id = u.id
        LEFT JOIN user_profiles up ON u.id = up.user_id
        WHERE o.order_date BETWEEN :start_date AND :end_date
    ";
    
    $params2 = [
        ':start_date' => $dateRange['start'],
        ':end_date' => $dateRange['end']
    ];
    
    // Add additional filters
    if ($additionalWhere) {
        $sql2 .= " AND " . $additionalWhere;
        $params2 = array_merge($params2, $additionalParams);
    }
    
    $sql2 .= " GROUP BY o.user_id, customer_name, up.email, u.phone_number
              ORDER BY total_spent DESC
              LIMIT :limit";
    
    $stmt2 = $this->db->prepare($sql2);
    foreach ($params2 as $key => $value) {
        $stmt2->bindValue($key, $value);
    }
    $stmt2->bindValue(':limit', $limit, PDO::PARAM_INT);
    $stmt2->execute();
    $topCustomers = $stmt2->fetchAll(PDO::FETCH_ASSOC);
    
    return [
        'metrics' => $basicMetrics,
        'top_customers' => $topCustomers
    ];
}

    private function getRefundStatistics(array $dateRange, array $filters): array
{
    $sql = "
        SELECT 
            COUNT(*) as total_refunds,
            SUM(p.refund_amount) as total_refund_amount,
            AVG(p.refund_amount) as average_refund_amount
        FROM payments p
        JOIN orders o ON p.order_id = o.id
        WHERE o.order_date BETWEEN :start_date AND :end_date
        AND p.refund_amount > 0
    ";
    
    $params = [
        ':start_date' => $dateRange['start'],
        ':end_date' => $dateRange['end']
    ];
    
    // Add additional filters
    list($additionalWhere, $additionalParams) = $this->buildAdditionalFilters($filters);
    if ($additionalWhere) {
        $sql .= " AND " . $additionalWhere;
        $params = array_merge($params, $additionalParams);
    }
    
    $stmt = $this->db->prepare($sql);
    foreach ($params as $key => $value) {
        $stmt->bindValue($key, $value);
    }
    $stmt->execute();
    $overallStats = $stmt->fetch(PDO::FETCH_ASSOC);
    
    // Calculate refund rate separately
    $totalOrdersSql = "SELECT COUNT(*) as total FROM orders WHERE order_date BETWEEN :start_date AND :end_date";
    $totalStmt = $this->db->prepare($totalOrdersSql);
    $totalStmt->bindValue(':start_date', $dateRange['start']);
    $totalStmt->bindValue(':end_date', $dateRange['end']);
    $totalStmt->execute();
    $totalOrders = $totalStmt->fetch(PDO::FETCH_ASSOC)['total'];
    
    $overallStats['refund_rate'] = $totalOrders > 0 ? ($overallStats['total_refunds'] / $totalOrders) * 100 : 0;
    
    // Get refund reasons
    $sql2 = "
        SELECT 
            p.refund_reason,
            COUNT(*) as count,
            SUM(p.refund_amount) as total_amount,
            AVG(p.refund_amount) as average_amount
        FROM payments p
        JOIN orders o ON p.order_id = o.id
        WHERE o.order_date BETWEEN :start_date AND :end_date
        AND p.refund_amount > 0
    ";
    
    $params2 = [
        ':start_date' => $dateRange['start'],
        ':end_date' => $dateRange['end']
    ];
    
    // Add additional filters
    if ($additionalWhere) {
        $sql2 .= " AND " . $additionalWhere;
        $params2 = array_merge($params2, $additionalParams);
    }
    
    $sql2 .= " GROUP BY p.refund_reason ORDER BY count DESC";
    
    $stmt2 = $this->db->prepare($sql2);
    foreach ($params2 as $key => $value) {
        $stmt2->bindValue($key, $value);
    }
    $stmt2->execute();
    $reasonBreakdown = $stmt2->fetchAll(PDO::FETCH_ASSOC);
    
    return [
        'overall' => $overallStats,
        'by_reason' => $reasonBreakdown
    ];
}

    private function getOrderDetails(array $dateRange, array $filters): array
    {
        $limit = $filters['limit'] ?? 100;
        
        $sql = "
            SELECT 
                o.id,
                o.order_number,
                o.order_date,
                o.status,
                o.payment_status,
                o.final_total,
                o.item_count,
                o.total_quantity,
                CONCAT(COALESCE(up.first_name, ''), ' ', COALESCE(up.last_name, '')) as customer_name,
                u.phone_number,
                p.payment_method,
                os.city,
                os.state
            FROM orders o
            LEFT JOIN users u ON o.user_id = u.id
            LEFT JOIN user_profiles up ON u.id = up.user_id
            LEFT JOIN payments p ON o.id = p.order_id
            LEFT JOIN order_shipping os ON o.id = os.order_id
            WHERE o.order_date BETWEEN :start_date AND :end_date
        ";
        
        $params = [
            ':start_date' => $dateRange['start'],
            ':end_date' => $dateRange['end']
        ];
        
        // Add additional filters
        list($additionalWhere, $additionalParams) = $this->buildAdditionalFilters($filters);
        if ($additionalWhere) {
            $sql .= " AND " . $additionalWhere;
            $params = array_merge($params, $additionalParams);
        }
        
        $sql .= " ORDER BY o.order_date DESC LIMIT :limit";
        
        $stmt = $this->db->prepare($sql);
        foreach ($params as $key => $value) {
            $stmt->bindValue($key, $value);
        }
        $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
        $stmt->execute();
        
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    private function buildAdditionalFilters(array $filters): array
    {
        $conditions = [];
        $params = [];
        
        if (!empty($filters['status'])) {
            $conditions[] = "o.status = :status";
            $params[':status'] = $filters['status'];
        }
        
        if (!empty($filters['payment_method'])) {
            $conditions[] = "p.payment_method = :payment_method";
            $params[':payment_method'] = $filters['payment_method'];
        }
        
        if (!empty($filters['payment_status'])) {
            $conditions[] = "o.payment_status = :payment_status";
            $params[':payment_status'] = $filters['payment_status'];
        }
        
        if (!empty($filters['category_id'])) {
            $conditions[] = "EXISTS (
                SELECT 1 FROM order_items oi 
                JOIN products prod ON oi.product_id = prod.id
                WHERE oi.order_id = o.id AND prod.category_id = :category_id
            )";
            $params[':category_id'] = $filters['category_id'];
        }
        
        if (!empty($filters['subcategory_id'])) {
            $conditions[] = "EXISTS (
                SELECT 1 FROM order_items oi 
                JOIN products prod ON oi.product_id = prod.id
                WHERE oi.order_id = o.id AND prod.subcategory_id = :subcategory_id
            )";
            $params[':subcategory_id'] = $filters['subcategory_id'];
        }
        
        if (!empty($filters['product_id'])) {
            $conditions[] = "EXISTS (
                SELECT 1 FROM order_items oi 
                WHERE oi.order_id = o.id AND oi.product_id = :product_id
            )";
            $params[':product_id'] = $filters['product_id'];
        }
        
        if (!empty($filters['state'])) {
            $conditions[] = "os.state = :state";
            $params[':state'] = $filters['state'];
        }
        
        if (!empty($filters['city'])) {
            $conditions[] = "os.city = :city";
            $params[':city'] = $filters['city'];
        }
        
        if (!empty($filters['pincode'])) {
            $conditions[] = "os.postal_code = :pincode";
            $params[':pincode'] = $filters['pincode'];
        }
        
        return [
            implode(" AND ", $conditions),
            $params
        ];
    }

    private function calculateGrowth(array $current, ?array $previous): array
    {
        if (!$previous) {
            return [
                'orders' => null,
                'revenue' => null,
                'aov' => null,
                'items' => null
            ];
        }
        
        $calculatePercentage = function($current, $previous) {
            if ($previous == 0) return null;
            return (($current - $previous) / $previous) * 100;
        };
        
        return [
            'orders' => $calculatePercentage(
                $current['total_orders'] ?? 0, 
                $previous['total_orders'] ?? 0
            ),
            'revenue' => $calculatePercentage(
                $current['total_revenue'] ?? 0, 
                $previous['total_revenue'] ?? 0
            ),
            'aov' => $calculatePercentage(
                $current['average_order_value'] ?? 0, 
                $previous['average_order_value'] ?? 0
            ),
            'items' => $calculatePercentage(
                $current['total_items'] ?? 0, 
                $previous['total_items'] ?? 0
            ),
            'customers' => $calculatePercentage(
                $current['unique_customers'] ?? 0, 
                $previous['unique_customers'] ?? 0
            )
        ];
    }
}
