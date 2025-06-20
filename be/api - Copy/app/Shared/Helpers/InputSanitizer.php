<?php

namespace App\Shared\Helpers;

class InputSanitizer
{
    /**
     * Sanitize input data
     *
     * @param mixed $input Input data to sanitize
     * @param string $type Type of sanitization to apply
     * @return mixed Sanitized data
     */
    public static function sanitize($input, $type = 'string')
    {
        if (is_array($input)) {
            return self::sanitizeArray($input, $type);
        }
        
        switch ($type) {
            case 'string':
                return self::sanitizeString($input);
                
            case 'email':
                return self::sanitizeEmail($input);
                
            case 'int':
            case 'integer':
                return self::sanitizeInteger($input);
                
            case 'float':
                return self::sanitizeFloat($input);
                
            case 'url':
                return self::sanitizeUrl($input);
                
            case 'html':
                return self::sanitizeHtml($input);
                
            case 'sql':
                return self::sanitizeSql($input);
                
            default:
                return self::sanitizeString($input);
        }
    }

    /**
     * Sanitize an array of inputs
     *
     * @param array $input Array of inputs
     * @param string $type Type of sanitization to apply
     * @return array Sanitized array
     */
    public static function sanitizeArray($input, $type = 'string')
    {
        $sanitized = [];
        
        foreach ($input as $key => $value) {
            if (is_array($value)) {
                $sanitized[$key] = self::sanitizeArray($value, $type);
            } else {
                $sanitized[$key] = self::sanitize($value, $type);
            }
        }
        
        return $sanitized;
    }

    /**
     * Sanitize a string
     *
     * @param string $input String to sanitize
     * @return string Sanitized string
     */
    public static function sanitizeString($input)
    {
        if (is_string($input)) {
            // Remove invisible characters
            $input = preg_replace('/[\x00-\x1F\x7F]/u', '', $input);
            
            // Convert special characters to HTML entities
            return htmlspecialchars($input, ENT_QUOTES, 'UTF-8');
        }
        
        return $input;
    }

    /**
     * Sanitize an email address
     *
     * @param string $input Email to sanitize
     * @return string Sanitized email
     */
    public static function sanitizeEmail($input)
    {
        return filter_var($input, FILTER_SANITIZE_EMAIL);
    }

    /**
     * Sanitize an integer
     *
     * @param mixed $input Integer to sanitize
     * @return int Sanitized integer
     */
    public static function sanitizeInteger($input)
    {
        return filter_var($input, FILTER_SANITIZE_NUMBER_INT);
    }

    /**
     * Sanitize a float
     *
     * @param mixed $input Float to sanitize
     * @return float Sanitized float
     */
    public static function sanitizeFloat($input)
    {
        return filter_var($input, FILTER_SANITIZE_NUMBER_FLOAT, FILTER_FLAG_ALLOW_FRACTION);
    }

    /**
     * Sanitize a URL
     *
     * @param string $input URL to sanitize
     * @return string Sanitized URL
     */
    public static function sanitizeUrl($input)
    {
        return filter_var($input, FILTER_SANITIZE_URL);
    }

    /**
     * Sanitize HTML content
     *
     * @param string $input HTML to sanitize
     * @return string Sanitized HTML
     */
    public static function sanitizeHtml($input)
    {
        // Allow basic HTML tags
        $allowedTags = '<p><br><a><strong><em><ul><ol><li><h1><h2><h3><h4><h5><h6><blockquote><pre><code><img><table><tr><td><th>';
        
        // Strip all tags not in the allowed list
        $input = strip_tags($input, $allowedTags);
        
        // Remove any potential XSS attacks
        $input = preg_replace('/(on\w+)=".*?"/s', '', $input);
        $input = preg_replace('/javascript:[^\s]*/i', '', $input);
        
        return $input;
    }

    /**
     * Sanitize SQL input
     *
     * @param string $input SQL to sanitize
     * @return string Sanitized SQL
     */
    public static function sanitizeSql($input)
    {
        // This is a basic sanitization, in practice use prepared statements
        if (is_string($input)) {
            return addslashes($input);
        }
        
        return $input;
    }
}
