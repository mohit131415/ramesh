<?php

namespace App\Features\Open\Authentication\Actions;

use App\Core\Request;
use App\Core\Response;
use App\Features\Open\Authentication\Services\AuthenticationService;
use App\Shared\Exceptions\ValidationException;
use Exception;

class RegisterUser
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
           // Debug the request to see what's being received
           $requestBody = $request->getBody();
           error_log("RegisterUser - Request body: " . json_encode($requestBody));
           
           // Try multiple ways to get the phone number
           $phoneNumber = null;
           
           // Method 1: Try to get from 'phone' key (as shown in the screenshot)
           $phoneNumber = $request->getBody('phone');
           
           // Method 2: If that fails, try alternate keys
           if (empty($phoneNumber)) {
               $phoneNumber = $request->getBody('phone_number');
           }
           
           if (empty($phoneNumber)) {
               $phoneNumber = $request->getBody('phoneNumber');
           }
           
           // Method 3: Try to get from raw JSON
           if (empty($phoneNumber) && !empty($requestBody)) {
               if (is_array($requestBody) && isset($requestBody['phone'])) {
                   $phoneNumber = $requestBody['phone'];
               } elseif (is_array($requestBody) && isset($requestBody['phone_number'])) {
                   $phoneNumber = $requestBody['phone_number'];
               } elseif (is_array($requestBody) && isset($requestBody['phoneNumber'])) {
                   $phoneNumber = $requestBody['phoneNumber'];
               }
           }
           
           // Method 4: Try to get from POST directly
           if (empty($phoneNumber) && isset($_POST['phone'])) {
               $phoneNumber = $_POST['phone'];
           }
           
           if (empty($phoneNumber) && isset($_POST['phone_number'])) {
               $phoneNumber = $_POST['phone_number'];
           }
           
           // Method 5: Try to get from raw PHP input
           if (empty($phoneNumber)) {
               $rawInput = file_get_contents('php://input');
               if (!empty($rawInput)) {
                   $jsonData = json_decode($rawInput, true);
                   if (is_array($jsonData) && isset($jsonData['phone'])) {
                       $phoneNumber = $jsonData['phone'];
                   } elseif (is_array($jsonData) && isset($jsonData['phone_number'])) {
                       $phoneNumber = $jsonData['phone_number'];
                   } elseif (is_array($jsonData) && isset($jsonData['phoneNumber'])) {
                       $phoneNumber = $jsonData['phoneNumber'];
                   }
               }
           }
           
           // Log what we found
           error_log("RegisterUser - Phone number found: " . ($phoneNumber ?? 'null'));
           
           // Validate phone number
           if (empty($phoneNumber)) {
               return $response->json([
                   'status' => 'error',
                   'message' => 'Please enter your phone number to continue with registration.',
                   'data' => null
               ]);
           }
           
           // Register user and send OTP
           $result = $this->authService->register($phoneNumber);
           
           // Return success response
           return $response->json([
               'status' => 'success',
               'message' => 'A verification code has been sent to your phone. Please enter it to complete your registration. The code will expire in 2 minutes.',
               'data' => $result
           ]);
           
       } catch (ValidationException $e) {
           // Return validation error response
           return $response->json([
               'status' => 'error',
               'message' => $e->getMessage(),
               'data' => null
           ]);
       } catch (Exception $e) {
           // Return general error response
           error_log("RegisterUser - Exception: " . $e->getMessage());
           error_log("RegisterUser - Stack trace: " . $e->getTraceAsString());
           return $response->json([
               'status' => 'error',
               'message' => 'Registration failed: ' . $e->getMessage(),
               'data' => null
           ]);
       }
   }
}
