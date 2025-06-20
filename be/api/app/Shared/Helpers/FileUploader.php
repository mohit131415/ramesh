<?php

namespace App\Shared\Helpers;

use App\Shared\Exceptions\ValidationException;
use Exception;

class FileUploader
{
    /**
     * Upload a file
     *
     * @param array $file File data from $_FILES
     * @param string $uploadDir Directory to upload to
     * @param array $options Upload options
     * @return array Upload result
     * @throws ValidationException
     */
    public function upload($file, $uploadDir, $options = [])
    {
        try {
            // Debug: Log the file data
            error_log('FileUploader - File data: ' . print_r($file, true));
            
            // Check if file exists and was uploaded successfully
            if (empty($file) || !isset($file['tmp_name']) || empty($file['tmp_name']) || !is_uploaded_file($file['tmp_name'])) {
                throw new ValidationException('No valid file uploaded', ['file' => 'No valid file uploaded']);
            }
            
            // Check for upload errors
            if ($file['error'] !== UPLOAD_ERR_OK) {
                $errorMessage = $this->getUploadErrorMessage($file['error']);
                throw new ValidationException('File upload error', ['file' => $errorMessage]);
            }
            
            // Set default options
            $defaultOptions = [
                'allowed_types' => ['jpg', 'jpeg', 'png', 'gif', 'pdf', 'doc', 'docx', 'xls', 'xlsx', 'csv'],
                'max_size' => 5 * 1024 * 1024, // 5MB
                'rename' => true,
                'encrypt_name' => false
            ];
            
            $options = array_merge($defaultOptions, $options);
            
            // Check file size
            if ($file['size'] > $options['max_size']) {
                throw new ValidationException('File size exceeds the limit of ' . self::formatSize($options['max_size']), 
                    ['file' => 'File size exceeds the limit of ' . self::formatSize($options['max_size'])]);
            }
            
            // Check file type
            $fileExt = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
            if (!in_array($fileExt, $options['allowed_types'])) {
                throw new ValidationException('File type not allowed. Allowed types: ' . implode(', ', $options['allowed_types']),
                    ['file' => 'File type not allowed. Allowed types: ' . implode(', ', $options['allowed_types'])]);
            }
            
            // Create destination directory if it doesn't exist
            if (!is_dir($uploadDir)) {
                if (!mkdir($uploadDir, 0755, true)) {
                    throw new Exception('Failed to create destination directory');
                }
            }
            
            // Generate file name
            $fileName = $file['name'];
            if ($options['encrypt_name']) {
                $fileName = md5(uniqid(rand(), true)) . '.' . $fileExt;
            } elseif ($options['rename']) {
                $baseName = pathinfo($file['name'], PATHINFO_FILENAME);
                $fileName = self::sanitizeFileName($baseName) . '_' . time() . '.' . $fileExt;
            }
            
            $filePath = rtrim($uploadDir, '/') . '/' . $fileName;
            
            // Debug: Log the upload path and file permissions
            error_log('FileUploader - Upload path: ' . $filePath);
            error_log('FileUploader - Upload directory writable: ' . (is_writable($uploadDir) ? 'Yes' : 'No'));
            
            // Move uploaded file
            if (!move_uploaded_file($file['tmp_name'], $filePath)) {
                error_log('FileUploader - Failed to move uploaded file. PHP error: ' . error_get_last()['message']);
                throw new Exception('Failed to move uploaded file');
            }
            
            // Debug: Log the file existence after upload
            error_log('FileUploader - File exists after upload: ' . (file_exists($filePath) ? 'Yes' : 'No'));
            
            // Return file information
            return [
                'name' => $fileName,
                'original_name' => $file['name'],
                'path' => $filePath,
                'url' => self::getFileUrl($filePath),
                'size' => $file['size'],
                'type' => $file['type'],
                'extension' => $fileExt
            ];
        } catch (ValidationException $e) {
            error_log('FileUploader - Validation Exception: ' . $e->getMessage());
            throw $e;
        } catch (Exception $e) {
            error_log('FileUploader - Exception: ' . $e->getMessage());
            throw new Exception('File upload failed: ' . $e->getMessage());
        }
    }

    /**
     * Delete a file
     *
     * @param string $filePath Path to the file
     * @return bool True if file was deleted
     */
    public static function delete($filePath)
    {
        if (file_exists($filePath)) {
            return unlink($filePath);
        }
        
        return false;
    }

    /**
     * Sanitize a file name
     *
     * @param string $fileName File name to sanitize
     * @return string Sanitized file name
     */
    public static function sanitizeFileName($fileName)
    {
        // Remove any character that is not alphanumeric, underscore, dash, or dot
        $fileName = preg_replace('/[^\w\-\.]/', '_', $fileName);
        
        // Remove multiple underscores
        $fileName = preg_replace('/_+/', '_', $fileName);
        
        return $fileName;
    }

    /**
     * Format file size for display
     *
     * @param int $size Size in bytes
     * @return string Formatted size
     */
    public static function formatSize($size)
    {
        $units = ['B', 'KB', 'MB', 'GB', 'TB'];
        $i = 0;
        
        while ($size >= 1024 && $i < count($units) - 1) {
            $size /= 1024;
            $i++;
        }
        
        return round($size, 2) . ' ' . $units[$i];
    }

    /**
     * Get file URL from file path
     *
     * @param string $filePath File path
     * @return string File URL
     */
    private static function getFileUrl($filePath)
    {
        $baseUrl = config('app.url');
        $relativePath = str_replace(APP_ROOT, '', $filePath);
        
        return $baseUrl . $relativePath;
    }
    
    /**
     * Get upload error message
     *
     * @param int $errorCode PHP upload error code
     * @return string Error message
     */
    private function getUploadErrorMessage($errorCode)
    {
        switch ($errorCode) {
            case UPLOAD_ERR_INI_SIZE:
                return 'The uploaded file exceeds the upload_max_filesize directive in php.ini';
            case UPLOAD_ERR_FORM_SIZE:
                return 'The uploaded file exceeds the MAX_FILE_SIZE directive that was specified in the HTML form';
            case UPLOAD_ERR_PARTIAL:
                return 'The uploaded file was only partially uploaded';
            case UPLOAD_ERR_NO_FILE:
                return 'No file was uploaded';
            case UPLOAD_ERR_NO_TMP_DIR:
                return 'Missing a temporary folder';
            case UPLOAD_ERR_CANT_WRITE:
                return 'Failed to write file to disk';
            case UPLOAD_ERR_EXTENSION:
                return 'A PHP extension stopped the file upload';
            default:
                return 'Unknown upload error';
        }
    }
}
