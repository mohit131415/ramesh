<?php

namespace App\Features\Authentication\Actions;

use App\Core\Request;
use App\Core\Response;
use App\Core\Security\Authentication;
use App\Shared\Exceptions\AuthenticationException;
use Exception;
use DateTime;
use DateTimeZone;

class ValidateToken
{
   private $authentication;

   public function __construct()
   {
       $this->authentication = Authentication::getInstance();
   }

   public function execute(Request $request, Response $response)
   {
       try {
           // Get token from Authorization header
           $token = $request->getBearerToken();
           
           if (!$token) {
               return [
                   'status' => 'error',
                   'message' => 'No token provided',
                   'data' => [
                       'valid' => false
                   ]
               ];
           }
           
           // Try to validate the token
           try {
               $payload = $this->authentication->validateToken($token);
               
               // Set timezone for proper time display
               $timezone = new DateTimeZone(config('app.timezone'));
               $currentTime = new DateTime();
               $currentTime->setTimezone($timezone);
               
               $expiresAt = null;
               if (isset($payload->exp)) {
                   $expiresDateTime = new DateTime('@' . $payload->exp);
                   $expiresDateTime->setTimezone($timezone);
                   $expiresAt = $expiresDateTime->format('Y-m-d H:i:s');
               }
               
               // If we get here, the token is valid
               return [
                   'status' => 'success',
                   'message' => 'Token is valid',
                   'data' => [
                       'valid' => true,
                       'expires_at' => $expiresAt,
                       'current_time' => $currentTime->format('Y-m-d H:i:s'),
                       'user_id' => $payload->sub,
                       'role' => $payload->role ?? null,
                       'user_type' => $payload->user_type ?? 'admin'
                   ]
               ];
           } catch (AuthenticationException $e) {
               // Token is invalid
               return [
                   'status' => 'error',
                   'message' => 'Token is invalid',
                   'data' => [
                       'valid' => false,
                       'reason' => $e->getMessage()
                   ]
               ];
           }
       } catch (Exception $e) {
           // Something went wrong
           return [
               'status' => 'error',
               'message' => 'Error validating token: ' . $e->getMessage(),
               'data' => [
                   'valid' => false
               ]
           ];
       }
   }
}
