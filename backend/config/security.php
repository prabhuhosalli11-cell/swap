<?php
/**
 * Security Utilities
 * Helper functions for CSRF protection, rate limiting, input validation
 */

class SecurityUtils {
    
    /**
     * Generate CSRF token and store in session
     */
    public static function generateCSRFToken() {
        if (session_status() !== PHP_SESSION_ACTIVE) {
            session_start();
        }
        
        $token = bin2hex(random_bytes(CSRF_TOKEN_LENGTH));
        $_SESSION['csrf_token'] = $token;
        $_SESSION['csrf_token_time'] = time();
        
        return $token;
    }
    
    /**
     * Validate CSRF token from request
     */
    public static function validateCSRFToken($token) {
        if (session_status() !== PHP_SESSION_ACTIVE) {
            session_start();
        }
        
        if (empty($_SESSION['csrf_token']) || empty($token)) {
            return false;
        }
        
        // Check token match
        if (!hash_equals($_SESSION['csrf_token'], $token)) {
            return false;
        }
        
        // Check token expiration
        if (time() - $_SESSION['csrf_token_time'] > CSRF_TOKEN_EXPIRE) {
            return false;
        }
        
        return true;
    }
    
    /**
     * Rate limiting check
     * @param string $identifier - IP address or user ID
     * @param string $action - Action being rate limited (e.g., 'login', 'signup')
     * @return bool - True if allowed, false if rate limited
     */
    public static function checkRateLimit($identifier, $action = 'default') {
        if (!RATE_LIMIT_ENABLED) {
            return true;
        }
        
        $key = "rate_limit_{$action}_{$identifier}";
        
        // Use APCu cache if available, otherwise use session
        if (function_exists('apcu_fetch')) {
            $attempts = apcu_fetch($key);
            if ($attempts === false) {
                apcu_store($key, 1, RATE_LIMIT_WINDOW);
                return true;
            }
            
            if ($attempts >= RATE_LIMIT_REQUESTS) {
                return false;
            }
            
            apcu_inc($key);
            return true;
        } else {
            // Fallback to session-based rate limiting
            if (session_status() !== PHP_SESSION_ACTIVE) {
                session_start();
            }
            
            if (!isset($_SESSION[$key])) {
                $_SESSION[$key] = [
                    'count' => 1,
                    'start' => time()
                ];
                return true;
            }
            
            $data = $_SESSION[$key];
            
            // Reset if window expired
            if (time() - $data['start'] > RATE_LIMIT_WINDOW) {
                $_SESSION[$key] = [
                    'count' => 1,
                    'start' => time()
                ];
                return true;
            }
            
            if ($data['count'] >= RATE_LIMIT_REQUESTS) {
                return false;
            }
            
            $_SESSION[$key]['count']++;
            return true;
        }
    }
    
    /**
     * Check login attempts for brute force protection
     */
    public static function checkLoginAttempts($email, $conn) {
        $query = "SELECT COUNT(*) as attempt_count, MAX(attempt_time) as last_attempt 
                  FROM login_attempts 
                  WHERE email = :email 
                  AND attempt_time > DATE_SUB(NOW(), INTERVAL :lockout SECOND)";
        
        $stmt = $conn->prepare($query);
        $stmt->bindParam(':email', $email);
        $stmt->bindValue(':lockout', LOGIN_LOCKOUT_DURATION, PDO::PARAM_INT);
        $stmt->execute();
        
        $result = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if ($result['attempt_count'] >= MAX_LOGIN_ATTEMPTS) {
            return [
                'allowed' => false,
                'message' => 'Too many login attempts. Please try again in ' . 
                            ceil(LOGIN_LOCKOUT_DURATION / 60) . ' minutes.'
            ];
        }
        
        return ['allowed' => true];
    }
    
    /**
     * Record failed login attempt
     */
    public static function recordLoginAttempt($email, $ip, $conn) {
        $query = "INSERT INTO login_attempts (email, ip_address, attempt_time) 
                  VALUES (:email, :ip, NOW())";
        
        $stmt = $conn->prepare($query);
        $stmt->bindParam(':email', $email);
        $stmt->bindParam(':ip', $ip);
        $stmt->execute();
    }
    
    /**
     * Clear login attempts after successful login
     */
    public static function clearLoginAttempts($email, $conn) {
        $query = "DELETE FROM login_attempts WHERE email = :email";
        $stmt = $conn->prepare($query);
        $stmt->bindParam(':email', $email);
        $stmt->execute();
    }
    
    /**
     * Sanitize input to prevent XSS
     */
    public static function sanitizeInput($input) {
        if (is_array($input)) {
            return array_map([self::class, 'sanitizeInput'], $input);
        }
        
        return htmlspecialchars(strip_tags(trim($input)), ENT_QUOTES, 'UTF-8');
    }
    
    /**
     * Validate email format
     */
    public static function validateEmail($email) {
        return filter_var($email, FILTER_VALIDATE_EMAIL) !== false;
    }
    
    /**
     * Validate password strength
     */
    public static function validatePassword($password) {
        $errors = [];
        
        if (strlen($password) < PASSWORD_MIN_LENGTH) {
            $errors[] = "Password must be at least " . PASSWORD_MIN_LENGTH . " characters long";
        }
        
        if (PASSWORD_REQUIRE_SPECIAL) {
            if (!preg_match('/[A-Z]/', $password)) {
                $errors[] = "Password must contain at least one uppercase letter";
            }
            if (!preg_match('/[a-z]/', $password)) {
                $errors[] = "Password must contain at least one lowercase letter";
            }
            if (!preg_match('/[0-9]/', $password)) {
                $errors[] = "Password must contain at least one number";
            }
            if (!preg_match('/[^A-Za-z0-9]/', $password)) {
                $errors[] = "Password must contain at least one special character";
            }
        }
        
        return empty($errors) ? ['valid' => true] : ['valid' => false, 'errors' => $errors];
    }
    
    /**
     * Get client IP address
     */
    public static function getClientIP() {
        $ip = '';
        
        if (!empty($_SERVER['HTTP_CLIENT_IP'])) {
            $ip = $_SERVER['HTTP_CLIENT_IP'];
        } elseif (!empty($_SERVER['HTTP_X_FORWARDED_FOR'])) {
            $ip = explode(',', $_SERVER['HTTP_X_FORWARDED_FOR'])[0];
        } else {
            $ip = $_SERVER['REMOTE_ADDR'] ?? '0.0.0.0';
        }
        
        return filter_var($ip, FILTER_VALIDATE_IP) ? $ip : '0.0.0.0';
    }
    
    /**
     * Clean expired sessions from database
     */
    public static function cleanExpiredSessions($conn) {
        try {
            $query = "DELETE FROM sessions WHERE expires_at < NOW()";
            $stmt = $conn->prepare($query);
            $stmt->execute();
            return $stmt->rowCount();
        } catch (Exception $e) {
            Logger::error('Failed to clean expired sessions: ' . $e->getMessage());
            return 0;
        }
    }
    
    /**
     * Generate secure random token
     */
    public static function generateSecureToken($length = 32) {
        return bin2hex(random_bytes($length));
    }
}
?>
