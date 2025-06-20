<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Password Salt
    |--------------------------------------------------------------------------
    */
    'password_salt' => $_ENV['SECURITY_PASSWORD_SALT'] ?? '',

    /*
    |--------------------------------------------------------------------------
    | JWT Settings
    |--------------------------------------------------------------------------
    */
    'jwt' => [
        'secret' => $_ENV['JWT_SECRET'] ?? '',
        'algorithm' => $_ENV['JWT_ALGORITHM'] ?? 'HS256',
        'expiry' => (int) ($_ENV['JWT_EXPIRY'] ?? 3600), // Default fallback
        'refresh_expiry' => (int) ($_ENV['JWT_REFRESH_EXPIRY'] ?? 604800), // Default fallback
        
        // Admin specific JWT settings
        'admin_expiry' => (int) $_ENV['JWT_ADMIN_EXPIRY'], // 4 hours - no fallback, must be set
        'admin_refresh_expiry' => (int) $_ENV['JWT_ADMIN_REFRESH_EXPIRY'], // 1 day - no fallback, must be set
        
        // User specific JWT settings  
        'user_expiry' => (int) $_ENV['JWT_USER_EXPIRY'], // 1 day - no fallback, must be set
        'user_refresh_expiry' => (int) $_ENV['JWT_USER_REFRESH_EXPIRY'], // 1 week - no fallback, must be set
    ],

    /*
    |--------------------------------------------------------------------------
    | Rate Limiting
    |--------------------------------------------------------------------------
    */
    'rate_limiting' => [
        'enabled' => true,
        'max_attempts' => 60,
        'decay_minutes' => 1,
    ],

    /*
    |--------------------------------------------------------------------------
    | Login Throttling
    |--------------------------------------------------------------------------
    */
    'login_throttling' => [
        'enabled' => true,
        'max_attempts' => 5,
        'decay_minutes' => 15,
    ],
];
