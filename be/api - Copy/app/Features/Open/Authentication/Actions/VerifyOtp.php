<?php

namespace App\Features\Open\Authentication\Actions;

use App\Core\Request;
use App\Core\Response;
use App\Features\Open\Authentication\Services\AuthenticationService;
use App\Shared\Exceptions\ValidationException;
use Exception;

class VerifyOtp
{
   private $authService;
   
   public function __construct()
   {
       $this->authService = new AuthenticationService();
   }
   
   /**
    * Execute the action
    * 
    * @param Request $request
    * @param Response $response
    * @return mixed
    */
   public function __invoke(Request $request, Response $response)
   {
       try {
           // Get parameters from request body
           $phoneNumber = $request->getBody('phone_number');
           $otp = $request->getBody('otp');
           $type = $request->getBody('type');
           
           // Validate input
           if (empty($phoneNumber)) {
               return $response->json([
                   'status' => 'error',
                   'message' => 'Please provide your phone number to verify your account.',
                   'data' => null
               ]);
           }
           
           if (empty($otp)) {
               return $response->json([
                   'status' => 'error',
                   'message' => 'Please enter the verification code sent to your phone.',
                   'data' => null
               ]);
           }
           
           if (empty($type) || !in_array($type, ['login', 'register'])) {
               return $response->json([
                   'status' => 'error',
                   'message' => 'We couldn\'t process your request. Please try signing in or registering again.',
                   'data' => null
               ]);
           }
           
           // Verify OTP and complete authentication
           $result = $this->authService->verifyOtp($phoneNumber, $otp, $type);
           
           // Return success response with appropriate message based on type
           if ($type === 'register') {
               return $response->json([
                   'status' => 'success',
                   'message' => 'Your account has been successfully created! Welcome to our platform.',
                   'data' => $result
               ]);
           } else {
               return $response->json([
                   'status' => 'success',
                   'message' => 'Welcome back! You have successfully signed in to your account.',
                   'data' => $result
               ]);
           }
           
       } catch (ValidationException $e) {
           // Return validation error response
           return $response->json([
               'status' => 'error',
               'message' => $e->getMessage(),
               'data' => null
           ]);
       } catch (Exception $e) {
           // Log the error for debugging
           error_log("OTP verification failed: " . $e->getMessage());
           error_log("Stack trace: " . $e->getTraceAsString());
           
           // Return user-friendly error message
           $errorMessage = $this->getUserFriendlyErrorMessage($e->getMessage());
           
           return $response->json([
               'status' => 'error',
               'message' => $errorMessage,
               'data' => null
           ]);
       }
   }
   
   /**
    * Convert technical error messages to user-friendly messages
    * 
    * @param string $errorMessage The original error message
    * @return string User-friendly error message
    */
   private function getUserFriendlyErrorMessage($errorMessage)
   {
       // Check for specific error messages and provide user-friendly alternatives
       if (strpos($errorMessage, 'expired') !== false) {
           return 'Your verification code has expired. Please request a new code.';
       }
       
       if (strpos($errorMessage, 'invalid') !== false || strpos($errorMessage, 'incorrect') !== false) {
           return 'The verification code you entered is incorrect. Please check and try again.';
       }
       
       if (strpos($errorMessage, 'already used') !== false) {
           return 'This verification code has already been used. Please request a new code.';
       }
       
       if (strpos($errorMessage, 'not found') !== false) {
           return 'We couldn\'t find a verification code for your phone number. Please request a new code.';
       }
       
       // Default generic message for other errors
       return 'We couldn\'t verify your code. Please try again or request a new code.';
   }
}
