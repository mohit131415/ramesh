<?php

namespace App\Features\Open\UserProfile\Actions;

use App\Core\Request;
use App\Core\Response;
use App\Features\Open\UserProfile\Services\UserProfileService;
use App\Shared\Exceptions\ValidationException;
use App\Shared\Exceptions\NotFoundException;
use App\Shared\Helpers\ResponseFormatter;
use Exception;

class UpdateUserProfile
{
    private $userProfileService;

    public function __construct()
    {
        $this->userProfileService = new UserProfileService();
    }

    /**
     * Parse multipart data from PUT request
     */
    private function parseMultipartData()
    {
        $rawData = file_get_contents('php://input');
        $boundary = null;
        
        // Get boundary from Content-Type header
        $contentType = $_SERVER['CONTENT_TYPE'] ?? '';
        if (preg_match('/boundary=(.+)$/', $contentType, $matches)) {
            $boundary = $matches[1];
        }
        
        if (!$boundary) {
            error_log("No boundary found in Content-Type: " . $contentType);
            return [[], []];
        }
        
        error_log("Found boundary: " . $boundary);
        error_log("Raw data length: " . strlen($rawData));
        
        $parts = array_slice(explode('--' . $boundary, $rawData), 1);
        $data = [];
        $files = [];
        
        foreach ($parts as $part) {
            if (trim($part) === '--') break;
            
            $part = ltrim($part, "\r\n");
            if (empty($part)) continue;
            
            list($rawHeaders, $body) = explode("\r\n\r\n", $part, 2);
            $body = substr($body, 0, -2); // Remove trailing \r\n
            
            $headers = [];
            foreach (explode("\r\n", $rawHeaders) as $header) {
                if (strpos($header, ':') !== false) {
                    list($key, $value) = explode(':', $header, 2);
                    $headers[strtolower(trim($key))] = trim($value);
                }
            }
            
            if (!isset($headers['content-disposition'])) continue;
            
            $disposition = $headers['content-disposition'];
            if (preg_match('/name="([^"]*)"/', $disposition, $matches)) {
                $name = $matches[1];
                
                // Check if it's a file
                if (preg_match('/filename="([^"]*)"/', $disposition, $fileMatches)) {
                    $filename = $fileMatches[1];
                    $contentType = $headers['content-type'] ?? 'application/octet-stream';
                    
                    // Create temporary file
                    $tmpFile = tempnam(sys_get_temp_dir(), 'upload_');
                    file_put_contents($tmpFile, $body);
                    
                    $files[$name] = [
                        'name' => $filename,
                        'type' => $contentType,
                        'tmp_name' => $tmpFile,
                        'error' => UPLOAD_ERR_OK,
                        'size' => strlen($body)
                    ];
                    
                    error_log("Parsed file: $name = $filename (size: " . strlen($body) . ")");
                } else {
                    $data[$name] = $body;
                    error_log("Parsed field: $name = $body");
                }
            }
        }
        
        return [$data, $files];
    }

    public function execute(Request $request, Response $response)
    {
        try {
            // Get authenticated user from token
            $authPayload = $request->getParam('auth_payload');
        
            if (!$authPayload || !isset($authPayload->sub)) {
                throw new ValidationException('Invalid authentication token');
            }
        
            $userId = (int)$authPayload->sub;
            error_log("=== BACKEND DEBUG: Starting profile update for user ID: " . $userId . " ===");
            error_log("Request method: " . $_SERVER['REQUEST_METHOD']);
            error_log("Content-Type: " . ($_SERVER['CONTENT_TYPE'] ?? 'not set'));
        
            $data = [];
            $profilePicture = null;
            
            // Handle PUT request with multipart data
            if ($_SERVER['REQUEST_METHOD'] === 'PUT') {
                error_log("Processing PUT request with multipart data");
                list($parsedData, $parsedFiles) = $this->parseMultipartData();
                
                error_log("Parsed data: " . json_encode($parsedData));
                error_log("Parsed files: " . json_encode(array_keys($parsedFiles)));
                
                // Process form fields
                $formFields = ['first_name', 'last_name', 'email', 'gender', 'date_of_birth'];
                
                foreach ($formFields as $field) {
                    if (isset($parsedData[$field])) {
                        $data[$field] = !empty($parsedData[$field]) ? trim($parsedData[$field]) : null;
                        error_log("Field '$field' = '" . ($data[$field] ?? 'null') . "'");
                    }
                }
                
                // Handle profile picture
                if (isset($parsedFiles['profile_picture'])) {
                    $profilePicture = $parsedFiles['profile_picture'];
                    error_log("Profile picture found: " . $profilePicture['name']);
                }
            }
            // Handle POST request (fallback)
            else if ($_SERVER['REQUEST_METHOD'] === 'POST') {
                error_log("Processing POST request");
                
                $formFields = ['first_name', 'last_name', 'email', 'gender', 'date_of_birth'];
                
                foreach ($formFields as $field) {
                    if (isset($_POST[$field])) {
                        $data[$field] = !empty($_POST[$field]) ? trim($_POST[$field]) : null;
                        error_log("Field '$field' = '" . ($data[$field] ?? 'null') . "'");
                    }
                }
                
                if (isset($_FILES['profile_picture']) && $_FILES['profile_picture']['error'] === UPLOAD_ERR_OK) {
                    $profilePicture = $_FILES['profile_picture'];
                    error_log("Profile picture found: " . $profilePicture['name']);
                }
            }
        
            error_log("=== BACKEND DEBUG: Final processing ===");
            error_log("Final data: " . json_encode($data));
            error_log("Profile picture: " . ($profilePicture ? "Yes" : "No"));
        
            // Check if we have any data to update
            if (empty($data) && !$profilePicture) {
                throw new ValidationException("No data provided for update");
            }
        
            // Update profile
            $profile = $this->userProfileService->updateProfile($data, $profilePicture, $userId);
        
            error_log("=== BACKEND DEBUG: Update successful ===");
        
            return ResponseFormatter::success(
                $profile,
                'Profile updated successfully'
            );
            
        } catch (ValidationException $e) {
            error_log("BACKEND ERROR: Validation error: " . $e->getMessage());
            throw $e;
        } catch (NotFoundException $e) {
            error_log("BACKEND ERROR: Profile not found: " . $e->getMessage());
            throw $e;
        } catch (Exception $e) {
            error_log("BACKEND ERROR: General error: " . $e->getMessage());
            throw new Exception('Failed to update profile: ' . $e->getMessage());
        }
    }
}
