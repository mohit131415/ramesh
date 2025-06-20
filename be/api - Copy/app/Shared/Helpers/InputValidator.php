<?php

namespace App\Shared\Helpers;

use App\Shared\Exceptions\ValidationException;
use Respect\Validation\Validator as v;

class InputValidator
{
    /**
     * Validate input data against rules
     *
     * @param array $data Input data
     * @param array $rules Validation rules
     * @return array Validated data
     * @throws ValidationException
     */
    public static function validate($data, $rules)
    {
        $errors = [];
        $validatedData = [];
        
        foreach ($rules as $field => $rule) {
            try {
                // Check if field exists in data
                if (!isset($data[$field]) && strpos($rule, 'required') !== false) {
                    throw new \Exception("$field is required");
                }
                
                // Get field value
                $value = $data[$field] ?? null;
                
                // Apply validation rules
                self::applyRules($field, $value, $rule);
                
                // Add to validated data
                $validatedData[$field] = $value;
            } catch (\Exception $e) {
                $errors[$field] = $e->getMessage();
            }
        }
        
        if (!empty($errors)) {
            throw new ValidationException('Validation failed', $errors);
        }
        
        return $validatedData;
    }

    /**
     * Apply validation rules to a field
     *
     * @param string $field Field name
     * @param mixed $value Field value
     * @param string $ruleString Rule string
     * @return bool True if validation passes
     * @throws \Exception
     */
    private static function applyRules($field, $value, $ruleString)
    {
        $rules = explode('|', $ruleString);
        
        foreach ($rules as $rule) {
            $params = [];
            
            // Check if rule has parameters
            if (strpos($rule, ':') !== false) {
                list($rule, $paramString) = explode(':', $rule, 2);
                $params = explode(',', $paramString);
            }
            
            // Apply rule
            switch ($rule) {
                case 'required':
                    if (empty($value) && $value !== '0' && $value !== 0) {
                        throw new \Exception("$field is required");
                    }
                    break;
                    
                case 'email':
                    if (!empty($value) && !v::email()->validate($value)) {
                        throw new \Exception("$field must be a valid email address");
                    }
                    break;
                    
                case 'min':
                    $min = (int) ($params[0] ?? 0);
                    if (is_string($value) && strlen($value) < $min) {
                        throw new \Exception("$field must be at least $min characters");
                    } elseif (is_numeric($value) && $value < $min) {
                        throw new \Exception("$field must be at least $min");
                    }
                    break;
                    
                case 'max':
                    $max = (int) ($params[0] ?? 0);
                    if (is_string($value) && strlen($value) > $max) {
                        throw new \Exception("$field must be at most $max characters");
                    } elseif (is_numeric($value) && $value > $max) {
                        throw new \Exception("$field must be at most $max");
                    }
                    break;
                    
                case 'numeric':
                    if (!empty($value) && !is_numeric($value)) {
                        throw new \Exception("$field must be numeric");
                    }
                    break;
                    
                case 'alpha':
                    if (!empty($value) && !v::alpha()->validate($value)) {
                        throw new \Exception("$field must contain only letters");
                    }
                    break;
                    
                case 'alphanumeric':
                    if (!empty($value) && !v::alnum()->validate($value)) {
                        throw new \Exception("$field must contain only letters and numbers");
                    }
                    break;
                    
                case 'date':
                    if (!empty($value) && !v::date()->validate($value)) {
                        throw new \Exception("$field must be a valid date");
                    }
                    break;
                    
                case 'in':
                    if (!empty($value) && !in_array($value, $params)) {
                        throw new \Exception("$field must be one of: " . implode(', ', $params));
                    }
                    break;
                    
                case 'url':
                    if (!empty($value) && !v::url()->validate($value)) {
                        throw new \Exception("$field must be a valid URL");
                    }
                    break;
                    
                case 'confirmed':
                    $confirmation = $field . '_confirmation';
                    if (!isset($_REQUEST[$confirmation]) || $value !== $_REQUEST[$confirmation]) {
                        throw new \Exception("$field confirmation does not match");
                    }
                    break;
            }
        }
        
        return true;
    }
}
