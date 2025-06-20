<?php

/**
 * Get configuration value
 *
 * @param string $key Configuration key using dot notation
 * @param mixed $default Default value if key not found
 * @return mixed Configuration value
 */
function config($key, $default = null)
{
    $keys = explode('.', $key);
    $config = include APP_ROOT . '/config/' . $keys[0] . '.php';
    
    array_shift($keys);
    
    foreach ($keys as $k) {
        if (!isset($config[$k])) {
            return $default;
        }
        $config = $config[$k];
    }
    
    return $config;
}

/**
 * Log message to file
 *
 * @param string $message Message to log
 * @param string $level Log level (info, error, warning, debug)
 * @param string $file Log file name
 * @return void
 */
function log_message($message, $level = 'info', $file = 'app.log')
{
    $timestamp = date('Y-m-d H:i:s');
    $logDir = APP_ROOT . '/storage/logs/';
    
    if (!is_dir($logDir)) {
        mkdir($logDir, 0755, true);
    }
    
    $logFile = $logDir . $file;
    $logMessage = "[$timestamp] [$level] $message" . PHP_EOL;
    
    file_put_contents($logFile, $logMessage, FILE_APPEND);
}

/**
 * Generate a random string
 *
 * @param int $length Length of the string
 * @return string Random string
 */
function generate_random_string($length = 32)
{
    return bin2hex(random_bytes($length / 2));
}

/**
 * Hash password
 *
 * @param string $password Password to hash
 * @return string Hashed password
 */
function hash_password($password)
{
    return password_hash($password, PASSWORD_BCRYPT, ['cost' => 12]);
}

/**
 * Verify password
 *
 * @param string $password Password to verify
 * @param string $hash Hash to compare against
 * @return bool Password matches hash
 */
function verify_password($password, $hash)
{
    return password_verify($password, $hash);
}
