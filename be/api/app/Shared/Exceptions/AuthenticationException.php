<?php

namespace App\Shared\Exceptions;

class AuthenticationException extends ApiException
{
    public function __construct($message = 'Authentication failed')
    {
        parent::__construct($message, 401, 'AUTHENTICATION_ERROR');
    }
}
