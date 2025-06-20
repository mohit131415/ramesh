<?php

namespace App\Shared\Exceptions;

class AuthorizationException extends ApiException
{
    public function __construct($message = 'Insufficient permissions')
    {
        parent::__construct($message, 403, 'AUTHORIZATION_ERROR');
    }
}
