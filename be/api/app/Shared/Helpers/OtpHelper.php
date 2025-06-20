<?php

namespace App\Shared\Helpers;

use App\Core\Database;
use PDO;

class OtpHelper
{
    private $db;
    
    public function __construct()
    {
        $this->db = Database::getInstance();
    }
    
    /**
     * Generate a random 6-digit OTP
     * 
     * @return string
     */
    public function generateOtp(): string
    {
        return str_pad(rand(0, 999999), 6, '0', STR_PAD_LEFT);
    }
    
    /**
     * Check if user has exceeded OTP request limit (8 per minute)
     * 
     * @param string $phoneNumber
     * @return bool
     */
    public function hasExceededOtpLimit(string $phoneNumber): bool
    {
        $query = "SELECT COUNT(*) as count FROM otps 
                  WHERE phone_number = :phone_number 
                  AND created_at > DATE_SUB(NOW(), INTERVAL 1 MINUTE)";
        
        $result = $this->db->fetch($query, [':phone_number' => $phoneNumber]);
        
        return $result['count'] >= 8;
    }
    
    /**
     * Invalidate previous unused OTPs for a phone number and type
     * 
     * @param string $phoneNumber
     * @param string $type
     * @return bool
     */
    private function invalidatePreviousOtps(string $phoneNumber, string $type): bool
    {
        $query = "UPDATE otps 
                  SET status = 'invalid' 
                  WHERE phone_number = :phone_number 
                  AND type = :type 
                  AND is_used = 0 
                  AND status = 'valid'";
        
        try {
            $this->db->query($query, [
                ':phone_number' => $phoneNumber,
                ':type' => $type
            ]);
            return true;
        } catch (\Exception $e) {
            error_log("Error invalidating previous OTPs: " . $e->getMessage());
            return false;
        }
    }
    
    /**
     * Create a new OTP record
     * 
     * @param string $phoneNumber
     * @param string $otp
     * @param string $type
     * @param int|null $userId
     * @return bool
     */
    public function createOtp(string $phoneNumber, string $otp, string $type, ?int $userId = null): bool
    {
        // Log the user ID for debugging
        error_log("Creating OTP for phone: $phoneNumber, type: $type, user_id: " . ($userId ?? 'null'));
        
        // First, invalidate any previous unused OTPs for this phone number and type
        $this->invalidatePreviousOtps($phoneNumber, $type);
        
        // Now create the new OTP with 'valid' status and 2-minute expiration
        $query = "INSERT INTO otps (user_id, phone_number, otp, type, status, expires_at) 
                  VALUES (:user_id, :phone_number, :otp, :type, 'valid', DATE_ADD(NOW(), INTERVAL 2 MINUTE))";
        
        // Prepare the statement directly to handle NULL values properly
        $stmt = $this->db->getConnection()->prepare($query);
        
        // Bind parameters with proper type handling for NULL values
        $stmt->bindParam(':phone_number', $phoneNumber, PDO::PARAM_STR);
        $stmt->bindParam(':otp', $otp, PDO::PARAM_STR);
        $stmt->bindParam(':type', $type, PDO::PARAM_STR);
        
        // Handle NULL user_id properly
        if ($userId === null) {
            $stmt->bindValue(':user_id', null, PDO::PARAM_NULL);
        } else {
            $stmt->bindParam(':user_id', $userId, PDO::PARAM_INT);
        }
        
        try {
            $result = $stmt->execute();
            if (!$result) {
                error_log("Error executing OTP creation query: " . json_encode($stmt->errorInfo()));
                return false;
            }
            return true;
        } catch (\Exception $e) {
            error_log("Error creating OTP: " . $e->getMessage());
            return false;
        }
    }
    
    /**
     * Verify OTP and mark as used if valid
     * 
     * @param string $phoneNumber
     * @param string $otp
     * @param string $type
     * @return bool
     */
    public function verifyOtp(string $phoneNumber, string $otp, string $type): bool
    {
        $query = "SELECT id FROM otps 
                  WHERE phone_number = :phone_number 
                  AND otp = :otp 
                  AND type = :type 
                  AND is_used = 0 
                  AND status = 'valid'
                  AND expires_at > NOW() 
                  ORDER BY created_at DESC 
                  LIMIT 1";
        
        $params = [
            ':phone_number' => $phoneNumber,
            ':otp' => $otp,
            ':type' => $type
        ];
        
        $result = $this->db->fetch($query, $params);
        
        if ($result && isset($result['id'])) {
            $this->markOtpAsUsed($result['id']);
            return true;
        }
        
        return false;
    }
    
    /**
     * Mark OTP as used
     * 
     * @param int $otpId
     * @return bool
     */
    private function markOtpAsUsed(int $otpId): bool
    {
        $query = "UPDATE otps SET is_used = 1, status = 'used', used_at = NOW() WHERE id = :id";
        
        try {
            $this->db->query($query, [':id' => $otpId]);
            return true;
        } catch (\Exception $e) {
            error_log("Error marking OTP as used: " . $e->getMessage());
            return false;
        }
    }
    
    /**
     * Send OTP via SMS (dummy implementation)
     * 
     * @param string $phoneNumber
     * @param string $otp
     * @return bool
     */
    public function sendOtpSms(string $phoneNumber, string $otp): bool
    {
        // This is a dummy implementation
        // In production, integrate with an SMS gateway
        
        // Log the OTP for development purposes
        error_log("OTP for $phoneNumber: $otp (expires in 2 minutes)");
        
        return true;
    }
}
