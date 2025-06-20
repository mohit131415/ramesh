<?php

namespace App\Features\Open\UserProfile\Services;

use App\Features\Open\UserProfile\DataAccess\UserProfileRepository;
use App\Shared\Exceptions\ValidationException;
use App\Shared\Exceptions\NotFoundException;
use Exception;

class UserProfileService
{
    private $profileRepository;
    
    public function __construct()
    {
        $this->profileRepository = new UserProfileRepository();
    }
    
    /**
     * Delete old profile picture file
     * 
     * @param string $filePath
     * @return bool
     */
    private function deleteOldProfilePicture(string $filePath): bool
    {
        try {
            if (empty($filePath)) {
                return true; // Nothing to delete
            }
            
            // Check if file exists and delete it
            if (file_exists($filePath)) {
                $deleted = unlink($filePath);
                if ($deleted) {
                    error_log("Successfully deleted old profile picture: " . $filePath);
                } else {
                    error_log("Failed to delete old profile picture: " . $filePath);
                }
                return $deleted;
            } else {
                error_log("Old profile picture file not found: " . $filePath);
                return true; // File doesn't exist, consider it "deleted"
            }
        } catch (Exception $e) {
            error_log("Error deleting old profile picture: " . $e->getMessage());
            return false;
        }
    }
    
    /**
     * Handle file upload for profile picture
     * 
     * @param array $file
     * @return string|null
     */
    private function handleProfilePictureUpload(array $file): ?string
    {
        try {
            // Check if file was uploaded without errors
            if ($file['error'] !== UPLOAD_ERR_OK) {
                error_log("File upload error: " . $file['error']);
                return null;
            }
            
            // Validate file type
            $allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
            
            // For manually created temp files, we need to check the file content
            if (isset($file['type']) && !empty($file['type'])) {
                $fileType = $file['type'];
            } else {
                $fileType = mime_content_type($file['tmp_name']);
            }
            
            error_log("Detected file type: " . $fileType);
            
            if (!in_array($fileType, $allowedTypes)) {
                throw new ValidationException('Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed.');
            }
            
            // Validate file size (max 5MB)
            $maxSize = 5 * 1024 * 1024; // 5MB
            if ($file['size'] > $maxSize) {
                throw new ValidationException('File size too large. Maximum size is 5MB.');
            }
            
            // Create upload directory if it doesn't exist
            $uploadDir = 'public/uploads/profile_pictures/';
            if (!is_dir($uploadDir)) {
                if (!mkdir($uploadDir, 0755, true)) {
                    error_log("Failed to create upload directory: " . $uploadDir);
                    throw new Exception('Failed to create upload directory');
                }
                error_log("Created upload directory: " . $uploadDir);
            }
            
            // Generate unique filename
            $extension = pathinfo($file['name'], PATHINFO_EXTENSION);
            $filename = uniqid('profile_') . '.' . $extension;
            $uploadPath = $uploadDir . $filename;
            
            error_log("Attempting to move file from: " . $file['tmp_name'] . " to: " . $uploadPath);
            
            // Check if the source file exists
            if (!file_exists($file['tmp_name'])) {
                error_log("Source file does not exist: " . $file['tmp_name']);
                return null;
            }
            
            // For regular POST uploads, use move_uploaded_file
            // For manually parsed PUT uploads, use copy since the temp file isn't a "real" uploaded file
            $moveSuccess = false;
            
            if (is_uploaded_file($file['tmp_name'])) {
                // This is a real uploaded file (POST request)
                error_log("Using move_uploaded_file for real uploaded file");
                $moveSuccess = move_uploaded_file($file['tmp_name'], $uploadPath);
            } else {
                // This is a manually created temp file (PUT request)
                error_log("Using copy for manually created temp file");
                $moveSuccess = copy($file['tmp_name'], $uploadPath);
                
                // Clean up the temporary file
                if (file_exists($file['tmp_name'])) {
                    unlink($file['tmp_name']);
                }
            }
            
            if ($moveSuccess) {
                error_log("File uploaded successfully to: " . $uploadPath);
                
                // Set proper file permissions
                chmod($uploadPath, 0644);
                
                return $uploadPath;
            } else {
                error_log("Failed to move/copy uploaded file");
                return null;
            }
        } catch (Exception $e) {
            error_log("Error uploading profile picture: " . $e->getMessage());
            throw $e;
        }
    }
    
