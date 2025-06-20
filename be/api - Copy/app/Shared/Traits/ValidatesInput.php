<?php

namespace App\Shared\Traits;

use App\Shared\Exceptions\ValidationException;
use App\Shared\Helpers\InputValidator;
use App\Shared\Helpers\InputSanitizer;

trait ValidatesInput
{
    /**
     * Validate input data against rules
     *
     * @param array $data Input data
     * @param array $rules Validation rules
     * @return array Validated data
     * @throws ValidationException
     */
    protected function validate($data, $rules)
    {
        return InputValidator::validate($data, $rules);
    }

    /**
     * Sanitize input data
     *
     * @param mixed $input Input data to sanitize
     * @param string $type Type of sanitization to apply
     * @return mixed Sanitized data
     */
    protected function sanitize($input, $type = 'string')
    {
        return InputSanitizer::sanitize($input, $type);
    }

    /**
     * Validate and sanitize input data
     *
     * @param array $data Input data
     * @param array $rules Validation rules
     * @param array $sanitizationTypes Sanitization types
     * @return array Validated and sanitized data
     * @throws ValidationException
     */
    protected function validateAndSanitize($data, $rules, $sanitizationTypes = [])
    {
        // Validate input
        $validatedData = $this->validate($data, $rules);
        
        // Sanitize input
        $sanitizedData = [];
        
        foreach ($validatedData as $key => $value) {
            $type = $sanitizationTypes[$key] ?? 'string';
            $sanitizedData[$key] = $this->sanitize($value, $type);
        }
        
        return $sanitizedData;
    }
}
