<?php

namespace App\Shared\Exceptions;

class NotFoundException extends ApiException
{
    public function __construct($message = 'Resource not found')
    {
        parent::__construct($message, 404, 'NOT_FOUND_ERROR');
    }
}