    /**
     * Validate profile data for creation
     * 
     * @param array $data
     * @return array Validated data
     */
    private function validateProfileDataForCreate(array $data): array
    {
        $errors = [];
        $validatedData = [];
        
        // Set user_id
        $validatedData['user_id'] = $data['user_id'];
        
        // Validate first_name if provided
        if (isset($data['first_name'])) {
            if (!empty($data['first_name'])) {
                if (strlen($data['first_name']) > 100) {
                    $errors['first_name'] = 'First name cannot exceed 100 characters';
                } else {
                    $validatedData['first_name'] = trim($data['first_name']);
                }
            } else {
                $validatedData['first_name'] = null;
            }
        } else {
            $validatedData['first_name'] = null;
        }
        
        // Validate last_name if provided
        if (isset($data['last_name'])) {
            if (!empty($data['last_name'])) {
                if (strlen($data['last_name']) > 100) {
                    $errors['last_name'] = 'Last name cannot exceed 100 characters';
                } else {
                    $validatedData['last_name'] = trim($data['last_name']);
                }
            } else {
                $validatedData['last_name'] = null;
            }
        } else {
            $validatedData['last_name'] = null;
        }
        
        // Validate gender if provided
        if (isset($data['gender'])) {
            if (!empty($data['gender'])) {
                $validGenders = ['male', 'female', 'other', 'prefer_not_to_say'];
                if (!in_array($data['gender'], $validGenders)) {
                    $errors['gender'] = 'Gender must be one of: ' . implode(', ', $validGenders);
                } else {
                    $validatedData['gender'] = $data['gender'];
                }
            } else {
                $validatedData['gender'] = null;
            }
        } else {
            $validatedData['gender'] = null;
        }
        
        // Validate email if provided
        if (isset($data['email'])) {
            if (!empty($data['email'])) {
                if (!filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
                    $errors['email'] = 'Invalid email format';
                } elseif (strlen($data['email']) > 255) {
                    $errors['email'] = 'Email cannot exceed 255 characters';
                } else {
                    $validatedData['email'] = trim($data['email']);
                }
            } else {
                $validatedData['email'] = null;
            }
        } else {
            $validatedData['email'] = null;
        }
        
        // Validate date_of_birth if provided
        if (isset($data['date_of_birth'])) {
            if (!empty($data['date_of_birth'])) {
                $date = date_create_from_format('Y-m-d', $data['date_of_birth']);
                if (!$date || date_format($date, 'Y-m-d') !== $data['date_of_birth']) {
                    $errors['date_of_birth'] = 'Date of birth must be in format YYYY-MM-DD';
                } else {
                    // Check if date is not in the future
                    $today = new \DateTime();
                    if ($date > $today) {
                        $errors['date_of_birth'] = 'Date of birth cannot be in the future';
                    } else {
                        $validatedData['date_of_birth'] = $data['date_of_birth'];
                    }
                }
            } else {
                $validatedData['date_of_birth'] = null;
            }
        } else {
            $validatedData['date_of_birth'] = null;
        }
        
        // If there are validation errors, throw an exception
        if (!empty($errors)) {
            throw new ValidationException('Validation failed', $errors);
        }
        
        return $validatedData;
    }
    
    /**
     * Validate profile data for update - more lenient, only validates provided fields
     * 
     * @param array $data
     * @return array Validated data
     */
    private function validateProfileDataForUpdate(array $data): array
    {
        $errors = [];
        $validatedData = [];
        
        error_log("Validating update data: " . json_encode($data));
        
        // Only validate and include fields that are actually provided
        foreach ($data as $key => $value) {
            error_log("Processing field: $key with value: " . ($value ?? 'null'));
            
            switch ($key) {
                case 'first_name':
                    if (strlen($value ?? '') > 100) {
                        $errors['first_name'] = 'First name cannot exceed 100 characters';
                    } else {
                        $validatedData['first_name'] = $value ? trim($value) : null;
                    }
                    break;
                    
                case 'last_name':
                    if (strlen($value ?? '') > 100) {
                        $errors['last_name'] = 'Last name cannot exceed 100 characters';
                    } else {
                        $validatedData['last_name'] = $value ? trim($value) : null;
                    }
                    break;
                    
                case 'gender':
                    if ($value !== null && $value !== '') {
                        $validGenders = ['male', 'female', 'other', 'prefer_not_to_say'];
                        if (!in_array($value, $validGenders)) {
                            $errors['gender'] = 'Gender must be one of: ' . implode(', ', $validGenders);
                        } else {
                            $validatedData['gender'] = $value;
                        }
                    } else {
                        $validatedData['gender'] = null;
                    }
                    break;
                    
                case 'email':
                    if ($value !== null && $value !== '') {
                        if (!filter_var($value, FILTER_VALIDATE_EMAIL)) {
                            $errors['email'] = 'Invalid email format';
                        } elseif (strlen($value) > 255) {
                            $errors['email'] = 'Email cannot exceed 255 characters';
                        } else {
                            $validatedData['email'] = trim($value);
                        }
                    } else {
                        $validatedData['email'] = null;
                    }
                    break;
                    
                case 'date_of_birth':
                    if ($value !== null && $value !== '') {
                        $date = date_create_from_format('Y-m-d', $value);
                        if (!$date || date_format($date, 'Y-m-d') !== $value) {
                            $errors['date_of_birth'] = 'Date of birth must be in format YYYY-MM-DD';
                        } else {
                            // Check if date is not in the future
                            $today = new \DateTime();
                            if ($date > $today) {
                                $errors['date_of_birth'] = 'Date of birth cannot be in the future';
                            } else {
                                $validatedData['date_of_birth'] = $value;
                            }
                        }
                    } else {
                        $validatedData['date_of_birth'] = null;
                    }
                    break;
            }
        }
        
        error_log("Validated update data: " . json_encode($validatedData));
        
        // If there are validation errors, throw an exception
        if (!empty($errors)) {
            throw new ValidationException('Validation failed', $errors);
        }
        
        return $validatedData;
    }
    
