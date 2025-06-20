<?php

namespace App\Shared\Helpers;

class ResponseFormatter
{
    /**
     * Format a success response
     *
     * @param mixed $data Response data
     * @param string $message Success message
     * @param array $meta Meta information
     * @return array Formatted response
     */
    public static function success($data = null, $message = 'Success', $meta = [])
    {
        return [
            'status' => 'success',
            'message' => $message,
            'data' => $data,
            'meta' => $meta
        ];
    }

    /**
     * Format an error response
     *
     * @param string $message Error message
     * @param array $errors Detailed errors
     * @param string $code Error code
     * @return array Formatted response
     */
    public static function error($message = 'Error', $errors = [], $code = null)
    {
        $response = [
            'status' => 'error',
            'message' => $message
        ];
        
        if (!empty($errors)) {
            $response['errors'] = $errors;
        }
        
        if ($code !== null) {
            $response['code'] = $code;
        }
        
        return $response;
    }

    /**
     * Format a paginated response
     *
     * @param array $data Response data
     * @param int $page Current page
     * @param int $perPage Items per page
     * @param int $total Total items
     * @param string $message Success message
     * @return array Formatted response
     */
    public static function paginate($data, $page, $perPage, $total, $message = 'Success')
    {
        $totalPages = ceil($total / $perPage);
        
        return [
            'status' => 'success',
            'message' => $message,
            'data' => $data,
            'meta' => [
                'pagination' => [
                    'total' => $total,
                    'per_page' => $perPage,
                    'current_page' => $page,
                    'total_pages' => $totalPages,
                    'has_next_page' => $page < $totalPages,
                    'has_prev_page' => $page > 1
                ]
            ]
        ];
    }

    /**
     * Format a response with links
     *
     * @param mixed $data Response data
     * @param array $links Related links
     * @param string $message Success message
     * @return array Formatted response
     */
    public static function withLinks($data, $links = [], $message = 'Success')
    {
        return [
            'status' => 'success',
            'message' => $message,
            'data' => $data,
            'links' => $links
        ];
    }
}
