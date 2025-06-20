<?php

return [
   /*
   |--------------------------------------------------------------------------
   | Cross-Origin Resource Sharing (CORS) Configuration
   |--------------------------------------------------------------------------
   */
   'allowed_origins' => explode(',', $_ENV['CORS_ALLOWED_ORIGINS'] ?? '*'),
   'allowed_methods' => explode(',', $_ENV['CORS_ALLOWED_METHODS'] ?? 'GET,POST,PUT,DELETE,OPTIONS'),
   'allowed_headers' => explode(',', $_ENV['CORS_ALLOWED_HEADERS'] ?? 'Content-Type,Authorization,X-Requested-With,Accept'),
   'exposed_headers' => [],
   'max_age' => (int) ($_ENV['CORS_MAX_AGE'] ?? 86400),
   'supports_credentials' => false,
];