    /**
     * Create a new user profile
     * 
     * @param array $data
     * @param array|null $profilePicture
     * @param int $userId
     * @return array
     */
    public function createProfile(array $data, ?array $profilePicture, int $userId): array
    {
        try {
            // Set user ID
            $data['user_id'] = $userId;
            
            // Validate data
            $validatedData = $this->validateProfileDataForCreate($data);
            
            // Handle profile picture upload if provided
            if ($profilePicture && isset($profilePicture['tmp_name']) && !empty($profilePicture['tmp_name'])) {
                $uploadedPath = $this->handleProfilePictureUpload($profilePicture);
                if ($uploadedPath) {
                    $validatedData['profile_picture'] = $uploadedPath;
                }
            }
            
            // Create profile
            $profile = $this->profileRepository->createProfile($validatedData);
            
            if (!$profile) {
                throw new Exception("Failed to create profile");
            }
            
            return $profile;
        } catch (ValidationException $e) {
            throw $e;
        } catch (Exception $e) {
            error_log("Error in createProfile service: " . $e->getMessage());
            throw new Exception("Failed to create profile: " . $e->getMessage());
        }
    }
    
    /**
     * Get user profile
     * 
     * @param int $userId
     * @return array
     */
    public function getProfile(int $userId): array
    {
        try {
            $profile = $this->profileRepository->getProfileByUserId($userId);
            
            if (!$profile) {
                throw new NotFoundException("Profile not found");
            }
            
            return $profile;
        } catch (NotFoundException $e) {
            throw $e;
        } catch (Exception $e) {
            error_log("Error in getProfile service: " . $e->getMessage());
            throw new Exception("Failed to retrieve profile: " . $e->getMessage());
        }
    }
    
    /**
     * Update user profile
     * 
     * @param array $data
     * @param array|null $profilePicture
     * @param int $userId
     * @return array
     */
    public function updateProfile(array $data, ?array $profilePicture, int $userId): array
    {
        try {
            error_log("UpdateProfile service called with data: " . json_encode($data));
            error_log("Profile picture info: " . json_encode($profilePicture));
            
            // Get current profile to check for existing profile picture
            $currentProfile = null;
            try {
                $currentProfile = $this->profileRepository->getProfileByUserId($userId);
                error_log("Current profile found: " . json_encode($currentProfile));
            } catch (Exception $e) {
                error_log("No existing profile found for user: " . $userId);
            }
            
            // Validate data - only validate fields that are provided
            $validatedData = $this->validateProfileDataForUpdate($data);
            
            error_log("Service validated data: " . json_encode($validatedData));
            
            // Handle profile picture upload if provided
            if ($profilePicture && isset($profilePicture['tmp_name']) && !empty($profilePicture['tmp_name'])) {
                error_log("Processing profile picture upload...");
                
                // Delete old profile picture if it exists
                if ($currentProfile && !empty($currentProfile['profile_picture'])) {
                    error_log("Deleting old profile picture: " . $currentProfile['profile_picture']);
                    $this->deleteOldProfilePicture($currentProfile['profile_picture']);
                }
                
                $uploadedPath = $this->handleProfilePictureUpload($profilePicture);
                if ($uploadedPath) {
                    $validatedData['profile_picture'] = $uploadedPath;
                    error_log("Profile picture uploaded to: " . $uploadedPath);
                } else {
                    error_log("Profile picture upload failed");
                }
            }
            
            // Check if we have any data to update (including profile picture)
            if (empty($validatedData)) {
                error_log("No validated data found for update");
                throw new ValidationException("No valid data provided for update");
            }
            
            // Update profile
            $profile = $this->profileRepository->updateProfile($userId, $validatedData);
            
            if (!$profile) {
                throw new Exception("Failed to update profile");
            }
            
            error_log("Profile updated successfully");
            return $profile;
        } catch (ValidationException $e) {
            error_log("Validation error in updateProfile: " . $e->getMessage());
            throw $e;
        } catch (Exception $e) {
            error_log("Error in updateProfile service: " . $e->getMessage());
            throw new Exception("Failed to update profile: " . $e->getMessage());
        }
    }
    
    /**
     * Get profile completion status
     * 
     * @param int $userId
     * @return array
     */
    public function getProfileCompletionStatus(int $userId): array
    {
        try {
            return $this->profileRepository->getProfileCompletionStatus($userId);
        } catch (Exception $e) {
            error_log("Error in getProfileCompletionStatus service: " . $e->getMessage());
            throw new Exception("Failed to get profile completion status: " . $e->getMessage());
        }
    }
}
