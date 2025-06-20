<?php

namespace App\Shared\Traits;

use App\Shared\Exceptions\ValidationException;
use App\Shared\Helpers\FileUploader;

trait UploadsFiles
{
    /**
     * Upload a file
     *
     * @param array $file File data from $_FILES
     * @param string $destination Destination directory
     * @param array $options Upload options
     * @return array Uploaded file information
     * @throws ValidationException
     */
    protected function uploadFile($file, $destination, $options = [])
    {
        return FileUploader::upload($file, $destination, $options);
    }

    /**
     * Upload multiple files
     *
     * @param array $files Files data from $_FILES
     * @param string $destination Destination directory
     * @param array $options Upload options
     * @return array Uploaded files information
     * @throws ValidationException
     */
    protected function uploadFiles($files, $destination, $options = [])
    {
        $uploadedFiles = [];
        
        foreach ($files as $key => $file) {
            if (is_array($file['name'])) {
                // Multiple files with same input name
                for ($i = 0; $i < count($file['name']); $i++) {
                    $fileData = [
                        'name' => $file['name'][$i],
                        'type' => $file['type'][$i],
                        'tmp_name' => $file['tmp_name'][$i],
                        'error' => $file['error'][$i],
                        'size' => $file['size'][$i]
                    ];
                    
                    try {
                        $uploadedFiles[] = $this->uploadFile($fileData, $destination, $options);
                    } catch (ValidationException $e) {
                        // Log error but continue with other files
                        error_log("File upload error: " . $e->getMessage());
                    }
                }
            } else {
                // Single file
                try {
                    $uploadedFiles[] = $this->uploadFile($file, $destination, $options);
                } catch (ValidationException $e) {
                    // Log error but continue with other files
                    error_log("File upload error: " . $e->getMessage());
                }
            }
        }
        
        return $uploadedFiles;
    }

    /**
     * Delete a file
     *
     * @param string $filePath Path to the file
     * @return bool True if file was deleted
     */
    protected function deleteFile($filePath)
    {
        return FileUploader::delete($filePath);
    }

    /**
     * Delete multiple files
     *
     * @param array $filePaths Paths to the files
     * @return array Deleted files status
     */
    protected function deleteFiles($filePaths)
    {
        $results = [];
        
        foreach ($filePaths as $path) {
            $results[$path] = $this->deleteFile($path);
        }
        
        return $results;
    }
}
